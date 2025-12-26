import React, { useEffect, useMemo, useRef, useState } from 'react';

import type { TranslationKeys } from '../../i18n';
import { useTranslation } from '../context/TranslationContext.js';
import { useProjectsWizard } from '../hooks/useProjectsWizard.js';
import ProjectsWizardContent from './ProjectsWizardContent.js';
import ProjectsWizardFooter from './ProjectsWizardFooter.js';
import { buildBasicsProps, buildLibrariesProps, buildReviewProps, buildTemplateProps } from './ProjectsWizardProps.js';
import StepperProgress from './StepperProgress.js';

interface Props {
  onClose: () => void;
  onCreated: () => Promise<void>;
}
const STEP_KEYS: TranslationKeys[] = ['wizardStepDetails', 'wizardStepTemplate', 'wizardStepLibraries', 'wizardStepReview'];

const ProjectsWizard: React.FC<Props> = ({ onClose, onCreated }) => {
  const { t } = useTranslation();
  const {
    templates,
    filteredLibraries,
    step,
    goNext,
    goBack,
    name,
    setName,
    version,
    setVersion,
    destination,
    selectedTemplates,
    selectedLibs,
    toggleLibrary,
    libQuery,
    setLibQuery,
    onTemplateSelectionChange,
    basicsValid,
    basicsTouched,
    templateValid,
    templateTouched,
    canSubmit,
    pickLocation,
    createProject
  } = useProjectsWizard();
  const [status, setStatus] = useState<string>();
  const [error, setError] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
    }
  }, []);

  const stepLabels = useMemo(() => STEP_KEYS.map((key) => t(key)), [t]);
  const showBasicsError = basicsTouched && !basicsValid;
  const showTemplateError = templateTouched && !templateValid;
  const canAdvance = step === 0 ? basicsValid : step === 1 ? templateValid : true;
  const selectedTemplateObjects = useMemo(
    () => templates.filter((tpl) => selectedTemplates.includes(tpl.id ?? tpl.name)),
    [templates, selectedTemplates]
  );

  const handleCreate = async () => {
    setStatus(undefined);
    setError(undefined);
    setIsSubmitting(true);
    const result = await createProject();
    if (result.ok) {
      setStatus(t('wizardStatusSuccess'));
      await onCreated();
      closeTimerRef.current = setTimeout(() => {
        onClose();
      }, 1000);
    } else {
      setError(result.error || t('wizardStatusError'));
      setIsSubmitting(false);
    }
  };

  const basicsProps = buildBasicsProps(t, {
    name, version, destination, setName, setVersion, pickLocation, showError: showBasicsError
  });
  const templateProps = buildTemplateProps(t, {
    templates, selected: selectedTemplates, onSelectionChange: onTemplateSelectionChange, showError: showTemplateError
  });
  const librariesProps = buildLibrariesProps(t, {
    libraries: filteredLibraries, selected: selectedLibs, query: libQuery, onQueryChange: setLibQuery, onToggle: toggleLibrary
  });
  const reviewProps = buildReviewProps(t, {
    name, version, destination, templates: selectedTemplateObjects, libraries: selectedLibs
  });

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="shrink-0">
        <StepperProgress steps={stepLabels} currentIndex={step} />
      </div>
      <div className="flex-1 min-h-0 pr-1 pt-3 sm:pt-5">
        <ProjectsWizardContent
          step={step}
          basics={basicsProps}
          template={templateProps}
          libraries={librariesProps}
          review={reviewProps}
        />
      </div>
      <div className="shrink-0">
        <ProjectsWizardFooter
          step={step}
          totalSteps={STEP_KEYS.length}
          onBack={goBack}
          onNext={goNext}
          onCreate={handleCreate}
          canAdvance={canAdvance}
          canSubmit={canSubmit}
          isSubmitting={isSubmitting}
          backLabel={t('wizardBack')}
          nextLabel={t('wizardNext')}
          createLabel={t('wizardCreate')}
          status={status}
          error={error}
        />
      </div>
    </div>
  );
};

export default ProjectsWizard;
