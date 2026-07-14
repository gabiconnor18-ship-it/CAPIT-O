import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  CartItem,
  Order,
  Coupon,
  User,
  Notification,
  ChatMessage,
  SchoolListItem,
  GiftListItem,
  INITIAL_PRODUCTS,
  INITIAL_COUPONS,
  INITIAL_USER,
  INITIAL_NOTIFICATIONS,
  INITIAL_SCHOOL_LIST,
  INITIAL_GIFT_LIST
} from '../types';

interface AppContextType {
  products: Product[];
  cart: CartItem[];
  favorites: string[];
  orders: Order[];
  coupons: Coupon[];
  user: User;
  notifications: Notification[];
  chatMessages: ChatMessage[];
  schoolList: SchoolListItem[];
  giftList: GiftListItem[];
  activeTheme: 'light' | 'dark';
  isAdmin: boolean;
  isLogged: boolean;
  
  // Cart Actions
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  
  // Favorites
  toggleFavorite: (productId: string) => void;
  
  // Order Actions
  placeOrder: (paymentMethod: string, deliveryOption: string, addressId: string, appliedCoupon: string | null) => Order;
  updateOrderStatus: (orderId: string, status: 'Pendente' | 'Preparando' | 'Enviado' | 'Entregue') => void;
  
  // Product Reviews
  addReview: (productId: string, rating: number, comment: string) => void;
  
  // Notifications
  addNotification: (title: string, description: string) => void;
  markNotificationsAsRead: () => void;
  
  // Chat support
  sendChatMessage: (text: string, sender: 'user' | 'support') => void;
  
  // Settings / Admin control
  toggleTheme: () => void;
  toggleAdmin: () => void;
  
