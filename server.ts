import "dotenv/config";
import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

// Local file DB service
import * as db from "./src/dbService";

// Types for backend
import type { Product, Order } from "./src/types";

const app = express();
const PORT = 3000;

app.use(express.json());

// Gemini API Client initialization
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        }
      }
    });
    console.log("Gemini API Client inicializado com sucesso.");
  } catch (error) {
    console.error("Falha ao inicializar o cliente Gemini:", error);
  }
} else {
  console.log("GEMINI_API_KEY não encontrada. O Chatbot de suporte usará o fallback inteligente baseado em regras locais.");
}

// ----------------------------------------------------
// API ENDPOINTS
// ----------------------------------------------------

// 1. PRODUCTS ENDPOINTS
app.get("/api/products", async (req, res) => {
  try {
    const products = await db.getProducts();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Erro ao listar produtos." });
  }
});

app.post("/api/products", async (req, res) => {
  try {
    const { name, description, brand, price, promoPrice, stock, category, code, image } = req.body;
    if (!name || !price || !category || !code) {
      return res.status(400).json({ error: "Campos obrigatórios ausentes: name, price, category ou code." });
    }

    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      name,
      description: description || "",
      brand: brand || "",
      price: Number(price),
      promoPrice: promoPrice ? Number(promoPrice) : undefined,
      rating: 5.0,
      stock: Number(stock) || 0,
      category,
      code,
      image: image || "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=500",
      reviews: [],
      relatedProducts: []
    };

    const created = await db.addProduct(newProduct);
    res.status(201).json(created);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Erro ao criar produto." });
  }
});

app.put("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedFields = req.body;
    
    const updated = await db.updateProduct(id, updatedFields);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Erro ao atualizar produto." });
  }
});

app.delete("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await db.deleteProduct(id);

    if (!deleted) {
      return res.status(404).json({ error: "Produto não encontrado." });
    }

    res.json({ success: true, message: "Produto removido com sucesso." });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Erro ao remover produto." });
  }
});

// 2. ORDERS ENDPOINTS
app.get("/api/orders", async (req, res) => {
  try {
    const orders = await db.getOrders();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Erro ao listar pedidos." });
  }
});

