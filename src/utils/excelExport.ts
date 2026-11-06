import * as XLSX from 'xlsx';
import { CompanyInfo, DeliveryRecord, EPIAlert, Funcionario, PPEItem } from '../types';
import { formatDateBr } from './alerts';

const MOTIVO_LABELS: Record<string, string> = {
  admissao: 'Admissão',
  substituicao_periodica: 'Substituição Periódica',
  danificado: 'Danificado / Desgaste',
  extravio: 'Extravio / Perda',
  outro: 'Outro',
};

const STATUS_LABELS: Record<string, string> = {
  ativo: 'Em Uso (Ativo)',
  devolvido: 'Devolvido',
  descartado: 'Descartado',
  substituido: 'Substituído',
};

/**
 * Generates and downloads an individual employee EPI sheet in Excel (.xlsx) format
 * compliant with Brazilian NR-6 guidelines.
 */
export function exportSingleEmployeeToExcel(
  funcionario: Funcionario,
  deliveries: DeliveryRecord[],
  company: CompanyInfo
): void {
  const wb = XLSX.utils.book_new();

  // Create data rows for the sheet
  const rows: (string | number)[][] = [
    ['FICHA DE CONTROLE E ENTREGA DE EPI (EQUIPAMENTO DE PROTEÇÃO INDIVIDUAL)'],
    ['CONFORME EXIGÊNCIA DA NORMA REGULAMENTADORA NR-6 (PORTARIA MTP Nº 672/2021)'],
    [],
    ['DADOS DO EMPREGADOR'],
    ['Razão Social:', company.razaoSocial, '', 'CNPJ:', company.cnpj],
    ['Nome Fantasia:', company.nomeFantasia || '-', '', 'Endereço:', company.endereco],
    ['Cidade / UF:', company.cidadeUf, '', 'Resp. Técnico:', `${company.responsavelTecnico} (${company.registroTecnico})`],
    [],
    ['DADOS DO EMPREGADO'],
    ['Nome Completo:', funcionario.nome, '', 'CPF:', funcionario.cpf],
    ['Matrícula:', funcionario.matricula, '', 'Data de Admissão:', formatDateBr(funcionario.dataAdmissao)],
    ['Cargo / Função:', funcionario.cargo, '', 'Setor / Departamento:', funcionario.departamento],
    ['Situação Cadastral:', funcionario.status.toUpperCase(), '', 'Data Emissão:', formatDateBr(new Date().toISOString().split('T')[0])],
    [],
    ['TERMO DE RESPONSABILIDADE E COMPROMISSO (NR-6 - ITEM 6.7.1)'],
    [
      'Declaro ter recebido da empresa acima identificada, a título de empréstimo gratuito para meu uso exclusivo no exercício de minhas funções, os Equipamentos de Proteção Individual (EPI) constantes nesta ficha, novos e em perfeitas condições de uso. Comprometo-me a: a) Usá-lo apenas para a finalidade a que se destina; b) Responsabilizar-me pela sua guarda e conservação; c) Comunicar imediatamente qualquer alteração que o torne impróprio para uso; d) Cumprir as determinações sobre o uso adequado; e) Devolver o equipamento quando da substituição ou rescisão contratual.',
    ],
    [],
    [
      'Item',
      'Data Entrega',
      'Descrição do EPI',
      'Fabricante / Modelo',
      'Nº C.A.',
      'Validade C.A.',
      'Qtd',
      'Motivo',
      'Previsão Troca',
      'Situação',
      'Data Devolução',
      'Assinatura / Confirmação do Empregado',
    ],
  ];

  const empDeliveries = deliveries
    .filter((d) => d.funcionarioId === funcionario.id)
    .sort((a, b) => (a.dataEntrega < b.dataEntrega ? 1 : -1));

  if (empDeliveries.length === 0) {
    rows.push(['-', '-', 'Nenhum EPI registrado até o momento', '-', '-', '-', 0, '-', '-', '-', '-', '-']);
  } else {
    empDeliveries.forEach((d, idx) => {
      rows.push([
        idx + 1,
        formatDateBr(d.dataEntrega),
        d.epiNome,
        d.fabricante || 'Padrão Homologado',
        d.numeroCA ? `C.A. ${d.numeroCA}` : '-',
        formatDateBr(d.validadeCA),
        d.quantidade,
        MOTIVO_LABELS[d.motivo] || d.motivo,
        formatDateBr(d.dataPrevisaoTroca),
        STATUS_LABELS[d.status] || d.status,
        d.dataDevolucao ? formatDateBr(d.dataDevolucao) : '-',
        d.assinaturaUrl
          ? `[V] Assinatura Digital Touch Registrada (${formatDateBr(d.assinadoEm?.split('T')[0] || d.dataEntrega)})`
          : d.termoAssinado
          ? `[V] Confirmado Eletronicamente (${formatDateBr(d.assinadoEm?.split('T')[0] || d.dataEntrega)})`
          : '___________________________',
      ]);
    });
  }

  rows.push([]);
  rows.push([]);
  rows.push(['DECLARAÇÃO E ASSINATURAS FINAIS:']);
  rows.push([]);
  rows.push([
    '__________________________________________________',
    '',
    '',
    '__________________________________________________',
  ]);
  rows.push([
    `${funcionario.nome} (CPF: ${funcionario.cpf})`,
    '',
    '',
    `${company.responsavelTecnico} - Técnico/Eng. Seg. Trabalho`,
  ]);
  rows.push([
    'Assinatura do Empregado',
    '',
    '',
    `Registro: ${company.registroTecnico}`,
  ]);

  const ws = XLSX.utils.aoa_to_sheet(rows);

  // Set column widths for comfortable display
  ws['!cols'] = [
    { wch: 8 },  // Item
    { wch: 14 }, // Data Entrega
    { wch: 32 }, // Descrição do EPI
    { wch: 22 }, // Fabricante / Modelo
    { wch: 14 }, // Nº C.A.
    { wch: 14 }, // Validade C.A.
    { wch: 8 },  // Qtd
    { wch: 20 }, // Motivo
    { wch: 16 }, // Previsão Troca
    { wch: 16 }, // Situação
    { wch: 16 }, // Data Devolução
    { wch: 32 }, // Assinatura
  ];

  // Sanitize sheet name (Excel limits sheet name to 31 chars and no special chars)
  const safeSheetName = `Ficha_${funcionario.nome.replace(/[^a-zA-Z0-9]/g, '_')}`.slice(0, 31);
  XLSX.utils.book_append_sheet(wb, ws, safeSheetName);

  // File name
  const safeFileName = `Ficha_EPI_${funcionario.nome.trim().replace(/\s+/g, '_')}_${funcionario.matricula || 'colab'}.xlsx`;
  XLSX.writeFile(wb, safeFileName);
}

