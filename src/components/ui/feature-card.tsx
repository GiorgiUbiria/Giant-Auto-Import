import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FeatureProps {
  title: string;
  description: string;
  icon: LucideIcon;
  className?: string;
}

export function FeatureCard({ title, description, icon: Icon, className }: FeatureProps) {
  return (
    <div 
      className={cn(
        "flex gap-4 items-start p-6 rounded-xl",
        "transition-all duration-300",
        "hover:bg-gray-50 dark:hover:bg-gray-800/50",
        "group",
        className
      )}
    >
      <span className="text-violet-600 bg-violet-500/10 p-3 rounded-xl group-hover:bg-violet-500/20 transition-colors">
        <Icon className="w-5 h-5" />
      </span>
      <div>
        <h3 className="font-semibold text-xl mb-2">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
} 