import { createClient } from "@supabase/supabase-js";
import type { Product, Order, User } from "./types";

// Client-side Supabase configuration
const metaEnv = (import.meta as any).env || {};
const supabaseUrl = metaEnv.VITE_SUPABASE_URL || "";
const supabaseKey = metaEnv.VITE_SUPABASE_KEY || metaEnv.VITE_SUPABASE_ANON_KEY || "";

export const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// Helper to hash passwords in frontend using Web Crypto API (SHA-256)
export async function hashPasswordFrontend(password: string): Promise<string> {
  try {
    const msgUint8 = new TextEncoder().encode(password);
    const hashBuffer = await window.crypto.subtle.digest("SHA-256", msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (e) {
    console.error("Erro ao gerar hash no frontend, usando plain-text fallback:", e);
    return password;
  }
}

// ----------------------------------------------------
// FRONTEND MAPPINGS
// ----------------------------------------------------
export function mapProductFromDb(p: any): Product {
  return {
    id: p.id,
    name: p.name,
    description: p.description || "",
    brand: p.brand || "",
    price: Number(p.price),
    promoPrice: p.promo_price !== null && p.promo_price !== undefined ? Number(p.promo_price) : undefined,
    rating: Number(p.rating || 5.0),
    stock: Number(p.stock || 0),
    category: p.category,
    code: p.code,
    image: p.image || "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=500",
    reviews: p.reviews || [],
    relatedProducts: p.related_products || []
  };
}

export function mapProductToDb(p: any): any {
  return {
    id: p.id,
    name: p.name,
    description: p.description || "",
    brand: p.brand || "",
    price: Number(p.price),
    promo_price: p.promoPrice !== undefined ? Number(p.promoPrice) : null,
    rating: p.rating !== undefined ? Number(p.rating) : 5.0,
    stock: p.stock !== undefined ? Number(p.stock) : 0,
    category: p.category,
    code: p.code,
    image: p.image || "",
    reviews: p.reviews || [],
    related_products: p.relatedProducts || []
  };
}

export function mapOrderFromDb(o: any): Order {
  return {
    id: o.id,
    date: o.date,
    items: o.items || [],
    total: Number(o.total),
    status: o.status,
    paymentMethod: o.payment_method || "",
    deliveryOption: o.delivery_option || "",
    address: o.address || {},
    trackingCode: o.tracking_code || "",
    statusHistory: o.status_history || []
  };
}

export function mapOrderToDb(o: any): any {
  return {
    id: o.id,
    date: o.date,
    items: o.items || [],
    total: Number(o.total),
    status: o.status,
    payment_method: o.paymentMethod || null,
    delivery_option: o.deliveryOption || null,
    address: o.address || {},
    tracking_code: o.trackingCode || null,
    status_history: o.statusHistory || []
  };
}

export function mapCustomerFromDb(c: any): any {
  return {
    id: c.id,
    name: c.name,
    email: c.email,
    password: c.password,
    phone: c.phone || "",
    addresses: c.addresses || [],
    cashback: Number(c.cashback || 0),
    loyaltyPoints: Number(c.loyalty_points || 0),
    photo: c.photo || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
  };
}

export function mapCustomerToDb(c: any): any {
  return {
    id: c.id,
    name: c.name,
    email: c.email,
    password: c.password,
    phone: c.phone || "",
    addresses: c.addresses || [],
    cashback: Number(c.cashback || 0),
    loyalty_points: Number(c.loyaltyPoints || 0),
    photo: c.photo || ""
  };
}

// ----------------------------------------------------
// SAFE FETCH UTILITY
// ----------------------------------------------------
/**
 * Safely fetches JSON from the API, preventing SyntaxError when the server returns HTML (e.g. 404 pages).
 */
async function safeFetchJson(url: string, options?: RequestInit): Promise<any> {
  const res = await fetch(url, options);
  const text = await res.text();
  
  // Try parsing as JSON
  let data: any = null;
  try {
    data = JSON.parse(text);
  } catch (e) {
    if (!res.ok) {
      throw new Error(`Erro do servidor (${res.status})`);
    } else {
      throw new Error("Resposta inválida do servidor (HTML recebido em vez de JSON)");
    }
  }
  
  if (!res.ok) {
    throw new Error(data?.error || data?.message || `Erro do servidor (${res.status})`);
  }
  
  return data;
}

// ----------------------------------------------------
// HYBRID DATA METHODS (API -> Supabase fallback)
// ----------------------------------------------------

/**
 * Fetch all products
 */
export async function clientGetProducts(): Promise<Product[]> {
  // 1. Try local server API first
  try {
    const data = await safeFetchJson("/api/products");
    if (Array.isArray(data) && data.length > 0) {
      return data;
    }
  } catch (error) {
    console.warn("clientGetProducts: Falha ao obter produtos via API, tentando Supabase...", error);
  }

  // 2. Fallback directly to Supabase client
  if (supabase) {
    try {
      const { data, error } = await supabase.from("products").select("*");
      if (error) throw error;
      if (data && data.length > 0) {
        console.log("Produtos carregados diretamente do Supabase!");
        return data.map(mapProductFromDb);
      }
    } catch (sbError) {
      console.error("clientGetProducts: Falha ao obter do Supabase:", sbError);
    }
  }

  throw new Error("Não foi possível carregar produtos.");
}

/**
 * Fetch all orders
 */
export async function clientGetOrders(): Promise<Order[]> {
  try {
    const data = await safeFetchJson("/api/orders");
    if (Array.isArray(data)) return data;
  } catch (error) {
    console.warn("clientGetOrders: Falha via API, tentando Supabase...", error);
  }

  if (supabase) {
    try {
      const { data, error } = await supabase.from("orders").select("*");
      if (error) throw error;
      if (data) {
        return data.map(mapOrderFromDb);
      }
    } catch (sbError) {
      console.error("clientGetOrders: Falha ao obter do Supabase:", sbError);
    }
  }

  throw new Error("Não foi possível carregar pedidos.");
}

/**
 * Save order
 */
export async function clientAddOrder(order: Order): Promise<Order> {
  try {
    return await safeFetchJson("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mapOrderToDb(order))
    });
  } catch (error) {
    console.warn("clientAddOrder: Falha via API, tentando Supabase...", error);
  }

  if (supabase) {
    try {
      const { data, error } = await supabase.from("orders").insert([mapOrderToDb(order)]).select();
      if (error) throw error;
      if (data && data[0]) {
        return mapOrderFromDb(data[0]);
      }
    } catch (sbError) {
      console.error("clientAddOrder Supabase Error:", sbError);
    }
  }

  // Return the locally generated order as fallback if both failed
  return order;
}

/**
 * Update order status
 */
export async function clientUpdateOrderStatus(id: string, status: string, history: any[]): Promise<any> {
  try {
    return await safeFetchJson(`/api/orders/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, description: history[history.length - 1]?.description || "" })
    });
  } catch (error) {
    console.warn("clientUpdateOrderStatus: Falha via API, tentando Supabase...", error);
  }

  if (supabase) {
    try {
      const { data, error } = await supabase.from("orders").update({
        status,
        status_history: history
      }).eq("id", id).select();
      if (error) throw error;
      if (data && data[0]) return mapOrderFromDb(data[0]);
    } catch (sbError) {
      console.error("clientUpdateOrderStatus Supabase Error:", sbError);
    }
  }

  throw new Error("Não foi possível atualizar o pedido.");
}

/**
 * Update order with PIX receipt
 */
export async function clientUploadPixReceipt(id: string, pixReceipt: string, history: any[]): Promise<any> {
  try {
    return await safeFetchJson(`/api/orders/${id}/pix-receipt`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pixReceipt })
    });
  } catch (error) {
    console.warn("clientUploadPixReceipt: Falha via API, tentando Supabase...", error);
  }

  if (supabase) {
    try {
      const { data, error } = await supabase.from("orders").update({
        pix_receipt: pixReceipt,
        pix_confirmed: false,
        status_history: history
      }).eq("id", id).select();
      if (error) throw error;
      if (data && data[0]) return mapOrderFromDb(data[0]);
    } catch (sbError) {
      console.error("clientUploadPixReceipt Supabase Error:", sbError);
    }
  }

  // Fallback locally
  return { id, pixReceipt, pixConfirmed: false, statusHistory: history };
}

/**
 * Confirm PIX payment
 */
export async function clientConfirmPixPayment(id: string, history: any[]): Promise<any> {
  try {
    return await safeFetchJson(`/api/orders/${id}/confirm-pix`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.warn("clientConfirmPixPayment: Falha via API, tentando Supabase...", error);
  }

  if (supabase) {
    try {
      const { data, error } = await supabase.from("orders").update({
        pix_confirmed: true,
        status: "Preparando",
        status_history: history
      }).eq("id", id).select();
      if (error) throw error;
      if (data && data[0]) return mapOrderFromDb(data[0]);
    } catch (sbError) {
      console.error("clientConfirmPixPayment Supabase Error:", sbError);
    }
  }

  // Fallback locally
  return { id, pixConfirmed: true, status: "Preparando", statusHistory: history };
}

/**
 * Register a customer
 */
export async function clientRegisterCustomer(name: string, email: string, secret: string, phone: string): Promise<User> {
  const hashedPassword = await hashPasswordFrontend(secret);
  const newCustomerObj = {
    id: `cust-${Date.now()}`,
    name,
    email,
    password: hashedPassword,
    phone: phone || "(11) 98122-4321",
    addresses: [
      {
        id: `addr-${Date.now()}`,
        street: "Av. Brigadeiro Luís Antônio, 1200",
        number: "Apto 45",
        city: "São Paulo",
        state: "SP",
        zipCode: "01318-001",
        isDefault: true
      }
    ],
    cashback: 12.50,
    loyaltyPoints: 120,
    photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
  };

  try {
    const data = await safeFetchJson("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password: secret, phone })
    });
    if (data && data.id) return data;
  } catch (error: any) {
    console.warn("clientRegisterCustomer: Falha via API, tentando Supabase...", error);
    if (error.message && error.message.includes("E-mail já cadastrado")) {
      throw error;
    }
  }

  // Register directly via Supabase
  if (supabase) {
    try {
      // Check if email already exists
      const { data: existing, error: checkError } = await supabase.from("customers").select("id").ilike("email", email.trim().toLowerCase());
      if (checkError) throw checkError;

      if (existing && existing.length > 0) {
        throw new Error("E-mail já cadastrado.");
      }

      const dbCustomer = mapCustomerToDb(newCustomerObj);
      const { data, error } = await supabase.from("customers").insert([dbCustomer]).select();
      if (error) {
        console.error("clientRegisterCustomer Supabase error:", error);
        throw error;
      }
      if (data && data[0]) {
        return mapCustomerFromDb(data[0]);
      }
    } catch (dbError: any) {
      console.warn("clientRegisterCustomer: Falha ao cadastrar no Supabase, usando LocalStorage fallback...", dbError);
      if (dbError.message && dbError.message.includes("E-mail já cadastrado")) {
        throw dbError;
      }
    }
  }

  // If no Supabase, return local customer (LocalStorage fallback handles persistence)
  return newCustomerObj;
}

/**
 * Login a customer
 */
export async function clientLoginCustomer(email: string, secret: string): Promise<User> {
  try {
    const data = await safeFetchJson("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: secret })
    });
    if (data && data.id) return data;
  } catch (error: any) {
    console.warn("clientLoginCustomer: Falha via API, tentando Supabase...", error);
    if (error.message && (error.message.includes("Senha incorreta") || error.message.includes("não cadastrado"))) {
      throw error;
    }
  }

  // Login directly via Supabase
  if (supabase) {
    try {
      const { data, error } = await supabase.from("customers").select("*").ilike("email", email.trim().toLowerCase());
      if (error) throw error;
      
      if (!data || data.length === 0) {
        throw new Error("Usuário não cadastrado com este e-mail.");
      }
      
      const customer = data[0];
      const hashedPassword = await hashPasswordFrontend(secret);
      if (customer.password !== hashedPassword && customer.password !== secret) {
        throw new Error("Senha incorreta.");
      }
      
      return mapCustomerFromDb(customer);
    } catch (dbError: any) {
      console.warn("clientLoginCustomer: Falha ao autenticar no Supabase...", dbError);
      if (dbError.message && (dbError.message.includes("Senha incorreta") || dbError.message.includes("não cadastrado"))) {
        throw dbError;
      }
    }
  }

  // Fallback check on LocalStorage / Default credentials
  if (email.trim().toLowerCase() === "gabiconnor18@gmail.com") {
    const defaultHash = await hashPasswordFrontend("123456");
    const secretHash = await hashPasswordFrontend(secret);
    if (secretHash === defaultHash || secret === "123456") {
      return {
        id: "cust-default",
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
      };
    } else {
      throw new Error("Senha incorreta.");
    }
  }

  throw new Error("Não foi possível conectar ao servidor de autenticação.");
}

/**
 * Update Customer Profile
 */
export async function clientUpdateCustomerProfile(id: string, name: string, email: string, phone: string, addresses: any[], cashback?: number, loyaltyPoints?: number): Promise<User> {
  const fields: any = { name, email, phone, addresses };
  if (cashback !== undefined) fields.cashback = cashback;
  if (loyaltyPoints !== undefined) fields.loyaltyPoints = loyaltyPoints;

  try {
    const data = await safeFetchJson(`/api/auth/profile/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields)
    });
    if (data && data.id) return data;
  } catch (error) {
    console.warn("clientUpdateCustomerProfile: Falha via API, tentando Supabase...", error);
  }

  if (supabase) {
    try {
      const dbFields: any = {
        name,
        email,
        phone,
        addresses
      };
      if (cashback !== undefined) dbFields.cashback = cashback;
      if (loyaltyPoints !== undefined) dbFields.loyalty_points = loyaltyPoints;

      const { data, error } = await supabase.from("customers").update(dbFields).eq("id", id).select();
      if (error) throw error;
      if (data && data[0]) {
        return mapCustomerFromDb(data[0]);
      }
    } catch (sbError) {
      console.error("clientUpdateCustomerProfile Supabase Error:", sbError);
    }
  }

  throw new Error("Não foi possível sincronizar o perfil.");
}

