import React, { useState, useEffect } from 'react';
import { Step, type FormData } from './types';
import { INITIAL_FORM_DATA } from './constants';
import { TopAppBar } from './components/TopAppBar';
import { Stepper } from './components/Stepper';
import { IdentificationStep } from './steps/IdentificationStep';
import { PeriodStep } from './steps/PeriodStep';
import { DepositsStep } from './steps/DepositsStep';
import { ChemicalsStep } from './steps/ChemicalsStep';
import { HumanResourcesStep } from './steps/HumanResourcesStep';
import { SummaryStep } from './steps/SummaryStep';
import { ReviewStep } from './steps/ReviewStep';
import { ReportsPage } from './pages/ReportsPage';
import { HomePage } from './pages/HomePage';
import { UsersPage } from './pages/UsersPage';
import { AdminPage } from './pages/AdminPage';
import { LoginPage } from './pages/LoginPage';
import { BottomNavigation, PageType } from './components/BottomNavigation';
import { SidebarNavigation } from './components/SidebarNavigation';
import { ReportService } from './services/reportService';
import { supabase } from './services/supabaseClient';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';

const AuthenticatedApp: React.FC = () => {
  const { user, loading, isAdmin } = useAuth();
  const { isDarkMode } = useTheme(); // Hook hook consuming theme context
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [step, setStep] = useState<Step>(Step.Identification);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [editingReportId, setEditingReportId] = useState<string | null>(null);

  // Ref para o container principal do formulário
  const mainContainerRef = React.useRef<HTMLDivElement>(null);

  // Scroll to top quando mudar de etapa
  useEffect(() => {
    if (mainContainerRef.current) {
      mainContainerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }, [step]);

  // Gestão do hash da URL para navegação
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#/reports') {
        setCurrentPage('reports');
      } else if (hash === '#/form') {
        setCurrentPage('form');
      } else if (hash === '#/users') {
        setCurrentPage('users');
      } else {
        setCurrentPage('home');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const handleNavigate = (page: PageType) => {
    if (page === 'admin') {
      setShowAdmin(true);
      return;
    }
    const hashMap: Record<Exclude<PageType, 'admin'>, string> = {
      home: '#/',
      form: '#/form',
      reports: '#/reports',
      users: '#/users'
    };
    window.location.hash = hashMap[page];
    setCurrentPage(page);
  };

  const handleDataChange = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (step < Step.Review) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > Step.Identification) setStep(step - 1);
  };

  const handleSubmit = async () => {
    try {
      // Se estiver editando, não verificar duplicidade (é o mesmo relatório)
      if (!editingReportId) {
        // Verificar duplicidade: mesma localidade + semana epidemiológica
        const { data: existingReports, error: checkError } = await supabase
          .from('reports')
          .select('id, localidade, semana_epidemiologica')
          .eq('localidade', formData.localidade)
          .eq('semana_epidemiologica', formData.semanaEpidemiologica)
          .eq('ano', formData.ano);

        if (checkError) {
          console.error('Erro ao verificar duplicidade:', checkError);
        }

        if (existingReports && existingReports.length > 0) {
          alert(
            `⚠️ ATENÇÃO: Já existe um relatório para:\n\n` +
            `📍 Localidade: ${formData.localidade}\n` +
            `📅 Semana: ${formData.semanaEpidemiologica}\n` +
            `📆 Ano: ${formData.ano}\n\n` +
            `Não é possível enviar relatórios duplicados.\n` +
            `Verifique os dados ou edite o relatório existente.`
          );
          return;
        }
      }

      if (editingReportId) {
        // Atualizar relatório existente
        await ReportService.updateReport(editingReportId, formData);
      } else {
        // Criar novo relatório
        await ReportService.saveReport(formData);
      }

      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
        setFormData(INITIAL_FORM_DATA);
        setStep(Step.Identification);
        setEditingReportId(null);
        handleNavigate('reports');
      }, 2000);
    } catch (error) {
      console.error("Erro ao salvar relatório:", error);
      alert("Erro ao salvar o relatório. Tente novamente.");
    }
  };

  // Função para editar um relatório existente
  const handleEditReport = async (reportId: string) => {
    try {
      const report = await ReportService.getReportById(reportId);
      if (report && report.data) {
        setFormData(report.data);
        setEditingReportId(reportId);
        setStep(Step.Identification);
        handleNavigate('form');
      } else {
        alert('Não foi possível carregar o relatório para edição.');
      }
    } catch (error) {
      console.error('Erro ao carregar relatório para edição:', error);
      alert('Erro ao carregar relatório.');
    }
  };

  const handleAction = () => {
    if (step === Step.Review) {
      handleSubmit();
    } else {
      // Validação na Etapa 2: Tipo de Atividade obrigatório
      if (step === Step.Period && formData.tipoAtividade.length === 0) {
        alert('Por favor, selecione ao menos um Tipo de Atividade antes de continuar.');
        return;
      }
      nextStep();
    }
  };

  const handleCancel = () => {
    if (window.confirm('Tem certeza que deseja cancelar? Todos os dados serão perdidos.')) {
      setFormData(INITIAL_FORM_DATA);
      setStep(Step.Identification);
      setEditingReportId(null);
      handleNavigate('home');
    }
  };

  const renderStep = () => {
    switch (step) {
      case Step.Identification:
        return <IdentificationStep data={formData} onChange={handleDataChange} onClear={() => setFormData(INITIAL_FORM_DATA)} />;
      case Step.Period:
        return <PeriodStep data={formData} onChange={handleDataChange} />;
      case Step.Summary:
        return <SummaryStep data={formData} onChange={handleDataChange} />;
      case Step.Deposits:
        return <DepositsStep data={formData} onChange={handleDataChange} />;
      case Step.Chemicals:
        return <ChemicalsStep data={formData} onChange={handleDataChange} />;
      case Step.HumanResources:
        return <HumanResourcesStep data={formData} onChange={handleDataChange} />;
      case Step.Review:
        return <ReviewStep data={formData} />;
      default:
        return null;
    }
  };

  const getTitle = () => {
    const editPrefix = editingReportId ? '✏️ Editando: ' : '';
    switch (step) {
      case Step.Identification: return editPrefix + (editingReportId ? 'Identificação' : 'Nova Atividade');
      case Step.Period: return editPrefix + 'Definição de Período';
      case Step.Summary: return editPrefix + 'Produção dos Agentes';
      case Step.Deposits: return editPrefix + 'Depósitos Inspecionados';
      case Step.Chemicals: return editPrefix + 'Controle de Larvicidas';
      case Step.HumanResources: return editPrefix + 'Equipe e Logística';
      case Step.Review: return editPrefix + 'Revisão Final';
      default: return 'Vetorial-Endemias';
    }
  };

  const getActionText = () => {
    if (step === Step.Review) return editingReportId ? 'Salvar Alterações' : 'Finalizar e Enviar';
    return 'Continuar';
  };

  const getActionIcon = () => {
    if (step === Step.Review) return 'task_alt';
    return 'arrow_forward';
  };

  // Validação completa do formulário para habilitar botão azul
  const isFormComplete = (): boolean => {
    // Etapa 1: Identificação
    if (!formData.localidade || !formData.categoriaLocalidade) return false;

    // Etapa 2: Período
    if (formData.tipoAtividade.length === 0) return false;
    if (!formData.semanaEpidemiologica || formData.semanaEpidemiologica === 'SE --' || formData.semanaEpidemiologica === '') return false;
    if (!formData.dataInicio || !formData.dataFim) return false;

    // Etapa 6: Recursos Humanos
    if (formData.agentes === 0) return false;
    if (formData.diasTrabalhados === 0) return false;

    return true;
  };

  const renderPage = () => {
    if (showAdmin) {
      if (!isAdmin) {
        return (
          <div className="flex flex-col items-center justify-center h-screen bg-background-light dark:bg-background-dark animate-in fade-in duration-300">
            <div className="bg-red-50 dark:bg-red-900/20 p-8 rounded-full mb-6">
              <span className="material-symbols-outlined text-6xl text-red-500">lock</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Acesso Restrito</h1>
            <p className="text-slate-500 dark:text-slate-400 mb-2 max-w-md text-center">
              A área administrativa é exclusiva para gestores do sistema.
            </p>
            <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg mb-8 text-xs text-slate-500 font-mono">
              Usuario: {user?.email} <br />
              Role: {user?.role} / {typeof isAdmin !== 'undefined' ? (isAdmin ? 'Admin' : 'User') : 'Verificando...'}
            </div>
            <button
              onClick={() => setShowAdmin(false)}
              className="px-8 py-3 bg-secondary text-white rounded-xl font-bold hover:bg-secondary-dark transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined">arrow_back</span>
              Voltar ao Início
            </button>
          </div>
        );
      }
      return <AdminPage onBack={() => setShowAdmin(false)} />;
    }

    switch (currentPage) {
      case 'reports':
        return <ReportsPage onNavigateToForm={() => handleNavigate('form')} onEditReport={handleEditReport} />;
      case 'users':
        return <UsersPage />; // UsersPage now handles theme internally via Context
      case 'form':
        return (
          <div className="flex flex-col h-[100dvh] md:h-auto overflow-hidden support-dvh">
            <TopAppBar
              title={getTitle()}
              onBack={step > 0 ? prevStep : undefined}
              onAction={handleCancel}
              actionText="Cancelar"
            />

            <main ref={mainContainerRef} className="flex-1 flex flex-col overflow-y-auto no-scrollbar pb-40 bg-background-light dark:bg-background-dark">
              <div className="max-w-3xl mx-auto w-full md:py-8">

                {/* Desktop: Container com sombra e borda */}
                <div className="md:bg-white md:dark:bg-surface-dark md:rounded-3xl md:shadow-xl md:border md:border-slate-200 md:dark:border-slate-700 md:overflow-hidden md:min-h-[600px]">
                  {/* Steps e conteúdo */}
                  <div className="bg-white dark:bg-surface-dark border-b border-slate-100 dark:border-slate-800 pt-4 pb-2 px-6">
                    <Stepper current={step} total={7} />
                  </div>

                  <div className="p-0">
                    {renderStep()}
                  </div>
                </div>
              </div>
            </main>

            {/* Action Bar */}
            <div className="fixed bottom-16 md:bottom-0 left-0 right-0 md:left-64 lg:left-72 z-40 bg-white/90 dark:bg-surface-dark/90 backdrop-blur-md p-4 border-t border-slate-200 dark:border-slate-800 safe-area-pb">
              <div className="max-w-2xl mx-auto">
                <button
                  onClick={handleAction}
                  className={`w-full h-14 text-white font-bold rounded-xl text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group active:scale-[0.98] ${step === Step.Review && !isFormComplete()
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-orange-500/20'
                    : 'bg-gradient-to-r from-primary to-blue-600 hover:from-primary-dark hover:to-blue-700 shadow-primary/20'
                    }`}
                >
                  <span>{getActionText()}</span>
                  <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">{getActionIcon()}</span>
                  {step === Step.Review && !isFormComplete() && (
                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Incompleto</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        );
      case 'home':
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-background-light dark:bg-background-dark transition-colors duration-300">
      <SidebarNavigation
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onOpenAdmin={() => setShowAdmin(true)}
      />

      <div className="flex-1 flex flex-col min-w-0 md:ml-0 transition-all duration-300">
        {renderPage()}
      </div>

      {!showAdmin && currentPage !== 'form' && (
        <BottomNavigation
          activePage={currentPage}
          onNavigate={handleNavigate}
        />
      )}

      {/* Modal de Sucesso */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-surface-dark rounded-2xl p-8 mx-4 text-center shadow-2xl animate-in zoom-in-95 duration-300 border border-slate-100 dark:border-slate-700">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-5xl text-green-600 dark:text-green-400">check_circle</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Relatório Enviado!</h2>
            <p className="text-slate-500 dark:text-slate-400">
              Os dados foram registrados com sucesso no sistema.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// Main App Component with Providers
const App: React.FC = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AuthenticatedApp />
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;
