import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { INITIAL_PRODUCTS } from "./types";
import type { Product, Order } from "./types";
import crypto from "crypto";

let supabaseClient: SupabaseClient | null = null;

// Lazy initialization of Supabase client
export function getSupabase(): SupabaseClient {
  if (supabaseClient) return supabaseClient;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase não configurado. Verifique se as variáveis de ambiente SUPABASE_URL e SUPABASE_KEY estão definidas no arquivo .env."
    );
  }

  try {
    supabaseClient = createClient(url, key, {
      auth: {
        persistSession: false,
      },
    });
    console.log("🟢 Cliente Supabase inicializado com sucesso!");
    return supabaseClient;
  } catch (err: any) {
    console.error("❌ Falha ao inicializar o cliente Supabase:", err);
    throw new Error(`Falha ao inicializar o cliente Supabase: ${err.message || err}`);
  }
}

export function isSupabaseConfigured(): boolean {
  return !!(process.env.SUPABASE_URL && process.env.SUPABASE_KEY);
}

// Map from Supabase (snake_case) to Frontend (camelCase)
function mapProductFromDb(dbProd: any): Product {
  return {
    id: dbProd.id,
    name: dbProd.name,
    description: dbProd.description || "",
    brand: dbProd.brand || "",
    price: Number(dbProd.price),
    promoPrice: dbProd.promo_price ? Number(dbProd.promo_price) : undefined,
    rating: Number(dbProd.rating) || 5.0,
    stock: Number(dbProd.stock) || 0,
    category: dbProd.category,
    code: dbProd.code,
    image: dbProd.image || "",
    reviews: Array.isArray(dbProd.reviews) ? dbProd.reviews : [],
    relatedProducts: Array.isArray(dbProd.related_products) ? dbProd.related_products : [],
  };
}

// Map from Frontend (camelCase) to Supabase (snake_case)
function mapProductToDb(prod: Product | Omit<Product, "rating" | "reviews" | "relatedProducts">): any {
  const dbProd: any = {
    id: prod.id,
    name: prod.name,
    description: prod.description,
    brand: prod.brand,
    price: prod.price,
    promo_price: prod.promoPrice,
    stock: prod.stock,
    category: prod.category,
    code: prod.code,
    image: prod.image,
  };

  if ("rating" in prod) dbProd.rating = prod.rating;
  if ("reviews" in prod) dbProd.reviews = prod.reviews;
  if ("relatedProducts" in prod) dbProd.related_products = prod.relatedProducts;

  return dbProd;
}

// Map from Order (camelCase / types) to Supabase (snake_case)
function mapOrderToDb(order: Order): any {
  return {
    id: order.id,
    date: order.date,
    items: order.items,
    total: order.total,
    status: order.status,
    payment_method: order.paymentMethod,
    delivery_option: order.deliveryOption,
    address: order.address,
    tracking_code: order.trackingCode,
    status_history: order.statusHistory,
  };
}

// Map from Supabase (snake_case) to Frontend Order (camelCase)
function mapOrderFromDb(dbOrder: any): Order {
  return {
    id: dbOrder.id,
    date: dbOrder.date,
    items: Array.isArray(dbOrder.items) ? dbOrder.items : [],
    total: Number(dbOrder.total),
    status: dbOrder.status as any,
    paymentMethod: dbOrder.payment_method || "",
    deliveryOption: dbOrder.delivery_option || "",
    address: dbOrder.address || {},
    trackingCode: dbOrder.tracking_code || "",
    statusHistory: Array.isArray(dbOrder.status_history) ? dbOrder.status_history : [],
  };
}

// ==========================================
// UNIFIED DB EXPORTS (Supabase strictly)
// ==========================================

export async function getProducts(): Promise<Product[]> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("⚠️ Erro ao obter produtos do Supabase:", error.message);
      throw error;
    }

    // Auto seed database if empty
    if (!data || data.length === 0) {
      console.log("🌱 Banco de dados Supabase vazio. Semeando produtos iniciais...");
      await seedInitialProducts(supabase);
      return getProducts(); // Retrieve again after seeding
    }

    return data.map(mapProductFromDb);
  } catch (err: any) {
    console.error("❌ Falha ao obter produtos do Supabase:", err.message || err);
    throw err;
  }
}

