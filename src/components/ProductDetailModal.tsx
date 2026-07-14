import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Product } from '../types';
import { motion } from 'motion/react';
import { Star, Heart, ShoppingCart, Share2, ShieldCheck, Truck, Plus, Minus, X, MessageSquare, Award } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
  onSelectProduct: (p: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onSelectProduct
}) => {
  const { addToCart, favorites, toggleFavorite, products, addReview } = useApp();
  const [qty, setQty] = useState(1);
  const [copied, setCopied] = useState(false);
  
  // Review form states
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const isFav = favorites.includes(product.id);
  const isPromo = product.promoPrice !== undefined;
  const activePrice = product.promoPrice || product.price;

  // Find related products based on product.relatedProducts or same category
  const relatedList = products
    .filter(p => p.id !== product.id && (product.relatedProducts.includes(p.id) || p.category === product.category))
    .slice(0, 3);

  const handleShare = () => {
    const url = `${window.location.origin}/?product=${product.code}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleQtyChange = (val: number) => {
    setQty(prev => Math.max(1, Math.min(prev + val, product.stock)));
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    addReview(product.id, rating, comment);
    setComment("");
    setSubmitSuccess(true);
    setTimeout(() => setSubmitSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs">
      {/* Background click close */}
      <div className="fixed inset-0 -z-10" onClick={onClose} />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white dark:bg-gray-900 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row max-h-[90vh] md:max-h-[85vh]"
      >
        {/* Left Side: Product Image & Badges */}
        <div className="w-full md:w-1/2 bg-gray-50 dark:bg-gray-950 p-4 relative flex flex-col justify-center items-center min-h-[250px] md:min-h-0 border-r border-gray-100 dark:border-gray-800 shrink-0">
          {/* Close button inside image for mobile */}
          <button 
            onClick={onClose}
            className="absolute top-4 left-4 p-2.5 bg-white/90 dark:bg-gray-850/90 text-gray-700 dark:text-gray-200 rounded-full shadow-lg border border-gray-100 dark:border-gray-800 cursor-pointer z-10 transition-transform active:scale-90"
            title="Fechar Detalhes"
          >
            <X className="w-5 h-5" />
          </button>

          <button 
            onClick={() => toggleFavorite(product.id)}
            className="absolute top-4 right-4 p-2.5 bg-white/90 dark:bg-gray-850/90 text-gray-500 hover:text-red-500 rounded-full shadow-lg border border-gray-100 dark:border-gray-800 cursor-pointer z-10 transition-colors"
            title="Favoritar"
          >
            <Heart className={`w-5 h-5 ${isFav ? 'fill-red-500 text-red-500' : ''}`} />
          </button>

          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full max-h-[300px] md:max-h-[450px] object-contain rounded-2xl drop-shadow-md"
            referrerPolicy="no-referrer"
          />

          <div className="absolute bottom-4 left-4 flex gap-1.5 flex-wrap">
            {isPromo && (
              <span className="bg-red-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-xs">
                PROMOÇÃO ATIVA
              </span>
            )}
            <span className="bg-blue-600 text-white text-[10px] font-mono px-2.5 py-1 rounded-full shadow-xs">
              Cod: {product.code}
            </span>
          </div>
        </div>

        {/* Right Side: Product Details, Reviews, related */}
        <div className="w-full md:w-1/2 p-5 sm:p-6 flex flex-col overflow-y-auto space-y-5 text-left bg-white dark:bg-gray-900">
          <div>
            <div className="flex items-center gap-1.5 mb-1 text-xs font-semibold text-[#1565C0] dark:text-blue-400 uppercase tracking-widest">
              <span>{product.category}</span>
              <span>•</span>
              <span>{product.brand}</span>
            </div>
            
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white leading-tight">
              {product.name}
            </h2>

            {/* Ratings summary */}
            <div className="flex items-center gap-2 mt-1.5">
              <div className="flex text-[#FBC02D]">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-[#FBC02D]' : 'text-gray-300 dark:text-gray-700'}`} 
                  />
                ))}
              </div>
              <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                {product.rating.toFixed(1)}
              </span>
              <span className="text-[11px] text-gray-500 dark:text-gray-400">
                ({product.reviews.length} avaliações)
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1 bg-gray-50 dark:bg-gray-800/45 p-3 rounded-xl border border-slate-100 dark:border-gray-800">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Descrição do Produto</h4>
            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Price Box */}
          <div className="p-3.5 bg-[#1565C0]/5 dark:bg-[#1565C0]/10 rounded-2xl border border-slate-100 dark:border-gray-800 flex justify-between items-center">
            <div>
              {isPromo ? (
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-lg sm:text-xl font-bold text-[#1565C0] dark:text-blue-400">
                      R$ {product.promoPrice?.toFixed(2)}
                    </span>
                    <span className="text-xs text-gray-400 line-through">
                      R$ {product.price.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-[10px] text-red-600 dark:text-red-400 font-bold">
                    Economia de R$ {(product.price - (product.promoPrice || 0)).toFixed(2)}!
                  </p>
                </div>
              ) : (
                <span className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">
                  R$ {product.price.toFixed(2)}
                </span>
              )}
              <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                Parcelamento em até <strong>6x de R$ {(activePrice / 6).toFixed(2)}</strong> sem juros!
              </p>
            </div>

            {/* Stock tracker */}
            <div className="text-right">
              {product.stock > 0 ? (
                <div className="space-y-0.5">
                  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100/60 dark:bg-emerald-950/20 px-2.5 py-0.5 rounded-full uppercase">
                    Disponível
                  </span>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                    {product.stock} unidades em estoque
                  </p>
                </div>
              ) : (
                <span className="text-[10px] font-semibold text-red-600 dark:text-red-400 bg-red-100/60 dark:bg-red-950/20 px-2.5 py-0.5 rounded-full uppercase">
                  Sem Estoque
                </span>
              )}
            </div>
          </div>

          {/* Add to cart actions & qty selector */}
          {product.stock > 0 && (
            <div className="flex gap-2.5 items-center">
              <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-2xs">
                <button 
                  onClick={() => handleQtyChange(-1)}
                  className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-3.5 font-bold text-sm text-gray-800 dark:text-white">
                  {qty}
                </span>
                <button 
                  onClick={() => handleQtyChange(1)}
                  className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={() => { addToCart(product, qty); onClose(); }}
                className="flex-1 bg-[#1565C0] hover:bg-[#1565C0]/90 text-white font-semibold py-3 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                <ShoppingCart className="w-4.5 h-4.5 text-[#FBC02D]" />
                <span>Adicionar R$ {(activePrice * qty).toFixed(2)}</span>
              </button>

              <button 
                onClick={handleShare}
                className={`p-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-[#1565C0] transition-colors cursor-pointer relative bg-white dark:bg-gray-800`}
                title="Compartilhar Link"
              >
                <Share2 className="w-4.5 h-4.5" />
                {copied && (
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[9px] font-bold py-1 px-2 rounded whitespace-nowrap shadow-md">
                    Copiado!
                  </span>
                )}
              </button>
            </div>
          )}

          {/* Delivery Trust indicators */}
          <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1.5 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Truck className="w-3.5 h-3.5 text-[#1565C0]" />
              <span>Retirada Grátis na loja física</span>
            </div>
            <div className="flex items-center gap-1.5 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <ShieldCheck className="w-3.5 h-3.5 text-[#1565C0]" />
              <span>Garantia de Devolução 7 Dias</span>
            </div>
          </div>

          {/* Related Products */}
          {relatedList.length > 0 && (
            <div className="space-y-2 pt-2">
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Produtos Relacionados</h4>
              <div className="grid grid-cols-3 gap-2">
                {relatedList.map(related => (
                  <div 
                    key={related.id}
                    onClick={() => onSelectProduct(related)}
                    className="border border-slate-100 dark:border-gray-800 rounded-xl overflow-hidden cursor-pointer hover:border-[#1565C0]/40 dark:hover:border-gray-700 transition-all bg-gray-50 dark:bg-gray-800 p-1.5 flex flex-col text-left"
                  >
                    <img 
                      src={related.image} 
                      alt={related.name} 
                      className="w-full h-14 object-cover rounded-lg bg-white"
                      referrerPolicy="no-referrer"
                    />
                    <h5 className="text-[10px] font-semibold text-gray-800 dark:text-gray-150 line-clamp-1 mt-1 leading-none">
                      {related.name}
                    </h5>
                    <span className="text-[10px] font-bold text-[#1565C0] dark:text-blue-400 mt-1">
                      R$ {(related.promoPrice || related.price).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Customer Reviews & Ratings Submission */}
          <div className="space-y-3 border-t border-slate-100 dark:border-gray-800 pt-4 text-left">
            <h3 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-[#1565C0]" />
              Avaliações de Clientes
            </h3>

            {/* Submission Form */}
            <form onSubmit={handleReviewSubmit} className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-2xl border border-slate-100 dark:border-gray-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-500 uppercase">Enviar sua opinião:</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setRating(val)}
                      className="p-0.5 cursor-pointer text-[#FBC02D] focus:outline-none"
                    >
                      <Star className={`w-4 h-4 ${val <= rating ? 'fill-[#FBC02D]' : 'text-gray-300 dark:text-gray-700'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="Deixe seu comentário sobre o produto..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="flex-1 bg-white dark:bg-gray-950 border border-slate-100 dark:border-gray-700 px-3 py-1.5 rounded-xl text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:ring-1 focus:ring-blue-500 outline-none"
                />
                <button
                  type="submit"
                  className="bg-[#1565C0] hover:bg-[#1565C0]/90 text-white font-semibold px-4 py-1.5 rounded-xl text-xs cursor-pointer transition-all"
                >
                  Avaliar
                </button>
              </div>
              
              {submitSuccess && (
                <p className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold">✓ Avaliação enviada! Obrigado pelo apoio.</p>
              )}
            </form>

            {/* List */}
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {product.reviews.length === 0 ? (
                <p className="text-xs text-gray-400 dark:text-gray-500 py-3 text-center">Nenhuma avaliação enviada ainda. Seja o primeiro!</p>
              ) : (
                product.reviews.map(rev => (
                  <div key={rev.id} className="p-3 bg-white dark:bg-gray-850 rounded-xl border border-slate-100 dark:border-gray-800 shadow-2xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-800 dark:text-white flex items-center gap-1">
                        <span className="text-xs">👤</span> {rev.userName}
                      </span>
                      <span className="text-[9px] font-mono text-gray-400">{rev.date}</span>
                    </div>
                    <div className="flex text-[#FBC02D]">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < rev.rating ? 'fill-[#FBC02D]' : 'text-gray-200'}`} />
                      ))}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300 leading-snug">{rev.comment}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
