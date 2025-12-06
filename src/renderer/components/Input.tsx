import React from 'react';

interface Props {
  value: string;
  onChange?: (val: string) => void;
  placeholder?: string;
  className?: string;
  readOnly?: boolean;
}

const Input: React.FC<Props> = ({ value, onChange, placeholder, className, readOnly }) => (
  <input
    className={`input ${className ?? ''}`}
    value={value}
    placeholder={placeholder}
    readOnly={readOnly}
    onChange={(e) => onChange?.(e.target.value)}
  />
);

export default Input;
