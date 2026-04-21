"use client";

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Mail, ShieldCheck, Clock, CheckCircle2, Phone, Play, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase'; 

const BRAND = { bg: '#FBF9F2', ink: '#16261B', green: '#34A853', line: '#E4DCC6' };

export default function AdminPage() {
  const [orders, setOrders] = useState([]);
  const [view, setView] = useState('login'); 
  
  // Supabase Auth State'leri
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false); 

  // 1. SİSTEM YÜKLENDİĞİNDE OTURUMU KONTROL ET
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      if (session) fetchOrders();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchOrders();
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. OTOMATİK SİPARİŞ YENİLEME
  useEffect(() => {
    if (session) {
      const interval = setInterval(fetchOrders, 30000);
      return () => clearInterval(interval);
    }
  }, [session]);

  // SİPARİŞLERİ ÇEK (Sadece Teslim Edilmeyenleri Getir)
  async function fetchOrders() {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .neq('status', 'delivered') // Teslim edilenleri ekranda gösterme
      .order('created_at', { ascending: false });
      
    if (!error && data) setOrders(data);
  }

  // DURUM GÜNCELLEME FONKSİYONU
  async function updateOrderStatus(id, newStatus) {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', id);
      
    if (!error) {
      // Ekranı anında güncelle
      fetchOrders();
    } else {
      alert("Error updating order status!");
    }
  }

  // SUPABASE GİRİŞ İŞLEMİ
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      setError(error.message);
    }
  };

  // ÇIKIŞ İŞLEMİ
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // GERÇEK ŞİFRE SIFIRLAMA İŞLEMİ
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetEmail.includes('@')) { setError('Please enter a valid email address.'); return; }
    
    setError(''); 
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/admin`,
    });

    if (error) {
      setError(error.message);
    } else {
      setResetSent(true); 
    }
  };

  // EKRAN YÜKLENİYOR
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading Secure Environment...</div>;
  }

  // 1. EKRAN: GİRİŞ YAPILMAMIŞSA
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: BRAND.bg }}>
        <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-sm border relative overflow-hidden" style={{ borderColor: BRAND.line }}>
          
          {view === 'login' && (
            <div className="anim-fadeup">
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#eefbf1', color: BRAND.green }}>
                  <span className="text-2xl">🔒</span>
                </div>
                <h1 className="text-2xl font-bold" style={{ color: BRAND.ink }}>Owner Panel</h1>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs uppercase font-semibold text-gray-500 mb-1">Email Address</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-green-500" placeholder="admin@libancafe.com" required />
                </div>
                <div>
                  <div className="flex justify-between items-baseline mb-1">
                    <label className="block text-xs uppercase font-semibold text-gray-500">Password</label>
                    <button type="button" onClick={() => { setView('forgot_password'); setError(''); }} className="text-xs font-semibold hover:underline" style={{ color: BRAND.green }}>Forgot Password?</button>
                  </div>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-green-500" placeholder="••••••••" required />
                </div>
                {error && <div className="text-red-500 text-sm font-semibold text-center bg-red-50 p-2 rounded-lg">{error}</div>}
                <button type="submit" className="w-full text-white font-semibold py-3 rounded-xl transition-transform active:scale-95" style={{ backgroundColor: BRAND.green }}>Secure Login</button>
              </form>
              <div className="mt-6 text-center border-t pt-4" style={{ borderColor: BRAND.line }}>
                <button onClick={() => window.location.href = '/'} className="text-sm text-gray-500 hover:text-gray-800 transition">← Return to Store</button>
              </div>
            </div>
          )}

          {view === 'forgot_password' && (
            <div className="anim-fadeup">
              <button onClick={() => { setView('login'); setResetSent(false); setError(''); }} className="absolute top-6 left-6 text-gray-400 hover:text-gray-800 transition"><ArrowLeft size={20} /></button>
              <div className="text-center mb-6 mt-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#eefbf1', color: BRAND.green }}><Mail size={28} /></div>
                <h1 className="text-2xl font-bold" style={{ color: BRAND.ink }}>Reset Password</h1>
              </div>
              {!resetSent ? (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div><label className="block text-xs uppercase font-semibold text-gray-500 mb-1">Email Address</label><input type="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-green-500" placeholder="admin@libancafe.com" required/></div>
                  {error && <div className="text-red-500 text-sm font-semibold text-center bg-red-50 p-2 rounded-lg">{error}</div>}
                  <button type="submit" className="w-full text-white font-semibold py-3 rounded-xl transition-transform active:scale-95" style={{ backgroundColor: BRAND.green }}>Send Reset Link</button>
                </form>
              ) : (
                <div className="text-center bg-green-50 p-4 rounded-xl border border-green-200">
                  <ShieldCheck size={32} className="text-green-600 mx-auto mb-2" />
                  <h3 className="font-bold text-green-800 mb-1">Check Your Inbox</h3>
                  <p className="text-sm text-green-700">A secure password reset link has been sent to your email.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // 2. EKRAN: CANLI SİPARİŞ EKRANI (DASHBOARD)
  return (
    <div style={{ backgroundColor: BRAND.bg, minHeight: '100vh' }}>
      <header className="border-b p-4 flex justify-between items-center sticky top-0 z-10" style={{ backgroundColor: BRAND.ink, color: 'white' }}>
        <h1 className="text-lg font-bold">👨‍🍳 Kitchen Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-400 hidden sm:inline-block">{session.user.email}</span>
          <button onClick={handleLogout} className="text-xs px-3 py-1.5 rounded-full border border-red-500 text-red-400 hover:bg-red-500 hover:text-white transition">Logout</button>
        </div>
      </header>
      
      <div className="p-6 max-w-5xl mx-auto">
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-2xl font-bold" style={{ color: BRAND.ink }}>Active Orders</h2>
          <button onClick={fetchOrders} className="text-sm font-semibold flex items-center gap-2" style={{ color: BRAND.green }}>
            <Clock size={16} /> Refresh
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <CheckCircle2 size={48} className="mx-auto mb-4 text-green-300 opacity-50" />
            <p className="text-xl">All caught up! No active orders right now.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {orders.map((order) => {
              const orderDate = new Date(order.created_at);
              const pickupDate = new Date(order.pickup_time);
              const isPreparing = order.status === 'preparing';
              
              return (
                <div key={order.id} className={`bg-white p-5 rounded-2xl shadow-sm border-2 transition-colors ${isPreparing ? 'border-blue-400' : 'border-gray-200'}`}>
                  
                  <div className="flex justify-between items-start border-b pb-4 mb-4 border-gray-100">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">{order.customer_name}</h3>
                      <p className="text-gray-500 text-sm mt-0.5 flex items-center gap-1">
                        <Phone size={12} /> {order.customer_phone}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider mb-1 ${isPreparing ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {isPreparing ? 'PREPARING' : 'NEW ORDER'}
                      </span>
                      <div className="text-xs font-bold text-red-600 flex items-center gap-1 justify-end">
                        <Clock size={12} /> {pickupDate.toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit', hour12: false})}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-6 min-h-[80px]">
                    {order.items && order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <div>
                          <span className="font-bold mr-2">{item.qty}x</span>
                          <span className="text-gray-800">{item.name}</span>
                          <div className="text-xs text-gray-500 ml-6">
                            {item.sizeLabel}
                            {item.mods && Object.values(item.mods).flat().map(m => ` · ${m.name}`).join('')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* AKSİYON BUTONLARI */}
                  <div className="border-t border-gray-100 pt-4 mt-auto">
                    {!isPreparing ? (
                      <button 
                        onClick={() => updateOrderStatus(order.id, 'preparing')}
                        className="w-full py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 text-blue-700 bg-blue-50 hover:bg-blue-100 transition"
                      >
                        <Play size={16} /> Start Preparing
                      </button>
                    ) : (
                      <button 
                        onClick={() => updateOrderStatus(order.id, 'delivered')}
                        className="w-full py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 text-green-800 bg-green-100 hover:bg-green-200 transition"
                      >
                        <Check size={18} /> Mark as Delivered
                      </button>
                    )}
                  </div>
                  
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}