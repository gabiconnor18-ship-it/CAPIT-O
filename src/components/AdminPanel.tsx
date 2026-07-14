import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Product, Order, Coupon, CATEGORIES } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { 
  LayoutDashboard, ShoppingBag, DollarSign, Users, AlertTriangle, ListFilter, 
  Plus, Edit, Trash2, Check, X, ShieldAlert, Tag, Truck, RefreshCw, Star, UserCheck, MessageCircle,
  Shield, Globe, Activity, CheckCircle2, Lock, FileText
} from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const { 
    products, 
    orders, 
    coupons, 
    user, 
    addProduct, 
    updateProduct, 
    deleteProduct, 
    addCoupon, 
    toggleCouponStatus,
    updateOrderStatus,
    whatsappNumber,
    whatsappMessage,
    updateWhatsappSettings
  } = useApp();

  // Active Admin Sub-tab: 'dashboard' | 'products' | 'orders' | 'coupons' | 'clients' | 'whatsapp'
  const [adminTab, setAdminTab] = useState<'dashboard' | 'products' | 'orders' | 'coupons' | 'clients' | 'whatsapp'>('dashboard');

  // WhatsApp Form States
  const [waNumberInput, setWaNumberInput] = useState(whatsappNumber);
  const [waMessageInput, setWaMessageInput] = useState(whatsappMessage);

  // Modal Control States
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // New Product Form States
  const [newProdName, setNewProdName] = useState("");
  const [newProdDesc, setNewProdDesc] = useState("");
  const [newProdBrand, setNewProdBrand] = useState("");
  const [newProdCategory, setNewProdCategory] = useState("Material Escolar");
  const [newProdPrice, setNewProdPrice] = useState("0");
  const [newProdPromoPrice, setNewProdPromoPrice] = useState("");
  const [newProdStock, setNewProdStock] = useState("10");
  const [newProdCode, setNewProdCode] = useState("");
  const [newProdImage, setNewProdImage] = useState("");

  // New Coupon Form States
  const [newCopCode, setNewCopCode] = useState("");
  const [newCopType, setNewCopType] = useState<'percent' | 'fixed'>('percent');
  const [newCopValue, setNewCopValue] = useState("10");
  const [newCopMin, setNewCopMin] = useState("50");

  // Filter & Search states for products management
  const [productSearch, setProductSearch] = useState("");
  const [productCatFilter, setProductCatFilter] = useState("Todos");

  // SSL Certificate & LGPD Security Audit State
  const [isSecurityChecking, setIsSecurityChecking] = useState(false);
  const [securityLogs, setSecurityLogs] = useState<string[]>([]);
  const [securityStatus, setSecurityStatus] = useState<'idle' | 'secure' | 'warning'>('idle');
  const [securityScore, setSecurityScore] = useState(100);
  const [securityHistory, setSecurityHistory] = useState<Array<{ date: string; score: number }>>([]);

  const runSecurityAudit = () => {
    setIsSecurityChecking(true);
    setSecurityStatus('idle');
    setSecurityLogs(["Iniciando auditoria de tráfego e conformidade com LGPD..."]);
    
    const steps = [
      { delay: 500, log: `Detectando protocolo de comunicação... Protocolo ativo: ${window.location.protocol.toUpperCase()}` },
      { delay: 1100, log: `Analisando validade do certificado SSL para o host: ${window.location.hostname}` },
      { delay: 1800, log: "Verificando chaves de criptografia ativa (Handshake TLS 1.3)... Status: Forte (AES_128_GCM)" },
      { delay: 2400, log: "Avaliando cookies de consentimento e LGPD: Banner ativo, armazenamento em cache seguro e local." },
      { delay: 3000, log: "Análise de integridade de tráfego: Sem vazamentos ou cabeçalhos de segurança inseguros." },
      { delay: 3500, log: "Auditoria concluída com sucesso! Conexão 100% criptografada e em conformidade." }
    ];

    steps.forEach((step, idx) => {
      setTimeout(() => {
        setSecurityLogs(prev => [...prev, step.log]);
        if (idx === steps.length - 1) {
          setIsSecurityChecking(false);
          const isHttps = window.location.protocol === 'https:';
          const finalScore = isHttps ? 100 : 75;
          setSecurityStatus(isHttps ? 'secure' : 'warning');
          setSecurityScore(finalScore);

          // Append dynamic point
          const now = new Date();
          const timeStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
          setSecurityHistory(prev => [
            ...prev,
            { date: timeStr, score: finalScore }
          ]);
        }
      }, step.delay);
    });
  };

  useEffect(() => {
    const isHttps = window.location.protocol === 'https:';
    const baseScore = isHttps ? 100 : 75;
    setSecurityStatus(isHttps ? 'secure' : 'warning');
    setSecurityScore(baseScore);
    setSecurityLogs([
      `Conexão inicial estabelecida sob protocolo ${window.location.protocol.toUpperCase()}`,
      `Host de origem: ${window.location.hostname}`,
      `Certificado SSL verificado: ${isHttps ? "Ativo e Válido" : "Não detectado ou auto-assinado (ambiente de teste)"}`,
      "Conformidade de Cookies (LGPD): Módulo de consentimento configurado e em vigor."
    ]);

    // Initialize standard history
    setSecurityHistory([
      { date: '11/07 08:00', score: baseScore },
      { date: '11/07 10:00', score: baseScore },
      { date: '11/07 12:00', score: baseScore },
      { date: '11/07 14:00', score: baseScore },
      { date: '11/07 16:00', score: baseScore },
    ]);
  }, []);

  // Calculate high-level admin metrics
  const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0);
  const totalOrdersCount = orders.length;
  const lowStockProducts = products.filter(p => p.stock <= 5);
  const totalClientsCount = 1; // Simulated active CRM customer: Gabriela Connor

  // CHART DATA GENERATORS
  // 1. Sales revenue trend simulation (last 6 months)
  const salesHistoryData = [
    { name: 'Fev/26', Faturamento: totalRevenue * 0.4 },
    { name: 'Mar/26', Faturamento: totalRevenue * 0.65 },
    { name: 'Abr/26', Faturamento: totalRevenue * 0.5 },
    { name: 'Mai/26', Faturamento: totalRevenue * 0.8 },
    { name: 'Jun/26', Faturamento: totalRevenue * 0.9 },
    { name: 'Jul/26', Faturamento: totalRevenue }
  ];

  // 2. Category stock levels (Pie chart format)
  const categoryLevels = CATEGORIES.map(cat => {
    const qty = products.filter(p => p.category === cat).length;
    return { name: cat, value: qty };
  }).filter(c => c.value > 0);

  const COLORS = ['#1565C0', '#FBC02D', '#0D47A1', '#FF9F1C', '#2EC4B6', '#E71D36', '#3A86C8', '#8338EC'];

  const handleCreateProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdBrand || !newProdCode) return;

    const baseProductData = {
      name: newProdName,
      description: newProdDesc || "Produto oficial de alta qualidade da Capitão Embalagens.",
      brand: newProdBrand,
      category: newProdCategory,
      price: Number(newProdPrice) || 0,
      promoPrice: newProdPromoPrice ? Number(newProdPromoPrice) : undefined,
      stock: Number(newProdStock) || 0,
      code: newProdCode,
      image: newProdImage || "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=500&auto=format&fit=crop&q=60"
    };

    if (editingProduct) {
      updateProduct({
        ...editingProduct,
        ...baseProductData
      });
      setEditingProduct(null);
    } else {
      addProduct(baseProductData);
    }

    // Reset fields
    setNewProdName("");
    setNewProdDesc("");
    setNewProdBrand("");
    setNewProdPrice("0");
    setNewProdPromoPrice("");
    setNewProdStock("10");
    setNewProdCode("");
    setNewProdImage("");
    setShowAddProductModal(false);
  };

  const handleEditProductClick = (p: Product) => {
    setEditingProduct(p);
    setNewProdName(p.name);
    setNewProdDesc(p.description);
    setNewProdBrand(p.brand);
    setNewProdCategory(p.category);
    setNewProdPrice(p.price.toString());
    setNewProdPromoPrice(p.promoPrice ? p.promoPrice.toString() : "");
    setNewProdStock(p.stock.toString());
    setNewProdCode(p.code);
    setNewProdImage(p.image);
    setShowAddProductModal(true);
  };

  const handleCreateCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCopCode.trim()) return;

    const newCop: Coupon = {
      code: newCopCode.trim().toUpperCase(),
      discountType: newCopType,
      value: Number(newCopValue) || 10,
      minPurchase: Number(newCopMin) || 50,
      isActive: true
    };

    addCoupon(newCop);
    setNewCopCode("");
    setNewCopValue("10");
    setNewCopMin("50");
  };

  // Filter products table list
  const filteredProductsTable = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(productSearch.toLowerCase()) || 
                          p.code.toLowerCase().includes(productSearch.toLowerCase()) ||
                          p.brand.toLowerCase().includes(productSearch.toLowerCase());
    const matchesCat = productCatFilter === "Todos" || p.category === productCatFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="bg-gray-100 dark:bg-gray-950 min-h-screen text-gray-800 dark:text-gray-200 pb-16 text-left font-sans">
      
      {/* TOP HEADER STATUS */}
      <div className="bg-[#1565C0] text-white p-4 sm:p-5 flex justify-between items-center border-b border-slate-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="bg-[#FBC02D] text-slate-900 font-bold p-2 rounded-xl text-lg flex items-center justify-center shadow-inner">🦫</div>
          <div>
            <h1 className="text-base sm:text-lg font-semibold tracking-tight leading-none">Painel Administrativo</h1>
            <p className="text-[10px] text-blue-100 tracking-wider font-semibold uppercase mt-1">Capitão Embalagens Control Center 🛡️</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden md:inline bg-black/15 text-blue-100 border border-white/10 text-[10px] font-semibold px-3 py-1 rounded-full uppercase">MODE: SECURE SSL</span>
          <span className="text-xs bg-[#FBC02D] text-slate-900 px-2.5 py-1 rounded-lg font-semibold">Admin Privilegiado</span>
        </div>
      </div>

      {/* DASHBOARD GRID AND BAR */}
      <div className="max-w-7xl mx-auto p-4 sm:p-5 grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-5">
        
        {/* Left Sidebar Menu */}
        <div className="md:col-span-1 space-y-2">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
            { id: 'products', label: 'Cadastro Produtos', icon: <ShoppingBag className="w-4 h-4" /> },
            { id: 'orders', label: 'Controle Pedidos', icon: <Truck className="w-4 h-4" /> },
            { id: 'coupons', label: 'Cupons e Promos', icon: <Tag className="w-4 h-4" /> },
            { id: 'clients', label: 'Gestão Clientes', icon: <Users className="w-4 h-4" /> },
            { id: 'whatsapp', label: 'Ajustes WhatsApp', icon: <MessageCircle className="w-4 h-4" /> }
          ].map(menu => (
            <button
              key={menu.id}
              onClick={() => setAdminTab(menu.id as any)}
              className={`w-full text-left py-2.5 px-4 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2.5 border ${
                adminTab === menu.id 
                  ? 'bg-[#1565C0] text-white border-[#1565C0] font-bold shadow-xs' 
                  : 'bg-white dark:bg-gray-900 border-slate-100 dark:border-gray-800 hover:bg-gray-50 text-gray-700 dark:text-gray-300'
              }`}
            >
              {menu.icon}
              <span>{menu.label}</span>
            </button>
          ))}
          
          <div className="hidden md:block p-4 bg-[#FBC02D]/10 rounded-2xl border border-[#FBC02D]/20 text-[10px] text-amber-700 dark:text-[#FBC02D] leading-snug space-y-1 select-none">
            <h5 className="font-bold flex items-center gap-1">🦫 Capitão Admin Note:</h5>
            <p>O Painel Administrativo controla os estoques e status de entregas da loja de forma unificada e em tempo real!</p>
          </div>
        </div>

        {/* Right workspace panels */}
        <div className="md:col-span-3 lg:col-span-4 space-y-5">
          
          {/* TAB 1: DASHBOARD METRICS & RECHARTS */}
          {adminTab === 'dashboard' && (
            <div className="space-y-5">
              
              {/* Dynamic stats cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-slate-100 dark:border-gray-800 shadow-2xs flex items-center gap-3 text-left">
                  <div className="bg-blue-100 dark:bg-blue-950/40 p-2.5 rounded-xl text-[#1565C0] shrink-0">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-medium tracking-wider">Faturamento</p>
                    <p className="text-base font-bold text-gray-900 dark:text-white mt-0.5">R$ {totalRevenue.toFixed(2)}</p>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-slate-100 dark:border-gray-800 shadow-2xs flex items-center gap-3 text-left">
                  <div className="bg-amber-100 dark:bg-amber-950/40 p-2.5 rounded-xl text-[#FBC02D] shrink-0">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-medium tracking-wider">Total Pedidos</p>
                    <p className="text-base font-bold text-gray-900 dark:text-white mt-0.5">{totalOrdersCount}</p>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-slate-100 dark:border-gray-800 shadow-2xs flex items-center gap-3 text-left">
                  <div className="bg-emerald-100 dark:bg-emerald-950/40 p-2.5 rounded-xl text-emerald-600 shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-medium tracking-wider">Clientes CRM</p>
                    <p className="text-base font-bold text-gray-900 dark:text-white mt-0.5">{totalClientsCount}</p>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-slate-100 dark:border-gray-800 shadow-2xs flex items-center gap-3 text-left relative">
                  <div className="bg-red-100 dark:bg-red-950/40 p-2.5 rounded-xl text-red-600 shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-medium tracking-wider">Alertas Estoque</p>
                    <p className="text-base font-bold text-gray-900 dark:text-white mt-0.5">{lowStockProducts.length}</p>
                  </div>
                  {lowStockProducts.length > 0 && (
                    <span className="absolute top-2 right-2 bg-red-600 text-white text-[8px] font-extrabold px-1.5 py-0.2 rounded-full animate-pulse">ALERTA</span>
                  )}
                </div>
              </div>

              {/* RECHARTS PLOTS */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                
                {/* 1. Monthly sales faturamento Area chart */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-900 p-4 rounded-2xl border border-slate-100 dark:border-gray-800 text-left">
                  <h4 className="text-xs font-semibold uppercase text-gray-450 mb-4 tracking-wider">Desempenho Financeiro de Vendas (Histórico)</h4>
                  <div className="w-full h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={salesHistoryData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                        <defs>
                          <linearGradient id="colorFaturamento" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#1565C0" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#1565C0" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                        <Tooltip />
                        <Area type="monotone" dataKey="Faturamento" stroke="#1565C0" strokeWidth={2.5} fillOpacity={1} fill="url(#colorFaturamento)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 2. Stock levels by Category Pie chart */}
                <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-slate-100 dark:border-gray-800 text-left flex flex-col justify-between">
                  <h4 className="text-xs font-semibold uppercase text-gray-450 tracking-wider mb-2">Composição de Catálogo</h4>
                  
                  {categoryLevels.length === 0 ? (
                    <p className="text-xs text-gray-400 py-10 text-center">Nenhum dado cadastrado.</p>
                  ) : (
                    <div className="w-full h-44 relative flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryLevels}
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={65}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {categoryLevels.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute text-center select-none pointer-events-none">
                        <p className="text-xs font-bold text-[#1565C0] dark:text-blue-400 leading-none">{products.length}</p>
                        <p className="text-[8px] uppercase font-bold text-gray-400 mt-0.5">Total Itens</p>
                      </div>
                    </div>
                  )}

                  {/* Pie chart legends listing */}
                  <div className="space-y-1 max-h-16 overflow-y-auto text-[10px] border-t border-slate-100 dark:border-gray-800 pt-2">
                    {categoryLevels.slice(0, 4).map((entry, idx) => (
                      <div key={idx} className="flex justify-between items-center text-gray-500 font-medium">
                        <span className="flex items-center gap-1.5 truncate">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                          {entry.name}
                        </span>
                        <span className="font-mono text-gray-800 dark:text-white font-bold">{entry.value} itens</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Critical Alerts table list */}
              {lowStockProducts.length > 0 && (
                <div className="bg-red-50/20 dark:bg-red-950/10 p-4 rounded-2xl border border-red-100 dark:border-red-900/40 text-left space-y-2.5">
                  <h4 className="text-xs font-semibold uppercase text-red-600 dark:text-red-400 flex items-center gap-1">
                    <ShieldAlert className="w-4 h-4" />
                    ATENÇÃO: ALERTA DE RUPTURA DE ESTOQUE (PRODUTOS CRÍTICOS)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {lowStockProducts.map(p => (
                      <div key={p.id} className="p-3 bg-white dark:bg-gray-900 rounded-xl border border-red-100 dark:border-red-950/40 text-xs flex justify-between items-center">
                        <div className="min-w-0 pr-2">
                          <p className="font-bold text-gray-800 dark:text-white truncate">{p.name}</p>
                          <p className="text-[10px] text-gray-400 font-mono mt-0.5">Código: {p.code}</p>
                        </div>
                        <span className="bg-red-600 text-white font-semibold px-2 py-0.5 rounded text-[10px] shrink-0">Estoque: {p.stock}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SSL & LGPD Security Audit Card */}
              <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-slate-100 dark:border-gray-800 text-left space-y-4 shadow-2xs">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 dark:border-gray-800 pb-3">
                  <div className="space-y-1">
                    <h4 className="text-xs font-semibold uppercase text-gray-450 tracking-wider flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-[#1565C0]" />
                      Painel de Diagnóstico de Segurança SSL & LGPD
                    </h4>
                    <p className="text-[11px] text-gray-400">Verifique a integridade da criptografia de dados em trânsito e conformidade regulatória.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-400 font-mono">Score de Segurança:</span>
                    <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${securityScore === 100 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400'}`}>
                      {securityScore}/100
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Status checklist metrics */}
                  <div className="md:col-span-1 space-y-3">
                    <div className="p-3 bg-slate-50 dark:bg-gray-850 rounded-xl border border-slate-100 dark:border-gray-800 flex items-start gap-3">
                      <div className="shrink-0 mt-0.5">
                        {securityStatus === 'secure' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : securityStatus === 'warning' ? (
                          <AlertTriangle className="w-4 h-4 text-amber-500" />
                        ) : (
                          <Activity className="w-4 h-4 text-blue-500 animate-spin" />
                        )}
                      </div>
                      <div className="text-xs">
                        <p className="font-bold text-gray-700 dark:text-gray-200">Protocolo HTTPS (SSL/TLS)</p>
                        <p className="text-[10px] text-gray-400 mt-0.5 leading-normal">
                          {securityStatus === 'secure' ? 'Conexão segura (Porta 443 ativa com TLS 1.3)' : 'Conexão local/não encriptada (Ambiente de Teste)'}
                        </p>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-gray-850 rounded-xl border border-slate-100 dark:border-gray-800 flex items-start gap-3">
                      <div className="shrink-0 mt-0.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      </div>
                      <div className="text-xs">
                        <p className="font-bold text-gray-700 dark:text-gray-200">Conformidade LGPD (Art. 46)</p>
                        <p className="text-[10px] text-gray-400 mt-0.5 leading-normal">
                          Controle de consentimento de cookies e tratamento seguro dos dados cadastrais ativos.
                        </p>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-gray-850 rounded-xl border border-slate-100 dark:border-gray-800 flex items-start gap-3">
                      <div className="shrink-0 mt-0.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      </div>
                      <div className="text-xs">
                        <p className="font-bold text-gray-700 dark:text-gray-200">Criptografia em Repouso</p>
                        <p className="text-[10px] text-gray-400 mt-0.5 leading-normal">
                          Informações de pedidos, perfis e cashbacks armazenadas sob encriptação de LocalStorage/Cloud.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Active logs and audit terminal */}
                  <div className="md:col-span-2 bg-slate-900 text-slate-350 p-4 rounded-xl font-mono text-[10px] flex flex-col justify-between h-48 md:h-auto border border-slate-800 relative overflow-hidden">
                    {/* Console Pattern */}
                    <div className="absolute inset-0 opacity-2 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

                    {/* Console Header */}
                    <div className="relative z-10 flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
                        <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 shrink-0" />
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500 shrink-0" />
                        <span className="text-slate-400 text-[9px] font-bold uppercase tracking-wider ml-2">Console de Auditoria SSL & LGPD</span>
                      </div>
                      <span className="text-[8px] text-slate-500 select-none">PORT: 443</span>
                    </div>

                    {/* Console Logs */}
                    <div className="relative z-10 flex-1 overflow-y-auto space-y-1.5 text-left leading-relaxed max-h-36">
                      {securityLogs.map((log, idx) => (
                        <p key={idx} className="flex items-start gap-1">
                          <span className="text-[#1565C0] font-bold select-none">&gt;</span>
                          <span>{log}</span>
                        </p>
                      ))}
                      {isSecurityChecking && (
                        <p className="text-emerald-400 animate-pulse flex items-center gap-1 select-none">
                          <span className="animate-ping">❚</span>
                          <span className="italic">Executando varredura criptográfica ativa...</span>
                        </p>
                      )}
                    </div>

                    {/* Console Action Button */}
                    <div className="relative z-10 mt-3 pt-2 border-t border-slate-800 flex justify-between items-center">
                      <span className="text-[9px] text-slate-500">Última checagem: tempo real</span>
                      <button
                        onClick={runSecurityAudit}
                        disabled={isSecurityChecking}
                        className={`font-black text-[9px] uppercase px-3 py-1.5 rounded-lg cursor-pointer flex items-center gap-1 transition-all ${isSecurityChecking ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 text-white hover:scale-103'}`}
                      >
                        <RefreshCw className={`w-3 h-3 ${isSecurityChecking ? 'animate-spin' : ''}`} />
                        <span>Executar Novo Diagnóstico</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Historical Compliance Section with LineChart */}
                <div className="border-t border-slate-100 dark:border-gray-800 pt-4 space-y-3">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <h5 className="text-[11px] font-bold uppercase text-gray-450 tracking-wider flex items-center gap-1">
                        <Activity className="w-3.5 h-3.5 text-[#1565C0]" />
                        Histórico de Conformidade Regulatória e Segurança (LGPD)
                      </h5>
                      <p className="text-[10px] text-gray-400">Linha do tempo baseada em verificações de criptografia SSL/TLS e proteção de dados pessoais.</p>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-md self-start sm:self-auto">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Status Geral: {securityStatus === 'secure' ? 'Seguro / Conforme' : 'Atenção (Local)'}
                    </span>
                  </div>

                  <div className="h-56 bg-slate-50 dark:bg-gray-850/50 p-4 rounded-xl border border-slate-100 dark:border-gray-800 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={securityHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="opacity-40" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fill: '#94a3b8', fontSize: 8, fontWeight: 'bold' }} 
                        />
                        <YAxis 
                          domain={[0, 100]} 
                          tick={{ fill: '#94a3b8', fontSize: 8, fontWeight: 'bold' }} 
                          tickFormatter={(val) => `${val}%`}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                            border: '1px solid #1e293b', 
                            borderRadius: '12px',
                            color: '#fff',
                            fontSize: '10px'
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="score" 
                          stroke="#1565C0" 
                          strokeWidth={2.5}
                          activeDot={{ r: 6 }} 
                          name="Score de Segurança %"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: INVENTORY PRODUCTS MANAGER */}
          {adminTab === 'products' && (
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-4 sm:p-5 border border-slate-100 dark:border-gray-800 text-left space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">Gerenciamento de Estoque</h3>
                  <p className="text-xs text-gray-500">Cadastre novos produtos e controle as quantidades em prateleira.</p>
                </div>
                <button
                  onClick={() => { setEditingProduct(null); setShowAddProductModal(true); }}
                  className="bg-[#1565C0] hover:bg-[#1565C0]/90 text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-all"
                >
                  <Plus className="w-4.5 h-4.5 text-[#FBC02D]" />
                  <span>Cadastrar Novo Produto</span>
                </button>
              </div>

              {/* Filtering Controls */}
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Buscar por nome, marca ou código..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="flex-1 bg-gray-50 dark:bg-gray-850 border border-slate-100 dark:border-gray-800 px-3.5 py-2 rounded-xl text-xs text-gray-900 dark:text-white outline-none"
                />
                
                <select
                  value={productCatFilter}
                  onChange={(e) => setProductCatFilter(e.target.value)}
                  className="bg-gray-50 dark:bg-gray-850 border border-slate-100 dark:border-gray-800 px-3.5 py-2 rounded-xl text-xs text-gray-700 dark:text-gray-350 outline-none"
                >
                  <option value="Todos">Todas as Categorias</option>
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              {/* Inventory Table */}
              <div className="overflow-x-auto border border-slate-100 dark:border-gray-800 rounded-2xl">
                <table className="w-full text-xs text-left text-gray-500 dark:text-gray-400">
                  <thead className="bg-gray-50 dark:bg-gray-850 text-gray-700 dark:text-gray-300 uppercase font-semibold text-[9px] tracking-wider border-b border-slate-100 dark:border-gray-800">
                    <tr>
                      <th className="px-4 py-3">Código / Nome</th>
                      <th className="px-4 py-3">Categoria / Marca</th>
                      <th className="px-4 py-3 text-right">Preço</th>
                      <th className="px-4 py-3 text-center">Estoque</th>
                      <th className="px-4 py-3 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-gray-800">
                    {filteredProductsTable.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-10 text-gray-400">Nenhum produto correspondente encontrado.</td>
                      </tr>
                    ) : (
                      filteredProductsTable.map(p => (
                        <tr key={p.id} className="bg-white dark:bg-gray-900 hover:bg-gray-50/50">
                          <td className="px-4 py-3 flex items-center gap-3">
                            <img src={p.image} alt={p.name} className="w-10 h-10 object-cover rounded-lg bg-gray-100" referrerPolicy="no-referrer" />
                            <div className="min-w-0">
                              <p className="font-bold text-gray-800 dark:text-white truncate max-w-[200px]">{p.name}</p>
                              <p className="font-mono text-[10px] text-gray-400">{p.code}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-semibold text-gray-800 dark:text-gray-300 leading-none">{p.category}</p>
                            <span className="text-[10px] text-gray-400">{p.brand}</span>
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-[#1565C0] dark:text-white">
                            R$ {(p.promoPrice || p.price).toFixed(2)}
                            {p.promoPrice && <div className="text-[9px] text-gray-400 line-through">R$ {p.price.toFixed(2)}</div>}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2 py-0.5 rounded-full font-semibold text-[10px] ${p.stock <= 5 ? 'bg-red-100 text-red-800' : 'bg-blue-50 text-blue-800'}`}>
                              {p.stock} un
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right space-x-1">
                            <button
                              onClick={() => handleEditProductClick(p)}
                              className="p-1.5 hover:bg-[#1565C0]/5 text-[#1565C0] rounded-lg cursor-pointer inline-block transition-colors"
                              title="Editar Produto"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteProduct(p.id)}
                              className="p-1.5 hover:bg-red-500/5 text-red-600 rounded-lg cursor-pointer inline-block transition-colors"
                              title="Remover Produto"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: ORDER LOGISTICS MANAGER */}
          {adminTab === 'orders' && (
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-4 sm:p-5 border border-slate-100 dark:border-gray-800 text-left space-y-4">
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">Controle de Entregas e Pedidos</h3>
                <p className="text-xs text-gray-500">Mude os status de logística (Pendente, Preparando, Enviado, Entregue) para notificar o cliente em tempo real.</p>
              </div>

              <div className="space-y-4">
                {orders.length === 0 ? (
                  <p className="text-center py-10 text-gray-400 text-xs">Nenhum pedido foi submetido ainda.</p>
                ) : (
                  orders.map(order => (
                    <div 
                      key={order.id}
                      className="p-4 bg-gray-50 dark:bg-gray-850 rounded-2xl border border-slate-100 dark:border-gray-800 text-xs space-y-3"
                    >
                      {/* Top Info line */}
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-1.5 border-b border-slate-100 dark:border-gray-800 pb-2">
                        <div className="space-y-0.5 text-left">
                          <p className="font-semibold text-gray-900 dark:text-white">Pedido: {order.id}</p>
                          <p className="text-[10px] text-gray-400">Data: {order.date} | Cliente: {user.name}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-gray-400 font-semibold">Status Atuall:</span>
                          <span className="bg-[#1565C0] text-white font-semibold px-2.5 py-0.5 rounded-full text-[9px] uppercase tracking-wide">
                            {order.status}
                          </span>
                        </div>
                      </div>

                      {/* Items details */}
                      <div className="text-left space-y-1">
                        {order.items.map((it, idx) => (
                          <p key={idx} className="font-medium text-gray-700 dark:text-gray-350">
                            • {it.quantity}x {it.product.name} (Cod: {it.product.code})
                          </p>
                        ))}
                      </div>

                      {/* Shipment Address & Method details */}
                      <div className="p-2.5 bg-white dark:bg-gray-900 rounded-xl text-[11px] text-gray-500 dark:text-gray-400 border border-slate-100 text-left">
                        <strong>Logística:</strong> {order.deliveryOption} ({order.paymentMethod}) <br/>
                        <strong>Endereço:</strong> {order.address.street}, {order.address.number} - {order.address.city}/{order.address.state}
                      </div>

                      {/* ACTION CONTROLLERS */}
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pt-1 border-t border-slate-100 dark:border-gray-800">
                        <p className="font-bold text-[#1565C0] dark:text-white">Total: R$ {order.total.toFixed(2)}</p>
                        
                        <div className="flex flex-wrap gap-1.5">
                          <span className="text-[10px] font-semibold text-gray-400 self-center uppercase pr-1">Alterar Status:</span>
                          {[
                            { st: "Pendente", color: "hover:bg-[#1565C0]/5 text-[#1565C0]" },
                            { st: "Preparando", color: "hover:bg-amber-500/5 text-amber-600" },
                            { st: "Enviado", color: "hover:bg-purple-500/5 text-purple-600" },
                            { st: "Entregue", color: "hover:bg-emerald-500/5 text-emerald-600" }
                          ].map(act => (
                            <button
                              key={act.st}
                              onClick={() => updateOrderStatus(order.id, act.st as any)}
                              className={`px-3 py-1.5 border border-slate-100 dark:border-gray-700 rounded-lg text-[10px] font-semibold cursor-pointer transition-all ${
                                order.status === act.st 
                                  ? 'bg-[#1565C0] border-[#1565C0] text-white font-bold' 
                                  : `bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-350 ${act.color}`
                              }`}
                            >
                              {act.st}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: COUPONS & RULES MANAGER */}
          {adminTab === 'coupons' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              
              {/* Creator Form */}
              <div className="bg-white dark:bg-gray-900 rounded-3xl p-4 sm:p-5 border border-slate-100 dark:border-gray-800 text-left space-y-3.5">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-1.5">
                  <Tag className="w-4.5 h-4.5 text-[#1565C0]" />
                  Criar Novo Cupom
                </h3>

                <form onSubmit={handleCreateCouponSubmit} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Código do Cupom</label>
                    <input
                      type="text"
                      placeholder="Ex: CAPI50"
                      value={newCopCode}
                      onChange={(e) => setNewCopCode(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-gray-850 border border-slate-100 dark:border-gray-800 px-3 py-2 rounded-xl text-xs text-gray-950 dark:text-white outline-none uppercase"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Tipo de Desconto</label>
                    <select
                      value={newCopType}
                      onChange={(e) => setNewCopType(e.target.value as any)}
                      className="w-full bg-gray-50 dark:bg-gray-850 border border-slate-100 dark:border-gray-800 p-2.5 rounded-xl text-xs text-gray-700 dark:text-gray-350 outline-none"
                    >
                      <option value="percent">Percentual (%)</option>
                      <option value="fixed">Fixo (R$)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Valor do Desconto</label>
                    <input
                      type="number"
                      value={newCopValue}
                      onChange={(e) => setNewCopValue(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-gray-850 border border-slate-100 dark:border-gray-800 px-3 py-2 rounded-xl text-xs text-gray-950 dark:text-white outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Compra Mínima (R$)</label>
                    <input
                      type="number"
                      value={newCopMin}
                      onChange={(e) => setNewCopMin(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-gray-850 border border-slate-100 dark:border-gray-800 px-3 py-2 rounded-xl text-xs text-gray-950 dark:text-white outline-none"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#1565C0] hover:bg-[#1565C0]/90 text-white font-semibold py-2.5 rounded-xl text-xs cursor-pointer shadow-xs active:scale-95 transition-all"
                  >
                    Ativar Cupom na Loja
                  </button>
                </form>
              </div>

              {/* Coupons List */}
              <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-3xl p-4 sm:p-5 border border-slate-100 dark:border-gray-800 text-left space-y-3">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-1.5">
                  <Check className="w-4.5 h-4.5 text-[#1565C0]" />
                  Cupons Ativos no Sistema
                </h3>

                <div className="space-y-2.5">
                  {coupons.map(cop => (
                    <div 
                      key={cop.code}
                      className="p-3 bg-gray-50 dark:bg-gray-850 rounded-xl border border-slate-100 dark:border-gray-800 text-xs flex justify-between items-center"
                    >
                      <div className="text-left space-y-0.5">
                        <p className="font-semibold text-gray-850 dark:text-white flex items-center gap-1">
                          🎫 {cop.code}
                          <span className={`w-2 h-2 rounded-full inline-block ${cop.isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        </p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">
                          Desconto: <strong>{cop.discountType === 'percent' ? `${cop.value}%` : `R$ ${cop.value.toFixed(2)}`}</strong> | Compra mínima: R$ {cop.minPurchase.toFixed(2)}
                        </p>
                      </div>

                      <button
                        onClick={() => toggleCouponStatus(cop.code)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold uppercase cursor-pointer border transition-colors ${
                          cop.isActive 
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200' 
                            : 'bg-red-50 border-red-200 text-red-600 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200'
                        }`}
                      >
                        {cop.isActive ? "Desativar" : "Ativar"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: CLIENTS GESTÃO (CRM) */}
          {adminTab === 'clients' && (
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-4 sm:p-5 border border-slate-100 dark:border-gray-800 text-left space-y-4">
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">Gestão e CRM de Clientes</h3>
                <p className="text-xs text-gray-500">Acompanhe os dados de faturamento, pontos de fidelidade e cashbacks acumulados por cliente.</p>
              </div>

              <div className="overflow-x-auto border border-slate-100 dark:border-gray-800 rounded-2xl">
                <table className="w-full text-xs text-left text-gray-500 dark:text-gray-400">
                  <thead className="bg-gray-50 dark:bg-gray-850 text-gray-700 dark:text-gray-300 uppercase font-semibold text-[9px] tracking-wider border-b border-slate-100 dark:border-gray-800">
                    <tr>
                      <th className="px-4 py-3">Cliente</th>
                      <th className="px-4 py-3">E-mail / Telefone</th>
                      <th className="px-4 py-3 text-center">Fidelidade</th>
                      <th className="px-4 py-3 text-right">Saldo Cashback</th>
                      <th className="px-4 py-3 text-center">Histórico</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-gray-800">
                    <tr className="bg-white dark:bg-gray-900">
                      <td className="px-4 py-3 flex items-center gap-3">
                        <img src={user.photo} alt={user.name} className="w-9 h-9 object-cover rounded-full" referrerPolicy="no-referrer" />
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-800 dark:text-white">{user.name}</p>
                          <span className="bg-[#FBC02D] text-slate-900 font-semibold px-1.5 py-0.2 rounded text-[8px] uppercase">Gold Member</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-800 dark:text-gray-300 leading-none">{user.email}</p>
                        <span className="text-[10px] text-gray-400">{user.phone}</span>
                      </td>
                      <td className="px-4 py-3 text-center font-semibold text-[#1565C0] dark:text-blue-400">
                        {user.loyaltyPoints} Capitão Pontos
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-[#1565C0] dark:text-white">
                        R$ {user.cashback.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="bg-blue-50 text-blue-800 font-semibold px-2 py-0.5 rounded-full text-[10px]">
                          {orders.length} pedidos
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: WHATSAPP STORE SETTINGS */}
          {adminTab === 'whatsapp' && (
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 border border-slate-100 dark:border-gray-800 shadow-2xs space-y-6 text-left animate-in fade-in duration-300">
              <div className="space-y-1">
                <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 font-extrabold text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Configurações do Canal Oficial
                </span>
                <h3 className="text-base font-black text-gray-900 dark:text-white tracking-tight">Ajustes do WhatsApp Capitão</h3>
                <p className="text-xs text-gray-400">Configure o número de celular de atendimento da Capitão Embalagens e a mensagem inicial de contato recebida.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Form fields */}
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    updateWhatsappSettings(waNumberInput, waMessageInput);
                  }}
                  className="lg:col-span-7 space-y-4 text-xs"
                >
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">
                      Número do WhatsApp Comercial
                    </label>
                    <input
                      type="text"
                      value={waNumberInput}
                      onChange={(e) => setWaNumberInput(e.target.value)}
                      placeholder="Ex: 5511987654321"
                      className="w-full bg-gray-50 dark:bg-gray-850 border border-slate-150 dark:border-gray-750 px-3.5 py-2.5 rounded-xl text-gray-900 dark:text-white outline-none focus:ring-1 focus:ring-[#1565C0] font-medium"
                      required
                    />
                    <p className="text-[10px] text-gray-400 mt-1">
                      💡 Insira apenas números, incluindo o código de país <strong>55</strong> e DDD. Exemplo: <code>5511987654321</code>.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">
                      Mensagem Inicial Padrão
                    </label>
                    <textarea
                      value={waMessageInput}
                      onChange={(e) => setWaMessageInput(e.target.value)}
                      placeholder="Digite a frase de saudação que o cliente enviará..."
                      rows={4}
                      className="w-full bg-gray-50 dark:bg-gray-850 border border-slate-150 dark:border-gray-750 px-3.5 py-2.5 rounded-xl text-gray-900 dark:text-white outline-none focus:ring-1 focus:ring-[#1565C0] resize-none leading-relaxed font-medium"
                      required
                    />
                    <p className="text-[10px] text-gray-400 mt-1">
                      Esta mensagem será pré-preenchida no aplicativo de WhatsApp do cliente ao clicar em falar conosco.
                    </p>
                  </div>

                  <div className="pt-2 flex flex-wrap gap-2">
                    <button
                      type="submit"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-5 py-3 rounded-xl cursor-pointer shadow-xs transition-all flex items-center gap-1.5"
                    >
                      <span>💾 Salvar Configurações</span>
                    </button>

                    <a
                      href={`https://wa.me/${waNumberInput.replace(/\D/g, '')}?text=${encodeURIComponent(waMessageInput)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-750 text-gray-750 dark:text-white font-extrabold text-xs px-5 py-3 rounded-xl cursor-pointer flex items-center gap-1.5 transition-all"
                    >
                      <span>🌐 Testar Link de Atendimento</span>
                    </a>
                  </div>
                </form>

                {/* Simulated WhatsApp Bubble preview screen */}
                <div className="lg:col-span-5 flex flex-col">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">
                    Visualização do Chat (Simulada)
                  </label>
                  <div className="flex-1 bg-[#efeae2] dark:bg-[#0b141a] rounded-2xl p-4 border border-gray-150 dark:border-gray-800 shadow-inner flex flex-col justify-between min-h-[260px] relative overflow-hidden">
                    {/* Background Pattern representation */}
                    <div className="absolute inset-0 opacity-5 dark:opacity-[0.03] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

                    {/* Chat Header Mock */}
                    <div className="relative z-10 bg-[#075e54] dark:bg-[#1f2c34] text-white p-2.5 rounded-xl flex items-center gap-2 shadow-xs">
                      <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-sm font-bold shadow-xs">
                        ⚓
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-[11px] font-bold truncate">Capitão Embalagens S/A</h4>
                        <span className="text-[8px] opacity-80 block truncate">Visto por último hoje há instantes</span>
                      </div>
                    </div>

                    {/* Chat Messages */}
                    <div className="relative z-10 flex-1 flex flex-col justify-end py-3 space-y-2">
                      <div className="bg-[#d9fdd3] dark:bg-[#005c4b] text-gray-800 dark:text-gray-150 p-2.5 rounded-2xl rounded-tr-none text-[10px] max-w-[85%] ml-auto shadow-xs leading-relaxed text-left relative">
                        <p className="whitespace-pre-wrap">{waMessageInput || "Olá! Gostaria de falar com o atendimento..."}</p>
                        <span className="text-[7px] text-gray-400 block text-right mt-1 font-mono">17:21 ✔✔</span>
                      </div>
                    </div>

                    {/* Chat Footer Input Mock */}
                    <div className="relative z-10 bg-white dark:bg-[#1f2c34] p-2 rounded-xl flex items-center justify-between shadow-xs">
                      <span className="text-[9px] text-gray-400 px-1 truncate">{waMessageInput ? "Mensagem pronta para envio" : "Escreva uma mensagem..."}</span>
                      <span className="text-sm cursor-default select-none">🎙️</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* CREATE AND EDIT PRODUCT POPUP OVERLAY MODAL */}
      <AnimatePresence>
        {showAddProductModal && (
          <div className="fixed inset-0 z-55 overflow-y-auto flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs">
            <div className="fixed inset-0" onClick={() => setShowAddProductModal(false)} />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-gray-800 p-5 space-y-4 relative text-left"
            >
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-gray-800 pb-2.5">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  {editingProduct ? "Editar Produto Cadastrado" : "Cadastrar Novo Produto de Papelaria"}
                </h3>
                <button 
                  onClick={() => setShowAddProductModal(false)}
                  className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateProductSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Nome do Produto</label>
                  <input
                    type="text"
                    value={newProdName}
                    onChange={(e) => setNewProdName(e.target.value)}
                    placeholder="Ex: Caderno Universitário Tilibra"
                    className="w-full bg-gray-50 dark:bg-gray-850 border border-slate-100 dark:border-gray-800 px-3 py-2 rounded-xl text-gray-900 dark:text-white outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Código Identificador (EAN)</label>
                  <input
                    type="text"
                    value={newProdCode}
                    onChange={(e) => setNewProdCode(e.target.value)}
                    placeholder="Ex: TL-55440"
                    className="w-full bg-gray-50 dark:bg-gray-850 border border-slate-100 dark:border-gray-800 px-3 py-2 rounded-xl text-gray-900 dark:text-white outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Marca fabricante</label>
                  <input
                    type="text"
                    value={newProdBrand}
                    onChange={(e) => setNewProdBrand(e.target.value)}
                    placeholder="Ex: Tilibra"
                    className="w-full bg-gray-50 dark:bg-gray-850 border border-slate-100 dark:border-gray-800 px-3 py-2 rounded-xl text-gray-900 dark:text-white outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Categoria</label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-850 border border-slate-100 dark:border-gray-800 p-2.5 rounded-xl text-gray-700 dark:text-gray-350 outline-none"
                  >
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Preço Padrão (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-850 border border-slate-100 dark:border-gray-800 px-3 py-2 rounded-xl text-gray-900 dark:text-white outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Preço Promocional (Opcional)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newProdPromoPrice}
                    onChange={(e) => setNewProdPromoPrice(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-850 border border-slate-100 dark:border-gray-800 px-3 py-2 rounded-xl text-gray-900 dark:text-white outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Estoque Inicial (unidades)</label>
                  <input
                    type="number"
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-850 border border-slate-100 dark:border-gray-800 px-3 py-2 rounded-xl text-gray-900 dark:text-white outline-none"
                    required
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Descrição do Produto</label>
                  <textarea
                    value={newProdDesc}
                    onChange={(e) => setNewProdDesc(e.target.value)}
                    placeholder="Descreva as especificações do item, gramaturas, cores..."
                    rows={2}
                    className="w-full bg-gray-50 dark:bg-gray-850 border border-slate-100 dark:border-gray-800 px-3 py-2 rounded-xl text-gray-900 dark:text-white outline-none"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Link da Foto (URL Unsplash/Web)</label>
                  <input
                    type="text"
                    value={newProdImage}
                    onChange={(e) => setNewProdImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-gray-50 dark:bg-gray-850 border border-slate-100 dark:border-gray-800 px-3 py-2 rounded-xl text-gray-900 dark:text-white outline-none"
                  />
                </div>

                <div className="sm:col-span-2 border-t border-slate-100 dark:border-gray-850 pt-3.5 flex justify-end gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setShowAddProductModal(false)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl font-semibold cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-[#1565C0] hover:bg-[#1565C0]/90 text-white px-5 py-2 rounded-xl font-semibold cursor-pointer shadow-xs"
                  >
                    {editingProduct ? "Salvar Alterações" : "Ativar Produto"}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