export async function addProduct(prod: Product): Promise<Product> {
  try {
    const supabase = getSupabase();
    const dbData = mapProductToDb(prod);
    const { data, error } = await supabase
      .from("products")
      .insert([dbData])
      .select();

    if (error) throw error;
    return mapProductFromDb(data[0]);
  } catch (err: any) {
    console.error("❌ Erro ao adicionar produto no Supabase:", err.message || err);
    throw new Error(`Erro no Supabase: ${err.message || err}`);
  }
}

export async function updateProduct(id: string, updatedFields: Partial<Product>): Promise<Product> {
  try {
    const supabase = getSupabase();
    const mappedFields: any = {};
    if (updatedFields.name !== undefined) mappedFields.name = updatedFields.name;
    if (updatedFields.description !== undefined) mappedFields.description = updatedFields.description;
    if (updatedFields.brand !== undefined) mappedFields.brand = updatedFields.brand;
    if (updatedFields.price !== undefined) mappedFields.price = updatedFields.price;
    if (updatedFields.promoPrice !== undefined) mappedFields.promo_price = updatedFields.promoPrice;
    if (updatedFields.stock !== undefined) mappedFields.stock = updatedFields.stock;
    if (updatedFields.category !== undefined) mappedFields.category = updatedFields.category;
    if (updatedFields.code !== undefined) mappedFields.code = updatedFields.code;
    if (updatedFields.image !== undefined) mappedFields.image = updatedFields.image;
    if (updatedFields.reviews !== undefined) mappedFields.reviews = updatedFields.reviews;
    if (updatedFields.relatedProducts !== undefined) mappedFields.related_products = updatedFields.relatedProducts;
    if (updatedFields.rating !== undefined) mappedFields.rating = updatedFields.rating;

    const { data, error } = await supabase
      .from("products")
      .update(mappedFields)
      .eq("id", id)
      .select();

    if (error) throw error;
    if (!data || data.length === 0) throw new Error("Produto não encontrado ou não atualizado.");

    return mapProductFromDb(data[0]);
  } catch (err: any) {
    console.error(`❌ Erro ao atualizar produto ${id} no Supabase:`, err.message || err);
    throw new Error(`Erro no Supabase: ${err.message || err}`);
  }
}

export async function deleteProduct(id: string): Promise<boolean> {
  try {
    const supabase = getSupabase();
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return true;
  } catch (err: any) {
    console.error(`❌ Erro ao deletar produto ${id} no Supabase:`, err.message || err);
    throw new Error(`Erro no Supabase: ${err.message || err}`);
  }
}

export async function getOrders(): Promise<Order[]> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("⚠️ Erro ao obter pedidos do Supabase:", error.message);
      throw error;
    }

    return data.map(mapOrderFromDb);
  } catch (err) {
    console.error("❌ Falha ao obter pedidos do Supabase:", err);
    throw err;
  }
}

export async function addOrder(order: Order): Promise<Order> {
  try {
    const supabase = getSupabase();
    const dbOrder = mapOrderToDb(order);
    const { data, error } = await supabase
      .from("orders")
      .insert([dbOrder])
      .select();

    if (error) throw error;
    return mapOrderFromDb(data[0]);
  } catch (err: any) {
    console.error("❌ Erro ao adicionar pedido no Supabase:", err.message || err);
    throw new Error(`Erro no Supabase: ${err.message || err}`);
  }
}

export async function updateOrderStatus(id: string, status: string, statusHistory: any[]): Promise<Order> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("orders")
      .update({
        status,
        status_history: statusHistory,
      })
      .eq("id", id)
      .select();

    if (error) throw error;
    if (!data || data.length === 0) throw new Error("Pedido não encontrado.");

    return mapOrderFromDb(data[0]);
  } catch (err: any) {
    console.error(`❌ Erro ao atualizar status do pedido ${id} no Supabase:`, err.message || err);
    throw new Error(`Erro no Supabase: ${err.message || err}`);
  }
}

