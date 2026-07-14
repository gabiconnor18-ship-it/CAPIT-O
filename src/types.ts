export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  brand: string;
  price: number;
  promoPrice?: number;
  rating: number;
  stock: number;
  category: string;
  code: string;
  image: string;
  reviews: Review[];
  relatedProducts: string[]; // List of product IDs
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  status: 'Pendente' | 'Preparando' | 'Enviado' | 'Entregue';
  paymentMethod: string;
  deliveryOption: string;
  address: {
    street: string;
    number: string;
    city: string;
    state: string;
    zipCode: string;
  };
  trackingCode: string;
  statusHistory: { status: string; date: string; description: string }[];
}

export interface Coupon {
  code: string;
  discountType: 'percent' | 'fixed';
  value: number;
  minPurchase: number;
  isActive: boolean;
}

export interface User {
  id?: string;
  name: string;
  email: string;
  phone: string;
  cashback: number;
  loyaltyPoints: number;
  addresses: {
    id: string;
    street: string;
    number: string;
    city: string;
    state: string;
    zipCode: string;
    isDefault: boolean;
  }[];
  photo: string;
}

export interface Notification {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'support';
  text: string;
  timestamp: string;
}

export interface SchoolListItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  addedToCart: boolean;
}

export interface GiftListItem {
  id: string;
  name: string;
  description: string;
  reservedBy: string | null;
}

