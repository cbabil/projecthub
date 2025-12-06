import { Copy, Minus, Square, X as CloseIcon } from 'lucide-react';
import React from 'react';

type WindowButtonsProps = {
  isMaximized: boolean;
  onMinimize: () => void;
  onToggleMaximize: () => void;
  onClose: () => void;
};

const WindowButtons: React.FC<WindowButtonsProps> = ({ isMaximized, onMinimize, onToggleMaximize, onClose }) => (
  <div className="custom-title-bar__window-buttons">
    <button
      type="button"
      className="custom-title-bar__window-button"
      aria-label="Minimize window"
      onClick={onMinimize}
    >
      <Minus className="h-4 w-4" aria-hidden />
    </button>
    <button
      type="button"
      className="custom-title-bar__window-button"
      aria-label={isMaximized ? 'Restore window' : 'Maximize window'}
      onClick={onToggleMaximize}
    >
      {isMaximized ? <Copy className="h-4 w-4" aria-hidden /> : <Square className="h-4 w-4" aria-hidden />}
    </button>
    <button
      type="button"
      className="custom-title-bar__window-button custom-title-bar__window-button--close"
      aria-label="Close window"
      onClick={onClose}
    >
      <CloseIcon className="h-4 w-4" aria-hidden />
    </button>
  </div>
);

export default WindowButtons;
