import React, { Component, Suspense } from 'react';
import { Button, Spin, Typography } from '@arco-design/web-react';
import styles from '../index.module.scss';

const OntologyGraphViewLazy = React.lazy(async () => {
  const module = await import(
    '@/pages/ontologyScene/modules/graph/OntologyGraphView'
  );
  return { default: module.OntologyGraphView };
});

interface GraphErrorBoundaryProps {
  children: React.ReactNode;
  resetKey: number;
}

interface GraphErrorBoundaryState {
  hasError: boolean;
}

class GraphErrorBoundary extends Component<
  GraphErrorBoundaryProps,
  GraphErrorBoundaryState
> {
  state: GraphErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): GraphErrorBoundaryState {
    return { hasError: true };
  }

  componentDidUpdate(prevProps: GraphErrorBoundaryProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
          <Typography.Text type="secondary">
            图谱加载失败，请重试或刷新页面。
          </Typography.Text>
          <Button
            type="primary"
            size="small"
            onClick={() => this.setState({ hasError: false })}
          >
            重试
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

interface ScenarioGraphPanelProps {
  sceneId: number;
  zoomToolbarRef?: React.RefObject<HTMLDivElement | null>;
}

export default function ScenarioGraphPanel({
  sceneId,
  zoomToolbarRef
}: ScenarioGraphPanelProps) {
  return (
    <GraphErrorBoundary resetKey={sceneId}>
      <Suspense
        fallback={
          <div className="flex h-full w-full items-center justify-center">
            <Spin />
          </div>
        }
      >
        <OntologyGraphViewLazy
          sceneId={sceneId}
          embedMode
          className={styles['graph-embed']}
          zoomToolbarRef={zoomToolbarRef}
        />
      </Suspense>
    </GraphErrorBoundary>
  );
}