// Seed helper
async function seedInitialProducts(supabase: SupabaseClient) {
  try {
    const dbProducts = INITIAL_PRODUCTS.map(p => mapProductToDb(p));
    const { error } = await supabase
      .from("products")
      .insert(dbProducts);

    if (error) {
      console.error("❌ Falha ao semear produtos iniciais no Supabase:", error.message);
    } else {
      console.log("🌱 Semeados com sucesso todos os produtos iniciais no Supabase!");
    }
  } catch (err) {
    console.error("❌ Falha inesperada ao semear produtos iniciais no Supabase:", err);
  }
}

// ==========================================
// SECURE PASSWORD HASHING (scrypt with Salt)
// ==========================================

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash) return false;
  // If it's a legacy SHA-256 hash or plain text (no colon separator)
  if (!storedHash.includes(":")) {
    const legacyHash = crypto.createHash("sha256").update(password).digest("hex");
    return legacyHash === storedHash || password === storedHash;
  }
  const [salt, hash] = storedHash.split(":");
  const newHash = crypto.scryptSync(password, salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(newHash, "hex"));
}

// ==========================================
// CUSTOMER & ADMIN DATABASE METHODS
// ==========================================

export async function getCustomerByEmail(email: string): Promise<any | null> {
  const searchEmail = email.toLowerCase().trim();
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .eq("email", searchEmail)
      .maybeSingle();

    if (error) throw error;
    return data || null;
  } catch (err: any) {
    console.error("Erro ao buscar cliente por e-mail no Supabase:", err.message || err);
    throw err;
  }
}

export async function getCustomers(): Promise<any[]> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err: any) {
    console.error("Erro ao obter lista de clientes do Supabase:", err.message || err);
    throw err;
  }
}

export async function addCustomer(customer: any): Promise<any> {
  customer.email = customer.email.toLowerCase().trim();

  // If password needs hashing (is not already a secure scrypt hash containing a colon)
  if (customer.password && !customer.password.includes(":")) {
    customer.password = hashPassword(customer.password);
  }

  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("customers")
      .insert([customer])
      .select();

    if (error) {
      if (error.code === '23505') throw new Error("E-mail já cadastrado no banco.");
      throw error;
    }

    return data[0];
  } catch (err: any) {
    console.error("Erro ao cadastrar cliente no Supabase:", err.message || err);
    throw new Error(err.message || "Falha ao cadastrar cliente.");
  }
}

export async function updateCustomer(id: string, fields: any): Promise<any> {
  if (fields.email) fields.email = fields.email.toLowerCase().trim();

  if (fields.password && !fields.password.includes(":")) {
    fields.password = hashPassword(fields.password);
  }

  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("customers")
      .update(fields)
      .eq("id", id)
      .select();

    if (error) throw error;
    if (!data || data.length === 0) throw new Error("Cliente não encontrado.");
    return data[0];
  } catch (err: any) {
    console.error(`Erro ao atualizar cliente ${id} no Supabase:`, err.message || err);
    throw new Error(err.message || "Falha ao atualizar cliente.");
  }
}

export async function getAdminByEmail(email: string): Promise<any | null> {
  const searchEmail = email.toLowerCase().trim();
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("admins")
      .select("*")
      .eq("email", searchEmail)
      .maybeSingle();

    if (error) throw error;
    return data || null;
  } catch (err: any) {
    console.error("Erro ao obter administrador do Supabase:", err.message || err);
    throw err;
  }
}

export async function getAdmins(): Promise<any[]> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("admins")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err: any) {
    console.error("Erro ao obter lista de administradores do Supabase:", err.message || err);
    throw err;
  }
}

export async function addAdmin(admin: any): Promise<any> {
  admin.email = admin.email.toLowerCase().trim();

  if (admin.password && !admin.password.includes(":")) {
    admin.password = hashPassword(admin.password);
  }

  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("admins")
      .insert([admin])
      .select();

    if (error) {
      if (error.code === '23505') throw new Error("Administrador já cadastrado com esse e-mail.");
      throw error;
    }

    return data[0];
  } catch (err: any) {
    console.error("Erro ao cadastrar administrador no Supabase:", err.message || err);
    throw new Error(err.message || "Falha ao cadastrar administrador.");
  }
}
