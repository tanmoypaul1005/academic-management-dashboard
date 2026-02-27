import { ReactNode } from 'react';
import AnimatedCard from '@/components/AnimatedCard';

interface SectionCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** Use AnimatedCard wrapper (adds GSAP hover + entrance). Default: true */
  animated?: boolean;
  padding?: 'sm' | 'md' | 'lg';
}

const paddingMap = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-6 sm:p-8',
};

export default function SectionCard({
  children,
  className = '',
  delay = 0,
  animated = true,
  padding = 'md',
}: SectionCardProps) {
  const base =
    `bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-md ${paddingMap[padding]} ${className}`;

  if (animated) {
    return (
      <AnimatedCard delay={delay} className={base}>
        {children}
      </AnimatedCard>
    );
  }

  return <div className={base}>{children}</div>;
}