export const CATEGORIES = [
  "Material Escolar",
  "Cadernos",
  "Mochilas",
  "Canetas",
  "Lápis",
  "Borrachas",
  "Apontadores",
  "Réguas",
  "Pastas",
  "Cartolinas",
  "Papel Sulfite",
  "Papel Fotográfico",
  "Tintas",
  "Pincéis",
  "Artesanato",
  "Informática",
  "Escritório",
  "Impressão",
  "Encadernação",
  "Plastificação",
  "Presentes",
  "Decoração"
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    name: "Estojo Escolar Completo Faber-Castell Capião Edition",
    description: "Estojo especial com 24 EcoLápis de cor, 2 canetas esferográficas, 1 apontador com depósito, 1 borracha Capião e 1 régua de 15cm. Perfeito para o início das aulas com material de altíssima qualidade.",
    brand: "Faber-Castell",
    price: 89.90,
    promoPrice: 79.90,
    rating: 4.8,
    stock: 45,
    category: "Material Escolar",
    code: "FC-10020",
    image: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=500&auto=format&fit=crop&q=60",
    reviews: [
      { id: "rev-1", userName: "Ana Silva", rating: 5, comment: "Excelente qualidade! Meus filhos adoraram o estojo.", date: "2026-06-15" },
      { id: "rev-2", userName: "Marcos Souza", rating: 4.5, comment: "Faber-Castell nunca decepciona. Ótimo custo-benefício.", date: "2026-07-02" }
    ],
    relatedProducts: ["prod-2", "prod-4", "prod-6"]
  },
  {
    id: "prod-2",
    name: "Caderno Universitário Capivara Inteligente 10 Matérias",
    description: "Caderno universitário espiral, capa dura decorada com nossa mascote Capivara, 160 folhas pautadas de alta gramatura (90g/m²). Inclui bolsa de papel e adesivos funcionais.",
    brand: "Tilibra",
    price: 49.90,
    promoPrice: 39.90,
    rating: 4.9,
    stock: 120,
    category: "Cadernos",
    code: "TL-55440",
    image: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=500&auto=format&fit=crop&q=60",
    reviews: [
      { id: "rev-3", userName: "Beatriz M.", rating: 5, comment: "As folhas são super grossas, a caneta não passa para o outro lado!", date: "2026-07-05" }
    ],
    relatedProducts: ["prod-1", "prod-4", "prod-10"]
  },
  {
    id: "prod-3",
    name: "Mochila Ergonômica Capi-Pack Pro Impermeável",
    description: "Mochila escolar e universitária com compartimento acolchoado para notebook de até 15.6 polegadas. Costas ergonômicas respiráveis, alças acolchoadas ajustáveis e detalhes refletivos.",
    brand: "Capião Bags",
    price: 249.90,
    promoPrice: 199.90,
    rating: 4.7,
    stock: 15,
    category: "Mochilas",
    code: "CP-9908",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop&q=60",
    reviews: [
      { id: "rev-4", userName: "Ricardo Oliveira", rating: 5, comment: "Super resistente! Levo notebook e vários cadernos pesados diariamente.", date: "2026-06-20" }
    ],
    relatedProducts: ["prod-1", "prod-2"]
  },
  {
    id: "prod-4",
    name: "Kit Canetas Brush Pen Stabilo Pen 68 - 10 Cores",
    description: "Marcador com ponta de pincel flexível de fibra premium. Tinta à base de água de excelente cobertura, perfeita para lettering, resumos, mapas mentais e ilustrações artísticas.",
    brand: "Stabilo",
    price: 119.90,
    promoPrice: 99.90,
    rating: 5.0,
    stock: 30,
    category: "Canetas",
    code: "ST-8822",
    image: "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=500&auto=format&fit=crop&q=60",
    reviews: [
      { id: "rev-5", userName: "Mariana Costa", rating: 5, comment: "Ponta maravilhosa para lettering. Cores extremamente vibrantes!", date: "2026-07-09" }
    ],
    relatedProducts: ["prod-1", "prod-2", "prod-13"]
  },
  {
    id: "prod-5",
    name: "Caixa de Lápis de Cor Faber-Castell 72 Cores SuperSoft",
    description: "Lápis de cor com mina supermacia que proporciona máximo conforto ao pintar. Cores excelentes sobre papéis claros e escuros com alto poder de cobertura.",
    brand: "Faber-Castell",
    price: 189.90,
    rating: 4.9,
    stock: 22,
    category: "Lápis",
    code: "FC-72SS",
    image: "https://images.unsplash.com/photo-1519751138087-5bf79df62d5b?w=500&auto=format&fit=crop&q=60",
    reviews: [],
    relatedProducts: ["prod-1", "prod-13", "prod-14"]
  },
  {
    id: "prod-6",
    name: "Borracha Record 20 Capião Soft - Kit com 2",
    description: "Borracha de alta qualidade, super macia, que não mancha o papel e gera pouca poeira (dust-free). Ideal para lápis e grafite.",
    brand: "Capião",
    price: 7.90,
    rating: 4.6,
    stock: 250,
    category: "Borrachas",
    code: "CP-B20",
    image: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=500&auto=format&fit=crop&q=10",
    reviews: [],
    relatedProducts: ["prod-1", "prod-7"]
  },
  {
    id: "prod-7",
    name: "Apontador Metálico Duplo de Mesa com Manivela",
    description: "Apontador vintage de alta precisão com fixador de mesa, manivela manual de rotação e depósito gigante para resíduos. Aponta lápis padrão e jumbo.",
    brand: "Capião Office",
    price: 65.00,
    promoPrice: 55.00,
    rating: 4.8,
    stock: 18,
    category: "Apontadores",
    code: "CP-AP88",
    image: "https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=500&auto=format&fit=crop&q=60",
    reviews: [],
    relatedProducts: ["prod-1", "prod-5"]
  },
  {
    id: "prod-8",
    name: "Régua Profissional de Alumínio 30cm Antiderrapante",
    description: "Régua fabricada em alumínio anodizado de alta resistência com gravação em milímetros e polegadas. Base antiderrapante de neoprene para desenhos técnicos precisos.",
    brand: "Trident",
    price: 24.90,
    rating: 4.5,
    stock: 60,
    category: "Réguas",
    code: "TR-AL30",
    image: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=500&auto=format&fit=crop&q=20",
    reviews: [],
    relatedProducts: ["prod-1", "prod-9"]
  },
  {
    id: "prod-9",
    name: "Pasta Sanfonada Kraft Executive de 12 Divisórias",
    description: "Pasta sanfonada elegante produzida em papel kraft rígido e reforçado. Ideal para organizar documentos, contas mensais e trabalhos escolares com etiquetas inclusas.",
    brand: "Dello",
    price: 42.90,
    rating: 4.4,
    stock: 35,
    category: "Pastas",
    code: "DL-PS12",
    image: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=500&auto=format&fit=crop&q=40",
    reviews: [],
    relatedProducts: ["prod-11", "prod-17"]
  },
  {
    id: "prod-10",
    name: "Resma de Papel Sulfite Capi-Premium A4 75g - 500 Fls",
    description: "Papel sulfite branco de alta alvura, ideal para impressoras jato de tinta e laser. Superfície super lisa que previne atolamentos e economiza tinta.",
    brand: "Chamex",
    price: 32.90,
    promoPrice: 28.90,
    rating: 4.9,
    stock: 450,
    category: "Papel Sulfite",
    code: "CH-A4500",
    image: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=500&auto=format&fit=crop&q=60",
    reviews: [
      { id: "rev-6", userName: "Julio C.", rating: 5, comment: "Excelente qualidade de impressão, uso no escritório todo dia.", date: "2026-07-01" }
    ],
    relatedProducts: ["prod-11", "prod-16", "prod-18"]
  },
  {
    id: "prod-11",
    name: "Papel Fotográfico Capi-Glossy A4 Premium - 20 Folhas",
    description: "Papel fotográfico brilhante de alta gramatura (230g/m²) resistente à água. Secagem instantânea e cores vivas com qualidade de estúdio fotográfico.",
    brand: "Capião Paper",
    price: 29.90,
    rating: 4.7,
    stock: 80,
    category: "Papel Fotográfico",
    code: "CP-PF230",
    image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&auto=format&fit=crop&q=30",
    reviews: [],
    relatedProducts: ["prod-10", "prod-18"]
  },
  {
    id: "prod-12",
    name: "Maleta de Pintura Guache e Acrílica - 18 Cores + Pincéis",
    description: "Kit artístico profissional contendo 12 tubos de tinta acrílica, 6 potes de guache escolar, paleta de mistura plástica e 4 pincéis de cerdas naturais.",
    brand: "Acrilex",
    price: 135.00,
    promoPrice: 115.00,
    rating: 4.8,
    stock: 14,
    category: "Tintas",
    code: "AX-MA18",
    image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=500&auto=format&fit=crop&q=60",
    reviews: [],
    relatedProducts: ["prod-13", "prod-14", "prod-5"]
  },
  {
    id: "prod-13",
    name: "Kit Pincéis Artísticos Macios Tigre - 6 Peças",
    description: "Pincéis profissionais Tigre com cabo de madeira tratada e cerdas sintéticas de altíssima maciez. Ideal para aquarelas, tintas acrílicas e acabamentos detalhados.",
    brand: "Tigre",
    price: 54.90,
    rating: 4.9,
    stock: 40,
    category: "Pincéis",
    code: "TG-KP06",
    image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=500&auto=format&fit=crop&q=50",
    reviews: [],
    relatedProducts: ["prod-12", "prod-5"]
  },
  {
    id: "prod-14",
    name: "Massa de Biscuit Capi-Clay Soft Porcelana Fria - 1kg",
    description: "Massa para artesanato de biscuit branca, macia, não racha ao secar e é super maleável. Pode ser tingida com qualquer tinta à base de água ou óleo.",
    brand: "Capião Arts",
    price: 21.90,
    rating: 4.7,
    stock: 95,
    category: "Artesanato",
    code: "CP-BC1KG",
    image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=500&auto=format&fit=crop&q=40",
    reviews: [],
    relatedProducts: ["prod-12", "prod-13"]
  },
  {
    id: "prod-15",
    name: "Teclado e Mouse Sem Fio Capi-Connect Slim Blue-Silent",
    description: "Kit periférico sem fio recarregável por USB-C. Teclas com mecanismo tesoura silencioso e mouse ergonômico ambidestro de 1600 DPI com clique inaudível.",
    brand: "CapiTech",
    price: 199.90,
    promoPrice: 159.90,
    rating: 4.6,
    stock: 25,
    category: "Informática",
    code: "CT-KB900",
    image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&auto=format&fit=crop&q=60",
    reviews: [
      { id: "rev-7", userName: "Lucas F.", rating: 4.5, comment: "Excelente teclado para trabalhar. Quase não faz barulho.", date: "2026-07-04" }
    ],
    relatedProducts: ["prod-16", "prod-17"]
  },
  {
    id: "prod-16",
    name: "Calculadora Científica Capi-Calcs CC-500 Pro",
    description: "Calculadora científica com display LCD de 2 linhas, 240 funções integradas, cálculos estatísticos, frações e trigonometria. Bateria solar e pilha reserva.",
    brand: "Capião Office",
    price: 79.90,
    rating: 4.8,
    stock: 50,
    category: "Escritório",
    code: "CP-CC500",
    image: "https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=500&auto=format&fit=crop&q=50",
    reviews: [],
    relatedProducts: ["prod-10", "prod-17"]
  },
  {
    id: "prod-17",
    name: "Organizador de Mesa Giratório Capi-Organizer 360",
    description: "Organizador em acrílico resistente com base giratória silenciosa de 360 graus. Possui 7 divisórias profundas para armazenar canetas, tesouras, réguas e post-its de forma organizada.",
    brand: "Capião Office",
    price: 49.90,
    rating: 4.9,
    stock: 35,
    category: "Decoração",
    code: "CP-OG360",
    image: "https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=500&auto=format&fit=crop&q=60",
    reviews: [
      { id: "rev-8", userName: "Paula Reis", rating: 5, comment: "Perfeito para minha escrivaninha! Gira super suave e cabe muita caneta.", date: "2026-07-06" }
    ],
    relatedProducts: ["prod-4", "prod-16", "prod-22"]
  },
  {
    id: "prod-18",
    name: "Plastificadora e Laminadora A4 Capi-Shield Hot-Cold",
    description: "Plastificadora profissional de alta velocidade para folhas tamanho A4, A5 e crachás. Sistema inteligente de aquecimento rápido e função reversa anti-atolamento.",
    brand: "Capião Tech",
    price: 349.90,
    promoPrice: 299.90,
    rating: 4.7,
    stock: 12,
    category: "Plastificação",
    code: "CP-PL400",
    image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&auto=format&fit=crop&q=40",
    reviews: [],
    relatedProducts: ["prod-10", "prod-11"]
  },
  {
    id: "prod-19",
    name: "Encadernadora de Espiral Manual Capi-Bind Executive",
    description: "Encadernadora perfuradora manual para espiral de plástico. Perfura até 15 folhas de 75g por vez com ajuste de margem e gaveta de resíduos de alta capacidade.",
    brand: "Capião Tech",
    price: 580.00,
    promoPrice: 499.00,
    rating: 4.8,
    stock: 6,
    category: "Encadernação",
    code: "CP-EB200",
    image: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=500&auto=format&fit=crop&q=50",
    reviews: [],
    relatedProducts: ["prod-10", "prod-18"]
  },
  {
    id: "prod-20",
    name: "Caneca de Cerâmica Capi-Mug Chef Capivara",
    description: "Caneca estilizada de cerâmica premium de 350ml com a nossa famosa Capivara usando chapéu de chef e segurando canetas. Pode ir ao micro-ondas e lava-louças.",
    brand: "Capião Gifts",
    price: 35.00,
    rating: 4.9,
    stock: 85,
    category: "Presentes",
    code: "CP-MG55",
    image: "https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=500&auto=format&fit=crop&q=40",
    reviews: [],
    relatedProducts: ["prod-17", "prod-21"]
  },
  {
    id: "prod-21",
    name: "Luminária de Mesa Capivara Zen LED com Touch",
    description: "Luminária decorativa em silicone macio BPA-Free no formato de uma capivara meditativa. Possui 3 níveis de intensidade de luz amarela acolhedora ativada por toque e bateria recarregável.",
    brand: "Capião Gifts",
    price: 119.00,
    promoPrice: 99.00,
    rating: 5.0,
    stock: 40,
    category: "Decoração",
    code: "CP-LM08",
    image: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=500&auto=format&fit=crop&q=50",
    reviews: [
      { id: "rev-9", userName: "Sofia G.", rating: 5, comment: "A coisa mais fofa do mundo! A luz é super agradável para ler à noite.", date: "2026-07-08" }
    ],
    relatedProducts: ["prod-20", "prod-17"]
  },
  {
    id: "prod-22",
    name: "Kit de Cartolinas Coloridas Capi-Colors - 50 Folhas",
    description: "Kit com 50 folhas de cartolina de alta qualidade, gramatura 150g, nas cores amarelo, azul, verde, vermelho e branco (10 folhas de cada). Perfeitas para cartazes escolares e artesanato.",
    brand: "Capião Paper",
    price: 24.90,
    rating: 4.4,
    stock: 150,
    category: "Cartolinas",
    code: "CP-CT50",
    image: "https://images.unsplash.com/photo-1519751138087-5bf79df62d5b?w=500&auto=format&fit=crop&q=50",
    reviews: [],
    relatedProducts: ["prod-1", "prod-12", "prod-14"]
  }
];

