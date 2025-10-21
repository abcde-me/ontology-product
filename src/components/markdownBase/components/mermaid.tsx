import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

const Mermaid = ({ chart }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      mermaid.initialize({
        startOnLoad: true,
        theme: 'default',
        flowchart: {
          useMaxWidth: true,
          htmlLabels: true
        },
        sequence: {
          diagramMarginX: 50,
          diagramMarginY: 10
        }
      });
      try {
        mermaid.init(undefined, ref.current);
      } catch (error) {
        console.error('Error rendering Mermaid chart:', error);
      }
    }
  }, [chart]);

  return (
    <div className="mermaid" ref={ref}>
      {chart}
    </div>
  );
};

export default Mermaid;
