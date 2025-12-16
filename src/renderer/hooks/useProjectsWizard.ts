import { useEffect, useMemo, useState } from 'react';

import { useData } from '../context/DataContext.js';
import { useSettings } from '../context/SettingsContext.js';
import { buildDestinationPath } from '../utils/destination.js';
import { useTemplateSelection } from './useTemplateSelection.js';

type CreateResult = { ok: boolean; error?: string };

export const useProjectsWizard = () => {
  const { templates, libraries, refreshAll } = useData();
  const { settings, update } = useSettings();

  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [version, setVersion] = useState('');
  const [destinationBase, setDestinationBase] = useState(settings?.projectsPath ?? '');
  const [destinationLocked, setDestinationLocked] = useState(false);
  const { selected: selectedTemplates, replace: replaceSelectedTemplates } = useTemplateSelection();
  const [selectedLibs, setSelectedLibs] = useState<string[]>([]);
  const [libQuery, setLibQuery] = useState('');
  const [basicsTouched, setBasicsTouched] = useState(false);
  const [templateTouched, setTemplateTouched] = useState(false);

  const basicsValid = name.trim().length > 0 && version.trim().length > 0 && destinationBase.trim().length > 0;
  const templateValid = selectedTemplates.length > 0;
  const canSubmit = basicsValid && templateValid;

  useEffect(() => {
    refreshAll('renderer:wizardInit');
  }, [refreshAll]);

  useEffect(() => {
    if (settings?.projectsPath && !destinationLocked) {
      setDestinationBase(settings.projectsPath);
    }
  }, [settings?.projectsPath, destinationLocked]);

  const destination = useMemo(() => buildDestinationPath(destinationBase, name), [destinationBase, name]);

  const filteredLibraries = useMemo(() => {
    const lower = libQuery.toLowerCase();
    return libraries.filter((lib) => lib.name.toLowerCase().includes(lower));
  }, [libraries, libQuery]);

  const handleNameChange = (value: string) => {
    if (!basicsTouched) setBasicsTouched(true);
    setName(value);
  };
  const handleVersionChange = (value: string) => {
    // normalize in the wizard so we don't have to clean it server-side
    setVersion(value.trim());
  };

  const handlePickLocation = async () => {
    const result = await window.projecthub.pickProjectLocation?.();
    if (result?.ok && result.path) {
      setDestinationBase(result.path);
      setDestinationLocked(true);
      setBasicsTouched(true);
    }
  };

  const handleTemplateSelectionChange = (values: string[]) => {
    replaceSelectedTemplates(values);
    setTemplateTouched(true);
  };

  const toggleLibrary = (libName: string) => {
    setSelectedLibs((prev) => (prev.includes(libName) ? prev.filter((lib) => lib !== libName) : [...prev, libName]));
  };

  const createProject = async (): Promise<CreateResult> => {
    if (!settings || !canSubmit) {
      return { ok: false, error: 'Invalid state' };
    }

    try {
      const templateValue = selectedTemplates;
      const chosenTemplates = templates.filter((tpl) => templateValue.includes(tpl.id ?? tpl.name));
      const res = await window.projecthub.createProjectFromTemplates({
        name,
        version,
        destination,
        templates: chosenTemplates,
        libraries: selectedLibs,
        description: templateValue.length ? `${name} created from ${templateValue.join(', ')}` : `${name} created without a template`
      });

      if (res.ok) {
        const updatedRecent = Array.from(new Set([name, ...(settings.recentProjects || [])])).slice(0, 5);
        await update({ ...settings, recentProjects: updatedRecent });
        return { ok: true };
      }
      return { ok: false, error: res.error };
    } catch (error) {
      return { ok: false, error: (error as Error).message };
    }
  };

  const goNext = () => {
    if (step === 0 && !basicsValid) {
      setBasicsTouched(true);
      return;
    }
    if (step === 1 && !templateValid) {
      setTemplateTouched(true);
      return;
    }
    setStep((prev) => Math.min(prev + 1, 3));
  };

  const goBack = () => setStep((prev) => Math.max(prev - 1, 0));

  return {
    templates,
    libraries,
    filteredLibraries,
    step,
    goNext,
    goBack,
    name,
    setName: handleNameChange,
    version,
    setVersion: handleVersionChange,
    destination,
    selectedTemplates,
    selectedLibs,
    toggleLibrary,
    libQuery,
    setLibQuery,
    onTemplateSelectionChange: handleTemplateSelectionChange,
    basicsValid,
    basicsTouched,
    templateValid,
    templateTouched,
    canSubmit,
    pickLocation: handlePickLocation,
    createProject
  };
};