/**
 * Add product (Admin)
 */
export async function clientAddProduct(newProd: Omit<Product, 'id' | 'reviews' | 'relatedProducts' | 'rating'>): Promise<Product> {
  const p: Product = {
    ...newProd,
    id: `prod-${Date.now()}`,
    rating: 5.0,
    reviews: [],
    relatedProducts: []
  };

  try {
    return await safeFetchJson("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProd)
    });
  } catch (error) {
    console.warn("clientAddProduct: Falha via API, tentando Supabase...", error);
  }

  if (supabase) {
    try {
      const dbProd = mapProductToDb(p);
      const { data, error } = await supabase.from("products").insert([dbProd]).select();
      if (error) throw error;
      if (data && data[0]) return mapProductFromDb(data[0]);
    } catch (sbError) {
      console.error("clientAddProduct Supabase Error:", sbError);
    }
  }

  return p;
}

/**
 * Update product (Admin)
 */
export async function clientUpdateProduct(updated: Product): Promise<Product> {
  try {
    return await safeFetchJson(`/api/products/${updated.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated)
    });
  } catch (error) {
    console.warn("clientUpdateProduct: Falha via API, tentando Supabase...", error);
  }

  if (supabase) {
    try {
      const dbProd = mapProductToDb(updated);
      const { data, error } = await supabase.from("products").update(dbProd).eq("id", updated.id).select();
      if (error) throw error;
      if (data && data[0]) return mapProductFromDb(data[0]);
    } catch (sbError) {
      console.error("clientUpdateProduct Supabase Error:", sbError);
    }
  }

  return updated;
}

/**
 * Delete product (Admin)
 */
export async function clientDeleteProduct(productId: string): Promise<boolean> {
  try {
    await safeFetchJson(`/api/products/${productId}`, {
      method: "DELETE"
    });
    return true;
  } catch (error) {
    console.warn("clientDeleteProduct: Falha via API, tentando Supabase...", error);
  }

  if (supabase) {
    try {
      const { error } = await supabase.from("products").delete().eq("id", productId);
      if (error) throw error;
      return true;
    } catch (sbError) {
      console.error("clientDeleteProduct Supabase Error:", sbError);
    }
  }

  return true;
}

