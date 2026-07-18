import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Catches WebGL/context-creation failures from the 3D scene (e.g. headless
 * browsers, disabled GPU, restrictive sandboxes) so the splash page still
 * renders a polished static fallback instead of crashing.
 */
export class SceneBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.warn('3D scene failed to initialize, showing fallback:', error);
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}
