import React, { useState } from 'react';
import { Menu, X, Users, AlertTriangle, ShieldCheck, PackageCheck, Plus, FileSpreadsheet, Settings, HardHat, Download, Building2, CheckCircle2, AlertCircle } from 'lucide-react';
import { CompanyInfo, EPIAlert, Funcionario } from '../types';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface HamburgerMenuProps {
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

export const HamburgerMenu: React.FC<HamburgerMenuProps> = ({
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
  const [isOpen, setIsOpen] = useState(false);
  const { isInstallable, isInstalled, install } = usePWAInstall();

  const criticalCount = alerts.filter((a) => a.severidade === 'critical').length;
  const warningCount = alerts.filter((a) => a.severidade === 'warning').length;
  const activeEmployees = employees.filter((e) => e.status === 'ativo').length;

  const handleSelectNav = (tab: 'funcionarios' | 'alertas' | 'catalogo') => {
    onSelectTab(tab);
    setIsOpen(false);
  };

  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  return (
    <>
      {/* Hamburger Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
        aria-label="Abrir Menu de Navegação"
        title="Menu Principal"
      >
        <Menu className="w-6 h-6 stroke-[2.2]" />
        <span className="hidden sm:inline text-xs font-semibold text-slate-200">Menu</span>
      </button>

      {/* Slide-over Drawer Backdrop & Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity cursor-pointer"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer Content */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-sm bg-slate-900 border-l border-slate-800 text-white flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
              {/* Drawer Header */}
              <div className="p-5 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-md">
                    <HardHat className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                      Gestor<span className="text-amber-400">EPI</span>
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono">NR-6</span>
                    </h3>
                    <p className="text-[11px] text-slate-400 truncate max-w-[180px]">
                      {company.razaoSocial}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  aria-label="Fechar Menu"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6 text-sm">
                {/* Navigation Sections */}
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Navegação
                  </p>

                  <button
                    onClick={() => handleSelectNav('funcionarios')}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer ${
                      currentTab === 'funcionarios'
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                        : 'text-slate-200 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5" />
                      <span>Controle Individual</span>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-mono ${
                        currentTab === 'funcionarios' ? 'bg-slate-950 text-amber-300' : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {activeEmployees}
                    </span>
                  </button>

                  <button
                    onClick={() => handleSelectNav('alertas')}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer ${
                      currentTab === 'alertas'
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                        : 'text-slate-200 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-400" />
                      <span>Alertas de Validade</span>
                    </div>
                    {criticalCount > 0 ? (
                      <span className="bg-rose-500 text-white text-xs px-2 py-0.5 rounded-full font-bold animate-pulse">
                        {criticalCount} Vencidos
                      </span>
                    ) : warningCount > 0 ? (
                      <span className="bg-amber-400 text-slate-950 text-xs px-2 py-0.5 rounded-full font-bold">
                        {warningCount}
                      </span>
                    ) : (
                      <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-0.5 rounded-full">
                        0
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => handleSelectNav('catalogo')}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer ${
                      currentTab === 'catalogo'
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                        : 'text-slate-200 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="w-5 h-5" />
                      <span>Catálogo & C.A.</span>
                    </div>
                  </button>
                </div>

                {/* Quick Action Buttons */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Ações Rápidas
                  </p>

                  <button
                    onClick={() => handleAction(onOpenNewDelivery)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all cursor-pointer shadow-sm"
                  >
                    <PackageCheck className="w-5 h-5" />
                    <span>Nova Entrega de EPI</span>
                  </button>

                  <button
                    onClick={() => handleAction(onOpenNewEmployee)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-medium transition-all cursor-pointer border border-slate-700"
                  >
                    <Plus className="w-5 h-5 text-amber-400" />
                    <span>Novo Colaborador</span>
                  </button>

                  <button
                    onClick={() => handleAction(onExportAllExcel)}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-all cursor-pointer shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <FileSpreadsheet className="w-5 h-5" />
                      <span>Exportar Geral Excel</span>
                    </div>
                    <span className="text-[10px] bg-emerald-700/80 px-1.5 py-0.5 rounded font-mono">.XLSX</span>
                  </button>
                </div>

                {/* PWA Install Trigger in Menu */}
                {!isInstalled && (
                  <div className="pt-2 border-t border-slate-800">
                    <button
                      onClick={async () => {
                        if (isInstallable) {
                          await install();
                          setIsOpen(false);
                        } else {
                          // Trigger native browser install or info
                          alert('Para instalar no celular ou PC: clique no botão "Instalar App" no topo ou use a opção "Adicionar à tela de início" do navegador.');
                        }
                      }}
                      className="w-full flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 text-amber-300 font-semibold border border-amber-500/30 transition-all cursor-pointer"
                    >
                      <Download className="w-5 h-5 text-amber-400" />
                      <div className="text-left">
                        <span className="block text-xs font-bold text-white">Instalar App no Dispositivo</span>
                        <span className="block text-[10px] text-slate-400">Funciona offline no celular e PC</span>
                      </div>
                    </button>
                  </div>
                )}

                {/* Company & SESMT details */}
                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Empresa & SESMT
                    </p>
                    <button
                      onClick={() => handleAction(onOpenCompanySettings)}
                      className="text-xs text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Settings className="w-3.5 h-3.5" />
                      <span>Configurações</span>
                    </button>
                  </div>

                  <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
                    <div className="font-semibold text-slate-200">{company.razaoSocial}</div>
                    <div className="font-mono text-slate-400 text-[11px]">CNPJ: {company.cnpj}</div>
                    <div className="text-slate-400 text-[11px] pt-1 border-t border-slate-700/60">
                      Resp: <strong className="text-slate-300">{company.responsavelTecnico}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-500">
                <span>GestorEPI • Versão PWA</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Conforme NR-6
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
