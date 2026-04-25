"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ShoppingBag, Plus, Minus, X, Check, Phone, User,
  ChevronRight, ArrowLeft, Store, Flame, ShieldCheck, Bell, Search, Clock, Package
} from 'lucide-react';
import { supabase } from '../lib/supabase'; 

/* ============================================================
   BRAND / DESIGN TOKENS
============================================================ */
const BRAND = {
  green: '#93b45b', 
  greenDark: '#7a964a', 
  greenSoft: '#aecd76',
  gold: '#C99A3D', goldSoft: '#E6C472', cream: '#F7F1E3',
  creamDeep: '#EFE6D2', ink: '#16261B', muted: '#6B7165',
  line: '#E4DCC6', bg: '#000000', red: '#B4412A',
};

const STYLE_TAG = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;0,9..144,800;1,9..144,500&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
*,*::before,*::after{ box-sizing:border-box; }
html,body{ margin:0; padding:0; background:transparent; color:${BRAND.ink}; font-family:'Plus Jakarta Sans',system-ui,sans-serif; -webkit-font-smoothing:antialiased; }
.font-display{ font-family:'Fraunces',Georgia,serif; font-optical-sizing:auto; letter-spacing:-0.01em; }
.font-body{ font-family:'Plus Jakarta Sans',system-ui,sans-serif; }
.scroll-hide::-webkit-scrollbar{ display:none; }
.scroll-hide{ -ms-overflow-style:none; scrollbar-width:none; }
button:focus-visible{ outline: 2px solid ${BRAND.gold}; outline-offset: 2px; border-radius: 6px; }

/* Video Arka Plan Ayarları */
.video-bg-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  overflow: hidden;
  background-color: #000;
}
.video-bg {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(0.6) contrast(1.1); 
}
.content-wrapper {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  background: rgba(251, 249, 242, 0.85); 
  backdrop-filter: blur(8px); 
}

