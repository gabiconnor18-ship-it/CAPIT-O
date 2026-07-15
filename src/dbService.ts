import fs from "fs";
import path from "path";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import { INITIAL_PRODUCTS } from "./types";
import type { Product, Order } from "./types";
import { encryptData, decryptData } from "./lib/cryptoUtils";

// Initialize Supabase Client if credentials exist
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_KEY || "";
export const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

if (supabase) {
  console.log("Supabase Client backend inicializado com sucesso.");
} else {
  console.log("SUPABASE_URL ou SUPABASE_KEY ausentes. Usando fallback de arquivos locais.");
}

// Data Mappings between Frontend types and Supabase Schema
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
    image: p.image || "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=500",
    reviews: p.reviews || [],
    related_products: p.relatedProducts || []
  };
}

export function mapProductToDbPartial(p: Partial<Product>): any {
  const mapped: any = {};
  if (p.id !== undefined) mapped.id = p.id;
  if (p.name !== undefined) mapped.name = p.name;
  if (p.description !== undefined) mapped.description = p.description;
  if (p.brand !== undefined) mapped.brand = p.brand;
  if (p.price !== undefined) mapped.price = Number(p.price);
  if (p.promoPrice !== undefined) mapped.promo_price = p.promoPrice !== null ? Number(p.promoPrice) : null;
  if (p.rating !== undefined) mapped.rating = Number(p.rating);
  if (p.stock !== undefined) mapped.stock = Number(p.stock);
  if (p.category !== undefined) mapped.category = p.category;
  if (p.code !== undefined) mapped.code = p.code;
  if (p.image !== undefined) mapped.image = p.image;
  if (p.reviews !== undefined) mapped.reviews = p.reviews;
  if (p.relatedProducts !== undefined) mapped.related_products = p.relatedProducts;
  return mapped;
}

export function mapProductFromDb(p: any): Product {
  return {
    id: p.id,
    name: p.name,
    description: p.description || "",
    brand: p.brand || "",
    price: Number(p.price),
    promoPrice: p.promo_price !== null ? Number(p.promo_price) : undefined,
    rating: Number(p.rating || 5.0),
    stock: Number(p.stock || 0),
    category: p.category,
    code: p.code,
    image: p.image || "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=500",
    reviews: p.reviews || [],
    relatedProducts: p.related_products || []
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
    status_history: o.statusHistory || [],
    pix_receipt: o.pixReceipt || null,
    pix_confirmed: o.pixConfirmed || false
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
    statusHistory: o.status_history || [],
    pixReceipt: o.pix_receipt || undefined,
    pixConfirmed: o.pix_confirmed || false
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
    loyalty_points: Number(c.loyalty_points !== undefined ? c.loyalty_points : (c.loyaltyPoints || 0)),
    photo: c.photo || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
  };
}

