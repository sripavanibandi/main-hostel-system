import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import StatusBadge from '@/components/StatusBadge';
import CategoryBadge from '@/components/CategoryBadge';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/api/client';

interface ComplaintWithProfile {
  id: string;
  title: string;
  description: string;
  category: 'Water' | 'Electricity' | 'Cleaning' | 'Maintenance';
  status: 'Pending' | 'In Progress' | 'Resolved';
  created_at: string;
  created_by: string;
  profiles: {
    roll_number: string;
    full_name: string;
  } | null;
}

const statusOptions = ['Pending', 'In Progress', 'Resolved'] as const;

const AdminDashboard: React.FC = () => {
  const [complaints, setComplaints] = useState<ComplaintWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate('/admin/login');
      return;
    }
    if (role !== 'admin') {
      navigate('/');
      return;
    }
    fetchComplaints();
  }, [user, role, navigate]);

  const fetchComplaints = async () => {
    try {
      const data = await apiClient.get<ComplaintWithProfile[]>('/api/complaints');
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

  // ✅ STATUS UPDATE IMPLEMENTED
  const handleStatusChange = async (
    id: string,
    newStatus: typeof statusOptions[number]
  ) => {
    setUpdating(id);

    try {
      await apiClient.put(`/api/complaints/${id}`, {
        status: newStatus,
      });

      // Update UI instantly
      setComplaints(prev =>
        prev.map(c =>
          c.id === id ? { ...c, status: newStatus } : c
        )
      );

      toast({
        title: 'Success',
        description: 'Complaint status updated successfully',
      });

    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update status',
        variant: 'destructive',
      });
    } finally {
      setUpdating(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusCounts = () => {
    const counts = { Pending: 0, 'In Progress': 0, Resolved: 0 };
    complaints.forEach(c => {
      counts[c.status]++;
    });
    return counts;
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="page-container">
      <Header />
      <div className="page-content">
        <div className="mb-6">
          <h1 className="page-title mb-1">Admin Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            Manage all hostel complaints
          </p>
        </div>

        {/* Status Summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="form-container text-center">
            <p className="text-2xl font-bold text-status-pending">{statusCounts.Pending}</p>
            <p className="text-sm text-muted-foreground">Pending</p>
          </div>
          <div className="form-container text-center">
            <p className="text-2xl font-bold text-status-progress">{statusCounts['In Progress']}</p>
            <p className="text-sm text-muted-foreground">In Progress</p>
          </div>
          <div className="form-container text-center">
            <p className="text-2xl font-bold text-status-resolved">{statusCounts.Resolved}</p>
            <p className="text-sm text-muted-foreground">Resolved</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading complaints...</p>
          </div>
        ) : complaints.length === 0 ? (
          <div className="form-container text-center py-12">
            <p className="text-muted-foreground">No complaints found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Student</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Update Status</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((complaint) => (
                  <tr key={complaint.id}>
                    <td className="whitespace-nowrap text-xs">
                      {formatDate(complaint.created_at)}
                    </td>
                    <td>
                      <div className="font-medium text-sm">
                        {complaint.profiles?.roll_number || 'Unknown'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {complaint.profiles?.full_name || ''}
                      </div>
                    </td>
                    <td>
                      <div className="font-medium">{complaint.title}</div>
                      <div className="text-xs text-muted-foreground mt-1 max-w-xs">
                        {complaint.description.length > 100
                          ? complaint.description.substring(0, 100) + '...'
                          : complaint.description}
                      </div>
                    </td>
                    <td>
                      <CategoryBadge category={complaint.category} />
                    </td>
                    <td>
                      <StatusBadge status={complaint.status} />
                    </td>
                    <td>
                      <select
                        value={complaint.status}
                        onChange={(e) =>
                          handleStatusChange(
                            complaint.id,
                            e.target.value as typeof statusOptions[number]
                          )
                        }
                        className="form-select text-sm py-1"
                        disabled={updating === complaint.id}
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
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

export default AdminDashboard;