  // Admin product/category/coupon actions
  addProduct: (product: Omit<Product, 'id' | 'reviews' | 'relatedProducts' | 'rating'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  addCoupon: (coupon: Coupon) => void;
  toggleCouponStatus: (code: string) => void;
  
  // Extras
  toggleSchoolListItem: (id: string) => void;
  addAllSchoolListToCart: () => void;
  toggleGiftListReservation: (id: string) => void;
  addGiftItem: (name: string, description: string) => void;
  updateUserProfile: (name: string, email: string, phone: string, addressText: string) => void;
  
  // WhatsApp Settings
  whatsappNumber: string;
  whatsappMessage: string;
  updateWhatsappSettings: (number: string, message: string) => void;

  // Real Auth Actions
  loginCustomer: (email: string, password: string) => Promise<boolean>;
  registerCustomer: (name: string, email: string, password: string, phone: string) => Promise<boolean>;
  logoutCustomer: () => void;
  loginAdmin: (email: string, password: string) => Promise<boolean>;
  registerAdmin: (name: string, email: string, password: string) => Promise<boolean>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial states from localStorage if available, otherwise use initial data
  const [products, setProducts] = useState<Product[]>(() => {
    const local = localStorage.getItem('capi_products');
    return local ? JSON.parse(local) : INITIAL_PRODUCTS;
  });
  
  const [cart, setCart] = useState<CartItem[]>(() => {
    const local = localStorage.getItem('capi_cart');
    return local ? JSON.parse(local) : [];
  });
  
  const [favorites, setFavorites] = useState<string[]>(() => {
    const local = localStorage.getItem('capi_favorites');
    return local ? JSON.parse(local) : [];
  });
  
  const [orders, setOrders] = useState<Order[]>(() => {
    const local = localStorage.getItem('capi_orders');
    return local ? JSON.parse(local) : [
      {
        id: "PED-1204",
        date: "2026-07-08 16:42",
        items: [
          {
            product: INITIAL_PRODUCTS[0],
            quantity: 1
          },
          {
            product: INITIAL_PRODUCTS[5],
            quantity: 2
          }
        ],
        total: 95.70,
        status: "Entregue" as const,
        paymentMethod: "Cartão de Crédito (Visa)",
        deliveryOption: "Entrega Local",
        address: {
          street: INITIAL_USER.addresses[0].street,
          number: INITIAL_USER.addresses[0].number,
          city: INITIAL_USER.addresses[0].city,
          state: INITIAL_USER.addresses[0].state,
          zipCode: INITIAL_USER.addresses[0].zipCode,
        },
        trackingCode: "CP-TX42091SP",
        statusHistory: [
          { status: "Pendente", date: "2026-07-08 16:42", description: "Pedido recebido e aguardando confirmação de pagamento." },
          { status: "Preparando", date: "2026-07-08 17:05", description: "Pagamento confirmado! Separando produtos no estoque Capitão." },
          { status: "Enviado", date: "2026-07-09 09:15", description: "Pedido saiu da central de distribuição de São Paulo." },
          { status: "Entregue", date: "2026-07-09 14:02", description: "Pedido entregue com sucesso à destinatária!" }
        ]
      }
    ];
  });
  
  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    const local = localStorage.getItem('capi_coupons');
    return local ? JSON.parse(local) : INITIAL_COUPONS;
  });
  
  const [user, setUser] = useState<User>(() => {
    const local = localStorage.getItem('capi_user');
    return local ? JSON.parse(local) : INITIAL_USER;
  });
  
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const local = localStorage.getItem('capi_notifications');
    return local ? JSON.parse(local) : INITIAL_NOTIFICATIONS;
  });
  
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const local = localStorage.getItem('capi_chat');
    return local ? JSON.parse(local) : [
      { id: "chat-1", sender: "support", text: "Olá! Seja bem-vindo ao Atendimento da Capitão Embalagens. Como posso te ajudar hoje?", timestamp: "2026-07-10 11:00" }
    ];
  });
  
  const [schoolList, setSchoolList] = useState<SchoolListItem[]>(() => {
    const local = localStorage.getItem('capi_school_list');
    return local ? JSON.parse(local) : INITIAL_SCHOOL_LIST;
  });
  
  const [giftList, setGiftList] = useState<GiftListItem[]>(() => {
    const local = localStorage.getItem('capi_gift_list');
    return local ? JSON.parse(local) : INITIAL_GIFT_LIST;
  });
  
  const [activeTheme, setActiveTheme] = useState<'light' | 'dark'>(() => {
    const local = localStorage.getItem('capi_theme');
    return (local as 'light' | 'dark') || 'light';
  });
  
  const isAdmin = false;
  
  const [isLogged, setIsLogged] = useState<boolean>(() => {
    return localStorage.getItem('capi_is_logged') === 'true';
  });

  // WhatsApp store configurations
  const [whatsappNumber, setWhatsappNumber] = useState<string>(() => {
    return localStorage.getItem('capi_whatsapp_number') || "5511987654321";
  });
  
  const [whatsappMessage, setWhatsappMessage] = useState<string>(() => {
    return localStorage.getItem('capi_whatsapp_message') || "Olá! Gostaria de tirar uma dúvida sobre embalagens e produtos na Capitão Embalagens.";
  });

  // Sync with Local Storage
  useEffect(() => { localStorage.setItem('capi_products', JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem('capi_cart', JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem('capi_favorites', JSON.stringify(favorites)); }, [favorites]);
  useEffect(() => { localStorage.setItem('capi_orders', JSON.stringify(orders)); }, [orders]);
  useEffect(() => { localStorage.setItem('capi_coupons', JSON.stringify(coupons)); }, [coupons]);
  useEffect(() => { localStorage.setItem('capi_user', JSON.stringify(user)); }, [user]);
  useEffect(() => { localStorage.setItem('capi_notifications', JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem('capi_chat', JSON.stringify(chatMessages)); }, [chatMessages]);
  useEffect(() => { localStorage.setItem('capi_school_list', JSON.stringify(schoolList)); }, [schoolList]);
  useEffect(() => { localStorage.setItem('capi_gift_list', JSON.stringify(giftList)); }, [giftList]);
  useEffect(() => { localStorage.setItem('capi_theme', activeTheme); }, [activeTheme]);
  useEffect(() => {
    if (activeTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [activeTheme]);
  useEffect(() => { localStorage.setItem('capi_whatsapp_number', whatsappNumber); }, [whatsappNumber]);
  useEffect(() => { localStorage.setItem('capi_whatsapp_message', whatsappMessage); }, [whatsappMessage]);
  useEffect(() => { localStorage.setItem('capi_is_logged', String(isLogged)); }, [isLogged]);

  // Fetch initial products and orders from server on load
  useEffect(() => {
    fetch('/api/products')
      .then(res => {
        if (!res.ok) throw new Error("Falha ao obter produtos");
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
        }
      })
      .catch(err => console.log("Carregado via LocalStorage (Fallback):", err));

    fetch('/api/orders')
      .then(res => {
        if (!res.ok) throw new Error("Falha ao obter pedidos");
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setOrders(data);
        }
      })
      .catch(err => console.log("Carregado via LocalStorage (Fallback):", err));
  }, []);

  // Cart Functions
  const addToCart = (product: Product, quantity: number) => {
    setCart(prev => {
      const exists = prev.find(item => item.product.id === product.id);
      if (exists) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock) }
            : item
        );
      }
      return [...prev, { product, quantity: Math.min(quantity, product.stock) }];
    });
    
    // Auto trigger notification
    addNotification(
      "Produto Adicionado! 🛒",
      `Você adicionou ${quantity}x "${product.name}" ao seu carrinho.`
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => setCart([]);

  // Favorites
  const toggleFavorite = (productId: string) => {
    const product = products.find(p => p.id === productId);
    setFavorites(prev => {
      const isFav = prev.includes(productId);
      if (isFav) {
        return prev.filter(id => id !== productId);
      } else {
        if (product) {
          addNotification(
            "Favoritado! ❤️",
            `"${product.name}" foi adicionado aos seus favoritos.`
          );
        }
        return [...prev, productId];
      }
    });
  };

  // Place Order
  const placeOrder = (
    paymentMethod: string,
    deliveryOption: string,
    addressId: string,
    appliedCoupon: string | null
  ): Order => {
    const selectedAddress = user.addresses.find(addr => addr.id === addressId) || user.addresses[0];
    const subtotal = cart.reduce((acc, item) => {
      const activePrice = item.product.promoPrice || item.product.price;
      return acc + (activePrice * item.quantity);
    }, 0);
    
    // Calculate shipping
    let shipping = 0;
    if (deliveryOption === "Entrega Local") shipping = 10;
    if (deliveryOption === "Transportadora") shipping = 19.90;
    
    // Apply coupon discount
    let discount = 0;
    if (appliedCoupon) {
      const cop = coupons.find(c => c.code.toUpperCase() === appliedCoupon.toUpperCase());
      if (cop && subtotal >= cop.minPurchase) {
        if (cop.discountType === 'percent') {
          discount = subtotal * (cop.value / 100);
        } else {
          discount = cop.value;
        }
      }
    }
    
    // Substract user's cashback if any is used
    const cashbackUsed = user.cashback > 0 ? user.cashback : 0;
    const finalTotal = Math.max(0, subtotal + shipping - discount - cashbackUsed);
    
    // Deduct stock levels and update products state
    setProducts(prevProducts =>
      prevProducts.map(p => {
        const cartItem = cart.find(item => item.product.id === p.id);
        if (cartItem) {
          return { ...p, stock: Math.max(0, p.stock - cartItem.quantity) };
        }
        return p;
      })
    );

    // Calculate new cashback earned (5% of subtotal)
    const cashbackEarned = Math.round(subtotal * 0.05 * 100) / 100;
    const pointsEarned = Math.floor(subtotal / 5); // 1 point for each 5 BRL spent

    // Update user stats
    setUser(prev => ({
      ...prev,
      cashback: cashbackEarned, // resetting and adding new, or just adding
      loyaltyPoints: prev.loyaltyPoints + pointsEarned
    }));

    const trackingNumber = `CP-TX${Math.floor(100000 + Math.random() * 900000)}SP`;
    const newOrder: Order = {
      id: `PED-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      items: [...cart],
      total: Number(finalTotal.toFixed(2)),
      status: 'Pendente',
      paymentMethod,
      deliveryOption,
      address: {
        street: selectedAddress.street,
        number: selectedAddress.number,
        city: selectedAddress.city,
        state: selectedAddress.state,
        zipCode: selectedAddress.zipCode,
      },
      trackingCode: trackingNumber,
      statusHistory: [
        {
          status: "Pendente",
          date: new Date().toISOString().replace('T', ' ').substring(0, 16),
          description: `Pedido gerado via ${paymentMethod}. Aguardando preparação.`
        }
      ]
    };

    // Save order in state first for instant local responsiveness
    setOrders(prev => [newOrder, ...prev]);

    // Async sync with the backend
    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [...cart],
        total: Number(finalTotal.toFixed(2)),
        paymentMethod,
        deliveryOption,
        address: {
          street: selectedAddress.street,
          number: selectedAddress.number,
          city: selectedAddress.city,
          state: selectedAddress.state,
          zipCode: selectedAddress.zipCode,
        },
        appliedCoupon
      })
    })
    .then(res => {
      if (!res.ok) throw new Error("Erro ao salvar pedido no servidor");
      return res.json();
    })
    .then(backendOrder => {
      // Replace temporary local order with the server-verified order (which includes correct tracking/ID format)
      setOrders(prev => prev.map(o => o.id === newOrder.id ? backendOrder : o));
      addNotification(
        "Pedido Confirmado no Servidor! 🎉🛒",
        `Parabéns! Seu pedido ${backendOrder.id} foi sincronizado com sucesso no backend da Capitão Embalagens.`
      );
    })
    .catch(err => {
      console.error("Erro na sincronização do pedido com o backend:", err);
      addNotification(
        "Pedido Realizado! 🎉🛒",
        `Parabéns! Seu pedido ${newOrder.id} foi recebido e já está na fila de processamento (Modo Offline).`
      );
    });

    clearCart();
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: 'Pendente' | 'Preparando' | 'Enviado' | 'Entregue') => {
    let desc = "";
    if (status === 'Preparando') desc = "Os itens estão sendo selecionados e embalados com todo cuidado pela nossa equipe.";
    if (status === 'Enviado') desc = `O pedido foi despachado via entrega selecionada.`;
    if (status === 'Entregue') desc = "O pedido foi entregue no endereço solicitado. Obrigado por comprar na Capitão Embalagens!";

    // Sincronizar com backend
    fetch(`/api/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, description: desc })
    })
    .then(res => {
      if (!res.ok) throw new Error("Falha ao atualizar no servidor");
      return res.json();
    })
    .then(updatedOrder => {
      setOrders(prev => prev.map(ord => ord.id === orderId ? updatedOrder : ord));
      addNotification(
        `Status do Pedido Atualizado! 📦`,
        `O seu pedido ${orderId} mudou para "${status}" no servidor.`
      );
    })
    .catch(err => {
      console.error("Erro ao atualizar status do pedido no backend:", err);
      // Fallback local
      setOrders(prev =>
        prev.map(ord => {
          if (ord.id === orderId) {
            if (ord.status === status) return ord;
            
            const historyItem = {
              status,
              date: new Date().toISOString().replace('T', ' ').substring(0, 16),
              description: desc
            };

            addNotification(
              `Status do Pedido Atualizado! 📦`,
              `O seu pedido ${ord.id} mudou para "${status}".`
            );

            return {
              ...ord,
              status,
              statusHistory: [...ord.statusHistory, historyItem]
            };
          }
          return ord;
        })
      );
    });
  };

  // Product Reviews
  const addReview = (productId: string, rating: number, comment: string) => {
    const newRev = {
      id: `rev-${Date.now()}`,
      userName: user.name,
      rating,
      comment,
      date: new Date().toISOString().split('T')[0]
    };

    setProducts(prev =>
      prev.map(prod => {
        if (prod.id === productId) {
          const updatedReviews = [newRev, ...prod.reviews];
          const avgRating = updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length;
          return {
            ...prod,
            reviews: updatedReviews,
            rating: Number(avgRating.toFixed(1))
          };
        }
        return prod;
      })
    );

    addNotification(
      "Avaliação enviada! ⭐",
      "Sua avaliação foi publicada. Agradecemos pelo seu feedback!"
    );
  };

  // Notifications
  const addNotification = (title: string, description: string) => {
    setNotifications(prev => [
      {
        id: `not-${Date.now()}`,
        title,
        description,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        read: false
      },
      ...prev
    ]);
  };

  const markNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Chat support
  const sendChatMessage = (text: string, sender: 'user' | 'support') => {
    const newMsg: ChatMessage = {
      id: `chat-${Date.now()}`,
      sender,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages(prev => [...prev, newMsg]);

    // Query server-side Gemini or rule-based fallback
    if (sender === 'user') {
      // Add a slight typing delay simulation
      setTimeout(() => {
        fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text })
        })
        .then(res => {
          if (!res.ok) throw new Error("Erro na rede ao chamar o chat");
          return res.json();
        })
        .then(data => {
          const replyMsg: ChatMessage = {
            id: `chat-${Date.now() + 1}`,
            sender: 'support',
            text: data.text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setChatMessages(prev => [...prev, replyMsg]);
        })
        .catch(err => {
          console.error("Erro ao conectar ao chatbot backend:", err);
          // Fallback local response
          const triggerAutoResponse = (userTxt: string) => {
            const txt = userTxt.toLowerCase();
            if (txt.includes('frete') || txt.includes('entrega')) {
              return "Oferecemos retirada grátis na loja física, entrega expressa local por R$ 10,00 e envio por transportadora para todo o Brasil. Você pode acompanhar seu pedido em tempo real pelo seu Perfil!";
            }
            if (txt.includes('pagamento') || txt.includes('pix') || txt.includes('cartão')) {
              return "Aceitamos PIX com aprovação instantânea e 5% de desconto, cartões de crédito (parcelado em até 6x sem juros) e boleto bancário.";
            }
            if (txt.includes('cupom') || txt.includes('desconto')) {
              return "Atualmente temos os cupons ativos: CAPIBAX (10% de desc. acima de R$50) e CAPI5 (5% em qualquer valor). Digite-os no carrinho!";
            }
            if (txt.includes('estojo') || txt.includes('caderno') || txt.includes('mochila')) {
              return "Temos as melhores embalagens e itens escolares! Nossos produtos têm estampa oficial da Capitão Embalagens. Dê uma olhada nos destaques da tela inicial!";
            }
            return "Entendi! O seu contato foi encaminhado para nossa equipe de atendimento humano da Capitão Embalagens. Responderemos em poucos minutos. 🦫💙";
          };

          const replyMsg: ChatMessage = {
            id: `chat-${Date.now() + 1}`,
            sender: 'support',
            text: triggerAutoResponse(text),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setChatMessages(prev => [...prev, replyMsg]);
        });
      }, 800);
    }
  };

  // Settings / Themes
  const toggleTheme = () => {
    setActiveTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const toggleAdmin = () => {
    // Administrativo desabilitado
  };

  // Admin Actions
  const addProduct = (newProd: Omit<Product, 'id' | 'reviews' | 'relatedProducts' | 'rating'>) => {
    fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProd)
    })
    .then(res => {
      if (!res.ok) throw new Error("Erro ao criar produto no servidor");
      return res.json();
    })
    .then(backendProduct => {
      setProducts(prev => [backendProduct, ...prev]);
      addNotification("Novo Produto Cadastrado! 📝", `O produto "${backendProduct.name}" foi inserido no estoque do servidor.`);
    })
    .catch(err => {
      console.error("Erro ao cadastrar produto no servidor:", err);
      // Fallback local list update
      const p: Product = {
        ...newProd,
        id: `prod-${Date.now()}`,
        rating: 5.0,
        reviews: [],
        relatedProducts: []
      };
      setProducts(prev => [p, ...prev]);
      addNotification("Novo Produto Cadastrado! 📝", `O produto "${p.name}" foi inserido no estoque localmente (offline).`);
    });
  };

  const updateProduct = (updated: Product) => {
    fetch(`/api/products/${updated.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    })
    .then(res => {
      if (!res.ok) throw new Error("Erro ao atualizar produto no servidor");
      return res.json();
    })
    .then(backendProduct => {
      setProducts(prev => prev.map(p => p.id === updated.id ? backendProduct : p));
      addNotification("Produto Sincronizado! ⚙️", `O produto "${updated.name}" foi salvo com sucesso no servidor.`);
    })
    .catch(err => {
      console.error("Erro ao atualizar produto no servidor:", err);
      // Fallback local update
      setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
      addNotification("Produto Atualizado! ⚙️", `O produto "${updated.name}" teve seus dados salvos localmente.`);
    });
  };

  const deleteProduct = (productId: string) => {
    const p = products.find(prod => prod.id === productId);

    fetch(`/api/products/${productId}`, {
      method: 'DELETE'
    })
    .then(res => {
      if (!res.ok) throw new Error("Erro ao remover produto no servidor");
      setProducts(prev => prev.filter(p => p.id !== productId));
      if (p) {
        addNotification("Produto Removido! 🗑️", `O produto "${p.name}" foi removido do estoque do servidor.`);
      }
    })
    .catch(err => {
      console.error("Erro ao remover produto no servidor:", err);
      // Fallback local delete
      setProducts(prev => prev.filter(p => p.id !== productId));
      if (p) {
        addNotification("Produto Removido! 🗑️", `O produto "${p.name}" foi removido do estoque localmente.`);
      }
    });
  };

  const addCoupon = (coupon: Coupon) => {
    setCoupons(prev => [coupon, ...prev]);
    addNotification("Cupom de Desconto Criado! 🏷️", `O cupom "${coupon.code}" está ativo para compras.`);
  };

  const toggleCouponStatus = (code: string) => {
    setCoupons(prev =>
      prev.map(c => c.code === code ? { ...c, isActive: !c.isActive } : c)
    );
  };

  // Extras list managers
  const toggleSchoolListItem = (id: string) => {
    setSchoolList(prev =>
      prev.map(item => item.id === id ? { ...item, addedToCart: !item.addedToCart } : item)
    );
  };

  const addAllSchoolListToCart = () => {
    schoolList.forEach(item => {
      // Find matching product in products
      const matchedProd = products.find(p => p.name.toLowerCase().includes(item.name.toLowerCase()) || p.category === item.category);
      if (matchedProd) {
        addToCart(matchedProd, item.quantity);
      }
    });
    setSchoolList(prev => prev.map(item => ({ ...item, addedToCart: true })));
    addNotification("Lista de Materiais Integrada! 🎒", "Todos os itens disponíveis da sua lista escolar foram inseridos no carrinho!");
  };

  const toggleGiftListReservation = (id: string) => {
    setGiftList(prev =>
      prev.map(item => {
        if (item.id === id) {
          const isReserved = !!item.reservedBy;
          return {
            ...item,
            reservedBy: isReserved ? null : user.email
          };
        }
        return item;
      })
    );
  };

  const addGiftItem = (name: string, description: string) => {
    const item: GiftListItem = {
      id: `gift-${Date.now()}`,
      name,
      description,
      reservedBy: null
    };
    setGiftList(prev => [...prev, item]);
  };

  const updateUserProfile = (name: string, email: string, phone: string, addressText: string) => {
    const updatedAddresses = user.addresses.map((addr, i) => i === 0 ? { ...addr, street: addressText } : addr);
    const updatedUser = {
      ...user,
      name,
      email,
      phone,
      addresses: updatedAddresses
    };

    // Update state instantly for fluid UX
    setUser(updatedUser);

    if (user.id) {
      fetch(`/api/auth/profile/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, addresses: updatedAddresses })
      })
      .then(res => {
        if (!res.ok) throw new Error("Erro ao salvar perfil no servidor");
        return res.json();
      })
      .then(savedUser => {
        setUser(savedUser);
        addNotification("Perfil Sincronizado! 👤", "Seus dados cadastrais foram salvos e sincronizados com o servidor oficial da Capitão Embalagens.");
      })
      .catch(err => {
        console.error("Erro ao sincronizar perfil com o backend:", err);
        addNotification("Perfil Atualizado! 👤", "Seus dados foram salvos localmente.");
      });
    } else {
      addNotification("Perfil Atualizado! 👤", "Seus dados cadastrais foram salvos com sucesso.");
    }
  };

  const loginCustomer = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erro no login');
      }
      const userData = await res.json();
      setUser(userData);
      setIsLogged(true);
      addNotification("Login efetuado com sucesso! 🎉", `Bem-vindo de volta, ${userData.name}!`);
      return true;
    } catch (err: any) {
      console.error(err);
      addNotification("Falha no Login ❌", err.message || "E-mail ou senha inválidos.");
      throw err;
    }
  };

  const registerCustomer = async (name: string, email: string, password: string, phone: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erro no registro');
      }
      const userData = await res.json();
      setUser(userData);
      setIsLogged(true);
      addNotification("Cadastro realizado! 🎉", `Bem-vindo à Capitão Embalagens, ${userData.name}!`);
      return true;
    } catch (err: any) {
      console.error(err);
      addNotification("Falha no Cadastro ❌", err.message || "Verifique as informações fornecidas.");
      throw err;
    }
  };

  const logoutCustomer = () => {
    setIsLogged(false);
    // Reset to initial dummy structure
    setUser({
      name: "Gabriela Connor",
      email: "gabiconnor18@gmail.com",
      phone: "(11) 98122-4321",
      cashback: 12.50,
      loyaltyPoints: 120,
      addresses: [
        {
          id: "addr-1",
          street: "Av. Brigadeiro Luís Antônio, 1200",
          number: "Apto 45",
          city: "São Paulo",
          state: "SP",
          zipCode: "01318-001",
          isDefault: true
        }
      ],
      photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
    });
    addNotification("Sessão Encerrada 👋", "Volte sempre à Capitão Embalagens!");
  };

  const loginAdmin = async (email: string, password: string): Promise<boolean> => {
    return false;
  };

  const registerAdmin = async (name: string, email: string, password: string): Promise<boolean> => {
    return false;
  };

  const updateWhatsappSettings = (number: string, message: string) => {
    setWhatsappNumber(number);
    setWhatsappMessage(message);
    addNotification("Configurações do WhatsApp Salvas! 🦫📱", "As informações de contato foram atualizadas.");
  };

  return (
    <AppContext.Provider value={{
      products,
      cart,
      favorites,
      orders,
      coupons,
      user,
      notifications,
      chatMessages,
      schoolList,
      giftList,
      activeTheme,
      isAdmin,
      isLogged,
      
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      toggleFavorite,
      placeOrder,
      updateOrderStatus,
      addReview,
      addNotification,
      markNotificationsAsRead,
      sendChatMessage,
      toggleTheme,
      toggleAdmin,
      
      addProduct,
      updateProduct,
      deleteProduct,
      addCoupon,
      toggleCouponStatus,
      
      toggleSchoolListItem,
      addAllSchoolListToCart,
      toggleGiftListReservation,
      addGiftItem,
      updateUserProfile,
      
      whatsappNumber,
      whatsappMessage,
      updateWhatsappSettings,

      loginCustomer,
      registerCustomer,
      logoutCustomer,
      loginAdmin,
      registerAdmin
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
