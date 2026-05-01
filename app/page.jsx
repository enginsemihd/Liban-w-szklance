"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ShoppingBag, Plus, Minus, X, Check, Phone, User,
  ChevronRight, ArrowLeft, Store, Flame, ShieldCheck, Bell, Search, Clock, Package, MapPin, Mail, Globe, Quote
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
  line: '#E4DCC6', bg: '#FBF9F2', red: '#B4412A',
};

const STYLE_TAG = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;0,9..144,800;1,9..144,500&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
*,*::before,*::after{ box-sizing:border-box; }
html,body{ margin:0; padding:0; background:${BRAND.bg}; color:${BRAND.ink}; font-family:'Plus Jakarta Sans',system-ui,sans-serif; -webkit-font-smoothing:antialiased; scroll-behavior: smooth; }
.font-display{ font-family:'Fraunces',Georgia,serif; font-optical-sizing:auto; letter-spacing:-0.01em; }
.font-body{ font-family:'Plus Jakarta Sans',system-ui,sans-serif; }
.scroll-hide::-webkit-scrollbar{ display:none; }
.scroll-hide{ -ms-overflow-style:none; scrollbar-width:none; }
button:focus-visible{ outline: 2px solid ${BRAND.gold}; outline-offset: 2px; border-radius: 6px; }

.video-bg-container {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100vh;
  z-index: 0; overflow: hidden; background-color: #000;
}
.video-bg { width: 100%; height: 100%; object-fit: cover; filter: brightness(0.5) contrast(1.1); }

@keyframes fadeUp{ from{ opacity:0; transform:translateY(12px) } to{ opacity:1; transform:translateY(0) } }
.anim-fadeup{ animation: fadeUp 0.35s ease-out both; }
@keyframes slideIn{ from{ transform:translateY(100%) } to{ transform:translateY(0) } }
.anim-slide{ animation: slideIn 0.3s cubic-bezier(.2,.9,.3,1.2) both; }

/* Lübnan Bayrağı (CSS ile) */
.lebanese-flag {
  width: 36px; height: 24px;
  background: white; border-top: 6px solid #ed1c24; border-bottom: 6px solid #ed1c24;
  position: relative; display: flex; align-items: center; justify-content: center;
  border-radius: 2px; box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}
