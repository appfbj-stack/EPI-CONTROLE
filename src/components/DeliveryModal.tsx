import React, { useState, useEffect } from 'react';
import { X, PackageCheck, AlertTriangle, ShieldCheck, Calendar, Info, AlertCircle, PenTool, CheckCircle2, Eraser } from 'lucide-react';
import { DeliveryRecord, Funcionario, PPEItem, PPEMotivo } from '../types';
import { addDaysToDate, formatDateBr, getDaysDiff, getTodayStr } from '../utils/alerts';
import { DigitalSignaturePad } from './DigitalSignaturePad';

interface DeliveryModalProps {
  employees: Funcionario[];
  catalog: PPEItem[];
  preSelectedEmployee?: Funcionario;
  preSelectedPPEId?: string;
  onClose: () => void;
  onSubmit: (record: Omit<DeliveryRecord, 'id'>, replaceOldDeliveryId?: string) => void;
}

export const DeliveryModal: React.FC<DeliveryModalProps> = ({
  employees,
  catalog,
  preSelectedEmployee,
  preSelectedPPEId,
  onClose,
  onSubmit,
}) => {
  const [funcionarioId, setFuncionarioId] = useState(preSelectedEmployee?.id || (employees[0]?.id || ''));
  const [epiId, setEpiId] = useState(preSelectedPPEId || (catalog[0]?.id || ''));
  const [quantidade, setQuantidade] = useState(1);
  const [dataEntrega, setDataEntrega] = useState(getTodayStr());
  const [motivo, setMotivo] = useState<PPEMotivo>(preSelectedPPEId ? 'substituicao_periodica' : 'admissao');
  const [observacoes, setObservacoes] = useState('');
  const [termoAssinado, setTermoAssinado] = useState(true);
  const [assinaturaUrl, setAssinaturaUrl] = useState<string | undefined>();
  const [showSignaturePad, setShowSignaturePad] = useState(false);

  // Selected EPI details
  const selectedEPI = catalog.find((item) => item.id === epiId);
  const selectedEmployee = employees.find((emp) => emp.id === funcionarioId);

  // Calculated replacement date based on vida útil
  const vidaUtilDias = selectedEPI?.vidaUtilDias || 90;
  const dataPrevisaoTroca = addDaysToDate(dataEntrega, vidaUtilDias);

  const daysCA = selectedEPI?.validadeCA ? getDaysDiff(selectedEPI.validadeCA) : 999;
  const isCAVencido = daysCA < 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEPI || !funcionarioId) return;

    onSubmit({
      funcionarioId,
      epiId: selectedEPI.id,
      epiNome: selectedEPI.nome,
      numeroCA: selectedEPI.numeroCA,
      fabricante: selectedEPI.fabricante,
      quantidade: Number(quantidade) || 1,
      dataEntrega,
      dataPrevisaoTroca,
      validadeCA: selectedEPI.validadeCA,
      motivo,
      status: 'ativo',
      observacoes,
      termoAssinado: Boolean(termoAssinado || assinaturaUrl),
      assinadoEm: (termoAssinado || assinaturaUrl) ? new Date().toISOString() : undefined,
      assinaturaUrl,
      assinanteNome: selectedEmployee?.nome,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
              <PackageCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Registrar Entrega de EPI</h3>
              <p className="text-xs text-slate-400">Emissão de comprovante conforme Norma Regulamentadora NR-6</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Employee Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Colaborador Destinatário *
            </label>
            <select
              value={funcionarioId}
              onChange={(e) => setFuncionarioId(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.nome} (Mat: {emp.matricula} - {emp.cargo})
                </option>
              ))}
            </select>
          </div>

          {/* PPE Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Equipamento de Proteção Individual (EPI) *
            </label>
            <select
              value={epiId}
              onChange={(e) => setEpiId(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
            >
              {catalog.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nome} (C.A. {item.numeroCA} - {item.fabricante})
                </option>
              ))}
            </select>
          </div>

          {/* Selected EPI Quick Card */}
          {selectedEPI && (
            <div className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
              isCAVencido ? 'bg-rose-50 border-rose-300' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center justify-between font-semibold">
                <span className="text-slate-800">Detalhes Homologados:</span>
                <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700">
                  C.A. {selectedEPI.numeroCA}
                </span>
              </div>
              <div className="text-slate-600 flex items-center justify-between">
                <span>Fabricante: {selectedEPI.fabricante}</span>
                <span>Validade C.A.: <strong>{formatDateBr(selectedEPI.validadeCA)}</strong></span>
              </div>
              <div className="text-slate-600 flex items-center justify-between">
                <span>Vida útil recomendada: <strong>{selectedEPI.vidaUtilDias} dias</strong></span>
                <span>Previsão de Troca: <strong className="text-amber-700">{formatDateBr(dataPrevisaoTroca)}</strong></span>
              </div>

              {isCAVencido && (
                <div className="flex items-center gap-1.5 text-rose-700 font-bold pt-1">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>Atenção: O C.A. deste EPI está vencido no MTE ({formatDateBr(selectedEPI.validadeCA)})!</span>
                </div>
              )}
            </div>
          )}

          {/* Quantidade and Data de Entrega */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Quantidade *
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={quantidade}
                onChange={(e) => setQuantidade(Math.max(1, parseInt(e.target.value) || 1))}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Data de Entrega *
              </label>
              <input
                type="date"
                value={dataEntrega}
                onChange={(e) => setDataEntrega(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Motivo da Entrega */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Motivo da Entrega *
            </label>
            <select
              value={motivo}
              onChange={(e) => setMotivo(e.target.value as PPEMotivo)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
            >
              <option value="admissao">Admissão / Primeira Entrega</option>
              <option value="substituicao_periodica">Substituição Periódica (Vencimento de Vida Útil)</option>
              <option value="danificado">Substituição por Dano / Desgaste Prematuro</option>
              <option value="extravio">Reposição por Extravio / Perda</option>
              <option value="outro">Outro Motivo</option>
            </select>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Observações Adicionais (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ex: Treinamento prático de ajuste realizado na entrega..."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
            />
          </div>

          {/* Termo de Confirmação e Assinatura Digital NR-6 */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <PenTool className="w-4 h-4 text-amber-500" />
                Assinatura Digital do Empregado (NR-6)
              </span>

              {assinaturaUrl ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Assinatura Coletada
                </span>
              ) : (
                <span className="text-[11px] text-slate-400">Pendente de rubrica</span>
              )}
            </div>

            {assinaturaUrl ? (
              <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Rubrica Digital Registrada:</span>
                  <div className="h-14 max-w-[200px] border border-slate-100 rounded bg-slate-50/50 flex items-center justify-center p-1">
                    <img src={assinaturaUrl} alt="Assinatura Digital" className="max-h-full max-w-full object-contain" />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 text-right">
                  <button
                    type="button"
                    onClick={() => setShowSignaturePad(true)}
                    className="text-xs text-amber-600 hover:text-amber-700 font-medium underline cursor-pointer"
                  >
                    Assinar Novamente
                  </button>
                  <button
                    type="button"
                    onClick={() => setAssinaturaUrl(undefined)}
                    className="text-xs text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1 justify-end cursor-pointer"
                  >
                    <Eraser className="w-3 h-3" />
                    <span>Remover</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-amber-50/60 p-3 rounded-lg border border-amber-200">
                <div className="text-xs text-slate-700 leading-snug">
                  <strong>Colher Assinatura Digital Agora:</strong>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    O colaborador pode assinar direto na tela do celular (touch) ou computador (mouse).
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowSignaturePad(true)}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-xs whitespace-nowrap"
                >
                  <PenTool className="w-3.5 h-3.5 text-amber-400" />
                  <span>Coletar Assinatura</span>
                </button>
              </div>
            )}

            <div className="flex items-start gap-2 pt-1">
              <input
                type="checkbox"
                id="termoCheck"
                checked={termoAssinado || Boolean(assinaturaUrl)}
                onChange={(e) => setTermoAssinado(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300 cursor-pointer"
              />
              <label htmlFor="termoCheck" className="text-[11px] text-slate-600 cursor-pointer leading-tight">
                Declaro o recebimento do EPI novo e em perfeitas condições, instruído sobre o uso e ciente das obrigações da NR-6.
              </label>
            </div>
          </div>

          {/* Form Actions */}
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
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-2"
            >
              <PackageCheck className="w-4 h-4" />
              <span>Registrar Entrega</span>
            </button>
          </div>
        </form>
      </div>

      {showSignaturePad && selectedEmployee && (
        <DigitalSignaturePad
          funcionario={selectedEmployee}
          itemDescription={selectedEPI ? `${selectedEPI.nome} (C.A. ${selectedEPI.numeroCA})` : undefined}
          initialSignature={assinaturaUrl}
          onSave={(dataUrl) => {
            setAssinaturaUrl(dataUrl);
            setTermoAssinado(true);
            setShowSignaturePad(false);
          }}
          onClose={() => setShowSignaturePad(false)}
        />
      )}
    </div>
  );
};
