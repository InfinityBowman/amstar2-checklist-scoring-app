import { render, fireEvent, screen } from '@solidjs/testing-library';
import Dialog from '../components/Dialog.jsx';

describe('Dialog', () => {
  it('renders when open is true', () => {
    render(() => <Dialog open={true} title="Test Title" description="Test Description" />);
    expect(screen.getByText('Test Title')).toBeVisible();
    expect(screen.getByText('Test Description')).toBeVisible();
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeVisible();
    expect(screen.getByRole('button', { name: /Delete/i })).toBeVisible();
  });

  it('does not render when open is false', () => {
    render(() => <Dialog open={false} title="Test Title" />);
    expect(screen.queryByText('Test Title')).toBeNull();
    expect(screen.queryByRole('button', { name: /Cancel/i })).toBeNull();
  });

  it('calls onCancel when Cancel is clicked', async () => {
    const onCancel = vi.fn();
    render(() => <Dialog open={true} onCancel={onCancel} />);
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(onCancel).toHaveBeenCalled();
  });

  it('calls onConfirm when Confirm is clicked', async () => {
    const onConfirm = vi.fn();
    render(() => <Dialog open={true} onConfirm={onConfirm} confirmText="Confirm" />);
    fireEvent.click(screen.getByRole('button', { name: /Confirm/i }));
    expect(onConfirm).toHaveBeenCalled();
  });

  it('shows default title and confirm text if not provided', () => {
    render(() => <Dialog open={true} />);
    expect(screen.getByText('Are you sure?')).toBeVisible();
    expect(screen.getByRole('button', { name: /Delete/i })).toBeVisible();
  });
});
