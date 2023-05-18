import React, { Component, ErrorInfo, ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

export default class ErrorBoundary extends Component<Props> {
  state = {
    hasError: false,
  };

  componentDidCatch(error: Error, info: ErrorInfo): void {
    this.setState({
      hasError: true,
      error,
      info,
    });
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return <h4 className="text-center p-5">Something went wrong :(</h4>;
    }

    return this.props.children;
  }
}
