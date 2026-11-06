import { CompanyInfo, DeliveryRecord, Funcionario, PPEItem } from '../types';
import { addDaysToDate, getTodayStr } from './alerts';

const STORAGE_KEYS = {
  EMPLOYEES: 'gestorepi_funcionarios_v1',
  PPE_ITEMS: 'gestorepi_catalogo_v1',
  DELIVERIES: 'gestorepi_entregas_v1',
  COMPANY: 'gestorepi_empresa_v1',
};

const defaultCompany: CompanyInfo = {
  razaoSocial: 'Construtora & Engenharia Brasil S.A.',
  nomeFantasia: 'Brasil Engenharia',
  cnpj: '12.345.678/0001-90',
  endereco: 'Av. Industrial das Nações, 1500 - Galpão 04',
  cidadeUf: 'São Paulo - SP',
  responsavelTecnico: 'Carlos Eduardo Ferreira',
  registroTecnico: 'Téc. Seg. Trab. MTE nº 004521/SP',
};

const today = getTodayStr();

// Create realistic initial EPI catalog
const defaultPPEItems: PPEItem[] = [
  {
    id: 'epi-1',
    nome: 'Capacete de Segurança com Jugular Aba Frontal Classe B',
    categoria: 'cabeca',
    fabricante: 'MSA do Brasil',
    modelo: 'V-Gard com Suspensão Push-Key',
    numeroCA: '498',
    validadeCA: addDaysToDate(today, 380),
    vidaUtilDias: 365,
    descricao: 'Proteção craniana contra impactos de objetos volantes e choques elétricos.',
    instrucoesUso: 'Ajustar carneira firmemente à cabeça. Inspecionar fissuras antes do uso.',
  },
  {
    id: 'epi-2',
    nome: 'Óculos de Segurança Antirrisco e Antiembaçante Incolor',
    categoria: 'visual_facial',
    fabricante: '3M do Brasil',
    modelo: 'Virtua CCS',
    numeroCA: '12572',
    validadeCA: addDaysToDate(today, 540),
    vidaUtilDias: 90,
    descricao: 'Proteção dos olhos contra luminosidade e impactos de partículas multidirecionais.',
    instrucoesUso: 'Lavar com água e sabão neutro. Não usar solventes.',
  },
  {
    id: 'epi-3',
    nome: 'Protetor Auditivo Tipo Plug de Silicone (Cordão)',
    categoria: 'auditiva',
    fabricante: '3M do Brasil',
    modelo: '1110 NRRsf 16dB',
    numeroCA: '5674',
    validadeCA: addDaysToDate(today, 20), // CA Prestes a vencer (20 dias)
    vidaUtilDias: 30,
    descricao: 'Atenuação acústica contra ruídos contínuos e intermitentes.',
    instrucoesUso: 'Higienizar diariamente. Substituir ao menor sinal de endurecimento.',
  },
  {
    id: 'epi-4',
    nome: 'Protetor Auditivo Tipo Concha / Abafador',
    categoria: 'auditiva',
    fabricante: 'Honeywell',
    modelo: 'Thunder T3 NRRsf 24dB',
    numeroCA: '34414',
    validadeCA: addDaysToDate(today, 600),
    vidaUtilDias: 365,
    descricao: 'Abafador acústico para ambientes de alto nível de pressão sonora.',
    instrucoesUso: 'Limpar almofadas com pano úmido. Substituir almofadas semestralmente.',
  },
  {
    id: 'epi-5',
    nome: 'Luva de Vaqueta Mista Cano Curto',
    categoria: 'maos_bracos',
    fabricante: 'Danny EPI',
    modelo: 'Vaqueta Total Punho 7cm',
    numeroCA: '14321',
    validadeCA: addDaysToDate(today, 400),
    vidaUtilDias: 45,
    descricao: 'Proteção das mãos contra abrasão, cortes superficiais e agentes mecânicos.',
    instrucoesUso: 'Armazenar em local seco e arejado. Proibido lavar em máquina.',
  },
  {
    id: 'epi-6',
    nome: 'Calçado de Segurança Bota de Couro com Bico de Aço',
    categoria: 'pernas_pes',
    fabricante: 'Marluvas',
    modelo: '50B26 Aço Solado PU Bidensidade',
    numeroCA: '41419',
    validadeCA: addDaysToDate(today, -15), // CA VENCIDO pelo MTE
    vidaUtilDias: 180,
    descricao: 'Proteção contra queda de objetos pesados sobre os artelhos e perfurações.',
    instrucoesUso: 'Engraxar periodicamente. Não secar diretamente ao sol ou fontes de calor.',
  },
  {
    id: 'epi-7',
    nome: 'Respirador Semifacial Descartável PFF2 / N95 com Válvula',
    categoria: 'respiratoria',
    fabricante: 'Delta Plus',
    modelo: 'M1200VW PFF2',
    numeroCA: '38504',
    validadeCA: addDaysToDate(today, 300),
    vidaUtilDias: 10,
    descricao: 'Proteção respiratória contra poeiras, névoas tóxicas e fumos metálicos.',
    instrucoesUso: 'Descartar ao término da vida útil ou quando a respiração ficar pesada.',
  },
  {
    id: 'epi-8',
    nome: 'Cinturão de Segurança Tipo Paraquedista com Talabarte Duplo Y',
    categoria: 'corpo_queda',
    fabricante: 'Carbografite',
    modelo: 'CG 780 4 Pontos',
    numeroCA: '35698',
    validadeCA: addDaysToDate(today, 720),
    vidaUtilDias: 730,
    descricao: 'Equipamento essencial para trabalhos em altura acima de 2 metros (NR-35).',
    instrucoesUso: 'Inspecionar fitas, costuras e mosquetões antes de cada subida.',
  },
];

