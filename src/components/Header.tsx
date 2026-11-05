import React from 'react';
import { ShieldCheck, HardHat, AlertTriangle, AlertCircle, CheckCircle2, FileSpreadsheet, Plus, Settings, Users, PackageCheck } from 'lucide-react';
import { CompanyInfo, EPIAlert, Funcionario } from '../types';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  company: CompanyInfo;
  employees: Funcionario[];
  activeDeliveriesCount: number;
  alerts: EPIAlert[];
  currentTab: 'funcionarios' | 'alertas' | 'catalogo';
  onSelectTab: (tab: 'funcionarios' | 'alertas' | 'catalogo') => void;
  onOpenNewEmployee: () => void;
  onOpenNewDelivery: () => void;
  onOpenCompanySettings: () => void;
  onExportAllExcel: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  company,
  employees,
  activeDeliveriesCount,
  alerts,
  currentTab,
  onSelectTab,
  onOpenNewEmployee,
  onOpenNewDelivery,
  onOpenCompanySettings,
  onExportAllExcel,
}) => {
  const criticalCount = alerts.filter((a) => a.severidade === 'critical').length;
  const warningCount = alerts.filter((a) => a.severidade === 'warning').length;
  const activeEmployees = employees.filter((e) => e.status === 'ativo').length;

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
      {/* Top Brand Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3 gap-3 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20 ring-2 ring-amber-400/30">
              <HardHat className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-white flex items-center gap-1.5">
                  Gestor<span className="text-amber-400">EPI</span>
                </span>
                <span className="bg-amber-500/20 text-amber-300 text-[11px] font-semibold px-2 py-0.5 rounded-full border border-amber-500/30">
                  NR-6 MTE
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate max-w-sm">
                {company.razaoSocial} • CNPJ: {company.cnpj}
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center flex-wrap gap-2">
            <PWAInstallButton />

            <button
              onClick={onOpenNewDelivery}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm rounded-lg shadow-sm transition-colors cursor-pointer"
              title="Registrar nova entrega de EPI para um colaborador"
            >
              <PackageCheck className="w-4 h-4" />
              <span>Nova Entrega</span>
            </button>

            <button
              onClick={onOpenNewEmployee}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 font-medium text-sm rounded-lg border border-slate-700 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 text-slate-300" />
              <span>Novo Colaborador</span>
            </button>

            <button
              onClick={onExportAllExcel}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm rounded-lg shadow-sm transition-colors cursor-pointer"
              title="Baixar planilha completa com todos os funcionários, histórico e alertas"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span className="hidden sm:inline">Exportar Geral</span>
              <span className="text-xs bg-emerald-700/60 px-1.5 py-0.5 rounded text-emerald-100">.XLSX</span>
            </button>

            <button
              onClick={onOpenCompanySettings}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Configurações da Empresa e SESMT"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation & Summary Metrics */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2.5 gap-3">
          {/* Tabs */}
          <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto">
            <button
              onClick={() => onSelectTab('funcionarios')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                currentTab === 'funcionarios'
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Controle Individual</span>
              <span className="bg-slate-800 text-slate-300 text-xs px-2 py-0.5 rounded-full font-mono">
                {activeEmployees}
              </span>
            </button>

            <button
              onClick={() => onSelectTab('alertas')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap relative ${
                currentTab === 'alertas'
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Alertas de Validade</span>
              {criticalCount > 0 ? (
                <span className="bg-rose-500 text-white text-xs px-2 py-0.5 rounded-full font-bold animate-pulse">
                  {criticalCount}
                </span>
              ) : warningCount > 0 ? (
                <span className="bg-amber-500 text-slate-950 text-xs px-2 py-0.5 rounded-full font-bold">
                  {warningCount}
                </span>
              ) : (
                <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-0.5 rounded-full font-semibold">
                  0
                </span>
              )}
            </button>

            <button
              onClick={() => onSelectTab('catalogo')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                currentTab === 'catalogo'
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Catálogo & C.A.</span>
            </button>
          </nav>

          {/* Quick Metrics Bar */}
          <div className="hidden lg:flex items-center gap-4 text-xs text-slate-300">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">EPIs Ativos:</span>
              <span className="font-semibold text-white font-mono">{activeDeliveriesCount}</span>
            </div>

            <div className="h-4 w-px bg-slate-800" />

            <div
              onClick={() => onSelectTab('alertas')}
              className="flex items-center gap-1.5 cursor-pointer hover:underline"
            >
              {criticalCount > 0 ? (
                <div className="flex items-center gap-1 text-rose-400 font-semibold">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{criticalCount} vencido(s)</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Sem vencidos</span>
                </div>
              )}
            </div>

            {warningCount > 0 && (
              <>
                <div className="h-4 w-px bg-slate-800" />
                <div
                  onClick={() => onSelectTab('alertas')}
                  className="flex items-center gap-1 text-amber-400 font-semibold cursor-pointer hover:underline"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{warningCount} a vencer (30d)</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
