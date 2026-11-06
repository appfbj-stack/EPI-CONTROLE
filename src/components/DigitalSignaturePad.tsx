import React, { useRef, useState, useEffect } from 'react';
import { X, Eraser, Check, PenTool, ShieldCheck, UserCheck, AlertCircle } from 'lucide-react';
import { Funcionario } from '../types';

interface DigitalSignaturePadProps {
  funcionario: Funcionario;
  itemDescription?: string;
  onSave: (signatureDataUrl: string) => void;
  onClose: () => void;
  initialSignature?: string;
}

export const DigitalSignaturePad: React.FC<DigitalSignaturePadProps> = ({
  funcionario,
  itemDescription,
  onSave,
  onClose,
  initialSignature,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Initialize and resize canvas with High-DPI support
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = container.getBoundingClientRect();
    const width = rect.width || 480;
    const height = 200;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 2.8;
    ctx.strokeStyle = '#0f172a'; // Deep slate ink

    // Load initial signature if exists
    if (initialSignature) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
        setHasDrawn(true);
      };
      img.src = initialSignature;
    }
  }, [initialSignature]);

  // Coordinates helper
  const getCoordinates = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.setPointerCapture(e.pointerId);
    const { x, y } = getCoordinates(e);

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setErrorMsg(null);
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasDrawn(true);
  };

  const stopDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.closePath();
    setIsDrawing(false);
    try {
      canvas.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    setHasDrawn(false);
    setErrorMsg(null);
  };

  const handleSave = () => {
    if (!hasDrawn) {
      setErrorMsg('Por favor, faça a assinatura na área indicada antes de salvar.');
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Export signature as PNG data URL
    const signatureDataUrl = canvas.toDataURL('image/png');
    onSave(signatureDataUrl);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
              <PenTool className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Assinatura Digital de EPI</h3>
              <p className="text-xs text-slate-400">Termo de recebimento e responsabilidade NR-6</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info Box */}
        <div className="p-5 pb-3 space-y-3">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1">
            <div className="flex items-center justify-between font-medium">
              <span className="text-slate-500">Colaborador:</span>
              <strong className="text-slate-900">{funcionario.nome}</strong>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>CPF / Matrícula:</span>
              <span className="font-mono">{funcionario.cpf} • {funcionario.matricula}</span>
            </div>
            {itemDescription && (
              <div className="flex items-center justify-between text-slate-600 pt-1 border-t border-slate-200/60">
                <span>Equipamento:</span>
                <span className="font-semibold text-slate-900 truncate max-w-[260px]">{itemDescription}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-amber-500" />
              Assine com o dedo ou mouse abaixo:
            </span>

            <button
              type="button"
              onClick={handleClear}
              className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2 py-1 rounded transition-colors cursor-pointer"
            >
              <Eraser className="w-3.5 h-3.5" />
              <span>Limpar</span>
            </button>
          </div>

          {/* Canvas Signature Pad Container */}
          <div
            ref={containerRef}
            className="relative bg-white border-2 border-dashed border-slate-300 rounded-xl overflow-hidden touch-none cursor-crosshair shadow-inner"
            style={{ height: '200px' }}
          >
            {/* Signature Guideline */}
            <div className="absolute inset-x-6 bottom-10 pointer-events-none flex items-center gap-2">
              <span className="text-sm font-bold text-slate-300 font-mono">X</span>
              <div className="flex-1 border-b border-slate-300" />
            </div>

            <div className="absolute bottom-2 left-6 pointer-events-none text-[10px] text-slate-400 font-medium">
              Linha de assinatura do empregado
            </div>

            {!hasDrawn && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 text-xs font-medium">
                Toque ou clique e arraste para rubricar / assinar aqui
              </div>
            )}

            <canvas
              ref={canvasRef}
              onPointerDown={startDrawing}
              onPointerMove={draw}
              onPointerUp={stopDrawing}
              onPointerCancel={stopDrawing}
              className="w-full h-full block"
            />
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 text-rose-600 text-xs font-semibold bg-rose-50 p-2.5 rounded-lg border border-rose-200">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <p className="text-[11px] text-slate-500 leading-tight">
            Ao assinar, o colaborador confirma o recebimento em perfeitas condições de uso, instrução de utilização e concordância com os termos da NR-6 (MTE).
          </p>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>Confirmar Assinatura Digital</span>
          </button>
        </div>
      </div>
    </div>
  );
};
