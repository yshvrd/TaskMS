import React from 'react';

const statusColors = {
  pending: 'bg-gray-100 text-gray-800 border-gray-200',
  in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
  completed: 'bg-green-100 text-green-800 border-green-200',
  blocked: 'bg-red-100 text-red-800 border-red-200',
};

const priorityColors = {
  low: 'bg-slate-100 text-slate-700',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800 font-bold',
};

export const StatusBadge = ({ status }) => {
  const colorClass = statusColors[status?.toLowerCase()] || statusColors.pending;
  const label = status?.replace('_', ' ').toUpperCase() || 'UNKNOWN';
  
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClass}`}>
      {label}
    </span>
  );
};

export const PriorityBadge = ({ priority }) => {
  const colorClass = priorityColors[priority?.toLowerCase()] || priorityColors.low;
  return (
    <span className={`px-2.5 py-0.5 rounded text-xs font-semibold ${colorClass}`}>
      {priority?.toUpperCase()}
    </span>
  );
};
