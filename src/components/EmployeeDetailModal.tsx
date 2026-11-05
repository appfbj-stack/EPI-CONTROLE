import React, { useState } from 'react';
import { X, FileSpreadsheet, Printer, PackageCheck, RefreshCw, Undo2, AlertCircle, AlertTriangle, CheckCircle2, Shield, Calendar, User, Briefcase, Building, CreditCard, Clock, FileCheck } from 'lucide-react';
import { CompanyInfo, DeliveryRecord, EPIAlert, Funcionario, PPEItem } from '../types';
import { exportSingleEmployeeToExcel } from '../utils/excelExport';
import { formatDateBr, getDaysDiff } from '../utils/alerts';

interface EmployeeDetailModalProps {
  employee: Funcionario;
  deliveries: DeliveryRecord[];
  alerts: EPIAlert[];
  catalog: PPEItem[];
  company: CompanyInfo;
  onClose: () => void;
  onOpenDelivery: (emp: Funcionario, defaultPPEId?: string) => void;
  onOpenReturn: (delivery: DeliveryRecord) => void;
  onPrintSheet: (emp: Funcionario) => void;
  onEditEmployee: (emp: Funcionario) => void;
  onToggleSignature: (deliveryId: string) => void;
}

export const EmployeeDetailModal: React.FC<EmployeeDetailModalProps> = ({
  employee,
  deliveries,
  alerts,
  catalog,
  company,
  onClose,
  onOpenDelivery,
  onOpenReturn,
  onPrintSheet,
  onEditEmployee,
  onToggleSignature,
}) => {
  const [activeTab, setActiveTab] = useState<'ativos' | 'historico' | 'termo'>('ativos');

  const empDeliveries = deliveries
    .filter((d) => d.funcionarioId === employee.id)
    .sort((a, b) => (a.dataEntrega < b.dataEntrega ? 1 : -1));

  const activeDeliveries = empDeliveries.filter((d) => d.status === 'ativo');
  const pastDeliveries = empDeliveries.filter((d) => d.status !== 'ativo');

  const empAlerts = alerts.filter((a) => a.funcionarioId === employee.id);
  const criticalCount = empAlerts.filter((a) => a.severidade === 'critical').length;
  const warningCount = empAlerts.filter((a) => a.severidade === 'warning').length;

  const handleDownloadExcel = () => {
    exportSingleEmployeeToExcel(employee, deliveries, company);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Top Header */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 flex items-start justify-between gap-4 border-b border-slate-800">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 font-black text-xl flex items-center justify-center shadow-lg ring-4 ring-slate-800 flex-shrink-0">
              {employee.nome
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold tracking-tight text-white">{employee.nome}</h2>
                <span className="bg-slate-800 text-slate-300 font-mono text-xs px-2.5 py-0.5 rounded-full border border-slate-700">
                  Mat: {employee.matricula}
                </span>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    employee.status === 'ativo'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {employee.status.toUpperCase()}
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
                <span className="flex items-center gap-1.5 text-slate-200 font-medium">
                  <Briefcase className="w-3.5 h-3.5 text-amber-400" />
                  {employee.cargo}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  {employee.departamento}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5 font-mono">
                  <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                  CPF: {employee.cpf}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Admissão: {formatDateBr(employee.dataAdmissao)}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Action Bar (Download Excel, Print, Deliver) */}
        <div className="bg-slate-50 border-b border-slate-200 p-3 sm:px-6 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            {/* CORE EXCEL DOWNLOAD BUTTON */}
            <button
              onClick={handleDownloadExcel}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm rounded-lg shadow-xs transition-colors cursor-pointer"
              title="Baixar a ficha individual completa do colaborador em formato Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Baixar Ficha em Excel</span>
              <span className="bg-emerald-700/80 text-[10px] px-1.5 py-0.5 rounded font-mono">.XLSX</span>
            </button>

            <button
              onClick={() => onPrintSheet(employee)}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-medium text-xs sm:text-sm rounded-lg shadow-2xs transition-colors cursor-pointer"
              title="Imprimir ou gerar PDF oficial com campo de assinaturas da NR-6"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>Imprimir Ficha NR-6</span>
            </button>

            <button
              onClick={() => onOpenDelivery(employee)}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm rounded-lg shadow-xs transition-colors cursor-pointer"
              title="Entregar novo EPI para este colaborador"
            >
              <PackageCheck className="w-4 h-4" />
              <span>Entregar EPI</span>
            </button>
          </div>

          <button
            onClick={() => onEditEmployee(employee)}
            className="text-xs text-slate-600 hover:text-slate-900 font-medium underline cursor-pointer px-2 py-1"
          >
            Editar Colaborador
          </button>
        </div>

        {/* Safety Status Notification Bar */}
        {(criticalCount > 0 || warningCount > 0) && (
          <div
            className={`p-3 px-6 text-xs flex items-center justify-between gap-3 ${
              criticalCount > 0
                ? 'bg-rose-50 text-rose-800 border-b border-rose-200'
                : 'bg-amber-50 text-amber-800 border-b border-amber-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {criticalCount > 0 ? (
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              )}
              <span>
                <strong>Atenção de Segurança:</strong>{' '}
                {criticalCount > 0 && `${criticalCount} EPI(s) com prazo vencido ou C.A. irregular! `}
                {warningCount > 0 && `${warningCount} EPI(s) prestes a vencer nos próximos 30 dias.`}
              </span>
            </div>
            <button
              onClick={() => onOpenDelivery(employee)}
              className="text-xs font-bold underline cursor-pointer"
            >
              Substituir Agora
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-slate-200 px-6 pt-3 flex items-center gap-6 text-sm font-medium">
          <button
            onClick={() => setActiveTab('ativos')}
            className={`pb-3 relative flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === 'ativos'
                ? 'text-amber-600 font-bold border-b-2 border-amber-500'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>EPIs em Uso Ativo</span>
            <span className="bg-slate-100 text-slate-700 text-xs px-2 py-0.5 rounded-full font-mono font-semibold">
              {activeDeliveries.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('historico')}
            className={`pb-3 relative flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === 'historico'
                ? 'text-amber-600 font-bold border-b-2 border-amber-500'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Histórico de Baixas & Devoluções</span>
            <span className="bg-slate-100 text-slate-700 text-xs px-2 py-0.5 rounded-full font-mono">
              {pastDeliveries.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('termo')}
            className={`pb-3 relative flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === 'termo'
                ? 'text-amber-600 font-bold border-b-2 border-amber-500'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileCheck className="w-4 h-4 text-slate-500" />
            <span>Termo de Responsabilidade NR-6</span>
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'ativos' && (
            <div className="space-y-3">
              {activeDeliveries.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                  <Shield className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700">Nenhum EPI em posse no momento</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Este colaborador não possui nenhum equipamento ativo registrado. Clique abaixo para realizar uma entrega inicial.
                  </p>
                  <button
                    onClick={() => onOpenDelivery(employee)}
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    <PackageCheck className="w-4 h-4" />
                    Registrar Entrega de EPI
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {activeDeliveries.map((del) => {
                    const daysTroca = getDaysDiff(del.dataPrevisaoTroca);
                    const isTrocaVencida = daysTroca < 0;
                    const isTrocaQuase = daysTroca >= 0 && daysTroca <= 30;

                    const daysCA = del.validadeCA ? getDaysDiff(del.validadeCA) : 999;
                    const isCAVencido = daysCA < 0;
                    const isCAQuase = daysCA >= 0 && daysCA <= 45;

                    return (
                      <div
                        key={del.id}
                        className={`rounded-xl border p-4 transition-all shadow-xs ${
                          isTrocaVencida || isCAVencido
                            ? 'bg-rose-50/40 border-rose-300'
                            : isTrocaQuase || isCAQuase
                            ? 'bg-amber-50/30 border-amber-300'
                            : 'bg-white border-slate-200'
                        }`}
                      >
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-bold text-slate-900 text-base">{del.epiNome}</h4>
                              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                                C.A. {del.numeroCA}
                              </span>
                              <span className="text-xs text-slate-500">Qtd: <strong>{del.quantidade}</strong></span>
                              <span className="text-xs text-slate-400">•</span>
                              <span className="text-xs text-slate-500">Fabricante: {del.fabricante}</span>
                            </div>

                            {/* Alert badges */}
                            <div className="flex items-center gap-2 flex-wrap text-xs">
                              {/* Troca status */}
                              {isTrocaVencida ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold bg-rose-100 text-rose-700 border border-rose-200">
                                  <AlertCircle className="w-3.5 h-3.5" />
                                  Troca Vencida há {Math.abs(daysTroca)} dias!
                                </span>
                              ) : isTrocaQuase ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                  <Clock className="w-3.5 h-3.5" />
                                  Troca em {daysTroca} dia(s)
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-emerald-700 bg-emerald-50 border border-emerald-200">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Uso regular ({daysTroca} dias restantes)
                                </span>
                              )}

                              {/* CA status */}
                              {isCAVencido ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold bg-rose-200 text-rose-900">
                                  C.A. Vencido no MTE ({formatDateBr(del.validadeCA)})
                                </span>
                              ) : isCAQuase ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-medium bg-amber-200 text-amber-900">
                                  C.A. vence em {daysCA} dias ({formatDateBr(del.validadeCA)})
                                </span>
                              ) : (
                                <span className="text-slate-500">
                                  Validade C.A.: {formatDateBr(del.validadeCA)}
                                </span>
                              )}
                            </div>

                            {/* Dates details */}
                            <div className="text-xs text-slate-500 flex items-center gap-4 flex-wrap pt-1">
                              <span>Data de Entrega: <strong>{formatDateBr(del.dataEntrega)}</strong></span>
                              <span>•</span>
                              <span>Data Limite de Troca: <strong>{formatDateBr(del.dataPrevisaoTroca)}</strong></span>
                              <span>•</span>
                              <span>Motivo: <strong>{del.motivo}</strong></span>
                            </div>

                            {/* Signature status */}
                            <div className="flex items-center gap-2 pt-1">
                              <button
                                onClick={() => onToggleSignature(del.id)}
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium cursor-pointer transition-colors ${
                                  del.termoAssinado
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                    : 'bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200'
                                }`}
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>
                                  {del.termoAssinado
                                    ? `Recibo Assinado (${formatDateBr(del.assinadoEm?.split('T')[0] || del.dataEntrega)})`
                                    : 'Assinatura Pendente (Clique para confirmar recebimento)'}
                                </span>
                              </button>
                            </div>
                          </div>

                          {/* Item Actions */}
                          <div className="flex items-center gap-2 self-start md:self-center flex-shrink-0">
                            <button
                              onClick={() => onOpenDelivery(employee, del.epiId)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                              title="Substituir por um novo equipamento"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              <span>Substituir</span>
                            </button>

                            <button
                              onClick={() => onOpenReturn(del)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors cursor-pointer"
                              title="Registrar devolução ou descarte"
                            >
                              <Undo2 className="w-3.5 h-3.5" />
                              <span>Devolver / Baixa</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'historico' && (
            <div className="space-y-3">
              {pastDeliveries.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-xs text-slate-500">Nenhum registro de devolução ou baixa anterior.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                  {pastDeliveries.map((del) => (
                    <div key={del.id} className="p-4 flex items-center justify-between text-xs gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{del.epiNome}</span>
                          <span className="font-mono text-slate-500">C.A. {del.numeroCA}</span>
                          <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                            {del.status === 'devolvido' ? 'Devolvido' : del.status === 'descartado' ? 'Descartado' : 'Substituído'}
                          </span>
                        </div>
                        <div className="text-slate-500 flex items-center gap-3">
                          <span>Entregue: {formatDateBr(del.dataEntrega)}</span>
                          <span>•</span>
                          <span>Baixa em: {formatDateBr(del.dataDevolucao)}</span>
                          {del.motivoDevolucao && (
                            <>
                              <span>•</span>
                              <span>Motivo: {del.motivoDevolucao}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'termo' && (
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-4 leading-relaxed">
              <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider border-b border-slate-200 pb-2">
                Termo de Responsabilidade e Guarda de EPI (NR-6 - Item 6.7.1)
              </h4>
              <p>
                O empregado declara ter recebido da empresa <strong>{company.razaoSocial}</strong> (CNPJ: {company.cnpj}),
                a título de empréstimo gratuito para seu uso exclusivo e obrigatório no exercício de suas atividades funcionais,
                os Equipamentos de Proteção Individual (EPI) constantes nesta ficha de controle individual, novos e em perfeitas condições de uso.
              </p>
              <div className="space-y-1.5 pl-4 border-l-2 border-amber-500">
                <p><strong>Compromissos do Empregado (NR-6 Item 6.7.1):</strong></p>
                <p>a) Usar o EPI fornecido apenas para a finalidade a que se destina;</p>
                <p>b) Responsabilizar-se pela sua guarda, higienização e conservação;</p>
                <p>c) Comunicar imediatamente ao SESMT / Empregador qualquer alteração ou dano que o torne impróprio para uso;</p>
                <p>d) Cumprir as determinações do empregador sobre o uso adequado;</p>
                <p>e) Devolver o EPI por ocasião da substituição periódica ou rescisão do contrato de trabalho.</p>
              </div>
              <p className="text-slate-500 italic">
                O não uso injustificado constitui ato faltoso passível das sanções disciplinares previstas no Artigo 482 da CLT.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-100 border-t border-slate-200 p-4 px-6 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Ficha Individual vinculada ao responsável técnico: <strong>{company.responsavelTecnico}</strong> ({company.registroTecnico})
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-lg transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
