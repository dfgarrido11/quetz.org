'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  TreePine, LayoutDashboard, Trees, Shield, BarChart3,
  User, LogOut, Menu, X, ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { href: '/dashboard', label: 'Resumen', icon: LayoutDashboard },
  { href: '/dashboard/trees', label: 'Mis Árboles', icon: Trees },
  { href: '/dashboard/guardian', label: 'Mi Guardián', icon: Shield },
  { href: '/dashboard/impact', label: 'Mi Impacto', icon: BarChart3 },
  { href: '/dashboard/profile', label: 'Perfil', icon: User },
];

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession() || {};
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-green-50/50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-white border-r border-green-100 fixed h-full z-30">
        <div className="p-5 border-b border-green-100">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-700 rounded-lg flex items-center justify-center shadow">
              <TreePine className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-green-900 text-lg">Quetz.org</h1>
              <p className="text-[11px] text-green-600">Reforestación Zacapa</p>
            </div>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-green-100 text-green-900 shadow-sm'
                    : 'text-gray-600 hover:bg-green-50 hover:text-green-800'
                }`}
              >
                <item.icon className={`w-4.5 h-4.5 ${isActive ? 'text-green-700' : 'text-gray-400'}`} />
                {item.label}
                {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto text-green-500" />}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-green-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-green-700" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{session?.user?.name ?? 'Usuario'}</p>
              <p className="text-xs text-gray-500 truncate">{session?.user?.email ?? ''}</p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-green-100 px-4 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-700 rounded-lg flex items-center justify-center">
            <TreePine className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-green-900">Quetz.org</span>
        </Link>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 hover:bg-green-50 rounded-lg">
          {mobileOpen ? <X className="w-5 h-5 text-gray-600" /> : <Menu className="w-5 h-5 text-gray-600" />}
        </button>
      </div>

      {/* Mobile Nav Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-30 bg-black/30"
            onClick={() => setMobileOpen(false)}
          >
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25 }}
              className="w-64 h-full bg-white shadow-xl"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <div className="p-5 border-b border-green-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-700 rounded-lg flex items-center justify-center">
                    <TreePine className="w-5 h-5 text-white" />
                  </div>
                  <h1 className="font-bold text-green-900 text-lg">Quetz.org</h1>
                </div>
              </div>
              <nav className="p-3 space-y-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        isActive ? 'bg-green-100 text-green-900' : 'text-gray-600 hover:bg-green-50'
                      }`}
                    >
                      <item.icon className="w-4.5 h-4.5" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-green-100">
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <LogOut className="w-4 h-4" /> Cerrar Sesión
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 pt-16 lg:pt-0">
        <div className="max-w-[1200px] mx-auto p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
