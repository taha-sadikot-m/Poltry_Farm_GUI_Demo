import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Invoice, InvoiceItem } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Receipt, Search, Eye, X, Printer, Filter } from 'lucide-react';
import { format } from 'date-fns';

export default function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [search, setSearch] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<(Invoice & { items: InvoiceItem[], email?: string, phone?: string, address?: string }) | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchInvoices = () => {
    setLoading(true);
    fetch('/api/invoices')
      .then(res => res.json())
      .then(data => setInvoices(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleViewInvoice = async (id: number) => {
    try {
      const res = await fetch(`/api/invoices/${id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedInvoice(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredInvoices = invoices?.filter(i => 
    i.id.toString().includes(search) || 
    (i.customer_name && i.customer_name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Invoices</h1>
          <p className="mt-1 text-sm text-zinc-500">View and print past sales records.</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-zinc-200/60 flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-zinc-400" />
          </div>
          <input
            type="text"
            placeholder="Search by invoice ID or customer..."
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

      <div className="bg-white shadow-sm rounded-2xl border border-zinc-200/60 overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-200">
            <thead className="bg-zinc-50/80">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Invoice ID</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Customer</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Total</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="relative px-6 py-4"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-zinc-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-zinc-400">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
                      <p className="text-sm">Loading invoices...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredInvoices?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-zinc-400">
                      <Receipt className="h-12 w-12 mb-4 opacity-20" />
                      <p className="text-sm font-medium text-zinc-900">No invoices found</p>
                      <p className="text-xs mt-1">Try adjusting your search or create a new sale.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredInvoices?.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-zinc-50/80 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100/50 mr-4 text-indigo-600 font-bold text-xs">
                          INV
                        </div>
                        <span className="text-sm font-semibold text-zinc-900 group-hover:text-indigo-600 transition-colors">INV-{invoice.id.toString().padStart(4, '0')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">
                      {format(new Date(invoice.date), 'MMM d, yyyy HH:mm')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 font-medium">
                      {invoice.customer_name || 'Walk-in Customer'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-zinc-900">
                      ${invoice.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 inline-flex text-xs font-medium rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100 capitalize">
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleViewInvoice(invoice.id)} className="p-2 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                          <Eye className="h-4 w-4" />
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
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
                <p className="text-sm">Loading invoices...</p>
              </div>
            </div>
          ) : filteredInvoices?.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="flex flex-col items-center justify-center text-zinc-400">
                <Receipt className="h-12 w-12 mb-4 opacity-20" />
                <p className="text-sm font-medium text-zinc-900">No invoices found</p>
                <p className="text-xs mt-1">Try adjusting your search or create a new sale.</p>
              </div>
            </div>
          ) : (
            filteredInvoices?.map((invoice) => (
              <div key={invoice.id} className="p-4 hover:bg-zinc-50/80 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 flex-shrink-0 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100/50 text-indigo-600 font-bold text-xs">
                      INV
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-zinc-900">INV-{invoice.id.toString().padStart(4, '0')}</div>
                      <div className="text-xs text-zinc-500 mt-0.5">{format(new Date(invoice.date), 'MMM d, yyyy HH:mm')}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleViewInvoice(invoice.id)} className="p-1.5 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <div className="bg-zinc-50 rounded-lg p-2 border border-zinc-100">
                    <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold mb-1">Customer</div>
                    <div className="text-sm font-medium text-zinc-900 truncate">{invoice.customer_name || 'Walk-in Customer'}</div>
                  </div>
                  <div className="bg-zinc-50 rounded-lg p-2 border border-zinc-100">
                    <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold mb-1">Total</div>
                    <div className="text-sm font-bold text-zinc-900">${invoice.total.toFixed(2)}</div>
                  </div>
                </div>
                
                <div className="mt-3">
                  <span className="px-2 py-1 inline-flex text-[10px] font-medium rounded bg-emerald-50 text-emerald-700 border border-emerald-100 capitalize">
                    {invoice.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Invoice Detail Modal */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {selectedInvoice && (
            <motion.div className="fixed z-[100] inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
              <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-zinc-900/80 backdrop-blur-sm transition-opacity print:hidden" 
                  aria-hidden="true" 
                  onClick={() => setSelectedInvoice(null)}
                />
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full border border-zinc-200/60 print:border-none print:shadow-none print:max-w-none print:w-full print:m-0 relative z-10"
                >
                <div className="bg-white px-8 pt-8 pb-6" id="printable-invoice">
                  <div className="flex justify-between items-start mb-10">
                    <div>
                      <h3 className="text-3xl font-bold text-zinc-900 tracking-tight">INVOICE</h3>
                      <p className="text-sm text-zinc-500 mt-1 font-mono">INV-{selectedInvoice.id.toString().padStart(4, '0')}</p>
                      <p className="text-sm text-zinc-500">{format(new Date(selectedInvoice.date), 'MMMM d, yyyy h:mm a')}</p>
                    </div>
                    <button onClick={() => setSelectedInvoice(null)} className="text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 p-2 rounded-lg transition-colors print:hidden">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-8 mb-10">
                    <div>
                      <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">Billed To</h4>
                      {selectedInvoice.customer_name ? (
                        <div className="text-sm text-zinc-900 space-y-1">
                          <p className="font-semibold text-base">{selectedInvoice.customer_name}</p>
                          {selectedInvoice.email && <p className="text-zinc-600">{selectedInvoice.email}</p>}
                          {selectedInvoice.phone && <p className="text-zinc-600">{selectedInvoice.phone}</p>}
                          {selectedInvoice.address && <p className="text-zinc-500 mt-2 whitespace-pre-line">{selectedInvoice.address}</p>}
                        </div>
                      ) : (
                        <p className="text-sm text-zinc-900 font-semibold text-base">Walk-in Customer</p>
                      )}
                    </div>
                    <div className="text-right">
                      <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">Payment Status</h4>
                      <span className="px-3 py-1.5 inline-flex text-xs font-bold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100 capitalize">
                        {selectedInvoice.status}
                      </span>
                    </div>
                  </div>

                  <table className="min-w-full divide-y divide-zinc-200 mb-8">
                    <thead>
                      <tr>
                        <th className="py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Item</th>
                        <th className="py-3 text-right text-xs font-semibold text-zinc-500 uppercase tracking-wider">Qty</th>
                        <th className="py-3 text-right text-xs font-semibold text-zinc-500 uppercase tracking-wider">Price</th>
                        <th className="py-3 text-right text-xs font-semibold text-zinc-500 uppercase tracking-wider">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {selectedInvoice.items?.map((item, idx) => (
                        <tr key={idx} className="group hover:bg-zinc-50/50 transition-colors">
                          <td className="py-4 text-sm text-zinc-900">
                            <p className="font-semibold">{item.product_name}</p>
                            <p className="text-xs text-zinc-500 font-mono mt-0.5">{item.sku}</p>
                          </td>
                          <td className="py-4 text-sm text-zinc-900 text-right font-medium">{item.quantity}</td>
                          <td className="py-4 text-sm text-zinc-900 text-right font-mono">${item.price.toFixed(2)}</td>
                          <td className="py-4 text-sm text-zinc-900 text-right font-mono font-bold">${(item.quantity * item.price).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={3} className="py-6 text-right text-sm font-bold text-zinc-500 uppercase tracking-wider">Total Amount</td>
                        <td className="py-6 text-right text-2xl font-bold text-indigo-600 font-mono">${selectedInvoice.total.toFixed(2)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                <div className="bg-zinc-50/80 px-8 py-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 border-t border-zinc-200/60 print:hidden">
                  <button 
                    type="button" 
                    onClick={() => setSelectedInvoice(null)} 
                    className="w-full sm:w-auto inline-flex justify-center items-center rounded-xl border border-zinc-200 px-5 py-2.5 bg-white text-sm font-semibold text-zinc-700 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                  >
                    Close
                  </button>
                  <button 
                    type="button" 
                    onClick={() => window.print()} 
                    className="w-full sm:w-auto inline-flex justify-center items-center rounded-xl border border-transparent px-5 py-2.5 bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm shadow-indigo-600/20 transition-all active:scale-95"
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Print Invoice
                  </button>
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
