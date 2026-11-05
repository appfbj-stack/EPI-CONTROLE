import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { EmployeeList } from './components/EmployeeList';
import { AlertsPanel } from './components/AlertsPanel';
import { PPECatalog } from './components/PPECatalog';
import { EmployeeDetailModal } from './components/EmployeeDetailModal';
import { DeliveryModal } from './components/DeliveryModal';
import { ReturnModal } from './components/ReturnModal';
import { EmployeeFormModal } from './components/EmployeeFormModal';
import { PrintSheetModal } from './components/PrintSheetModal';
import { CompanySettingsModal } from './components/CompanySettingsModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { storage } from './utils/storage';
import { generateAlerts } from './utils/alerts';
import { exportAllEmployeesToExcel } from './utils/excelExport';
import { CompanyInfo, DeliveryRecord, EPIAlert, Funcionario, PPEItem, PPEStatus } from './types';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, ShieldCheck, HeartHandshake } from 'lucide-react';

export default function App() {
  // Main states loaded from storage
  const [company, setCompany] = useState<CompanyInfo>(() => storage.getCompany());
  const [employees, setEmployees] = useState<Funcionario[]>(() => storage.getEmployees());
  const [catalog, setCatalog] = useState<PPEItem[]>(() => storage.getPPEItems());
  const [deliveries, setDeliveries] = useState<DeliveryRecord[]>(() => storage.getDeliveries());

  // UI Navigation
  const [currentTab, setCurrentTab] = useState<'funcionarios' | 'alertas' | 'catalogo'>('funcionarios');

  // Modals state
  const [selectedEmployeeForDetail, setSelectedEmployeeForDetail] = useState<Funcionario | null>(null);
  const [isNewDeliveryOpen, setIsNewDeliveryOpen] = useState(false);
  const [preSelectedDeliveryEmp, setPreSelectedDeliveryEmp] = useState<Funcionario | undefined>();
  const [preSelectedDeliveryPPEId, setPreSelectedDeliveryPPEId] = useState<string | undefined>();
  const [replaceTargetDeliveryId, setReplaceTargetDeliveryId] = useState<string | undefined>();

  const [isEmployeeFormOpen, setIsEmployeeFormOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState<Funcionario | null>(null);

  const [returningDelivery, setReturningDelivery] = useState<DeliveryRecord | null>(null);
  const [printingEmployee, setPrintingEmployee] = useState<Funcionario | null>(null);
  const [isCompanySettingsOpen, setIsCompanySettingsOpen] = useState(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 4000);
  };

  // Sync to localStorage
  useEffect(() => {
    storage.saveCompany(company);
  }, [company]);

  useEffect(() => {
    storage.saveEmployees(employees);
  }, [employees]);

  useEffect(() => {
    storage.savePPEItems(catalog);
  }, [catalog]);

  useEffect(() => {
    storage.saveDeliveries(deliveries);
  }, [deliveries]);

  // Keep selected employee in detail view synchronized if employee record was updated
  useEffect(() => {
    if (selectedEmployeeForDetail) {
      const updated = employees.find((e) => e.id === selectedEmployeeForDetail.id);
      if (updated) setSelectedEmployeeForDetail(updated);
    }
  }, [employees]);

  // Automatic calculation of alerts
  const alerts: EPIAlert[] = useMemo(() => {
    return generateAlerts(deliveries, employees, catalog);
  }, [deliveries, employees, catalog]);

  const activeDeliveriesCount = useMemo(() => {
    return deliveries.filter((d) => d.status === 'ativo').length;
  }, [deliveries]);

  // Handlers for Deliveries
  const handleOpenDelivery = (emp?: Funcionario, defaultPPEId?: string, oldDeliveryIdToReplace?: string) => {
    setPreSelectedDeliveryEmp(emp);
    setPreSelectedDeliveryPPEId(defaultPPEId);
    setReplaceTargetDeliveryId(oldDeliveryIdToReplace);
    setIsNewDeliveryOpen(true);
  };

  const handleSaveDelivery = (
    record: Omit<DeliveryRecord, 'id'>,
    replaceOldDeliveryId?: string
  ) => {
    const newId = `del-${Date.now()}`;
    const newRecord: DeliveryRecord = {
      ...record,
      id: newId,
    };

    let updatedDeliveries = [...deliveries];

    // If this was replacing an old delivery, mark old as 'substituido'
    const targetId = replaceOldDeliveryId || replaceTargetDeliveryId;
    if (targetId) {
      updatedDeliveries = updatedDeliveries.map((d) =>
        d.id === targetId
          ? {
              ...d,
              status: 'substituido' as PPEStatus,
              dataDevolucao: record.dataEntrega,
              motivoDevolucao: 'Substituição por novo EPI',
            }
          : d
      );
    }

    updatedDeliveries = [newRecord, ...updatedDeliveries];
    setDeliveries(updatedDeliveries);
    setReplaceTargetDeliveryId(undefined);

    const emp = employees.find((e) => e.id === record.funcionarioId);
    showToast(`EPI "${record.epiNome}" entregue com sucesso para ${emp?.nome || 'colaborador'}!`);
  };

  const handleSaveReturn = (
    deliveryId: string,
    status: PPEStatus,
    dataDevolucao: string,
    motivoDevolucao: string
  ) => {
    const updated = deliveries.map((d) =>
      d.id === deliveryId
        ? {
            ...d,
            status,
            dataDevolucao,
            motivoDevolucao,
          }
        : d
    );
    setDeliveries(updated);
    showToast('Baixa/devolução do equipamento registrada com sucesso!');
  };

  const handleToggleSignature = (deliveryId: string) => {
    const updated = deliveries.map((d) => {
      if (d.id === deliveryId) {
        const nextSigned = !d.termoAssinado;
        return {
          ...d,
          termoAssinado: nextSigned,
          assinadoEm: nextSigned ? new Date().toISOString() : undefined,
        };
      }
      return d;
    });
    setDeliveries(updated);
    showToast('Status do termo de recebimento atualizado!');
  };

  // Handlers for Employees
  const handleSaveEmployee = (data: Omit<Funcionario, 'id'>, id?: string) => {
    if (id) {
      // Edit
      setEmployees((prev) => prev.map((e) => (e.id === id ? { ...data, id } : e)));
      showToast(`Dados de ${data.nome} atualizados com sucesso!`);
    } else {
      // Create
      const newEmp: Funcionario = {
        ...data,
        id: `func-${Date.now()}`,
      };
      setEmployees((prev) => [newEmp, ...prev]);
      showToast(`Colaborador ${data.nome} cadastrado com sucesso!`);
    }
  };

  // Handlers for PPE Catalog
  const handleSavePPEItem = (data: Omit<PPEItem, 'id'>, id?: string) => {
    if (id) {
      setCatalog((prev) => prev.map((item) => (item.id === id ? { ...data, id } : item)));
      showToast(`EPI "${data.nome}" atualizado no catálogo!`);
    } else {
      const newItem: PPEItem = {
        ...data,
        id: `epi-${Date.now()}`,
      };
      setCatalog((prev) => [newItem, ...prev]);
      showToast(`Novo EPI cadastrado no catálogo!`);
    }
  };

  const handleDeletePPEItem = (id: string) => {
    setCatalog((prev) => prev.filter((item) => item.id !== id));
    showToast('Item removido do catálogo.');
  };

  // Alert quick replace
  const handleReplaceFromAlert = (alert: EPIAlert) => {
    const emp = employees.find((e) => e.id === alert.funcionarioId);
    if (!emp) return;
    const oldDel = deliveries.find((d) => d.id === alert.entregaId);
    handleOpenDelivery(emp, oldDel?.epiId, alert.entregaId);
  };

  // General Excel export
  const handleExportAllExcel = () => {
    exportAllEmployeesToExcel(employees, deliveries, company, alerts);
    showToast('Planilha Geral de Gestão de EPIs (.xlsx) gerada com sucesso!');
  };

  // Reset Demo Data
  const handleResetDemo = () => {
    const fresh = storage.resetAllToDefaults();
    setCompany(fresh.company);
    setEmployees(fresh.employees);
    setCatalog(fresh.items);
    setDeliveries(fresh.deliveries);
    setSelectedEmployeeForDetail(null);
    showToast('Dados de exemplo restaurados com sucesso!');
  };

  // JSON Backup
  const handleExportJson = () => {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      company,
      employees,
      catalog,
      deliveries,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_gestorepi_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Backup JSON exportado com sucesso!');
  };

  const handleImportJson = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        if (parsed.company) setCompany(parsed.company);
        if (Array.isArray(parsed.employees)) setEmployees(parsed.employees);
        if (Array.isArray(parsed.catalog)) setCatalog(parsed.catalog);
        if (Array.isArray(parsed.deliveries)) setDeliveries(parsed.deliveries);
        showToast('Backup JSON restaurado com sucesso!');
      } catch (err) {
        alert('Erro ao carregar arquivo de backup: formato inválido.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-slate-100/90 text-slate-900 font-sans flex flex-col">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-700 flex items-center gap-3 text-xs sm:text-sm font-medium">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Main Header */}
      <Header
        company={company}
        employees={employees}
        activeDeliveriesCount={activeDeliveriesCount}
        alerts={alerts}
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenNewEmployee={() => {
          setEmployeeToEdit(null);
          setIsEmployeeFormOpen(true);
        }}
        onOpenNewDelivery={() => handleOpenDelivery()}
        onOpenCompanySettings={() => setIsCompanySettingsOpen(true)}
        onExportAllExcel={handleExportAllExcel}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'funcionarios' && (
          <EmployeeList
            employees={employees}
            deliveries={deliveries}
            alerts={alerts}
            company={company}
            onSelectEmployee={(emp) => setSelectedEmployeeForDetail(emp)}
            onOpenNewEmployee={() => {
              setEmployeeToEdit(null);
              setIsEmployeeFormOpen(true);
            }}
            onOpenDeliveryForEmployee={(emp) => handleOpenDelivery(emp)}
          />
        )}

        {currentTab === 'alertas' && (
          <AlertsPanel
            alerts={alerts}
            employees={employees}
            deliveries={deliveries}
            company={company}
            onSelectEmployee={(emp) => setSelectedEmployeeForDetail(emp)}
            onReplaceEPI={handleReplaceFromAlert}
          />
        )}

        {currentTab === 'catalogo' && (
          <PPECatalog
            catalog={catalog}
            onSaveItem={handleSavePPEItem}
            onDeleteItem={handleDeletePPEItem}
          />
        )}
      </main>

      {/* Modals */}
      {selectedEmployeeForDetail && (
        <EmployeeDetailModal
          employee={selectedEmployeeForDetail}
          deliveries={deliveries}
          alerts={alerts}
          catalog={catalog}
          company={company}
          onClose={() => setSelectedEmployeeForDetail(null)}
          onOpenDelivery={(emp, defaultPPEId) => handleOpenDelivery(emp, defaultPPEId)}
          onOpenReturn={(del) => setReturningDelivery(del)}
          onPrintSheet={(emp) => setPrintingEmployee(emp)}
          onEditEmployee={(emp) => {
            setEmployeeToEdit(emp);
            setIsEmployeeFormOpen(true);
          }}
          onToggleSignature={handleToggleSignature}
        />
      )}

      {isNewDeliveryOpen && (
        <DeliveryModal
          employees={employees}
          catalog={catalog}
          preSelectedEmployee={preSelectedDeliveryEmp}
          preSelectedPPEId={preSelectedDeliveryPPEId}
          onClose={() => {
            setIsNewDeliveryOpen(false);
            setPreSelectedDeliveryEmp(undefined);
            setPreSelectedDeliveryPPEId(undefined);
            setReplaceTargetDeliveryId(undefined);
          }}
          onSubmit={handleSaveDelivery}
        />
      )}

      {returningDelivery && (
        <ReturnModal
          delivery={returningDelivery}
          onClose={() => setReturningDelivery(null)}
          onSubmit={handleSaveReturn}
        />
      )}

      {isEmployeeFormOpen && (
        <EmployeeFormModal
          employeeToEdit={employeeToEdit}
          onClose={() => {
            setIsEmployeeFormOpen(false);
            setEmployeeToEdit(null);
          }}
          onSubmit={handleSaveEmployee}
        />
      )}

      {printingEmployee && (
        <PrintSheetModal
          employee={printingEmployee}
          deliveries={deliveries}
          company={company}
          onClose={() => setPrintingEmployee(null)}
        />
      )}

      {isCompanySettingsOpen && (
        <CompanySettingsModal
          company={company}
          onClose={() => setIsCompanySettingsOpen(false)}
          onSave={(info) => {
            setCompany(info);
            showToast('Dados da empresa atualizados com sucesso!');
          }}
          onResetDemo={handleResetDemo}
          onExportJson={handleExportJson}
          onImportJson={handleImportJson}
        />
      )}

      {/* Offline Status Badge */}
      <OfflineIndicator />
    </div>
  );
}
