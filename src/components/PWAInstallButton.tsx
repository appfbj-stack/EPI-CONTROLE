import React, { useState } from 'react';
import { Download, Smartphone, Monitor, X, Share2, PlusSquare, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);

  // If already installed and running standalone, do not show button
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const ok = await install();
      if (!ok) {
        setShowGuideModal(true);
      }
    } else {
      setShowGuideModal(true);
    }
  };

  return (
    <>
      <button
        onClick={handleInstallClick}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-lg shadow-sm transition-all cursor-pointer ring-1 ring-amber-300/40"
        title="Instalar GestorEPI no Computador ou Celular (PWA)"
      >
        <Download className="w-3.5 h-3.5 stroke-[2.5]" />
        <span>Instalar App</span>
        <span className="hidden sm:inline text-[10px] bg-slate-950/20 px-1 py-0.2 rounded font-mono">PWA</span>
      </button>

      {/* Guide Modal for iOS Safari, Desktop or manual prompt */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Instalar o GestorEPI</h3>
                  <p className="text-xs text-slate-400">Aplicativo Progressivo (PWA) no Celular e PC</p>
                </div>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs text-slate-700">
              {isIOS ? (
                /* iOS Safari instructions */
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                    <Smartphone className="w-4 h-4 text-amber-600" />
                    <span>Como instalar no iPhone ou iPad:</span>
                  </div>
                  <ol className="space-y-2.5 list-decimal list-inside bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <li className="leading-relaxed">
                      Toque no botão <strong>Compartilhar</strong>{' '}
                      <Share2 className="w-3.5 h-3.5 inline text-blue-600 mx-0.5" /> na barra inferior do Safari.
                    </li>
                    <li className="leading-relaxed">
                      Role para baixo e selecione <strong>"Adicionar à Tela de Início"</strong>{' '}
                      <PlusSquare className="w-3.5 h-3.5 inline text-slate-700 mx-0.5" />.
                    </li>
                    <li className="leading-relaxed">
                      Toque em <strong>"Adicionar"</strong> no canto superior direito.
                    </li>
                  </ol>
                  <p className="text-slate-500 text-[11px]">
                    O aplicativo abrirá em tela cheia como um app nativo, mesmo sem internet!
                  </p>
                </div>
              ) : (
                /* Android & Desktop Chrome / Edge instructions */
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                    <Monitor className="w-4 h-4 text-amber-600" />
                    <span>Instalação no Computador ou Android:</span>
                  </div>

                  {isInstallable ? (
                    <button
                      onClick={async () => {
                        setShowGuideModal(false);
                        await install();
                      }}
                      className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Confirmar Instalação Agora</span>
                    </button>
                  ) : (
                    <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <p className="font-semibold text-slate-900">No Computador (Chrome / Edge / Brave):</p>
                      <p>
                        Clique no ícone de <strong>Instalar</strong> que aparece no lado direito da barra de endereço
                        do seu navegador, ou vá no menu do navegador (três pontinhos) e selecione <strong>"Instalar GestorEPI"</strong>.
                      </p>
                      <hr className="my-2 border-slate-200" />
                      <p className="font-semibold text-slate-900">No Celular Android:</p>
                      <p>
                        Abra o menu do Chrome e toque em <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span className="text-[11px]">
                      Após instalado, o app funciona offline e abre sem a barra do navegador.
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setShowGuideModal(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-lg cursor-pointer"
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