export const INITIAL_COUPONS: Coupon[] = [
  { code: "CAPIBAX", discountType: "percent", value: 10, minPurchase: 50, isActive: true },
  { code: "CAPIREI", discountType: "fixed", value: 15, minPurchase: 100, isActive: true },
  { code: "VOLTASAULAS", discountType: "percent", value: 15, minPurchase: 150, isActive: true },
  { code: "CAPI5", discountType: "percent", value: 5, minPurchase: 20, isActive: true }
];

export const INITIAL_USER: User = {
  name: "Gabriela Connor",
  email: "gabiconnor18@gmail.com",
  phone: "(11) 98765-4321",
  cashback: 12.50,
  loyaltyPoints: 350,
  photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
  addresses: [
    {
      id: "addr-1",
      street: "Avenida Paulista",
      number: "1000",
      city: "São Paulo",
      state: "SP",
      zipCode: "01310-100",
      isDefault: true
    },
    {
      id: "addr-2",
      street: "Rua das Flores",
      number: "45",
      city: "Campinas",
      state: "SP",
      zipCode: "13010-000",
      isDefault: false
    }
  ]
};

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "not-1",
    title: "Seja bem-vindo(a) à Capitão Embalagens! 🦫✨",
    description: "Use o cupom CAPIBAX para ganhar 10% de desconto na sua primeira compra acima de R$ 50!",
    timestamp: "2026-07-10 10:00",
    read: false
  },
  {
    id: "not-2",
    title: "Seu cashback está disponível!",
    description: "Você acumulou R$ 12,50 de saldo de cashback na sua última compra. Aproveite para usar hoje!",
    timestamp: "2026-07-09 14:30",
    read: true
  }
];

