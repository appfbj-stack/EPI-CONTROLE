import React, { useState } from 'react';
import { Search, UserPlus, FileSpreadsheet, Eye, Plus, AlertCircle, AlertTriangle, CheckCircle2, ShieldCheck, Briefcase, Building, CreditCard, ChevronRight, Filter } from 'lucide-react';
import { CompanyInfo, DeliveryRecord, EPIAlert, Funcionario } from '../types';
import { exportSingleEmployeeToExcel } from '../utils/excelExport';
import { getEmployeeAlertStatus } from '../utils/alerts';

interface EmployeeListProps {
  employees: Funcionario[];
  deliveries: DeliveryRecord[];
  alerts: EPIAlert[];
  company: CompanyInfo;
  onSelectEmployee: (emp: Funcionario) => void;
  onOpenNewEmployee: () => void;
  onOpenDeliveryForEmployee: (emp: Funcionario) => void;
}

export const EmployeeList: React.FC<EmployeeListProps> = ({
  employees,
  deliveries,
  alerts,
  company,
  onSelectEmployee,
  onOpenNewEmployee,
  onOpenDeliveryForEmployee,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'critical' | 'warning' | 'ok'>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Extract unique departments for filter
  const departments = Array.from(new Set(employees.map((e) => e.departamento).filter(Boolean)));

  const filteredEmployees = employees.filter((emp) => {
    // Search
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchName = emp.nome.toLowerCase().includes(term);
      const matchCpf = emp.cpf.includes(term);
      const matchMatricula = emp.matricula.toLowerCase().includes(term);
      const matchCargo = emp.cargo.toLowerCase().includes(term);
      const matchDepto = emp.departamento.toLowerCase().includes(term);
      if (!matchName && !matchCpf && !matchMatricula && !matchCargo && !matchDepto) return false;
    }

    // Department filter
    if (departmentFilter !== 'all' && emp.departamento !== departmentFilter) {
      return false;
    }

    // Status filter
    if (statusFilter !== 'all') {
      const { status } = getEmployeeAlertStatus(emp.id, alerts);
      if (status !== statusFilter) return false;
    }

    return true;
  });

  const handleDownloadExcel = (e: React.MouseEvent, emp: Funcionario) => {
    e.stopPropagation();
    exportSingleEmployeeToExcel(emp, deliveries, company);
  };

  return (
    <div className="space-y-5">
      {/* Search and Filters Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-500" />
              Controle Individual por Funcionário
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Gestão individual de entregas, termos de responsabilidade NR-6 e emissão de fichas em Excel.
            </p>
          </div>

          <button
            onClick={onOpenNewEmployee}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
          >
            <UserPlus className="w-4 h-4 text-amber-400" />
            <span>Cadastrar Colaborador</span>
          </button>
        </div>

        {/* Filter controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {/* Search box */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nome, CPF, matrícula ou cargo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
            />
          </div>

          {/* Department filter */}
          <div>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white cursor-pointer"
            >
              <option value="all">Todos os Setores ({departments.length})</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white cursor-pointer"
            >
              <option value="all">Todas as Situações</option>
              <option value="critical">Com EPIs Vencidos (Crítico)</option>
              <option value="warning">Com EPIs a Vencer (Atenção)</option>
              <option value="ok">100% Em Dia (Conforme)</option>
            </select>
          </div>
        </div>

        {/* Quick status count tags */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100 flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span>Mostrando <strong>{filteredEmployees.length}</strong> de <strong>{employees.length}</strong> colaboradores</span>
            {(searchTerm || departmentFilter !== 'all' || statusFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setDepartmentFilter('all');
                  setStatusFilter('all');
                }}
                className="text-amber-600 hover:text-amber-700 underline font-medium cursor-pointer ml-2"
              >
                Limpar filtros
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                viewMode === 'cards' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cards
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tabela
            </button>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filteredEmployees.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs">
          <div className="w-14 h-14 mx-auto rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
            <Search className="w-7 h-7" />
          </div>
          <h3 className="text-base font-semibold text-slate-800">Nenhum colaborador encontrado</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Nenhum registro corresponde aos filtros selecionados. Tente ajustar os termos de busca ou cadastre um novo colaborador.
          </p>
          <button
            onClick={onOpenNewEmployee}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            Cadastrar Colaborador Agora
          </button>
        </div>
      ) : viewMode === 'cards' ? (
        /* Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees.map((emp) => {
            const empDeliveries = deliveries.filter((d) => d.funcionarioId === emp.id);
            const activeEpis = empDeliveries.filter((d) => d.status === 'ativo');
            const alertInfo = getEmployeeAlertStatus(emp.id, alerts);

            return (
              <div
                key={emp.id}
                onClick={() => onSelectEmployee(emp)}
                className="bg-white rounded-xl border border-slate-200 hover:border-amber-400/80 hover:shadow-md transition-all p-5 flex flex-col justify-between cursor-pointer group relative overflow-hidden"
              >
                {/* Status Indicator Stripe */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1.5 ${
                    alertInfo.status === 'critical'
                      ? 'bg-rose-500'
                      : alertInfo.status === 'warning'
                      ? 'bg-amber-400'
                      : 'bg-emerald-500'
                  }`}
                />

                <div className="space-y-4 pt-1">
                  {/* Top: Avatar, Name, Matricula */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-800 to-slate-950 text-white font-bold text-base flex items-center justify-center shadow-xs ring-2 ring-slate-100 flex-shrink-0">
                        {emp.nome
                          .split(' ')
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join('')}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-900 group-hover:text-amber-600 transition-colors text-sm sm:text-base leading-snug truncate">
                          {emp.nome}
                        </h3>
                        <p className="text-xs font-mono text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                          <span>Mat: {emp.matricula}</span>
                          <span className="text-slate-300">•</span>
                          <span>CPF: {emp.cpf}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Role and Sector */}
                  <div className="bg-slate-50 rounded-lg p-2.5 space-y-1 border border-slate-100 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-700 font-medium truncate">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{emp.cargo}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500 truncate">
                      <Building className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{emp.departamento}</span>
                    </div>
                  </div>

                  {/* PPE Status and Alerts Badge */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="text-xs">
                      <span className="text-slate-500">EPIs em uso: </span>
                      <span className="font-bold text-slate-800 font-mono text-sm">{activeEpis.length}</span>
                    </div>

                    <div>
                      {alertInfo.status === 'critical' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {alertInfo.countCritical} VENCIDO(S)
                        </span>
                      ) : alertInfo.status === 'warning' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          {alertInfo.countWarning} a vencer (30d)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Conforme NR-6
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  {/* Download Excel Sheet - CORE REQUIREMENT */}
                  <button
                    onClick={(e) => handleDownloadExcel(e, emp)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-2xs"
                    title="Baixar a Ficha de EPI individual deste colaborador em formato Excel (.xlsx)"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span>Ficha Excel</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenDeliveryForEmployee(emp);
                    }}
                    className="inline-flex items-center justify-center p-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg transition-colors cursor-pointer"
                    title="Registrar nova entrega de EPI para este colaborador"
                  >
                    <Plus className="w-4 h-4 text-amber-700" />
                  </button>

                  <button
                    onClick={() => onSelectEmployee(emp)}
                    className="inline-flex items-center justify-center p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                    title="Visualizar ficha completa e histórico"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold tracking-wider">
                <tr>
                  <th className="py-3 px-4">Colaborador</th>
                  <th className="py-3 px-4">Matrícula / CPF</th>
                  <th className="py-3 px-4">Cargo & Setor</th>
                  <th className="py-3 px-4 text-center">EPIs Ativos</th>
                  <th className="py-3 px-4">Situação NR-6</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEmployees.map((emp) => {
                  const empDeliveries = deliveries.filter((d) => d.funcionarioId === emp.id);
                  const activeEpis = empDeliveries.filter((d) => d.status === 'ativo');
                  const alertInfo = getEmployeeAlertStatus(emp.id, alerts);

                  return (
                    <tr
                      key={emp.id}
                      onClick={() => onSelectEmployee(emp)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-slate-800 text-white font-bold text-xs flex items-center justify-center">
                            {emp.nome.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 block">{emp.nome}</span>
                            <span className="text-xs text-slate-400">{emp.email || 'Sem e-mail'}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-xs text-slate-600">
                        <div>Mat: {emp.matricula}</div>
                        <div className="text-slate-400">CPF: {emp.cpf}</div>
                      </td>

                      <td className="py-3.5 px-4 text-xs">
                        <div className="font-medium text-slate-800">{emp.cargo}</div>
                        <div className="text-slate-500">{emp.departamento}</div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-xs">
                          {activeEpis.length}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {alertInfo.status === 'critical' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700">
                            <AlertCircle className="w-3.5 h-3.5" />
                            {alertInfo.countCritical} Vencido(s)
                          </span>
                        ) : alertInfo.status === 'warning' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            {alertInfo.countWarning} a vencer (30d)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Conforme
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={(e) => handleDownloadExcel(e, emp)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                            title="Baixar Ficha Excel Individual"
                          >
                            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Excel</span>
                          </button>

                          <button
                            onClick={() => onOpenDeliveryForEmployee(emp)}
                            className="p-1.5 text-amber-700 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                            title="Nova Entrega"
                          >
                            <Plus className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onSelectEmployee(emp)}
                            className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Ver detalhes"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
