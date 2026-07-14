import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Product, CATEGORIES } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Heart, ShoppingCart, MessageCircle, ArrowRight, ShieldCheck, Truck, Percent, Award, Sparkles, Clock } from 'lucide-react';

interface CustomerHomeProps {
  onSelectProduct: (product: Product) => void;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  searchTerm: string;
  onOpenChat: () => void;
  onOpenSchoolList: () => void;
}

export const CustomerHome: React.FC<CustomerHomeProps> = ({
  onSelectProduct,
  selectedCategory,
  onSelectCategory,
  searchTerm,
  onOpenChat,
  onOpenSchoolList
}) => {
  const { products, addToCart, favorites, toggleFavorite, whatsappNumber, whatsappMessage } = useApp();
  const [currentBanner, setCurrentBanner] = useState(0);
  const [timeLeft, setTimeLeft] = useState({ h: 3, m: 45, s: 12 });

  const banners = [
    {
      id: 1,
      title: "Volta às Aulas Capitão!",
      subtitle: "Materiais escolares com até 20% de Desconto + Frete Grátis acima de R$150",
      cta: "Aproveitar Ofertas",
      color: "from-blue-600 to-blue-900",
      accent: "CAPIBAX",
      badge: "Desconto Especial",
      image: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=800&auto=format&fit=crop&q=80"
    },
    {
      id: 2,
      title: "Clube Capitão Pontos",
      subtitle: "Ganhe 5% de cashback em todas as compras e troque por brindes exclusivos!",
      cta: "Entrar para o Clube",
      color: "from-yellow-600 to-amber-800",
      accent: "CASHBACK",
      badge: "Fidelidade",
      image: "https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=800&auto=format&fit=crop&q=80"
    },
    {
      id: 3,
      title: "Artigos de Decoração Capivara",
      subtitle: "Luminárias touch, canecas térmicas e organizadores 360 exclusivíssimos.",
      cta: "Ver Coleção",
      color: "from-teal-600 to-blue-950",
      accent: "CAPIREI",
      badge: "Novidades",
      image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&auto=format&fit=crop&q=80"
    }
  ];

  // Daily countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.s > 0) return { ...prev, s: prev.s - 1 };
        if (prev.m > 0) return { ...prev, m: prev.m - 1, s: 59 };
        if (prev.h > 0) return { h: prev.h - 1, m: 59, s: 59 };
        return { h: 3, m: 45, s: 12 }; // reset
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Banner rotation effect
  useEffect(() => {
    const bannerTimer = setInterval(() => {
      setCurrentBanner(prev => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(bannerTimer);
  }, [banners.length]);

  // Filter products by category & search term
  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === "Todos" || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.code.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Extract deals of the day (items with a promoPrice)
  const dealsOfTheDay = products.filter(p => p.promoPrice !== undefined).slice(0, 4);

  // Quick Emoji Map for Categories
  const getCategoryEmoji = (cat: string) => {
    switch(cat) {
      case "Material Escolar": return "🎒";
      case "Cadernos": return "📓";
      case "Mochilas": return "🎒";
      case "Canetas": return "🖊️";
      case "Lápis": return "✏️";
      case "Borrachas": return "🧽";
      case "Apontadores": return "⚙️";
      case "Réguas": return "📐";
      case "Pastas": return "📁";
      case "Cartolinas": return "📄";
      case "Papel Sulfite": return "📑";
      case "Papel Fotográfico": return "🖼️";
      case "Tintas": return "🎨";
      case "Pincéis": return "🖌️";
      case "Artesanato": return "🏺";
      case "Informática": return "💻";
      case "Escritório": return "💼";
      case "Impressão": return "🖨️";
      case "Encadernação": return "📒";
      case "Plastificação": return "🛡️";
      case "Presentes": return "🎁";
      case "Decoração": return "💡";
      default: return "🦫";
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* 1. Promotional Banner Slider */}
      <div className="relative rounded-2xl overflow-hidden shadow-lg border border-blue-100 dark:border-gray-800 h-56 sm:h-64 md:h-72 select-none bg-blue-900">
        <AnimatePresence mode="wait">
          {banners.map((banner, index) => {
            if (index !== currentBanner) return null;
            return (
              <motion.div
                key={banner.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className={`absolute inset-0 bg-gradient-to-r ${banner.color} flex flex-col md:flex-row items-center justify-between p-6 md:p-8 gap-4`}
              >
                {/* Left Content */}
                <div className="flex-1 text-left space-y-2 md:space-y-3 z-10">
                  <span className="bg-amber-400 text-blue-950 font-black text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full shadow-xs">
                    {banner.badge}
                  </span>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-tight">
                    {banner.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-blue-100 max-w-md">
                    {banner.subtitle}
                  </p>
                  
                  <div className="pt-2 flex flex-wrap items-center gap-2 sm:gap-4">
                    <button 
                      onClick={banner.id === 1 ? onOpenSchoolList : onOpenChat}
                      className="bg-white hover:bg-amber-400 hover:text-blue-950 text-blue-900 font-bold text-xs px-4 py-2 rounded-xl shadow-md transition-all flex items-center gap-1 cursor-pointer"
                    >
                      {banner.cta}
                      <ArrowRight className="w-3 h-3" />
                    </button>
                    {banner.accent && (
                      <span className="text-[10px] font-mono text-amber-300 font-semibold border border-dashed border-amber-300/40 px-2 py-1 rounded-lg">
                        Cupom: <span className="font-extrabold">{banner.accent}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Right Image */}
                <div className="hidden md:block w-1/3 h-full relative">
                  <img
                    src={banner.image}
                    alt={banner.title}
                    className="w-full h-full object-cover rounded-xl shadow-2xl mix-blend-screen opacity-90"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {/* Slider dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentBanner(i)}
              className={`w-1.5 h-1.5 rounded-full transition-all ${currentBanner === i ? 'bg-[#FBC02D] w-4' : 'bg-white/40'}`}
            />
          ))}
        </div>
      </div>

      {/* 2. Customer Trust Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="flex items-center gap-2.5 p-3.5 bg-slate-50 dark:bg-gray-800 rounded-xl border border-slate-100 dark:border-gray-700/80 shadow-2xs">
          <Truck className="w-4 h-4 text-[#1565C0] dark:text-blue-400 shrink-0" />
          <div className="text-left">
            <h4 className="text-xs font-semibold text-gray-900 dark:text-white leading-tight">Entrega Rápida</h4>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-none mt-0.5">Retirada ou Envio Local</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 p-3.5 bg-slate-50 dark:bg-gray-800 rounded-xl border border-slate-100 dark:border-gray-700/80 shadow-2xs">
          <Award className="w-4 h-4 text-[#1565C0] dark:text-blue-400 shrink-0" />
          <div className="text-left">
            <h4 className="text-xs font-semibold text-gray-900 dark:text-white leading-tight">Capitão Cashback</h4>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-none mt-0.5">Ganhe 5% de volta</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 p-3.5 bg-slate-50 dark:bg-gray-800 rounded-xl border border-slate-100 dark:border-gray-700/80 shadow-2xs">
          <ShieldCheck className="w-4 h-4 text-[#1565C0] dark:text-blue-400 shrink-0" />
          <div className="text-left">
            <h4 className="text-xs font-semibold text-gray-900 dark:text-white leading-tight">Compra Segura</h4>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-none mt-0.5">Criptografia LGPD</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 p-3.5 bg-slate-50 dark:bg-gray-800 rounded-xl border border-slate-100 dark:border-gray-700/80 shadow-2xs">
          <Percent className="w-4 h-4 text-[#1565C0] dark:text-blue-400 shrink-0" />
          <div className="text-left">
            <h4 className="text-xs font-semibold text-gray-900 dark:text-white leading-tight">Melhores Preços</h4>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-none mt-0.5">Até 6x Sem Juros</p>
          </div>
        </div>
      </div>

      {/* 3. Horizontal Categories Navigation */}
      <section className="space-y-2.5">
        <div className="flex justify-between items-end">
          <h3 className="text-[10px] font-bold uppercase text-gray-400 dark:text-gray-500 tracking-wider">
            Explorar Categorias
          </h3>
          {selectedCategory !== "Todos" && (
            <button 
              onClick={() => onSelectCategory("Todos")}
              className="text-xs text-[#1565C0] dark:text-blue-400 font-semibold hover:underline"
            >
              Ver Tudo
            </button>
          )}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin select-none">
          <button
            onClick={() => onSelectCategory("Todos")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 cursor-pointer border ${
              selectedCategory === "Todos"
                ? "bg-[#1565C0] text-white border-[#1565C0] shadow-xs"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-slate-100 dark:border-gray-750 hover:border-gray-200"
            }`}
          >
            🌟 Ver Todos
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 cursor-pointer border flex items-center gap-1.5 ${
                selectedCategory === cat
                  ? "bg-[#1565C0] text-white border-[#1565C0] shadow-xs"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-slate-100 dark:border-gray-750 hover:border-gray-200"
              }`}
            >
              <span>{getCategoryEmoji(cat)}</span>
              <span>{cat}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 4. Ofertas do Dia (Lightning Deals) */}
      {selectedCategory === "Todos" && !searchTerm && (
        <section className="bg-amber-400/10 dark:bg-amber-400/5 p-4 rounded-2xl border border-amber-300/40 dark:border-amber-400/10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-300/20 dark:border-amber-400/10 pb-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-amber-400 text-blue-900 rounded-lg text-lg animate-bounce">⚡</span>
              <div>
                <h3 className="text-base font-black text-gray-900 dark:text-white tracking-tight">
                  Ofertas Relâmpago do Dia
                </h3>
                <p className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold leading-tight">
                  Estoques limitados com o selo oficial Capitão!
                </p>
              </div>
            </div>
            
            {/* Countdown clock */}
            <div className="flex items-center gap-1.5 text-xs text-blue-950 dark:text-amber-300 font-black bg-amber-400/30 dark:bg-amber-400/10 px-3 py-1 rounded-lg">
              <Clock className="w-3.5 h-3.5" />
              <span>Termina em:</span>
              <span className="font-mono bg-blue-900 text-white px-1.5 py-0.5 rounded text-[10px]">
                {String(timeLeft.h).padStart(2, '0')}
              </span>
              <span>:</span>
              <span className="font-mono bg-blue-900 text-white px-1.5 py-0.5 rounded text-[10px]">
                {String(timeLeft.m).padStart(2, '0')}
              </span>
              <span>:</span>
              <span className="font-mono bg-blue-900 text-white px-1.5 py-0.5 rounded text-[10px]">
                {String(timeLeft.s).padStart(2, '0')}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {dealsOfTheDay.map(product => {
              const discount = product.promoPrice 
                ? Math.round(((product.price - product.promoPrice) / product.price) * 100) 
                : 0;
              return (
                <div 
                  key={product.id}
                  className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-xs border border-slate-100 dark:border-gray-700/80 hover:shadow-md transition-all flex flex-col group relative"
                >
                  {/* Discount Badge */}
                  <div className="absolute top-2.5 left-2.5 bg-red-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full z-10 shadow-xs flex items-center gap-0.5">
                    <span>-{discount}%</span>
                  </div>

                  {/* Favorite Toggle */}
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(product.id); }}
                    className="absolute top-2.5 right-2.5 p-1.5 bg-white/90 dark:bg-gray-900/90 text-gray-400 hover:text-red-500 rounded-full z-10 transition-colors shadow-xs cursor-pointer"
                  >
                    <Heart className={`w-3.5 h-3.5 ${favorites.includes(product.id) ? 'fill-red-500 text-red-500' : ''}`} />
                  </button>

                  <div 
                    onClick={() => onSelectProduct(product)}
                    className="h-32 bg-gray-50 dark:bg-gray-700 relative cursor-pointer overflow-hidden"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div className="p-3.5 flex-1 flex flex-col justify-between text-left">
                    <div>
                      <span className="text-[9px] font-semibold text-[#1565C0] dark:text-blue-400 uppercase tracking-wider">{product.brand}</span>
                      <h4 
                        onClick={() => onSelectProduct(product)}
                        className="text-xs font-bold text-gray-900 dark:text-white line-clamp-2 hover:text-[#1565C0] cursor-pointer min-h-8"
                      >
                        {product.name}
                      </h4>
                    </div>

                    <div className="mt-2.5 space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-red-600 dark:text-red-400">
                          R$ {product.promoPrice?.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-gray-400 line-through">
                          R$ {product.price.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-[9px] text-gray-500 dark:text-gray-400">
                        ou 3x de R$ {((product.promoPrice || product.price) / 3).toFixed(2)}
                      </p>
                      
                      <button
                        onClick={() => addToCart(product, 1)}
                        className="w-full mt-2 bg-[#1565C0] hover:bg-[#1565C0]/90 text-white font-semibold py-1.5 rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95 shadow-xs"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        Adicionar
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 5. Main Catalog Product Grid */}
      <section className="space-y-4">
        <div className="flex justify-between items-center text-left">
          <div>
            <h3 className="text-base font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-1.5">
              <span>{selectedCategory === "Todos" ? "✨ Produtos em Destaque" : `📂 ${selectedCategory}`}</span>
            </h3>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-tight">
              {filteredProducts.length} itens encontrados para você
            </p>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-slate-100 dark:border-gray-700">
            <span className="text-3xl">🦫</span>
            <h4 className="text-sm font-semibold text-gray-800 dark:text-white mt-2">Nenhum produto cadastrado nesta categoria.</h4>
            <p className="text-xs text-gray-500 mt-1">Experimente buscar por marcas ou outras categorias!</p>
            <button 
              onClick={() => onSelectCategory("Todos")}
              className="mt-4 bg-[#1565C0] hover:bg-[#1565C0]/90 text-white px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer shadow-xs transition-all"
            >
              Ver Catálogo Completo
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5">
            {filteredProducts.map(product => {
              const isPromo = product.promoPrice !== undefined;
              return (
                <div 
                  key={product.id}
                  className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-xs hover:shadow-md border border-slate-100 dark:border-gray-700 hover:border-[#1565C0]/30 dark:hover:border-gray-600 transition-all flex flex-col justify-between text-left group relative"
                >
                  {/* Badges container */}
                  <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
                    {isPromo && (
                      <span className="bg-red-600 text-white text-[8px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                        PROMO
                      </span>
                    )}
                    {product.stock <= 5 && (
                      <span className="bg-[#FBC02D] text-slate-900 text-[8px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                        ÚLTIMAS {product.stock}
                      </span>
                    )}
                  </div>

                  {/* Heart favorite toggle */}
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(product.id); }}
                    className="absolute top-2.5 right-2.5 p-1.5 bg-white/90 dark:bg-gray-900/90 text-gray-400 hover:text-red-500 rounded-full z-10 shadow-xs transition-colors cursor-pointer"
                  >
                    <Heart className={`w-3.5 h-3.5 ${favorites.includes(product.id) ? 'fill-red-500 text-red-500' : ''}`} />
                  </button>

                  {/* Product Image */}
                  <div 
                    onClick={() => onSelectProduct(product)}
                    className="h-36 sm:h-40 bg-gray-50 dark:bg-gray-700 relative cursor-pointer overflow-hidden"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/20 to-transparent p-2 flex justify-between items-end">
                      <div className="bg-black/45 backdrop-blur-xs px-1.5 py-0.5 rounded text-[9px] text-[#FBC02D] font-extrabold flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5 fill-[#FBC02D] text-[#FBC02D]" />
                        <span>{product.rating.toFixed(1)}</span>
                      </div>
                      <span className="text-[8px] font-mono text-white/80 bg-black/30 px-1 py-0.2 rounded">
                        Cod: {product.code}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-3.5 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] font-semibold text-[#1565C0] dark:text-blue-400 uppercase tracking-widest block mb-0.5">
                        {product.brand}
                      </span>
                      <h4 
                        onClick={() => onSelectProduct(product)}
                        className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-100 leading-tight hover:text-[#1565C0] cursor-pointer line-clamp-2 min-h-8 sm:min-h-10"
                      >
                        {product.name}
                      </h4>
                    </div>

                    <div className="mt-3.5 space-y-2">
                      <div className="text-left">
                        {isPromo ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs sm:text-sm font-bold text-red-600 dark:text-red-400">
                              R$ {product.promoPrice?.toFixed(2)}
                            </span>
                            <span className="text-[10px] text-gray-400 line-through">
                              R$ {product.price.toFixed(2)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs sm:text-sm font-bold text-gray-850 dark:text-white">
                            R$ {product.price.toFixed(2)}
                          </span>
                        )}
                        <p className="text-[9px] text-gray-400 dark:text-gray-500">
                          ou 6x de R$ {((product.promoPrice || product.price) / 6).toFixed(2)} sem juros
                        </p>
                      </div>

                      {/* Add to Cart button */}
                      <button
                        onClick={() => addToCart(product, 1)}
                        className="w-full bg-[#1565C0] hover:bg-[#1565C0]/90 text-white font-semibold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs hover:shadow-md"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        Adicionar
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 6. Listas Especiais Promo Widget */}
      <section className="bg-[#1565C0] text-white rounded-2xl p-5 shadow-xs border border-blue-600/50 flex flex-col md:flex-row justify-between items-center gap-4 text-left">
        <div className="space-y-1.5 max-w-md">
          <span className="bg-[#FBC02D] text-slate-900 text-[9px] font-bold tracking-widest px-2.5 py-1 rounded-full uppercase">
            Recurso Exclusivo
          </span>
          <h3 className="text-base sm:text-lg font-semibold tracking-tight mt-1">
            Lista de Materiais de Escolas Locais 🎒🏫
          </h3>
          <p className="text-xs text-blue-100 leading-relaxed">
            Selecione a sua escola e série para carregar a lista de materiais pré-aprovados pela coordenação pedagógica. Compre todos com 1 clique!
          </p>
        </div>
        <button 
          onClick={onOpenSchoolList}
          className="bg-[#FBC02D] hover:bg-[#FBC02D]/90 text-slate-900 font-semibold text-xs px-5 py-3 rounded-xl shadow-xs cursor-pointer shrink-0 transition-all flex items-center gap-1.5"
        >
          <Sparkles className="w-4 h-4" />
          Acessar Listas de Escolas
        </button>
      </section>

      {/* 7. Floating WhatsApp Assist Widget */}
      <div className="fixed bottom-16 right-4 z-40 flex flex-col gap-2">
        {/* Playful Capivara tip bubble */}
        <div className="hidden sm:block max-w-xs bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 p-3 rounded-xl shadow-xl border border-slate-100 dark:border-gray-700 text-[10px] leading-snug font-medium select-none text-left relative">
          <div className="font-semibold text-[#1565C0] dark:text-blue-400">🦫 Capitão Dica de Hoje:</div>
          Copie o código do produto e pague via PIX para ganhar 5% extra de cashback na finalização!
          <div className="absolute -bottom-1 right-5 w-2 h-2 bg-white dark:bg-gray-800 border-r border-b border-slate-100 dark:border-gray-700 rotate-45" />
        </div>
        
        {/* Floating buttons */}
        <div className="flex gap-2 justify-end">
          <a
            href={`https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(whatsappMessage)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#25D366] hover:bg-[#20ba5a] text-white p-3.5 rounded-full shadow-2xl transition-transform hover:scale-105 active:scale-95 flex items-center justify-center relative cursor-pointer"
            title="Fale no WhatsApp"
          >
            <MessageCircle className="w-5 h-5 fill-white" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-[8px] font-bold text-white px-1 rounded-full animate-bounce">
              ON
            </span>
          </a>
        </div>
      </div>
    </div>
  );
};
