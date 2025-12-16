import React, { useCallback, useEffect, useRef } from 'react';

interface Props {
  open: boolean;
  title: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode | null;
}

const Modal: React.FC<Props> = ({ open, title, onClose, children, footer }) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Focus trap - get all focusable elements
  const getFocusableElements = useCallback(() => {
    if (!dialogRef.current) return [];
    return Array.from(
      dialogRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    ).filter((el) => !el.hasAttribute('disabled'));
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab') {
        const focusable = getFocusableElements();
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [onClose, getFocusableElements]
  );

  // Focus management on open/close
  useEffect(() => {
    if (open) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      // Focus first focusable element or the dialog itself
      requestAnimationFrame(() => {
        const focusable = getFocusableElements();
        if (focusable.length > 0) {
          focusable[0].focus();
        } else {
          dialogRef.current?.focus();
        }
      });
    } else if (previousActiveElement.current) {
      previousActiveElement.current.focus();
    }
  }, [open, getFocusableElements]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onKeyDown={handleKeyDown}
        tabIndex={-1}
        className="bg-[#131328] border border-[#6a5afd]/70 rounded-2xl w-[900px] max-w-[95vw] h-[540px] max-h-[85vh] flex flex-col shadow-[0_24px_70px_rgba(0,0,0,0.65)] outline-none"
      >
        <header className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2 min-w-0">
            <h2 id="modal-title" className="text-lg font-semibold truncate">{title}</h2>
          </div>
          <button className="text-lg leading-none hover:text-white/80 transition-colors" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>
        <section className="p-4 flex-1 overflow-hidden flex flex-col">{children}</section>
        {footer ? <footer className="px-4 py-3 flex justify-end">{footer}</footer> : null}
      </div>
    </div>
  );
};

export default Modal;
