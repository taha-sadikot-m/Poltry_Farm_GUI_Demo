import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Bird, 
  Users, 
  Receipt, 
  ShoppingCart,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Billing / POS', href: '/billing', icon: ShoppingCart },
    { name: 'Farm Products', href: '/products', icon: Bird },
    { name: 'Customers', href: '/customers', icon: Users },
    { name: 'Invoices', href: '/invoices', icon: Receipt },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 flex">
      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-20 bg-zinc-900/80 backdrop-blur-sm lg:hidden" 
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-72 bg-white border-r border-zinc-200 text-zinc-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-20 px-6 border-b border-zinc-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center shadow-sm shadow-amber-500/20">
              <Bird className="w-5 h-5 text-white" />
            </div>
            <span className="text-zinc-900 font-bold text-xl tracking-tight">Poultry Manager</span>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-4 py-6 flex flex-col h-[calc(100vh-5rem)]">
          <nav className="flex-1 space-y-1.5">
            <div className="px-3 mb-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Menu
            </div>
            {navigation.map((item) => {
              const isActive = location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200
                    ${isActive 
                      ? 'bg-amber-50 text-amber-700 shadow-sm shadow-amber-100/50' 
                      : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'}
                  `}
                >
                  <item.icon className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors ${isActive ? 'text-amber-600' : 'text-zinc-400 group-hover:text-zinc-600'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto pt-6 border-t border-zinc-100">
            <div className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-zinc-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold shadow-sm">
                  {user?.username.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-zinc-900 leading-none">{user?.username}</span>
                  <span className="text-xs text-zinc-500 capitalize mt-1">{user?.role}</span>
                </div>
              </div>
              <button 
                onClick={logout} 
                className="text-zinc-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors"
                title="Log out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-zinc-50/50">
        <header className="bg-white/80 backdrop-blur-md border-b border-zinc-200/80 sticky top-0 z-10 lg:hidden">
          <div className="px-4 sm:px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center shadow-sm shadow-amber-500/20">
                <Bird className="w-5 h-5 text-white" />
              </div>
              <span className="text-zinc-900 font-bold text-lg tracking-tight">Poultry Manager</span>
            </div>
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-amber-500"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto focus:outline-none relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