export const INITIAL_SCHOOL_LIST: SchoolListItem[] = [
  { id: "sch-1", name: "Estojo Escolar Completo Faber-Castell", category: "Material Escolar", quantity: 1, addedToCart: false },
  { id: "sch-2", name: "Caderno Universitário Capivara Inteligente 10 Matérias", category: "Cadernos", quantity: 3, addedToCart: false },
  { id: "sch-3", name: "Régua Profissional de Alumínio 30cm", category: "Réguas", quantity: 1, addedToCart: false },
  { id: "sch-4", name: "Borracha Record 20 Capião Soft", category: "Borrachas", quantity: 2, addedToCart: false },
  { id: "sch-5", name: "Caixa de Lápis de Cor Faber-Castell 72 Cores SuperSoft", category: "Lápis", quantity: 1, addedToCart: false }
];

export const INITIAL_GIFT_LIST: GiftListItem[] = [
  { id: "gift-1", name: "Kit Canetas Brush Pen Stabilo Pen 68", description: "Para a festa de aniversário da Júlia, presente ideal de lettering.", reservedBy: null },
  { id: "gift-2", name: "Luminária de Mesa Capivara Zen LED", description: "Presente de amigo secreto para o Mateus.", reservedBy: "gabiconnor18@gmail.com" },
  { id: "gift-3", name: "Teclado e Mouse Sem Fio Capi-Connect", description: "Presente de formatura do Thiago.", reservedBy: null }
];
