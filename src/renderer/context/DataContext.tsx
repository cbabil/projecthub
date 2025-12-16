import { LibraryMeta, ProjectMeta, TemplateMeta } from '@shared/types';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

interface DataContextValue {
  templates: TemplateMeta[];
  filteredTemplates: TemplateMeta[];
  libraries: LibraryMeta[];
  projects: ProjectMeta[];
  refreshAll: (source?: string) => Promise<void>;
  loading: boolean;
  error?: string;
  setTemplateFilter: (folder?: string) => void;
}

const DataContext = createContext<DataContextValue>({
  templates: [],
  filteredTemplates: [],
  libraries: [],
  projects: [],
  refreshAll: async () => undefined,
  loading: true,
  setTemplateFilter: () => undefined
});

const mapSorted = <T extends { name: string }>(items: T[]) =>
  [...items].sort((a, b) => a.name.localeCompare(b.name));

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [templates, setTemplates] = useState<TemplateMeta[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<TemplateMeta[]>([]);
  const [libraries, setLibraries] = useState<LibraryMeta[]>([]);
  const [projects, setProjects] = useState<ProjectMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [templateFilter, setTemplateFilter] = useState<string>();

  const refreshAll = useCallback(async (source = 'renderer:refreshAll') => {
    setLoading(true);
    try {
      const [t, l, p] = await Promise.all([
        window.projecthub.listTemplates(source),
        window.projecthub.listLibraries(),
        window.projecthub.listProjects()
      ]);

      const anyError = !t.ok || !l.ok || !p.ok;
      setError(anyError ? t.error || l.error || p.error || 'Load error' : undefined);

      if (t.ok && t.data) {
        const enriched = t.data.map((template) => ({ ...template, sourcePath: template.sourcePath ?? '' }));
        const sortedTemplates = mapSorted(enriched);
        setTemplates(sortedTemplates);
        setFilteredTemplates(sortedTemplates);
      }

      if (l.ok) setLibraries(mapSorted(l.data || []));
      if (p.ok) setProjects(mapSorted(p.data || []));
    } catch (error) {
      setError((error as Error).message ?? 'Load error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // No automatic fetch here; data is loaded on user actions (e.g., Templates page open)
  }, [refreshAll]);

  useEffect(() => {
    if (!templateFilter) {
      setFilteredTemplates(templates);
    } else {
      const filtered = templates.filter((template) => template.category === templateFilter);
      window.projecthub?.logCacheFilter?.(templateFilter, filtered.length);
      setFilteredTemplates(filtered);
    }
  }, [templateFilter, templates]);

  const value = useMemo(
    () => ({
      templates,
      filteredTemplates,
      libraries,
      projects,
      refreshAll,
      loading,
      error,
      setTemplateFilter
    }),
    [templates, filteredTemplates, libraries, projects, refreshAll, loading, error]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => useContext(DataContext);
