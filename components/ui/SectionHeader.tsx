interface SectionHeaderProps {
  title: string;
  subtitle?: string;
}

/** Page-level heading with optional subtitle. Server-safe (no 'use client'). */
export default function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white mb-1">
        {title}
      </h1>
      {subtitle && (
        <p className="text-gray-600 dark:text-gray-400">{subtitle}</p>
      )}
    </div>
  );
}
