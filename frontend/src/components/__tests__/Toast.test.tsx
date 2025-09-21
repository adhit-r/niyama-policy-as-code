import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ToastProvider, useToast } from '../ui/Toast';

// Test component that uses the toast
const TestComponent = () => {
  const { addToast, removeToast, clearAll } = useToast();

  return (
    <div>
      <button onClick={() => addToast({ type: 'success', title: 'Success!', message: 'Operation completed' })}>
        Add Success Toast
      </button>
      <button onClick={() => addToast({ type: 'error', title: 'Error!', message: 'Something went wrong' })}>
        Add Error Toast
      </button>
      <button onClick={() => addToast({ type: 'warning', title: 'Warning!', message: 'Please be careful' })}>
        Add Warning Toast
      </button>
      <button onClick={() => addToast({ type: 'info', title: 'Info', message: 'Here is some information' })}>
        Add Info Toast
      </button>
      <button onClick={() => removeToast('test-id')}>
        Remove Toast
      </button>
      <button onClick={clearAll}>
        Clear All
      </button>
    </div>
  );
};

describe('Toast', () => {
  it('renders toast provider without crashing', () => {
    render(
      <ToastProvider>
        <div>Test content</div>
      </ToastProvider>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('adds and displays success toast', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Add Success Toast'));

    await waitFor(() => {
      expect(screen.getByText('Success!')).toBeInTheDocument();
      expect(screen.getByText('Operation completed')).toBeInTheDocument();
    });
  });

  it('adds and displays error toast', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Add Error Toast'));

    await waitFor(() => {
      expect(screen.getByText('Error!')).toBeInTheDocument();
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });

  it('adds and displays warning toast', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Add Warning Toast'));

    await waitFor(() => {
      expect(screen.getByText('Warning!')).toBeInTheDocument();
      expect(screen.getByText('Please be careful')).toBeInTheDocument();
    });
  });

  it('adds and displays info toast', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Add Info Toast'));

    await waitFor(() => {
      expect(screen.getByText('Info')).toBeInTheDocument();
      expect(screen.getByText('Here is some information')).toBeInTheDocument();
    });
  });

  it('removes toast when close button is clicked', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Add Success Toast'));

    await waitFor(() => {
      expect(screen.getByText('Success!')).toBeInTheDocument();
    });

    const closeButton = screen.getByRole('button', { name: 'Close modal' });
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByText('Success!')).not.toBeInTheDocument();
    });
  });

  it('auto-removes toast after duration', async () => {
    vi.useFakeTimers();

    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Add Success Toast'));

    await waitFor(() => {
      expect(screen.getByText('Success!')).toBeInTheDocument();
    });

    // Fast-forward time
    vi.advanceTimersByTime(5000);

    await waitFor(() => {
      expect(screen.queryByText('Success!')).not.toBeInTheDocument();
    });

    vi.useRealTimers();
  });

  it('renders toast with action button', async () => {
    const TestComponentWithAction = () => {
      const { addToast } = useToast();

      return (
        <button
          onClick={() =>
            addToast({
              type: 'info',
              title: 'Action Required',
              message: 'Please confirm your action',
              action: {
                label: 'Confirm',
                onClick: vi.fn()
              }
            })
          }
        >
          Add Toast with Action
        </button>
      );
    };

    render(
      <ToastProvider>
        <TestComponentWithAction />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Add Toast with Action'));

    await waitFor(() => {
      expect(screen.getByText('Action Required')).toBeInTheDocument();
      expect(screen.getByText('Confirm')).toBeInTheDocument();
    });
  });

  it('throws error when useToast is used outside provider', () => {
    const TestComponentOutsideProvider = () => {
      useToast();
      return <div>Test</div>;
    };

    expect(() => {
      render(<TestComponentOutsideProvider />);
    }).toThrow('useToast must be used within a ToastProvider');
  });
});
