import React, { useState } from 'react';
import { Plus, Search, ShieldCheck, AlertCircle, AlertTriangle, CheckCircle2, Edit2, Trash2, Shield, Calendar, Clock } from 'lucide-react';
import { PPEItem } from '../types';
import { formatDateBr, getDaysDiff, getTodayStr } from '../utils/alerts';

interface PPECatalogProps {
  catalog: PPEItem[];
  onSaveItem: (item: Omit<PPEItem, 'id'>, id?: string) => void;
  onDeleteItem: (id: string) => void;
}

const CATEGORY_NAMES: Record<string, string> = {
  cabeca: 'Proteção da Cabeça',
  auditiva: 'Proteção Auditiva',
  visual_facial: 'Proteção Visual e Facial',
  respiratoria: 'Proteção Respiratória',
  maos_bracos: 'Membros Superiores (Mãos e Braços)',
  pernas_pes: 'Membros Inferiores (Pernas e Pés)',
  corpo_queda: 'Proteção contra Quedas (NR-35)',
};

export const PPECatalog: React.FC<PPECatalogProps> = ({ catalog, onSaveItem, onDeleteItem }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PPEItem | null>(null);

  // Form states
  const [nome, setNome] = useState('');
  const [categoria, setCategoria] = useState<PPEItem['categoria']>('cabeca');
  const [fabricante, setFabricante] = useState('');
  const [modelo, setModelo] = useState('');
  const [numeroCA, setNumeroCA] = useState('');
  const [validadeCA, setValidadeCA] = useState(getTodayStr());
  const [vidaUtilDias, setVidaUtilDias] = useState(90);
  const [descricao, setDescricao] = useState('');
  const [instrucoesUso, setInstrucoesUso] = useState('');

  const openNewModal = () => {
    setEditingItem(null);
    setNome('');
    setCategoria('cabeca');
    setFabricante('');
    setModelo('');
    setNumeroCA('');
    setValidadeCA(getTodayStr());
    setVidaUtilDias(90);
    setDescricao('');
    setInstrucoesUso('');
    setIsModalOpen(true);
  };

  const openEditModal = (item: PPEItem) => {
    setEditingItem(item);
    setNome(item.nome);
    setCategoria(item.categoria);
    setFabricante(item.fabricante);
    setModelo(item.modelo);
    setNumeroCA(item.numeroCA);
    setValidadeCA(item.validadeCA);
    setVidaUtilDias(item.vidaUtilDias);
    setDescricao(item.descricao || '');
    setInstrucoesUso(item.instrucoesUso || '');
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !numeroCA.trim()) return;

    onSaveItem(
      {
        nome: nome.trim(),
        categoria,
        fabricante: fabricante.trim() || 'Fabricante Homologado',
        modelo: modelo.trim() || 'Padrão',
        numeroCA: numeroCA.trim(),
        validadeCA,
        vidaUtilDias: Number(vidaUtilDias) || 90,
        descricao: descricao.trim() || undefined,
        instrucoesUso: instrucoesUso.trim() || undefined,
      },
      editingItem?.id
    );

    setIsModalOpen(false);
  };

  const filteredItems = catalog.filter((item) => {
    if (categoryFilter !== 'all' && item.categoria !== categoryFilter) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchName = item.nome.toLowerCase().includes(term);
      const matchCA = item.numeroCA.toLowerCase().includes(term);
      const matchFab = item.fabricante.toLowerCase().includes(term);
      if (!matchName && !matchCA && !matchFab) return false;
    }
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Search and Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-500" />
              Catálogo de EPIs & Certificados de Aprovação (C.A.)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Cadastro de equipamentos padronizados, periodicidade de troca e validade dos Certificados de Aprovação (MTE).
            </p>
          </div>

          <button
            onClick={openNewModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Cadastrar Novo EPI</span>
          </button>
        </div>

        {/* Filter controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nome do EPI, número do C.A. ou fabricante..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
            />
          </div>

          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white cursor-pointer"
            >
              <option value="all">Todas as Categorias ({catalog.length})</option>
              {Object.entries(CATEGORY_NAMES).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => {
          const daysCA = getDaysDiff(item.validadeCA);
          const isCAExpired = daysCA < 0;
          const isCANear = daysCA >= 0 && daysCA <= 45;

          return (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden"
            >
              {/* Category indicator */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded">
                    {CATEGORY_NAMES[item.categoria] || item.categoria}
                  </span>

                  <span className="font-mono text-xs font-bold text-slate-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                    C.A. {item.numeroCA}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm leading-snug">{item.nome}</h3>

                <p className="text-xs text-slate-500">
                  Fabricante: <strong>{item.fabricante}</strong> • {item.modelo}
                </p>

                {item.descricao && (
                  <p className="text-xs text-slate-600 line-clamp-2 bg-slate-50 p-2 rounded border border-slate-100">
                    {item.descricao}
                  </p>
                )}

                {/* Validade C.A. & Periodicidade */}
                <div className="pt-2 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      Vida útil média:
                    </span>
                    <strong className="text-slate-800 font-mono">{item.vidaUtilDias} dias</strong>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Validade do C.A.:
                    </span>
                    <strong className="font-mono">{formatDateBr(item.validadeCA)}</strong>
                  </div>

                  {/* CA Status Badge */}
                  <div className="pt-1">
                    {isCAExpired ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                        <AlertCircle className="w-3.5 h-3.5" />
                        C.A. Vencido no MTE há {Math.abs(daysCA)} dias
                      </span>
                    ) : isCANear ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        C.A. vence em {daysCA} dias
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        C.A. Regular e Vigente
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => openEditModal(item)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded text-xs font-medium cursor-pointer transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Editar</span>
                </button>

                <button
                  onClick={() => {
                    if (confirm(`Deseja remover "${item.nome}" do catálogo?`)) {
                      onDeleteItem(item.id);
                    }
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded text-xs font-medium cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Excluir</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Add/Edit PPE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
              <h3 className="font-bold text-base text-white">
                {editingItem ? 'Editar Equipamento de Proteção' : 'Cadastrar Novo EPI'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Nome do EPI *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Luva de Vaqueta Cano Longo"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Categoria *
                  </label>
                  <select
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  >
                    {Object.entries(CATEGORY_NAMES).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Nº do C.A. (MTE) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 41419"
                    value={numeroCA}
                    onChange={(e) => setNumeroCA(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Fabricante
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 3M, Danny, MSA"
                    value={fabricante}
                    onChange={(e) => setFabricante(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Modelo
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: V-Gard 500"
                    value={modelo}
                    onChange={(e) => setModelo(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Validade do C.A. *
                  </label>
                  <input
                    type="date"
                    required
                    value={validadeCA}
                    onChange={(e) => setValidadeCA(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Vida Útil Estimada (Dias) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="3650"
                    required
                    value={vidaUtilDias}
                    onChange={(e) => setVidaUtilDias(Math.max(1, parseInt(e.target.value) || 30))}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Descrição Técnica / Finalidade
                </label>
                <textarea
                  rows={2}
                  placeholder="Finalidade de proteção e riscos cobertos..."
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg shadow-sm cursor-pointer"
                >
                  Salvar no Catálogo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
