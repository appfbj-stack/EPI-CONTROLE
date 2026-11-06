export type PPEMotivo = 'admissao' | 'substituicao_periodica' | 'danificado' | 'extravio' | 'outro';

export type PPEStatus = 'ativo' | 'devolvido' | 'descartado' | 'substituido';

export type AlertSeverity = 'critical' | 'warning' | 'ok';

export interface CompanyInfo {
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  endereco: string;
  cidadeUf: string;
  responsavelTecnico: string; // ex: Engenheiro / Técnico de Segurança do Trabalho
  registroTecnico: string; // ex: MTE / CREA
}

export interface PPEItem {
  id: string;
  nome: string;
  categoria: 'cabeca' | 'auditiva' | 'visual_facial' | 'respiratoria' | 'maos_bracos' | 'pernas_pes' | 'corpo_queda';
  fabricante: string;
  modelo: string;
  numeroCA: string; // Certificado de Aprovação
  validadeCA: string; // YYYY-MM-DD
  vidaUtilDias: number; // Dias recomendados de uso até a troca
  descricao?: string;
  instrucoesUso?: string;
}

export interface DeliveryRecord {
  id: string;
  funcionarioId: string;
  epiId: string;
  epiNome: string;
  numeroCA: string;
  fabricante: string;
  quantidade: number;
  dataEntrega: string; // YYYY-MM-DD
  dataPrevisaoTroca: string; // YYYY-MM-DD calculada com base na vida útil
  validadeCA: string; // YYYY-MM-DD
  motivo: PPEMotivo;
  status: PPEStatus;
  dataDevolucao?: string; // YYYY-MM-DD se devolvido
  motivoDevolucao?: string;
  observacoes?: string;
  termoAssinado: boolean; // Confirmação de recebimento
  assinadoEm?: string; // ISO timestamp
  assinaturaUrl?: string; // Data URL (image/png) capturada via Signature Pad
  assinanteNome?: string; // Nome do colaborador que assinou digitalmente
}

export interface Funcionario {
  id: string;
  nome: string;
  cpf: string;
  matricula: string;
  cargo: string;
  departamento: string;
  dataAdmissao: string; // YYYY-MM-DD
  status: 'ativo' | 'afastado' | 'desligado';
  email?: string;
  telefone?: string;
  fotoUrl?: string;
}

export interface EPIAlert {
  id: string;
  funcionarioId: string;
  funcionarioNome: string;
  funcionarioCargo: string;
  funcionarioDepto: string;
  entregaId: string;
  epiNome: string;
  numeroCA: string;
  dataEntrega: string;
  dataPrevisaoTroca: string;
  validadeCA: string;
  tipoAlerta: 'ca_vencido' | 'ca_a_vencer' | 'troca_vencida' | 'troca_a_vencer';
  severidade: AlertSeverity;
  diasRestantes: number; // negativo se vencido
  mensagem: string;
}