/**
 * Exports consolidated report of all employees and their PPEs to an Excel workbook
 * with multiple dedicated sheets: 'Resumo Geral', 'Todos os EPIs Entregues', 'Alertas de Validade'
 */
export function exportAllEmployeesToExcel(
  employees: Funcionario[],
  deliveries: DeliveryRecord[],
  company: CompanyInfo,
  alerts: EPIAlert[]
): void {
  const wb = XLSX.utils.book_new();

  // 1. Resumo Geral de Funcionários
  const empRows: (string | number)[][] = [
    [`RELATÓRIO CONSOLIDADO DE GESTÃO DE EPIs - ${company.razaoSocial}`],
    [`Emitido em: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`],
    [],
    [
      'Matrícula',
      'Nome do Empregado',
      'CPF',
      'Cargo',
      'Departamento',
      'Admissão',
      'Situação',
      'EPIs Ativos em Uso',
      'EPIs Vencidos',
      'EPIs a Vencer (30d)',
      'Status de Conformidade',
    ],
  ];

  employees.forEach((emp) => {
    const activeEpis = deliveries.filter((d) => d.funcionarioId === emp.id && d.status === 'ativo');
    const empAlerts = alerts.filter((a) => a.funcionarioId === emp.id);
    const criticals = empAlerts.filter((a) => a.severidade === 'critical').length;
    const warnings = empAlerts.filter((a) => a.severidade === 'warning').length;

    let conformidade = 'CONFORME (100% em dia)';
    if (criticals > 0) conformidade = 'NÃO CONFORME (Itens Vencidos)';
    else if (warnings > 0) conformidade = 'ATENÇÃO (Vencimento Próximo)';

    empRows.push([
      emp.matricula,
      emp.nome,
      emp.cpf,
      emp.cargo,
      emp.departamento,
      formatDateBr(emp.dataAdmissao),
      emp.status.toUpperCase(),
      activeEpis.length,
      criticals,
      warnings,
      conformidade,
    ]);
  });

  const wsEmp = XLSX.utils.aoa_to_sheet(empRows);
  wsEmp['!cols'] = [
    { wch: 12 },
    { wch: 28 },
    { wch: 16 },
    { wch: 22 },
    { wch: 18 },
    { wch: 14 },
    { wch: 12 },
    { wch: 16 },
    { wch: 14 },
    { wch: 18 },
    { wch: 28 },
  ];
  XLSX.utils.book_append_sheet(wb, wsEmp, 'Quadro Colaboradores');

  // 2. Todos os EPIs Entregues
  const deliveryRows: (string | number)[][] = [
    ['HISTÓRICO COMPLETO DE ENTREGAS E DEVOLUÇÕES DE EPI'],
    [],
    [
      'Data Entrega',
      'Colaborador',
      'Matrícula',
      'Departamento',
      'Equipamento (EPI)',
      'Fabricante',
      'C.A. (MTE)',
      'Validade C.A.',
      'Previsão Troca',
      'Qtd',
      'Motivo',
      'Status',
      'Data Devolução',
      'Assinatura Registrada',
    ],
  ];

  deliveries.forEach((d) => {
    const emp = employees.find((e) => e.id === d.funcionarioId);
    deliveryRows.push([
      formatDateBr(d.dataEntrega),
      emp?.nome || 'Desconhecido',
      emp?.matricula || '-',
      emp?.departamento || '-',
      d.epiNome,
      d.fabricante,
      d.numeroCA,
      formatDateBr(d.validadeCA),
      formatDateBr(d.dataPrevisaoTroca),
      d.quantidade,
      MOTIVO_LABELS[d.motivo] || d.motivo,
      STATUS_LABELS[d.status] || d.status,
      d.dataDevolucao ? formatDateBr(d.dataDevolucao) : '-',
      d.termoAssinado ? 'Sim' : 'Pendente',
    ]);
  });

  const wsDeliv = XLSX.utils.aoa_to_sheet(deliveryRows);
  wsDeliv['!cols'] = [
    { wch: 14 },
    { wch: 26 },
    { wch: 12 },
    { wch: 18 },
    { wch: 28 },
    { wch: 18 },
    { wch: 12 },
    { wch: 14 },
    { wch: 14 },
    { wch: 8 },
    { wch: 20 },
    { wch: 16 },
    { wch: 14 },
    { wch: 14 },
  ];
  XLSX.utils.book_append_sheet(wb, wsDeliv, 'Histórico de Entregas');

  // 3. Alertas de Vencimento
  const alertRows: (string | number)[][] = [
    ['RELATÓRIO DE ALERTAS DE VENCIMENTO DE EPI E C.A.'],
    [`Total de Alertas Ativos: ${alerts.length}`],
    [],
    [
      'Gravidade',
      'Tipo de Alerta',
      'Colaborador',
      'Setor',
      'EPI',
      'Nº C.A.',
      'Validade C.A.',
      'Previsão de Troca',
      'Dias Restantes / Vencido',
      'Mensagem do Sistema',
    ],
  ];

  alerts.forEach((alt) => {
    alertRows.push([
      alt.severidade === 'critical' ? 'CRÍTICO (VENCIDO)' : 'ATENÇÃO (A VENCER)',
      alt.tipoAlerta.replace('_', ' ').toUpperCase(),
      alt.funcionarioNome,
      alt.funcionarioDepto,
      alt.epiNome,
      alt.numeroCA,
      formatDateBr(alt.validadeCA),
      formatDateBr(alt.dataPrevisaoTroca),
      alt.diasRestantes < 0 ? `Vencido há ${Math.abs(alt.diasRestantes)} dias` : `Vence em ${alt.diasRestantes} dias`,
      alt.mensagem,
    ]);
  });

  const wsAlerts = XLSX.utils.aoa_to_sheet(alertRows);
  wsAlerts['!cols'] = [
    { wch: 20 },
    { wch: 20 },
    { wch: 26 },
    { wch: 18 },
    { wch: 26 },
    { wch: 12 },
    { wch: 14 },
    { wch: 16 },
    { wch: 22 },
    { wch: 45 },
  ];
  XLSX.utils.book_append_sheet(wb, wsAlerts, 'Alertas de Validade');

  XLSX.writeFile(wb, `Gestao_EPI_Geral_${new Date().toISOString().split('T')[0]}.xlsx`);
}

