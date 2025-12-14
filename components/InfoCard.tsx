import React from 'react';

interface InfoCardProps {
  title: string;
  value: string | number;
  unit: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  color?: string;
}

export const InfoCard: React.FC<InfoCardProps> = ({ title, value, unit, icon, color = "blue" }) => {
  const colorClasses: Record<string, string> = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    green: "bg-green-50 text-green-700 border-green-200",
    orange: "bg-orange-50 text-orange-700 border-orange-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    red: "bg-red-50 text-red-700 border-red-200",
  };

  const selectedColor = colorClasses[color] || colorClasses.blue;

  return (
    <div className={`p-4 rounded-xl border shadow-sm ${selectedColor} flex flex-col justify-between h-32 transition-transform hover:scale-105 duration-200`}>
      <div className="flex justify-between items-start">
        <span className="text-sm font-semibold uppercase tracking-wider opacity-80">{title}</span>
        {icon && <div className="opacity-70">{icon}</div>}
      </div>
      <div className="mt-2">
        <span className="text-3xl font-bold tracking-tight">{value}</span>
        <span className="ml-1 text-sm font-medium opacity-70">{unit}</span>
      </div>
    </div>
  );
};