app.post("/api/orders", async (req, res) => {
  try {
    const { items, total, paymentMethod, deliveryOption, address, appliedCoupon } = req.body;
    if (!items || !total || !paymentMethod || !deliveryOption || !address) {
      return res.status(400).json({ error: "Campos obrigatórios do pedido ausentes." });
    }

    const newOrder: Order = {
      id: `PED-${Math.floor(100000 + Math.random() * 900000)}`,
      date: new Date().toISOString().replace("T", " ").substring(0, 16),
      items,
      total: Number(total),
      status: "Pendente",
      paymentMethod,
      deliveryOption,
      address,
      trackingCode: `CAP-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      statusHistory: [
        {
          status: "Pendente",
          date: new Date().toISOString().replace("T", " ").substring(0, 16),
          description: "Pedido recebido e aguardando processamento de pagamento."
        }
      ]
    };

    const created = await db.addOrder(newOrder);
    res.status(201).json(created);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Erro ao registrar pedido." });
  }
});

app.put("/api/orders/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, description } = req.body;
    if (!status) {
      return res.status(400).json({ error: "Status é obrigatório." });
    }

    // Read current orders to find history or just build it
    const orders = await db.getOrders();
    const existingOrder = orders.find((o) => o.id === id);

    if (!existingOrder) {
      return res.status(404).json({ error: "Pedido não encontrado." });
    }

    const dateStr = new Date().toISOString().replace("T", " ").substring(0, 16);
    const updatedHistory = [
      ...existingOrder.statusHistory,
      {
        status,
        date: dateStr,
        description: description || `Status do pedido alterado para ${status}.`
      }
    ];

    const updated = await db.updateOrderStatus(id, status, updatedHistory);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Erro ao atualizar status do pedido." });
  }
});

// 3. GEMINI SUPPORT CHAT ENDPOINT
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Mensagem é obrigatória." });
    }

    // Try utilizing Gemini if initialized
    if (aiClient) {
      try {
        const systemInstruction = `Você é o Capitão Capião, a capivara mascote e assistente virtual oficial da Capitão Embalagens S/A, uma loja brasileira especializada em materiais escolares premium, artigos de escritório de alto padrão, embalagens sustentáveis, brindes e papelaria de arte fina.
        
Seu tom é extremamente acolhedor, profissional, alegre e ligeiramente carismático (você pode fazer trocadilhos saudáveis com capivaras ou papelaria de vez em quando, mas sempre focando em resolver o problema do cliente de maneira clara, objetiva e em português do Brasil).

Políticas e Informações Úteis da Loja:
- Frete e Entrega: Oferecemos retirada física grátis na loja física de Curitiba (em até 2 horas), entrega expressa local por R$ 10,00 (entrega em 24h) e envio por transportadora/Correios para todo o Brasil (calculado no carrinho).
- Cupons Ativos: CAPIBAX (10% de desconto para compras acima de R$50) e CAPI5 (5% de desconto em qualquer valor de compra).
- Formas de Pagamento: PIX (com aprovação instantânea e 5% de desconto cumulativo), cartões de crédito (em até 6x sem juros) e boleto bancário tradicional.
- Cashback e Fidelidade: Todas as compras rendem 5% de cashback direto no perfil do cliente, aplicado de forma automática em fechar qualquer carrinho posterior. Não expira!
- Produtos de destaque: Estojo Completo Faber-Castell Capião Edition, Caderno Universitário Capivara Inteligente, Mochila Capi-Pack Pro Impermeável, Kit Canetas Stabilo, Caixa de Lápis Faber-Castell 72 cores SuperSoft.

Responda à mensagem do usuário respeitando este contexto de forma concisa (máximo de 3 parágrafos).`;

        const response = await aiClient.models.generateContent({
          model: "gemini-3.5-flash",
          contents: message,
          config: {
            systemInstruction
          }
        });

        const reply = response.text || "Entendi perfeitamente! Como assistente virtual da Capitão Embalagens, estou aqui para ajudar.";
        return res.json({ text: reply });
      } catch (geminiError) {
        console.error("Erro interno ao chamar a API Gemini, acionando fallback inteligente:", geminiError);
      }
    }

    // Fallback inteligente baseado em regras
    const txt = message.toLowerCase();
    let reply = "Entendi! O seu contato foi encaminhado para nossa equipe de atendimento humano da Capitão Embalagens S/A. Responderemos em poucos minutos. 🦫💙";
    if (txt.includes("frete") || txt.includes("entrega") || txt.includes("enviar") || txt.includes("envio")) {
      reply = "Oferecemos retirada física grátis em Curitiba (em 2 horas), entrega expressa local por apenas R$ 10,00 em 24 horas, e envio via Correios/Transportadora para todo o Brasil. Você pode acompanhar cada etapa do seu pedido pelo seu painel de Perfil!";
    } else if (txt.includes("pagamento") || txt.includes("pix") || txt.includes("cartão") || txt.includes("boleto")) {
      reply = "Aceitamos pagamento via PIX (que tem aprovação instantânea e te dá 5% de desconto extra cumulativo!), cartões de crédito em até 6x sem juros, ou boleto bancário tradicional.";
    } else if (txt.includes("cupom") || txt.includes("desconto") || txt.includes("promoção")) {
      reply = "Temos cupons incríveis ativos hoje! Use CAPIBAX para 10% de desconto em compras acima de R$50, ou CAPI5 para 5% de desconto em qualquer pedido. Basta inseri-los no campo de cupom dentro do carrinho!";
    } else if (txt.includes("cashback") || txt.includes("fidelidade") || txt.includes("pontos")) {
      reply = "Na Capitão Embalagens, cada compra que você faz te devolve 5% do valor em cashback na sua conta! Esse saldo é acumulado e se aplica de forma 100% automática no fechamento de qualquer carrinho posterior. E o melhor: o cashback não expira nunca!";
    } else if (txt.includes("caderno") || txt.includes("mochila") || txt.includes("estojo") || txt.includes("caneta") || txt.includes("lapis") || txt.includes("lápis")) {
      reply = "Nossa linha de produtos premium com selo Capitão é excelente! Temos o Estojo Completo Faber-Castell Capião Edition, o Caderno Universitário Capivara Inteligente e a Mochila Capi-Pack Pro Impermeável. Eles são super elogiados pelos nossos clientes!";
    }

    res.json({ text: reply });
  } catch (error) {
    res.status(500).json({ error: "Erro ao processar conversa de suporte." });
  }
});

// 4. AUTHENTICATION & REGISTRATION ENDPOINTS (CUSTOMERS & ADMINS)

// Customer login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "E-mail e senha são obrigatórios." });
    }
    const customer = await db.getCustomerByEmail(email);
    if (!customer) {
      return res.status(401).json({ error: "Usuário não cadastrado com este e-mail." });
    }
    const hashed = db.hashPassword(password);
    if (customer.password !== hashed) {
      return res.status(401).json({ error: "Senha incorreta." });
    }
    // Return customer profile without password, mapping database fields to frontend model
    const customerProfile = {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      cashback: Number(customer.cashback || 0),
      loyaltyPoints: Number(customer.loyalty_points || 0),
      addresses: customer.addresses || [],
      photo: customer.photo || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
    };
    res.json(customerProfile);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Erro ao efetuar login." });
  }
});

// Customer register
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Nome, e-mail e senha são obrigatórios." });
    }

    // Check if customer already exists
    const existing = await db.getCustomerByEmail(email);
    if (existing) {
      return res.status(400).json({ error: "E-mail já cadastrado." });
    }

    const defaultAddresses = [
      {
        id: `addr-${Date.now()}`,
        street: "Av. Brigadeiro Luís Antônio, 1200",
        number: "Apto 45",
        city: "São Paulo",
        state: "SP",
        zipCode: "01318-001",
        isDefault: true
      }
    ];

    const newCustomer = {
      id: `cust-${Date.now()}`,
      name,
      email,
      password: db.hashPassword(password),
      phone: phone || "(11) 98122-4321",
      addresses: defaultAddresses,
      cashback: 12.50, // Welcome gift cashback!
      loyalty_points: 120,
      photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
    };

    const created = await db.addCustomer(newCustomer);
    const customerProfile = {
      id: created.id,
      name: created.name,
      email: created.email,
      phone: created.phone,
      cashback: Number(created.cashback || 0),
      loyaltyPoints: Number(created.loyalty_points || 0),
      addresses: created.addresses || [],
      photo: created.photo || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
    };
    res.status(201).json(customerProfile);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Erro ao registrar usuário." });
  }
});

// Update Customer profile
app.put("/api/auth/profile/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, addresses, cashback, loyaltyPoints } = req.body;
    
    const fieldsToUpdate: any = {};
    if (name !== undefined) fieldsToUpdate.name = name;
    if (email !== undefined) fieldsToUpdate.email = email;
    if (phone !== undefined) fieldsToUpdate.phone = phone;
    if (addresses !== undefined) fieldsToUpdate.addresses = addresses;
    if (cashback !== undefined) fieldsToUpdate.cashback = Number(cashback);
    if (loyaltyPoints !== undefined) fieldsToUpdate.loyalty_points = Number(loyaltyPoints);

    const updated = await db.updateCustomer(id, fieldsToUpdate);
    const profile = {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      phone: updated.phone,
      cashback: Number(updated.cashback || 0),
      loyaltyPoints: Number(updated.loyalty_points || 0),
      addresses: updated.addresses || [],
      photo: updated.photo || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
    };
    res.json(profile);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Erro ao atualizar perfil do cliente." });
  }
});



// ----------------------------------------------------
// DEV SERVER MIDDLEWARE / PRODUCTION STATIC SERVING
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Full-Stack Server] Rodando com sucesso em http://localhost:${PORT}`);
  });
}

startServer();
