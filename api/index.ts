import express from 'express';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join('/tmp', 'database.sqlite');
const db = new Database(dbPath);

// Initialize DB schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT DEFAULT 'user'
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    sku TEXT UNIQUE,
    category TEXT,
    price REAL,
    cost REAL,
    stock INTEGER,
    min_stock INTEGER
  );

  CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT,
    phone TEXT,
    address TEXT
  );

  CREATE TABLE IF NOT EXISTS invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER,
    date TEXT,
    total REAL,
    status TEXT,
    FOREIGN KEY(customer_id) REFERENCES customers(id)
  );

  CREATE TABLE IF NOT EXISTS invoice_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_id INTEGER,
    product_id INTEGER,
    quantity INTEGER,
    price REAL,
    FOREIGN KEY(invoice_id) REFERENCES invoices(id),
    FOREIGN KEY(product_id) REFERENCES products(id)
  );
`);

// Create default admin if not exists
const adminExists = db.prepare('SELECT * FROM users WHERE username = ?').get('admin');
if (!adminExists) {
  const hash = bcrypt.hashSync('admin123', 10);
  db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)').run('admin', hash, 'admin');
}

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

const app = express();

app.use(express.json());
app.use(cookieParser());

// Auth Middleware
const authenticate = (req: any, res: any, next: any) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// --- API Routes ---

// Auth
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as any;
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
  res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });
  res.json({ message: 'Logged in', user: { id: user.id, username: user.username, role: user.role } });
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
});

app.get('/api/auth/me', authenticate, (req: any, res) => {
  res.json({ user: req.user });
});

// Dashboard Stats
app.get('/api/dashboard', authenticate, (req, res) => {
  const totalProducts = db.prepare('SELECT COUNT(*) as count FROM products').get() as any;
  const totalCustomers = db.prepare('SELECT COUNT(*) as count FROM customers').get() as any;
  const totalInvoices = db.prepare('SELECT COUNT(*) as count FROM invoices').get() as any;
  const totalRevenue = db.prepare('SELECT SUM(total) as total FROM invoices WHERE status = "paid"').get() as any;
  const lowStock = db.prepare('SELECT * FROM products WHERE stock <= min_stock LIMIT 5').all();
  const recentInvoices = db.prepare(`
    SELECT invoices.*, customers.name as customer_name 
    FROM invoices 
    LEFT JOIN customers ON invoices.customer_id = customers.id 
    ORDER BY invoices.id DESC LIMIT 5
  `).all();

  res.json({
    stats: {
      products: totalProducts.count,
      customers: totalCustomers.count,
      invoices: totalInvoices.count,
      revenue: totalRevenue.total || 0
    },
    lowStock,
    recentInvoices
  });
});

// Products
app.get('/api/products', authenticate, (req, res) => {
  const products = db.prepare('SELECT * FROM products').all();
  res.json(products);
});

app.post('/api/products', authenticate, (req, res) => {
  const { name, sku, category, price, cost, stock, min_stock } = req.body;
  try {
    const info = db.prepare('INSERT INTO products (name, sku, category, price, cost, stock, min_stock) VALUES (?, ?, ?, ?, ?, ?, ?)').run(name, sku, category, price, cost, stock, min_stock);
    res.json({ id: info.lastInsertRowid, ...req.body });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/products/:id', authenticate, (req, res) => {
  const { name, sku, category, price, cost, stock, min_stock } = req.body;
  try {
    db.prepare('UPDATE products SET name = ?, sku = ?, category = ?, price = ?, cost = ?, stock = ?, min_stock = ? WHERE id = ?').run(name, sku, category, price, cost, stock, min_stock, req.params.id);
    res.json({ id: req.params.id, ...req.body });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/products/:id', authenticate, (req, res) => {
  db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// Customers
app.get('/api/customers', authenticate, (req, res) => {
  const customers = db.prepare('SELECT * FROM customers').all();
  res.json(customers);
});

app.post('/api/customers', authenticate, (req, res) => {
  const { name, email, phone, address } = req.body;
  const info = db.prepare('INSERT INTO customers (name, email, phone, address) VALUES (?, ?, ?, ?)').run(name, email, phone, address);
  res.json({ id: info.lastInsertRowid, ...req.body });
});

app.put('/api/customers/:id', authenticate, (req, res) => {
  const { name, email, phone, address } = req.body;
  db.prepare('UPDATE customers SET name = ?, email = ?, phone = ?, address = ? WHERE id = ?').run(name, email, phone, address, req.params.id);
  res.json({ id: req.params.id, ...req.body });
});

app.delete('/api/customers/:id', authenticate, (req, res) => {
  db.prepare('DELETE FROM customers WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// Invoices (Billing)
app.get('/api/invoices', authenticate, (req, res) => {
  const invoices = db.prepare(`
    SELECT invoices.*, customers.name as customer_name 
    FROM invoices 
    LEFT JOIN customers ON invoices.customer_id = customers.id
    ORDER BY invoices.id DESC
  `).all();
  res.json(invoices);
});

app.get('/api/invoices/:id', authenticate, (req, res) => {
  const invoice = db.prepare(`
    SELECT invoices.*, customers.name as customer_name, customers.email, customers.phone, customers.address
    FROM invoices 
    LEFT JOIN customers ON invoices.customer_id = customers.id
    WHERE invoices.id = ?
  `).get(req.params.id) as any;
  
  if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
  
  const items = db.prepare(`
    SELECT invoice_items.*, products.name as product_name, products.sku
    FROM invoice_items
    LEFT JOIN products ON invoice_items.product_id = products.id
    WHERE invoice_id = ?
  `).all(req.params.id);
  
  res.json({ ...invoice, items });
});

app.post('/api/invoices', authenticate, (req, res) => {
  const { customer_id, items, status } = req.body; // items: [{product_id, quantity, price}]
  
  const date = new Date().toISOString();
  let total = 0;
  
  const transaction = db.transaction(() => {
    // Calculate total and check stock
    for (const item of items) {
      total += item.quantity * item.price;
      const product = db.prepare('SELECT stock FROM products WHERE id = ?').get(item.product_id) as any;
      if (product && product.stock < item.quantity) {
        throw new Error(`Insufficient stock for product ID ${item.product_id}`);
      }
    }
    
    const info = db.prepare('INSERT INTO invoices (customer_id, date, total, status) VALUES (?, ?, ?, ?)').run(customer_id, date, total, status || 'paid');
    const invoiceId = info.lastInsertRowid;
    
    for (const item of items) {
      db.prepare('INSERT INTO invoice_items (invoice_id, product_id, quantity, price) VALUES (?, ?, ?, ?)').run(invoiceId, item.product_id, item.quantity, item.price);
      // Deduct stock
      db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?').run(item.quantity, item.product_id);
    }
    
    return invoiceId;
  });
  
  try {
    const invoiceId = transaction();
    res.json({ id: invoiceId, success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default app;