@keyframes fadeUp{ from{ opacity:0; transform:translateY(12px) } to{ opacity:1; transform:translateY(0) } }
.anim-fadeup{ animation: fadeUp 0.35s ease-out both; }
@keyframes slideIn{ from{ transform:translateY(100%) } to{ transform:translateY(0) } }
.anim-slide{ animation: slideIn 0.3s cubic-bezier(.2,.9,.3,1.2) both; }
`;

/* ============================================================
   TRANSLATIONS DICTIONARY
============================================================ */
const T = {
  EN: { 
    cart: 'Cart', yourCart: 'Your Cart', emptyCart: 'Your cart is empty', pay: 'Total to pay', checkout: 'Proceed to Checkout', add: 'Add to Cart', size: 'Size', required: 'Required', selectMissing: 'Select required options', heroTitle: 'Lebanon captured', heroSub: 'in a glass.', heroDesc: 'Authentic Lebanese shakes with ashta, fresh fruits, nuts, and honey. Order online, choose your pickup slot, and collect straight from our store — skip the line.', preparingToast: 'Great news! Your order is now being prepared.', readyToast: 'Your order is ready for pickup! See you soon.',
    trackOrder: 'Track Order', trackTitle: 'Track Your Order', phoneLabel: 'Phone Number', checkStatus: 'Check Status', notFound: 'No recent orders found for this number.', status_new: 'Order Received', status_preparing: 'Preparing', status_delivered: 'Delivered',
    promoTitle: 'Specially for You!', promoSub: 'Treat yourself to something sweet today.', upsellTitle: 'Complete your order', upsellDesc: 'How about adding these Lebanese classics?', extras: 'Extras',
    capacityError: 'Sorry, this time slot is full. Please choose another one.',
    callMessage: 'Our staff will call you shortly to confirm your order.',
    generalError: 'Something went wrong. Please try again.',
    authError: 'Authentication error. Please refresh the page.'
  },
  PL: { 
    cart: 'Koszyk', yourCart: 'Twój koszyk', emptyCart: 'Twój koszyk jest pusty', pay: 'Do zapłaty', checkout: 'Przejdź do odbioru', add: 'Dodaj do koszyka', size: 'Rozmiar', required: 'Wymagane', selectMissing: 'Wybierz wymagane opcje', heroTitle: 'Liban zaklęty', heroSub: 'w szklance.', heroDesc: 'Autentyczne libańskie koktajle z serkiem aszta, świeżymi owocami, orzechami i miodem. Zamów online, wybierz slot odbioru i odbierz prosto z naszego lokalu — bez kolejek.', preparingToast: 'Świetna wiadomość! Twoje zamówienie jest przygotowywane.', readyToast: 'Twoje zamówienie jest gotowe do odbioru! Do zobaczenia.',
    trackOrder: 'Śledź Zamówienie', trackTitle: 'Śledź swoje zamówienie', phoneLabel: 'Numer telefonu', checkStatus: 'Sprawdź status', notFound: 'Brak aktywnych zamówień dla tego numeru.', status_new: 'Przyjęte', status_preparing: 'W przygotowaniu', status_delivered: 'Odebrane',
    promoTitle: 'Specjalnie dla Ciebie!', promoSub: 'Pozwól sobie na coś słodkiego.', upsellTitle: 'Uzupełnij zamówienie', upsellDesc: 'Może dodasz te libańskie klasyki?', extras: 'Dodatki',
    capacityError: 'Przepraszamy, ten slot czasowy jest pełny. Wybierz inny.',
    callMessage: 'Nasz personel skontaktuje się z Tobą telefonicznie w celu potwierdzenia zamówienia.',
    generalError: 'Coś poszło nie tak. Spróbuj ponownie.',
    authError: 'Błąd uwierzytelniania. Odśwież stronę.'
  },
  AR: { 
    cart: 'عربة التسوق', yourCart: 'عربة التسوق الخاصة بك', emptyCart: 'عربة التسوق فارغة', pay: 'المجموع', checkout: 'الذهاب للدفع', add: 'أضف إلى السلة', size: 'الحجم', required: 'مطلوب', selectMissing: 'حدد الخيارات المطلوبة', heroTitle: 'لبنان مسحور', heroSub: 'في كأس.', heroDesc: 'مخفوق لبناني أصيل مع قشطة، فواكه طازجة، مكسرات وعسل. اطلب عبر الإنترنت، اختر وقت الاستلام، واستلم من متجرنا مباشرة — بدون طوابير.', preparingToast: 'أخبار رائعة! يتم تحضير طلبك الآن.', readyToast: 'طلبك جاهز للاستلام! نراك قريباً.',
    trackOrder: 'تتبع الطلب', trackTitle: 'تتبع طلبك', phoneLabel: 'رقم الهاتف', checkStatus: 'تحقق من الحالة', notFound: 'لم يتم العثور على طلبات نشطة لهذا الرقم.', status_new: 'تم الاستلام', status_preparing: 'قيد التحضير', status_delivered: 'تم التسليم',
    promoTitle: 'خصيصا لك!', promoSub: 'دلل نفسك بشيء حلو اليوم.', upsellTitle: 'أكمل طلبك', upsellDesc: 'ما رأيك في إضافة هذه الكلاسيكيات اللبنانية؟', extras: 'إضافات',
    capacityError: 'عذرًا، هذه الفترة الزمنية ممتلئة. يرجى اختيار واحدة أخرى.',
    callMessage: 'سيتصل بك موظفونا قريبًا لتأكيد طلبك.',
    generalError: 'حدث خطأ ما. يرجى المحاولة مرة أخرى.',
    authError: 'خطأ في المصادقة. يرجى تحديث الصفحة.'
  },
};

/* ============================================================
   MENU DATA
============================================================ */
const CATEGORIES = [
  { id: 'shakes', name: 'Lebanese Shakes', namePl: 'Koktajle', nameAr: 'مخفوق لبناني', icon: '🥤' },
  { id: 'specials', name: 'Lebanese Specials', namePl: 'Libańskie Speciały', nameAr: 'تخصصات لبنانية', icon: '🍯' },
  { id: 'juices', name: 'Fresh Juices', namePl: 'Świeże Soki', nameAr: 'عصائر طازجة', icon: '🍊' },
  { id: 'lody', name: 'Ice Cream', namePl: 'Lody', nameAr: 'آيس كريم', icon: '🍦' },
];

const MENU_ITEMS = {
  shakes: [
    { id: 'annaya', name: 'Annaya', tagline: 'Lebanese ashta & nuts', sizes: [{ label: '350g', price: 35.5 }] },
    { id: 'batrun', name: 'Batrun', tagline: 'Avocado, ashta, pineapple, mango, nuts, honey', sizes: [{ label: '300ml', price: 37.5 }, { label: '500ml', price: 43.5 }] },
    { id: 'balbek', name: 'Balbek', tagline: 'Strawberry, mango, ashta, pineapple, nuts, honey', sizes: [{ label: '300ml', price: 35.5 }, { label: '500ml', price: 39.5 }], popular: true },
  ],
  specials: [
    { id: 'ashta-fruits', name: 'Ashta with fruits', tagline: 'Lebanese ashta cheese with fresh seasonal fruits', sizes: [{ label: '500g', price: 92.5 }] },
    { id: 'katayef', name: 'Katayef', tagline: 'Traditional Lebanese crepes with nuts and honey', sizes: [{ label: '6 pcs', price: 36.5 }] },
  ],
  juices: [
    { id: 'orange-juice', name: 'Orange Juice', tagline: 'Freshly squeezed orange juice', sizes: [{ label: '300ml', price: 17.5 }] },
  ],
  lody: [
    { id: 'lody-artisan', name: 'Artisan Ice Cream', tagline: 'Traditional homemade ice cream', sizes: [{ label: 'Standard', price: 18.0 }] },
    { id: 'lody-dog', name: 'Ice Cream for Dogs', tagline: 'Safe & natural treat for your furry friend', sizes: [{ label: '1 Cup', price: 12.0 }] },
  ]
};

const EXTRAS_OPTIONS = [
  { id: 'ext_aszta', name: 'Extra Ashta', price: 7.5 },
  { id: 'ext_honey', name: 'Extra Honey', price: 4.0 },
  { id: 'ext_nuts', name: 'Extra Nuts', price: 5.5 },
  { id: 'ext_fruits', name: 'Extra Fruits', price: 6.0 },
];

const MODIFIERS_BY_CATEGORY = {
  dairy_drink: { 
    packaging: { name: 'Takeaway Packaging', required: true, multi: false, options: [{ id: 'takeaway_cup', name: 'Bio Cup (+1.50 PLN)', price: 1.5 }] }, 
    milk: { name: 'Milk Base', required: true, multi: false, options: [{ id: 'normal', name: 'Regular', price: 0 }, { id: 'lactose_free', name: 'Lactose-free', price: 0 }, { id: 'almond', name: 'Almond', price: 3 }, { id: 'vegan', name: 'Vegan', price: 3 }], default: 'normal' },
    extras: { name: 'Extras (Dodatki)', required: false, multi: true, options: EXTRAS_OPTIONS }
  },
  food_sweet: { 
    packaging: { name: 'Takeaway Packaging', required: true, multi: false, options: [{ id: 'takeaway_box', name: 'Eco Box (+2.50 PLN)', price: 2.5 }] },
    extras: { name: 'Extras (Dodatki)', required: false, multi: true, options: EXTRAS_OPTIONS }
  },
  none: {},
};

function getModifiersFor(categoryId) {
  if (['shakes', 'protein'].includes(categoryId)) return MODIFIERS_BY_CATEGORY.dairy_drink;
  if (['sweet_crepes', 'waffles', 'specials'].includes(categoryId)) return MODIFIERS_BY_CATEGORY.food_sweet;
  return MODIFIERS_BY_CATEGORY.none;
}

/* ============================================================
   FORMATTING & TIME ENGINE
============================================================ */
const MINUTES_PER_SLOT = 15; 

function roundUpToQuarter(date) { 
  const d = new Date(date); 
  const rem = d.getMinutes() % MINUTES_PER_SLOT; 
  if (rem !== 0 || d.getSeconds() !== 0 || d.getMilliseconds() !== 0) { 
    d.setMinutes(d.getMinutes() + (MINUTES_PER_SLOT - rem)); 
  } 
  d.setSeconds(0, 0); 
  return d; 
}

function generateTimeSlots(baseTime) { 
  const now = baseTime || new Date(); 
  const earliest = new Date(now.getTime() + 60 * 60000); 
  const firstSlot = roundUpToQuarter(earliest); 
  const slots = []; 
  let cursor = new Date(firstSlot); 
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  tomorrow.setHours(23, 59, 59, 999);

  while (slots.length < 64 && cursor <= tomorrow) { 
    const day = cursor.getDay(); 
    const isWeekendSpecial = (day === 5 || day === 6); 
    const OPEN_HOUR = 10;
    const CLOSE_HOUR = isWeekendSpecial ? 22 : 21; 
    const START_HOUR = OPEN_HOUR + 1; 
    const END_HOUR = CLOSE_HOUR - 1;  
    const h = cursor.getHours();
    const m = cursor.getMinutes();

    if (h < START_HOUR) {
      cursor.setHours(START_HOUR, 0, 0, 0);
    } else if (h > END_HOUR || (h === END_HOUR && m > 0)) {
      cursor.setDate(cursor.getDate() + 1);
      cursor.setHours(START_HOUR, 0, 0, 0);
    } else {
      if (cursor <= tomorrow) slots.push(new Date(cursor)); 
      cursor.setMinutes(cursor.getMinutes() + 15); 
    }
  } 
  return slots; 
}

function formatSlot(date) { 
  return date.toLocaleTimeString('en-US', { timeZone: 'Europe/Warsaw', hour: '2-digit', minute: '2-digit', hour12: false }); 
}

function formatFullSlot(date) { 
  const t = date.toLocaleTimeString('en-US', { timeZone: 'Europe/Warsaw', hour: '2-digit', minute: '2-digit', hour12: false }); 
  const today = new Date(); 
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1); 
  const isToday = date.toDateString() === today.toDateString(); 
  const isTomorrow = date.toDateString() === tomorrow.toDateString(); 
  const dayLabel = isToday ? 'Today' : isTomorrow ? 'Tomorrow' : date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }); 
  return `${dayLabel}, ${t}`; 
}

function slotKey(date) { return date.toISOString().slice(0, 16); }

/* ============================================================
   DB OPERATIONS
============================================================ */
async function appendOrder(order, lang) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) { alert(T[lang].authError); return null; }

  const { data, error } = await supabase.from('orders').insert([{
      customer_name: order.customer.name,
      customer_phone: order.customer.phone,
      pickup_time: order.pickupSlot,
      items: order.items,
      total_price: order.total,
      status: 'new',
      user_id: user.id 
    }]).select(); 
    
  if (error) {
    if (error.message.includes('Kapasite_Dolu')) return 'CAPACITY_FULL';
    alert(T[lang].generalError + " (" + error.message + ")");
    return null;
  }
  return data ? data[0] : null; 
}

function currency(n) { return `${n.toFixed(2)} PLN`; }
function uid() { return Math.random().toString(36).slice(2, 8).toUpperCase(); }
function lineTotal(line) { const base = line.unitPrice; const modSum = Object.values(line.mods || {}).flat().reduce((a, m) => a + (m.price || 0), 0); return (base + modSum) * line.qty; }

/* ============================================================
   COMPONENTS
============================================================ */
function Button({ children, variant = 'primary', size = 'md', className = '', ...rest }) { 
  const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-full transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed'; 
  const sizes = { sm: 'px-3 py-1.5 text-sm', md: 'px-5 py-2.5 text-sm', lg: 'px-6 py-3.5 text-base' }; 
  const style = variant === 'primary' ? { backgroundColor: BRAND.green, color: 'white' } : { borderColor: BRAND.line, color: BRAND.ink }; 
  return ( <button className={`${base} ${sizes[size]} ${className}`} style={style} {...rest}> {children} </button> ); 
}
function Badge({ children, tone = 'neutral' }) { 
  const tones = { neutral: { bg: BRAND.line, color: BRAND.ink }, gold: { bg: BRAND.gold, color: 'white' } }; 
  return ( <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full" style={{ backgroundColor: tones[tone].bg, color: tones[tone].color }}> {children} </span> ); 
}
function CedarMark({ className = '', color = BRAND.green, size = 80 }) { 
  return ( <svg viewBox="0 0 100 100" width={size} height={size} className={className} style={{ color }}> <g fill="currentColor"> <path d="M50 10 L62 30 L54 30 L66 50 L58 50 L70 72 L30 72 L42 50 L34 50 L46 30 L38 30 Z" /> <rect x="47" y="72" width="6" height="16" rx="1" /> </g> </svg> ); 
}

function MathCaptcha({ onVerify }) {
  const [a] = useState(Math.floor(Math.random() * 9) + 1);
  const [b] = useState(Math.floor(Math.random() * 9) + 1);
  const [answer, setAnswer] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  useEffect(() => { if (parseInt(answer) === a + b) { setIsSuccess(true); onVerify(true); } else { setIsSuccess(false); onVerify(false); } }, [answer, a, b, onVerify]);
  return (
    <div className={`rounded-xl p-4 border transition-colors flex items-center justify-between ${isSuccess ? 'bg-[#93b45b]/10 border-[#93b45b]/40' : 'bg-gray-50 border-gray-200'}`}>
      <div className="flex items-center gap-3">
        {isSuccess ? <ShieldCheck size={20} className="text-[#93b45b]" /> : <ShieldCheck size={20} className="text-gray-400" />}
        <div className="text-left">
          <div className="text-sm font-semibold text-gray-700">Anti-spam Verification</div>
          <div className="text-xs text-gray-500">How much is <strong className="text-gray-800 text-sm">{a} + {b}</strong>?</div>
        </div>
      </div>
      <input type="number" value={answer} onChange={e => setAnswer(e.target.value)} placeholder="=" className={`w-16 h-10 text-center text-lg font-semibold rounded-lg border outline-none transition-colors ${isSuccess ? 'border-[#93b45b] text-[#7a964a] bg-white' : 'border-gray-300 text-gray-800 focus:border-[#93b45b]'}`} />
    </div>
  );
}

function TopBar({ lang, setLang }) {
  return (
    <div className="text-[11px] font-semibold py-2 px-4 flex justify-between items-center z-40 relative border-b bg-black/40 backdrop-blur-sm text-[#F7F1E3] border-white/10">
      <div className="flex items-center gap-3 md:gap-5">
        <span className="cursor-pointer flex items-center gap-1.5 hover:text-white transition">🛵 Wolt</span>
        <span className="cursor-pointer flex items-center gap-1.5 hover:text-white transition">🛵 Bolt</span>
        <span className="cursor-pointer flex items-center gap-1.5 hover:text-white transition">🛵 UberEats</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-3 border-r pr-4 border-white/20">
          <span className="cursor-pointer hover:text-white transition">FB</span>
          <span className="cursor-pointer hover:text-white transition">IG</span>
          <span className="cursor-pointer hover:text-white transition" title="TikTok">TK</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="mr-1">🌐</span>
          {['EN', 'PL', 'AR'].map((l) => (
            <button key={l} className={`transition ${lang === l ? 'text-white underline' : 'opacity-70 hover:opacity-100'}`} onClick={() => setLang(l)}>{l}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ItemModal({ item, category, onClose, onAdd, lang }) { 
  const modifiers = useMemo(() => getModifiersFor(category.id), [category.id]); 
  const [sizeIdx, setSizeIdx] = useState(0); 
  const [qty, setQty] = useState(1); 
  const [mods, setMods] = useState(() => { 
    const init = {}; 
    Object.entries(modifiers).forEach(([key, group]) => { 
      if (group.required && !group.multi && group.default) { init[key] = [group.options.find((o) => o.id === group.default)]; } 
      else { init[key] = []; } 
    }); 
    return init; 
  }); 
  const size = item.sizes[sizeIdx]; 
  const modSum = Object.values(mods).flat().reduce((a, m) => a + (m.price || 0), 0); 
  const unitPrice = size.price + modSum; 
  const total = unitPrice * qty; 
  const missingRequired = Object.entries(modifiers).filter(([k, g]) => g.required && !g.multi && (!mods[k] || mods[k].length === 0)).map(([k]) => k); 
  const isValid = missingRequired.length === 0; 
  
  function toggleMod(groupKey, option) { 
    setMods((prev) => { 
      const group = modifiers[groupKey]; 
      const current = prev[groupKey] || []; 
      if (group.multi) { 
        const exists = current.find((o) => o.id === option.id); 
        return { ...prev, [groupKey]: exists ? current.filter((o) => o.id !== option.id) : [...current, option] }; 
      } else { 
        return { ...prev, [groupKey]: [option] }; 
      } 
    }); 
  } 
  
  function handleAdd() { 
    if (!isValid) return; 
    onAdd({ lineId: uid(), itemId: item.id, name: item.name, categoryId: category.id, sizeLabel: size.label, unitPrice: size.price, mods, qty }); 
  } 
  
  return ( 
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60"> 
      <div className="absolute inset-0" onClick={onClose} /> 
      <div className="relative w-full md:max-w-lg md:mx-4 bg-white md:rounded-3xl rounded-t-3xl max-h-[92vh] flex flex-col anim-slide overflow-hidden"> 
        <div className="relative p-6 pb-4 bg-[#F7F1E3]"> 
          <button onClick={onClose} className={`absolute top-4 ${lang === 'AR' ? 'left-4' : 'right-4'} w-8 h-8 rounded-full flex items-center justify-center bg-white text-gray-800`}><X size={16} /></button> 
          <div className="mt-8 text-gray-800"> 
            <h2 className="font-display font-semibold text-2xl mb-1">{item.name}</h2> 
            <p className="text-sm text-gray-500">{item.tagline}</p> 
          </div> 
        </div> 
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 text-gray-800"> 
          {item.sizes.length > 1 && ( 
            <section> 
              <div className="flex items-baseline justify-between mb-2.5"> 
                <h4 className="font-semibold text-sm">{T[lang].size}</h4> 
                <span className="text-[10px] uppercase tracking-wide font-bold text-red-500">{T[lang].required}</span> 
              </div> 
              <div className="grid grid-cols-2 gap-2"> 
                {item.sizes.map((s, i) => ( 
                  <button key={i} onClick={() => setSizeIdx(i)} className={`rounded-xl border px-4 py-3 text-left transition ${i === sizeIdx ? 'border-[#93b45b] bg-[#93b45b]/10 text-[#7a964a]' : 'border-gray-200'}`}>
                    <div className="font-semibold">{s.label}</div>
                    <div className="text-sm opacity-80">{currency(s.price)}</div>
                  </button> 
                ))} 
              </div> 
            </section> 
          )} 
          {Object.entries(modifiers).map(([groupKey, group]) => ( 
            <section key={groupKey}> 
              <div className="flex items-baseline justify-between mb-2.5"> 
                <h4 className="font-semibold text-sm">{groupKey === 'extras' ? T[lang].extras || group.name : group.name}</h4> 
                {group.required && <span className="text-[10px] uppercase tracking-wide font-bold text-red-500">{T[lang].required}</span>} 
              </div> 
              <div className="space-y-2"> 
                {group.options.map((opt) => { 
                  const selected = (mods[groupKey] || []).some((m) => m.id === opt.id); 
                  return ( 
                    <button key={opt.id} onClick={() => toggleMod(groupKey, opt)} className={`w-full flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors ${selected ? 'border-[#93b45b] bg-[#93b45b]/5' : 'border-gray-200'}`}> 
                      <div className="flex items-center gap-3"> 
                        <span className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${selected ? 'bg-[#93b45b] border-[#93b45b]' : 'border-gray-300'}`}> 
                          {selected && <Check size={14} className="text-white" />} 
                        </span> 
                        <span className="text-sm font-medium">{opt.name}</span> 
                      </div> 
                      <span className="text-sm font-semibold text-[#7a964a]">{opt.price > 0 ? `+ ${currency(opt.price)}` : ''}</span> 
                    </button> 
                  ); 
                })} 
              </div> 
            </section> 
          ))} 
        </div> 
        <div className="border-t p-4 flex items-center justify-between gap-3 bg-[#F7F1E3] border-gray-200"> 
          <div className="flex items-center rounded-full bg-white border border-gray-200"> 
            <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-9 h-9 flex items-center justify-center text-gray-800 disabled:opacity-30" disabled={qty <= 1}><Minus size={15} /></button> 
            <span className="w-6 text-center text-sm font-semibold text-gray-800">{qty}</span> 
            <button onClick={() => setQty(qty + 1)} className="w-9 h-9 flex items-center justify-center text-gray-800"><Plus size={15} /></button> 
          </div> 
          <Button size="lg" onClick={handleAdd} disabled={!isValid} className="flex-1">{isValid ? `${T[lang].add} · ${currency(total)}` : T[lang].selectMissing}</Button> 
        </div> 
      </div> 
    </div> 
  ); 
}

