import { Switch } from './Switch';

interface PreferenceRowProps {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

/** Ligne « titre + description + interrupteur » utilisée dans les pages Paramètres. */
export function PreferenceRow({ title, description, checked, onChange, disabled }: PreferenceRowProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="font-medium text-gray-900">{title}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <Switch checked={checked} onChange={onChange} disabled={disabled} label={title} />
    </div>
  );
}
