import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Order } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { User, MapPin, History, Gift, Award, Settings, CheckCircle2, Truck, ChevronRight, X, Clock, HelpCircle, Save } from 'lucide-react';

export const CustomerProfile: React.FC = () => {
  const { user, orders, updateUserProfile, logoutCustomer, whatsappNumber, whatsappMessage } = useApp();
  
  // Tab control: 'history' | 'loyalty' | 'settings'
  const [activeTab, setActiveTab] = useState<'history' | 'loyalty' | 'settings'>('history');
  
  // Tracking modal target
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);

  // Settings form states
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone);
  const [address, setAddress] = useState(user.addresses[0]?.street || "");
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync settings inputs when user changes (e.g. login/logout)
  React.useEffect(() => {
    setName(user.name);
    setEmail(user.email);
    setPhone(user.phone);
    setAddress(user.addresses[0]?.street || "");
  }, [user]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile(name, email, phone, address);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-5 pb-20 text-left">
      {/* Upper Profile Hero Badge Card */}
      <div className="bg-[#1565C0] text-white p-5 rounded-3xl border border-slate-100 dark:border-gray-800 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
        <img 
          src={user.photo} 
          alt={user.name} 
          className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-full border-4 border-white/20 shadow-lg shrink-0"
          referrerPolicy="no-referrer"
        />
        <div className="flex-1 min-w-0">
          <span className="bg-[#FBC02D] text-slate-900 text-[9px] font-bold tracking-widest px-2.5 py-0.5 rounded-full uppercase">
            Membro Capitão Clube Gold 🏆
          </span>
          <h2 className="text-lg sm:text-xl font-semibold mt-1.5 leading-tight truncate">{user.name}</h2>
          <p className="text-xs text-blue-100 font-medium">{user.email}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3 text-[10px] text-blue-100 justify-center sm:justify-start items-center">
            <span className="flex items-center gap-1">📱 {user.phone}</span>
            <span className="flex items-center gap-1">📍 {user.addresses[0]?.city || "São Paulo"} - SP</span>
            <button
              onClick={logoutCustomer}
              className="text-[#FBC02D] hover:text-amber-300 font-bold cursor-pointer transition-colors flex items-center gap-0.5 ml-2 border border-[#FBC02D]/35 rounded px-1.5 py-0.2"
            >
              🚪 Sair
            </button>
          </div>
        </div>

        {/* Dynamic points balance ledger */}
        <div className="flex gap-2 sm:flex-col shrink-0">
          <div className="bg-white/10 dark:bg-black/20 p-2.5 rounded-2xl border border-white/10 text-center min-w-28 shadow-inner">
            <p className="text-[9px] uppercase font-bold text-blue-100">Saldo Cashback</p>
            <p className="text-base font-bold text-[#FBC02D]">R$ {user.cashback.toFixed(2)}</p>
          </div>
          <div className="bg-white/10 dark:bg-black/20 p-2.5 rounded-2xl border border-white/10 text-center min-w-28 shadow-inner">
            <p className="text-[9px] uppercase font-bold text-blue-100">Capitão Pontos</p>
            <p className="text-base font-bold text-[#FBC02D]">{user.loyaltyPoints} pts</p>
          </div>
        </div>
      </div>

      {/* Profile navigation tabs */}
      <div className="flex border-b border-slate-100 dark:border-gray-800 pb-1 gap-1">
        {[
          { id: 'history', label: 'Histórico de Pedidos', icon: <History className="w-4 h-4" /> },
          { id: 'loyalty', label: 'Clube de Vantagens', icon: <Award className="w-4 h-4" /> },
          { id: 'settings', label: 'Editar Perfil', icon: <Settings className="w-4 h-4" /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-[#1565C0]/5 dark:bg-[#1565C0]/10 text-[#1565C0] border border-[#1565C0]/10 font-bold'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB CONTENT RENDERERS */}
      <div className="space-y-4">
        
        {/* TAB 1: ORDER HISTORY */}
        {activeTab === 'history' && (
          <div className="space-y-3">
            <h3 className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Seus Pedidos Recentes</h3>
            
            {orders.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-3xl border border-slate-100 dark:border-gray-700">
                <span className="text-3xl">📦</span>
                <p className="text-xs text-gray-400 mt-2">Você ainda não realizou nenhum pedido na Capitão Embalagens.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map(order => {
                  let statusColor = "bg-blue-100 text-blue-800 border-blue-200";
                  if (order.status === 'Preparando') statusColor = "bg-amber-100 text-amber-800 border-amber-200";
                  if (order.status === 'Enviado') statusColor = "bg-purple-100 text-purple-800 border-purple-200";
                  if (order.status === 'Entregue') statusColor = "bg-emerald-100 text-emerald-800 border-emerald-200";

                  return (
                    <div 
                      key={order.id}
                      className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-slate-100 dark:border-gray-700 shadow-2xs space-y-3 text-xs"
                    >
                      {/* Order top line info */}
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-1.5 border-b border-gray-100 dark:border-gray-700 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900 dark:text-white">{order.id}</span>
                          <span className="text-gray-400">•</span>
                          <span className="text-[11px] text-gray-500 font-medium">{order.date}</span>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full font-semibold text-[10px] uppercase border inline-block max-w-max ${statusColor}`}>
                          {order.status}
                        </span>
                      </div>

                      {/* Purchased items list */}
                      <div className="space-y-1.5 py-1">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-gray-700 dark:text-gray-350 font-medium">
                            <span>{item.quantity}x {item.product.name}</span>
                            <span className="text-gray-400 font-mono">R$ {((item.product.promoPrice || item.product.price) * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      {/* Footer total and tracker trigger */}
                      <div className="border-t border-gray-100 dark:border-gray-700 pt-2 flex justify-between items-center">
                        <div>
                          <p className="text-[10px] text-gray-400 leading-none">Total Pago:</p>
                          <p className="text-sm font-semibold text-[#1565C0] dark:text-blue-400 mt-1">R$ {order.total.toFixed(2)}</p>
                        </div>

                        <button
                          onClick={() => setTrackingOrder(order)}
                          className="bg-[#1565C0]/5 hover:bg-[#1565C0]/10 text-[#1565C0] dark:bg-[#1565C0]/10 dark:text-[#1565C0] border border-[#1565C0]/10 px-3.5 py-2 rounded-xl text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                        >
                          <span>Acompanhar Entrega</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: LOYALTY CLUB */}
        {activeTab === 'loyalty' && (
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Programa de Fidelidade Capitão Embalagens</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-slate-100 dark:border-gray-700 space-y-2">
                <Gift className="w-8 h-8 text-[#FBC02D]" />
                <h4 className="text-xs font-semibold text-gray-800 dark:text-white uppercase tracking-tight">O que é o Capitão Cashback?</h4>
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                  Todas as suas compras na Capitão Embalagens rendem <strong>5% de cashback</strong> direto no seu perfil. Esse saldo é acumulado e aplicado de forma 100% automática no fechamento de qualquer carrinho posterior! Não expira.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-slate-100 dark:border-gray-700 space-y-2">
                <Award className="w-8 h-8 text-[#1565C0]" />
                <h4 className="text-xs font-semibold text-gray-800 dark:text-white uppercase tracking-tight">Como funcionam os Capitão Pontos?</h4>
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                  A cada R$ 5,00 gastos na loja, você acumula <strong>1 Capitão Ponto</strong>. Acumulando pontos você sobe de categoria (Bronze, Prata, Gold, Black) para liberar cupons de desconto maiores e brindes físicos especiais!
                </p>
              </div>
            </div>

            {/* Loyalty tier chart simulation */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-slate-100 dark:border-gray-700 space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-semibold text-gray-800 dark:text-white uppercase">Seu Progresso de Nível</h4>
                <span className="text-[10px] font-semibold text-[#1565C0] dark:text-blue-400">Nível Atual: Gold (350 pts)</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-750 h-3 rounded-full overflow-hidden shadow-inner flex border border-gray-200 dark:border-gray-700">
                <div className="bg-[#FBC02D] h-full rounded-full" style={{ width: '70%' }} />
              </div>
              <div className="flex justify-between text-[10px] text-gray-400">
                <span>Prata (100 pts)</span>
                <span className="font-bold text-[#1565C0]">Gold (300 pts)</span>
                <span>Black (500 pts)</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PROFILE SETTINGS */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSaveProfile} className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-3xl border border-slate-100 dark:border-gray-700 space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-tight">Dados Cadastrais</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Nome Completo</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-slate-100 dark:border-gray-700 px-3 py-2 rounded-xl text-xs text-gray-950 dark:text-white outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">E-mail de Contato</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-slate-100 dark:border-gray-700 px-3 py-2 rounded-xl text-xs text-gray-955 dark:text-white outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Celular / WhatsApp</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-slate-100 dark:border-gray-700 px-3 py-2 rounded-xl text-xs text-gray-955 dark:text-white outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Endereço Principal (Rua, Número)</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-slate-100 dark:border-gray-700 px-3 py-2 rounded-xl text-xs text-gray-955 dark:text-white outline-none"
                />
              </div>
            </div>

            <div className="border-t border-gray-100 dark:border-gray-700 pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={logoutCustomer}
                className="bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/20 dark:text-red-400 font-bold px-4 py-2.5 rounded-xl text-xs cursor-pointer transition-all active:scale-95"
              >
                🚪 Sair da Conta
              </button>
              <button
                type="submit"
                className="bg-[#1565C0] hover:bg-[#1565C0]/90 text-white font-semibold px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-all active:scale-95"
              >
                <Save className="w-4 h-4" />
                Salvar Perfil
              </button>
            </div>
            {savedSuccess && (
              <p className="text-[10px] text-emerald-600 font-bold text-right mt-1">✓ Seus dados foram salvos e sincronizados com segurança!</p>
            )}
          </form>
        )}

        {activeTab === 'settings' && (
          <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 p-4 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 text-left select-none">
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-1">
                <span>📱 Precisa de ajuda ou suporte imediato?</span>
              </h4>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-500 leading-relaxed">
                Entre em contato direto com o nosso SAC pelo WhatsApp oficial da Capitão Embalagens. Tire dúvidas de envio, cashback ou compras!
              </p>
            </div>
            <a
              href={`https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(whatsappMessage)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#25D366] hover:bg-[#20ba5a] text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shrink-0 transition-all hover:scale-103 shadow-xs"
            >
              Suporte WhatsApp 💬
            </a>
          </div>
        )}
      </div>

      {/* TRACKING AND STATUS HISTORY OVERLAY MODAL */}
      <AnimatePresence>
        {trackingOrder && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 bg-black/50 backdrop-blur-xs">
            <div className="fixed inset-0" onClick={() => setTrackingOrder(null)} />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.98, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 15 }}
              className="bg-white dark:bg-gray-900 w-full max-w-md rounded-3xl shadow-md border border-slate-100 dark:border-gray-800 p-5 space-y-4 relative text-left"
            >
              {/* Header */}
              <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-2.5">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Rastreamento de Encomenda</h3>
                  <p className="text-[10px] text-gray-400 font-mono">Pedido ID: {trackingOrder.id}</p>
                </div>
                <button 
                  onClick={() => setTrackingOrder(null)}
                  className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 cursor-pointer"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Visual Stepper */}
              <div className="flex justify-between items-center py-2 px-1 select-none">
                {[
                  { label: "Pendente", icon: "📋" },
                  { label: "Preparando", icon: "📦" },
                  { label: "Enviado", icon: "🚚" },
                  { label: "Entregue", icon: "🏠" }
                ].map((step, idx) => {
                  const states = ["Pendente", "Preparando", "Enviado", "Entregue"];
                  const currentIdx = states.indexOf(trackingOrder.status);
                  const isActive = idx <= currentIdx;
                  
                  return (
                    <div key={step.label} className="flex flex-col items-center gap-1.5 relative flex-1">
                      {/* Connection Line */}
                      {idx > 0 && (
                        <div className={`absolute right-1/2 translate-x-[-12px] top-4.5 h-0.5 w-full z-[-1] ${idx <= currentIdx ? 'bg-[#1565C0]' : 'bg-gray-200'}`} style={{ width: 'calc(100% - 24px)' }} />
                      )}
                      
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                        isActive 
                          ? 'bg-[#1565C0] border-[#1565C0] text-white shadow-sm scale-105' 
                          : 'bg-white dark:bg-gray-800 border-gray-200 text-gray-300'
                      }`}>
                        {step.icon}
                      </div>
                      <span className={`text-[9px] font-bold truncate max-w-[55px] ${isActive ? 'text-[#1565C0] dark:text-blue-400 font-bold' : 'text-gray-400'}`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Status Log Timeline list */}
              <div className="space-y-3 bg-gray-50 dark:bg-gray-900/60 p-3.5 rounded-2xl border border-slate-100 dark:border-gray-850">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Histórico de Movimentação</h4>
                
                <div className="space-y-3 max-h-40 overflow-y-auto">
                  {trackingOrder.statusHistory.slice().reverse().map((hist, i) => (
                    <div key={i} className="flex gap-2.5 relative">
                      {/* Line connecting points */}
                      {i < trackingOrder.statusHistory.length - 1 && (
                        <div className="absolute left-1.5 top-3.5 bottom-[-15px] w-0.5 bg-gray-200" />
                      )}
                      <div className="w-3 h-3 rounded-full bg-[#1565C0] ring-4 ring-blue-100 dark:ring-blue-950 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-gray-850 dark:text-white">{hist.status}</span>
                          <span className="text-[9px] font-mono text-gray-400">{hist.date}</span>
                        </div>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-normal">{hist.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tracking Carrier specs */}
              <div className="p-3 bg-slate-50 dark:bg-gray-800/50 rounded-xl border border-slate-100 text-xs flex justify-between items-center">
                <div>
                  <p className="text-[9px] uppercase font-bold text-gray-400">Código de Rastreio:</p>
                  <p className="font-mono font-bold text-[#1565C0] dark:text-blue-400 mt-0.5">{trackingOrder.trackingCode}</p>
                </div>
                <button
                  onClick={(e) => {
                    navigator.clipboard.writeText(trackingOrder.trackingCode);
                    const btn = e.currentTarget;
                    btn.innerText = "COPIADO";
                    setTimeout(() => btn.innerText = "COPIAR", 2500);
                  }}
                  className="bg-white dark:bg-gray-800 hover:bg-gray-100 text-[10px] font-semibold border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1 text-gray-600 dark:text-white cursor-pointer"
                >
                  COPIAR
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
