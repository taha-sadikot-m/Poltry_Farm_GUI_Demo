import { Product, Customer, Invoice, InvoiceItem } from './types';

// Initial demo data
const DEMO_PRODUCTS: Product[] = [
  { id: 1, name: 'Large Brown Eggs (Tray of 30)', sku: 'EGG-L-30', category: 'Eggs', price: 5.99, cost: 3.00, stock: 150, min_stock: 30 },
  { id: 2, name: 'Whole Chicken (Broiler)', sku: 'CHK-WHL-01', category: 'Meat', price: 8.50, cost: 4.50, stock: 80, min_stock: 20 },
  { id: 3, name: 'Day-Old Chicks (Box of 50)', sku: 'CHK-DOC-50', category: 'Livestock', price: 45.00, cost: 25.00, stock: 12, min_stock: 5 },
  { id: 4, name: 'Broiler Feed (50kg Bag)', sku: 'FED-BRL-50', category: 'Feed', price: 22.00, cost: 15.00, stock: 40, min_stock: 10 },
  { id: 5, name: 'Chicken Breast (1kg)', sku: 'CHK-BRS-01', category: 'Meat', price: 6.99, cost: 3.50, stock: 60, min_stock: 15 },
  { id: 6, name: 'Organic Fertilizer (Manure 20kg)', sku: 'MNR-ORG-20', category: 'Byproducts', price: 12.00, cost: 2.00, stock: 100, min_stock: 20 },
  { id: 7, name: 'Quail Eggs (Tray of 24)', sku: 'EGG-Q-24', category: 'Eggs', price: 4.50, cost: 2.00, stock: 0, min_stock: 10 },
  { id: 8, name: 'Layer Feed (50kg Bag)', sku: 'FED-LYR-50', category: 'Feed', price: 24.00, cost: 16.00, stock: 25, min_stock: 10 },
];

const DEMO_CUSTOMERS: Customer[] = [
  { id: 1, name: 'Fresh Market Groceries', email: 'orders@freshmarket.com', phone: '555-0100', address: '123 Market St, Food City' },
  { id: 2, name: 'Sunrise Breakfast Diner', email: 'kitchen@sunrisediner.com', phone: '555-0101', address: '456 Morning Ave, Downtown' },
  { id: 3, name: 'Local Farmers Co-op', email: 'supply@farmerscoop.org', phone: '555-0102', address: '789 Agriculture Blvd, Rural County' },
  { id: 4, name: 'John\'s Organic Farm', email: 'john@organicfarm.com', phone: '555-0103', address: '100 Green Way, Countryside' },
];

const DEMO_INVOICES: Invoice[] = [
  { id: 1, customer_id: 1, customer_name: 'Fresh Market Groceries', date: new Date(Date.now() - 86400000 * 2).toISOString(), total: 179.70, status: 'paid' },
  { id: 2, customer_id: 2, customer_name: 'Sunrise Breakfast Diner', date: new Date(Date.now() - 86400000 * 1).toISOString(), total: 59.90, status: 'paid' },
  { id: 3, customer_id: 3, customer_name: 'Local Farmers Co-op', date: new Date(Date.now() - 3600000 * 5).toISOString(), total: 220.00, status: 'paid' },
];

const DEMO_INVOICE_ITEMS: InvoiceItem[] = [
  { id: 1, invoice_id: 1, product_id: 1, product_name: 'Large Brown Eggs (Tray of 30)', sku: 'EGG-L-30', quantity: 30, price: 5.99 },
  { id: 2, invoice_id: 2, product_id: 1, product_name: 'Large Brown Eggs (Tray of 30)', sku: 'EGG-L-30', quantity: 10, price: 5.99 },
  { id: 3, invoice_id: 3, product_id: 4, product_name: 'Broiler Feed (50kg Bag)', sku: 'FED-BRL-50', quantity: 10, price: 22.00 },
];

// Initialize local storage if empty
if (!localStorage.getItem('poultry_products')) {
  localStorage.setItem('poultry_products', JSON.stringify(DEMO_PRODUCTS));
  localStorage.setItem('poultry_customers', JSON.stringify(DEMO_CUSTOMERS));
  localStorage.setItem('poultry_invoices', JSON.stringify(DEMO_INVOICES));
  localStorage.setItem('poultry_invoice_items', JSON.stringify(DEMO_INVOICE_ITEMS));
}

// Helper functions to get/set data
const getData = (key: string) => JSON.parse(localStorage.getItem(key) || '[]');
const setData = (key: string, data: any) => localStorage.setItem(key, JSON.stringify(data));

// Override fetch
const originalFetch = window.fetch;

