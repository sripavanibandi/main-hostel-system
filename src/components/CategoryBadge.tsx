import React from 'react';

interface CategoryBadgeProps {
  category: 'Water' | 'Electricity' | 'Cleaning' | 'Maintenance';
}

const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category }) => {
  const getCategoryStyle = () => {
    switch (category) {
      case 'Water':
        return 'bg-category-water/10 text-category-water border-category-water';
      case 'Electricity':
        return 'bg-category-electricity/10 text-category-electricity border-category-electricity';
      case 'Cleaning':
        return 'bg-category-cleaning/10 text-category-cleaning border-category-cleaning';
      case 'Maintenance':
        return 'bg-category-maintenance/10 text-category-maintenance border-category-maintenance';
      default:
        return '';
    }
  };

  return (
    <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded border ${getCategoryStyle()}`}>
      {category}
    </span>
  );
};

export default CategoryBadge;
