import React from 'react';

import Button from '../Button.js';
import Input from '../Input.js';

export type BasicsStepLabels = {
  name: string;
  version: string;
  destination: string;
  error: string;
  choose: string;
};

type Props = {
  name: string;
  version: string;
  destination: string;
  onNameChange: (value: string) => void;
  onVersionChange: (value: string) => void;
  onPickLocation: () => void;
  labels: BasicsStepLabels;
  showError: boolean;
};

const BasicsStep: React.FC<Props> = ({ name, version, destination, onNameChange, onVersionChange, onPickLocation, labels, showError }) => (
  <div className="space-y-5">
    <div className="grid gap-3 sm:grid-cols-[160px_minmax(0,1fr)] items-start sm:items-center">
      <div className="text-sm text-brand-text-dark/80 sm:text-right">{labels.name}</div>
      <Input value={name} onChange={onNameChange} className="w-full" placeholder={labels.name} />
    </div>
    <div className="grid gap-3 sm:grid-cols-[160px_minmax(0,1fr)] items-start sm:items-center">
      <div className="text-sm text-brand-text-dark/80 sm:text-right">{labels.version}</div>
      <Input value={version} onChange={onVersionChange} className="w-full" placeholder="1.0.0" />
    </div>
    <div className="grid gap-3 sm:grid-cols-[160px_minmax(0,1fr)] items-start sm:items-center">
      <div className="text-sm text-brand-text-dark/80 sm:text-right">{labels.destination}</div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input value={destination} className="sm:flex-1" placeholder={labels.destination} readOnly />
        <Button type="button" variant="ghost" onClick={onPickLocation}>
          {labels.choose}
        </Button>
      </div>
    </div>
    {showError && <p className="text-xs text-brand-accent-red sm:pl-[160px]">{labels.error}</p>}
  </div>
);

export default BasicsStep;