export function mapCustomerToDbPartial(c: any): any {
  const mapped: any = {};
  if (c.id !== undefined) mapped.id = c.id;
  if (c.name !== undefined) mapped.name = c.name;
  if (c.email !== undefined) mapped.email = c.email;
  if (c.password !== undefined) mapped.password = c.password;
  if (c.phone !== undefined) mapped.phone = c.phone;
  if (c.addresses !== undefined) mapped.addresses = c.addresses;
  if (c.cashback !== undefined) mapped.cashback = Number(c.cashback);
  if (c.loyaltyPoints !== undefined) mapped.loyalty_points = Number(c.loyaltyPoints);
  if (c.loyalty_points !== undefined) mapped.loyalty_points = Number(c.loyalty_points);
  if (c.photo !== undefined) mapped.photo = c.photo;
  return mapped;
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

// Local storage fallback files
const PRODUCTS_FILE = path.join(process.cwd(), "products.json");
const ORDERS_FILE = path.join(process.cwd(), "orders.json");
const CUSTOMERS_FILE = path.join(process.cwd(), "customers.json");
const ADMINS_FILE = path.join(process.cwd(), "admins.json");

export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// ------------------------------------------
// LOCAL PRODUCTS FILE MANAGERS
// ------------------------------------------
function readLocalProducts(): Product[] {
  try {
    if (fs.existsSync(PRODUCTS_FILE)) {
      const data = fs.readFileSync(PRODUCTS_FILE, "utf-8").trim();
      const decrypted = data.startsWith("ENC:") ? decryptData(data) : data;
      return JSON.parse(decrypted);
    }
  } catch (error) {
    console.error("Local DB: Erro ao ler produtos do arquivo:", error);
  }
  return INITIAL_PRODUCTS;
}

function writeLocalProducts(products: Product[]) {
  try {
    const raw = JSON.stringify(products, null, 2);
    fs.writeFileSync(PRODUCTS_FILE, encryptData(raw), "utf-8");
  } catch (error) {
    console.error("Local DB: Erro ao salvar produtos no arquivo:", error);
  }
}

// ------------------------------------------
// LOCAL ORDERS FILE MANAGERS
// ------------------------------------------
function readLocalOrders(): Order[] {
  try {
    if (fs.existsSync(ORDERS_FILE)) {
      const data = fs.readFileSync(ORDERS_FILE, "utf-8").trim();
      const decrypted = data.startsWith("ENC:") ? decryptData(data) : data;
      return JSON.parse(decrypted);
    }
  } catch (error) {
    console.error("Local DB: Erro ao ler pedidos do arquivo:", error);
  }
  return [];
}

function writeLocalOrders(orders: Order[]) {
  try {
    const raw = JSON.stringify(orders, null, 2);
    fs.writeFileSync(ORDERS_FILE, encryptData(raw), "utf-8");
  } catch (error) {
    console.error("Local DB: Erro ao salvar pedidos no arquivo:", error);
  }
}

// ------------------------------------------
// LOCAL CUSTOMERS FILE MANAGERS
// ------------------------------------------
function readLocalCustomers(): any[] {
  try {
    if (fs.existsSync(CUSTOMERS_FILE)) {
      const data = fs.readFileSync(CUSTOMERS_FILE, "utf-8").trim();
      const decrypted = data.startsWith("ENC:") ? decryptData(data) : data;
      return JSON.parse(decrypted);
    }
  } catch (error) {
    console.error("Local DB: Erro ao ler clientes do arquivo:", error);
  }
  return [
    {
      id: "cust-1",
      name: "Gabriela Connor",
      email: "gabiconnor18@gmail.com",
      password: hashPassword("123456"),
      phone: "(11) 98122-4321",
      cashback: 12.50,
      loyalty_points: 120,
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
    }
  ];
}

function writeLocalCustomers(customers: any[]) {
  try {
    const raw = JSON.stringify(customers, null, 2);
    fs.writeFileSync(CUSTOMERS_FILE, encryptData(raw), "utf-8");
  } catch (error) {
    console.error("Local DB: Erro ao salvar clientes no arquivo:", error);
  }
}

// ------------------------------------------
// LOCAL ADMINS FILE MANAGERS
// ------------------------------------------
function readLocalAdmins(): any[] {
  try {
    if (fs.existsSync(ADMINS_FILE)) {
      const data = fs.readFileSync(ADMINS_FILE, "utf-8").trim();
      const decrypted = data.startsWith("ENC:") ? decryptData(data) : data;
      return JSON.parse(decrypted);
    }
  } catch (error) {
    console.error("Local DB: Erro ao ler admins do arquivo:", error);
  }
  return [
    {
      id: "admin-1",
      name: "Admin Capitão",
      email: "admin@capitao.com",
      password: hashPassword("admin")
    }
  ];
}

function writeLocalAdmins(admins: any[]) {
  try {
    const raw = JSON.stringify(admins, null, 2);
    fs.writeFileSync(ADMINS_FILE, encryptData(raw), "utf-8");
  } catch (error) {
    console.error("Local DB: Erro ao salvar admins no arquivo:", error);
  }
}

// Initialize fallback files
if (!fs.existsSync(PRODUCTS_FILE)) {
  writeLocalProducts(INITIAL_PRODUCTS);
}
if (!fs.existsSync(CUSTOMERS_FILE)) {
  writeLocalCustomers(readLocalCustomers());
}
if (!fs.existsSync(ADMINS_FILE)) {
  writeLocalAdmins(readLocalAdmins());
}

// ==========================================
// UNIFIED DB EXPORTS
// ==========================================

export async function getProducts(): Promise<Product[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase.from("products").select("*");
      if (error) throw error;
      if (data && data.length > 0) {
        return data.map(mapProductFromDb);
      }
    } catch (err) {
      console.error("Supabase Error (getProducts):", err);
    }
  }
  return readLocalProducts();
}

