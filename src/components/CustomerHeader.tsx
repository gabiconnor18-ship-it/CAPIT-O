import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Search, ShoppingCart, Bell, Sun, Moon, Sparkles, X, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product } from '../types';

interface CustomerHeaderProps {
  onSearch: (term: string) => void;
  onSelectProduct: (product: Product) => void;
  onNavigateToCart: () => void;
  onNavigateToProfile: () => void;
  onNavigateToHome: () => void;
  onOpenChat: () => void;
  onOpenSchoolList: () => void;
  onOpenScanner: () => void;
}

export const CustomerHeader: React.FC<CustomerHeaderProps> = ({
  onSearch,
  onSelectProduct,
  onNavigateToCart,
  onNavigateToProfile,
  onNavigateToHome,
  onOpenChat,
  onOpenSchoolList,
  onOpenScanner
}) => {
  const { cart, activeTheme, toggleTheme, notifications, markNotificationsAsRead, isAdmin, toggleAdmin } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);
  const { products } = useApp();

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const unreadNotifs = notifications.filter(n => !n.read).length;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
    onSearch(val);
    setShowSuggestions(val.length > 0);
  };

  const filteredSuggestions = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.code.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 5);

  const handleSelectSuggestion = (p: Product) => {
    setSearchTerm(p.name);
    onSelectProduct(p);
    setShowSuggestions(false);
  };

  const handleOpenNotif = () => {
    setShowNotifDrawer(true);
    markNotificationsAsRead();
  };

  return (
    <header className="sticky top-0 z-40 bg-[#1565C0] text-white border-b border-blue-600/50 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 py-3">
        {/* Top Row: Logo, Theme, Notif, Cart */}
        <div className="flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div 
            onClick={onNavigateToHome}
            className="flex items-center gap-2 cursor-pointer hover:opacity-95 transition-opacity select-none"
            id="capi-header-logo"
          >
            <div className="bg-[#FBC02D] p-1.5 rounded-xl shadow-xs text-blue-900 flex items-center justify-center">
              {/* Cute abstract Capybara representation using emoji & styling */}
              <span className="text-xl font-bold leading-none">🦫</span>
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold tracking-tight leading-tight flex items-center gap-1">
                Capitão <span className="text-[#FBC02D]">Embalagens</span>
              </h1>
              <p className="text-[8px] text-blue-100 font-medium tracking-wider uppercase -mt-0.5">
                Premium Stationery
              </p>
            </div>
          </div>

          {/* Actions Desk & Mobile */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            <button 
              onClick={onOpenSchoolList}
              className="hidden sm:flex items-center gap-1 bg-white/10 hover:bg-white/15 px-3 py-1.5 rounded-xl text-xs font-medium border border-white/10 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#FBC02D]" />
              Lista Escolar
            </button>

            <button 
              onClick={toggleTheme}
              className="p-2 rounded-xl hover:bg-white/10 transition-all cursor-pointer text-blue-100 hover:text-white"
              title="Alternar Tema Claro/Escuro"
              id="capi-theme-toggle"
            >
              {activeTheme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-[#FBC02D]" />}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={handleOpenNotif}
                className="p-2 rounded-xl hover:bg-white/10 transition-all cursor-pointer relative text-blue-100 hover:text-white"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifs > 0 && (
                  <span className="absolute top-1 right-1 bg-red-500 text-[10px] font-bold text-white w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                    {unreadNotifs}
                  </span>
                )}
              </button>
            </div>

            {/* Shopping Cart */}
            <button 
              onClick={onNavigateToCart}
              className="flex items-center gap-1.5 bg-[#FBC02D] hover:bg-[#FBC02D]/90 text-slate-900 px-3 py-1.5 rounded-xl transition-all cursor-pointer font-semibold text-xs shadow-xs"
              id="capi-cart-button"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Carrinho</span>
              <span className="bg-slate-900 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {cartCount}
              </span>
            </button>

            {/* User Profile */}
            <button 
              onClick={onNavigateToProfile}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/15 text-white px-3 py-1.5 rounded-xl transition-all cursor-pointer font-semibold text-xs border border-white/10"
              id="capi-profile-button"
            >
              <span className="text-sm">👤</span>
              <span className="hidden sm:inline">Minha Conta</span>
            </button>


          </div>
        </div>

        {/* Search Row: Smart Search Input & suggestions */}
        <div className="mt-3 relative">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Pesquise por nome, código, marca ou categoria..."
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={() => { if (searchTerm.length > 0) setShowSuggestions(true); }}
                className="w-full pl-9 pr-4 py-2 bg-white/10 hover:bg-white/15 focus:bg-white text-white focus:text-gray-900 placeholder-blue-100 focus:placeholder-gray-400 rounded-xl border border-white/10 focus:border-white focus:ring-1 focus:ring-blue-100 transition-all outline-none text-xs"
              />
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-blue-200 pointer-events-none" />
              {searchTerm && (
                <button 
                  onClick={() => { setSearchTerm(''); onSearch(''); setShowSuggestions(false); }}
                  className="absolute right-3 top-2.5 text-blue-200 hover:text-gray-500 hover:bg-gray-100/10 focus:outline-none p-0.5 rounded"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Auto suggestions dropdown */}
          <AnimatePresence>
            {showSuggestions && filteredSuggestions.length > 0 && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowSuggestions(false)} />
                <motion.div 
                   initial={{ opacity: 0, y: -10 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -10 }}
                   className="absolute left-0 right-0 mt-1 bg-white text-gray-800 rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 max-h-72 overflow-y-auto"
                >
                  <div className="p-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                    <span>Sugestões Inteligentes Capitão</span>
                    <button onClick={() => setShowSuggestions(false)}>Fechar</button>
                  </div>
                  <ul>
                    {filteredSuggestions.map(p => (
                      <li 
                        key={p.id}
                        onClick={() => handleSelectSuggestion(p)}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 cursor-pointer border-b border-gray-50 transition-colors"
                      >
                        <img 
                          src={p.image} 
                          alt={p.name} 
                          className="w-10 h-10 object-cover rounded-lg bg-gray-100 border border-gray-200 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-gray-900 truncate">{p.name}</h4>
                          <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-0.5">
                            <span className="bg-blue-50 text-blue-600 px-1.5 py-0.2 rounded font-medium">{p.category}</span>
                            <span>• {p.brand}</span>
                            <span className="font-mono text-gray-400">Cod: {p.code}</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs font-extrabold text-blue-700">
                            R$ {(p.promoPrice || p.price).toFixed(2)}
                          </span>
                          {p.promoPrice && (
                            <div className="text-[9px] text-gray-400 line-through">
                              R$ {p.price.toFixed(2)}
                            </div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Sub-Header Navigation Links (Professional Website Style) */}
        <div className="flex flex-wrap items-center justify-between border-t border-blue-400/20 mt-3 pt-2 text-xs select-none gap-2">
          <div className="flex flex-wrap items-center gap-3 sm:gap-5 font-semibold text-blue-100">
            <button 
              onClick={onNavigateToHome} 
              className="hover:text-white transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>🏠</span> Início
            </button>
            <button 
              onClick={onOpenSchoolList} 
              className="hover:text-white transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>🎒</span> Lista Escolar
            </button>
            <button 
              onClick={onOpenChat} 
              className="hover:text-white transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>💬</span> Atendimento Online
            </button>
            <button 
              onClick={toggleAdmin} 
              className={`transition-all cursor-pointer flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                isAdmin 
                  ? 'bg-amber-400 hover:bg-amber-300 text-slate-900 border border-amber-300 shadow-md shadow-amber-400/20' 
                  : 'bg-white/10 hover:bg-white/15 text-blue-100 hover:text-white border border-white/5'
              }`}
              id="capi-toggle-admin-header"
            >
              <span>⚙️</span> {isAdmin ? "Painel Gerente Ativo" : "Ativar Modo Gerente"}
            </button>
          </div>
          <div className="text-[10px] sm:text-[11px] text-blue-200 font-medium">
            🚚 Frete Grátis nas compras acima de R$ 150
          </div>
        </div>
      </div>

      {/* Notifications Drawer */}
      <AnimatePresence>
        {showNotifDrawer && (
          <>
            <div className="fixed inset-0 bg-black/40 z-50 backdrop-blur-xs" onClick={() => setShowNotifDrawer(false)} />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 shadow-2xl z-55 flex flex-col"
            >
              <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-blue-700 text-white flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-amber-300" />
                  <h3 className="font-bold text-base">Notificações</h3>
                </div>
                <button 
                  onClick={() => setShowNotifDrawer(false)}
                  className="p-1 rounded-full hover:bg-white/10 text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {notifications.length === 0 ? (
                  <div className="text-center py-10 text-gray-400 dark:text-gray-500">
                    <Bell className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Nenhuma notificação por aqui.</p>
                  </div>
                ) : (
                  notifications.map(notif => (
                    <div 
                      key={notif.id}
                      className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 flex gap-2 relative shadow-xs"
                    >
                      <span className="text-base select-none">🦫</span>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-gray-900 dark:text-white pr-4">{notif.title}</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">{notif.description}</p>
                        <span className="text-[9px] font-mono text-gray-400 block mt-2">{notif.timestamp}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-850 shrink-0 text-center">
                <button 
                  onClick={() => setShowNotifDrawer(false)}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Fechar Central de Alertas
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};
