import React from 'react';

import Button from './Button.js';

interface Props {
  step: number;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
  onCreate: () => void;
  canAdvance: boolean;
  canSubmit: boolean;
  isSubmitting: boolean;
  backLabel: string;
  nextLabel: string;
  createLabel: string;
  status?: string;
  error?: string;
}

const ProjectsWizardFooter: React.FC<Props> = ({
  step,
  totalSteps,
  onBack,
  onNext,
  onCreate,
  canAdvance,
  canSubmit,
  isSubmitting,
  backLabel,
  nextLabel,
  createLabel,
  status,
  error
}) => (
  <div className="space-y-2 pt-2 border-t border-white/5">
    {status && <p className="text-xs text-brand-accent-green">{status}</p>}
    {error && <p className="text-xs text-brand-accent-red">{error}</p>}
    <div className="flex justify-between items-center">
      {step > 0 ? (
        <Button variant="ghost" onClick={onBack}>
          {backLabel}
        </Button>
      ) : (
        <span />
      )}
      {step < totalSteps - 1 ? (
        <Button onClick={onNext} disabled={!canAdvance}>
          {nextLabel}
        </Button>
      ) : (
        <Button disabled={!canSubmit || isSubmitting} onClick={onCreate}>
          {createLabel}
        </Button>
      )}
    </div>
  </div>
);

export default ProjectsWizardFooter;
