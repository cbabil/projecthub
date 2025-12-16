import React, { createContext, useContext, useEffect, useState } from 'react';

import { useData } from './DataContext.js';

interface CategoryContextValue {
  templateFolders: string[];
}

const CategoryContext = createContext<CategoryContextValue>({ templateFolders: [] });

export const CategoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [templateFolders, setTemplateFolders] = useState<string[]>([]);
  const { templates } = useData();

  useEffect(() => {
    const categories = Array.from(new Set(templates.map((t) => t.category ?? 'misc'))).filter(Boolean);
    setTemplateFolders(categories);
  }, [templates]);

  return <CategoryContext.Provider value={{ templateFolders }}>{children}</CategoryContext.Provider>;
};

export const useCategories = () => useContext(CategoryContext);
