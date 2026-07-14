import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { CustomerHeader } from './components/CustomerHeader';
import { CustomerHome } from './components/CustomerHome';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CustomerCart } from './components/CustomerCart';
import { CustomerProfile } from './components/CustomerProfile';
import { ExtraFeatures } from './components/ExtraFeatures';
import { AdminPanel } from './components/AdminPanel';
import { Product } from './types';
import { 
  Smartphone, Monitor, ShieldCheck, UserCheck, LogIn, Lock, 
  HelpCircle, MessageCircle, ShoppingBag, Sparkles, AlertCircle, Gift 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

function AppContent() {
  const { 
    activeTheme, 
    isAdmin, 
    toggleAdmin, 
    products, 
    user, 
    addNotification,
    isLogged,
    loginCustomer,
    registerCustomer,
    logoutCustomer,
    loginAdmin
  } = useApp();

  // Active customer navigation sub-screen: 'home' | 'cart' | 'profile'
  const [customerScreen, setCustomerScreen] = useState<'home' | 'cart' | 'profile'>('home');
  
  // Simulated device view for customer: 'mobile' | 'web'
  const [deviceView, setDeviceView] = useState<'mobile' | 'web'>('web');

  // Search and filter state passed to Home catalog
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");

  // Selected product for detailed modal popup overlay
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Active resource view for ExtraFeatures overlay (school_list, gift_list, scanner, chat)
  const [activeExtra, setActiveExtra] = useState<'school_list' | 'gift_list' | 'scanner' | 'chat' | null>(null);

  // Auth/Login simulator overlay visibility
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'admin'>('login');
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authPhone, setAuthPhone] = useState("");
  const [authError, setAuthError] = useState("");

  // LGPD Consent state
  const [lgpdAccepted, setLgpdAccepted] = useState(() => {
    return localStorage.getItem('capi_lgpd_accepted') === 'true';
  });

  // Dynamic Clock inside mobile simulator status bar
  const [simTime, setSimTime] = useState("");
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setSimTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setSelectedCategory("Todos");
    setCustomerScreen('home');
  };

  const handleSelectCategory = (cat: string) => {
    setSelectedCategory(cat);
    setSearchTerm("");
    setCustomerScreen('home');
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    try {
      if (authMode === 'login') {
        const emailToUse = authEmail.trim() || "gabiconnor18@gmail.com";
        const passToUse = authPassword || "123456";
        await loginCustomer(emailToUse, passToUse);
      } else if (authMode === 'register') {
        if (!authName.trim() || !authEmail.trim() || !authPassword) {
          setAuthError("Nome, e-mail e senha são obrigatórios.");
          return;
        }
        await registerCustomer(authName.trim(), authEmail.trim(), authPassword, authPhone.trim());
      } else if (authMode === 'admin') {
        const emailToUse = authEmail.trim() || "admin@capitao.com";
        const passToUse = authPassword || "admin";
        await loginAdmin(emailToUse, passToUse);
      }
      setShowLoginModal(false);
      setAuthEmail("");
      setAuthPassword("");
      setAuthName("");
      setAuthPhone("");
    } catch (err: any) {
      setAuthError(err.message || "Erro ao efetuar autenticação.");
    }
  };

  const handleQuickLogin = (method: string) => {
    // Left as support fallback for social icons
    setAuthError("");
    const dummyEmail = method === 'google' ? 'google.user@capitao.com' : 'social.user@capitao.com';
    loginCustomer(dummyEmail, "123456").then(() => {
      setShowLoginModal(false);
    }).catch(() => {
      // Create user if not exists
      registerCustomer(method === 'google' ? 'Google User' : 'Social User', dummyEmail, "123456", "(11) 99999-8888").then(() => {
        setShowLoginModal(false);
      }).catch(err => {
        setAuthError(err.message || "Falha no login social.");
      });
    });
  };

  const acceptLgpd = () => {
    localStorage.setItem('capi_lgpd_accepted', 'true');
    setLgpdAccepted(true);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${activeTheme === 'dark' ? 'dark bg-gray-950 text-white' : 'bg-gray-100 text-gray-800'}`}>
      
      {/* PERSISTENT SYSTEM MANAGER BAR AT TOP */}
      <div className="bg-slate-900 border-b border-slate-950 px-4 py-2 text-white flex flex-col sm:flex-row justify-between items-center gap-3 shrink-0 text-xs z-50 relative select-none">
        {/* Toggle admin controls */}
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-blue-400">⚡ MODO DE VISUALIZAÇÃO:</span>
          <div className="bg-slate-800 p-0.5 rounded-lg flex border border-slate-700">
            <button
              onClick={() => { if (isAdmin) toggleAdmin(); }}
              className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${!isAdmin ? 'bg-blue-600 text-white font-black' : 'text-slate-400 hover:text-white'}`}
            >
              📱 Cliente Loja
            </button>
            <button
              onClick={() => { if (!isAdmin) toggleAdmin(); }}
              className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer flex items-center gap-1 ${isAdmin ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'}`}
              id="admin-panel-toggle"
            >
              <span>⚙️ Painel Admin</span>
            </button>
          </div>
        </div>

        {/* Dynamic developer tips */}
        <div className="hidden lg:flex items-center gap-2 text-[10px] text-slate-400">
          <span className="p-0.5 bg-amber-400/25 text-amber-300 rounded font-bold">Dica Dev:</span>
          <span>Faça um pedido no modo cliente e mude o status para 'Enviado' no Painel Admin para ver a atualização em tempo real!</span>
        </div>
      </div>

      {/* CORE WORKSPACE ENTRY POINT */}
      <main className="w-full">
        <AnimatePresence mode="wait">
          {isAdmin ? (
            
            // RENDERING ADMINISTRATIVE CONSOLE
            <motion.div
              key="admin-workspace"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <AdminPanel />
            </motion.div>

          ) : (

            // RENDERING THE CUSTOMER EXPERIENCE (MOBILE SIMULATOR OR FULL WEB BROWSER)
            <motion.div
              key="customer-workspace"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              {deviceView === 'mobile' ? (
                
                // 1. Sleek Mobile Phone Bezel Mockup
                <div className="py-6 px-4 flex items-center justify-center bg-gray-200/60 dark:bg-gray-950 min-h-[calc(100vh-40px)]">
                  <div className="relative w-full max-w-[420px] h-[820px] bg-slate-900 rounded-[50px] p-3.5 shadow-2xl border-[11px] border-slate-800 flex flex-col overflow-hidden ring-12 ring-slate-900/10">
                    
                    {/* Metal volume keys & power button simulation indicators */}
                    <div className="absolute left-[-15px] top-40 w-[4px] h-12 bg-slate-750 rounded-r-md" />
                    <div className="absolute left-[-15px] top-56 w-[4px] h-16 bg-slate-750 rounded-r-md" />
                    <div className="absolute right-[-15px] top-48 w-[4px] h-16 bg-slate-750 rounded-l-md" />

                    {/* Speaker notch & camera pinhole center */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-slate-900 rounded-b-2xl z-45 flex items-center justify-center gap-3">
                      <div className="w-12 h-1 bg-slate-800 rounded-full" />
                      <div className="w-3.5 h-3.5 bg-indigo-950 rounded-full border border-slate-850 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-blue-900 rounded-full" />
                      </div>
                    </div>

                    {/* Simulated Mobile Status bar */}
                    <div className="h-7 px-6 bg-[#1565C0] text-white flex justify-between items-center text-[10px] font-semibold tracking-wide shrink-0 z-40 select-none">
                      <span>{simTime || "22:35"}</span>
                      <div className="flex items-center gap-1.5">
                        <span>📶</span>
                        <span>📶</span>
                        <span>🔋 98%</span>
                      </div>
                    </div>

                    {/* Smartphone Screen Contents */}
                    <div className="flex-1 bg-gray-50 dark:bg-gray-900 overflow-y-auto rounded-b-[36px] relative flex flex-col" id="mobile-viewport-container">
                      <CustomerHeader 
                        onSearch={handleSearch}
                        onSelectProduct={(p) => setSelectedProduct(p)}
                        onNavigateToCart={() => setCustomerScreen('cart')}
                        onNavigateToProfile={() => {
                          if (isLogged) {
                            setCustomerScreen('profile');
                          } else {
                            setShowLoginModal(true);
                          }
                        }}
                        onNavigateToHome={() => setCustomerScreen('home')}
                        onOpenChat={() => setActiveExtra('chat')}
                        onOpenSchoolList={() => setActiveExtra('school_list')}
                        onOpenScanner={() => setActiveExtra('scanner')}
                      />

                      <div className="flex-1 p-3.5 overflow-y-auto">
                        {customerScreen === 'home' && (
                          <CustomerHome 
                            onSelectProduct={(p) => setSelectedProduct(p)}
                            selectedCategory={selectedCategory}
                            onSelectCategory={handleSelectCategory}
                            searchTerm={searchTerm}
                            onOpenChat={() => setActiveExtra('chat')}
                            onOpenSchoolList={() => setActiveExtra('school_list')}
                          />
                        )}
                        {customerScreen === 'cart' && (
                          <CustomerCart 
                            onBackToShopping={() => setCustomerScreen('home')}
                            onNavigateToProfile={() => setCustomerScreen('profile')}
                          />
                        )}
                        {customerScreen === 'profile' && (
                          <CustomerProfile />
                        )}
                      </div>

                      {/* Interactive Bottom Tab Bar for Smartphone experience */}
                      <nav className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 py-2 flex justify-around items-center shrink-0 text-gray-400 select-none z-30">
                        <button 
                          onClick={() => setCustomerScreen('home')}
                          className={`flex flex-col items-center gap-0.5 cursor-pointer ${customerScreen === 'home' ? 'text-[#1565C0] font-semibold' : 'hover:text-gray-600 dark:hover:text-gray-300'}`}
                        >
                          <span className="text-lg">🏪</span>
                          <span className="text-[9px]">Início</span>
                        </button>
                        <button 
                          onClick={() => { setActiveExtra('school_list'); }}
                          className="flex flex-col items-center gap-0.5 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          <span className="text-lg">🎒</span>
                          <span className="text-[9px]">Lista</span>
                        </button>
                        <button 
                          onClick={() => { setActiveExtra('scanner'); }}
                          className="flex flex-col items-center gap-0.5 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          <span className="text-lg">📷</span>
                          <span className="text-[9px]">Scanner</span>
                        </button>
                        <button 
                          onClick={() => { if (isLogged) setCustomerScreen('profile'); else setShowLoginModal(true); }}
                          className={`flex flex-col items-center gap-0.5 cursor-pointer ${customerScreen === 'profile' ? 'text-[#1565C0] font-semibold' : 'hover:text-gray-600 dark:hover:text-gray-300'}`}
                        >
                          <span className="text-lg">👤</span>
                          <span className="text-[9px]">Perfil</span>
                        </button>
                        <button 
                          onClick={() => { setActiveExtra('chat'); }}
                          className="flex flex-col items-center gap-0.5 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          <span className="text-lg">💬</span>
                          <span className="text-[9px]">Chat</span>
                        </button>
                      </nav>

                      {/* Simulated iOS physical Home indicator pill */}
                      <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-28 h-1 bg-slate-750 rounded-full z-40 pointer-events-none" />
                    </div>

                  </div>
                </div>

              ) : (

                // 2. Responsive Full-screen E-commerce Web Browser Layout
                <div className="bg-gray-50 dark:bg-gray-900 min-h-screen flex flex-col" id="web-desktop-container">
                  <CustomerHeader 
                    onSearch={handleSearch}
                    onSelectProduct={(p) => setSelectedProduct(p)}
                    onNavigateToCart={() => setCustomerScreen('cart')}
                    onNavigateToProfile={() => {
                      if (isLogged) {
                        setCustomerScreen('profile');
                      } else {
                        setShowLoginModal(true);
                      }
                    }}
                    onNavigateToHome={() => setCustomerScreen('home')}
                    onOpenChat={() => setActiveExtra('chat')}
                    onOpenSchoolList={() => setActiveExtra('school_list')}
                    onOpenScanner={() => setActiveExtra('scanner')}
                  />

                  {/* Main Web dashboard content area */}
                  <div className="max-w-7xl mx-auto px-4 py-6 flex-1 w-full text-left">
                    <div className="space-y-4">
                      {customerScreen === 'home' && (
                        <CustomerHome 
                          onSelectProduct={(p) => setSelectedProduct(p)}
                          selectedCategory={selectedCategory}
                          onSelectCategory={handleSelectCategory}
                          searchTerm={searchTerm}
                          onOpenChat={() => setActiveExtra('chat')}
                          onOpenSchoolList={() => setActiveExtra('school_list')}
                        />
                      )}
                      {customerScreen === 'cart' && (
                        <CustomerCart 
                          onBackToShopping={() => setCustomerScreen('home')}
                          onNavigateToProfile={() => setCustomerScreen('profile')}
                        />
                      )}
                      {customerScreen === 'profile' && (
                        <CustomerProfile />
                      )}
                    </div>
                  </div>

                  {/* Web Desk persistent floating helper tray */}
                  <div className="fixed bottom-6 left-6 z-40 hidden md:flex items-center gap-2">
                    <button 
                      onClick={() => setActiveExtra('chat')}
                      className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-3 rounded-xl shadow-lg border border-blue-600 font-extrabold text-xs flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105"
                    >
                      <MessageCircle className="w-4 h-4 animate-bounce" />
                      Atendimento Online Chat
                    </button>
                    <button 
                      onClick={() => setActiveExtra('gift_list')}
                      className="bg-white dark:bg-gray-800 dark:text-white hover:bg-gray-50 border border-gray-200 dark:border-gray-700 text-gray-700 px-4 py-3 rounded-xl shadow-lg font-extrabold text-xs flex items-center gap-1.5 cursor-pointer transition-all"
                    >
                      <Gift className="w-4 h-4" />
                      Lista de Presentes
                    </button>
                  </div>
                </div>

              )}
            </motion.div>

          )}
        </AnimatePresence>
      </main>

      {/* OVERLAY POPUP MODAL 1: PRODUCT DETAILED PAGE */}
      <AnimatePresence>
        {selectedProduct && (
          <ProductDetailModal 
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onSelectProduct={(p) => setSelectedProduct(p)}
          />
        )}
      </AnimatePresence>

      {/* OVERLAY POPUP MODAL 2: EXTENDED EXTRA UTILITY SUITES (SchoolList, GiftList, Scanner, Chat) */}
      <AnimatePresence>
        {activeExtra && (
          <ExtraFeatures 
            activeView={activeExtra}
            onClose={() => setActiveExtra(null)}
            onSelectProduct={(p) => setSelectedProduct(p)}
          />
        )}
      </AnimatePresence>

      {/* OVERLAY POPUP MODAL 3: REAL TIME DATABASE AUTHENTICATION & REGISTRATION FORM */}
      <AnimatePresence>
        {showLoginModal && (
          <div className="fixed inset-0 z-55 overflow-y-auto flex items-center justify-center p-3 bg-black/50 backdrop-blur-xs">
            <div className="fixed inset-0" onClick={() => setShowLoginModal(false)} />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden border border-gray-150 dark:border-gray-800 p-5 space-y-4 relative text-center"
            >
              <div className="space-y-1.5">
                <Lock className="w-10 h-10 text-blue-700 mx-auto" />
                <h3 className="text-base font-black text-gray-900 dark:text-white tracking-tight">Portal Capitão Embalagens</h3>
                <p className="text-[11px] text-gray-400">
                  {authMode === 'login' && "Acesse sua conta para cupons, cashbacks e pedidos."}
                  {authMode === 'register' && "Crie sua conta para ganhar R$ 12,50 de cashback de boas-vindas!"}
                  {authMode === 'admin' && "Painel administrativo seguro da Capitão Embalagens."}
                </p>
              </div>

              {/* Mode switching tabs */}
              <div className="flex border-b border-gray-200 dark:border-gray-800 text-xs">
                <button
                  type="button"
                  onClick={() => { setAuthMode('login'); setAuthError(""); }}
                  className={`flex-1 pb-2 font-bold transition-all cursor-pointer ${authMode === 'login' ? 'text-blue-700 border-b-2 border-blue-700' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  Entrar
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode('register'); setAuthError(""); }}
                  className={`flex-1 pb-2 font-bold transition-all cursor-pointer ${authMode === 'register' ? 'text-blue-700 border-b-2 border-blue-700' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  Cadastrar
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode('admin'); setAuthError(""); }}
                  className={`flex-1 pb-2 font-bold transition-all cursor-pointer ${authMode === 'admin' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  Admin
                </button>
              </div>

              {/* Error messages if any */}
              {authError && (
                <div className="p-2.5 bg-red-50 dark:bg-red-950/45 text-red-700 dark:text-red-300 rounded-xl text-[10px] font-bold text-left flex items-start gap-1.5 border border-red-200 dark:border-red-900">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              {/* Main inputs */}
              <form onSubmit={handleAuthSubmit} className="space-y-2.5 text-left">
                {authMode === 'register' && (
                  <>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-gray-400">Nome Completo</label>
                      <input
                        type="text"
                        required
                        placeholder="Nome Completo"
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-800 px-3 py-2 rounded-xl text-xs text-gray-900 dark:text-white outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-gray-400">Telefone / WhatsApp</label>
                      <input
                        type="text"
                        placeholder="(11) 98122-4321"
                        value={authPhone}
                        onChange={(e) => setAuthPhone(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-800 px-3 py-2 rounded-xl text-xs text-gray-900 dark:text-white outline-none"
                      />
                    </div>
                  </>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-gray-400">Endereço de E-mail</label>
                  <input
                    type="email"
                    required
                    placeholder={authMode === 'admin' ? "admin@capitao.com" : "exemplo@dominio.com"}
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-800 px-3 py-2 rounded-xl text-xs text-gray-900 dark:text-white outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-gray-400">Senha de Acesso</label>
                  <input
                    type="password"
                    required
                    placeholder="Sua senha secreta"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-800 px-3 py-2 rounded-xl text-xs text-gray-900 dark:text-white outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className={`w-full text-white font-extrabold py-2.5 rounded-xl text-xs cursor-pointer shadow-sm transition-all mt-3 ${
                    authMode === 'admin' ? 'bg-amber-500 hover:bg-amber-600 text-slate-950' : 'bg-blue-700 hover:bg-blue-800'
                  }`}
                >
                  {authMode === 'login' && "Entrar na Conta"}
                  {authMode === 'register' && "Confirmar Cadastro"}
                  {authMode === 'admin' && "Acessar Painel Admin"}
                </button>
              </form>

              {authMode !== 'admin' && (
                <>
                  <div className="relative py-2 select-none">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-150 dark:border-gray-800" /></div>
                    <span className="relative bg-white dark:bg-gray-900 px-2 text-[10px] text-gray-400 font-extrabold uppercase">Ou autenticação rápida</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button 
                      onClick={() => handleQuickLogin('google')}
                      className="py-2 px-1.5 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl text-[10px] font-bold cursor-pointer dark:text-white"
                    >
                      🌐 Google
                    </button>
                    <button 
                      onClick={() => handleQuickLogin('apple')}
                      className="py-2 px-1.5 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl text-[10px] font-bold cursor-pointer dark:text-white"
                    >
                      🍎 Apple
                    </button>
                    <button 
                      onClick={() => handleQuickLogin('facebook')}
                      className="py-2 px-1.5 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl text-[10px] font-bold cursor-pointer dark:text-white"
                    >
                      🔵 Facebook
                    </button>
                  </div>
                </>
              )}

              <div className="text-[9px] text-gray-400 pt-1 flex justify-center items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Banco de dados Supabase Oficial e conexão TLS 1.3 ativa.</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LGPD GENERAL CONSENT BAR BANNER */}
      <AnimatePresence>
        {!lgpdAccepted && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 left-4 right-4 md:right-auto md:max-w-md bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-800 z-50 text-left flex flex-col sm:flex-row items-center gap-3"
          >
            <div className="flex-1 space-y-1">
              <p className="text-xs font-black flex items-center gap-1 text-amber-300">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                CONCORDÂNCIA LGPD ASSEGURADA 🛡️
              </p>
              <p className="text-[10px] text-slate-300 leading-snug">
                Nós da Capitão Embalagens usamos cookies funcionais para personalizar sua experiência de compra, calcular cashbacks acumulados e processar transações de forma segura. Ao continuar, você concorda com nossos termos.
              </p>
            </div>
            <button 
              onClick={acceptLgpd}
              className="bg-amber-400 hover:bg-amber-300 text-blue-950 font-black text-[10px] px-3.5 py-2 rounded-xl cursor-pointer shrink-0 transition-colors uppercase"
            >
              Concordar
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