/**
 * Exports only the expiration alerts for purchasing/safety replenishment planning
 */
export function exportAlertsToExcel(alerts: EPIAlert[], company: CompanyInfo): void {
  const wb = XLSX.utils.book_new();

  const rows: (string | number)[][] = [
    [`PLANO DE REPOSIÇÃO E ALERTAS DE VENCIMENTO DE EPI - ${company.razaoSocial}`],
    [`Data de Geração: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`],
    [],
    [
      'Prioridade',
      'Colaborador',
      'Cargo',
      'Departamento',
      'EPI Necessitando Ação',
      'Nº C.A.',
      'Validade do C.A.',
      'Data Limite de Troca',
      'Prazo',
      'Ação Recomendada',
    ],
  ];

  alerts.forEach((alt) => {
    let acao = 'Providenciar nova entrega e descarte do item usado';
    if (alt.tipoAlerta.startsWith('ca_')) {
      acao = 'Verificar renovação do C.A. no MTE ou substituir fabricante homologado';
    }

    rows.push([
      alt.severidade === 'critical' ? '1 - URGENTE (VENCIDO)' : '2 - ALERTA (PRÓXIMO)',
      alt.funcionarioNome,
      alt.funcionarioCargo,
      alt.funcionarioDepto,
      alt.epiNome,
      alt.numeroCA,
      formatDateBr(alt.validadeCA),
      formatDateBr(alt.dataPrevisaoTroca),
      alt.diasRestantes < 0 ? `Vencido há ${Math.abs(alt.diasRestantes)} dias` : `Faltam ${alt.diasRestantes} dias`,
      acao,
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [
    { wch: 22 },
    { wch: 26 },
    { wch: 20 },
    { wch: 18 },
    { wch: 28 },
    { wch: 14 },
    { wch: 16 },
    { wch: 18 },
    { wch: 20 },
    { wch: 45 },
  ];
  XLSX.utils.book_append_sheet(wb, ws, 'Alertas Reposição');

  XLSX.writeFile(wb, `Alertas_Vencimento_EPI_${new Date().toISOString().split('T')[0]}.xlsx`);
}