function CartDrawer({ open, cart, onClose, onRemove, onUpdateQty, onCheckout, lang }) { 
  const subtotal = cart.reduce((a, l) => a + lineTotal(l), 0); 
  if (!open) return null; 
  
  return ( 
    <div className="fixed inset-0 z-40 flex justify-end bg-black/50"> 
      <div className="absolute inset-0" onClick={onClose} /> 
      <div className="relative w-full max-w-md bg-white h-full flex flex-col shadow-2xl anim-slide text-gray-800"> 
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-gray-50"> 
          <div className="font-display font-semibold text-xl">{T[lang].yourCart}</div> 
          <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center bg-white border shadow-sm"><X size={16} /></button> 
        </div> 
        <div className="flex-1 overflow-y-auto p-5 space-y-3"> 
          {cart.length === 0 && <div className="text-center py-16 font-display text-lg text-gray-500">{T[lang].emptyCart}</div>} 
          {cart.map((line) => ( 
            <div key={line.lineId} className="rounded-xl p-3 border border-gray-200 bg-white"> 
              <div className="flex justify-between items-start mb-1.5"> 
                <div className="min-w-0 flex-1 pr-2"> 
                  <div className="font-semibold text-sm truncate">{line.name}</div> 
                  <div className="text-xs mt-0.5 text-gray-400">
                    {line.sizeLabel}
                    {Object.values(line.mods || {}).flat().map(m => ` • ${m.name}`).join('')}
                  </div> 
                </div> 
                <button onClick={() => onRemove(line.lineId)} className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-red-400"><X size={14} /></button> 
              </div> 
              <div className="flex items-center justify-between mt-2"> 
                <div className="flex items-center rounded-full bg-gray-100"> 
                  <button onClick={() => onUpdateQty(line.lineId, line.qty - 1)} className="w-8 h-8 flex items-center justify-center hover:text-[#93b45b]"><Minus size={13} /></button> 
                  <span className="w-6 text-center text-sm font-semibold">{line.qty}</span> 
                  <button onClick={() => onUpdateQty(line.lineId, line.qty + 1)} className="w-8 h-8 flex items-center justify-center hover:text-[#93b45b]"><Plus size={13} /></button> 
                </div> 
                <div className="font-display font-semibold text-[#7a964a]">{currency(lineTotal(line))}</div> 
              </div> 
            </div> 
          ))} 
        </div> 
        {cart.length > 0 && ( 
          <div className="border-t p-5 space-y-4 bg-gray-50 border-gray-200"> 
            <div className="flex justify-between items-baseline"> 
              <span className="font-display text-lg">{T[lang].pay}</span> 
              <span className="font-display text-2xl font-semibold text-[#93b45b]">{currency(subtotal)}</span> 
            </div> 
            <Button size="lg" className="w-full" onClick={onCheckout}>{T[lang].checkout} <ChevronRight size={18} /></Button> 
          </div> 
        )} 
      </div> 
    </div> 
  ); 
}

