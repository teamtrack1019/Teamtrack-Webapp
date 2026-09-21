import React from 'react';
import { X, Sparkles, Check, Image as ImageIcon } from 'lucide-react';

export default function LogoPreviewModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 text-slate-100 rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-sky-500/20 border border-sky-500/30 text-sky-400 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">
                TeamTrack Logo Önerileri & Taslakları
              </h3>
              <p className="text-xs text-slate-400">
                WebApp için hazırlanan görsel logo seçenekleri
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-6 overflow-y-auto flex-1 text-xs">
          
          {/* Visual Sheet 1 */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-extrabold text-sky-400 text-sm flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4" />
                1. Koyu Zemin Vektörel Kurumsal Logolar
              </span>
              <span className="text-[11px] text-slate-400 font-medium">4 Farklı Konsept</span>
            </div>
            <img 
              src="/logo_concept_1.jpg" 
              alt="TeamTrack Logo Konseptleri" 
              className="w-full rounded-xl border border-slate-700/60 shadow-lg object-contain bg-slate-950" 
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300 pt-2 text-[11.5px]">
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <strong className="text-sky-300">01. Interlocking Monogram:</strong> İç içe kenetlenmiş ikili "TT" harfi.
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <strong className="text-sky-300">02. Tracking Arrow:</strong> "T" harfinden çıkan hızlı süreç ve onay oku.
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <strong className="text-sky-300">03. Tech Badge:</strong> Entegre modülleri simgeleyen akıllı altıgen ağ.
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <strong className="text-sky-300">04. Growth Bars:</strong> Ciro, finans ve büyüme basamakları.
              </div>
            </div>
          </div>

          {/* Visual Sheet 2 */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-extrabold text-sky-400 text-sm flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4" />
                2. Açık Zemin & Modern Uygulama İkonları
              </span>
              <span className="text-[11px] text-slate-400 font-medium">App & WebApp İkonları</span>
            </div>
            <img 
              src="/logo_concept_2.jpg" 
              alt="TeamTrack App İkonları" 
              className="w-full rounded-xl border border-slate-700/60 shadow-lg object-contain bg-slate-950" 
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300 pt-2 text-[11.5px]">
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <strong className="text-sky-300">1) 3D Glassmorphic Icon:</strong> Parlak neon camgöbeği modern buton.
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <strong className="text-sky-300">2) Continuous Ribbon:</strong> Akıcı ve dinamik onay oku formu.
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <strong className="text-sky-300">3) Corporate Shield:</strong> Güvenilirlik ve sağlamlık veren kalkan rozeti.
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <strong className="text-sky-300">4) Tech Monogram:</strong> Dijital devre ve bağlantı noktaları.
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <p className="text-[11px] text-slate-400">
            Beğendiğiniz numarayı seçebilir veya fikirlerinizi belirtebilirsiniz.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
