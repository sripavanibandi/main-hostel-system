const express = require('express');
const Complaint = require('../models/Complaint');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// POST /api/complaints - Create a new complaint
router.post('/', async (req, res) => {
  try {
    const { title, category, description } = req.body;

    // Validation
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

    // Create complaint with logged-in user as student
    const complaint = new Complaint({
      title: title.trim(),
      category,
      description: description.trim(),
      student: req.user.id, // From authMiddleware
      status: 'Pending'
    });

    await complaint.save();

    // Populate student info for response
    await complaint.populate('student', 'name email rollNumber fullName');

    // Return complaint in format expected by frontend
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
    res.status(500).json({ message: 'Server error creating complaint', error: error.message });
  }
});

// GET /api/complaints - Get all complaints (for admin)
router.get('/', async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate('student', 'name email rollNumber fullName')
      .sort({ createdAt: -1 });

    // Format response for frontend
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
    res.status(500).json({ message: 'Server error fetching complaints', error: error.message });
  }
});

// GET /api/complaints/my - Get complaints of logged-in user
router.get('/my', async (req, res) => {
  try {
    const complaints = await Complaint.find({ student: req.user.id })
      .sort({ createdAt: -1 });

    // Format response for frontend
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
    res.status(500).json({ message: 'Server error fetching your complaints', error: error.message });
  }
});

module.exports = router;
