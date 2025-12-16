import { Check } from 'lucide-react';
import React from 'react';

type StepperProgressProps = {
  steps: string[];
  currentIndex: number;
};

const StepperProgress: React.FC<StepperProgressProps> = ({ steps, currentIndex }) => {
  return (
    <div className="space-y-2">
      <div className="relative flex w-full items-center">
        {steps.map((label, index) => {
          const isActive = index === currentIndex;
          const isCompleted = index < currentIndex;
          const circleClass = isActive
            ? 'bg-brand-accent-primary text-white'
            : isCompleted
              ? 'bg-emerald-500 text-white'
              : 'bg-brand-divider text-brand-text-dark/70';

          return (
            <div key={label} className="flex-1 relative flex flex-col items-center">
              {index < steps.length - 1 && (
                <div className={`absolute left-[62%] right-[-38%] top-5 h-px ${isCompleted ? 'bg-emerald-500/50' : 'bg-white/25'}`} />
              )}
              <div className={`relative z-10 h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold leading-none shadow-inner shadow-black/20 ${circleClass}`}>
                {isCompleted ? <Check size={18} strokeWidth={3} /> : index + 1}
              </div>
              <span className={`mt-2 text-xs uppercase tracking-wide leading-[1.2] block text-center ${isActive ? 'text-white' : isCompleted ? 'text-emerald-400' : 'text-brand-text-dark/70'}`}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StepperProgress;
