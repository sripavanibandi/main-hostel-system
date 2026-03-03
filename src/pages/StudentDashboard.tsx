import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import StatusBadge from '@/components/StatusBadge';
import CategoryBadge from '@/components/CategoryBadge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/api/client';

interface Complaint {
  id: string;
  title: string;
  description: string;
  category: 'Water' | 'Electricity' | 'Cleaning' | 'Maintenance';
  status: 'Pending' | 'In Progress' | 'Resolved';
  created_at: string;
  image_url: string | null;
}

const StudentDashboard: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchComplaints();
  }, [user, navigate]);

  const fetchComplaints = async () => {
    try {
      const data = await apiClient.get<Complaint[]>('/api/complaints/my');
      setComplaints(data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load complaints',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, status: string) => {
    if (status === 'Resolved') {
      toast({
        title: 'Cannot Delete',
        description: 'Resolved complaints cannot be deleted',
        variant: 'destructive',
      });
      return;
    }

    if (!confirm('Are you sure you want to delete this complaint?')) return;

    try {
      await apiClient.delete(`/api/complaints/${id}`);

      // remove from UI instantly
      setComplaints(prev => prev.filter(c => c.id !== id));

      toast({
        title: 'Success',
        description: 'Complaint deleted successfully',
      });

    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete complaint',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="page-container">
      <Header />
      <div className="page-content">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="page-title mb-1">My Complaints</h1>
            <p className="text-muted-foreground text-sm">
              Welcome, {profile?.full_name || 'Student'} ({profile?.roll_number})
            </p>
          </div>
          <Button onClick={() => navigate('/student/new-complaint')}>
            + Raise New Complaint
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading complaints...</p>
          </div>
        ) : complaints.length === 0 ? (
          <div className="form-container text-center py-12">
            <p className="text-muted-foreground mb-4">No complaints raised yet</p>
            <Button onClick={() => navigate('/student/new-complaint')}>
              Raise Your First Complaint
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((complaint) => (
                  <tr key={complaint.id}>
                    <td className="whitespace-nowrap">{formatDate(complaint.created_at)}</td>
                    <td>
                      <div className="font-medium">{complaint.title}</div>
                      <div className="text-xs text-muted-foreground mt-1 max-w-xs truncate">
                        {complaint.description}
                      </div>
                    </td>
                    <td>
                      <CategoryBadge category={complaint.category} />
                    </td>
                    <td>
                      <StatusBadge status={complaint.status} />
                    </td>
                    <td>
                      {complaint.status !== 'Resolved' && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(complaint.id, complaint.status)}
                        >
                          Delete
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;