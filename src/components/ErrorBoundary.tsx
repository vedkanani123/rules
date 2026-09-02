import React from 'react';

interface Props { children: React.ReactNode; }
interface State { hasError: boolean; error: Error | null; }

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }

  handleReset = () => this.setState({ hasError: false, error: null });

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-white">Something went wrong</h2>
          <p className="text-sm text-white/60 max-w-md break-words">{this.state.error?.message || 'An unexpected error occurred.'}</p>
          <div className="flex gap-3">
            <button onClick={this.handleReset} className="px-5 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-bold min-h-[44px]">Try Again</button>
            <button onClick={() => window.location.href = '/'} className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold min-h-[44px]">Go Home</button>
          </div>
          <p className="text-xs text-white/60 pt-4">If this persists, press <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-xs">Cmd+Shift+R</kbd> to hard refresh.</p>
        </div>
      );
    }
    return this.props.children;
  }
}