const defaultEmployees: Funcionario[] = [
  {
    id: 'func-1',
    nome: 'Marcos Vinicius Santos Pereira',
    cpf: '234.567.890-12',
    matricula: 'BR-0104',
    cargo: 'Pedreiro de Alvenaria',
    departamento: 'Obras & Construção',
    dataAdmissao: '2025-03-10',
    status: 'ativo',
    email: 'marcos.santos@brasileng.com.br',
    telefone: '(11) 98765-4321',
  },
  {
    id: 'func-2',
    nome: 'Juliana Aparecida de Souza',
    cpf: '345.678.901-23',
    matricula: 'BR-0109',
    cargo: 'Eletricista de Manutenção Industrial',
    departamento: 'Manutenção Elétrica',
    dataAdmissao: '2025-01-15',
    status: 'ativo',
    email: 'juliana.souza@brasileng.com.br',
    telefone: '(11) 97654-3210',
  },
  {
    id: 'func-3',
    nome: 'Roberto Carlos de Albuquerque',
    cpf: '456.789.012-34',
    matricula: 'BR-0082',
    cargo: 'Soldador Montador',
    departamento: 'Caldeiraria & Solda',
    dataAdmissao: '2024-08-01',
    status: 'ativo',
    email: 'roberto.carlos@brasileng.com.br',
    telefone: '(11) 99123-4567',
  },
  {
    id: 'func-4',
    nome: 'Fernanda Lima Duarte',
    cpf: '567.890.123-45',
    matricula: 'BR-0145',
    cargo: 'Operadora de Empilhadeira',
    departamento: 'Logística & Expedição',
    dataAdmissao: '2025-06-20',
    status: 'ativo',
    email: 'fernanda.duarte@brasileng.com.br',
    telefone: '(11) 98456-7890',
  },
  {
    id: 'func-5',
    nome: 'Anderson Ribeiro Silva',
    cpf: '678.901.234-56',
    matricula: 'BR-0188',
    cargo: 'Auxiliar de Serviços Gerais',
    departamento: 'Limpeza & Apoio',
    dataAdmissao: '2026-02-01',
    status: 'ativo',
    email: 'anderson.silva@brasileng.com.br',
    telefone: '(11) 97321-6549',
  },
];

