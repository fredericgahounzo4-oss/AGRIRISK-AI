import { Leaf, PawPrint } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { DiagnosticType } from '../types';

interface DiagnosticTypeSelectorProps {
  value: DiagnosticType;
  onChange: (type: DiagnosticType) => void;
}

const types = [
  {
    value: 'culture' as DiagnosticType,
    icon: Leaf,
    label: 'Culture',
    desc: 'Diagnostiquer une maladie ou un problème sur vos plantes',
  },
  {
    value: 'animal' as DiagnosticType,
    icon: PawPrint,
    label: 'Animal',
    desc: 'Diagnostiquer une maladie ou un problème chez vos animaux',
  },
];

export function DiagnosticTypeSelector({ value, onChange }: DiagnosticTypeSelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
      {types.map(({ value: type, icon: Icon, label, desc }) => (
        <button
          key={type}
          type="button"
          onClick={() => onChange(type)}
          className={cn(
            'flex items-start gap-3 sm:gap-4 rounded-2xl border-2 p-4 sm:p-5 text-left transition-all',
            value === type
              ? 'border-[#1a5c2a] bg-[#e8f5e9]'
              : 'border-[#e2e8e4] bg-white hover:border-[#4caf50] hover:bg-[#f0f9f0]'
          )}
        >
          <div className={cn(
            'flex h-10 w-10 items-center justify-center rounded-xl shrink-0',
            value === type ? 'bg-[#1a5c2a] text-white' : 'bg-[#f0f4f0] text-[#6b7c6e]'
          )}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <p className={cn('font-semibold text-sm', value === type ? 'text-[#1a5c2a]' : 'text-[#1a2e1d]')}>
              {label}
              {value === type && (
                <span className="ml-2 inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#1a5c2a]">
                  <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 12 12">
                    <path d="M10 3L5 8.5 2 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                  </svg>
                </span>
              )}
            </p>
            <p className="text-xs text-[#6b7c6e] mt-1 leading-relaxed">{desc}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
