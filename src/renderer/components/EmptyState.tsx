import { LucideIcon } from 'lucide-react';
import React from 'react';

interface Props {
  icon: LucideIcon;
  title: string;
  message: string;
}

const EmptyState: React.FC<Props> = ({ icon: Icon, title, message }) => (
  <div className="flex flex-col items-center justify-center text-center gap-2 text-brand-text-dark/80">
    <div className="w-14 h-14 rounded-full bg-brand-divider/20 flex items-center justify-center text-brand-text-dark/60">
      <Icon size={26} />
    </div>
    <p className="text-lg font-semibold">{title}</p>
    <p className="text-sm text-brand-text-dark/70">{message}</p>
  </div>
);

export default EmptyState;
