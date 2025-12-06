import React from 'react';

interface Props {
  open: boolean;
  title: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode | null;
}

const Modal: React.FC<Props> = ({ open, title, onClose, children, footer }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-[#131328] border border-[#6a5afd]/70 rounded-2xl w-[900px] max-w-[95vw] h-[540px] max-h-[85vh] flex flex-col shadow-[0_24px_70px_rgba(0,0,0,0.65)]">
        <header className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2 min-w-0">
            <h2 className="text-lg font-semibold truncate">{title}</h2>
          </div>
          <button className="text-lg leading-none" onClick={onClose} aria-label="Close">
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
