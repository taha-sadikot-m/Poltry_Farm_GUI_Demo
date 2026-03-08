export interface User {
  id: number;
  username: string;
  role: string;
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  min_stock: number;
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface Invoice {
  id: number;
  customer_id: number;
  customer_name: string;
  date: string;
  total: number;
  status: string;
}

export interface InvoiceItem {
  id: number;
  invoice_id: number;
  product_id: number;
  product_name: string;
  sku: string;
  quantity: number;
  price: number;
}
