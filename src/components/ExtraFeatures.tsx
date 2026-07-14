import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { SchoolListItem, GiftListItem, Product } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, CheckSquare, Square, ShoppingCart, Gift, Plus, Check, Send, Camera, Eye, HelpCircle, X, QrCode } from 'lucide-react';

interface ExtraFeaturesProps {
  activeView: 'school_list' | 'gift_list' | 'scanner' | 'chat';
  onClose: () => void;
  onSelectProduct: (p: Product) => void;
}

export const ExtraFeatures: React.FC<ExtraFeaturesProps> = ({
  activeView,
  onClose,
  onSelectProduct
}) => {
  const { 
    schoolList, 
    toggleSchoolListItem, 
    addAllSchoolListToCart, 
    giftList, 
    toggleGiftListReservation, 
    addGiftItem,
    chatMessages,
    sendChatMessage,
    products,
    addToCart,
    whatsappNumber,
    whatsappMessage
  } = useApp();

  // 1. School List States
  const [selectedSchool, setSelectedSchool] = useState("Colégio Capitão Vestibulares");
  const [selectedGrade, setSelectedGrade] = useState("7º Ano Ensino Fundamental");

  // 2. Gift List States
  const [newGiftName, setNewGiftName] = useState("");
  const [newGiftDesc, setNewGiftDesc] = useState("");
  const [giftCreated, setGiftCreated] = useState(false);

  // 3. Barcode Scanner States
  const [isScanning, setIsScanning] = useState(true);
  const [scanResult, setScanResult] = useState<Product | null>(null);
  const [scanLaserPos, setScanLaserPos] = useState(0);

  // 4. Live Chat States
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll chat to bottom
  useEffect(() => {
    if (activeView === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeView]);

  // Scanner laser animation simulation
  useEffect(() => {
    if (activeView === 'scanner' && isScanning) {
      const interval = setInterval(() => {
        setScanLaserPos(prev => (prev >= 90 ? 0 : prev + 2));
      }, 30);
      return () => clearInterval(interval);
    }
  }, [activeView, isScanning]);

  const handleCreateGift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGiftName.trim()) return;
    addGiftItem(newGiftName, newGiftDesc);
    setNewGiftName("");
    setNewGiftDesc("");
    setGiftCreated(true);
    setTimeout(() => setGiftCreated(false), 2000);
  };

  const handleSimulateScan = () => {
    setIsScanning(true);
    setScanResult(null);
    
    // Simulate camera lock-on and capture after 2 seconds
    setTimeout(() => {
      setIsScanning(false);
      // Select a random product
      const randProd = products[Math.floor(Math.random() * products.length)];
      setScanResult(randProd);
    }, 2000);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendChatMessage(chatInput, 'user');
    setChatInput("");
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      {/* Click outside backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-3xl shadow-2xl border border-gray-150 dark:border-gray-800 flex flex-col max-h-[85vh] overflow-hidden text-left"
      >
        {/* HEADER SECTION */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-blue-700 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xl select-none">
              {activeView === 'school_list' && "🎒"}
              {activeView === 'gift_list' && "🎁"}
              {activeView === 'scanner' && "📷"}
              {activeView === 'chat' && "🦫"}
            </span>
            <div>
              <h3 className="font-black text-sm uppercase tracking-wider">
                {activeView === 'school_list' && "Lista de Materiais Escolares"}
                {activeView === 'gift_list' && "Lista de Presentes Especial"}
                {activeView === 'scanner' && "Scanner de Código de Barras"}
                {activeView === 'chat' && "Atendimento Live Chat Capitão"}
              </h3>
              <p className="text-[10px] text-blue-200">Recursos Extras Integrados</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTAINER WORKPLACE */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          
          {/* 1. SCHOOL LIST MANAGER */}
          {activeView === 'school_list' && (
            <div className="space-y-4">
              <div className="space-y-2.5">
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Selecione o Colégio</label>
                  <select 
                    value={selectedSchool} 
                    onChange={(e) => setSelectedSchool(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2.5 rounded-xl text-xs text-gray-850 dark:text-white outline-none"
                  >
                    <option>Colégio Capitão Vestibulares</option>
                    <option>Instituto Educacional Copivara Feliz</option>
                    <option>Escola Estadual Capivara de Prata</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Série Escolar</label>
                  <select 
                    value={selectedGrade} 
                    onChange={(e) => setSelectedGrade(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2.5 rounded-xl text-xs text-gray-850 dark:text-white outline-none"
                  >
                    <option>7º Ano Ensino Fundamental</option>
                    <option>1º Ano Ensino Médio</option>
                    <option>Alfabetização Infantil</option>
                  </select>
                </div>
              </div>

              {/* Items listing */}
              <div className="space-y-2.5 bg-gray-50 dark:bg-gray-900/40 p-4 rounded-2xl border border-gray-150 dark:border-gray-850">
                <div className="flex justify-between items-center mb-1.5">
                  <h4 className="text-xs font-black text-gray-800 dark:text-white uppercase">Lista Pedagógica ({schoolList.length} itens)</h4>
                  <span className="text-[9px] font-mono bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400 px-2 py-0.5 rounded font-black">Homologada</span>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {schoolList.map(item => (
                    <div 
                      key={item.id}
                      onClick={() => toggleSchoolListItem(item.id)}
                      className="flex items-center justify-between p-2.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-150 dark:border-gray-750 cursor-pointer text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        {item.addedToCart ? (
                          <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-gray-400 shrink-0" />
                        )}
                        <span className={`font-semibold ${item.addedToCart ? 'line-through text-gray-400' : 'text-gray-800 dark:text-gray-200'}`}>
                          {item.quantity}x {item.name}
                        </span>
                      </div>
                      <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.2 rounded font-bold shrink-0">{item.category}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => { addAllSchoolListToCart(); onClose(); }}
                  className="w-full mt-4 bg-blue-700 hover:bg-blue-800 text-white font-extrabold py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-all active:scale-95"
                >
                  <ShoppingCart className="w-4.5 h-4.5 text-amber-300" />
                  <span>Importar Todos Disponíveis no Carrinho</span>
                </button>
              </div>
            </div>
          )}

          {/* 2. GIFT LIST MANAGER */}
          {activeView === 'gift_list' && (
            <div className="space-y-4">
              {/* Creator Form */}
              <form onSubmit={handleCreateGift} className="p-3.5 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-150 dark:border-gray-800 space-y-2.5">
                <h4 className="text-xs font-black text-gray-800 dark:text-white uppercase tracking-tight flex items-center gap-1">
                  <span>➕</span> Cadastrar Desejo de Presente
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Nome do Presente (ex: Caderno, Estojo)"
                    value={newGiftName}
                    onChange={(e) => setNewGiftName(e.target.value)}
                    className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 px-3 py-1.5 rounded-xl text-xs text-gray-900 dark:text-white outline-none"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Descrição / Ocasião (ex: Niver Pedro)"
                    value={newGiftDesc}
                    onChange={(e) => setNewGiftDesc(e.target.value)}
                    className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 px-3 py-1.5 rounded-xl text-xs text-gray-900 dark:text-white outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs py-2 rounded-xl cursor-pointer"
                >
                  Cadastrar na Lista de Desejos
                </button>
                {giftCreated && <p className="text-[9px] text-emerald-600 font-bold">✓ Item cadastrado com sucesso!</p>}
              </form>

              {/* Items listing */}
              <div className="space-y-2">
                <h4 className="text-xs font-black text-gray-800 dark:text-white uppercase">Itens da Campanha de Presentes</h4>
                
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {giftList.map(item => (
                    <div 
                      key={item.id}
                      className="p-3 bg-white dark:bg-gray-850 rounded-xl border border-gray-150 dark:border-gray-750 text-xs flex justify-between items-center"
                    >
                      <div className="text-left space-y-0.5">
                        <p className="font-extrabold text-gray-800 dark:text-white flex items-center gap-1.5">
                          <Gift className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          {item.name}
                        </p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">{item.description}</p>
                      </div>

                      <button
                        onClick={() => toggleGiftListReservation(item.id)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase cursor-pointer border shrink-0 transition-all ${
                          item.reservedBy 
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400' 
                            : 'bg-blue-600 hover:bg-blue-700 border-blue-600 text-white'
                        }`}
                      >
                        {item.reservedBy ? "✓ Reservado" : "Reservar"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 3. BARCODE SCANNER SIMULATOR */}
          {activeView === 'scanner' && (
            <div className="space-y-4 text-center">
              <div className="relative w-full h-48 bg-gray-900 rounded-3xl overflow-hidden border border-gray-800 flex flex-col items-center justify-center">
                {isScanning ? (
                  <>
                    {/* Glowing camera lens background visual */}
                    <Camera className="w-12 h-12 text-blue-500/30 animate-pulse" />
                    <p className="text-[10px] text-blue-400 font-mono tracking-widest animate-pulse mt-2">VIEWFINDER ATIVO... AGUARDANDO CÓDIGO</p>
                    
                    {/* Laser Scanner animation beam */}
                    <div 
                      className="absolute left-0 right-0 h-0.5 bg-red-500 shadow-[0_0_8px_#ef4444]"
                      style={{ top: `${scanLaserPos}%` }}
                    />

                    {/* Target grid corners */}
                    <div className="absolute top-6 left-6 w-5 h-5 border-t-2 border-l-2 border-blue-400" />
                    <div className="absolute top-6 right-6 w-5 h-5 border-t-2 border-r-2 border-blue-400" />
                    <div className="absolute bottom-6 left-6 w-5 h-5 border-b-2 border-l-2 border-blue-400" />
                    <div className="absolute bottom-6 right-6 w-5 h-5 border-b-2 border-r-2 border-blue-400" />
                  </>
                ) : (
                  <div className="space-y-1">
                    <Check className="w-10 h-10 text-emerald-500 mx-auto bg-emerald-100/10 p-1.5 rounded-full" />
                    <p className="text-xs font-black text-emerald-500 tracking-wider">CÓDIGO DE BARRAS RECONHECIDO!</p>
                  </div>
                )}
              </div>

              {/* Scan Trigger buttons & results */}
              <div className="space-y-3">
                {isScanning ? (
                  <button
                    onClick={handleSimulateScan}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3 rounded-xl text-xs cursor-pointer shadow-sm animate-pulse"
                  >
                    Simular Leitura de Produto Aleatório
                  </button>
                ) : (
                  <div className="p-3 bg-gray-50 dark:bg-gray-850 rounded-2xl border border-gray-150 dark:border-gray-750 text-left flex items-center justify-between gap-3 animate-fade-in">
                    {scanResult && (
                      <>
                        <img 
                          src={scanResult.image} 
                          alt={scanResult.name} 
                          className="w-12 h-12 object-cover rounded-lg bg-white shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">{scanResult.brand}</p>
                          <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate">{scanResult.name}</h4>
                          <span className="text-[10px] font-black text-gray-800 dark:text-white mt-1 block">R$ {(scanResult.promoPrice || scanResult.price).toFixed(2)}</span>
                        </div>
                        
                        <div className="flex flex-col gap-1.5 shrink-0">
                          <button
                            onClick={() => { onSelectProduct(scanResult); onClose(); }}
                            className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase cursor-pointer"
                          >
                            Ver Detalhes
                          </button>
                          <button
                            onClick={() => { addToCart(scanResult, 1); onClose(); }}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase cursor-pointer"
                          >
                            + Carrinho
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {!isScanning && (
                  <button
                    onClick={() => { setIsScanning(true); setScanResult(null); }}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Escanear Novamente
                  </button>
                )}
              </div>
            </div>
          )}

          {/* 4. LIVE SUPPORT CHAT */}
          {activeView === 'chat' && (
            <div className="flex flex-col h-[340px]">
              {/* WhatsApp Redirection Banner */}
              <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 p-2.5 rounded-2xl flex items-center justify-between gap-3 text-left shrink-0 mb-3 select-none">
                <div className="min-w-0">
                  <h4 className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400">Canal de Atendimento Rápido</h4>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-500 leading-tight mt-0.5 truncate">Fale direto com a nossa equipe no WhatsApp!</p>
                </div>
                <a
                  href={`https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(whatsappMessage)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#25D366] hover:bg-[#20ba5a] text-white px-3 py-1.5 rounded-xl font-bold text-[10px] uppercase cursor-pointer flex items-center gap-1 shrink-0 transition-transform hover:scale-103"
                >
                  Falar no WhatsApp 💬
                </a>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2.5 p-1">
                {chatMessages.map(msg => {
                  const isSupport = msg.sender === 'support';
                  return (
                    <div 
                      key={msg.id}
                      className={`flex gap-2 max-w-[85%] ${isSupport ? 'mr-auto text-left' : 'ml-auto flex-row-reverse text-right'}`}
                    >
                      <span className="text-base leading-none select-none shrink-0 mt-1">
                        {isSupport ? "🦫" : "👤"}
                      </span>
                      <div className="space-y-0.5">
                        <div className={`p-2.5 rounded-2xl text-xs ${
                          isSupport 
                            ? 'bg-blue-50 dark:bg-blue-950/20 text-gray-850 dark:text-gray-200 border border-blue-100/20 rounded-tl-none' 
                            : 'bg-blue-700 text-white rounded-tr-none'
                        }`}>
                          <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                        </div>
                        <span className="text-[8px] font-mono text-gray-400 block px-1">{msg.timestamp}</span>
                      </div>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>

              {/* Typable messaging block */}
              <form onSubmit={handleSendChat} className="border-t border-gray-100 dark:border-gray-800 pt-3 flex gap-2 shrink-0">
                <input
                  type="text"
                  placeholder="Pergunte sobre frete, cashback, pagamentos..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-700 px-3.5 py-2.5 rounded-2xl text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:ring-1 focus:ring-blue-500 outline-none"
                />
                <button
                  type="submit"
                  className="bg-blue-700 hover:bg-blue-800 text-white p-2.5 rounded-2xl cursor-pointer"
                >
                  <Send className="w-4.5 h-4.5" />
                </button>
              </form>
            </div>
          )}
        </div>

        {/* WORKPLACE FOOTER info details */}
        <div className="p-4 border-t border-gray-150 dark:border-gray-800 bg-gray-50 dark:bg-gray-850 shrink-0 text-center flex justify-between items-center text-[10px] text-gray-400">
          <span>🛡️ Conexão Segura SSL</span>
          <span>© 2026 Capitão Embalagens S/A</span>
        </div>
      </motion.div>
    </div>
  );
};