export async function addProduct(prod: Product): Promise<Product> {
  if (supabase) {
    try {
      const { data, error } = await supabase.from("products").insert([mapProductToDb(prod)]).select();
      if (error) throw error;
      if (data && data[0]) {
        return mapProductFromDb(data[0]);
      }
    } catch (err) {
      console.error("Supabase Error (addProduct):", err);
    }
  }
  const products = readLocalProducts();
  products.unshift(prod);
  writeLocalProducts(products);
  return prod;
}

export async function updateProduct(id: string, updatedFields: Partial<Product>): Promise<Product> {
  if (supabase) {
    try {
      const dbFields = mapProductToDbPartial(updatedFields);
      const { data, error } = await supabase.from("products").update(dbFields).eq("id", id).select();
      if (error) throw error;
      if (data && data[0]) {
        return mapProductFromDb(data[0]);
      }
    } catch (err) {
      console.error("Supabase Error (updateProduct):", err);
    }
  }
  const products = readLocalProducts();
  const index = products.findIndex(p => p.id === id);
  if (index !== -1) {
    products[index] = { ...products[index], ...updatedFields };
    writeLocalProducts(products);
    return products[index];
  }
  throw new Error("Produto não encontrado.");
}

export async function deleteProduct(id: string): Promise<boolean> {
  if (supabase) {
    try {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error("Supabase Error (deleteProduct):", err);
    }
  }
  const products = readLocalProducts();
  const filtered = products.filter(p => p.id !== id);
  if (filtered.length === products.length) return false;
  writeLocalProducts(filtered);
  return true;
}

export async function getOrders(): Promise<Order[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase.from("orders").select("*");
      if (error) throw error;
      if (data) {
        return data.map(mapOrderFromDb);
      }
    } catch (err) {
      console.error("Supabase Error (getOrders):", err);
    }
  }
  return readLocalOrders();
}

export async function addOrder(order: Order): Promise<Order> {
  if (supabase) {
    try {
      const { data, error } = await supabase.from("orders").insert([mapOrderToDb(order)]).select();
      if (error) throw error;
      if (data && data[0]) {
        return mapOrderFromDb(data[0]);
      }
    } catch (err) {
      console.error("Supabase Error (addOrder):", err);
    }
  }
  const orders = readLocalOrders();
  orders.unshift(order);
  writeLocalOrders(orders);
  return order;
}

export async function updateOrderStatus(id: string, status: string, statusHistory: any[]): Promise<Order> {
  if (supabase) {
    try {
      const { data, error } = await supabase.from("orders").update({
        status,
        status_history: statusHistory
      }).eq("id", id).select();
      if (error) throw error;
      if (data && data[0]) {
        return mapOrderFromDb(data[0]);
      }
    } catch (err) {
      console.error("Supabase Error (updateOrderStatus):", err);
    }
  }
  const orders = readLocalOrders();
  const index = orders.findIndex(o => o.id === id);
  if (index !== -1) {
    orders[index].status = status as any;
    orders[index].statusHistory = statusHistory;
    writeLocalOrders(orders);
    return orders[index];
  }
  throw new Error("Pedido não encontrado.");
}

export async function updateOrderPix(id: string, pixReceipt: string, pixConfirmed: boolean, statusHistory: any[]): Promise<Order> {
  if (supabase) {
    try {
      const { data, error } = await supabase.from("orders").update({
        pix_receipt: pixReceipt,
        pix_confirmed: pixConfirmed,
        status_history: statusHistory,
        status: pixConfirmed ? "Preparando" : "Pendente"
      }).eq("id", id).select();
      if (error) throw error;
      if (data && data[0]) {
        return mapOrderFromDb(data[0]);
      }
    } catch (err) {
      console.error("Supabase Error (updateOrderPix):", err);
    }
  }
  const orders = readLocalOrders();
  const index = orders.findIndex(o => o.id === id);
  if (index !== -1) {
    orders[index].pixReceipt = pixReceipt;
    orders[index].pixConfirmed = pixConfirmed;
    orders[index].statusHistory = statusHistory;
    if (pixConfirmed) {
      orders[index].status = "Preparando";
    }
    writeLocalOrders(orders);
    return orders[index];
  }
  throw new Error("Pedido não encontrado.");
}

