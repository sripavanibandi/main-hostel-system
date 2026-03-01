import React from 'react';

interface StatusBadgeProps {
  status: 'Pending' | 'In Progress' | 'Resolved';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusClass = () => {
    switch (status) {
      case 'Pending':
        return 'status-pending';
      case 'In Progress':
        return 'status-progress';
      case 'Resolved':
        return 'status-resolved';
      default:
        return '';
    }
  };

  return (
    <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${getStatusClass()}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
