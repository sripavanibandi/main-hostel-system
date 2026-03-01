import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/api/client';

const categories = ['Water', 'Electricity', 'Cleaning', 'Maintenance'] as const;

const NewComplaint: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<typeof categories[number]>('Water');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      navigate('/login');
      return;
    }

    if (title.trim().length < 5) {
      toast({
        title: 'Error',
        description: 'Title must be at least 5 characters',
        variant: 'destructive',
      });
      return;
    }

    if (description.trim().length < 10) {
      toast({
        title: 'Error',
        description: 'Description must be at least 10 characters',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      await apiClient.post('/api/complaints', {
        title: title.trim(),
        description: description.trim(),
        category,
      });
      
      toast({
        title: 'Complaint Submitted',
        description: 'Your complaint has been registered successfully',
      });
      
      navigate('/student/dashboard');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit complaint',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <Header />
      <div className="page-content">
        <div className="max-w-2xl mx-auto">
          <h1 className="page-title">Raise New Complaint</h1>

          <div className="form-container">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="title" className="form-label">
                  Complaint Title *
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="form-input"
                  placeholder="e.g., Water leakage in Room 204"
                  required
                  maxLength={100}
                />
              </div>

              <div>
                <label htmlFor="category" className="form-label">
                  Category *
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as typeof categories[number])}
                  className="form-select"
                  required
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="description" className="form-label">
                  Description *
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="form-textarea"
                  rows={5}
                  placeholder="Describe the issue in detail..."
                  required
                  maxLength={1000}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {description.length}/1000 characters
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Complaint'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/student/dashboard')}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewComplaint;