export async function getCustomerByEmail(email: string): Promise<any | null> {
  const searchEmail = email.toLowerCase().trim();
  if (supabase) {
    try {
      const { data, error } = await supabase.from("customers").select("*").ilike("email", searchEmail);
      if (error) throw error;
      if (data && data[0]) {
        return mapCustomerFromDb(data[0]);
      }
      return null;
    } catch (err) {
      console.error("Supabase Error (getCustomerByEmail):", err);
    }
  }
  const list = readLocalCustomers();
  const customer = list.find(c => c.email.toLowerCase().trim() === searchEmail);
  return customer || null;
}

export async function getCustomers(): Promise<any[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase.from("customers").select("*");
      if (error) throw error;
      if (data) {
        return data.map(mapCustomerFromDb);
      }
    } catch (err) {
      console.error("Supabase Error (getCustomers):", err);
    }
  }
  return readLocalCustomers();
}

export async function addCustomer(customer: any): Promise<any> {
  customer.email = customer.email.toLowerCase().trim();
  if (customer.password && !customer.password.match(/^[a-f0-9]{64}$/i)) {
    customer.password = hashPassword(customer.password);
  }
  if (supabase) {
    try {
      const { data, error } = await supabase.from("customers").insert([mapCustomerToDb(customer)]).select();
      if (error) throw error;
      if (data && data[0]) {
        return mapCustomerFromDb(data[0]);
      }
    } catch (err) {
      console.error("Supabase Error (addCustomer):", err);
    }
  }
  const list = readLocalCustomers();
  if (list.some(c => c.email === customer.email)) {
    throw new Error("E-mail já cadastrado.");
  }
  list.push(customer);
  writeLocalCustomers(list);
  return customer;
}

export async function updateCustomer(id: string, fields: any): Promise<any> {
  if (fields.email) fields.email = fields.email.toLowerCase().trim();
  if (fields.password && !fields.password.match(/^[a-f0-9]{64}$/i)) {
    fields.password = hashPassword(fields.password);
  }
  if (supabase) {
    try {
      const dbFields = mapCustomerToDbPartial(fields);
      const { data, error } = await supabase.from("customers").update(dbFields).eq("id", id).select();
      if (error) throw error;
      if (data && data[0]) {
        return mapCustomerFromDb(data[0]);
      }
    } catch (err) {
      console.error("Supabase Error (updateCustomer):", err);
    }
  }
  const list = readLocalCustomers();
  const index = list.findIndex(c => c.id === id);
  if (index === -1) throw new Error("Cliente não encontrado.");
  list[index] = { ...list[index], ...fields };
  writeLocalCustomers(list);
  return list[index];
}

export async function getAdminByEmail(email: string): Promise<any | null> {
  const searchEmail = email.toLowerCase().trim();
  if (supabase) {
    try {
      const { data, error } = await supabase.from("admins").select("*").ilike("email", searchEmail);
      if (error) throw error;
      if (data && data[0]) {
        return data[0];
      }
      return null;
    } catch (err) {
      console.error("Supabase Error (getAdminByEmail):", err);
    }
  }
  const list = readLocalAdmins();
  const admin = list.find(a => a.email.toLowerCase().trim() === searchEmail);
  return admin || null;
}

export async function getAdmins(): Promise<any[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase.from("admins").select("*");
      if (error) throw error;
      if (data) return data;
    } catch (err) {
      console.error("Supabase Error (getAdmins):", err);
    }
  }
  return readLocalAdmins();
}

export async function addAdmin(admin: any): Promise<any> {
  admin.email = admin.email.toLowerCase().trim();
  if (admin.password && !admin.password.match(/^[a-f0-9]{64}$/i)) {
    admin.password = hashPassword(admin.password);
  }
  if (supabase) {
    try {
      const { data, error } = await supabase.from("admins").insert([admin]).select();
      if (error) throw error;
      if (data && data[0]) return data[0];
    } catch (err) {
      console.error("Supabase Error (addAdmin):", err);
    }
  }
  const list = readLocalAdmins();
  if (list.some(a => a.email === admin.email)) {
    throw new Error("E-mail de administrador já cadastrado.");
  }
  list.push(admin);
  writeLocalAdmins(list);
  return admin;
}
