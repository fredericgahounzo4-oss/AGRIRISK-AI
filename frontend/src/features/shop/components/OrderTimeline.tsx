import { Check } from 'lucide-react';
import { cn } from '@/utils/cn';
import { orderSteps } from '../orderUi';
import type { Order } from '../types';

export function OrderTimeline({ order }: { order: Pick<Order, 'status'> }) {
  if (order.status === 'cancelled') {
    return (
      <div className="rounded-xl bg-red-50 text-red-700 text-sm font-medium px-4 py-3">
        Cette commande a été annulée.
      </div>
    );
  }
  const currentIndex = orderSteps.findIndex((s) => s.key === order.status);

  return (
    <ol className="flex items-start w-full">
      {orderSteps.map((step, idx) => {
        const done = idx < currentIndex || order.status === 'delivered';
        const current = idx === currentIndex && order.status !== 'delivered';
        return (
          <li key={step.key} className="flex-1 flex flex-col items-center text-center relative">
            {idx > 0 && (
              <span
                className={cn(
                  'absolute top-3.5 right-1/2 w-full h-0.5 -z-0',
                  idx <= currentIndex ? 'bg-[#22c55e]' : 'bg-gray-200'
                )}
              />
            )}
            <span
              className={cn(
                'relative z-10 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold',
                done && 'bg-[#22c55e] text-white',
                current && 'bg-[#1a5c2a] text-white ring-4 ring-[#22c55e]/25',
                !done && !current && 'bg-gray-200 text-gray-500'
              )}
            >
              {done ? <Check className="w-4 h-4" /> : idx + 1}
            </span>
            <span className={cn('mt-2 text-[11px] sm:text-xs leading-tight px-1',
              done || current ? 'text-[#1a2e1d] font-medium' : 'text-gray-400')}>
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
