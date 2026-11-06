import React from 'react';
import { X, Printer, ShieldCheck } from 'lucide-react';
import { CompanyInfo, DeliveryRecord, Funcionario } from '../types';
import { formatDateBr } from '../utils/alerts';

interface PrintSheetModalProps {
  employee: Funcionario;
  deliveries: DeliveryRecord[];
  company: CompanyInfo;
  onClose: () => void;
}

export const PrintSheetModal: React.FC<PrintSheetModalProps> = ({
  employee,
  deliveries,
  company,
  onClose,
}) => {
  const empDeliveries = deliveries
    .filter((d) => d.funcionarioId === employee.id)
    .sort((a, b) => (a.dataEntrega < b.dataEntrega ? 1 : -1));

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white print:fixed print:inset-0">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-4xl overflow-hidden print:border-none print:shadow-none print:w-full print:max-w-none">
        {/* Top Control Bar - Hidden on print */}
        <div className="bg-slate-900 text-white p-4 px-6 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-amber-400" />
            <span className="font-bold text-sm">Visualização de Impressão - Ficha NR-6</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Salvar PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Area */}
        <div className="p-8 sm:p-12 text-slate-900 text-xs font-sans space-y-6 print:p-6">
          {/* Header */}
          <div className="border-2 border-slate-900 p-4 rounded-sm space-y-2">
            <div className="flex justify-between items-start border-b border-slate-300 pb-2">
              <div>
                <h1 className="text-base font-extrabold uppercase tracking-tight">
                  {company.razaoSocial}
                </h1>
                <p className="text-[11px] text-slate-600">
                  CNPJ: {company.cnpj} • {company.endereco} - {company.cidadeUf}
                </p>
              </div>
              <div className="text-right">
                <span className="inline-block border border-slate-900 px-2 py-0.5 font-bold uppercase text-[10px]">
                  NR-6 MTE
                </span>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Emissão: {formatDateBr(new Date().toISOString().split('T')[0])}
                </p>
              </div>
            </div>

            <h2 className="text-center text-sm font-black uppercase pt-1 tracking-wide">
              FICHA DE CONTROLE E ENTREGA DE EQUIPAMENTO DE PROTEÇÃO INDIVIDUAL (EPI)
            </h2>
          </div>

          {/* Dados do Empregado */}
          <div className="border border-slate-300 p-3 rounded-sm space-y-2">
            <h3 className="font-bold uppercase text-[11px] bg-slate-100 p-1">Identificação do Empregado</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
              <div>
                <span className="text-slate-500 block">Nome do Empregado:</span>
                <strong className="text-slate-900">{employee.nome}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">CPF:</span>
                <strong className="text-slate-900 font-mono">{employee.cpf}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Matrícula / Registro:</span>
                <strong className="text-slate-900 font-mono">{employee.matricula}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Data de Admissão:</span>
                <strong className="text-slate-900">{formatDateBr(employee.dataAdmissao)}</strong>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500 block">Cargo / Função:</span>
                <strong className="text-slate-900">{employee.cargo}</strong>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500 block">Setor / Departamento:</span>
                <strong className="text-slate-900">{employee.departamento}</strong>
              </div>
            </div>
          </div>

          {/* Termo de Compromisso */}
          <div className="p-3 bg-slate-50 border border-slate-200 text-[10px] text-slate-700 leading-relaxed space-y-1">
            <strong className="block uppercase text-slate-900">Termo de Responsabilidade (NR-6):</strong>
            <p>
              Declaro que recebi gratuitamente da empresa os EPIs constantes nesta ficha, em perfeito estado de conservação e funcionamento.
              Comprometo-me a: a) usá-lo apenas para a finalidade a que se destina; b) responsabilizar-me pela sua guarda e conservação;
              c) comunicar imediatamente ao empregador qualquer alteração que o torne impróprio para uso; d) cumprir as determinações
              sobre o uso adequado; e e) devolver o equipamento por ocasião da substituição periódica ou rescisão contratual.
            </p>
          </div>

          {/* Table of items */}
          <div className="border border-slate-300 overflow-hidden">
            <table className="w-full text-left text-[11px] border-collapse">
              <thead className="bg-slate-100 border-b border-slate-300 font-bold uppercase text-[9px]">
                <tr>
                  <th className="p-2 border-r border-slate-300">Data</th>
                  <th className="p-2 border-r border-slate-300">Descrição do EPI</th>
                  <th className="p-2 border-r border-slate-300">Fabricante</th>
                  <th className="p-2 border-r border-slate-300">Nº C.A.</th>
                  <th className="p-2 border-r border-slate-300 text-center">Qtd</th>
                  <th className="p-2 border-r border-slate-300">Motivo</th>
                  <th className="p-2 border-r border-slate-300">Devolução</th>
                  <th className="p-2 text-center w-36">Assinatura do Empregado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {empDeliveries.map((del) => (
                  <tr key={del.id}>
                    <td className="p-2 border-r border-slate-200 font-mono whitespace-nowrap">
                      {formatDateBr(del.dataEntrega)}
                    </td>
                    <td className="p-2 border-r border-slate-200 font-medium">
                      {del.epiNome}
                    </td>
                    <td className="p-2 border-r border-slate-200">
                      {del.fabricante}
                    </td>
                    <td className="p-2 border-r border-slate-200 font-mono">
                      C.A. {del.numeroCA}
                    </td>
                    <td className="p-2 border-r border-slate-200 text-center font-mono">
                      {del.quantidade}
                    </td>
                    <td className="p-2 border-r border-slate-200 capitalize">
                      {del.motivo.replace('_', ' ')}
                    </td>
                    <td className="p-2 border-r border-slate-200 text-center">
                      {del.dataDevolucao ? formatDateBr(del.dataDevolucao) : '-'}
                    </td>
                    <td className="p-2 text-center text-[10px]">
                      {del.assinaturaUrl ? (
                        <div className="flex flex-col items-center justify-center">
                          <img src={del.assinaturaUrl} alt="Assinatura Digital" className="h-6 max-w-[110px] object-contain" />
                          <span className="text-[8px] text-emerald-800 font-mono font-medium">Assinado Digitalmente ({formatDateBr(del.assinadoEm?.split('T')[0] || del.dataEntrega)})</span>
                        </div>
                      ) : del.termoAssinado ? (
                        <span className="text-slate-600 font-medium">[Recibo Confirmado]</span>
                      ) : (
                        <span className="text-slate-400">_______________________</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Signatures */}
          <div className="pt-8 grid grid-cols-2 gap-8 text-center text-[11px]">
            <div className="border-t border-slate-800 pt-2 flex flex-col items-center">
              {empDeliveries.find((d) => d.assinaturaUrl)?.assinaturaUrl && (
                <img
                  src={empDeliveries.find((d) => d.assinaturaUrl)?.assinaturaUrl}
                  alt="Assinatura Digital"
                  className="h-10 max-w-[180px] object-contain -mt-6 mb-0.5"
                />
              )}
              <strong className="block text-slate-900">{employee.nome}</strong>
              <span className="text-slate-500">Assinatura do Empregado (CPF: {employee.cpf})</span>
            </div>

            <div className="border-t border-slate-800 pt-2">
              <strong className="block text-slate-900">{company.responsavelTecnico}</strong>
              <span className="text-slate-500">Responsável Técnico SESMT ({company.registroTecnico})</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
