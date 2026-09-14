import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, Smartphone, X, Check, Share2, Globe } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // If running directly as standalone installed PWA, show a subtle badge or nothing
  if (isInstalled) {
    return null;
  }

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      {/* Top / Floating Install Button */}
      <div className="fixed top-4 right-4 md:top-6 md:right-32 z-20 select-none">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleInstallClick}
          className="relative flex items-center gap-2 px-3.5 py-2.5 md:px-4 md:py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white text-xs md:text-sm font-extrabold shadow-lg shadow-emerald-900/20 border border-emerald-400/40 hover:brightness-105 transition-all"
        >
          <Smartphone className="w-4 h-4 text-emerald-200 animate-pulse" />
          <span>Установить как приложение</span>
          <Download className="w-3.5 h-3.5 opacity-80" />
        </motion.button>
      </div>

      {/* Guide Modal for iOS or manual install / permanent website */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm select-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md rounded-3xl bg-stone-50 p-6 shadow-2xl border border-amber-200 text-slate-800"
            >
              {/* Close button */}
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-600 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-2 shadow-md flex items-center justify-center text-white">
                  <Smartphone className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-lg font-black font-['Comfortaa',sans-serif] text-slate-900">
                    Установка на телефон или ПК
                  </h3>
                  <p className="text-xs text-slate-500">
                    Игра будет работать как полноценное приложение!
                  </p>
                </div>
              </div>

              {/* Instructions based on platform */}
              <div className="space-y-3 text-sm text-slate-600 mb-5">
                {isIOS ? (
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-2">
                    <p className="font-bold flex items-center gap-1.5 text-xs text-emerald-800 uppercase tracking-wider">
                      <span>🍎 Инструкция для iPhone и iPad:</span>
                    </p>
                    <ol className="text-xs space-y-1.5 list-decimal list-inside leading-relaxed text-slate-700">
                      <li>Нажмите иконку <strong>«Поделиться»</strong> (квадрат со стрелкой вверх) внизу Safari.</li>
                      <li>Пролистайте вниз и выберите <strong>«На экран «Домой»»</strong>.</li>
                      <li>Нажмите <strong>«Добавить»</strong> в верхнем правом углу.</li>
                    </ol>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-2">
                    <p className="font-bold flex items-center gap-1.5 text-xs text-emerald-800 uppercase tracking-wider">
                      <span>📱 Инструкция для Android & Компьютера:</span>
                    </p>
                    <ol className="text-xs space-y-1.5 list-decimal list-inside leading-relaxed text-slate-700">
                      <li>В меню браузера (три точки <strong>⋮</strong>) нажмите <strong>«Установить приложение»</strong> или <strong>«Добавить на главный экран»</strong>.</li>
                      <li>Либо в строке адреса на компьютере нажмите иконку установки <strong>⊕</strong>.</li>
                      <li>Игра появится среди ваших обычных приложений и будет запускаться мгновенно без рамок браузера!</li>
                    </ol>
                  </div>
                )}

                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                  <span className="text-base">✨</span>
                  <span>
                    <strong>Постоянное сохранение:</strong> ваш прогресс, собранная шерсть и купленные улучшения всегда сохраняются на этом устройстве.
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col gap-2">
                {isInstallable && (
                  <button
                    onClick={async () => {
                      setShowModal(false);
                      await install();
                    }}
                    className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Установить сейчас</span>
                  </button>
                )}

                <button
                  onClick={handleCopyLink}
                  className="w-full py-2.5 rounded-2xl border border-stone-300 hover:bg-stone-100 text-stone-700 font-bold text-xs transition-colors flex items-center justify-center gap-2"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-700">Ссылка скопирована в буфер!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4" />
                      <span>Скопировать постоянную ссылку на сайт</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