function CheckoutModal({ cart, onClose, onPlaced, lang, onAddUpsell, serverTime }) { 
  const [step, setStep] = useState(1); 
  const [name, setName] = useState(''); 
  const [phone, setPhone] = useState(''); 
  const [chosenSlot, setChosenSlot] = useState(null); 
  const [isHuman, setIsHuman] = useState(false); 
  const [submitting, setSubmitting] = useState(false); 
  const subtotal = cart.reduce((a, l) => a + lineTotal(l), 0); 
  const slots = useMemo(() => generateTimeSlots(serverTime), [serverTime]); 
  const canProceedFromStep1 = name.trim().length >= 2 && phone.trim().length >= 6; 
  
  const hasAshta = cart.some(item => item.itemId === 'ashta-fruits');
  const hasKatayef = cart.some(item => item.itemId === 'katayef');
  const showUpsell = !hasAshta || !hasKatayef;
  
  async function placeOrder() { 
    if (!chosenSlot || !canProceedFromStep1 || !isHuman) return; 
    setSubmitting(true); 
    
    const order = { 
      customer: { name: name.trim(), phone: phone.trim() }, 
      pickupSlot: chosenSlot, 
      pickupSlotDisplay: formatFullSlot(new Date(chosenSlot)), 
      items: cart, 
      total: subtotal 
    }; 
    
    const insertedOrder = await appendOrder(order, lang); 
    setSubmitting(false); 
    
    if (insertedOrder === 'CAPACITY_FULL') {
      alert(T[lang].capacityError);
      setStep(2); 
    } else if (insertedOrder) {
      onPlaced(insertedOrder); 
    } 
  } 
  
  return ( 
    <div className="fixed inset-0 z-50 flex items-stretch md:items-center justify-center bg-black/70"> 
      <div className="absolute inset-0" onClick={onClose} /> 
      <div className="relative w-full md:max-w-2xl md:mx-4 bg-white md:rounded-3xl flex flex-col max-h-full md:max-h-[92vh] overflow-hidden text-gray-800"> 
        <div className="flex items-center gap-3 px-5 py-4 border-b bg-gray-50"> 
          <button onClick={step === 1 ? onClose : () => setStep(step - 1)} className="w-9 h-9 rounded-full flex items-center justify-center bg-white border shadow-sm hover:bg-gray-50">
            {step === 1 ? <X size={16} /> : <ArrowLeft size={16} />}
          </button> 
          <div className="flex-1 font-display font-semibold"> Checkout - Step {step} </div> 
        </div> 
        <div className="flex-1 overflow-y-auto p-5 md:p-6"> 
        
        {step === 1 && ( 
          <div className="space-y-6 max-w-md mx-auto"> 
            {showUpsell && (
              <div className="bg-[#93b45b]/10 p-4 rounded-2xl border border-[#93b45b]/30">
                <div className="font-bold text-[#7a964a] mb-1">{T[lang].upsellTitle}</div>
                <div className="text-xs text-gray-600 mb-3">{T[lang].upsellDesc}</div>
                <div className="flex gap-2">
                  {!hasAshta && <button onClick={() => onAddUpsell(MENU_ITEMS.specials[0], 'specials')} className="flex-1 bg-white p-2 rounded-xl border border-[#93b45b]/40 text-sm font-semibold hover:border-[#93b45b] text-[#7a964a] transition">Ashta 🍯</button>}
                  {!hasKatayef && <button onClick={() => onAddUpsell(MENU_ITEMS.specials[1], 'specials')} className="flex-1 bg-white p-2 rounded-xl border border-[#93b45b]/40 text-sm font-semibold hover:border-[#93b45b] text-[#7a964a] transition">Katayef 🥞</button>}
                </div>
              </div>
            )}
            <div><label className="block text-xs uppercase font-semibold text-gray-500 mb-1">Name</label><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your Name" className="w-full border p-3 rounded-xl outline-none focus:border-[#93b45b]" /></div> 
            <div><label className="block text-xs uppercase font-semibold text-gray-500 mb-1">Phone</label><input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+48 ..." type="tel" className="w-full border p-3 rounded-xl outline-none focus:border-[#93b45b]" /></div> 
            <Button size="lg" className="w-full" disabled={!canProceedFromStep1} onClick={() => setStep(2)}>Next <ChevronRight size={18} /></Button> 
          </div> 
        )} 
        
        {step === 2 && ( 
          <div className="space-y-6"> 
            {['Today', 'Tomorrow'].map((dayGroup) => {
              const daySlots = slots.filter(s => formatFullSlot(s).includes(dayGroup));
              if (daySlots.length === 0) return null;
              
              return (
                <div key={dayGroup} className="anim-fadeup">
                  <h4 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-widest border-b border-gray-100 pb-2">
                    {dayGroup === 'Today' ? 'Today / Dziś / اليوم' : 'Tomorrow / Jutro / غداً'}
                  </h4>
                  <div className="grid grid-cols-3 gap-3"> 
                    {daySlots.map((slot) => { 
                      const key = slotKey(slot); 
                      const isSelected = chosenSlot === key; 
                      return ( 
                        <button key={key} onClick={() => setChosenSlot(key)} className={`py-3 rounded-xl text-center border font-semibold text-sm transition-colors ${isSelected ? 'bg-[#93b45b] text-white border-[#93b45b]' : 'bg-white hover:border-gray-300'}`}>
                          {formatSlot(slot)}
                        </button> 
                      ); 
                    })} 
                  </div>
                </div>
              );
            })}
            <Button size="lg" className="w-full mt-6" disabled={!chosenSlot} onClick={() => setStep(3)}>Next <ChevronRight size={20} /></Button> 
          </div> 
        )} 
        
        {step === 3 && ( 
          <div className="space-y-6 max-w-md mx-auto text-center"> 
            <div className="p-5 bg-gray-50 rounded-2xl border"> 
              <div className="text-sm text-gray-500 mb-1">Pickup Time:</div> 
              <div className="font-display text-xl font-bold text-[#7a964a]">{chosenSlot ? formatFullSlot(new Date(chosenSlot)) : '-'}</div> 
            </div> 
            <MathCaptcha onVerify={setIsHuman} /> 
            <Button size="lg" className="w-full" onClick={placeOrder} disabled={submitting || !isHuman}>{submitting ? 'Submitting…' : 'Confirm & Place Order'}</Button> 
          </div> 
        )} 
        </div> 
      </div> 
    </div> 
  ); 
}

function OrderConfirmation({ order, onContinue, lang }) { 
  return ( 
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"> 
      <div className="bg-white rounded-3xl max-w-md w-full p-8 text-center anim-fadeup text-gray-800"> 
        <div className="w-16 h-16 rounded-full bg-[#93b45b]/20 flex items-center justify-center mx-auto mb-4 text-[#93b45b]"><Check size={32}/></div>
        <h2 className="font-display text-2xl font-semibold mb-2">{T[lang].status_new}</h2> 
        <div className="text-gray-500 mb-4">Pickup: <strong>{formatFullSlot(new Date(order.pickup_time))}</strong></div> 
        <div className="p-4 bg-[#93b45b]/10 rounded-2xl border border-[#93b45b]/30 text-sm font-medium text-[#7a964a] mb-6">
          <Phone size={14} className="inline-block mr-2" />
          {T[lang].callMessage}
        </div>
        <Button size="lg" className="w-full" onClick={onContinue}>Close</Button> 
      </div> 
    </div> 
  ); 
}

function TrackOrderModal({ onClose, lang }) {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  async function handleTrack(e) {
    e.preventDefault();
    if(phone.length < 5) return;
    setLoading(true); setError(''); setResults(null);
    const { data, error: err } = await supabase.rpc('get_order_by_phone', { search_phone: phone.trim() });
    setLoading(false);
    if (err) setError(T[lang].generalError);
    else if (!data || data.length === 0) setError(T[lang].notFound);
    else setResults(data);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
       <div className="bg-white rounded-3xl w-full max-w-md p-6 relative anim-slide shadow-2xl text-gray-800">
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition">
             <X size={16} />
          </button>
          <div className="mb-6 mt-2">
             <h2 className="font-display text-2xl font-semibold mb-1 flex items-center gap-2">
                <Search className="text-[#93b45b]" size={24} /> {T[lang].trackTitle}
             </h2>
             <p className="text-sm text-gray-500">Enter the phone number used during checkout.</p>
          </div>
          <form onSubmit={handleTrack} className="space-y-4 mb-6">
             <div>
                <label className="block text-xs uppercase font-semibold text-gray-500 mb-1">{T[lang].phoneLabel}</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full border p-3 rounded-xl outline-none focus:border-[#93b45b]" placeholder="+48..." required />
             </div>
             {error && <div className="text-red-500 text-sm font-semibold">{error}</div>}
             <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Searching...' : T[lang].checkStatus} <ChevronRight size={18} />
             </Button>
          </form>
          {results && (
             <div className="space-y-3 border-t pt-5 mt-5">
                {results.map(order => {
                  const isDelivered = order.status === 'delivered';
                  const isPreparing = order.status === 'preparing';
                  return (
                   <div key={order.id} className={`p-4 rounded-xl border ${isPreparing ? 'border-blue-200 bg-blue-50' : isDelivered ? 'border-gray-200 bg-gray-50' : 'border-[#93b45b]/30 bg-[#93b45b]/10'}`}>
                      <div className="flex justify-between items-start mb-4 border-b pb-3 border-black/5">
                         <div className="text-xs text-gray-500 font-semibold">{new Date(order.created_at).toLocaleDateString()}</div>
                         <div className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${isPreparing ? 'bg-blue-200 text-blue-800' : isDelivered ? 'bg-gray-200 text-gray-600' : 'bg-[#93b45b] text-white'}`}>
                            {T[lang][`status_${order.status}`] || order.status}
                         </div>
                      </div>
                      <div className="space-y-2 mb-4">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="text-sm">
                            <div className="font-semibold text-gray-800 flex items-start gap-1.5"><span className="text-gray-500">{item.qty}x</span> {item.name}</div>
                            <div className="text-xs text-gray-500 ml-5 mt-0.5">{item.sizeLabel}{item.mods && Object.values(item.mods).flat().map(m => ` · ${m.name}`).join('')}</div>
                          </div>
                        ))}
                      </div>
                      <div className="text-xs font-bold flex items-center gap-1 pt-3 border-t border-black/5 text-[#7a964a]">
                         <Clock size={12} /> Pickup: {new Date(order.pickup_time).toLocaleTimeString('en-US', { timeZone: 'Europe/Warsaw', hour: '2-digit', minute:'2-digit', hour12: false })}
                      </div>
                   </div>
                  )
                })}
             </div>
          )}
       </div>
    </div>
  )
}

const PROMO_LIST = [
  { ...MENU_ITEMS.lody[0], categoryId: 'lody', icon: '🍦' },
  { ...MENU_ITEMS.lody[1], categoryId: 'lody', icon: '🐾' },
  { ...MENU_ITEMS.specials[1], categoryId: 'specials', icon: '🥞' },
  { ...MENU_ITEMS.specials[0], categoryId: 'specials', icon: '🍯' }
];

function WelcomePromoModal({ onClose, onAdd, lang }) {
  const [item] = useState(() => PROMO_LIST[Math.floor(Math.random() * PROMO_LIST.length)]);
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-sm p-8 relative anim-fadeup text-center shadow-2xl text-gray-800">
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 text-gray-400 hover:text-gray-800 transition">
          <X size={16} />
        </button>
        <div className="mb-4 inline-flex p-4 rounded-full bg-[#93b45b]/10 text-4xl animate-bounce border-4 border-[#93b45b]/20">
          {item.icon}
        </div>
        <h2 className="font-display text-2xl font-bold mb-1">{T[lang].promoTitle}</h2>
        <p className="text-gray-500 text-sm mb-6">{T[lang].promoSub}</p>
        <div className="bg-gray-50 p-4 rounded-2xl mb-6 border border-gray-100">
           <h3 className="font-bold text-lg">{item.name}</h3>
           <p className="text-xs text-gray-500 mt-1">{item.tagline}</p>
           <div className="mt-2 font-display text-xl font-bold text-[#7a964a]">{item.sizes[0].price.toFixed(2)} PLN</div>
        </div>
        <Button size="lg" className="w-full" onClick={() => { onAdd(item); onClose(); }}>
          <Plus size={18} /> {T[lang].add}
        </Button>
      </div>
    </div>
  );
}

/* ============================================================
   MAIN PAGE
============================================================ */
export default function CustomerPage() {
  const [lang, setLang] = useState('EN');
  const [activeCat, setActiveCat] = useState('shakes');
  const [openItem, setOpenItem] = useState(null);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [trackOpen, setTrackOpen] = useState(false); 
  const [promoOpen, setPromoOpen] = useState(false); 
  const [confirmed, setConfirmed] = useState(null);
  const [serverTime, setServerTime] = useState(null);
  const activeOrdersRef = useRef([]); 
  const [toastStatus, setToastStatus] = useState(null); 
  const sectionRefs = useRef({});
  const videoRef = useRef(null);

  useEffect(() => {
    const initApp = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) await supabase.auth.signInAnonymously();
      const { data: sTime } = await supabase.rpc('get_server_time');
      if (sTime) setServerTime(new Date(sTime));
      else setServerTime(new Date());
    };
    initApp();
    const promoTimer = setTimeout(() => setPromoOpen(true), 2500);
    return () => clearTimeout(promoTimer);
  }, []);

  // MÜŞTERİ CANLI BİLDİRİM
  useEffect(() => {
    const channel = supabase.channel('customer-orders')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, 
        (payload) => {
          if (activeOrdersRef.current.includes(payload.new.id)) {
            if (payload.new.status === 'preparing') setToastStatus('preparing');
            else if (payload.new.status === 'delivered') setToastStatus('delivered');
            setTimeout(() => setToastStatus(null), 6000);
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); }
  }, []);

  // KURŞUN GEÇİRMEZ VİDEO AUTOPLAY BAŞLATICISI
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.defaultMuted = true;
      videoRef.current.play().catch(e => console.log("Otomatik oynatma engellendi:", e));
    }
  }, []);

  function pickCategory(id) { 
    setActiveCat(id); 
    const el = sectionRefs.current[id]; 
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top - 100, behavior: 'smooth' }); 
  }
  
  function addToCart(line) { setCart((c) => [...c, line]); setOpenItem(null); setCartOpen(true); }
  function addQuickItem(item, categoryId) {
    addToCart({ lineId: uid(), itemId: item.id, name: item.name, categoryId: categoryId, sizeLabel: item.sizes[0].label, unitPrice: item.sizes[0].price, mods: {}, qty: 1 });
  }
  function removeFromCart(lineId) { setCart((c) => c.filter((l) => l.lineId !== lineId)); }
  function updateQty(lineId, qty) { if (qty < 1) return removeFromCart(lineId); setCart((c) => c.map((l) => (l.lineId === lineId ? { ...l, qty } : l))); }
  
  const cartCount = cart.reduce((a, l) => a + l.qty, 0);

  return (
    <div dir={lang === 'AR' ? 'rtl' : 'ltr'} className="font-body">
      <style>{STYLE_TAG}</style>

      {toastStatus && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 anim-fadeup w-[90%] max-w-md">
          <div className="bg-white text-gray-900 p-4 rounded-2xl shadow-2xl border-2 flex items-center gap-4" style={{ borderColor: toastStatus === 'preparing' ? '#3B82F6' : BRAND.green }}>
            <span className="text-3xl bg-gray-50 p-2 rounded-full">
              {toastStatus === 'preparing' ? '👨‍🍳' : '✅'}
            </span>
            <div className="font-semibold text-sm">
              {toastStatus === 'preparing' ? T[lang].preparingToast : T[lang].readyToast}
            </div>
            <button onClick={() => setToastStatus(null)} className="ml-auto text-gray-400 hover:text-gray-800">
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {promoOpen && <WelcomePromoModal lang={lang} onClose={() => setPromoOpen(false)} onAdd={(item) => addQuickItem(item, item.categoryId)} />}

      {/* PARALLAX HERO VİDEO ARKA PLAN */}
      <div className="video-bg-container">
        <video
          ref={videoRef}
          className="video-bg"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
        >
          <source
            src="https://wixiouwhfthwahlqwatb.supabase.co/storage/v1/object/public/background/background.mp4"
            type="video/mp4"
          />
        </video>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <TopBar lang={lang} setLang={setLang} />
        
        <header className="sticky top-0 z-30 bg-black/30 backdrop-blur-md text-white px-4 py-3 shadow-sm border-b border-white/10">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CedarMark size={32} color="#E6C472" />
              <div>
                <div className="font-display font-bold text-xl leading-none">Liban Cafe</div>
                <div className="text-[10px] tracking-widest opacity-80 uppercase">Warsaw · Gagarina 31</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setTrackOpen(true)} className="hidden sm:flex relative items-center gap-2 px-3 py-2 rounded-full text-sm font-medium border border-white/30 hover:bg-white/20 transition">
                <Search size={16} /> {T[lang].trackOrder}
              </button>
              <button onClick={() => setCartOpen(true)} className="bg-[#93b45b] text-white px-4 py-2 rounded-full flex items-center gap-2 font-bold text-sm hover:opacity-90 transition shadow-lg">
                <ShoppingBag size={18}/>
                <span className="hidden sm:inline">{T[lang].cart}</span>
                {cart.length > 0 && <span className="bg-white text-[#7a964a] w-5 h-5 rounded-full flex items-center justify-center text-[11px]">{cart.length}</span>}
              </button>
            </div>
          </div>
        </header>

        <section className="px-4 flex flex-col justify-center items-center text-center max-w-4xl mx-auto text-white min-h-[75vh] md:min-h-[85vh]">
          <h1 className="font-display text-5xl md:text-7xl font-bold mb-6 drop-shadow-2xl">{T[lang].heroTitle} <br/><span className="text-[#E6C472] italic font-normal drop-shadow-lg">{T[lang].heroSub}</span></h1>
          <p className="text-white/95 text-base md:text-lg leading-relaxed drop-shadow-md max-w-2xl mx-auto">{T[lang].heroDesc}</p>
        </section>

        <div className="flex-1 bg-[#FBF9F2] rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.3)] pb-20">
          <nav className="sticky top-[60px] z-20 bg-[#FBF9F2]/90 backdrop-blur-md border-b border-gray-200 rounded-t-3xl pt-4">
            <div className="max-w-6xl mx-auto px-4 py-3 flex overflow-x-auto gap-2 scroll-hide">
              {CATEGORIES.map(c => (
                <button key={c.id} onClick={() => pickCategory(c.id)} className={`shrink-0 px-5 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition ${activeCat === c.id ? 'bg-[#93b45b] text-white shadow-md' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                  <span>{c.icon}</span> {lang === 'EN' ? c.name : lang === 'PL' ? c.namePl : c.nameAr}
                </button>
              ))}
            </div>
          </nav>

          <main className="max-w-6xl mx-auto px-4 py-10 space-y-12">
            {CATEGORIES.map(c => {
              const items = MENU_ITEMS[c.id] || [];
              if(items.length === 0) return null;
              return (
                <section key={c.id} ref={el => sectionRefs.current[c.id] = el}>
                  <h2 className="font-display text-3xl font-bold mb-6 flex items-center gap-3 text-[#16261B]">
                    <span className="text-2xl">{c.icon}</span> {lang === 'EN' ? c.name : lang === 'PL' ? c.namePl : c.nameAr}
                  </h2>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map(it => (
                      <button key={it.id} onClick={() => setOpenItem({ item: it, category: c })} className="bg-white p-4 rounded-3xl border border-gray-100 text-left hover:shadow-xl transition-all group relative overflow-hidden text-[#16261B]">
                        <div className="flex justify-between items-start mb-2">
                           <h3 className="font-display font-bold text-xl">{it.name}</h3>
                           {it.popular && <Badge tone="gold">Popular</Badge>}
                        </div>
                        <p className="text-xs text-gray-500 line-clamp-2 mb-4">{it.tagline}</p>
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-lg text-[#7a964a]">{currency(it.sizes[0].price)}</span>
                          <span className="w-10 h-10 rounded-full bg-[#93b45b]/10 flex items-center justify-center text-[#93b45b] group-hover:bg-[#93b45b] group-hover:text-white transition"><Plus size={20}/></span>
                        </div>
                      </button>
                    ))}
                  </div>
                </section>
              )
            })}
          </main>
        </div>
      </div>

      {openItem && ( <ItemModal item={openItem.item} category={openItem.category} onClose={() => setOpenItem(null)} onAdd={addToCart} lang={lang} /> )}
      <CartDrawer open={cartOpen} cart={cart} onClose={() => setCartOpen(false)} onRemove={removeFromCart} onUpdateQty={updateQty} onCheckout={() => { setCartOpen(false); setCheckoutOpen(true); }} lang={lang} />
      {trackOpen && ( <TrackOrderModal onClose={() => setTrackOpen(false)} lang={lang} /> )}
      {checkoutOpen && ( 
        <CheckoutModal 
          cart={cart} 
          lang={lang}
          serverTime={serverTime}
          onClose={() => setCheckoutOpen(false)} 
          onAddUpsell={(item, catId) => addQuickItem(item, catId)}
          onPlaced={(order) => { 
            setCheckoutOpen(false); 
            setCart([]); 
            setConfirmed(order);
            if (order.id) activeOrdersRef.current.push(order.id);
          }} 
        /> 
      )}
      {confirmed && ( <OrderConfirmation order={confirmed} lang={lang} onContinue={() => setConfirmed(null)} /> )}
    </div>
  );
}