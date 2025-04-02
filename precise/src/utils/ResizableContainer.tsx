import React, { useState, useRef, useEffect } from 'react';

interface ResizableContainerProps {
  children: React.ReactNode;
  initialHeight: string;
  minHeight?: string;
  maxHeight?: string;
  onHeightChange: (newHeight: string) => void;
}

const ResizableContainer: React.FC<ResizableContainerProps> = ({ 
  children, 
  initialHeight, 
  minHeight = '100px', 
  maxHeight = '80vh', 
  onHeightChange 
}) => {
  const [height, setHeight] = useState<string>(initialHeight);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const resizeHandleRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const resizeHandle = resizeHandleRef.current;
    let isResizing = false;
    let startY: number;
    let startHeight: number;

    const onMouseDown = (e: MouseEvent) => {
      isResizing = true;
      startY = e.clientY;
      startHeight = container!.getBoundingClientRect().height;
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const diff = e.clientY - startY;
      const newHeight = startHeight + diff;
      const minHeightPx = parseInt(minHeight);
      const maxHeightPx = parseInt(maxHeight);
      const clampedHeight = Math.max(minHeightPx, Math.min(maxHeightPx, newHeight));
      const newHeightString = `${clampedHeight}px`;
      setHeight(newHeightString);
      onHeightChange(newHeightString);
    };

    const onMouseUp = () => {
      isResizing = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    resizeHandle?.addEventListener('mousedown', onMouseDown);

    return () => {
      resizeHandle?.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [minHeight, maxHeight, onHeightChange]);

  return (
    <div ref={containerRef} style={{ height, position: 'relative', overflow: 'hidden' }}>
      {children}
      <div
        ref={resizeHandleRef}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '10px',
          backgroundColor: '#ccc',
          cursor: 'ns-resize'
        }}
      />
    </div>
  );
};

export default ResizableContainer;