import React, { useRef, useEffect, useState, useCallback } from 'react';

interface SignaturePadProps {
  value?: string | null;
  onChange: (dataUrl: string | null) => void;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({ value, onChange }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasContent, setHasContent] = useState(false);

  // Load existing signature on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (value) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        setHasContent(true);
      };
      img.src = value;
    } else if (!hasContent) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, [value]);

  const getCoordinates = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ): { x: number; y: number } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in e) {
      if (e.touches.length === 0) return null;
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    } else {
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    }
  };

  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCoordinates(e);
    if (!coords) return;

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    setIsDrawing(true);
  };

  const draw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCoordinates(e);
    if (!coords) return;

    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
    setHasContent(true);
  };

  const stopDrawing = (
    e?: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    onChange(dataUrl);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasContent(false);
    onChange(null);
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={400}
          height={150}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full max-w-md h-[130px] sm:h-[150px] bg-white border-2 border-dashed border-slate-300 rounded-lg cursor-crosshair touch-none shadow-2xs"
        />
        {!hasContent && !value && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 text-xs italic">
            Desenhe a assinatura aqui com o mouse ou dedo
          </div>
        )}
      </div>

      <div className="flex items-center justify-between max-w-md">
        <span className="text-[10px] text-slate-500">
          Traço suave capturado em alta resolução (PNG)
        </span>
        <button
          type="button"
          onClick={clearSignature}
          className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-50 hover:bg-rose-100 transition"
        >
          <i className="fa-solid fa-eraser"></i>
          Limpar Assinatura
        </button>
      </div>
    </div>
  );
};
