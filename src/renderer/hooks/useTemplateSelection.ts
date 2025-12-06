import { useState } from 'react';

export const TEMPLATES_PER_PAGE = 6;

export const useTemplateSelection = () => {
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (value: string) => {
    setSelected((prev) => (prev.includes(value) ? prev.filter((tpl) => tpl !== value) : [...prev, value]));
  };

  const replace = (next: string[]) => setSelected(next);

  return {
    selected,
    toggle,
    replace
  };
};
