'use client';

import AnimatedCard from './AnimatedCard';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: string;
  color?: string;
  delay?: number;
}

export default function StatCard({ title, value, icon, color = 'blue', delay = 0 }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    pink: 'bg-pink-500',
  }[color] || 'bg-blue-500';

  return (
    <AnimatedCard delay={delay} className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-slate-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
        <div className={`${colorClasses} text-white text-3xl p-4 rounded-full`}>
          {icon}
        </div>
      </div>
    </AnimatedCard>
  );
}