Object.defineProperty(window, 'fetch', {
  configurable: true,
  writable: true,
  value: async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input.toString();
    
    if (!url.startsWith('/api/')) {
      return originalFetch(input, init);
    }

  const method = init?.method || 'GET';
  const body = init?.body ? JSON.parse(init.body as string) : null;

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));

  const createResponse = (data: any, status = 200) => {
    return new Response(JSON.stringify(data), {
      status,
      headers: { 'Content-Type': 'application/json' }
    });
  };

  try {
    // Auth
    if (url === '/api/auth/login' && method === 'POST') {
      if (body.username === 'admin' && body.password === 'admin123') {
        const user = { id: 1, username: 'admin', role: 'admin' };
        localStorage.setItem('poultry_token', 'mock-token');
        return createResponse({ message: 'Logged in', user });
      }
      return createResponse({ error: 'Invalid credentials' }, 401);
    }

    if (url === '/api/auth/logout' && method === 'POST') {
      localStorage.removeItem('poultry_token');
      return createResponse({ message: 'Logged out' });
    }

    if (url === '/api/auth/me' && method === 'GET') {
      if (localStorage.getItem('poultry_token')) {
        return createResponse({ user: { id: 1, username: 'admin', role: 'admin' } });
      }
      return createResponse({ error: 'Unauthorized' }, 401);
    }

    // Dashboard
    if (url === '/api/dashboard' && method === 'GET') {
      const products = getData('poultry_products');
      const customers = getData('poultry_customers');
      const invoices = getData('poultry_invoices');
      
      const revenue = invoices.filter((i: any) => i.status === 'paid').reduce((sum: number, i: any) => sum + i.total, 0);
      const lowStock = products.filter((p: any) => p.stock <= p.min_stock).slice(0, 5);
      const recentInvoices = [...invoices].reverse().slice(0, 5);

      return createResponse({
        stats: {
          products: products.length,
          customers: customers.length,
          invoices: invoices.length,
          revenue
        },
        lowStock,
        recentInvoices
      });
    }

    // Products
    if (url === '/api/products' && method === 'GET') {
      return createResponse(getData('poultry_products'));
    }

    if (url === '/api/products' && method === 'POST') {
      const products = getData('poultry_products');
      const newProduct = { ...body, id: Date.now() };
      setData('poultry_products', [...products, newProduct]);
      return createResponse(newProduct);
    }

    if (url.match(/^\/api\/products\/\d+$/)) {
      const id = parseInt(url.split('/').pop()!);
      const products = getData('poultry_products');
      
      if (method === 'PUT') {
        const index = products.findIndex((p: any) => p.id === id);
        if (index > -1) {
          products[index] = { ...body, id };
          setData('poultry_products', products);
          return createResponse(products[index]);
        }
      }
      
      if (method === 'DELETE') {
        setData('poultry_products', products.filter((p: any) => p.id !== id));
        return createResponse({ success: true });
      }
    }

    // Customers
    if (url === '/api/customers' && method === 'GET') {
      return createResponse(getData('poultry_customers'));
    }

    if (url === '/api/customers' && method === 'POST') {
      const customers = getData('poultry_customers');
      const newCustomer = { ...body, id: Date.now() };
      setData('poultry_customers', [...customers, newCustomer]);
      return createResponse(newCustomer);
    }

    if (url.match(/^\/api\/customers\/\d+$/)) {
      const id = parseInt(url.split('/').pop()!);
      const customers = getData('poultry_customers');
      
      if (method === 'PUT') {
        const index = customers.findIndex((c: any) => c.id === id);
        if (index > -1) {
          customers[index] = { ...body, id };
          setData('poultry_customers', customers);
          return createResponse(customers[index]);
        }
      }
      
      if (method === 'DELETE') {
        setData('poultry_customers', customers.filter((c: any) => c.id !== id));
        return createResponse({ success: true });
      }
    }

    // Invoices
    if (url === '/api/invoices' && method === 'GET') {
      const invoices = getData('poultry_invoices');
      return createResponse([...invoices].reverse());
    }

    if (url === '/api/invoices' && method === 'POST') {
      const { customer_id, items, status } = body;
      const invoices = getData('poultry_invoices');
      const invoiceItems = getData('poultry_invoice_items');
      const products = getData('poultry_products');
      const customers = getData('poultry_customers');
      
      const customer = customers.find((c: any) => c.id === customer_id);
      let total = 0;
      
      // Check stock and calculate total
      for (const item of items) {
        total += item.quantity * item.price;
        const product = products.find((p: any) => p.id === item.product_id);
        if (product && product.stock < item.quantity) {
          return createResponse({ error: `Insufficient stock for product ID ${item.product_id}` }, 400);
        }
      }
      
      const invoiceId = Date.now();
      const newInvoice = {
        id: invoiceId,
        customer_id,
        customer_name: customer ? customer.name : null,
        date: new Date().toISOString(),
        total,
        status: status || 'paid'
      };
      
      const newItems = items.map((item: any, index: number) => {
        const product = products.find((p: any) => p.id === item.product_id);
        return {
          id: Date.now() + index,
          invoice_id: invoiceId,
          product_id: item.product_id,
          product_name: product?.name,
          sku: product?.sku,
          quantity: item.quantity,
          price: item.price
        };
      });
      
      // Update stock
      const updatedProducts = products.map((p: any) => {
        const item = items.find((i: any) => i.product_id === p.id);
        if (item) {
          return { ...p, stock: p.stock - item.quantity };
        }
        return p;
      });
      
      setData('poultry_invoices', [...invoices, newInvoice]);
      setData('poultry_invoice_items', [...invoiceItems, ...newItems]);
      setData('poultry_products', updatedProducts);
      
      return createResponse({ id: invoiceId, success: true });
    }

    if (url.match(/^\/api\/invoices\/\d+$/) && method === 'GET') {
      const id = parseInt(url.split('/').pop()!);
      const invoices = getData('poultry_invoices');
      const invoiceItems = getData('poultry_invoice_items');
      const customers = getData('poultry_customers');
      
      const invoice = invoices.find((i: any) => i.id === id);
      if (!invoice) return createResponse({ error: 'Invoice not found' }, 404);
      
      const customer = customers.find((c: any) => c.id === invoice.customer_id);
      const items = invoiceItems.filter((i: any) => i.invoice_id === id);
      
      return createResponse({
        ...invoice,
        email: customer?.email,
        phone: customer?.phone,
        address: customer?.address,
        items
      });
    }

  } catch (error: any) {
    return createResponse({ error: error.message }, 500);
  }

  return createResponse({ error: 'Not found' }, 404);
  }
});
