import React, { useState, useEffect } from 'react';
import { Product, Invoice } from '../types';
import { motion } from 'motion/react';
import { 
  Bird, 
  Users, 
  Receipt, 
  DollarSign,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

interface DashboardStats {
  products: number;
  customers: number;
  invoices: number;
  revenue: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [lowStock, setLowStock] = useState<Product[]>([]);
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(data => {
        setStats(data.stats || null);
        setLowStock(Array.isArray(data.lowStock) ? data.lowStock : []);
        setRecentInvoices(Array.isArray(data.recentInvoices) ? data.recentInvoices : []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div></div>;

  const statCards = [
    { name: 'Total Revenue', value: `$${stats?.revenue.toFixed(2) || '0.00'}`, icon: DollarSign, color: 'bg-emerald-500', trend: '+12.5%' },
    { name: 'Farm Products', value: stats?.products || 0, icon: Bird, color: 'bg-amber-500', trend: '+4.2%' },
    { name: 'Total Customers', value: stats?.customers || 0, icon: Users, color: 'bg-orange-500', trend: '+18.1%' },
    { name: 'Total Invoices', value: stats?.invoices || 0, icon: Receipt, color: 'bg-purple-500', trend: '+8.4%' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Farm Dashboard</h1>
          <p className="text-sm text-zinc-500 mt-1">Welcome back, here's what's happening on the farm today.</p>
        </div>
        <Link to="/billing" className="inline-flex items-center justify-center px-5 py-2.5 border border-transparent rounded-xl shadow-sm shadow-amber-600/20 text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all active:scale-95">
          <Activity className="w-4 h-4 mr-2" />
          New Sale
        </Link>
      </div>

      {/* Stats Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
      >
        {statCards.map((item) => (
          <motion.div variants={itemVariants} key={item.name} className="bg-white overflow-hidden shadow-sm rounded-2xl border border-zinc-200/60 hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className={`${item.color} rounded-xl p-3 shadow-sm`}>
                  <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <div className="flex items-center text-emerald-600 text-sm font-medium bg-emerald-50 px-2 py-1 rounded-lg">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {item.trend}
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-zinc-500 truncate">{item.name}</p>
                <p className="text-3xl font-bold text-zinc-900 mt-1 tracking-tight">{item.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alerts */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white shadow-sm rounded-2xl border border-zinc-200/60 overflow-hidden flex flex-col"
        >
          <div className="px-6 py-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
            <h3 className="text-lg leading-6 font-semibold text-zinc-900 flex items-center">
              <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
              Low Stock Alerts
            </h3>
            <Link to="/products" className="text-sm font-medium text-amber-600 hover:text-amber-700 flex items-center group">
              View all <ArrowRight className="ml-1 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="divide-y divide-zinc-100 flex-1 overflow-y-auto max-h-[400px]">
            {lowStock?.length === 0 ? (
              <div className="p-8 flex flex-col items-center justify-center text-center h-full">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
                  <Bird className="h-6 w-6 text-emerald-600" />
                </div>
                <p className="text-sm font-medium text-zinc-900">Inventory is healthy</p>
                <p className="text-xs text-zinc-500 mt-1">All farm products are well stocked.</p>
              </div>
            ) : (
              lowStock?.map((product) => (
                <div key={product.id} className="px-6 py-4 flex items-center justify-between hover:bg-zinc-50 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-500">
                      <Bird className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-zinc-900 group-hover:text-amber-600 transition-colors">{product.name}</p>
                      <p className="text-xs text-zinc-500 font-mono mt-0.5">SKU: {product.sku}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-red-50 text-red-700 border border-red-100">
                      {product.stock} left (Min: {product.min_stock})
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Recent Invoices */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white shadow-sm rounded-2xl border border-zinc-200/60 overflow-hidden flex flex-col"
        >
          <div className="px-6 py-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
            <h3 className="text-lg leading-6 font-semibold text-zinc-900 flex items-center">
              <Receipt className="h-5 w-5 text-zinc-400 mr-2" />
              Recent Invoices
            </h3>
            <Link to="/invoices" className="text-sm font-medium text-amber-600 hover:text-amber-700 flex items-center group">
              View all <ArrowRight className="ml-1 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="divide-y divide-zinc-100 flex-1 overflow-y-auto max-h-[400px]">
            {recentInvoices?.length === 0 ? (
              <div className="p-8 flex flex-col items-center justify-center text-center h-full">
                <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mb-3">
                  <Receipt className="h-6 w-6 text-zinc-400" />
                </div>
                <p className="text-sm font-medium text-zinc-900">No invoices yet</p>
                <p className="text-xs text-zinc-500 mt-1">Create a sale to generate an invoice.</p>
              </div>
            ) : (
              recentInvoices?.map((invoice) => (
                <div key={invoice.id} className="px-6 py-4 flex items-center justify-between hover:bg-zinc-50 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 font-bold text-xs">
                      INV
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-zinc-900 group-hover:text-amber-600 transition-colors">
                        INV-{invoice.id.toString().padStart(4, '0')}
                      </p>
                      <p className="text-xs text-zinc-500 mt-0.5 flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {invoice.customer_name || 'Walk-in Customer'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-zinc-900">${invoice.total.toFixed(2)}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">{format(new Date(invoice.date), 'MMM d, yyyy')}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
