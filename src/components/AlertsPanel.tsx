import React, { useState } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, FileSpreadsheet, RefreshCw, Search, ArrowRight, ShieldAlert, Clock, UserCheck } from 'lucide-react';
import { CompanyInfo, DeliveryRecord, EPIAlert, Funcionario } from '../types';
import { formatDateBr } from '../utils/alerts';
import { exportAlertsToExcel, exportSingleEmployeeToExcel } from '../utils/excelExport';

interface AlertsPanelProps {
  alerts: EPIAlert[];
  employees: Funcionario[];
  deliveries: DeliveryRecord[];
  company: CompanyInfo;
  onSelectEmployee: (emp: Funcionario) => void;
  onReplaceEPI: (alert: EPIAlert) => void;
}

export const AlertsPanel: React.FC<AlertsPanelProps> = ({
  alerts,
  employees,
  deliveries,
  company,
  onSelectEmployee,
  onReplaceEPI,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'critical' | 'warning'>('all');
  const [filterType, setFilterType] = useState<'all' | 'troca' | 'ca'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const criticalCount = alerts.filter((a) => a.severidade === 'critical').length;
  const warningCount = alerts.filter((a) => a.severidade === 'warning').length;
  const caAlertsCount = alerts.filter((a) => a.tipoAlerta.startsWith('ca_')).length;
  const trocaAlertsCount = alerts.filter((a) => a.tipoAlerta.startsWith('troca_')).length;

  const filteredAlerts = alerts.filter((alt) => {
    if (filterSeverity !== 'all' && alt.severidade !== filterSeverity) return false;
    if (filterType === 'troca' && !alt.tipoAlerta.startsWith('troca_')) return false;
    if (filterType === 'ca' && !alt.tipoAlerta.startsWith('ca_')) return false;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchName = alt.funcionarioNome.toLowerCase().includes(term);
      const matchEpi = alt.epiNome.toLowerCase().includes(term);
      const matchCA = alt.numeroCA.toLowerCase().includes(term);
      const matchDepto = alt.funcionarioDepto.toLowerCase().includes(term);
      if (!matchName && !matchEpi && !matchCA && !matchDepto) return false;
    }

    return true;
  });

  const handleDownloadEmployeeExcel = (funcionarioId: string) => {
    const emp = employees.find((e) => e.id === funcionarioId);
    if (emp) {
      exportSingleEmployeeToExcel(emp, deliveries, company);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 - Total */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Alertas Totais</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1 font-mono">{alerts.length}</h3>
            </div>
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3">Monitoramento automático contínuo</p>
        </div>

        {/* Card 2 - Críticos (Vencidos) */}
        <div
          onClick={() => setFilterSeverity(filterSeverity === 'critical' ? 'all' : 'critical')}
          className={`cursor-pointer transition-all rounded-xl border p-5 shadow-xs ${
            filterSeverity === 'critical'
              ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-500/20'
              : 'bg-white border-rose-200 hover:border-rose-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-rose-600 uppercase tracking-wider">Vencidos (Crítico)</p>
              <h3 className="text-2xl font-bold text-rose-700 mt-1 font-mono">{criticalCount}</h3>
            </div>
            <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center text-rose-600">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-rose-600 mt-3 font-medium">Exigem reposição ou descarte imediato</p>
        </div>

        {/* Card 3 - Atenção (A vencer) */}
        <div
          onClick={() => setFilterSeverity(filterSeverity === 'warning' ? 'all' : 'warning')}
          className={`cursor-pointer transition-all rounded-xl border p-5 shadow-xs ${
            filterSeverity === 'warning'
              ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-500/20'
              : 'bg-white border-amber-200 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider">A Vencer (em 30 dias)</p>
              <h3 className="text-2xl font-bold text-amber-800 mt-1 font-mono">{warningCount}</h3>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-amber-700 mt-3 font-medium">Planejamento prévio de compra</p>
        </div>

        {/* Card 4 - Validade do C.A. */}
        <div
          onClick={() => setFilterType(filterType === 'ca' ? 'all' : 'ca')}
          className={`cursor-pointer transition-all rounded-xl border p-5 shadow-xs ${
            filterType === 'ca'
              ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-500/20'
              : 'bg-white border-slate-200 hover:border-indigo-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">C.A. Ministério do Trabalho</p>
              <h3 className="text-2xl font-bold text-indigo-700 mt-1 font-mono">{caAlertsCount}</h3>
            </div>
            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3">Validade regulatória pelo MTE</p>
        </div>
      </div>

      {/* Main Alert List Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Header & Controls */}
        <div className="p-4 sm:p-5 border-b border-slate-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Painel de Alertas Automáticos de Validade
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Identificação automática de prazos de troca vencidos e certificados de aprovação (C.A.) irregulares.
              </p>
            </div>

            {alerts.length > 0 && (
              <button
                onClick={() => exportAlertsToExcel(alerts, company)}
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Exportar Alertas (.xlsx)</span>
              </button>
            )}
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por colaborador, EPI, CA ou setor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
              />
            </div>

            {/* Severity Pill Filters */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-slate-500 font-medium mr-1">Status:</span>
              <button
                onClick={() => setFilterSeverity('all')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  filterSeverity === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Todos ({alerts.length})
              </button>
              <button
                onClick={() => setFilterSeverity('critical')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                  filterSeverity === 'critical'
                    ? 'bg-rose-600 text-white'
                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                Vencidos ({criticalCount})
              </button>
              <button
                onClick={() => setFilterSeverity('warning')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                  filterSeverity === 'warning'
                    ? 'bg-amber-500 text-slate-950 font-semibold'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                A Vencer ({warningCount})
              </button>
            </div>
          </div>
        </div>

        {/* Alerts List */}
        {filteredAlerts.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-base font-semibold text-slate-800">
              {alerts.length === 0
                ? 'Nenhum alerta de vencimento ativo!'
                : 'Nenhum alerta corresponde aos filtros aplicados.'}
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              {alerts.length === 0
                ? 'Todos os EPIs entregues e seus respectivos Certificados de Aprovação (C.A.) estão dentro dos prazos de validade e conformidade com a NR-6.'
                : 'Tente alterar os filtros de status ou a busca por texto.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredAlerts.map((alt) => {
              const emp = employees.find((e) => e.id === alt.funcionarioId);
              const isCritical = alt.severidade === 'critical';

              return (
                <div
                  key={alt.id}
                  className={`p-4 sm:p-5 transition-colors hover:bg-slate-50/80 flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                    isCritical ? 'border-l-4 border-l-rose-500 bg-rose-50/15' : 'border-l-4 border-l-amber-400 bg-amber-50/10'
                  }`}
                >
                  <div className="space-y-1.5 flex-1">
                    {/* Badge and Type */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          isCritical
                            ? 'bg-rose-100 text-rose-700 border border-rose-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {isCritical ? <AlertCircle className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                        {isCritical ? 'URGENTE / VENCIDO' : 'ATENÇÃO / A VENCER'}
                      </span>

                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {alt.tipoAlerta.startsWith('ca_') ? 'Certificado C.A.' : 'Prazo de Uso / Troca'}
                      </span>

                      <span className="text-xs text-slate-400">•</span>

                      <span className="text-xs text-slate-500">
                        {alt.diasRestantes < 0
                          ? `Expirou há ${Math.abs(alt.diasRestantes)} dia(s)`
                          : alt.diasRestantes === 0
                          ? 'Expira hoje'
                          : `Faltam ${alt.diasRestantes} dia(s)`}
                      </span>
                    </div>

                    {/* Equipment and Employee */}
                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                      <h4 className="text-base font-bold text-slate-900">{alt.epiNome}</h4>
                      <span className="text-xs font-mono font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 w-fit">
                        C.A. {alt.numeroCA} (Val. CA: {formatDateBr(alt.validadeCA)})
                      </span>
                    </div>

                    {/* Alert Message */}
                    <p className="text-xs font-medium text-slate-700 bg-white/80 p-2 rounded border border-slate-200/70 inline-block">
                      {alt.mensagem}
                    </p>

                    {/* Employee Reference */}
                    <div className="flex items-center gap-3 text-xs text-slate-500 pt-1 flex-wrap">
                      <span className="flex items-center gap-1 font-medium text-slate-800">
                        <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                        {alt.funcionarioNome}
                      </span>
                      <span>•</span>
                      <span>{alt.funcionarioCargo}</span>
                      <span>•</span>
                      <span>Setor: {alt.funcionarioDepto}</span>
                      <span>•</span>
                      <span>Entregue em: {formatDateBr(alt.dataEntrega)}</span>
                      <span>•</span>
                      <span>Limite de Troca: {formatDateBr(alt.dataPrevisaoTroca)}</span>
                    </div>
                  </div>

                  {/* Actions for this specific alert */}
                  <div className="flex items-center gap-2 self-start lg:self-center flex-wrap">
                    <button
                      onClick={() => onReplaceEPI(alt)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
                      title="Registrar substituição deste EPI para o colaborador"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Substituir EPI</span>
                    </button>

                    <button
                      onClick={() => handleDownloadEmployeeExcel(alt.funcionarioId)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-medium rounded-lg transition-colors cursor-pointer"
                      title="Baixar a Ficha individual deste colaborador em Excel"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Ficha Individual (.xlsx)</span>
                    </button>

                    {emp && (
                      <button
                        onClick={() => onSelectEmployee(emp)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs font-medium rounded-lg transition-colors cursor-pointer"
                        title="Abrir ficha e histórico completo do colaborador"
                      >
                        <span>Ver Ficha</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
