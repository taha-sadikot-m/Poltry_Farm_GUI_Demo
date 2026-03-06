import React, { useState, useEffect } from 'react';
import { Product, Customer } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Plus, Minus, Trash2, ShoppingCart, User, Bird } from 'lucide-react';

interface CartItem extends Product {
  cartQuantity: number;
}

export default function Billing() {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<number | ''>('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetch('/api/products').then(res => res.json()).then(data => setProducts(Array.isArray(data) ? data : []));
    fetch('/api/customers').then(res => res.json()).then(data => setCustomers(Array.isArray(data) ? data : []));
  }, []);

  const filteredProducts = products?.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.cartQuantity >= product.stock) {
          alert('Cannot add more than available stock');
          return prev;
        }
        return prev.map(item => 
          item.id === product.id ? { ...item, cartQuantity: item.cartQuantity + 1 } : item
        );
      }
      if (product.stock <= 0) {
        alert('Product is out of stock');
        return prev;
      }
      return [...prev, { ...product, cartQuantity: 1 }];
    });
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.cartQuantity + delta;
        if (newQty > item.stock) {
          alert('Cannot exceed available stock');
          return item;
        }
        return newQty > 0 ? { ...item, cartQuantity: newQty } : item;
      }
      return item;
    }));
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.cartQuantity), 0);

  const handleCheckout = async () => {
    if (cart?.length === 0) return alert('Cart is empty');
    
    setIsProcessing(true);
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: selectedCustomer || null,
          items: cart.map(item => ({
            product_id: item.id,
            quantity: item.cartQuantity,
            price: item.price
          }))
        })
      });

      if (res.ok) {
        const data = await res.json();
        alert(`Invoice created successfully! ID: INV-${data.id.toString().padStart(4, '0')}`);
        setCart([]);
        setSelectedCustomer('');
        // Refresh products to update stock
        fetch('/api/products').then(res => res.json()).then(data => setProducts(Array.isArray(data) ? data : []));
      } else {
        const data = await res.json();
        alert(data.error || 'Checkout failed');
      }
    } catch (err) {
      console.error(err);
      alert('Checkout failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:h-[calc(100vh-8rem)]">
      {/* Products Section */}
      <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-zinc-200/60 overflow-hidden min-h-[400px] lg:min-h-0">
        <div className="p-4 border-b border-zinc-100">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-zinc-400" />
            </div>
            <input
              type="text"
              placeholder="Search products to add..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-zinc-200 rounded-xl leading-5 bg-zinc-50/50 placeholder-zinc-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 sm:text-sm transition-all"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 bg-zinc-50/30">
          {filteredProducts?.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-400">
              <Bird className="h-12 w-12 mb-4 opacity-20" />
              <p className="text-sm font-medium text-zinc-900">No farm products found</p>
              <p className="text-xs mt-1">Try adjusting your search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts?.map(product => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={product.stock > 0 ? { y: -2, scale: 1.02 } : {}}
                  whileTap={product.stock > 0 ? { scale: 0.98 } : {}}
                  key={product.id} 
                  onClick={() => addToCart(product)}
                  className={`relative rounded-2xl border p-4 transition-all ${product.stock > 0 ? 'border-zinc-200 hover:border-amber-300 hover:shadow-lg hover:shadow-amber-500/10 bg-white cursor-pointer' : 'border-zinc-200 bg-zinc-50 opacity-60 cursor-not-allowed'}`}
                >
                  <div className="font-semibold text-zinc-900 truncate">{product.name}</div>
                  <div className="text-xs text-zinc-500 font-mono mt-1">{product.sku}</div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="font-bold text-amber-600 font-mono">${product.price.toFixed(2)}</span>
                    <span className={`text-xs font-bold px-2 py-1 rounded-md ${product.stock > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                      {product.stock > 0 ? `${product.stock} left` : 'Out of stock'}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cart Section */}
      <div className="w-full lg:w-96 flex flex-col bg-white rounded-2xl shadow-sm border border-zinc-200/60 overflow-hidden shrink-0">
        <div className="p-5 border-b border-zinc-100 bg-zinc-50/80 flex items-center justify-between">
          <h2 className="text-lg font-bold text-zinc-900 flex items-center tracking-tight">
            <ShoppingCart className="h-5 w-5 mr-2 text-amber-600" />
            Current Sale
          </h2>
          <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full">
            {cart?.length || 0} items
          </span>
        </div>

        <div className="p-5 border-b border-zinc-100">
          <label className="block text-sm font-semibold text-zinc-700 mb-2">Customer (Optional)</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-4 w-4 text-zinc-400" />
            </div>
            <select
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value ? Number(e.target.value) : '')}
              className="block w-full pl-10 pr-3 py-2.5 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 sm:text-sm bg-zinc-50/50 focus:bg-white transition-all font-medium text-zinc-900"
            >
              <option value="">Walk-in Customer</option>
              {customers?.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 bg-zinc-50/30">
          {cart?.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-400">
              <ShoppingCart className="h-12 w-12 mb-4 opacity-20" />
              <p className="text-sm font-medium text-zinc-900">Cart is empty</p>
              <p className="text-xs mt-1">Add products to start a sale.</p>
            </div>
          ) : (
            <div className="space-y-2 p-2">
              <AnimatePresence>
                {cart?.map(item => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={item.id} 
                    className="flex items-center justify-between bg-white p-3 rounded-xl border border-zinc-100 shadow-sm"
                  >
                    <div className="flex-1 min-w-0 pr-4">
                      <h4 className="text-sm font-semibold text-zinc-900 truncate">{item.name}</h4>
                      <p className="text-xs text-zinc-500 font-mono mt-0.5">${item.price.toFixed(2)} each</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button onClick={() => updateQuantity(item.id, -1)} className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors">
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="text-sm font-bold w-8 text-center font-mono">{item.cartQuantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors">
                        <Plus className="h-4 w-4" />
                      </button>
                      <button onClick={() => removeFromCart(item.id)} className="p-1.5 ml-1 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        <div className="p-5 bg-white border-t border-zinc-100">
          <div className="flex items-center justify-between mb-5">
            <span className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Total Amount</span>
            <span className="text-3xl font-bold text-amber-600 font-mono">${total.toFixed(2)}</span>
          </div>
          <button
            onClick={handleCheckout}
            disabled={cart?.length === 0 || isProcessing}
            className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm shadow-amber-600/20 text-sm font-bold text-white bg-amber-500 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : 'Complete Sale'}
          </button>
        </div>
      </div>
    </div>
  );
}