.cedar-tree {
  color: #00a651; width: 14px; height: 14px;
}
`;

const T = {
  EN: { 
    navMenu: 'Menu', navAbout: 'About Us', navContact: 'Contact',
    cart: 'Cart', yourCart: 'Your Cart', emptyCart: 'Your cart is empty', pay: 'Total to pay', checkout: 'Proceed to Checkout', add: 'Add to Cart', size: 'Size', required: 'Required', selectMissing: 'Select required options', 
    heroTitle: 'Liban w Szklance', heroSub: 'Authentic Taste.', heroDesc: 'Home made cocktails and food. Lebanese cocktails with ashta, fresh fruits, nuts, and honey. Order online, choose your pickup slot, and collect straight from our store — skip the line.', 
    slogan: 'Come as a guest, leave as a friend.',
    readyToast: 'Your order is ready for pickup! See you soon.', preparingToast: 'Great news! Your order is now being prepared.',
    trackOrder: 'Track Order', trackTitle: 'Track Your Order', phoneLabel: 'Phone Number', checkStatus: 'Check Status', notFound: 'No recent orders found for this number.', 
    status_new: 'Order Received', status_preparing: 'Preparing', status_delivered: 'Gotowy (Ready)',
    promoTitle: 'Specially for You!', promoSub: 'Treat yourself to something sweet today.', upsellTitle: 'Complete your order', upsellDesc: "Haven't tried our authentic Lebanese desserts yet?", extras: 'Dodatki (Extras)', bag: 'Takeaway Bag',
    capacityError: 'Sorry, this time slot is full. Please choose another one.',
    callMessage: 'Our staff will call you shortly to confirm your order.', generalError: 'Something went wrong. Please try again.', authError: 'Authentication error. Please refresh the page.',
    address: 'Address', openingHours: 'Opening Hours', followUs: 'Follow Us',
    aboutP1: 'Liban w Szklance is really just our love letter to Lebanese culture, its vibrant flavors, and the kind of hospitality that makes you feel instantly at home. We grew up surrounded by family traditions and the unbeatable taste of home made cocktails, so we decided to build a cozy, modern space to share that authentic experience with you.',
    aboutP2: 'Everything we make comes down to one simple rule: quality matters. We handpick our ingredients and blend every single cocktail with care, making sure the natural flavors and freshness truly shine. There are no shortcuts here—just honest, cherished recipes straight from our Lebanese roots.',
    aboutP3: 'We\'ve always believed that Liban w Szklance shouldn\'t just be a shop. We want it to feel like stepping into a friend\'s home. Every glass is poured with love, and every person walking through our doors is welcomed as a guest. Whether you\'re grabbing a quick cocktail on the go or tasting our flavors for the first time, we hope it brightens your day.',
    aboutP4: 'We are incredibly proud of our heritage, blending old traditions with a modern twist. Ultimately, our goal is pretty simple: we just want to hand you a little piece of Lebanon, full of freshness and quality, right in a glass.',
    q1: '"Lebanon is a homeland that God has chosen for Himself."', q2: '"You have your Lebanon and I have my Lebanon."', q3: '"My Lebanon is a small nation, but it is a great nation. My Lebanon is a bundle of aromas, a cluster of memories, and a symphony of dreams."'
  },
  PL: { 
    navMenu: 'Menu', navAbout: 'O Nas', navContact: 'Kontakt',
    cart: 'Koszyk', yourCart: 'Twój koszyk', emptyCart: 'Twój koszyk jest pusty', pay: 'Do zapłaty', checkout: 'Przejdź do odbioru', add: 'Dodaj do koszyka', size: 'Rozmiar', required: 'Wymagane', selectMissing: 'Wybierz wymagane opcje', 
    heroTitle: 'Liban w Szklance', heroSub: 'Autentyczny Smak.', heroDesc: 'Domowe koktajle i jedzenie. Libańskie koktajle z serkiem aszta, świeżymi owocami, orzechami i miodem. Zamów online, wybierz slot odbioru i odbierz prosto z naszego lokalu — bez kolejek.', 
    slogan: 'Przyjdź jako gość, wyjdź jako przyjaciel.',
    readyToast: 'Twoje zamówienie jest gotowe do odbioru! Do zobaczenia.', preparingToast: 'Świetna wiadomość! Twoje zamówienie jest przygotowywane.',
    trackOrder: 'Śledź Zamówienie', trackTitle: 'Śledź swoje zamówienie', phoneLabel: 'Numer telefonu', checkStatus: 'Sprawdź status', notFound: 'Brak aktywnych zamówień dla tego numeru.', 
    status_new: 'Przyjęte', status_preparing: 'W przygotowaniu', status_delivered: 'Gotowy',
    promoTitle: 'Specjalnie dla Ciebie!', promoSub: 'Pozwól sobie na coś słodkiego.', upsellTitle: 'Uzupełnij zamówienie', upsellDesc: 'Może dodasz te libańskie klasyki?', extras: 'Dodatki', bag: 'Torba na wynos',
    capacityError: 'Przepraszamy, ten slot czasowy jest pełny. Wybierz inny.',
    callMessage: 'Nasz personel skontaktuje się z Tobą telefonicznie w celu potwierdzenia zamówienia.', generalError: 'Coś poszło nie tak. Spróbuj ponownie.', authError: 'Błąd uwierzytelniania. Odśwież stronę.',
    address: 'Adres', openingHours: 'Godziny Otwarcia', followUs: 'Śledź Nas',
    aboutP1: 'Liban w Szklance to tak naprawdę nasz list miłosny do libańskiej kultury, jej tętniących życiem smaków i gościnności, dzięki której od razu czujesz się jak w domu. Wychowaliśmy się w otoczeniu rodzinnych tradycji i niepowtarzalnego smaku domowych koktajli, dlatego postanowiliśmy stworzyć przytulne, nowoczesne miejsce, by móc się tym z Wami podzielić.',
    aboutP2: 'We wszystkim, co robimy, kierujemy się jedną prostą zasadą: jakość ma znaczenie. Starannie dobieramy składniki i przygotowujemy każdy koktajl z ogromną dbałością, by naturalne smaki i świeżość grały pierwsze skrzypce. Nie idziemy na skróty — to po prostu szczere, pielęgnowane od lat przepisy prosto z naszych libańskich korzeni.',
    aboutP3: 'Zawsze wierzyliśmy, że Liban w Szklance to nie tylko zwykły lokal. Chcemy, aby przekroczenie naszych progów przypominało wizytę w domu dobrego przyjaciela. Każdą szklankę przygotowujemy z sercem, a każdego, kto nas odwiedza, witamy jak wyjątkowego gościa. Niezależnie od tego, czy wpadasz na szybkie orzeźwienie, czy próbujesz naszych smaków po raz pierwszy, mamy nadzieję, że poprawimy Ci dzień.',
    aboutP4: 'Jesteśmy niesamowicie dumni z naszego dziedzictwa, w którym łączymy dawne tradycje z odrobiną nowoczesności. Nasz cel jest w sumie bardzo prosty: chcemy podać Ci kawałek Libanu, pełen świeżości i jakości, prosto w szklance.',
    q1: '„Liban to ojczyzna, którą Bóg wybrał dla Siebie".', q2: '„Ty masz swój Liban, a ja mam swój".', q3: '„Mój Liban to mały naród, ale wielki naród. Mój Liban to splot aromatów, skupisko wspomnień i symfonia marzeń".'
  }
};

const CATEGORIES = [
  { id: 'cocktails', name: 'Lebanese Cocktails', namePl: 'Libańskie Koktajle', icon: '🍹' },
  { id: 'protein_shakes', name: 'Protein Shakes', namePl: 'Szejki Białkowe', icon: '💪' },
  { id: 'healthy_mixes', name: 'Healthy Mixes', namePl: 'Zdrowe Miksy', icon: '🍏' },
  { id: 'juices', name: 'Fresh Juices', namePl: 'Świeże Soki', icon: '🍊' },
  { id: 'waffles', name: 'Waffles (Gofry)', namePl: 'Gofry', icon: '🧇' },
  { id: 'savory_crepes', name: 'Savory Crepes', namePl: 'Słone Naleśniki', icon: '🌮' },
  { id: 'sweet_crepes', name: 'Sweet Crepes', namePl: 'Słodkie Naleśniki', icon: '🥞' },
  { id: 'ice_cream', name: 'Ice Cream', namePl: 'Lody', icon: '🍨' },
  { id: 'ashta', name: 'Ashta', namePl: 'Aszta', icon: '🍮' },
  { id: 'combo', name: 'Combo', namePl: 'Combo', icon: '🎁' },
  { id: 'drinks', name: 'Tea & Coffee', namePl: 'Kawa i Herbata', icon: '☕' },
];

const MENU_ITEMS = {
  cocktails: [
    { id: 'trypoli', name: 'Trypoli', image: 'https://wixiouwhfthwahlqwatb.supabase.co/storage/v1/object/public/menu%20images/trypolis.jpg', tagline: 'Seasonal fruits, strawberry cocktail, ashta, nuts, raisins, honey', sizes: [{ label: '300ml', price: 28.0 }, { label: '500ml', price: 34.0 }] },
    { id: 'sidon', name: 'Sidon', image: 'https://wixiouwhfthwahlqwatb.supabase.co/storage/v1/object/public/menu%20images/sydon.png', tagline: 'Seasonal fruits, avocado cocktail, ashta, nuts, raisins, honey', sizes: [{ label: '300ml', price: 32.0 }, { label: '500ml', price: 37.0 }] },
    { id: 'batroun', name: 'Batroun', image: 'https://wixiouwhfthwahlqwatb.supabase.co/storage/v1/object/public/menu%20images/batroun.png', tagline: 'Seasonal fruits, avocado cocktail, pineapple, mango, ashta, nuts, honey', sizes: [{ label: '300ml', price: 32.0 }, { label: '500ml', price: 38.0 }], popular: true },
    { id: 'jounieh', name: 'Jounieh', image: 'https://wixiouwhfthwahlqwatb.supabase.co/storage/v1/object/public/menu%20images/jounieh%20.png', tagline: 'Seasonal fruits, avocado & strawberry cocktail, ashta, nuts, raisins, honey', sizes: [{ label: '300ml', price: 29.0 }, { label: '500ml', price: 35.0 }] },
    { id: 'beirut', name: 'Beirut', image: 'https://wixiouwhfthwahlqwatb.supabase.co/storage/v1/object/public/menu%20images/bejrut-1.png', tagline: 'Avocado cocktail, pineapple, mango, ashta, nuts, raisins, honey', sizes: [{ label: '300ml', price: 33.0 }, { label: '500ml', price: 38.0 }], popular: true },
    { id: 'baalbek', name: 'Baalbek', image: 'https://wixiouwhfthwahlqwatb.supabase.co/storage/v1/object/public/menu%20images/Koktajl%20baalbek.jpg', tagline: 'Seasonal fruits, mango pulp, strawberry cocktail, ashta, pineapple, nuts', sizes: [{ label: '300ml', price: 30.0 }, { label: '500ml', price: 34.0 }] },
    { id: 'zahle', name: 'Zahle', image: 'https://wixiouwhfthwahlqwatb.supabase.co/storage/v1/object/public/menu%20images/Zahle%20.png', tagline: 'Premium cocktail blend with exotic fruits and honey', sizes: [{ label: '300ml', price: 32.0 }, { label: '500ml', price: 38.0 }] },
    { id: 'cedry', name: 'Cedry', image: 'https://wixiouwhfthwahlqwatb.supabase.co/storage/v1/object/public/menu%20images/cedry.png', tagline: 'Authentic taste of Lebanon with rich fruit layers', sizes: [{ label: '300ml', price: 31.0 }, { label: '500ml', price: 37.0 }] },
  ],
  protein_shakes: [
    { id: 'banana_dates_boost', name: 'Banana Dates Boost', image: 'https://wixiouwhfthwahlqwatb.supabase.co/storage/v1/object/public/menu%20images/Banana%20Dates%20Boost%20.jpg', tagline: 'Banana, dates, protein powder, milk', sizes: [{ label: 'Standard', price: 25.0 }] },
    { id: 'chocolate_dates_delight', name: 'Chocolate Dates Delight', image: 'https://wixiouwhfthwahlqwatb.supabase.co/storage/v1/object/public/menu%20images/Chocolate%20Dates%20Delight.jpg', tagline: 'Chocolate, dates, protein powder, milk', sizes: [{ label: 'Standard', price: 26.0 }] },
    { id: 'coconut_almond_energy', name: 'Coconut Almond Energy', image: 'https://wixiouwhfthwahlqwatb.supabase.co/storage/v1/object/public/menu%20images/Coconut%20Almond%20Energy.jpg', tagline: 'Coconut, almonds, protein powder, milk', sizes: [{ label: 'Standard', price: 28.0 }] },
    { id: 'berry_fit', name: 'Berry Fit', image: 'https://wixiouwhfthwahlqwatb.supabase.co/storage/v1/object/public/menu%20images/Berry%20Fit.jpg', tagline: 'Mixed berries, protein powder, milk', sizes: [{ label: 'Standard', price: 26.0 }] },
    { id: 'mango_power', name: 'Mango Power', image: 'https://wixiouwhfthwahlqwatb.supabase.co/storage/v1/object/public/menu%20images/Mango%20Power%20.jpg', tagline: 'Mango, protein powder, milk', sizes: [{ label: 'Standard', price: 27.0 }] },
  ],
  healthy_mixes: [
    { id: 'kac', name: 'Kac (Hangover)', image: 'https://wixiouwhfthwahlqwatb.supabase.co/storage/v1/object/public/menu%20images/kac.jpg', tagline: 'Revitalizing mix for recovery', sizes: [{ label: 'Standard', price: 22.0 }] },
    { id: 'moc', name: 'Moc (Power)', image: 'https://wixiouwhfthwahlqwatb.supabase.co/storage/v1/object/public/menu%20images/moc.jpg', tagline: 'Energy boosting blend', sizes: [{ label: 'Standard', price: 22.0 }] },
    { id: 'metabolizm', name: 'Metabolizm', image: 'https://wixiouwhfthwahlqwatb.supabase.co/storage/v1/object/public/menu%20images/metabolizm.jpg', tagline: 'Boost your metabolism naturally', sizes: [{ label: 'Standard', price: 22.0 }] },
    { id: 'odpornosc', name: 'Odporność (Immunity)', image: 'https://wixiouwhfthwahlqwatb.supabase.co/storage/v1/object/public/menu%20images/odpornosc.jpg', tagline: 'Vitamins and immune support', sizes: [{ label: 'Standard', price: 22.0 }] },
    { id: 'cera', name: 'Cera (Skin Glowing)', image: 'https://wixiouwhfthwahlqwatb.supabase.co/storage/v1/object/public/menu%20images/cera.jpg', tagline: 'For healthy and glowing skin', sizes: [{ label: 'Standard', price: 22.0 }] },
    { id: 'jallab', name: 'Jallab', image: 'https://wixiouwhfthwahlqwatb.supabase.co/storage/v1/object/public/menu%20images/jallab.jpg', tagline: 'Traditional date molasses and rose water drink', sizes: [{ label: 'Standard', price: 18.0 }] },
  ],
  juices: [
    { id: 'orange_juice', name: 'Fresh Orange Juice', image: 'https://wixiouwhfthwahlqwatb.supabase.co/storage/v1/object/public/menu%20images/pomarancza.jpg', tagline: 'Freshly squeezed', sizes: [{ label: 'Standard', price: 17.5 }] },
    { id: 'apple_juice', name: 'Fresh Apple Juice', image: 'https://wixiouwhfthwahlqwatb.supabase.co/storage/v1/object/public/menu%20images/jablko.jpg', tagline: 'Freshly squeezed', sizes: [{ label: 'Standard', price: 17.5 }] },
    { id: 'carrot_juice', name: 'Carrot Juice', image: 'https://wixiouwhfthwahlqwatb.supabase.co/storage/v1/object/public/menu%20images/marchewka.jpg', tagline: 'Fresh carrot juice', sizes: [{ label: 'Standard', price: 16.0 }] },
    { id: 'carrot_orange', name: 'Carrot & Orange', image: 'https://wixiouwhfthwahlqwatb.supabase.co/storage/v1/object/public/menu%20images/marchew%20pomarancz.jpg', tagline: 'Mixed fresh juice', sizes: [{ label: 'Standard', price: 18.0 }] },
    { id: 'pomegranate_juice', name: 'Pomegranate Juice', image: 'https://wixiouwhfthwahlqwatb.supabase.co/storage/v1/object/public/menu%20images/granat.jpg', tagline: 'Fresh pomegranate', sizes: [{ label: 'Standard', price: 22.0 }] },
    { id: 'lemonade', name: 'Classic Lemonade', image: 'https://wixiouwhfthwahlqwatb.supabase.co/storage/v1/object/public/menu%20images/lemoniada.jpg', tagline: 'Refreshing classic lemonade', sizes: [{ label: 'Standard', price: 15.0 }] },
    { id: 'lemonade_mint', name: 'Mint Lemonade', image: 'https://wixiouwhfthwahlqwatb.supabase.co/storage/v1/object/public/menu%20images/lemoniada%20mieta.jpg', tagline: 'Lemonade with fresh mint leaves', sizes: [{ label: 'Standard', price: 16.0 }] },
  ],
  waffles: [
    { id: 'waffle_mascarpone', name: 'Mascarpone Waffle', image: 'https://wixiouwhfthwahlqwatb.supabase.co/storage/v1/object/public/menu%20images/gofry%20mascarpone.jpg', tagline: 'Mascarpone, mix fruits, honey, nuts', sizes: [{ label: 'Standard', price: 27.0 }] },
    { id: 'waffle_whipped', name: 'Whipped Cream Waffle', image: 'https://wixiouwhfthwahlqwatb.supabase.co/storage/v1/object/public/menu%20images/Gofry%20bita%20smietana%20i%20mix%20owocow.jpg', tagline: 'Whipped cream, mix fruits, chocolate sauce', sizes: [{ label: 'Standard', price: 23.0 }] },
    { id: 'waffle_jam', name: 'Strawberry Jam Waffle', image: 'https://wixiouwhfthwahlqwatb.supabase.co/storage/v1/object/public/menu%20images/gofry%20dzem%20truskawky.jpg', tagline: 'Strawberry jam, whipped cream, strawberry sauce', sizes: [{ label: 'Standard', price: 23.0 }] },
    { id: 'waffle_ashta', name: 'Ashta Waffle', image: 'https://wixiouwhfthwahlqwatb.supabase.co/storage/v1/object/public/menu%20images/plat%20ashta.jpg', tagline: 'Ashta, mix fruits, honey, mix nuts', sizes: [{ label: 'Standard', price: 28.0 }], popular: true },
    { id: 'waffle_nutella', name: 'Nutella & Banana', image: 'https://wixiouwhfthwahlqwatb.supabase.co/storage/v1/object/public/menu%20images/Gofry%20nutella.jpg', tagline: 'Nutella, banana, whipped cream', sizes: [{ label: 'Standard', price: 25.0 }] },
    { id: 'waffle_sugar', name: 'Classic Sugar Waffle', image: 'https://wixiouwhfthwahlqwatb.supabase.co/storage/v1/object/public/menu%20images/gofry%20cuker.jpg', tagline: 'Powdered sugar', sizes: [{ label: 'Standard', price: 13.0 }] },
  ],
  savory_crepes: [
    { id: 'crepe_zaatar', name: 'Labneh & Zaatar', image: 'https://wixiouwhfthwahlqwatb.supabase.co/storage/v1/object/public/menu%20images/labneh.jpg', tagline: 'Labneh, olive oil, zaatar, veggies', sizes: [{ label: 'Standard', price: 28.0 }] },
    { id: 'crepe_ham', name: 'Cheese & Ham', image: 'https://wixiouwhfthwahlqwatb.supabase.co/storage/v1/object/public/menu%20images/crepe%20ser%20zolty.jpg', tagline: 'Yellow cheese, ham, mushrooms', sizes: [{ label: 'Standard', price: 28.0 }] },
    { id: 'crepe_mozzarella', name: 'Mozzarella', image: 'https://wixiouwhfthwahlqwatb.supabase.co/storage/v1/object/public/menu%20images/mozarella.jpg', tagline: 'Mozzarella, oregano, mushrooms, tomatoes', sizes: [{ label: 'Standard', price: 28.0 }] },
  ],
  sweet_crepes: [
    { id: 'crepe_mango_mascarpone', name: 'Mango Mascarpone', image: 'https://wixiouwhfthwahlqwatb.supabase.co/storage/v1/object/public/menu%20images/crepe%20mango%20mascarpone.jpg', tagline: 'Sweet crepe with mango and mascarpone', sizes: [{ label: 'Standard', price: 26.0 }] },
    { id: 'crepe_apple_mousse', name: 'Apple Mousse', image: 'https://wixiouwhfthwahlqwatb.supabase.co/storage/v1/object/public/menu%20images/crepe%20mus%20jalbkowy.jpg', tagline: 'Sweet crepe with apple mousse', sizes: [{ label: 'Standard', price: 24.0 }] },
    { id: 'crepe_nutella_banana', name: 'Nutella Banana', image: 'https://wixiouwhfthwahlqwatb.supabase.co/storage/v1/object/public/menu%20images/crepe%20nutella%20banana.jpg', tagline: 'Classic Nutella and banana crepe', sizes: [{ label: 'Standard', price: 25.0 }] },
    { id: 'oreo_shake', name: 'Oreo', image: 'https://wixiouwhfthwahlqwatb.supabase.co/storage/v1/object/public/menu%20images/oreo.jpg', tagline: 'Oreo cookies and sweet cream', sizes: [{ label: 'Standard', price: 22.0 }] },
    { id: 'lotus_shake', name: 'Lotus Biscoff', image: 'https://wixiouwhfthwahlqwatb.supabase.co/storage/v1/object/public/menu%20images/lotus.jpg', tagline: 'Lotus spread and sweet cream', sizes: [{ label: 'Standard', price: 24.0 }] },
    { id: 'kitkat_shake', name: 'KitKat', image: 'https://wixiouwhfthwahlqwatb.supabase.co/storage/v1/object/public/menu%20images/kitkat.jpg', tagline: 'KitKat chocolate and sweet cream', sizes: [{ label: 'Standard', price: 22.0 }] },
    { id: 'pistachio_shake', name: 'Pistachio', image: 'https://wixiouwhfthwahlqwatb.supabase.co/storage/v1/object/public/menu%20images/pistacjo.jpg', tagline: 'Premium pistachio blend', sizes: [{ label: 'Standard', price: 28.0 }] },
    { id: 'peanut_butter_shake', name: 'Peanut Butter', image: 'https://wixiouwhfthwahlqwatb.supabase.co/storage/v1/object/public/menu%20images/maslo%20orzechowe.jpg', tagline: 'Creamy peanut butter blend', sizes: [{ label: 'Standard', price: 23.0 }] },
  ],
  ice_cream: [
    { id: 'lody-artisan', name: 'Artisan Ice Cream', image: 'https://wixiouwhfthwahlqwatb.supabase.co/storage/v1/object/public/menu%20images/iceream.jpeg', tagline: 'Delicious artisanal ice cream', sizes: [{ label: 'Standard', price: 18.0 }] },
    { id: 'lody-dog', name: 'Ice Cream for Dogs', image: 'https://wixiouwhfthwahlqwatb.supabase.co/storage/v1/object/public/menu%20images/icecreamfordogs.png', tagline: 'Special dog-friendly ice cream in a cup', sizes: [{ label: '1 Cup', price: 12.0 }] },
  ],
  ashta: [
    { id: 'ashta-fruits', name: 'Ashta & Fruits (500g)', image: 'https://wixiouwhfthwahlqwatb.supabase.co/storage/v1/object/public/menu%20images/aszta.jpeg', tagline: 'Authentic Lebanese ashta cream served with fruits', sizes: [{ label: '500g', price: 92.5 }] },
    { id: 'anaya_ashta', name: 'Anaya with Ashta', image: '', tagline: 'Traditional dessert', sizes: [{ label: 'Standard', price: 36.5 }] },
    { id: 'katayef', name: 'Katayef', image: 'https://wixiouwhfthwahlqwatb.supabase.co/storage/v1/object/public/menu%20images/katayef.jpeg', tagline: 'Lebanese sweet stuffed with ashta', sizes: [{ label: 'Standard', price: 30.0 }] }
  ],
  combo: [
    { id: 'combo_fettuccine', name: 'Combo: Fettuccine Pancakes', image: '', tagline: 'Fresh juice or lemonade + fettuccine pancakes.', sizes: [{ label: 'Standard', price: 35.0 }] },
  ],
  drinks: [
    { id: 'tea_mint', name: 'Lebanese Tea with Mint', image: '', tagline: 'Traditional hot tea', sizes: [{ label: 'Standard', price: 12.0 }] },
    { id: 'tea_kardamon', name: 'Lebanese Tea with Kardamon', image: '', tagline: 'Traditional hot tea', sizes: [{ label: 'Standard', price: 12.0 }] },
    { id: 'tea_winter', name: 'Polish Winter Tea', image: '', tagline: 'Warming winter tea', sizes: [{ label: 'Standard', price: 18.0 }] },
    { id: 'coffee_lebanese', name: 'Lebanese Coffee', image: '', tagline: 'Strong traditional coffee', sizes: [{ label: 'Standard', price: 10.0 }] },
  ]
};

const EXTRAS_OPTIONS = [
  { id: 'ext_aszta', name: 'Extra Ashta', price: 7.5 },
  { id: 'ext_honey', name: 'Extra Honey', price: 4.0 },
  { id: 'ext_nuts', name: 'Extra Nuts', price: 5.5 },
  { id: 'ext_fruits', name: 'Extra Fruits', price: 6.0 },
];

const ASHTA_EXTRAS = [
  { id: 'ext_fruits', name: 'Extra Fruits', price: 6.0 },
];

const BAG_OPTIONS = [ { id: 'bag_paper', name: 'Paper Bag (+0.50 PLN)', price: 0.5 } ];
const CUP_080 = { name: 'Packaging', required: true, multi: false, options: [{ id: 'takeaway_cup', name: 'Bio Cup (+0.80 PLN)', price: 0.8 }] };
const CUP_050 = { name: 'Packaging', required: true, multi: false, options: [{ id: 'takeaway_cup', name: 'Bio Cup (+0.50 PLN)', price: 0.5 }] };
const BOX_150 = { name: 'Packaging', required: true, multi: false, options: [{ id: 'takeaway_box', name: 'Eco Box (+1.50 PLN)', price: 1.5 }] };

const MILK_OPTIONS = { name: 'Milk Base', required: true, multi: false, options: [
  { id: 'normal', name: 'Regular Milk', price: 0 }, 
  { id: 'lactose_free', name: 'Lactose-free Milk', price: 0 }, 
  { id: 'oat', name: 'Oat Milk (+8.00 PLN)', price: 8 }, 
  { id: 'almond', name: 'Almond Milk (+8.00 PLN)', price: 8 }, 
  { id: 'coconut', name: 'Coconut Milk (+8.00 PLN)', price: 8 }
], default: 'normal' };

const MODIFIERS_BY_CATEGORY = {
  cocktails: {
    packaging: CUP_080,
    milk: MILK_OPTIONS,
    bag: { name: 'Takeaway Bag', required: false, multi: false, options: BAG_OPTIONS },
    extras: { name: 'Extras (Dodatki)', required: false, multi: true, options: EXTRAS_OPTIONS }
  },
  protein: { 
    packaging: CUP_050, 
    milk: MILK_OPTIONS,
    bag: { name: 'Takeaway Bag', required: false, multi: false, options: BAG_OPTIONS }
  },
  juice_drink: {
    packaging: CUP_080,
    bag: { name: 'Takeaway Bag', required: false, multi: false, options: BAG_OPTIONS },
    extras: { name: 'Extras (Dodatki)', required: false, multi: true, options: EXTRAS_OPTIONS }
  },
  juice_only: {
    packaging: CUP_050,
    bag: { name: 'Takeaway Bag', required: false, multi: false, options: BAG_OPTIONS },
    extras: { name: 'Extras (Dodatki)', required: false, multi: true, options: EXTRAS_OPTIONS }
  },
  savory: { 
    packaging: BOX_150,
    bag: { name: 'Takeaway Bag', required: false, multi: false, options: BAG_OPTIONS }
  },
  sweet: { 
    packaging: BOX_150,
    bag: { name: 'Takeaway Bag', required: false, multi: false, options: BAG_OPTIONS },
    extras: { name: 'Extras (Dodatki)', required: false, multi: true, options: EXTRAS_OPTIONS }
  },
  ice_cream: {
    packaging: { name: 'Packaging', required: true, multi: false, options: [
      { id: 'box_small', name: 'Takeaway Box Small (+7.00 PLN)', price: 7.0 },
      { id: 'box_big', name: 'Takeaway Box Big (+10.00 PLN)', price: 10.0 }
    ], default: 'box_small' },
    bag: { name: 'Takeaway Bag', required: false, multi: false, options: BAG_OPTIONS }
  },
  ashta: {
    packaging: BOX_150,
    bag: { name: 'Takeaway Bag', required: false, multi: false, options: BAG_OPTIONS },
    extras: { name: 'Extras (Dodatki)', required: false, multi: true, options: ASHTA_EXTRAS }
  },
  none: {},
};

function getModifiersFor(categoryId, itemId) {
  if (categoryId === 'cocktails') return MODIFIERS_BY_CATEGORY.cocktails;
  if (categoryId === 'protein_shakes') return MODIFIERS_BY_CATEGORY.protein;
  if (categoryId === 'drinks') return MODIFIERS_BY_CATEGORY.juice_drink;
  if (categoryId === 'juices' || categoryId === 'healthy_mixes') return MODIFIERS_BY_CATEGORY.juice_only;
  if (categoryId === 'savory_crepes') return MODIFIERS_BY_CATEGORY.savory;
  if (['waffles', 'sweet_crepes', 'combo'].includes(categoryId)) return MODIFIERS_BY_CATEGORY.sweet;
  if (categoryId === 'ice_cream') return MODIFIERS_BY_CATEGORY.ice_cream;
  if (categoryId === 'ashta') return MODIFIERS_BY_CATEGORY.ashta;
  return MODIFIERS_BY_CATEGORY.none;
}

function generateTimeSlots(baseTime) {
  const now = baseTime || new Date(); const earliest = new Date(now.getTime() + 60 * 60000); 
  const firstSlot = new Date(earliest); const rem = firstSlot.getMinutes() % 15;
  if (rem !== 0 || firstSlot.getSeconds() > 0 || firstSlot.getMilliseconds() > 0) { firstSlot.setMinutes(firstSlot.getMinutes() + (15 - rem), 0, 0); }
  const slots = []; let cursor = firstSlot; const endTime = new Date(now.getTime() + 48 * 60 * 60 * 1000); 
  const hourFmt = new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Warsaw', hour: 'numeric', hour12: false });
  const minFmt = new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Warsaw', minute: 'numeric' });
  const dayFmt = new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Warsaw', weekday: 'short' });
  while (slots.length < 64 && cursor <= endTime) {
    let h = parseInt(hourFmt.format(cursor), 10); if (h === 24) h = 0; 
    const m = parseInt(minFmt.format(cursor), 10); const dayStr = dayFmt.format(cursor);
    const isWeekendSpecial = (dayStr === 'Fri' || dayStr === 'Sat');
    const OPEN_HOUR = 10; const CLOSE_HOUR = isWeekendSpecial ? 22 : 21;
    const START_HOUR = OPEN_HOUR + 1; const END_HOUR = CLOSE_HOUR - 1;  
    if (h >= START_HOUR && (h < END_HOUR || (h === END_HOUR && m === 0))) { slots.push(new Date(cursor)); }
    cursor = new Date(cursor.getTime() + 15 * 60000); 
  } return slots;
}

function formatSlot(date) { return new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Warsaw', hour: '2-digit', minute: '2-digit', hour12: false }).format(date); }
function formatFullSlot(date) { return new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Warsaw', weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }).format(date); }
function getSlotDayLabel(date) { return new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Warsaw', weekday: 'long', month: 'short', day: 'numeric' }).format(date); }
function slotKey(date) { return date.toISOString(); }

async function appendOrder(order, lang) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) { alert(T[lang].authError); return null; }
  const { data, error } = await supabase.from('orders').insert([{
      customer_name: order.customer.name, customer_phone: order.customer.phone, pickup_time: order.pickupSlot, items: order.items, total_price: order.total, status: 'new', user_id: user.id 
    }]).select(); 
  if (error) {
    if (error.message.includes('Kapasite_Dolu')) return 'CAPACITY_FULL';
    alert(T[lang].generalError + " (" + error.message + ")"); return null;
  } return data ? data[0] : null; 
}

function currency(n) { return `${n.toFixed(2)} PLN`; }
function uid() { return Math.random().toString(36).slice(2, 8).toUpperCase(); }
function lineTotal(line) { const base = line.unitPrice; const modSum = Object.values(line.mods || {}).flat().reduce((a, m) => a + (m.price || 0), 0); return (base + modSum) * line.qty; }

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

function MathCaptcha({ onVerify }) {
  const [a] = useState(Math.floor(Math.random() * 9) + 1); const [b] = useState(Math.floor(Math.random() * 9) + 1);
  const [answer, setAnswer] = useState(""); const [isSuccess, setIsSuccess] = useState(false);
  useEffect(() => { if (parseInt(answer) === a + b) { setIsSuccess(true); onVerify(true); } else { setIsSuccess(false); onVerify(false); } }, [answer, a, b, onVerify]);
  return (
    <div className={`rounded-xl p-4 border transition-colors flex items-center justify-between ${isSuccess ? 'bg-[#93b45b]/10 border-[#93b45b]/40' : 'bg-gray-50 border-gray-200'}`}>
      <div className="flex items-center gap-3">
        <ShieldCheck size={20} className={isSuccess ? 'text-[#93b45b]' : 'text-gray-400'} />
        <div className="text-left"><div className="text-sm font-semibold text-gray-700">Anti-spam Verification</div><div className="text-xs text-gray-500">How much is <strong className="text-gray-800 text-sm">{a} + {b}</strong>?</div></div>
      </div>
      <input type="number" value={answer} onChange={e => setAnswer(e.target.value)} placeholder="=" className={`w-16 h-10 text-center text-lg font-semibold rounded-lg border outline-none transition-colors ${isSuccess ? 'border-[#93b45b] text-[#7a964a] bg-white' : 'border-gray-300 text-gray-800 focus:border-[#93b45b]'}`} />
    </div>
  );
}

function TopBar({ lang, setLang }) {
  return (
    <div className="text-[11px] font-semibold py-2 px-4 flex justify-between items-center z-40 relative border-b bg-black/40 backdrop-blur-sm text-[#F7F1E3] border-white/10">
      <div className="flex items-center gap-3 md:gap-5 overflow-x-auto scroll-hide">
        <a href="https://www.pyszne.pl/menu/liban-w-szklance" target="_blank" rel="noopener noreferrer" className="shrink-0 flex items-center gap-1.5 hover:text-[#FF7F00] transition"><span className="bg-[#FF7F00]/20 text-[#FF7F00] p-1 rounded-md"><ShoppingBag size={12} /></span> Pyszne</a>
        <a href="https://wolt.com/pl/pol/warsaw/restaurant/liban-w-szklance" target="_blank" rel="noopener noreferrer" className="shrink-0 flex items-center gap-1.5 hover:text-[#00c8ff] transition"><span className="bg-[#00c8ff]/20 text-[#00c8ff] p-1 rounded-md"><ShoppingBag size={12} /></span> Wolt</a>
        <a href="https://glovoapp.com/en/pl/warszawa/stores/liban-w-szklance-waw" target="_blank" rel="noopener noreferrer" className="shrink-0 flex items-center gap-1.5 hover:text-[#ffc244] transition"><span className="bg-[#ffc244]/20 text-[#ffc244] p-1 rounded-md"><ShoppingBag size={12} /></span> Glovo</a>
        <a href="https://food.bolt.eu/pl-pl/307-warsaw/p/187787-liban-w-szklance/" target="_blank" rel="noopener noreferrer" className="shrink-0 flex items-center gap-1.5 hover:text-[#34d186] transition"><span className="bg-[#34d186]/20 text-[#34d186] p-1 rounded-md"><ShoppingBag size={12} /></span> Bolt</a>
        <a href="https://www.ubereats.com/pl/store/liban-w-szklance/NySG0olXWqK8SdP995XkzA" target="_blank" rel="noopener noreferrer" className="shrink-0 flex items-center gap-1.5 hover:text-[#06c167] transition"><span className="bg-[#06c167]/20 text-[#06c167] p-1 rounded-md"><ShoppingBag size={12} /></span> UberEats</a>
        <a href="https://www.instagram.com/libanwszklance/" target="_blank" rel="noopener noreferrer" className="shrink-0 flex items-center gap-1.5 hover:text-[#E4405F] transition border-l border-white/10 pl-3 md:pl-5"><span className="bg-[#E4405F]/20 text-[#E4405F] p-1 rounded-md"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg></span> Instagram</a>
        <a href="https://www.facebook.com/profile.php?id=61585610253402" target="_blank" rel="noopener noreferrer" className="shrink-0 flex items-center gap-1.5 hover:text-[#1877F2] transition border-l border-white/10 pl-3 md:pl-5"><span className="bg-[#1877F2]/20 text-[#1877F2] p-1 rounded-md"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg></span> Facebook</a>
      </div>
      <div className="flex items-center gap-4 shrink-0">
        <div className="flex items-center gap-2">
          <Globe size={14} className="opacity-70" /> 
          {['EN', 'PL'].map((l) => ( <button key={l} className={`transition ${lang === l ? 'text-white underline' : 'opacity-70 hover:opacity-100'}`} onClick={() => setLang(l)}>{l}</button> ))}
        </div>
      </div>
    </div>
  );
}

function ItemModal({ item, category, onClose, onAdd, lang }) { 
  const modifiers = useMemo(() => getModifiersFor(category.id, item.id), [category.id, item.id]); 
  const [sizeIdx, setSizeIdx] = useState(0); 
  const [qty, setQty] = useState(1); 
  const [mods, setMods] = useState(() => { 
    const init = {}; 
    Object.entries(modifiers).forEach(([key, group]) => { 
      if (group.required && !group.multi && group.default) { init[key] = [group.options.find((o) => o.id === group.default)]; } 
      else { init[key] = []; } 
    }); return init; 
  }); 
  const size = item.sizes[sizeIdx]; 
  const modSum = Object.values(mods).flat().reduce((a, m) => a + (m.price || 0), 0); 
  const unitPrice = size.price + modSum; const total = unitPrice * qty; 
  const missingRequired = Object.entries(modifiers).filter(([k, g]) => g.required && !g.multi && (!mods[k] || mods[k].length === 0)).map(([k]) => k); 
  const isValid = missingRequired.length === 0; 
  
  function toggleMod(groupKey, option) { 
    setMods((prev) => { 
      const group = modifiers[groupKey]; const current = prev[groupKey] || []; 
      if (group.multi) { 
        const exists = current.find((o) => o.id === option.id); 
        return { ...prev, [groupKey]: exists ? current.filter((o) => o.id !== option.id) : [...current, option] }; 
      } else { return { ...prev, [groupKey]: [option] }; } 
    }); 
  } 
  function handleAdd() { if (!isValid) return; onAdd({ lineId: uid(), itemId: item.id, name: item.name, categoryId: category.id, sizeLabel: size.label, unitPrice: size.price, mods, qty }); } 
  
  return ( 
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm"> 
      <div className="absolute inset-0" onClick={onClose} /> 
      <div className="relative w-full md:max-w-lg md:mx-4 bg-white md:rounded-3xl rounded-t-3xl max-h-[92vh] flex flex-col anim-slide overflow-hidden"> 
        {category.id !== 'combo' && category.id !== 'drinks' ? (
          <div className="relative w-full h-48 md:h-56 bg-gray-100 shrink-0">
            <img src={item.image || `https://placehold.co/600x400/FBF9F2/7a964a?text=${encodeURIComponent(item.name)}`} alt={item.name} className="w-full h-full object-cover" />
            <button onClick={onClose} className={`absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center bg-white/80 backdrop-blur text-gray-800 hover:bg-white transition shadow-sm`}><X size={16} /></button> 
          </div>
        ) : (
          <div className="relative w-full h-12 shrink-0 flex justify-end p-4">
             <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 text-gray-800 hover:bg-gray-200 transition shadow-sm"><X size={16} /></button> 
          </div>
        )}
        <div className="px-6 pt-5 pb-2 shrink-0"> <h2 className="font-display font-semibold text-2xl mb-1">{item.name}</h2> <p className="text-sm text-gray-500">{item.tagline}</p> </div> 
        <div className="flex-1 overflow-y-auto px-6 py-3 space-y-6 text-gray-800"> 
          {item.sizes.length > 1 && ( 
            <section> 
              <div className="flex items-baseline justify-between mb-2.5"> <h4 className="font-semibold text-sm">{T[lang].size}</h4> <span className="text-[10px] uppercase tracking-wide font-bold text-red-500">{T[lang].required}</span> </div> 
              <div className="grid grid-cols-2 gap-2"> 
                {item.sizes.map((s, i) => ( 
                  <button key={i} onClick={() => setSizeIdx(i)} className={`rounded-xl border px-4 py-3 text-left transition ${i === sizeIdx ? 'border-[#93b45b] bg-[#93b45b]/10 text-[#7a964a]' : 'border-gray-200 hover:border-gray-300'}`}><div className="font-semibold">{s.label}</div><div className="text-sm opacity-80">{currency(s.price)}</div></button> 
                ))} 
              </div> 
            </section> 
          )} 
          {Object.entries(modifiers).map(([groupKey, group]) => ( 
            <section key={groupKey}> 
              <div className="flex items-baseline justify-between mb-2.5"> 
                <h4 className="font-semibold text-sm">{groupKey === 'extras' ? T[lang].extras : groupKey === 'bag' ? T[lang].bag : groupKey === 'milk' ? 'Milk Selection' : group.name}</h4> 
                {group.required && <span className="text-[10px] uppercase tracking-wide font-bold text-red-500">{T[lang].required}</span>} 
              </div> 
              <div className="space-y-2"> 
                {group.options.map((opt) => { 
                  const selected = (mods[groupKey] || []).some((m) => m.id === opt.id); 
                  return ( 
                    <button key={opt.id} onClick={() => toggleMod(groupKey, opt)} className={`w-full flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors ${selected ? 'border-[#93b45b] bg-[#93b45b]/5' : 'border-gray-200 hover:border-gray-300'}`}> 
                      <div className="flex items-center gap-3"> 
                        <span className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${selected ? 'bg-[#93b45b] border-[#93b45b]' : 'border-gray-300'}`}>{selected && <Check size={14} className="text-white" />}</span> 
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
        <div className="border-t p-4 flex items-center justify-between gap-3 bg-white border-gray-100 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)] relative z-10"> 
          <div className="flex items-center rounded-full bg-gray-50 border border-gray-200"> 
            <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 flex items-center justify-center text-gray-800 disabled:opacity-30" disabled={qty <= 1}><Minus size={15} /></button> 
            <span className="w-6 text-center text-sm font-semibold text-gray-800">{qty}</span> 
            <button onClick={() => setQty(qty + 1)} className="w-10 h-10 flex items-center justify-center text-gray-800"><Plus size={15} /></button> 
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
                  <div className="text-xs mt-0.5 text-gray-400">{line.sizeLabel}{Object.values(line.mods || {}).flat().map(m => ` • ${m.name}`).join('')}</div> 
                </div> 
                <button onClick={() => onRemove(line.lineId)} className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-red-400 hover:bg-red-50"><X size={14} /></button> 
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
          <div className="border-t p-5 space-y-4 bg-gray-50 border-gray-200 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)]"> 
            <div className="flex justify-between items-baseline"><span className="font-display text-lg">{T[lang].pay}</span><span className="font-display text-2xl font-semibold text-[#93b45b]">{currency(subtotal)}</span></div> 
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
  const groupedSlots = useMemo(() => { 
    return slots.reduce((acc, s) => { 
      const dayLabel = getSlotDayLabel(s); 
      if (!acc[dayLabel]) acc[dayLabel] = []; 
      acc[dayLabel].push(s); 
      return acc; 
    }, {}); 
  }, [slots]);
  const canProceedFromStep1 = name.trim().length >= 2 && phone.trim().length >= 6; 
  
  const hasAshta = cart.some(item => item.itemId === 'ashta-fruits');
  const hasKatayef = cart.some(item => item.itemId === 'katayef');
  const showUpsell = !hasAshta || !hasKatayef;

  async function placeOrder() { 
    if (!chosenSlot || !canProceedFromStep1 || !isHuman) return; 
    setSubmitting(true); 
    const order = { customer: { name: name.trim(), phone: phone.trim() }, pickupSlot: chosenSlot, pickupSlotDisplay: formatFullSlot(new Date(chosenSlot)), items: cart, total: subtotal }; 
    const insertedOrder = await appendOrder(order, lang); 
    setSubmitting(false); 
    if (insertedOrder === 'CAPACITY_FULL') { alert(T[lang].capacityError); setStep(2); } 
    else if (insertedOrder) { onPlaced(insertedOrder); } 
  } 
  
  return ( 
    <div className="fixed inset-0 z-50 flex items-stretch md:items-center justify-center bg-black/70"> 
      <div className="absolute inset-0" onClick={onClose} /> 
      <div className="relative w-full md:max-w-2xl md:mx-4 bg-white md:rounded-3xl flex flex-col max-h-full md:max-h-[92vh] overflow-hidden text-gray-800"> 
        <div className="flex items-center gap-3 px-5 py-4 border-b bg-gray-50"> 
          <button onClick={step === 1 ? onClose : () => setStep(step - 1)} className="w-9 h-9 rounded-full flex items-center justify-center bg-white border shadow-sm hover:bg-gray-50">{step === 1 ? <X size={16} /> : <ArrowLeft size={16} />}</button> 
          <div className="flex-1 font-display font-semibold"> Checkout - Step {step} </div> 
        </div> 
        <div className="flex-1 overflow-y-auto p-5 md:p-6"> 
        {step === 1 && ( 
          <div className="space-y-6 max-w-md mx-auto"> 
            {showUpsell && (
              <div className="bg-[#93b45b]/10 p-4 rounded-2xl border border-[#93b45b]/30">
                <div className="font-bold text-[#7a964a] mb-1">{T[lang].upsellTitle}</div>
                <div className="text-xs text-gray-600 mb-3">{T[lang].upsellDesc}</div>
                <div className="flex flex-col sm:flex-row gap-3">
                  {!hasAshta && ( 
                    <button onClick={() => onAddUpsell(MENU_ITEMS.ashta[0], 'ashta')} className="flex-1 flex items-center gap-3 bg-white p-2 rounded-xl border border-[#93b45b]/40 hover:border-[#93b45b] text-left transition shadow-sm group">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                         <img src={MENU_ITEMS.ashta[0].image || `https://placehold.co/100x100/FBF9F2/7a964a?text=Ashta`} alt="Ashta" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                      </div>
                      <div className="flex-1">
                         <div className="text-sm font-bold text-[#16261B]">Ashta & Fruits</div>
                         <div className="text-xs font-semibold text-[#7a964a]">+ {currency(MENU_ITEMS.ashta[0].sizes[0].price)}</div>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-[#93b45b]/10 flex items-center justify-center text-[#93b45b] shrink-0 mr-1"><Plus size={14}/></div>
                    </button> 
                  )}
                  {!hasKatayef && ( 
                    <button onClick={() => onAddUpsell(MENU_ITEMS.ashta[2], 'ashta')} className="flex-1 flex items-center gap-3 bg-white p-2 rounded-xl border border-[#93b45b]/40 hover:border-[#93b45b] text-left transition shadow-sm group">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                         <img src={MENU_ITEMS.ashta[2].image || `https://placehold.co/100x100/FBF9F2/7a964a?text=Katayef`} alt="Katayef" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                      </div>
                      <div className="flex-1">
                         <div className="text-sm font-bold text-[#16261B]">Katayef</div>
                         <div className="text-xs font-semibold text-[#7a964a]">+ {currency(MENU_ITEMS.ashta[2].sizes[0].price)}</div>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-[#93b45b]/10 flex items-center justify-center text-[#93b45b] shrink-0 mr-1"><Plus size={14}/></div>
                    </button> 
                  )}
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
            {Object.entries(groupedSlots).map(([dayLabel, daySlots]) => (
              <div key={dayLabel} className="anim-fadeup">
                <h4 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-widest border-b border-gray-100 pb-2">{dayLabel}</h4>
                <div className="grid grid-cols-3 gap-3"> 
                  {daySlots.map((slot) => { 
                    const key = slotKey(slot); const isSelected = chosenSlot === key; 
                    return ( <button key={key} onClick={() => setChosenSlot(key)} className={`py-3 rounded-xl text-center border font-semibold text-sm transition-colors ${isSelected ? 'bg-[#93b45b] text-white border-[#93b45b]' : 'bg-white hover:border-gray-300'}`}>{formatSlot(slot)}</button> ); 
                  })} 
                </div>
              </div>
            ))}
            <Button size="lg" className="w-full mt-6" disabled={!chosenSlot} onClick={() => setStep(3)}>Next <ChevronRight size={20} /></Button> 
          </div> 
        )} 
        {step === 3 && ( 
          <div className="space-y-6 max-w-md mx-auto text-center"> 
            <div className="p-5 bg-gray-50 rounded-2xl border"> <div className="text-sm text-gray-500 mb-1">Pickup Time:</div> <div className="font-display text-xl font-bold text-[#7a964a]">{chosenSlot ? formatFullSlot(new Date(chosenSlot)) : '-'}</div> </div> 
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
  const [quote] = useState(() => { const qs = [T[lang].q1, T[lang].q2, T[lang].q3]; return qs[Math.floor(Math.random() * qs.length)]; });
  return ( 
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"> 
      <div className="bg-white rounded-3xl max-w-md w-full p-8 text-center anim-fadeup text-gray-800"> 
        <div className="w-16 h-16 rounded-full bg-[#93b45b]/20 flex items-center justify-center mx-auto mb-4 text-[#93b45b]"><Check size={32}/></div>
        <h2 className="font-display text-2xl font-semibold mb-2">{T[lang].status_new}</h2> 
        <div className="text-gray-500 mb-4 text-sm font-medium italic">"{quote}"</div>
        <div className="text-gray-500 mb-4">Pickup: <strong>{formatFullSlot(new Date(order.pickup_time))}</strong></div> 
        <div className="p-4 bg-[#93b45b]/10 rounded-2xl border border-[#93b45b]/30 text-sm font-medium text-[#7a964a] mb-6"><Phone size={14} className="inline-block mr-2" /> {T[lang].callMessage}</div>
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
    e.preventDefault(); if(phone.length < 5) return;
    setLoading(true); setError(''); setResults(null);
    const { data, error: err } = await supabase.rpc('get_order_by_phone', { search_phone: phone.trim() });
    setLoading(false);
    if (err) setError(T[lang].generalError); else if (!data || data.length === 0) setError(T[lang].notFound); else setResults(data);
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
       <div className="bg-white rounded-3xl w-full max-w-md p-6 relative anim-slide shadow-2xl text-gray-800">
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition"><X size={16} /></button>
          <div className="mb-6 mt-2"><h2 className="font-display text-2xl font-semibold mb-1 flex items-center gap-2"><Search className="text-[#93b45b]" size={24} /> {T[lang].trackTitle}</h2></div>
          <form onSubmit={handleTrack} className="space-y-4 mb-6">
             <div><label className="block text-xs uppercase font-semibold text-gray-500 mb-1">{T[lang].phoneLabel}</label><input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full border p-3 rounded-xl outline-none focus:border-[#93b45b]" placeholder="+48..." required /></div>
             {error && <div className="text-red-500 text-sm font-semibold">{error}</div>}
             <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Searching...' : T[lang].checkStatus} <ChevronRight size={18} /></Button>
          </form>
          {results && (
             <div className="space-y-3 border-t pt-5 mt-5">
                {results.map(order => {
                   const statusText = order.status === 'delivered' ? T[lang].status_delivered : (order.status === 'preparing' ? T[lang].status_preparing : T[lang].status_new);
                   const statusColor = order.status === 'delivered' ? 'bg-green-500' : (order.status === 'preparing' ? 'bg-blue-500' : 'bg-gray-500');
                   return (
                   <div key={order.id} className="p-4 rounded-xl border border-[#93b45b]/30 bg-[#93b45b]/10">
                      <div className="flex justify-between items-start mb-4 border-b pb-3 border-black/5">
                         <div className="text-xs text-gray-500 font-semibold">{new Date(order.created_at).toLocaleDateString()}</div>
                         <div className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider text-white ${statusColor}`}>{statusText}</div>
                      </div>
                      <div className="space-y-2 mb-4">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="text-sm"><div className="font-semibold text-gray-800 flex items-start gap-1.5"><span className="text-gray-500">{item.qty}x</span> {item.name}</div><div className="text-xs text-gray-500 ml-5 mt-0.5">{item.sizeLabel}{item.mods && Object.values(item.mods).flat().map(m => ` · ${m.name}`).join('')}</div></div>
                        ))}
                      </div>
                      <div className="text-xs font-bold flex items-center gap-1 pt-3 border-t border-black/5 text-[#7a964a]"><Clock size={12} /> Pickup: {new Date(order.pickup_time).toLocaleTimeString('en-US', { timeZone: 'Europe/Warsaw', hour: '2-digit', minute:'2-digit', hour12: false })}</div>
                   </div>
                  )
                })}
             </div>
          )}
       </div>
    </div>
  );
}

const PROMO_LIST = [
  { id: 'lody-artisan', name: 'Artisan Ice Cream', image: 'https://wixiouwhfthwahlqwatb.supabase.co/storage/v1/object/public/menu%20images/iceream.jpeg', tagline: 'Delicious artisanal ice cream', sizes: [{ label: 'Standard', price: 18.0 }], categoryId: 'ice_cream', icon: '🍨' },
  { id: 'anaya_ashta', name: 'Anaya with Ashta', image: '', tagline: 'Traditional dessert', sizes: [{ label: 'Standard', price: 36.5 }], categoryId: 'ashta', icon: '🍮' }
];

function WelcomePromoModal({ onClose, onAdd, lang }) {
  const [item] = useState(() => PROMO_LIST[Math.floor(Math.random() * PROMO_LIST.length)]);
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden relative anim-fadeup text-center shadow-2xl text-gray-800 flex flex-col">
        <div className="h-48 w-full relative bg-gray-100 shrink-0">
          <img src={item.image || `https://placehold.co/600x400/FBF9F2/7a964a?text=${encodeURIComponent(item.name)}`} alt={item.name} className="w-full h-full object-cover" />
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center bg-white/80 backdrop-blur text-gray-800 hover:bg-white transition"><X size={16} /></button>
        </div>
        <div className="p-8 pt-6">
          <h2 className="font-display text-2xl font-bold mb-1">{T[lang].promoTitle}</h2><p className="text-gray-500 text-sm mb-6">{T[lang].promoSub}</p>
          <div className="bg-gray-50 p-4 rounded-2xl mb-6 border border-gray-100"><h3 className="font-bold text-lg flex items-center justify-center gap-2">{item.icon} {item.name}</h3><div className="mt-2 font-display text-xl font-bold text-[#7a964a]">{item.sizes[0].price.toFixed(2)} PLN</div></div>
          <Button size="lg" className="w-full" onClick={() => { onAdd(item); onClose(); }}><Plus size={18} /> {T[lang].add}</Button>
        </div>
      </div>
    </div>
  );
}

export default function CustomerPage() {
  const [lang, setLang] = useState('EN');
  const [activeCat, setActiveCat] = useState('cocktails');
  const [openItem, setOpenItem] = useState(null);
  const [cart, setCart] = useState([]); 
  const [cartOpen, setCartOpen] = useState(false); 
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [trackOpen, setTrackOpen] = useState(false); 
  const [promoOpen, setPromoOpen] = useState(false); 
  const [confirmed, setConfirmed] = useState(null); 
  const [serverTime, setServerTime] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null); 
  const [toastStatus, setToastStatus] = useState(null); 
  const sectionRefs = useRef({});

  useEffect(() => {
    const initApp = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { const { data } = await supabase.auth.signInAnonymously(); if (data?.user) setCurrentUserId(data.user.id); } 
      else { setCurrentUserId(session.user.id); }
      const { data: sTime } = await supabase.rpc('get_server_time');
      setServerTime(sTime ? new Date(sTime) : new Date());
    };
    initApp();
    const promoTimer = setTimeout(() => setPromoOpen(true), 2500); 
    return () => clearTimeout(promoTimer);
  }, []);

  useEffect(() => {
    if (!currentUserId) return;
    const channel = supabase.channel(`customer-orders-${currentUserId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders', filter: `user_id=eq.${currentUserId}` }, 
        (payload) => { 
          if (payload.new.status === 'delivered') { setToastStatus('delivered'); setTimeout(() => setToastStatus(null), 6000); }
          else if (payload.new.status === 'preparing') { setToastStatus('preparing'); setTimeout(() => setToastStatus(null), 6000); }
        }
      ).subscribe();
    return () => { supabase.removeChannel(channel); }
  }, [currentUserId]);

  function pickCategory(id) { setActiveCat(id); const el = sectionRefs.current[id]; if (el) window.scrollTo({ top: el.getBoundingClientRect().top - 100, behavior: 'smooth' }); }
  function scrollToSection(id) { const el = document.getElementById(id); if (el) { const y = el.getBoundingClientRect().top + window.scrollY - 100; window.scrollTo({ top: y, behavior: 'smooth' }); } }
  function addToCart(line) { setCart((c) => [...c, line]); setOpenItem(null); setCartOpen(true); }
  function addQuickItem(item, categoryId) {
    const modifiers = getModifiersFor(categoryId, item.id); 
    const initMods = {};
    Object.entries(modifiers).forEach(([key, group]) => {
      if (group.required && !group.multi && group.default) { initMods[key] = [group.options.find(o => o.id === group.default)]; }
      else if (group.required && group.options.length > 0) { initMods[key] = [group.options[0]]; } 
    });
    addToCart({ lineId: uid(), itemId: item.id, name: item.name, categoryId, sizeLabel: item.sizes[0].label, unitPrice: item.sizes[0].price, mods: initMods, qty: 1 });
  }
  function removeFromCart(lineId) { setCart((c) => c.filter((l) => l.lineId !== lineId)); }
  function updateQty(lineId, qty) { if (qty < 1) return removeFromCart(lineId); setCart((c) => c.map((l) => (l.lineId === lineId ? { ...l, qty } : l))); }
  
  return (
    <div className="font-body">
      <style>{STYLE_TAG}</style>

      {toastStatus && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 anim-fadeup w-[90%] max-w-md">
          <div className="bg-white text-gray-900 p-4 rounded-2xl shadow-2xl border-2 flex items-center gap-4" style={{ borderColor: toastStatus === 'preparing' ? '#3B82F6' : BRAND.green }}>
            <span className="text-3xl bg-gray-50 p-2 rounded-full">{toastStatus === 'preparing' ? '👨‍🍳' : '✅'}</span>
            <div className="font-semibold text-sm">{toastStatus === 'preparing' ? T[lang].preparingToast : T[lang].readyToast}</div>
            <button onClick={() => setToastStatus(null)} className="ml-auto text-gray-400 hover:text-gray-800"><X size={18} /></button>
          </div>
        </div>
      )}

      {promoOpen && <WelcomePromoModal lang={lang} onClose={() => setPromoOpen(false)} onAdd={(item) => addQuickItem(item, item.categoryId)} />}

      <div className="video-bg-container" dangerouslySetInnerHTML={{ __html: `<video class="video-bg" autoplay loop muted playsinline webkit-playsinline><source src="https://wixiouwhfthwahlqwatb.supabase.co/storage/v1/object/public/background/background.mp4" type="video/mp4" /></video>` }} />

      <div className="relative z-10 flex flex-col min-h-screen">
        <TopBar lang={lang} setLang={setLang} />
        
        <header className="sticky top-0 z-30 bg-black/40 backdrop-blur-md text-white px-4 py-3 shadow-sm border-b border-white/10">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} title="Go to Top">
              <div className="lebanese-flag group-hover:scale-105 transition-transform"><div className="cedar-tree"><svg viewBox="0 0 100 100" fill="currentColor"><path d="M50 10 L62 30 L54 30 L66 50 L58 50 L70 72 L30 72 L42 50 L34 50 L46 30 L38 30 Z" /><rect x="47" y="72" width="6" height="16" rx="1" /></svg></div></div>
              <div><div className="font-display font-bold text-xl leading-none group-hover:text-[#E6C472] transition-colors">Liban w Szklance</div><div className="text-[10px] tracking-widest opacity-80 uppercase">Warsaw · Gagarina 31</div></div>
            </div>
            <nav className="hidden md:flex items-center gap-6 font-semibold text-sm ml-8">
               <button onClick={() => scrollToSection('menu')} className="opacity-80 hover:opacity-100 transition">{T[lang].navMenu}</button>
               <button onClick={() => scrollToSection('about')} className="opacity-80 hover:opacity-100 transition">{T[lang].navAbout}</button>
               <button onClick={() => scrollToSection('contact')} className="opacity-80 hover:opacity-100 transition">{T[lang].navContact}</button>
            </nav>
            <div className="flex items-center gap-3 ml-auto">
              <button onClick={() => setTrackOpen(true)} className="hidden sm:flex relative items-center gap-2 px-3 py-2 rounded-full text-sm font-medium border border-white/30 hover:bg-white/20 transition"><Search size={16} /> {T[lang].trackOrder}</button>
              <button onClick={() => setCartOpen(true)} className="bg-[#93b45b] text-white px-4 py-2 rounded-full flex items-center gap-2 font-bold text-sm hover:opacity-90 transition shadow-lg"><ShoppingBag size={18}/> {cart.length > 0 && <span className="bg-white text-[#7a964a] w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold">{cart.length}</span>}</button>
            </div>
          </div>
        </header>

        <section className="px-4 flex flex-col justify-center items-center text-center max-w-4xl mx-auto text-white min-h-[75vh] md:min-h-[85vh]">
          <h1 className="font-display text-5xl md:text-7xl font-bold mb-4 drop-shadow-2xl">{T[lang].heroTitle} <br/><span className="text-[#E6C472] italic font-normal drop-shadow-lg">{T[lang].heroSub}</span></h1>
          <p className="font-display text-2xl mb-6 text-[#E6C472] italic opacity-90">"{T[lang].slogan}"</p>
          <p className="text-white/95 text-base md:text-lg leading-relaxed drop-shadow-md max-w-2xl mx-auto">{T[lang].heroDesc}</p>
        </section>

        <div className="flex-1 bg-[#FBF9F2] rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.3)] pb-20">
          
          <div id="menu">
            <nav className="sticky top-[60px] z-20 bg-[#FBF9F2]/90 backdrop-blur-md border-b border-gray-200 rounded-t-3xl pt-4">
              <div className="max-w-6xl mx-auto px-4 py-3 flex overflow-x-auto gap-2 scroll-hide">
                {CATEGORIES.map(c => ( <button key={c.id} onClick={() => pickCategory(c.id)} className={`shrink-0 px-5 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition ${activeCat === c.id ? 'bg-[#93b45b] text-white shadow-md' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'}`}><span>{c.icon}</span> {lang === 'EN' ? c.name : c.namePl}</button> ))}
              </div>
            </nav>
            <main className="max-w-6xl mx-auto px-4 py-10 space-y-12">
              {CATEGORIES.map((c, index) => {
                const items = MENU_ITEMS[c.id] || []; 
                if(items.length === 0) return null;
                const quoteText = index === 2 ? T[lang].q1 : index === 5 ? T[lang].q2 : index === 8 ? T[lang].q3 : null;

                return (
                  <React.Fragment key={c.id}>
                    <section ref={el => sectionRefs.current[c.id] = el}>
                      <h2 className="font-display text-3xl font-bold mb-6 flex items-center gap-3 text-[#16261B]"><span className="text-2xl">{c.icon}</span> {lang === 'EN' ? c.name : c.namePl}</h2>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {items.map(it => (
                          <button key={it.id} onClick={() => setOpenItem({ item: it, category: c })} className="bg-white rounded-3xl border border-gray-100 text-left hover:shadow-xl transition-all group relative overflow-hidden text-[#16261B] flex flex-col h-full">
                            {c.id !== 'combo' && c.id !== 'drinks' && (
                              <div className="w-full h-48 bg-gray-100 relative overflow-hidden shrink-0">
                                <img src={it.image || `https://placehold.co/600x400/FBF9F2/7a964a?text=${encodeURIComponent(it.name)}`} alt={it.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                {it.popular && <div className="absolute top-3 right-3"><Badge tone="gold">Popular</Badge></div>}
                              </div>
                            )}
                            <div className="p-5 flex flex-col flex-1 w-full">
                              <h3 className="font-display font-bold text-xl mb-1">{it.name}</h3><p className="text-xs text-gray-500 line-clamp-2 mb-4 flex-1">{it.tagline}</p>
                              <div className="flex justify-between items-center w-full pt-3 border-t border-gray-50 mt-auto"><span className="font-bold text-lg text-[#7a964a]">{currency(it.sizes[0].price)}</span><span className="w-10 h-10 rounded-full bg-[#93b45b]/10 flex items-center justify-center text-[#93b45b] group-hover:bg-[#93b45b] group-hover:text-white transition"><Plus size={20}/></span></div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </section>
                    
                    {quoteText && (
                      <div className="py-12 px-4 text-center max-w-3xl mx-auto">
                        <Quote className="mx-auto text-[#93b45b]/20 mb-4" size={32} />
                        <p className="font-display text-xl md:text-2xl italic text-gray-500">"{quoteText}"</p>
                        <span className="block mt-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">— Gibran Khalil Gibran</span>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </main>
          </div>

          <section id="about" className="max-w-6xl mx-auto px-4 py-16 border-t border-gray-200">
             <h2 className="font-display text-4xl font-bold mb-10 text-center text-[#16261B]">{T[lang].navAbout}</h2>
             <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-xl border border-gray-100 flex flex-col md:flex-row gap-10 items-center">
                <div className="flex-1 space-y-5 text-gray-600 text-justify md:text-left"><h3 className="font-display text-3xl font-bold text-[#7a964a]">Liban w Szklance</h3><p className="leading-relaxed">{T[lang].aboutP1}</p><p className="leading-relaxed">{T[lang].aboutP2}</p><p className="leading-relaxed">{T[lang].aboutP3}</p><p className="leading-relaxed font-semibold text-gray-800">{T[lang].aboutP4}</p></div>
                <div className="w-full md:w-5/12 aspect-[4/3] bg-gray-100 rounded-3xl overflow-hidden relative shadow-inner"><img src="https://wixiouwhfthwahlqwatb.supabase.co/storage/v1/object/public/menu%20images/logo.jpeg" className="w-full h-full object-cover" alt="Liban w Szklance" /></div>
             </div>
          </section>

          <section id="contact" className="max-w-6xl mx-auto px-4 py-16 mb-12">
             <h2 className="font-display text-4xl font-bold mb-10 text-center text-[#16261B]">{T[lang].navContact}</h2>
             <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-xl border border-gray-100 flex flex-col justify-center space-y-8">
                   <div className="flex items-start gap-4"><div className="w-12 h-12 rounded-full bg-[#93b45b]/10 flex items-center justify-center text-[#7a964a] shrink-0"><MapPin size={24} /></div><div><h4 className="font-bold text-gray-400 uppercase text-xs tracking-widest mb-1">{T[lang].address}</h4><p className="font-semibold text-lg text-[#16261B]">Gagarina 31, 00-753 Warszawa</p></div></div>
                   <div className="flex items-start gap-4"><div className="w-12 h-12 rounded-full bg-[#93b45b]/10 flex items-center justify-center text-[#7a964a] shrink-0"><Clock size={24} /></div><div><h4 className="font-bold text-gray-400 uppercase text-xs tracking-widest mb-1">{T[lang].openingHours}</h4><p className="font-semibold text-[#16261B]">Mon - Thu: 11:00 - 21:00<br/>Fri - Sun: 11:00 - 22:00</p></div></div>
                   <div className="flex items-start gap-4"><div className="w-12 h-12 rounded-full bg-[#93b45b]/10 flex items-center justify-center text-[#7a964a] shrink-0"><Mail size={24} /></div><div><h4 className="font-bold text-gray-400 uppercase text-xs tracking-widest mb-1">Contact</h4><p className="font-semibold text-[#16261B]">+48 530022999<br/>libanwszklance@libanwszklance.pl</p></div></div>
                   <div className="pt-4 border-t border-gray-100 flex items-center gap-4"><span className="font-bold text-gray-400 uppercase text-xs tracking-widest">{T[lang].followUs}</span><a href="YOUR_INSTAGRAM_LINK" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-[#E4405F] hover:text-white transition shadow-sm"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg></a><a href="YOUR_FACEBOOK_LINK" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-[#1877F2] hover:text-white transition shadow-sm"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg></a></div>
                </div>
                <div className="bg-gray-200 rounded-[2rem] overflow-hidden min-h-[350px] shadow-inner border border-gray-100 relative"><iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2445.0116827038165!2d21.0346864!3d52.2068997!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x471ecd037b587a89%3A0xc36706e2329177b6!2sGagarina%2031%2C%2000-753%20Warszawa!5e0!3m2!1str!2spl!4v1713180000000!5m2!1str!2spl" width="100%" height="100%" style={{border:0, position:'absolute', top:0, left:0}} allowFullScreen="" loading="lazy"></iframe></div>
             </div>
          </section>
        </div>
      </div>

      {openItem && ( <ItemModal item={openItem.item} category={openItem.category} onClose={() => setOpenItem(null)} onAdd={addToCart} lang={lang} /> )}
      <CartDrawer open={cartOpen} cart={cart} onClose={() => setCartOpen(false)} onRemove={removeFromCart} onUpdateQty={updateQty} onCheckout={() => { setCartOpen(false); setCheckoutOpen(true); }} lang={lang} />
      {trackOpen && ( <TrackOrderModal onClose={() => setTrackOpen(false)} lang={lang} /> )}
      {checkoutOpen && ( <CheckoutModal cart={cart} lang={lang} serverTime={serverTime} onClose={() => setCheckoutOpen(false)} onAddUpsell={(item, catId) => addQuickItem(item, catId)} onPlaced={(order) => { setCheckoutOpen(false); setCart([]); setConfirmed(order); }} /> )}
      {confirmed && ( <OrderConfirmation order={confirmed} lang={lang} onContinue={() => setConfirmed(null)} /> )}
    </div>
  );
}