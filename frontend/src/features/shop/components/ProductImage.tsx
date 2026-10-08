import { Package } from 'lucide-react';
import { cn } from '@/utils/cn';

export function ProductImage({ src, alt, className }: { src: string | null; alt: string; className?: string }) {
  return (
    <div className={cn('bg-[#e8f5e9] flex items-center justify-center overflow-hidden', className)}>
      {src ? (
        <img src={src} alt={alt} className="h-full w-full object-cover" loading="lazy" />
      ) : (
        <Package className="w-8 h-8 text-[#1a5c2a]/40" />
      )}
    </div>
  );
}
