const express = require('express');
const Complaint = require('../models/Complaint');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// =========================
// CREATE COMPLAINT
// =========================
router.post('/', async (req, res) => {
  try {
    const { title, category, description } = req.body;

    if (!title || !category || !description) {
      return res.status(400).json({ message: 'Title, category, and description are required' });
    }

    if (title.trim().length < 5) {
      return res.status(400).json({ message: 'Title must be at least 5 characters' });
    }

    if (description.trim().length < 10) {
      return res.status(400).json({ message: 'Description must be at least 10 characters' });
    }

    const validCategories = ['Water', 'Electricity', 'Cleaning', 'Maintenance'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    const complaint = new Complaint({
      title: title.trim(),
      category,
      description: description.trim(),
      student: req.user.id,
      status: 'Pending'
    });

    await complaint.save();
    await complaint.populate('student', 'name email rollNumber fullName');

    res.status(201).json({
      id: complaint._id.toString(),
      title: complaint.title,
      description: complaint.description,
      category: complaint.category,
      status: complaint.status,
      created_at: complaint.createdAt.toISOString(),
      image_url: complaint.image_url || null,
      created_by: complaint.student._id.toString()
    });

  } catch (error) {
    console.error('Create complaint error:', error);
    res.status(500).json({ message: 'Server error creating complaint' });
  }
});

// =========================
// GET ALL COMPLAINTS (ADMIN)
// =========================
router.get('/', async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate('student', 'name email rollNumber fullName')
      .sort({ createdAt: -1 });

    const formattedComplaints = complaints.map(complaint => ({
      id: complaint._id.toString(),
      title: complaint.title,
      description: complaint.description,
      category: complaint.category,
      status: complaint.status,
      created_at: complaint.createdAt.toISOString(),
      image_url: complaint.image_url || null,
      created_by: complaint.student._id.toString(),
      profiles: {
        roll_number: complaint.student.rollNumber || '',
        full_name: complaint.student.fullName || complaint.student.name || ''
      }
    }));

    res.json(formattedComplaints);

  } catch (error) {
    console.error('Get complaints error:', error);
    res.status(500).json({ message: 'Server error fetching complaints' });
  }
});

// =========================
// GET MY COMPLAINTS (STUDENT)
// =========================
router.get('/my', async (req, res) => {
  try {
    const complaints = await Complaint.find({ student: req.user.id })
      .sort({ createdAt: -1 });

    const formattedComplaints = complaints.map(complaint => ({
      id: complaint._id.toString(),
      title: complaint.title,
      description: complaint.description,
      category: complaint.category,
      status: complaint.status,
      created_at: complaint.createdAt.toISOString(),
      image_url: complaint.image_url || null
    }));

    res.json(formattedComplaints);

  } catch (error) {
    console.error('Get my complaints error:', error);
    res.status(500).json({ message: 'Server error fetching your complaints' });
  }
});

// =========================
// UPDATE STATUS (ADMIN ONLY)
// =========================
router.put('/:id', async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { status } = req.body;
    const validStatuses = ['Pending', 'In Progress', 'Resolved'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const updated = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    res.json({
      message: 'Status updated successfully',
      id: updated._id.toString(),
      status: updated.status
    });

  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ message: 'Server error updating status' });
  }
});

// =========================
// DELETE COMPLAINT
// =========================
router.delete('/:id', async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    if (
      req.user.role !== 'admin' &&
      complaint.student.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await complaint.deleteOne();

    res.json({ message: 'Complaint deleted successfully' });

  } catch (error) {
    console.error('Delete complaint error:', error);
    res.status(500).json({ message: 'Server error deleting complaint' });
  }
});

module.exports = router;