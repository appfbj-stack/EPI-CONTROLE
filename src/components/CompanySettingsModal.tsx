import React, { useState } from 'react';
import { X, Building2, Save, RotateCcw, Download, Upload, Shield } from 'lucide-react';
import { CompanyInfo } from '../types';

interface CompanySettingsModalProps {
  company: CompanyInfo;
  onClose: () => void;
  onSave: (info: CompanyInfo) => void;
  onResetDemo: () => void;
  onExportJson: () => void;
  onImportJson: (file: File) => void;
}

export const CompanySettingsModal: React.FC<CompanySettingsModalProps> = ({
  company,
  onClose,
  onSave,
  onResetDemo,
  onExportJson,
  onImportJson,
}) => {
  const [razaoSocial, setRazaoSocial] = useState(company.razaoSocial);
  const [nomeFantasia, setNomeFantasia] = useState(company.nomeFantasia);
  const [cnpj, setCnpj] = useState(company.cnpj);
  const [endereco, setEndereco] = useState(company.endereco);
  const [cidadeUf, setCidadeUf] = useState(company.cidadeUf);
  const [responsavelTecnico, setResponsavelTecnico] = useState(company.responsavelTecnico);
  const [registroTecnico, setRegistroTecnico] = useState(company.registroTecnico);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      razaoSocial: razaoSocial.trim(),
      nomeFantasia: nomeFantasia.trim(),
      cnpj: cnpj.trim(),
      endereco: endereco.trim(),
      cidadeUf: cidadeUf.trim(),
      responsavelTecnico: responsavelTecnico.trim(),
      registroTecnico: registroTecnico.trim(),
    });
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportJson(file);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Configurações da Empresa & SESMT</h3>
              <p className="text-xs text-slate-400">Dados exibidos nos cabeçalhos das fichas NR-6 e Excel</p>
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
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Razão Social da Empresa *
            </label>
            <input
              type="text"
              required
              value={razaoSocial}
              onChange={(e) => setRazaoSocial(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Nome Fantasia
              </label>
              <input
                type="text"
                value={nomeFantasia}
                onChange={(e) => setNomeFantasia(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                CNPJ *
              </label>
              <input
                type="text"
                required
                value={cnpj}
                onChange={(e) => setCnpj(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Endereço
              </label>
              <input
                type="text"
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Cidade / UF
              </label>
              <input
                type="text"
                value={cidadeUf}
                onChange={(e) => setCidadeUf(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Responsável Técnico SESMT *
              </label>
              <input
                type="text"
                required
                value={responsavelTecnico}
                onChange={(e) => setResponsavelTecnico(e.target.value)}
                placeholder="Nome do Técnico ou Engenheiro"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Registro Profissional (MTE / CREA) *
              </label>
              <input
                type="text"
                required
                value={registroTecnico}
                onChange={(e) => setRegistroTecnico(e.target.value)}
                placeholder="Ex: MTE 004521/SP ou CREA"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono"
              />
            </div>
          </div>

          {/* Backup & Reset utilities */}
          <div className="pt-4 border-t border-slate-200">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Gerenciamento de Dados & Backup
            </h4>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={onExportJson}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Backup JSON</span>
              </button>

              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>Restaurar Backup</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={() => {
                  if (confirm('Deseja restaurar os dados de exemplo padrão? Todas as alterações manuais serão resetadas.')) {
                    onResetDemo();
                    onClose();
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-medium cursor-pointer ml-auto"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Resetar Dados de Exemplo</span>
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg shadow-sm cursor-pointer flex items-center gap-2"
            >
              <Save className="w-4 h-4 text-amber-400" />
              <span>Salvar Configurações</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