// Seed deliveries showcasing different states:
// - Marcos: Troca de luva vencida há 5 dias!
// - Roberto: Bota com CA vencido!
// - Juliana: Protetor auricular vence em 10 dias (atenção)!
// - Fernanda: Tudo em dia!
// - Anderson: Recém admitido, tudo novo!
const defaultDeliveries: DeliveryRecord[] = [
  // Marcos Vinicius
  {
    id: 'del-1',
    funcionarioId: 'func-1',
    epiId: 'epi-1',
    epiNome: 'Capacete de Segurança com Jugular Aba Frontal Classe B',
    numeroCA: '498',
    fabricante: 'MSA do Brasil',
    quantidade: 1,
    dataEntrega: addDaysToDate(today, -120),
    dataPrevisaoTroca: addDaysToDate(today, 245),
    validadeCA: addDaysToDate(today, 380),
    motivo: 'admissao',
    status: 'ativo',
    termoAssinado: true,
    assinadoEm: addDaysToDate(today, -120),
    assinaturaUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60" viewBox="0 0 200 60"><path d="M 20 40 Q 45 10 70 35 T 110 25 T 150 35 Q 170 15 185 30 M 40 28 L 160 42" stroke="%230f172a" stroke-width="2.8" fill="none" stroke-linecap="round"/></svg>',
    assinanteNome: 'Marcos Vinicius Santos Pereira',
  },
  {
    id: 'del-2',
    funcionarioId: 'func-1',
    epiId: 'epi-5',
    epiNome: 'Luva de Vaqueta Mista Cano Curto',
    numeroCA: '14321',
    fabricante: 'Danny EPI',
    quantidade: 1,
    dataEntrega: addDaysToDate(today, -50),
    dataPrevisaoTroca: addDaysToDate(today, -5), // VENCIDA HÁ 5 DIAS!
    validadeCA: addDaysToDate(today, 400),
    motivo: 'substituicao_periodica',
    status: 'ativo',
    termoAssinado: true,
    assinadoEm: addDaysToDate(today, -50),
  },
  {
    id: 'del-3',
    funcionarioId: 'func-1',
    epiId: 'epi-2',
    epiNome: 'Óculos de Segurança Antirrisco e Antiembaçante Incolor',
    numeroCA: '12572',
    fabricante: '3M do Brasil',
    quantidade: 1,
    dataEntrega: addDaysToDate(today, -80),
    dataPrevisaoTroca: addDaysToDate(today, 10), // VENCE EM 10 DIAS!
    validadeCA: addDaysToDate(today, 540),
    motivo: 'admissao',
    status: 'ativo',
    termoAssinado: true,
    assinadoEm: addDaysToDate(today, -80),
  },

  // Juliana
  {
    id: 'del-4',
    funcionarioId: 'func-2',
    epiId: 'epi-1',
    epiNome: 'Capacete de Segurança com Jugular Aba Frontal Classe B',
    numeroCA: '498',
    fabricante: 'MSA do Brasil',
    quantidade: 1,
    dataEntrega: addDaysToDate(today, -60),
    dataPrevisaoTroca: addDaysToDate(today, 305),
    validadeCA: addDaysToDate(today, 380),
    motivo: 'admissao',
    status: 'ativo',
    termoAssinado: true,
    assinadoEm: addDaysToDate(today, -60),
  },
  {
    id: 'del-5',
    funcionarioId: 'func-2',
    epiId: 'epi-3',
    epiNome: 'Protetor Auditivo Tipo Plug de Silicone (Cordão)',
    numeroCA: '5674',
    fabricante: '3M do Brasil',
    quantidade: 2,
    dataEntrega: addDaysToDate(today, -20),
    dataPrevisaoTroca: addDaysToDate(today, 10), // Vence em 10 dias
    validadeCA: addDaysToDate(today, 20),
    motivo: 'substituicao_periodica',
    status: 'ativo',
    termoAssinado: true,
    assinadoEm: addDaysToDate(today, -20),
  },

  // Roberto Carlos (tem bota com CA vencido)
  {
    id: 'del-6',
    funcionarioId: 'func-3',
    epiId: 'epi-6',
    epiNome: 'Calçado de Segurança Bota de Couro com Bico de Aço',
    numeroCA: '41419',
    fabricante: 'Marluvas',
    quantidade: 1,
    dataEntrega: addDaysToDate(today, -90),
    dataPrevisaoTroca: addDaysToDate(today, 90),
    validadeCA: addDaysToDate(today, -15), // CA VENCIDO!
    motivo: 'admissao',
    status: 'ativo',
    termoAssinado: true,
    assinadoEm: addDaysToDate(today, -90),
  },
  {
    id: 'del-7',
    funcionarioId: 'func-3',
    epiId: 'epi-4',
    epiNome: 'Protetor Auditivo Tipo Concha / Abafador',
    numeroCA: '34414',
    fabricante: 'Honeywell',
    quantidade: 1,
    dataEntrega: addDaysToDate(today, -100),
    dataPrevisaoTroca: addDaysToDate(today, 265),
    validadeCA: addDaysToDate(today, 600),
    motivo: 'admissao',
    status: 'ativo',
    termoAssinado: true,
    assinadoEm: addDaysToDate(today, -100),
  },

  // Fernanda Lima
  {
    id: 'del-8',
    funcionarioId: 'func-4',
    epiId: 'epi-1',
    epiNome: 'Capacete de Segurança com Jugular Aba Frontal Classe B',
    numeroCA: '498',
    fabricante: 'MSA do Brasil',
    quantidade: 1,
    dataEntrega: addDaysToDate(today, -30),
    dataPrevisaoTroca: addDaysToDate(today, 335),
    validadeCA: addDaysToDate(today, 380),
    motivo: 'admissao',
    status: 'ativo',
    termoAssinado: true,
    assinadoEm: addDaysToDate(today, -30),
  },
  {
    id: 'del-9',
    funcionarioId: 'func-4',
    epiId: 'epi-2',
    epiNome: 'Óculos de Segurança Antirrisco e Antiembaçante Incolor',
    numeroCA: '12572',
    fabricante: '3M do Brasil',
    quantidade: 1,
    dataEntrega: addDaysToDate(today, -30),
    dataPrevisaoTroca: addDaysToDate(today, 60),
    validadeCA: addDaysToDate(today, 540),
    motivo: 'admissao',
    status: 'ativo',
    termoAssinado: true,
    assinadoEm: addDaysToDate(today, -30),
  },

  // Anderson Ribeiro
  {
    id: 'del-10',
    funcionarioId: 'func-5',
    epiId: 'epi-7',
    epiNome: 'Respirador Semifacial Descartável PFF2 / N95 com Válvula',
    numeroCA: '38504',
    fabricante: 'Delta Plus',
    quantidade: 5,
    dataEntrega: addDaysToDate(today, -2),
    dataPrevisaoTroca: addDaysToDate(today, 8),
    validadeCA: addDaysToDate(today, 300),
    motivo: 'admissao',
    status: 'ativo',
    termoAssinado: true,
    assinadoEm: addDaysToDate(today, -2),
  },
];

