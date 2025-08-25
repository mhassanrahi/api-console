import React from 'react';

interface ResultPanelProps {
  apiName: string;
  children?: React.ReactNode;
}

const ResultPanel: React.FC<ResultPanelProps> = ({ apiName, children }) => {
  return (
    <section style={{ flex: 1, margin: 8, padding: 16, background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <h3>{apiName}</h3>
      <div>{children || <span style={{ color: '#aaa' }}>No results yet.</span>}</div>
    </section>
  );
};

export default ResultPanel;
