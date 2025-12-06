import type { fireEvent as domFireEvent, screen as domScreen, waitFor as domWaitFor } from '@testing-library/dom';

declare module '@testing-library/react' {
  // Re-export DOM helpers so TypeScript sees them on the React entrypoint
  const screen: typeof domScreen;
  const waitFor: typeof domWaitFor;
  const fireEvent: typeof domFireEvent;
  export { screen, waitFor, fireEvent };
}
