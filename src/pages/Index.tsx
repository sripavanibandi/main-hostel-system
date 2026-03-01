import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';

const Index: React.FC = () => {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="page-container">
        <Header />
        <div className="page-content flex items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <Header />
      <div className="page-content">
        <div className="max-w-3xl mx-auto text-center py-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            e-Nivasa
          </h1>
          <h2 className="text-xl text-muted-foreground mb-2">
            Digital Hostel Complaint and Resolution System
          </h2>
          <p className="text-muted-foreground mb-8">
            Report and track hostel maintenance issues online
          </p>

          {!user ? (
            <div className="space-y-4">
              <div className="form-container max-w-md mx-auto">
                <h3 className="form-header">Student Portal</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Register and login to raise complaints about hostel issues
                </p>
                <div className="flex gap-3 justify-center">
                  <Link to="/register">
                    <Button>Register</Button>
                  </Link>
                  <Link to="/login">
                    <Button variant="outline">Login</Button>
                  </Link>
                </div>
              </div>

              <div className="form-container max-w-md mx-auto">
                <h3 className="form-header">Admin Portal</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Warden / Administrator access to manage complaints
                </p>
                <Link to="/admin/login">
                  <Button variant="secondary">Admin Login</Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="form-container max-w-md mx-auto">
              <p className="text-muted-foreground mb-4">
                You are logged in as {role === 'admin' ? 'Admin' : 'Student'}
              </p>
              <Link to={role === 'admin' ? '/admin/dashboard' : '/student/dashboard'}>
                <Button>Go to Dashboard</Button>
              </Link>
            </div>
          )}

          {/* Features Section */}
          <div className="mt-16 grid md:grid-cols-3 gap-6 text-left">
            <div className="form-container">
              <h4 className="font-semibold mb-2">Raise Complaints</h4>
              <p className="text-sm text-muted-foreground">
                Submit maintenance issues like water, electricity, cleaning problems
              </p>
            </div>
            <div className="form-container">
              <h4 className="font-semibold mb-2">Track Status</h4>
              <p className="text-sm text-muted-foreground">
                Monitor complaint status: Pending, In Progress, or Resolved
              </p>
            </div>
            <div className="form-container">
              <h4 className="font-semibold mb-2">Quick Resolution</h4>
              <p className="text-sm text-muted-foreground">
                Efficient management by hostel administrators
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
