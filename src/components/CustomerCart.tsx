import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingCart, Trash2, ArrowLeft, Plus, Minus, Tag, Truck, CreditCard, 
  ShieldCheck, QrCode, FileText, CheckCircle2, Ticket, Clock, Copy, Check, X 
} from 'lucide-react';
import { Coupon } from '../types';

interface CustomerCartProps {
  onBackToShopping: () => void;
  onNavigateToProfile: () => void;
}

export const CustomerCart: React.FC<CustomerCartProps> = ({
  onBackToShopping,
  onNavigateToProfile
}) => {
  const { 
    cart, 
    updateCartQuantity, 
    removeFromCart, 
    coupons, 
    user, 
    placeOrder, 
    clearCart 
  } = useApp();

  // Navigation state inside cart: 'cart' | 'checkout' | 'success'
  const [cartStep, setCartStep] = useState<'cart' | 'checkout' | 'success'>('cart');
  
  // Checkout choices
  const [selectedAddressId, setSelectedAddressId] = useState(user.addresses[0]?.id || "");
  const [deliveryOption, setDeliveryOption] = useState<string>("Retirada na Loja");
  const [paymentMethod, setPaymentMethod] = useState<string>("PIX");
  
  // Coupon state
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState(false);

  // Credit card form states
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  // Placed order success tracker
  const [placedOrder, setPlacedOrder] = useState<any>(null);

  // Payment Modal states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pixTimer, setPixTimer] = useState(600); // 10 mins in seconds
  const [pixStatus, setPixStatus] = useState<'pending' | 'success'>('pending');
  const [copiedPix, setCopiedPix] = useState(false);

  // Countdown timer effect for PIX payment modal
  useEffect(() => {
    if (!showPaymentModal || pixStatus !== 'pending' || paymentMethod !== 'PIX') return;
    
    const timer = setInterval(() => {
      setPixTimer(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [showPaymentModal, pixStatus, paymentMethod]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const subtotal = cart.reduce((acc, item) => {
    const price = item.product.promoPrice || item.product.price;
    return acc + (price * item.quantity);
  }, 0);

  // Dynamic Shipping Cost
  const getShippingCost = () => {
    if (deliveryOption === "Entrega Local") return 10.00;
    if (deliveryOption === "Transportadora") return 19.90;
    return 0.00; // Retirada
  };

  // Coupon calculation
  const getCouponDiscount = () => {
    if (!appliedCoupon) return 0;
    if (subtotal < appliedCoupon.minPurchase) return 0;
    if (appliedCoupon.discountType === 'percent') {
      return subtotal * (appliedCoupon.value / 100);
    } else {
      return appliedCoupon.value;
    }
  };

  const shippingCost = getShippingCost();
  const discountCost = getCouponDiscount();
  const cashbackAvailable = user.cashback;
  const finalTotal = Math.max(0, subtotal + shippingCost - discountCost - cashbackAvailable);

  const handleApplyCoupon = () => {
    setCouponError("");
    setCouponSuccess(false);
    const code = couponInput.trim().toUpperCase();
    
    if (!code) {
      setCouponError("Por favor, insira o código de um cupom.");
      return;
    }

    const found = coupons.find(c => c.code.toUpperCase() === code);
    if (!found) {
      setCouponError("Cupom inválido ou expirado.");
      return;
    }
    if (!found.isActive) {
      setCouponError("Esse cupom não está ativo.");
      return;
    }
    if (subtotal < found.minPurchase) {
      setCouponError(`Compra mínima para este cupom é R$ ${found.minPurchase.toFixed(2)}.`);
      return;
    }

    setAppliedCoupon(found);
    setCouponSuccess(true);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponSuccess(false);
    setCouponInput("");
  };

  const handleFinalizeOrder = () => {
    // Generate order through Context
    const order = placeOrder(
      paymentMethod,
      deliveryOption,
      selectedAddressId,
      appliedCoupon?.code || null
    );
    setPlacedOrder(order);
    setPixTimer(600); // Reset timer to 10 minutes
    setPixStatus('pending'); // Reset PIX status to pending
    setCopiedPix(false); // Reset copied state
    setShowPaymentModal(true); // Open the Payment Modal overlay!
    setCartStep('success');
  };

  // Helper formatters
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  return (
    <div className="space-y-4 pb-20 text-left">
      
      {/* HEADER SECTION WITH STEP TRACKING */}
      <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl border border-slate-100 dark:border-gray-700">
        <button 
          onClick={cartStep === 'checkout' ? () => setCartStep('cart') : onBackToShopping}
          className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:text-[#1565C0] cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{cartStep === 'checkout' ? "Voltar ao Carrinho" : "Voltar às Compras"}</span>
        </button>
        
        <div className="flex gap-2 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-gray-400 select-none">
          <span className={cartStep === 'cart' ? 'text-[#1565C0] font-bold' : 'text-gray-400'}>1. Carrinho</span>
          <span>•</span>
          <span className={cartStep === 'checkout' ? 'text-[#1565C0] font-bold' : 'text-gray-400'}>2. Pagamento</span>
          <span>•</span>
          <span className={cartStep === 'success' ? 'text-emerald-600 font-bold' : 'text-gray-400'}>3. Sucesso</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        
        {/* STEP 1: SHOPPING CART */}
        {cartStep === 'cart' && (
          <motion.div 
            key="cart-step"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-5"
          >
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-[#1565C0]" />
                Seu Carrinho ({cart.length} {cart.length === 1 ? 'item' : 'itens'})
              </h2>

              {cart.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-3xl border border-slate-100 dark:border-gray-700 space-y-3">
                  <span className="text-4xl">🛒🦫</span>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Seu carrinho Capitão está vazio.</h3>
                  <p className="text-xs text-gray-400 max-w-xs mx-auto">Navegue pelas nossas categorias incríveis e adicione os melhores materiais escolares hoje!</p>
                  <button 
                    onClick={onBackToShopping}
                    className="bg-[#1565C0] hover:bg-[#1565C0]/90 text-white font-semibold py-2.5 px-5 rounded-xl text-xs cursor-pointer shadow-xs transition-all"
                  >
                    Começar a Comprar
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map(item => {
                    const price = item.product.promoPrice || item.product.price;
                    return (
                      <div 
                        key={item.product.id}
                        className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-2xl border border-slate-100 dark:border-gray-700 flex items-center gap-3 sm:gap-4 shadow-2xs relative"
                      >
                        <img 
                          src={item.product.image} 
                          alt={item.product.name} 
                          className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl bg-gray-50 border border-slate-100 shrink-0"
                          referrerPolicy="no-referrer"
                        />

                        <div className="flex-1 min-w-0 pr-4">
                          <span className="text-[9px] font-semibold text-[#1565C0] dark:text-blue-400 uppercase tracking-widest">{item.product.brand}</span>
                          <h4 className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{item.product.name}</h4>
                          
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs sm:text-sm font-bold text-gray-950 dark:text-white">
                              R$ {price.toFixed(2)}
                            </span>
                            {item.product.promoPrice && (
                              <span className="text-[10px] text-gray-400 line-through">
                                R$ {item.product.price.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Quantity Controller & Delete */}
                        <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0">
                          <div className="flex items-center border border-slate-100 dark:border-gray-700 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-900">
                            <button 
                              onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                              className="p-1 sm:p-1.5 hover:bg-gray-200 text-gray-500 cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2.5 font-bold text-xs text-gray-850 dark:text-white">
                              {item.quantity}
                            </span>
                            <button 
                              onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                              className="p-1 sm:p-1.5 hover:bg-gray-200 text-gray-500 cursor-pointer"
                              disabled={item.quantity >= item.product.stock}
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                            title="Remover Item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Checkout Ledger / Summary panel */}
            {cart.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Resumo do Pedido</h3>
                
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-slate-100 dark:border-gray-700 shadow-xs space-y-4">
                  {/* Coupon Application */}
                  <div className="space-y-2 pb-2 border-b border-gray-100 dark:border-gray-700">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Cupom de Desconto</label>
                    {appliedCoupon ? (
                      <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/20 p-2.5 rounded-xl border border-emerald-100 text-emerald-800 dark:text-emerald-400">
                        <div className="flex items-center gap-1.5 text-xs font-bold">
                          <Ticket className="w-4 h-4 text-emerald-600 animate-pulse" />
                          <span>ATIVO: <span className="font-extrabold">{appliedCoupon.code}</span></span>
                        </div>
                        <button 
                          onClick={handleRemoveCoupon}
                          className="text-[10px] font-bold uppercase hover:underline text-red-500 cursor-pointer"
                        >
                          Remover
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-1.5">
                        <div className="relative flex-1">
                          <input
                            type="text"
                            placeholder="Ex: CAPIBAX"
                            value={couponInput}
                            onChange={(e) => { setCouponInput(e.target.value); setCouponError(""); }}
                            className="w-full bg-gray-50 dark:bg-gray-900 border border-slate-100 dark:border-gray-700 px-3 py-2 rounded-xl text-xs text-gray-900 dark:text-white placeholder-gray-400 uppercase outline-none focus:ring-1 focus:ring-blue-500"
                          />
                          <Tag className="absolute right-3 top-2.5 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                        </div>
                        <button
                          onClick={handleApplyCoupon}
                          className="bg-[#1565C0] hover:bg-[#1565C0]/90 text-white font-semibold text-xs px-4 rounded-xl cursor-pointer transition-all"
                        >
                          Aplicar
                        </button>
                      </div>
                    )}
                    {couponError && <p className="text-[10px] text-red-500 font-bold">{couponError}</p>}
                    {couponSuccess && <p className="text-[10px] text-emerald-600 font-bold">✓ Cupom ativado com sucesso! Aproveite.</p>}
                  </div>

                  {/* Summary math block */}
                  <div className="space-y-2 text-xs border-b border-gray-100 dark:border-gray-700 pb-3">
                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                      <span>Subtotal</span>
                      <span className="font-bold text-gray-800 dark:text-white">R$ {subtotal.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                      <span>Desconto Cupom</span>
                      <span className="font-bold text-red-600">- R$ {discountCost.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                      <span>Capitão Cashback Aplicado</span>
                      <span className="font-bold text-red-600">- R$ {cashbackAvailable.toFixed(2)}</span>
                    </div>

                    <p className="text-[9px] text-gray-400 font-medium leading-none">
                      Seu saldo anterior de R$ {cashbackAvailable.toFixed(2)} de cashback foi usado integralmente!
                    </p>
                  </div>

                  {/* Estimated Delivery option quick info inside summary */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm font-black text-gray-900 dark:text-white">
                      <span>Total Parcial</span>
                      <span>R$ {(subtotal - discountCost - cashbackAvailable > 0 ? subtotal - discountCost - cashbackAvailable : 0).toFixed(2)}</span>
                    </div>
                    <p className="text-[9px] text-gray-400 font-medium">Frete e opções de parcelamento serão definidos na próxima tela.</p>
                  </div>

                  <button
                    onClick={() => setCartStep('checkout')}
                    className="w-full bg-[#FBC02D] hover:bg-[#FBC02D]/90 text-slate-900 font-semibold py-3 rounded-xl text-xs sm:text-sm text-center shadow-xs cursor-pointer transition-all flex items-center justify-center gap-2 active:scale-95"
                  >
                    <span>Prosseguir para Pagamento</span>
                    <ArrowLeft className="w-4 h-4 rotate-180" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* STEP 2: CHECKOUT & PAYMENT */}
        {cartStep === 'checkout' && (
          <motion.div 
            key="checkout-step"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-5"
          >
            {/* Options configuration */}
            <div className="lg:col-span-2 space-y-4">
              {/* 1. Address Section */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-4 border border-slate-100 dark:border-gray-700 shadow-xs space-y-3">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white tracking-tight flex items-center gap-1.5">
                  <span className="text-lg">📍</span>
                  Endereço de Entrega
                </h3>
                
                <div className="grid grid-cols-1 gap-2.5">
                  {user.addresses.map(addr => (
                    <div 
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all text-left flex justify-between items-center ${
                        selectedAddressId === addr.id 
                          ? 'border-[#1565C0] bg-[#1565C0]/5 dark:bg-[#1565C0]/10' 
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-xs">
                        <p className="font-semibold text-gray-800 dark:text-white">
                          {addr.street}, {addr.number} {addr.isDefault && <span className="bg-[#1565C0] text-white text-[8px] px-1.5 py-0.2 rounded font-bold uppercase ml-1">Padrão</span>}
                        </p>
                        <p className="text-gray-500 dark:text-gray-400 mt-0.5">{addr.city} - {addr.state} | CEP: {addr.zipCode}</p>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedAddressId === addr.id ? 'border-[#1565C0]' : 'border-gray-300'}`}>
                        {selectedAddressId === addr.id && <div className="w-2.5 h-2.5 bg-[#1565C0] rounded-full" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Delivery Options */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-4 border border-slate-100 dark:border-gray-700 shadow-xs space-y-3">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white tracking-tight flex items-center gap-1.5">
                  <Truck className="w-4.5 h-4.5 text-[#1565C0]" />
                  Método de Envio
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    { name: "Retirada na Loja", desc: "Retire em 2 horas", price: 0.00 },
                    { name: "Entrega Local", desc: "Expressa em 24 horas", price: 10.00 },
                    { name: "Transportadora", desc: "Correios em 3-5 dias", price: 19.90 }
                  ].map(opt => (
                    <div
                      key={opt.name}
                      onClick={() => setDeliveryOption(opt.name)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all text-left flex flex-col justify-between ${
                        deliveryOption === opt.name
                          ? 'border-[#1565C0] bg-[#1565C0]/5 dark:bg-[#1565C0]/10'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div>
                        <p className="text-xs font-semibold text-gray-850 dark:text-white leading-tight">{opt.name}</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">{opt.desc}</p>
                      </div>
                      <span className="text-xs font-bold text-[#1565C0] dark:text-blue-400 mt-3 block">
                        {opt.price === 0 ? "GRÁTIS" : `R$ ${opt.price.toFixed(2)}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Payment Option Selection */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-4 border border-slate-100 dark:border-gray-700 shadow-xs space-y-3">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white tracking-tight flex items-center gap-1.5">
                  <CreditCard className="w-4.5 h-4.5 text-[#1565C0]" />
                  Opção de Pagamento
                </h3>

                <div className="grid grid-cols-2 gap-2 pb-2">
                  {[
                    { id: "PIX", label: "PIX (5% Desc)", icon: "⚡" },
                    { id: "OnDelivery", label: "Na Entrega", icon: "💵" }
                  ].map(pay => (
                    <button
                      key={pay.id}
                      onClick={() => setPaymentMethod(pay.id)}
                      className={`py-2 px-3 rounded-xl border font-bold text-xs flex flex-col items-center gap-1 cursor-pointer transition-all ${
                        paymentMethod === pay.id
                          ? 'border-[#1565C0] bg-[#1565C0] text-white'
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-350 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-lg select-none">{pay.icon}</span>
                      <span className="text-[10px]">{pay.label}</span>
                    </button>
                  ))}
                </div>

                {/* Sub-form based on choice */}
                <div className="p-3 bg-gray-50 dark:bg-gray-900/60 rounded-xl border border-gray-150 dark:border-gray-850">
                  {paymentMethod === 'PIX' && (
                    <div className="text-center space-y-2 py-1">
                      <div className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full inline-block">
                        ⚡ PIX CAPI-RÁPIDO COM 5% DE DESCONTO EXCLUSIVO!
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-300 leading-snug">
                        O código QR Code PIX e chave copy-paste serão exibidos após clicar em "Finalizar Pedido" para sua total comodidade.
                      </p>
                    </div>
                  )}

                  {paymentMethod === 'OnDelivery' && (
                    <div className="text-center py-2 space-y-1">
                      <p className="text-xs font-bold text-gray-800 dark:text-gray-200">Pagamento na Entrega / Retirada</p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-snug">
                        Realize o pagamento de forma segura no ato do recebimento ou retirada. Aceitamos dinheiro, PIX ou cartões de débito/crédito na maquininha do entregador ou atendente.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Financial math summary panel & Finalize order */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Fechamento do Pedido</h3>
              
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-4 border border-slate-100 dark:border-gray-700 shadow-md space-y-4">
                <div className="space-y-2 text-xs border-b border-gray-100 dark:border-gray-700 pb-3">
                  <div className="flex justify-between text-gray-500 dark:text-gray-400">
                    <span>Subtotal</span>
                    <span>R$ {subtotal.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-gray-500 dark:text-gray-400">
                    <span>Custo do Frete ({deliveryOption})</span>
                    <span className="font-semibold text-gray-800 dark:text-white">
                      {shippingCost === 0 ? "GRÁTIS" : `R$ ${shippingCost.toFixed(2)}`}
                    </span>
                  </div>

                  {appliedCoupon && (
                    <div className="flex justify-between text-gray-500 dark:text-gray-400">
                      <span>Cupom ({appliedCoupon.code})</span>
                      <span className="font-bold text-red-600">- R$ {discountCost.toFixed(2)}</span>
                    </div>
                  )}

                  {cashbackAvailable > 0 && (
                    <div className="flex justify-between text-gray-500 dark:text-gray-400">
                      <span>Cashback Descontado</span>
                      <span className="font-bold text-red-600">- R$ {cashbackAvailable.toFixed(2)}</span>
                    </div>
                  )}

                  {paymentMethod === 'PIX' && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-extrabold">
                      <span>Desconto 5% PIX</span>
                      <span>- R$ {(finalTotal * 0.05).toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between text-base font-semibold text-gray-900 dark:text-white">
                  <span>Total Geral</span>
                  <span className="text-lg font-bold text-[#1565C0] dark:text-blue-400">
                    R$ {(paymentMethod === 'PIX' ? finalTotal * 0.95 : finalTotal).toFixed(2)}
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-gray-800/50 p-3 rounded-xl text-[10px] text-gray-500 dark:text-gray-400 leading-snug border border-slate-100 dark:border-gray-700">
                  🎁 <strong>Sua recompensa de fidelidade:</strong> Ao finalizar este pedido, você ganhará <strong>R$ {(subtotal * 0.05).toFixed(2)}</strong> de Capitão Cashback para usar na próxima compra, além de <strong>{Math.floor(subtotal / 5)} pontos</strong> de fidelidade!
                </div>

                <button
                  onClick={handleFinalizeOrder}
                  className="w-full bg-[#1565C0] hover:bg-[#1565C0]/90 text-white font-semibold py-3 rounded-xl text-xs sm:text-sm text-center shadow-xs cursor-pointer transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <ShieldCheck className="w-5 h-5 text-[#FBC02D]" />
                  <span>Confirmar e Finalizar Pedido</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 3: SUCCESS AND INTERACTIVE QR CODE */}
        {cartStep === 'success' && placedOrder && (
          <motion.div 
            key="success-step"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="max-w-xl mx-auto bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-3xl shadow-md border border-slate-100 dark:border-gray-700 text-center space-y-6"
          >
            <div className="space-y-2">
              <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto" />
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                Pedido Confirmado com Sucesso! 🎉
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Seu pagamento foi integrado e recebido com sucesso pela Capitão Embalagens.
              </p>
            </div>

            {/* Receipt Summary Box */}
            <div className="bg-gray-50 dark:bg-gray-900/60 p-4 rounded-2xl border border-slate-100 dark:border-gray-850 text-left space-y-2.5 text-xs">
              <div className="flex justify-between font-mono">
                <span className="text-gray-400">Código do Pedido:</span>
                <span className="font-bold text-gray-900 dark:text-white">{placedOrder.id}</span>
              </div>
              <div className="flex justify-between font-mono">
                <span className="text-gray-400">Método de Envio:</span>
                <span className="font-bold text-gray-900 dark:text-white">{placedOrder.deliveryOption}</span>
              </div>
              <div className="flex justify-between font-mono">
                <span className="text-gray-400">Método de Pagamento:</span>
                <span className="font-bold text-gray-900 dark:text-white">{placedOrder.paymentMethod}</span>
              </div>
              <div className="flex justify-between font-mono">
                <span className="text-gray-400">Código de Rastreamento:</span>
                <span className="font-bold text-[#1565C0] dark:text-blue-400">{placedOrder.trackingCode}</span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-800 pt-2.5 flex justify-between font-mono font-bold text-sm text-gray-900 dark:text-white">
                <span>Total Pago:</span>
                <span>R$ {placedOrder.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Interactive PIX QR Code Box if PIX selected */}
            {placedOrder.paymentMethod === 'PIX' && (
              <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-5 rounded-2xl border border-emerald-100 space-y-4">
                <div className="text-center space-y-1">
                  <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-400 flex items-center justify-center gap-1">
                    <QrCode className="w-4 h-4" />
                    PAGAMENTO PIX CAPI-RÁPIDO
                  </h4>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-snug">
                    Aponte a câmera do seu celular para o QR Code abaixo ou copie a chave PIX Copie e Cole.
                  </p>
                </div>

                {/* Simulated QR Code SVG graphic */}
                <div className="w-36 h-36 mx-auto bg-white p-2 rounded-xl shadow-xs border border-gray-100 flex items-center justify-center relative group">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    {/* Abstract QR code layout */}
                    <rect x="5" y="5" width="20" height="20" fill="#0f172a" />
                    <rect x="9" y="9" width="12" height="12" fill="#ffffff" />
                    <rect x="75" y="5" width="20" height="20" fill="#0f172a" />
                    <rect x="79" y="9" width="12" height="12" fill="#ffffff" />
                    <rect x="5" y="75" width="20" height="20" fill="#0f172a" />
                    <rect x="9" y="79" width="12" height="12" fill="#ffffff" />
                    
                    {/* Simulated random blocks */}
                    <rect x="35" y="10" width="10" height="5" fill="#0f172a" />
                    <rect x="55" y="5" width="10" height="15" fill="#0f172a" />
                    <rect x="35" y="25" width="15" height="10" fill="#0f172a" />
                    <rect x="60" y="30" width="10" height="10" fill="#0f172a" />
                    <rect x="10" y="35" width="15" height="15" fill="#0f172a" />
                    <rect x="30" y="50" width="25" height="5" fill="#0f172a" />
                    <rect x="10" y="60" width="5" height="10" fill="#0f172a" />
                    <rect x="35" y="65" width="15" height="20" fill="#0f172a" />
                    <rect x="60" y="60" width="20" height="10" fill="#0f172a" />
                    <rect x="75" y="45" width="15" height="15" fill="#0f172a" />
                    <rect x="75" y="75" width="10" height="10" fill="#0f172a" />
                  </svg>
                  {/* Capivara mascot logo overlaying center of QR Code */}
                  <span className="absolute bg-white px-1 py-0.5 rounded-md border border-gray-200 text-xs shadow-xs leading-none select-none">🦫</span>
                </div>

                <div className="space-y-1.5">
                  <input 
                    type="text" 
                    readOnly 
                    value="00020126580014br.gov.bcb.pix0136capi-8839-49fa-a387-capi-key520400005303986540510.005802BR5917CapitaoEmbalagens6009SaoPaulo62070503***6304CAPI"
                    className="w-full bg-white dark:bg-gray-900 border border-emerald-100 dark:border-emerald-950 px-3 py-2 rounded-xl text-[9px] font-mono text-center outline-none select-all"
                  />
                  <button 
                    onClick={(e) => {
                      navigator.clipboard.writeText("00020126580014br.gov.bcb.pix0136capi-8839-49fa-a387-capi-key520400005303986540510.005802BR5917CapitaoEmbalagens6009SaoPaulo62070503***6304CAPI");
                      const btn = e.currentTarget;
                      btn.innerText = "✓ CHAVE COPIADA COM SUCESSO!";
                      setTimeout(() => btn.innerText = "COPIAR CHAVE COPIE E COLE", 3000);
                    }}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-[10px] uppercase cursor-pointer"
                  >
                    COPIAR CHAVE COPIE E COLE
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2.5 justify-center">
              <button 
                onClick={() => setShowPaymentModal(true)}
                className="bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2.5 px-5 rounded-xl text-xs cursor-pointer shadow-xs flex items-center justify-center gap-1.5 transition-all"
              >
                🔑 Abrir Modal de Pagamento
              </button>
              <button 
                onClick={onNavigateToProfile}
                className="bg-[#1565C0] hover:bg-[#1565C0]/90 text-white font-semibold py-2.5 px-5 rounded-xl text-xs cursor-pointer shadow-xs flex items-center justify-center gap-1.5 transition-all"
              >
                📦 Acompanhar Rastreio do Pedido
              </button>
              <button 
                onClick={() => { clearCart(); setCartStep('cart'); onBackToShopping(); }}
                className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-semibold py-2.5 px-5 rounded-xl text-xs cursor-pointer"
              >
                Voltar à Loja Principal
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FLOATING PAYMENT MODAL OVERLAY */}
      <AnimatePresence>
        {showPaymentModal && placedOrder && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            {/* Backdrop click to close */}
            <div className="fixed inset-0 bg-slate-900/40" onClick={() => setShowPaymentModal(false)} />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 15 }}
              className="bg-white dark:bg-gray-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-gray-150 dark:border-gray-800 p-6 relative text-center space-y-5 z-10"
            >
              {/* Close Icon */}
              <button 
                onClick={() => setShowPaymentModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-1.5">
                <div className="mx-auto w-12 h-12 bg-blue-50 dark:bg-blue-950/40 rounded-full flex items-center justify-center border border-blue-100 dark:border-blue-900/40">
                  <ShieldCheck className="w-6 h-6 text-[#1565C0] dark:text-blue-400" />
                </div>
                <h3 className="text-base font-black text-gray-900 dark:text-white tracking-tight">
                  Checkout Seguro Capitão
                </h3>
                <p className="text-[11px] text-gray-550 dark:text-gray-400">
                  Pedido <span className="font-mono font-bold text-gray-950 dark:text-white">#{placedOrder.id}</span> • Total: <span className="font-bold text-[#1565C0] dark:text-blue-400">R$ {placedOrder.total.toFixed(2)}</span>
                </p>
              </div>

              {placedOrder.paymentMethod === 'PIX' ? (
                <div className="space-y-4">
                  {/* Pix Info / Status Header */}
                  <div className="p-3 bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/45 rounded-2xl flex flex-col items-center justify-center space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#1565C0] dark:text-blue-400 animate-pulse">
                      <Clock className="w-3.5 h-3.5" />
                      <span>AGUARDANDO PAGAMENTO PIX</span>
                    </div>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">
                      Chave PIX expira em: <span className="font-mono font-bold text-red-500">{formatTime(pixTimer)}</span>
                    </p>
                  </div>

                  {pixStatus === 'pending' ? (
                    <>
                      {/* Pix QR Code */}
                      <div className="w-44 h-44 mx-auto bg-white p-2.5 rounded-2xl shadow-xs border border-gray-150 flex items-center justify-center relative">
                        <svg className="w-full h-full" viewBox="0 0 100 100">
                          <rect x="5" y="5" width="20" height="20" fill="#0f172a" />
                          <rect x="9" y="9" width="12" height="12" fill="#ffffff" />
                          <rect x="75" y="5" width="20" height="20" fill="#0f172a" />
                          <rect x="79" y="9" width="12" height="12" fill="#ffffff" />
                          <rect x="5" y="75" width="20" height="20" fill="#0f172a" />
                          <rect x="9" y="79" width="12" height="12" fill="#ffffff" />
                          
                          <rect x="35" y="10" width="10" height="5" fill="#0f172a" />
                          <rect x="55" y="5" width="10" height="15" fill="#0f172a" />
                          <rect x="35" y="25" width="15" height="10" fill="#0f172a" />
                          <rect x="60" y="30" width="10" height="10" fill="#0f172a" />
                          <rect x="10" y="35" width="15" height="15" fill="#0f172a" />
                          <rect x="30" y="50" width="25" height="5" fill="#0f172a" />
                          <rect x="10" y="60" width="5" height="10" fill="#0f172a" />
                          <rect x="35" y="65" width="15" height="20" fill="#0f172a" />
                          <rect x="60" y="60" width="20" height="10" fill="#0f172a" />
                          <rect x="75" y="45" width="15" height="15" fill="#0f172a" />
                          <rect x="75" y="75" width="10" height="10" fill="#0f172a" />
                        </svg>
                        <span className="absolute bg-white px-1.5 py-0.5 rounded-lg border border-gray-200 text-sm shadow-xs leading-none select-none">🦫</span>
                      </div>

                      {/* Pix Key Copier */}
                      <div className="space-y-2">
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">
                          Copie o código abaixo e cole no aplicativo do seu banco:
                        </p>
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            readOnly
                            value="00020126580014br.gov.bcb.pix0136capi-8839-49fa-a387-capi-key520400005303986540510.005802BR5917CapitaoEmbalagens6009SaoPaulo62070503***6304CAPI"
                            className="flex-1 bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-800 px-3 py-2.5 rounded-xl text-[9px] font-mono outline-none select-all text-gray-600 dark:text-gray-300"
                          />
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText("00020126580014br.gov.bcb.pix0136capi-8839-49fa-a387-capi-key520400005303986540510.005802BR5917CapitaoEmbalagens6009SaoPaulo62070503***6304CAPI");
                              setCopiedPix(true);
                              setTimeout(() => setCopiedPix(false), 3000);
                            }}
                            className="bg-[#1565C0] hover:bg-[#1565C0]/90 text-white p-2.5 rounded-xl cursor-pointer flex items-center justify-center transition-all shrink-0"
                            title="Copiar PIX"
                          >
                            {copiedPix ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Manual Confirmation simulation */}
                      <button
                        onClick={() => {
                          setPixStatus('success');
                        }}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-2.5 rounded-xl text-xs cursor-pointer shadow-md transition-all active:scale-95"
                      >
                        Confirmar Pagamento Realizado
                      </button>
                    </>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-5 bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-150 dark:border-emerald-900/40 text-center space-y-3"
                    >
                      <CheckCircle2 className="w-12 h-12 text-emerald-600 dark:text-emerald-400 mx-auto animate-bounce" />
                      <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-400">
                        PIX Confirmado! 🎉
                      </h4>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-normal">
                        Nosso sistema detectou a transferência. Seu pedido já foi enviado para a fila de separação da Capitão Embalagens!
                      </p>
                      <button
                        onClick={() => setShowPaymentModal(false)}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-xl text-xs cursor-pointer transition-all mt-2"
                      >
                        Acessar Painel do Pedido
                      </button>
                    </motion.div>
                  )}
                </div>
              ) : (
                /* Payment OnDelivery Modal Content */
                <div className="space-y-4">
                  <div className="p-4 bg-amber-50 dark:bg-amber-950/15 border border-amber-100 dark:border-amber-900/30 rounded-2xl text-left space-y-1.5">
                    <h4 className="text-xs font-bold text-amber-800 dark:text-amber-400 flex items-center gap-1.5">
                      💵 Pagamento na Entrega Selecionado
                    </h4>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-normal">
                      O seu pedido será processado imediatamente e o pagamento deverá ser realizado apenas no momento em que receber ou retirar os produtos.
                    </p>
                  </div>

                  <div className="p-3.5 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-150 dark:border-gray-700 text-left text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Valor a ser Pago:</span>
                      <span className="font-bold text-gray-900 dark:text-white">R$ {placedOrder.total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Meio de Entrega:</span>
                      <span className="font-bold text-gray-900 dark:text-white">{placedOrder.deliveryOption}</span>
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-2 text-[10px] text-gray-400 leading-snug">
                      💡 <strong>Dica:</strong> Nosso entregador leva maquininha de cartão portátil. Aceitamos dinheiro, PIX ou cartões de débito/crédito na maquininha!
                    </div>
                  </div>

                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="w-full bg-[#1565C0] hover:bg-[#1565C0]/90 text-white font-extrabold py-3 rounded-xl text-xs cursor-pointer transition-all active:scale-95 shadow-sm"
                  >
                    Entendido, Acompanhar Pedido
                  </button>
                </div>
              )}

              <div className="text-[9px] text-gray-400 dark:text-gray-500 pt-2 flex justify-center items-center gap-1 border-t border-gray-100 dark:border-gray-800/80">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>Transação criptografada com alta segurança (SSL/TLS).</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
