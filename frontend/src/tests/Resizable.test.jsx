import { render, fireEvent } from '@solidjs/testing-library';
import Resizable from '../components/Resizable.jsx';

// Mock setPointerCapture and releasePointerCapture for jsdom
Element.prototype.setPointerCapture = () => {};
Element.prototype.releasePointerCapture = () => {};

describe('Resizable', () => {
  it('renders children', () => {
    const { getByText } = render(() => (
      <Resizable>
        <div>Content</div>
      </Resizable>
    ));
    expect(getByText('Content')).toBeTruthy();
  });

  it('sets initial size', () => {
    const { container } = render(() => <Resizable initial={350} />);
    const resizableDiv = container.firstChild;
    expect(resizableDiv.style.width).toBe('350px');
  });

  it('respects min and max size', () => {
    const { container } = render(() => <Resizable min={100} max={200} initial={150} />);
    const resizableDiv = container.firstChild;
    expect(resizableDiv.style.width).toBe('150px');
  });

  it('changes size on pointer drag (horizontal, right)', async () => {
    const { container } = render(() => <Resizable direction="horizontal" position="right" initial={400} />);
    const resizableDiv = container.firstChild;
    const handle = container.querySelector('[role="separator"]');

    // Simulate pointer down
    fireEvent.pointerDown(handle, { clientX: 400, pointerId: 1 });
    // Simulate pointer move (drag 50px to the right)
    fireEvent.pointerMove(window, { clientX: 450, pointerId: 1 });
    // Simulate pointer up
    fireEvent.pointerUp(window, { pointerId: 1 });

    expect(parseInt(resizableDiv.style.width)).toBeGreaterThan(400);
  });

  it('changes size on pointer drag (vertical, bottom)', async () => {
    const { container } = render(() => <Resizable direction="vertical" position="bottom" initial={300} />);
    const resizableDiv = container.firstChild;
    const handle = container.querySelector('[role="separator"]');

    fireEvent.pointerDown(handle, { clientY: 300, pointerId: 2 });
    fireEvent.pointerMove(window, { clientY: 350, pointerId: 2 });
    fireEvent.pointerUp(window, { pointerId: 2 });

    expect(parseInt(resizableDiv.style.height)).toBeGreaterThan(300);
  });

  it('does not shrink below min or grow above max', async () => {
    const { container } = render(() => <Resizable min={200} max={300} initial={250} />);
    const resizableDiv = container.firstChild;
    const handle = container.querySelector('[role="separator"]');

    // Try to shrink below min
    fireEvent.pointerDown(handle, { clientX: 250, pointerId: 3 });
    fireEvent.pointerMove(window, { clientX: 0, pointerId: 3 });
    fireEvent.pointerUp(window, { pointerId: 3 });
    expect(parseInt(resizableDiv.style.width)).toBe(200);

    // Try to grow above max
    fireEvent.pointerDown(handle, { clientX: 250, pointerId: 4 });
    fireEvent.pointerMove(window, { clientX: 1000, pointerId: 4 });
    fireEvent.pointerUp(window, { pointerId: 4 });
    expect(parseInt(resizableDiv.style.width)).toBe(300);
  });
});
