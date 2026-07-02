import React, { Component, Suspense } from 'react';
import { Button, Spin, Typography } from '@arco-design/web-react';

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

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[JointOperationsGraph]', error, info);
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

interface JointOperationsGraphPanelProps {
  sceneId: number;
}

export default function JointOperationsGraphPanel({
  sceneId
}: JointOperationsGraphPanelProps) {
  return (
    <GraphErrorBoundary resetKey={sceneId}>
      <Suspense
        fallback={
          <div className="flex h-full w-full items-center justify-center">
            <Spin />
          </div>
        }
      >
        <OntologyGraphViewLazy sceneId={sceneId} embedMode />
      </Suspense>
    </GraphErrorBoundary>
  );
}
