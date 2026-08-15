import React from 'react';

const StatsCard = ({ label, value, icon, color = 'blue' }) => {
  return (
    <div className="stats-card">
      <div className="flex items-center gap-4">
        <div className="stats-icon">
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;