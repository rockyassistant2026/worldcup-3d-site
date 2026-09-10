import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { error: Error | null };

export class CanvasErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("3D canvas crashed", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="canvas-error" role="alert">
          <h1>3D canvas failed to start</h1>
          <p>{this.state.error.message}</p>
        </div>
      );
    }
    return this.props.children;
  }
}
