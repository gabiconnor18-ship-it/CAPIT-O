import fs from "fs";
import path from "path";
import crypto from "crypto";
import { INITIAL_PRODUCTS } from "./types";
import type { Product, Order } from "./types";

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
      const data = fs.readFileSync(PRODUCTS_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Local DB: Erro ao ler produtos do arquivo:", error);
  }
  return INITIAL_PRODUCTS;
}

function writeLocalProducts(products: Product[]) {
  try {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), "utf-8");
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
      const data = fs.readFileSync(ORDERS_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Local DB: Erro ao ler pedidos do arquivo:", error);
  }
  return [];
}

function writeLocalOrders(orders: Order[]) {
  try {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), "utf-8");
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
      const data = fs.readFileSync(CUSTOMERS_FILE, "utf-8");
      return JSON.parse(data);
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
    fs.writeFileSync(CUSTOMERS_FILE, JSON.stringify(customers, null, 2), "utf-8");
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
      const data = fs.readFileSync(ADMINS_FILE, "utf-8");
      return JSON.parse(data);
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
    fs.writeFileSync(ADMINS_FILE, JSON.stringify(admins, null, 2), "utf-8");
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
  return readLocalProducts();
}

export async function addProduct(prod: Product): Promise<Product> {
  const products = readLocalProducts();
  products.unshift(prod);
  writeLocalProducts(products);
  return prod;
}

export async function updateProduct(id: string, updatedFields: Partial<Product>): Promise<Product> {
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
  const products = readLocalProducts();
  const filtered = products.filter(p => p.id !== id);
  if (filtered.length === products.length) return false;
  writeLocalProducts(filtered);
  return true;
}

export async function getOrders(): Promise<Order[]> {
  return readLocalOrders();
}

export async function addOrder(order: Order): Promise<Order> {
  const orders = readLocalOrders();
  orders.unshift(order);
  writeLocalOrders(orders);
  return order;
}

export async function updateOrderStatus(id: string, status: string, statusHistory: any[]): Promise<Order> {
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

export async function getCustomerByEmail(email: string): Promise<any | null> {
  const searchEmail = email.toLowerCase().trim();
  const list = readLocalCustomers();
  const customer = list.find(c => c.email.toLowerCase().trim() === searchEmail);
  return customer || null;
}

export async function getCustomers(): Promise<any[]> {
  return readLocalCustomers();
}

export async function addCustomer(customer: any): Promise<any> {
  customer.email = customer.email.toLowerCase().trim();
  if (customer.password && !customer.password.match(/^[a-f0-9]{64}$/i)) {
    customer.password = hashPassword(customer.password);
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
  const list = readLocalCustomers();
  const index = list.findIndex(c => c.id === id);
  if (index === -1) throw new Error("Cliente não encontrado.");
  list[index] = { ...list[index], ...fields };
  writeLocalCustomers(list);
  return list[index];
}

export async function getAdminByEmail(email: string): Promise<any | null> {
  const searchEmail = email.toLowerCase().trim();
  const list = readLocalAdmins();
  const admin = list.find(a => a.email.toLowerCase().trim() === searchEmail);
  return admin || null;
}

export async function getAdmins(): Promise<any[]> {
  return readLocalAdmins();
}

export async function addAdmin(admin: any): Promise<any> {
  admin.email = admin.email.toLowerCase().trim();
  if (admin.password && !admin.password.match(/^[a-f0-9]{64}$/i)) {
    admin.password = hashPassword(admin.password);
  }
  const list = readLocalAdmins();
  if (list.some(a => a.email === admin.email)) {
    throw new Error("E-mail de administrador já cadastrado.");
  }
  list.push(admin);
  writeLocalAdmins(list);
  return admin;
}
