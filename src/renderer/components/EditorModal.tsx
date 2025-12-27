import React, { useMemo, useState } from 'react';
import { Button, Modal } from 'ui-toolkit';

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  value: string;
  editable?: boolean;
  onSave?: (value: string) => void;
  languageLabel?: string;
}

const EditorModal: React.FC<Props> = ({ open, onClose, title, value, editable, onSave, languageLabel }) => {
  const initialValue = useMemo(() => value ?? '', [value]);
  const [current, setCurrent] = useState(initialValue);

  const footer =
    editable && onSave
      ? (
          <Button
            onClick={() => {
              onSave(current);
              onClose();
            }}
          >
            Save
          </Button>
        )
      : null;

  const titleContent = (
    <span className="flex items-center gap-2">
      <span className="truncate">{title}</span>
      {languageLabel && (
        <span className="px-1 py-[0.5px] leading-none rounded-[3px] text-[9px] uppercase tracking-wide bg-[#dc2626] text-white/90">
          {languageLabel}
        </span>
      )}
    </span>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={titleContent}
      footer={footer}
      size="lg"
    >
      <textarea
        className={`w-full flex-1 text-brand-text-dark text-xs font-mono rounded-md p-3 resize-none outline-none shadow-none focus:ring-2 focus:ring-brand-accent-primary/60 border-0 ${
          editable ? 'bg-[#0d0d1a]' : 'bg-transparent'
        }`}
        readOnly={!editable}
        value={current}
        onChange={(e) => setCurrent(e.target.value)}
      />
    </Modal>
  );
};

export default EditorModal;
