import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
  fullPage?: boolean;
}

const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' };

export function Loader({ size = 'md', text, className, fullPage }: LoaderProps) {
  const icon = <Loader2 className={cn(sizes[size], 'animate-spin text-[#1a5c2a]')} />;

  if (fullPage) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-3 bg-white/80 backdrop-blur-sm z-50">
        {icon}
        {text && <p className="text-sm text-[#6b7c6e]">{text}</p>}
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col items-center justify-center gap-2 py-8', className)}>
      {icon}
      {text && <p className="text-sm text-[#6b7c6e]">{text}</p>}
    </div>
  );
}
