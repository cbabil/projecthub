import React from 'react';

interface Props {
  json: unknown;
}

const JsonViewer: React.FC<Props> = ({ json }) => (
  <pre className="text-xs font-mono text-brand-text-dark whitespace-pre-wrap">
    {JSON.stringify(json, null, 2)}
  </pre>
);

export default JsonViewer;
