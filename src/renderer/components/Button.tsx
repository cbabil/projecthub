import React from 'react';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost';
}

const Button: React.FC<Props> = ({ variant = 'primary', className = '', children, ...rest }) => {
  const base = 'px-3 py-2 rounded-md text-sm transition no-drag disabled:opacity-60 disabled:cursor-not-allowed';
  const variants: Record<typeof variant, string> = {
    primary: 'bg-brand-accent-primary text-white hover:bg-brand-accent-boost',
    ghost: 'text-brand-text-dark hover:bg-brand-divider/30'
  } as const;

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </button>
  );
};

export default Button;
