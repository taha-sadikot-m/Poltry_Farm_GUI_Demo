import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Product } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Search, Edit2, Trash2, X, Bird, Filter } from 'lucide-react';

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    name: '', sku: '', category: '', price: 0, cost: 0, stock: 0, min_stock: 0
  });

  const fetchProducts = () => {
    setLoading(true);
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name, sku: product.sku, category: product.category,
        price: product.price, cost: product.cost, stock: product.stock, min_stock: product.min_stock
      });
    } else {
      setEditingProduct(null);
      setFormData({ name: '', sku: '', category: '', price: 0, cost: 0, stock: 0, min_stock: 0 });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
    const method = editingProduct ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsModalOpen(false);
        fetchProducts();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to save product');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
      fetchProducts();
    }
  };

  const filteredProducts = products?.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Farm Products</h1>
          <p className="mt-1 text-sm text-zinc-500">Manage your livestock, eggs, feed, and other inventory.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center justify-center px-4 py-2.5 border border-transparent rounded-xl shadow-sm shadow-amber-600/20 text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all active:scale-95"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-zinc-200/60 flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-zinc-400" />
          </div>
          <input
            type="text"
            placeholder="Search by name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-10 pr-3 py-2.5 border border-zinc-200 rounded-xl leading-5 bg-zinc-50/50 placeholder-zinc-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 sm:text-sm transition-all"
          />
        </div>
        <button className="inline-flex items-center px-4 py-2.5 border border-zinc-200 rounded-xl text-sm font-medium text-zinc-700 bg-white hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors w-full sm:w-auto">
          <Filter className="h-4 w-4 mr-2 text-zinc-400" />
          Filters
        </button>
      </div>

      {/* Data Table / Mobile List */}
      <div className="bg-white shadow-sm rounded-2xl border border-zinc-200/60 overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-200">
            <thead className="bg-zinc-50/80">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Product</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Category</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Price / Cost</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Stock</th>
                <th scope="col" className="relative px-6 py-4"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-zinc-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-zinc-400">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mb-4"></div>
                      <p className="text-sm">Loading products...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredProducts?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-zinc-400">
                      <Bird className="h-12 w-12 mb-4 opacity-20" />
                      <p className="text-sm font-medium text-zinc-900">No products found</p>
                      <p className="text-xs mt-1">Try adjusting your search or add a new product.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts?.map((product) => (
                  <tr key={product.id} className="hover:bg-zinc-50/80 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 rounded-xl bg-zinc-100 flex items-center justify-center border border-zinc-200/60">
                          <Bird className="h-5 w-5 text-zinc-500" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-zinc-900 group-hover:text-amber-600 transition-colors">{product.name}</div>
                          <div className="text-xs text-zinc-500 font-mono mt-0.5">SKU: {product.sku}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 inline-flex text-xs font-medium rounded-md bg-zinc-100 text-zinc-700 border border-zinc-200/60">
                        {product.category || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-zinc-900 font-bold">${product.price.toFixed(2)}</div>
                      <div className="text-xs text-zinc-500 mt-0.5">Cost: ${product.cost.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border ${product.stock <= product.min_stock ? 'bg-red-50 text-red-700 border-red-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
                          {product.stock}
                        </span>
                        <span className="text-xs text-zinc-400 ml-2">/ {product.min_stock} min</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleOpenModal(product)} className="p-2 text-zinc-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors">
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(product.id)} className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile List View */}
        <div className="md:hidden divide-y divide-zinc-100">
          {loading ? (
            <div className="px-6 py-12 text-center">
              <div className="flex flex-col items-center justify-center text-zinc-400">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mb-4"></div>
                <p className="text-sm">Loading products...</p>
              </div>
            </div>
          ) : filteredProducts?.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="flex flex-col items-center justify-center text-zinc-400">
                <Bird className="h-12 w-12 mb-4 opacity-20" />
                <p className="text-sm font-medium text-zinc-900">No products found</p>
                <p className="text-xs mt-1">Try adjusting your search or add a new product.</p>
              </div>
            </div>
          ) : (
            filteredProducts?.map((product) => (
              <div key={product.id} className="p-4 hover:bg-zinc-50/80 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 flex-shrink-0 rounded-xl bg-zinc-100 flex items-center justify-center border border-zinc-200/60">
                      <Bird className="h-5 w-5 text-zinc-500" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-zinc-900">{product.name}</div>
                      <div className="text-xs text-zinc-500 font-mono mt-0.5">SKU: {product.sku}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleOpenModal(product)} className="p-1.5 text-zinc-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors">
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(product.id)} className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <div className="bg-zinc-50 rounded-lg p-2 border border-zinc-100">
                    <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold mb-1">Price</div>
                    <div className="text-sm font-bold text-zinc-900">${product.price.toFixed(2)}</div>
                  </div>
                  <div className="bg-zinc-50 rounded-lg p-2 border border-zinc-100">
                    <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold mb-1">Stock</div>
                    <div className="flex items-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold border ${product.stock <= product.min_stock ? 'bg-red-50 text-red-700 border-red-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
                        {product.stock}
                      </span>
                      <span className="text-[10px] text-zinc-400 ml-1.5">/ {product.min_stock} min</span>
                    </div>
                  </div>
                </div>
                
                {product.category && (
                  <div className="mt-3">
                    <span className="px-2 py-1 inline-flex text-[10px] font-medium rounded bg-zinc-100 text-zinc-600 border border-zinc-200/60">
                      {product.category}
                    </span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isModalOpen && (
            <motion.div className="fixed z-[100] inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
              <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-zinc-900/80 backdrop-blur-sm transition-opacity" 
                  aria-hidden="true" 
                  onClick={() => setIsModalOpen(false)}
                />
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-zinc-200/60 relative z-10"
                >
                <div className="bg-white px-6 pt-6 pb-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-zinc-900 tracking-tight" id="modal-title">
                      {editingProduct ? 'Edit Product' : 'Add New Product'}
                    </h3>
                    <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 p-2 rounded-lg transition-colors">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Name</label>
                      <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="block w-full border border-zinc-200 rounded-xl shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 sm:text-sm transition-all bg-zinc-50/50 focus:bg-white" />
                    </div>
                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-semibold text-zinc-700 mb-1.5">SKU</label>
                        <input type="text" required value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} className="block w-full border border-zinc-200 rounded-xl shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 sm:text-sm transition-all bg-zinc-50/50 focus:bg-white font-mono" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Category</label>
                        <input type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="block w-full border border-zinc-200 rounded-xl shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 sm:text-sm transition-all bg-zinc-50/50 focus:bg-white" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Price ($)</label>
                        <input type="number" step="0.01" required value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} className="block w-full border border-zinc-200 rounded-xl shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 sm:text-sm transition-all bg-zinc-50/50 focus:bg-white font-mono" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Cost ($)</label>
                        <input type="number" step="0.01" required value={formData.cost} onChange={e => setFormData({...formData, cost: parseFloat(e.target.value)})} className="block w-full border border-zinc-200 rounded-xl shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 sm:text-sm transition-all bg-zinc-50/50 focus:bg-white font-mono" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Current Stock</label>
                        <input type="number" required value={formData.stock} onChange={e => setFormData({...formData, stock: parseInt(e.target.value)})} className="block w-full border border-zinc-200 rounded-xl shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 sm:text-sm transition-all bg-zinc-50/50 focus:bg-white font-mono" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Min Stock Alert</label>
                        <input type="number" required value={formData.min_stock} onChange={e => setFormData({...formData, min_stock: parseInt(e.target.value)})} className="block w-full border border-zinc-200 rounded-xl shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 sm:text-sm transition-all bg-zinc-50/50 focus:bg-white font-mono" />
                      </div>
                    </div>
                    <div className="mt-8 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-zinc-100">
                      <button type="button" onClick={() => setIsModalOpen(false)} className="w-full sm:w-auto inline-flex justify-center items-center rounded-xl border border-zinc-200 px-5 py-2.5 bg-white text-sm font-semibold text-zinc-700 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors">
                        Cancel
                      </button>
                      <button type="submit" className="w-full sm:w-auto inline-flex justify-center items-center rounded-xl border border-transparent px-5 py-2.5 bg-amber-500 text-sm font-semibold text-white hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 shadow-sm shadow-amber-600/20 transition-all active:scale-95">
                        {editingProduct ? 'Save Changes' : 'Add Product'}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body
    )}
    </div>
  );
}
