import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const Header: React.FC = () => {
  const { user, role, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="nav-header">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="nav-title">
            e-Nivasa
          </Link>
          {user && (
            <nav className="flex items-center gap-4">
              {role === 'admin' ? (
                <Link to="/admin/dashboard" className="nav-link text-sm">
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/student/dashboard" className="nav-link text-sm">
                    My Complaints
                  </Link>
                  <Link to="/student/new-complaint" className="nav-link text-sm">
                    Raise Complaint
                  </Link>
                </>
              )}
            </nav>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-primary-foreground/80 text-sm">
                {role === 'admin' ? 'Admin' : profile?.roll_number || 'Student'}
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSignOut}
                className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
              >
                Logout
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                >
                  Student Login
                </Button>
              </Link>
              <Link to="/admin/login">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                >
                  Admin Login
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
