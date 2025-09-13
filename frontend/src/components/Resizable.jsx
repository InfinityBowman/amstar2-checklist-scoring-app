import { createSignal } from 'solid-js';

export default function Resizable(props) {
  const direction = props.direction || 'horizontal';
  const defaultPosition = direction === 'horizontal' ? 'right' : 'bottom';
  const position = props.position || defaultPosition;
  const min = props.min ?? 200;
  const max = props.max ?? 800;
  const initial = props.initial ?? 400;
  const [size, setSize] = createSignal(initial);
  let dragging = false;
  let startPos = 0;
  let startSize = 0;
  let pointerId = null;

  const onPointerDown = (e) => {
    dragging = true;
    pointerId = e.pointerId;
    startPos = direction === 'horizontal' ? e.clientX : e.clientY;
    startSize = size();
    document.body.style.userSelect = 'none';
    e.target.setPointerCapture(pointerId);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const onPointerMove = (e) => {
    if (!dragging) return;
    let delta = direction === 'horizontal' ? e.clientX - startPos : e.clientY - startPos;
    if (position === 'left' || position === 'top') {
      delta = -delta;
    }
    let newSize = startSize + delta;
    newSize = Math.max(min, Math.min(max, newSize));
    setSize(newSize);
  };

  const onPointerUp = (e) => {
    dragging = false;
    document.body.style.userSelect = '';
    if (e.target.releasePointerCapture && pointerId !== null) {
      try {
        e.target.releasePointerCapture(pointerId);
      } catch {}
    }
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
    pointerId = null;
  };

  let handleClass = '';
  if (direction === 'horizontal') {
    handleClass = position === 'right' ? 'top-0 right-0 h-full w-2 cursor-col-resize' : 'top-0 left-0 h-full w-2 cursor-col-resize';
  } else {
    handleClass = position === 'bottom' ? 'left-0 bottom-0 w-full h-2 cursor-row-resize' : 'left-0 top-0 w-full h-2 cursor-row-resize';
  }

  return (
    <div
      class={`relative ${direction === 'horizontal' ? 'h-full' : 'w-full'}`}
      style={direction === 'horizontal' ? `width: ${size()}px; min-width:0;` : `height: ${size()}px; min-height:0;`}
    >
      <div class="w-full h-full overflow-auto">{props.children}</div>
      <div
        class={`absolute ${handleClass} bg-gray-200 hover:bg-gray-300 transition-colors z-10`}
        style="touch-action:none;"
        onPointerDown={onPointerDown}
        role="separator"
        aria-orientation={direction}
        tabIndex={0}
      />
    </div>
  );
}
