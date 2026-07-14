import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { CustomerHeader } from './components/CustomerHeader';
import { CustomerHome } from './components/CustomerHome';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CustomerCart } from './components/CustomerCart';
import { CustomerProfile } from './components/CustomerProfile';
import { ExtraFeatures } from './components/ExtraFeatures';
import { Product } from './types';
import { 
  Smartphone, Monitor, ShieldCheck, UserCheck, LogIn, Lock, 
  HelpCircle, MessageCircle, ShoppingBag, Sparkles, AlertCircle, Gift,
  X, Mail, User
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

function AppContent() {
  const { 
    activeTheme, 
    products, 
    user, 
    addNotification,
    isLogged,
    loginCustomer,
    registerCustomer,
    logoutCustomer
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
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
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
      
      {/* CORE WORKSPACE ENTRY POINT */}
      <main className="w-full">
        <AnimatePresence mode="wait">
          {/* RENDERING THE CUSTOMER EXPERIENCE (RESPONSIVE FULL-SCREEN E-COMMERCE WEBSITE) */}
          <motion.div
            key="customer-workspace"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full"
          >
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
          </motion.div>
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
          <div className="fixed inset-0 z-55 overflow-y-auto flex items-center justify-center p-3 bg-black/60 backdrop-blur-md">
            <div className="fixed inset-0 transition-opacity bg-slate-900/40" onClick={() => setShowLoginModal(false)} />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.93, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 20 }}
              className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden border border-gray-150 dark:border-gray-850 p-6 space-y-4 relative text-center"
            >
              {/* Close Button */}
              <button 
                onClick={() => setShowLoginModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-850 cursor-pointer z-10"
                id="close-auth-modal"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-2">
                <div className="mx-auto w-12 h-12 bg-blue-50 dark:bg-blue-950/40 rounded-full flex items-center justify-center border border-blue-100 dark:border-blue-900/40">
                  {authMode === 'login' ? (
                    <LogIn className="w-5 h-5 text-blue-700 dark:text-blue-400" />
                  ) : (
                    <UserCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-900 dark:text-white tracking-tight">
                    {authMode === 'login' ? 'Entrar no Portal' : 'Criar Nova Conta'}
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                    {authMode === 'login' && "Acesse seu perfil de cliente para gerenciar cashbacks e ver pedidos."}
                    {authMode === 'register' && "Crie sua conta hoje para acumular cashbacks e descontos exclusivos."}
                  </p>
                </div>
              </div>

              {/* Mode switching tabs */}
              <div className="grid grid-cols-2 p-1 bg-gray-100 dark:bg-gray-850 rounded-2xl text-xs font-bold gap-1">
                <button
                  type="button"
                  onClick={() => { setAuthMode('login'); setAuthError(""); }}
                  className={`py-2 rounded-xl transition-all cursor-pointer text-center ${
                    authMode === 'login' 
                      ? 'bg-white dark:bg-gray-700 text-blue-700 dark:text-white shadow-xs' 
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                >
                  Entrar
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode('register'); setAuthError(""); }}
                  className={`py-2 rounded-xl transition-all cursor-pointer text-center ${
                    authMode === 'register' 
                      ? 'bg-white dark:bg-gray-700 text-blue-700 dark:text-white shadow-xs' 
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                >
                  Cadastrar
                </button>
              </div>

              {/* Error messages if any */}
              {authError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 rounded-2xl text-[10px] font-bold text-left flex items-start gap-2 border border-red-200 dark:border-red-900">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}

              {/* Main inputs */}
              <form onSubmit={handleAuthSubmit} className="space-y-3 text-left">
                {authMode === 'register' && (
                  <>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-extrabold text-gray-400 dark:text-gray-500 tracking-wider">Nome Completo</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          required
                          placeholder="Digite seu nome"
                          value={authName}
                          onChange={(e) => setAuthName(e.target.value)}
                          className="w-full bg-gray-50 dark:bg-gray-850 border border-gray-250 dark:border-gray-800 pl-10 pr-4 py-2 rounded-2xl text-xs text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-extrabold text-gray-400 dark:text-gray-500 tracking-wider">Telefone / WhatsApp</label>
                      <div className="relative">
                        <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="(11) 98122-4321"
                          value={authPhone}
                          onChange={(e) => setAuthPhone(e.target.value)}
                          className="w-full bg-gray-50 dark:bg-gray-850 border border-gray-250 dark:border-gray-800 pl-10 pr-4 py-2 rounded-2xl text-xs text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-extrabold text-gray-400 dark:text-gray-500 tracking-wider">Endereço de E-mail</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      required
                      placeholder="seu.email@exemplo.com"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-gray-850 border border-gray-250 dark:border-gray-800 pl-10 pr-4 py-2 rounded-2xl text-xs text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-extrabold text-gray-400 dark:text-gray-500 tracking-wider">Senha de Acesso</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="password"
                      required
                      placeholder="Sua senha secreta"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-gray-850 border border-gray-250 dark:border-gray-800 pl-10 pr-4 py-2 rounded-2xl text-xs text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full text-white font-extrabold py-2.5 rounded-2xl text-xs cursor-pointer shadow-md shadow-blue-500/10 hover:shadow-blue-500/20 transition-all mt-4 bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-800 hover:to-blue-700 active:scale-[0.98]"
                >
                  {authMode === 'login' ? "Acessar Minha Conta" : "Criar Conta & Ganhar R$ 12,50"}
                </button>
              </form>

              {authMode !== 'register' && (
                <>
                  <div className="relative py-2 select-none">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-150 dark:border-gray-800" /></div>
                    <span className="relative bg-white dark:bg-gray-900 px-3 text-[9px] text-gray-400 dark:text-gray-500 font-extrabold uppercase tracking-wide">Ou acessar com</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button 
                      onClick={() => handleQuickLogin('google')}
                      className="flex items-center justify-center gap-1 py-2 px-1 border border-gray-200 dark:border-gray-850 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-2xl text-[10px] font-bold cursor-pointer dark:text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <span className="text-xs">🌐</span>
                      <span className="ml-1 text-[9px]">Google</span>
                    </button>
                    <button 
                      onClick={() => handleQuickLogin('apple')}
                      className="flex items-center justify-center gap-1 py-2 px-1 border border-gray-200 dark:border-gray-850 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-2xl text-[10px] font-bold cursor-pointer dark:text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <span className="text-xs">🍎</span>
                      <span className="ml-1 text-[9px]">Apple</span>
                    </button>
                    <button 
                      onClick={() => handleQuickLogin('facebook')}
                      className="flex items-center justify-center gap-1 py-2 px-1 border border-gray-200 dark:border-gray-850 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-2xl text-[10px] font-bold cursor-pointer dark:text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <span className="text-xs">🔵</span>
                      <span className="ml-1 text-[9px]">Facebook</span>
                    </button>
                  </div>
                </>
              )}

              <div className="text-[9px] text-gray-400 dark:text-gray-500 pt-2 flex justify-center items-center gap-1 border-t border-gray-100 dark:border-gray-800/80">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>Navegação criptografada de alta segurança ativa (TLS 1.3).</span>
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
