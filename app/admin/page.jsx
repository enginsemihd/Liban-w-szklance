"use client";

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Mail, ShieldCheck, Clock, CheckCircle2, Phone, Play, Check, TrendingUp, Receipt, X } from 'lucide-react';
import { supabase } from '../../lib/supabase'; 

const BRAND = { bg: '#FBF9F2', ink: '#16261B', green: '#34A853', line: '#E4DCC6' };

export default function AdminPage() {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ today_revenue: 0, total_revenue: 0, today_orders: 0, total_orders: 0 });
  const [view, setView] = useState('login'); 
  const [activeTab, setActiveTab] = useState('kitchen'); 
  
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false); 

  // 1. SESSION CHECK
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      if (session) refreshData();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) refreshData();
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. REALTIME & PERIODIC REFRESH
  useEffect(() => {
    if (session) {
      const interval = setInterval(refreshData, 120000);
      const channel = supabase.channel('admin-dashboard')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, 
          () => refreshData()
        )
        .subscribe();

      return () => {
        clearInterval(interval);
        supabase.removeChannel(channel);
      };
    }
  }, [session]);

  // REFRESH DATA (Orders + Stats)
  async function refreshData() {
    await fetchOrders();
    await fetchStats();
  }

  // FETCH ORDERS (Last 3 days / Performance Protection)
  async function fetchOrders() {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .gte('created_at', threeDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(300);
      
    if (!error && data) setOrders(data);
  }

  // FETCH STATS (Calls RPC Function from SQL)
  async function fetchStats() {
    const { data, error } = await supabase.rpc('get_admin_dashboard_stats');
    if (!error && data) setStats(data);
  }

  // UPDATE STATUS (Triggered by buttons)
  async function updateOrderStatus(id, newStatus) {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', id);

    if (!error) {
      await refreshData();
    } else {
      console.error("Update Error:", error);
      alert("Error: " + error.message + "\nPlease check if the email in the RLS policy matches your login email.");
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault(); setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
  };

  const handleLogout = async () => await supabase.auth.signOut();

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetEmail.includes('@')) { setError('Invalid email address.'); return; }
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, { redirectTo: `${window.location.origin}/admin` });
    if (error) setError(error.message); else setResetSent(true); 
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading Secure Environment...</div>;

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: BRAND.bg }}>
        <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-sm border relative overflow-hidden" style={{ borderColor: BRAND.line }}>
          {view === 'login' && (
            <div className="anim-fadeup">
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#eefbf1', color: BRAND.green }}><span className="text-2xl">🔒</span></div>
                <h1 className="text-2xl font-bold" style={{ color: BRAND.ink }}>Owner Panel</h1>
              </div>
              <form onSubmit={handleLogin} className="space-y-4">
                <div><label className="block text-xs uppercase font-semibold text-gray-500 mb-1">Email Address</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-green-500" required /></div>
                <div>
                  <div className="flex justify-between items-baseline mb-1"><label className="block text-xs uppercase font-semibold text-gray-500">Password</label><button type="button" onClick={() => { setView('forgot_password'); setError(''); }} className="text-xs font-semibold hover:underline" style={{ color: BRAND.green }}>Forgot Password?</button></div>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-green-500" required />
                </div>
                {error && <div className="text-red-500 text-sm font-semibold text-center bg-red-50 p-2 rounded-lg">{error}</div>}
                <button type="submit" className="w-full text-white font-semibold py-3 rounded-xl active:scale-95 transition" style={{ backgroundColor: BRAND.green }}>Login</button>
              </form>
            </div>
          )}
          {view === 'forgot_password' && (
             <div className="anim-fadeup">
               <button onClick={() => { setView('login'); setResetSent(false); setError(''); }} className="absolute top-6 left-6 text-gray-400 hover:text-gray-800"><ArrowLeft size={20} /></button>
               <div className="text-center mb-6 mt-4">
                 <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-green-50"><Mail size={28} className="text-green-600"/></div>
                 <h1 className="text-2xl font-bold">Reset Password</h1>
               </div>
               {!resetSent ? (
                 <form onSubmit={handleResetPassword} className="space-y-4">
                   <div><label className="block text-xs uppercase font-semibold text-gray-500 mb-1">Email Address</label><input type="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} className="w-full border p-3 rounded-xl outline-none" required/></div>
                   {error && <div className="text-red-500 text-sm bg-red-50 p-2 rounded-lg text-center">{error}</div>}
                   <button type="submit" className="w-full text-white font-semibold py-3 rounded-xl active:scale-95 transition" style={{ backgroundColor: BRAND.green }}>Send Link</button>
                 </form>
               ) : (
                 <div className="text-center bg-green-50 p-4 rounded-xl border border-green-200">
                   <ShieldCheck size={32} className="text-green-600 mx-auto mb-2" />
                   <h3 className="font-bold text-green-800">Check Your Inbox</h3>
                 </div>
               )}
             </div>
          )}
        </div>
      </div>
    );
  }

  const activeOrders = orders.filter(o => o.status !== 'delivered');
  const deliveredOrders = orders.filter(o => o.status === 'delivered');

  return (
    <div style={{ backgroundColor: BRAND.bg, minHeight: '100vh' }}>
      <header className="border-b p-4 flex justify-between items-center sticky top-0 z-10" style={{ backgroundColor: BRAND.ink, color: 'white' }}>
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-bold">👨‍🍳 Liban Admin</h1>
          <div className="hidden md:flex bg-white/10 rounded-full p-1">
            <button onClick={() => setActiveTab('kitchen')} className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${activeTab === 'kitchen' ? 'bg-white text-black' : 'text-gray-300 hover:text-white'}`}>Kitchen Dashboard</button>
            <button onClick={() => setActiveTab('reports')} className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${activeTab === 'reports' ? 'bg-white text-black' : 'text-gray-300 hover:text-white'}`}>Reports & History</button>
          </div>
        </div>
        <button onClick={handleLogout} className="text-xs px-3 py-1.5 rounded-full border border-red-500 text-red-400 hover:bg-red-500 hover:text-white transition">Logout</button>
      </header>
      
      <div className="md:hidden flex p-4 bg-white border-b">
         <button onClick={() => setActiveTab('kitchen')} className={`flex-1 py-2 text-sm font-bold border-b-2 ${activeTab === 'kitchen' ? 'border-green-600 text-green-700' : 'border-transparent text-gray-400'}`}>Kitchen</button>
         <button onClick={() => setActiveTab('reports')} className={`flex-1 py-2 text-sm font-bold border-b-2 ${activeTab === 'reports' ? 'border-green-600 text-green-700' : 'border-transparent text-gray-400'}`}>Reports</button>
      </div>

      <div className="p-4 md:p-6 max-w-6xl mx-auto">
        
        {activeTab === 'kitchen' && (
          <div className="anim-fadeup">
            <h2 className="text-2xl font-bold mb-6" style={{ color: BRAND.ink }}>Active Orders ({activeOrders.length})</h2>
            {activeOrders.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <CheckCircle2 size={48} className="mx-auto mb-4 text-green-300 opacity-50" />
                <p className="text-xl">All caught up! No active orders right now.</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {activeOrders.map((order) => {
                  const isPreparing = order.status === 'preparing';
                  return (
                    <div key={order.id} className={`bg-white p-5 rounded-2xl shadow-sm border-2 flex flex-col ${isPreparing ? 'border-blue-400' : 'border-gray-200'}`}>
                      <div className="flex justify-between items-start border-b pb-4 mb-4 border-gray-100">
                        <div>
                          <h3 className="font-bold text-lg text-gray-900">{order.customer_name}</h3>
                          <p className="text-gray-500 text-sm mt-0.5 flex items-center gap-1"><Phone size={12} /> {order.customer_phone}</p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-block px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider mb-1 ${isPreparing ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {isPreparing ? 'PREPARING' : 'NEW ORDER'}
                          </span>
                          <div className="text-xs font-bold text-red-600 flex items-center gap-1 justify-end">
                            <Clock size={12} /> {new Date(order.pickup_time).toLocaleTimeString('en-US', { timeZone: 'Europe/Warsaw', hour: '2-digit', minute:'2-digit', hour12: false })}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2 mb-6 flex-1">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="text-sm">
                            <span className="font-bold mr-2 text-gray-500">{item.qty}x</span><span className="font-bold text-gray-800">{item.name}</span>
                            <div className="text-xs text-gray-500 ml-6">{item.sizeLabel}{item.mods && Object.values(item.mods).flat().map(m => ` · ${m.name}`).join('')}</div>
                          </div>
                        ))}
                      </div>
                      <div className="border-t border-gray-100 pt-4">
                        {!isPreparing ? (
                          <button onClick={() => updateOrderStatus(order.id, 'preparing')} className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 text-blue-700 bg-blue-50 hover:bg-blue-100 transition"><Play size={16} /> Start Preparing</button>
                        ) : (
                          <button onClick={() => updateOrderStatus(order.id, 'delivered')} className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 text-green-800 bg-green-100 hover:bg-green-200 transition"><Check size={18} /> Mark as Delivered</button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'reports' && (
           <div className="anim-fadeup space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                 <div className="bg-green-600 text-white p-6 rounded-3xl shadow-lg">
                    <div className="flex items-center gap-2 text-green-100 mb-2 font-semibold uppercase tracking-wider text-sm"><TrendingUp size={16}/> Today's Revenue</div>
                    <div className="text-4xl font-display font-black">{stats.today_revenue.toFixed(2)} PLN</div>
                    <div className="mt-4 text-sm text-green-200">{stats.today_orders} orders completed today.</div>
                 </div>
                 <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 flex flex-col justify-center">
                    <div className="flex items-center gap-2 text-gray-500 mb-2 font-semibold uppercase tracking-wider text-sm"><Receipt size={16}/> Total Lifetime Orders</div>
                    <div className="text-3xl font-display font-bold text-gray-800">{stats.total_orders}</div>
                 </div>
              </div>

              <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
                 <div className="px-6 py-4 border-b border-gray-100 bg-gray-50"><h3 className="font-bold text-gray-800">Order History (Delivered)</h3></div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                       <thead className="bg-white border-b text-gray-400">
                          <tr>
                             <th className="px-6 py-3 font-semibold">Date & Time</th>
                             <th className="px-6 py-3 font-semibold">Customer</th>
                             <th className="px-6 py-3 font-semibold">Items</th>
                             <th className="px-6 py-3 font-semibold text-right">Total</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-100">
                          {deliveredOrders.length === 0 && <tr><td colSpan="4" className="text-center py-8 text-gray-400">No completed orders yet.</td></tr>}
                          {deliveredOrders.map(order => ( 
                             <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 text-gray-500 font-medium">
                                   {new Date(order.created_at).toLocaleDateString()} <br/>
                                   <span className="text-xs">{new Date(order.created_at).toLocaleTimeString('en-US', { timeZone: 'Europe/Warsaw', hour: '2-digit', minute:'2-digit', hour12: false })}</span>
                                </td>
                                <td className="px-6 py-4 font-bold text-gray-900">{order.customer_name}</td>
                                <td className="px-6 py-4 text-gray-600">
                                   {order.items.map((i, idx) => <div key={idx}>{i.qty}x {i.name}</div>)}
                                </td>
                                <td className="px-6 py-4 font-bold text-green-700 text-right">{order.total_price.toFixed(2)} PLN</td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </div>
           </div>
        )}

      </div>
    </div>
  );
}