export const storage = {
  getCompany(): CompanyInfo {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.COMPANY);
      return data ? JSON.parse(data) : defaultCompany;
    } catch {
      return defaultCompany;
    }
  },

  saveCompany(info: CompanyInfo): void {
    localStorage.setItem(STORAGE_KEYS.COMPANY, JSON.stringify(info));
  },

  getEmployees(): Funcionario[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
      return data ? JSON.parse(data) : defaultEmployees;
    } catch {
      return defaultEmployees;
    }
  },

  saveEmployees(list: Funcionario[]): void {
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(list));
  },

  getPPEItems(): PPEItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PPE_ITEMS);
      return data ? JSON.parse(data) : defaultPPEItems;
    } catch {
      return defaultPPEItems;
    }
  },

  savePPEItems(items: PPEItem[]): void {
    localStorage.setItem(STORAGE_KEYS.PPE_ITEMS, JSON.stringify(items));
  },

  getDeliveries(): DeliveryRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DELIVERIES);
      return data ? JSON.parse(data) : defaultDeliveries;
    } catch {
      return defaultDeliveries;
    }
  },

  saveDeliveries(records: DeliveryRecord[]): void {
    localStorage.setItem(STORAGE_KEYS.DELIVERIES, JSON.stringify(records));
  },

  resetAllToDefaults(): {
    company: CompanyInfo;
    employees: Funcionario[];
    items: PPEItem[];
    deliveries: DeliveryRecord[];
  } {
    localStorage.removeItem(STORAGE_KEYS.COMPANY);
    localStorage.removeItem(STORAGE_KEYS.EMPLOYEES);
    localStorage.removeItem(STORAGE_KEYS.PPE_ITEMS);
    localStorage.removeItem(STORAGE_KEYS.DELIVERIES);
    return {
      company: defaultCompany,
      employees: defaultEmployees,
      items: defaultPPEItems,
      deliveries: defaultDeliveries,
    };
  },
};
