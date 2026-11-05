import { DeliveryRecord, EPIAlert, Funcionario, PPEItem } from '../types';

export function getDaysDiff(targetDateStr: string, fromDate = new Date()): number {
  if (!targetDateStr) return 999;
  const parts = targetDateStr.split('-');
  if (parts.length !== 3) return 999;
  const target = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  const today = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
  const diffTime = target.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function formatDateBr(dateStr?: string): string {
  if (!dateStr) return '-';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

export function addDaysToDate(dateStr: string, days: number): string {
  const parts = dateStr.split('-');
  const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  date.setDate(date.getDate() + days);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function getTodayStr(): string {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function generateAlerts(
  deliveries: DeliveryRecord[],
  employees: Funcionario[],
  catalog: PPEItem[] = []
): EPIAlert[] {
  const alerts: EPIAlert[] = [];
  const empMap = new Map<string, Funcionario>();
  employees.forEach((e) => empMap.set(e.id, e));

  // Map to get updated CA validity if catalog has it
  const catMap = new Map<string, PPEItem>();
  catalog.forEach((c) => catMap.set(c.id, c));

  deliveries
    .filter((d) => d.status === 'ativo')
    .forEach((delivery) => {
      const emp = empMap.get(delivery.funcionarioId);
      if (!emp || emp.status !== 'ativo') return;

      const catItem = catMap.get(delivery.epiId);
      const validadeCA = catItem?.validadeCA || delivery.validadeCA;

      // 1. Check Troca Periódica (Vida Útil)
      const diasTroca = getDaysDiff(delivery.dataPrevisaoTroca);
      if (diasTroca < 0) {
        alerts.push({
          id: `troca-venc-${delivery.id}`,
          funcionarioId: emp.id,
          funcionarioNome: emp.nome,
          funcionarioCargo: emp.cargo,
          funcionarioDepto: emp.departamento,
          entregaId: delivery.id,
          epiNome: delivery.epiNome,
          numeroCA: delivery.numeroCA,
          dataEntrega: delivery.dataEntrega,
          dataPrevisaoTroca: delivery.dataPrevisaoTroca,
          validadeCA,
          tipoAlerta: 'troca_vencida',
          severidade: 'critical',
          diasRestantes: diasTroca,
          mensagem: `Prazo de troca vencido há ${Math.abs(diasTroca)} dia(s) (venceu em ${formatDateBr(delivery.dataPrevisaoTroca)})`,
        });
      } else if (diasTroca <= 30) {
        alerts.push({
          id: `troca-avenc-${delivery.id}`,
          funcionarioId: emp.id,
          funcionarioNome: emp.nome,
          funcionarioCargo: emp.cargo,
          funcionarioDepto: emp.departamento,
          entregaId: delivery.id,
          epiNome: delivery.epiNome,
          numeroCA: delivery.numeroCA,
          dataEntrega: delivery.dataEntrega,
          dataPrevisaoTroca: delivery.dataPrevisaoTroca,
          validadeCA,
          tipoAlerta: 'troca_a_vencer',
          severidade: 'warning',
          diasRestantes: diasTroca,
          mensagem: diasTroca === 0 
            ? 'Prazo de troca vence HOJE' 
            : `Prazo de troca vence em ${diasTroca} dia(s) (${formatDateBr(delivery.dataPrevisaoTroca)})`,
        });
      }

      // 2. Check Certificado de Aprovação (C.A.)
      if (validadeCA) {
        const diasCA = getDaysDiff(validadeCA);
        if (diasCA < 0) {
          alerts.push({
            id: `ca-venc-${delivery.id}`,
            funcionarioId: emp.id,
            funcionarioNome: emp.nome,
            funcionarioCargo: emp.cargo,
            funcionarioDepto: emp.departamento,
            entregaId: delivery.id,
            epiNome: delivery.epiNome,
            numeroCA: delivery.numeroCA,
            dataEntrega: delivery.dataEntrega,
            dataPrevisaoTroca: delivery.dataPrevisaoTroca,
            validadeCA,
            tipoAlerta: 'ca_vencido',
            severidade: 'critical',
            diasRestantes: diasCA,
            mensagem: `C.A. nº ${delivery.numeroCA} VENCIDO pelo MTE há ${Math.abs(diasCA)} dia(s) (${formatDateBr(validadeCA)})`,
          });
        } else if (diasCA <= 45) {
          alerts.push({
            id: `ca-avenc-${delivery.id}`,
            funcionarioId: emp.id,
            funcionarioNome: emp.nome,
            funcionarioCargo: emp.cargo,
            funcionarioDepto: emp.departamento,
            entregaId: delivery.id,
            epiNome: delivery.epiNome,
            numeroCA: delivery.numeroCA,
            dataEntrega: delivery.dataEntrega,
            dataPrevisaoTroca: delivery.dataPrevisaoTroca,
            validadeCA,
            tipoAlerta: 'ca_a_vencer',
            severidade: 'warning',
            diasRestantes: diasCA,
            mensagem: `C.A. nº ${delivery.numeroCA} vencerá em ${diasCA} dia(s) (${formatDateBr(validadeCA)})`,
          });
        }
      }
    });

  // Sort by severity (critical first) then by diasRestantes ascending (most urgent first)
  return alerts.sort((a, b) => {
    if (a.severidade === 'critical' && b.severidade !== 'critical') return -1;
    if (a.severidade !== 'critical' && b.severidade === 'critical') return 1;
    return a.diasRestantes - b.diasRestantes;
  });
}

export function getEmployeeAlertStatus(
  funcionarioId: string,
  alerts: EPIAlert[]
): { status: 'critical' | 'warning' | 'ok'; countCritical: number; countWarning: number } {
  const empAlerts = alerts.filter((a) => a.funcionarioId === funcionarioId);
  const countCritical = empAlerts.filter((a) => a.severidade === 'critical').length;
  const countWarning = empAlerts.filter((a) => a.severidade === 'warning').length;

  if (countCritical > 0) return { status: 'critical', countCritical, countWarning };
  if (countWarning > 0) return { status: 'warning', countCritical, countWarning };
  return { status: 'ok', countCritical: 0, countWarning: 0 };
}
