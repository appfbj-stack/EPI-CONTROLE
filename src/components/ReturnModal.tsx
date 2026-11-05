import React, { useState } from 'react';
import { X, Undo2, AlertCircle } from 'lucide-react';
import { DeliveryRecord, PPEStatus } from '../types';
import { getTodayStr } from '../utils/alerts';

interface ReturnModalProps {
  delivery: DeliveryRecord;
  onClose: () => void;
  onSubmit: (deliveryId: string, status: PPEStatus, dataDevolucao: string, motivoDevolucao: string) => void;
}

export const ReturnModal: React.FC<ReturnModalProps> = ({ delivery, onClose, onSubmit }) => {
  const [status, setStatus] = useState<PPEStatus>('devolvido');
  const [dataDevolucao, setDataDevolucao] = useState(getTodayStr());
  const [motivoDevolucao, setMotivoDevolucao] = useState('Substituição por término da vida útil');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(delivery.id, status, dataDevolucao, motivoDevolucao);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 text-amber-400 flex items-center justify-center font-bold">
              <Undo2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Baixa / Devolução de EPI</h3>
              <p className="text-xs text-slate-400">Registrar encerramento de posse do equipamento</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
            <span className="text-slate-500 block">Equipamento a dar baixa:</span>
            <strong className="text-slate-900 text-sm block mt-0.5">{delivery.epiNome}</strong>
            <span className="text-slate-600 block mt-0.5">C.A. {delivery.numeroCA} • Qtd: {delivery.quantidade}</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Tipo de Baixa *
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as PPEStatus)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-amber-500"
            >
              <option value="devolvido">Devolução Normal (Almoxarifado)</option>
              <option value="descartado">Descarte Definitivo (Inutilizável/Danificado)</option>
              <option value="substituido">Substituição por Novo Item</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Data da Baixa / Devolução *
            </label>
            <input
              type="date"
              value={dataDevolucao}
              onChange={(e) => setDataDevolucao(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Motivo do Encerramento *
            </label>
            <input
              type="text"
              value={motivoDevolucao}
              onChange={(e) => setMotivoDevolucao(e.target.value)}
              required
              placeholder="Ex: Fim do prazo de validade, desgaste normal de uso, transferência..."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-2"
            >
              <Undo2 className="w-4 h-4 text-amber-400" />
              <span>Confirmar Baixa</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
