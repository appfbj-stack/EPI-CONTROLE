import React, { useState } from 'react';
import { X, UserPlus, UserCheck, Shield } from 'lucide-react';
import { Funcionario } from '../types';
import { getTodayStr } from '../utils/alerts';

interface EmployeeFormModalProps {
  employeeToEdit?: Funcionario | null;
  onClose: () => void;
  onSubmit: (data: Omit<Funcionario, 'id'>, id?: string) => void;
}

export const EmployeeFormModal: React.FC<EmployeeFormModalProps> = ({
  employeeToEdit,
  onClose,
  onSubmit,
}) => {
  const isEditing = !!employeeToEdit;

  const [nome, setNome] = useState(employeeToEdit?.nome || '');
  const [cpf, setCpf] = useState(employeeToEdit?.cpf || '');
  const [matricula, setMatricula] = useState(employeeToEdit?.matricula || '');
  const [cargo, setCargo] = useState(employeeToEdit?.cargo || '');
  const [departamento, setDepartamento] = useState(employeeToEdit?.departamento || '');
  const [dataAdmissao, setDataAdmissao] = useState(employeeToEdit?.dataAdmissao || getTodayStr());
  const [status, setStatus] = useState<Funcionario['status']>(employeeToEdit?.status || 'ativo');
  const [email, setEmail] = useState(employeeToEdit?.email || '');
  const [telefone, setTelefone] = useState(employeeToEdit?.telefone || '');

  // CPF formatter helper
  const handleCpfChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 11);
    let formatted = raw;
    if (raw.length > 9) {
      formatted = `${raw.slice(0, 3)}.${raw.slice(3, 6)}.${raw.slice(6, 9)}-${raw.slice(9)}`;
    } else if (raw.length > 6) {
      formatted = `${raw.slice(0, 3)}.${raw.slice(3, 6)}.${raw.slice(6)}`;
    } else if (raw.length > 3) {
      formatted = `${raw.slice(0, 3)}.${raw.slice(3)}`;
    }
    setCpf(formatted);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !cpf.trim() || !cargo.trim()) return;

    onSubmit(
      {
        nome: nome.trim(),
        cpf: cpf.trim(),
        matricula: matricula.trim() || `MAT-${Math.floor(1000 + Math.random() * 9000)}`,
        cargo: cargo.trim(),
        departamento: departamento.trim() || 'Operacional',
        dataAdmissao,
        status,
        email: email.trim() || undefined,
        telefone: telefone.trim() || undefined,
      },
      employeeToEdit?.id
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
              {isEditing ? <UserCheck className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                {isEditing ? 'Editar Dados do Colaborador' : 'Novo Colaborador'}
              </h3>
              <p className="text-xs text-slate-400">Cadastro de ficha individual de EPI</p>
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
              Nome Completo do Colaborador *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: João da Silva Santos"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                CPF *
              </label>
              <input
                type="text"
                required
                placeholder="000.000.000-00"
                value={cpf}
                onChange={(e) => handleCpfChange(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Matrícula / Registro
              </label>
              <input
                type="text"
                placeholder="Ex: BR-0150"
                value={matricula}
                onChange={(e) => setMatricula(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Cargo / Função *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Operador de Máquinas"
                value={cargo}
                onChange={(e) => setCargo(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Departamento / Setor *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Produção, Obras, Logística"
                value={departamento}
                onChange={(e) => setDepartamento(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Data de Admissão *
              </label>
              <input
                type="date"
                required
                value={dataAdmissao}
                onChange={(e) => setDataAdmissao(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Situação Cadastral
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
              >
                <option value="ativo">Ativo (Em Atividade)</option>
                <option value="afastado">Afastado / Licença</option>
                <option value="desligado">Desligado</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                E-mail (Opcional)
              </label>
              <input
                type="email"
                placeholder="colaborador@empresa.com.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Telefone (Opcional)
              </label>
              <input
                type="text"
                placeholder="(11) 90000-0000"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
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
              {isEditing ? <UserCheck className="w-4 h-4 text-amber-400" /> : <UserPlus className="w-4 h-4 text-amber-400" />}
              <span>{isEditing ? 'Salvar Alterações' : 'Salvar Colaborador'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
