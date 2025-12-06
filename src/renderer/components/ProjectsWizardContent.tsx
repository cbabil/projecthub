import React from 'react';

import { BasicsStep, LibrariesStep, ReviewStep } from './ProjectsWizardSteps.js';
import TemplateStep from './TemplateStep.js';

type BasicsProps = React.ComponentProps<typeof BasicsStep>;
type TemplateProps = React.ComponentProps<typeof TemplateStep>;
type LibrariesProps = React.ComponentProps<typeof LibrariesStep>;
type ReviewProps = React.ComponentProps<typeof ReviewStep>;

interface Props {
  step: number;
  basics: BasicsProps;
  template: TemplateProps;
  libraries: LibrariesProps;
  review: ReviewProps;
}

const ProjectsWizardContent: React.FC<Props> = ({ step, basics, template, libraries, review }) => {
  switch (step) {
    case 0:
      return <BasicsStep {...basics} />;
    case 1:
      return <TemplateStep {...template} />;
    case 2:
      return <LibrariesStep {...libraries} />;
    default:
      return <ReviewStep {...review} />;
  }
};

export default ProjectsWizardContent;
