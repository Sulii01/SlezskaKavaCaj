/* Slezská káva a čaj – front-end e-shopu (statický, bez závislostí) */
(() => {
  'use strict';

  /* ------------------------------------------------------------------
     Konfigurace obchodu
     Ceny dopravy a hranice dopravy zdarma jsou UKÁZKOVÉ – před ostrým
     provozem je nahraďte skutečným ceníkem (viz NAVRH.md).
     ------------------------------------------------------------------ */
  const SHOP = {
    freeShippingFrom: 1500,
    shipping: [
      { id: 'osobni', name: 'Osobní odběr – Bystřice', note: 'Provozovna Bystřice 5, 739 95 · zdarma · zde je i výdejní místo Zásilkovny a PPL', price: 0 },
      { id: 'zasilkovna', name: 'Zásilkovna – výdejní místo', note: 'Výdejní místa a Z-BOXy po ČR a SK', price: 79, point: true },
      { id: 'ppl-shop', name: 'PPL Parcelshop', note: 'Výdejní místa PPL', price: 89, point: true },
      { id: 'zasilkovna-adresa', name: 'Zásilkovna – na adresu', note: 'Doručení domů', price: 109 },
      { id: 'ppl', name: 'PPL – na adresu', note: 'Kurýr PPL CZ', price: 119 },
    ],
    payment: [
      { id: 'prevod', name: 'Bankovním převodem', note: 'Platební údaje pošleme v potvrzení objednávky', price: 0 },
      { id: 'karta', name: 'Kartou online', note: 'Platební brána · Apple Pay · Google Pay', price: 0 },
      { id: 'dobirka', name: 'Dobírkou', note: 'Platba při převzetí zásilky', price: 39, notFor: ['osobni'] },
      { id: 'hotove', name: 'Hotově při osobním odběru', note: 'Na provozovně v Bystřici', price: 0, onlyFor: ['osobni'] },
    ],
  };

  // Otevírací doba prodejny a výdejního místa (0 = neděle)
  const HOURS = { 1: [9, 17], 2: [9, 17], 3: [9, 17], 4: [9, 17], 5: [9, 17], 6: [8, 11], 0: null };
  const DAYS = ['Neděle', 'Pondělí', 'Úterý', 'Středa', 'Čtvrtek', 'Pátek', 'Sobota'];
  const SHOP_PHONE = ['+420792370292', '792 370 292'];
  const VERSION = '4';

  const CATS = {
    kava: {
      title: 'Káva', lead: 'Čerstvě pražená káva z celého světa – jednodruhové arabiky, vzácné kávy, espresso směsi i ochucené kávy. Namelem vám ji přesně pro váš způsob přípravy.',
      subs: [
        ['top-arabica', 'Top arabica', 'Vzácné a sběratelské kávy z exotických oblastí.'],
        ['arabica', '100% Arabica', 'Jednodruhové kávy z Afriky, Asie a obou Amerik.'],
        ['espresso', 'Směsi espresso', 'Domácí směsi stvořené pro espresso s bohatou pěnou.'],
        ['ochucena', 'Ochucená káva', 'Zrnková káva s příchutí – od karamelu po Irish whisky.'],
        ['bez-kofeinu', 'Bez kofeinu', 'Plná chuť kávy bez kofeinu – i večer.'],
        ['akce', 'Akce', 'Výhodná balení za akční ceny.'],
        ['darky', 'Dárky', 'Dárkový kupon pro milovníky kávy a čaje.'],
      ],
    },
    caj: {
      title: 'Čaj', lead: 'Výběrové sypané čaje a čajové směsi, o kterých si myslíme, že stojí za to vyzkoušet.',
      subs: [
        ['cerny', 'Černý', 'Earl Grey, Yunnan i africká Rwanda.'],
        ['zeleny', 'Zelený', 'Organic China Gunpowder.'],
        ['yerba', 'Rooibos a Yerba maté', 'Povzbuzující maté z Argentiny.'],
        ['ovocny', 'Ovocný', 'Ovocné a bylinné směsi plné vůně.'],
      ],
    },
  };

  const ORIGINS = {
    'afrika': ['Afrika', 'Kolébka kávy. Etiopie a Keňa nabízejí výrazné květinové a ovocné tóny s živou, svěží kyselostí.'],
    'asie': ['Asie', 'Plné tělo, zemité a kořeněné tóny. Od indické monzunové kávy přes Papuu Novou Guineu až po Jemen a Sumatru.'],
    'stredni-amerika': ['Střední Amerika', 'Čistá a vyvážená chuť s jemnou kyselostí a tóny kakaa i ořechů – Guatemala, Kostarika, Honduras, Kuba a Jamajka.'],
    'jizni-amerika': ['Jižní Amerika', 'Klasika pro každý den. Brazílie, Kolumbie, Peru i Galapágy s čokoládovými a oříškovými tóny.'],
    'oceanie': ['Austrálie', 'Vzácná káva z plantáže Skybury v Queenslandu – jemná, nasládlá, bez výrazné kyselosti.'],
  };

  const GRIND_STYLE = [
    { s: 0, g: 0, bean: true },
    { s: 9, g: 4 },
    { s: 6, g: 3 },
    { s: 4, g: 2 },
    { s: 2.5, g: 1.5 },
  ];

  const IMG = 'assets/img/products/';
  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const nf = new Intl.NumberFormat('cs-CZ');
  const kc = (n) => `${nf.format(Math.round(n))} Kč`;
  const grams = (w) => (/kg$/.test(w) ? parseFloat(w) * 1000 : parseFloat(w));
  const wLabel = (w) => w.replace(/(\d)(k?g)$/, '$1 $2');
  const thumb = (p, i = 0) => `${IMG}thumb/${p.images[i] || p.images[0]}.webp`;
  const large = (p, i = 0) => `${IMG}${p.images[i] || p.images[0]}.webp`;
  const grindParts = (g) => {
    const [a, b] = g.split(/\s+-\s+/);
    return { title: a.charAt(0).toUpperCase() + a.slice(1), sub: b || 'celá zrna' };
  };

  const ICON = {
    search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    arrow: '<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    bag: '<svg viewBox="0 0 24 24"><path d="M6 7h12l-1 13H7L6 7Z"/><path d="M9 7a3 3 0 0 1 6 0"/></svg>',
    plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
    bean: '<svg viewBox="0 0 24 24"><ellipse cx="12" cy="12" rx="6.5" ry="9" transform="rotate(30 12 12)"/><path d="M9.5 5.5c3 3 .5 9 4.5 13"/></svg>',
    grind: '<svg viewBox="0 0 24 24"><path d="M6 9h12l-1.5 11h-9L6 9Z"/><path d="M8 9V6h8v3M12 6V3M10 3h4"/></svg>',
    truck: '<svg viewBox="0 0 24 24"><path d="M3 6h11v10H3zM14 9h4l3 3v4h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/></svg>',
    pin: '<svg viewBox="0 0 24 24"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/></svg>',
    globe: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9S14.5 18.4 12 21c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z"/></svg>',
    phone: '<svg viewBox="0 0 24 24"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z"/></svg>',
    mail: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
    id: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2"/><path d="M6 16c.6-1.6 1.7-2.4 3-2.4s2.4.8 3 2.4M15 10h3M15 13h3"/></svg>',
    check: '<svg viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7"/></svg>',
    info: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>',
    cup: '<svg viewBox="0 0 24 24"><path d="M4 9h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V9Z"/><path d="M17 11h1.5a2.5 2.5 0 0 1 0 5H17M8 3c-.8 1.2.8 2.3 0 3.5M12 3c-.8 1.2.8 2.3 0 3.5"/></svg>',
    leaf: '<svg viewBox="0 0 24 24"><path d="M5 19c0-8 5-13 15-14-1 10-6 15-14 15"/><path d="M5 19 13 11"/></svg>',
    box: '<svg viewBox="0 0 24 24"><path d="M3.5 7.5 12 3l8.5 4.5v9L12 21l-8.5-4.5v-9Z"/><path d="M3.5 7.5 12 12l8.5-4.5M12 12v9M7.8 5.2l8.5 4.6"/></svg>',
    clock: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    left: '<svg viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6"/></svg>',
    right: '<svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg>',
  };

  let PRODUCTS = [];
  let PAGES = {};
  const bySlug = (s) => PRODUCTS.find((p) => p.slug === s);

  /* ------------------------------------------------------------------ Košík */
  const CART_KEY = 'sk-cart-v1';
  const store = {
    get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* soukromé okno */ } },
  };
  let cart = store.get(CART_KEY, []);

  const lineKey = (l) => `${l.slug}|${l.weight || ''}|${l.grind || ''}`;
  const linePrice = (l) => {
    const p = bySlug(l.slug);
    if (!p) return 0;
    return l.weight && p.prices[l.weight] ? p.prices[l.weight] : p.price;
  };
  const cartTotal = () => cart.reduce((s, l) => s + linePrice(l) * l.qty, 0);
  const cartCount = () => cart.reduce((s, l) => s + l.qty, 0);

  function saveCart() {
    cart = cart.filter((l) => l.qty > 0 && bySlug(l.slug));
    store.set(CART_KEY, cart);
    renderCart();
  }

  function addToCart(slug, weight, grind, qty = 1) {
    const p = bySlug(slug);
    if (!p || !p.available) return;
    const line = { slug, weight: weight || p.weights?.[0] || '', grind: grind || p.grinds[0] || '', qty };
    const existing = cart.find((l) => lineKey(l) === lineKey(line));
    if (existing) existing.qty += qty; else cart.push(line);
    saveCart();
    const c = $('#cartCount');
    c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump');
    toast(`<img src="${thumb(p)}" alt=""><span><b>${esc(p.name)}</b> je v košíku</span><a href="#/pokladna">K pokladně</a>`);
  }

  function lineMeta(l) {
    const parts = [];
    if (l.weight) parts.push(wLabel(l.weight));
    if (l.grind) parts.push(grindParts(l.grind).title);
    return parts.join(' · ');
  }

  function cartLines(editable = true) {
    return cart.map((l, i) => {
      const p = bySlug(l.slug);
      return `<div class="citem">
        <a href="#/produkt/${p.slug}"><img src="${thumb(p)}" alt="" loading="lazy"></a>
        <div>
          <a class="citem__name" href="#/produkt/${p.slug}">${esc(p.name)}</a>
          <div class="citem__meta">${esc(lineMeta(l))}</div>
          ${editable ? `<div class="qty"><button data-qty="${i}" data-d="-1" aria-label="Ubrat">−</button><span>${l.qty}</span><button data-qty="${i}" data-d="1" aria-label="Přidat">+</button></div>
          <div><button class="citem__remove" data-remove="${i}">Odebrat</button></div>` : `<div class="citem__meta">${l.qty} ks × ${kc(linePrice(l))}</div>`}
        </div>
        <div class="citem__price">${kc(linePrice(l) * l.qty)}</div>
      </div>`;
    }).join('');
  }

  function freeShipHTML() {
    const total = cartTotal();
    const left = SHOP.freeShippingFrom - total;
    const pct = Math.min(100, (total / SHOP.freeShippingFrom) * 100);
    return `<div class="free-ship">${left > 0 ? `Do dopravy zdarma zbývá <b>${kc(left)}</b>` : '<b>Máte dopravu zdarma</b> 🎉'}
      <div class="free-ship__bar"><span style="width:${pct}%"></span></div></div>`;
  }

  function renderCart() {
    const count = cartCount();
    const c = $('#cartCount');
    c.textContent = count;
    c.hidden = count === 0;
    const body = $('#cartBody'), foot = $('#cartFoot');
    if (!cart.length) {
      body.innerHTML = `<div class="cart-empty">${ICON.bag}<h3>Košík je prázdný</h3><p>Vyberte si z naší čerstvě pražené kávy nebo výběrových čajů.</p>
        <p style="margin-top:22px"><a class="btn btn--dark" href="#/kava">Vybrat kávu ${ICON.arrow}</a></p></div>`;
      foot.hidden = true;
    } else {
      body.innerHTML = cartLines(true);
      foot.hidden = false;
      foot.innerHTML = `${freeShipHTML()}
        <div class="cart-sum"><span>Mezisoučet</span><strong>${kc(cartTotal())}</strong></div>
        <a class="btn btn--dark btn--block" href="#/pokladna">Pokračovat k pokladně ${ICON.arrow}</a>`;
    }
    if (route.name === 'pokladna') renderSummary();
  }

  document.addEventListener('click', (e) => {
    const q = e.target.closest('[data-qty]');
    if (q) {
      const l = cart[+q.dataset.qty];
      if (l) { l.qty = Math.max(0, l.qty + +q.dataset.d); saveCart(); }
      return;
    }
    const r = e.target.closest('[data-remove]');
    if (r) { cart.splice(+r.dataset.remove, 1); saveCart(); return; }
    const a = e.target.closest('[data-add]');
    if (a) { e.preventDefault(); addToCart(a.dataset.add); }
  });

  /* ------------------------------------------------------------------ UI: drawery, toast, hledání */
  let lastFocus = null;
  function openLayer(el) {
    lastFocus = document.activeElement;
    el.classList.add('is-open');
    el.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    setTimeout(() => ($('input', el) || $('[data-close]', el))?.focus(), 60);
  }
  function closeLayers() {
    $$('.drawer.is-open, .search.is-open').forEach((el) => { el.classList.remove('is-open'); el.setAttribute('aria-hidden', 'true'); });
    document.body.style.overflow = '';
    lastFocus?.focus?.();
  }
  $('#cartOpen').addEventListener('click', () => openLayer($('#cart')));
  $('#menuOpen').addEventListener('click', () => openLayer($('#menu')));
  $('#searchOpen').addEventListener('click', () => { openLayer($('#search')); renderSearch(''); });
  $$('.drawer, .search').forEach((el) => el.addEventListener('click', (e) => {
    if (e.target === el || e.target.closest('[data-close]') || e.target.closest('a[href^="#/"]')) closeLayers();
  }));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLayers();
    if (e.key === '/' && !/input|textarea/i.test(document.activeElement.tagName)) { e.preventDefault(); $('#searchOpen').click(); }
  });

  let toastTimer;
  function toast(html) {
    const t = $('#toast');
    t.innerHTML = html;
    t.classList.add('is-show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('is-show'), 3800);
  }

  const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const matches = (p, q) => norm(`${p.name} ${p.short} ${ORIGINS[p.origin]?.[0] || ''} ${p.category}`).includes(norm(q));
  function renderSearch(q) {
    const box = $('#searchResults');
    q = q.trim();
    if (!q) {
      box.innerHTML = `<p class="search__hint">Oblíbené: ${['Etiopie', 'Kolumbie', 'Karamel', 'Espresso', 'Zelený čaj', 'Bez kofeinu'].map((s) => `<button data-q="${s}">${s}</button>`).join('')}</p>`;
      return;
    }
    const res = PRODUCTS.filter((p) => matches(p, q)).slice(0, 12);
    box.innerHTML = res.length ? res.map((p) => `<a class="sres" href="#/produkt/${p.slug}"><img src="${thumb(p)}" alt="" loading="lazy"><div><b>${esc(p.name)}</b><span>od ${kc(p.price)}</span></div></a>`).join('')
      : `<p class="search__hint">Pro „${esc(q)}“ jsme nic nenašli. Zkuste jiný výraz.</p>`;
  }
  $('#searchInput').addEventListener('input', (e) => renderSearch(e.target.value));
  $('#searchResults').addEventListener('click', (e) => {
    const b = e.target.closest('[data-q]');
    if (b) { $('#searchInput').value = b.dataset.q; renderSearch(b.dataset.q); }
  });

  // ukázkové formuláře (newsletter, kontakt)
  document.addEventListener('submit', (e) => {
    const f = e.target.closest('[data-demo-form]');
    if (!f) return;
    e.preventDefault();
    toast(`${ICON.check}<span>${esc(f.dataset.demoForm)}</span>`);
    f.reset();
  });

  const header = $('#header');
  addEventListener('scroll', () => header.classList.toggle('is-scrolled', scrollY > 10), { passive: true });

  /* ------------------------------------------------------------------ Komponenty */
  function badges(p) {
    const b = [];
    if (!p.available) b.push('<span class="badge badge--muted">Nedostupné</span>');
    if (p.category === 'akce') b.push('<span class="badge badge--caramel">Akce 1+1 kg</span>');
    if (p.category === 'top-arabica') b.push('<span class="badge badge--dark">Top arabica</span>');
    if (p.top && p.top <= 4) b.push('<span class="badge">Bestseller</span>');
    if (p.category === 'bez-kofeinu') b.push('<span class="badge badge--leaf">Bez kofeinu</span>');
    return b.length ? `<div class="badges">${b.join('')}</div>` : '';
  }

  function subtitle(p) {
    if (p.origin && ORIGINS[p.origin]) return ORIGINS[p.origin][0];
    const sub = [...CATS.kava.subs, ...CATS.caj.subs].find((s) => s[0] === p.category);
    return sub ? sub[1] : '';
  }

  function card(p) {
    const firstW = p.weights[0];
    return `<article class="card">
      <a class="card__media" href="#/produkt/${p.slug}" aria-label="${esc(p.name)}">
        <img src="${thumb(p)}" alt="${esc(p.name)}" loading="lazy" width="640" height="480">
        ${p.images[1] ? `<img src="${thumb(p, 1)}" alt="" loading="lazy" aria-hidden="true">` : ''}
      </a>
      ${badges(p)}
      ${p.available ? `<button class="card__add" data-add="${p.slug}" aria-label="Přidat ${esc(p.name)} do košíku">${ICON.plus}<span>Do košíku</span></button>` : ''}
      <div class="card__body">
        <span class="card__origin">${esc(subtitle(p))}</span>
        <h3 class="card__name"><a href="#/produkt/${p.slug}">${esc(p.name)}</a></h3>
        <p class="card__short">${esc(p.short)}</p>
        <p class="card__price">${p.weights.length > 1 ? '<small>od</small> ' : ''}${kc(p.price)} ${firstW ? `<small>/ ${wLabel(firstW)}</small>` : ''}</p>
      </div>
    </article>`;
  }

  function grindDots(i) {
    const g = GRIND_STYLE[i] || GRIND_STYLE[0];
    if (g.bean) return `<span class="gdots" style="--g:3px">${'<i style="width:9px;height:12px;border-radius:50%"></i>'.repeat(3)}</span>`;
    const n = Math.floor(40 / (g.s + g.g)) * Math.floor(22 / (g.s + g.g));
    return `<span class="gdots" style="--s:${g.s}px;--g:${g.g}px">${'<i></i>'.repeat(Math.min(n, 60))}</span>`;
  }

  function rail(id, items) {
    return `<div class="rail" id="${id}">${items.map(card).join('')}</div>`;
  }
  function railNav(id) {
    return `<div class="rail-nav"><button data-rail="${id}" data-dir="-1" aria-label="Předchozí">${ICON.left}</button><button data-rail="${id}" data-dir="1" aria-label="Další">${ICON.right}</button></div>`;
  }
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-rail]');
    if (!b) return;
    const r = document.getElementById(b.dataset.rail);
    r.scrollBy({ left: r.clientWidth * 0.8 * +b.dataset.dir, behavior: 'smooth' });
  });

  const crumbs = (items) => `<nav class="crumbs" aria-label="Drobečková navigace"><a href="#/">Domů</a>${items.map(([h, t]) => `<span aria-hidden="true">/</span>${h ? `<a href="${h}">${esc(t)}</a>` : `<span>${esc(t)}</span>`}`).join('')}</nav>`;

  /* ------------------------------------------------------------------ Stránky */
  const coffee = () => PRODUCTS.filter((p) => p.type === 'kava');
  const tea = () => PRODUCTS.filter((p) => p.type === 'caj');

  function pageHome() {
    const top = PRODUCTS.filter((p) => p.top).sort((a, b) => a.top - b.top);
    const origins = Object.keys(ORIGINS).map((k) => [k, coffee().filter((p) => p.origin === k && p.category !== 'akce')]);
    const rare = ['kopi-luwak-sumatra-kava', 'jamajka-blue-mountain-kava', 'ecuador-galapagos-kava'].map(bySlug);
    const promo = bySlug('ethiopia-djimmah-1-1kg');
    const cnt = (c) => PRODUCTS.filter((p) => p.category === c).length;

    return `
    <section class="hero">
      <picture>
        <source media="(max-width: 720px)" srcset="assets/img/brand/arabica-1-m.webp">
        <img class="hero__img" src="assets/img/brand/arabica-1.webp" alt="Ruka s čerstvě praženými kávovými zrny nad pražičkou" fetchpriority="high">
      </picture>
      <div class="wrap">
        <div class="hero__content">
          <span class="eyebrow eyebrow--light">Slezská káva a čaj</span>
          <h1>Vítejte ve světě <em>kávy</em> a čaje</h1>
          <p class="hero__lead">Čerstvě pražená káva z celého světa, výběrové čaje a čajové směsi, o kterých si myslíme, že stojí za to vyzkoušet. Kávu vám nameleme přesně pro váš kávovar.</p>
          <div class="hero__ctas">
            <a class="btn btn--caramel" href="#/kava">Vybrat kávu ${ICON.arrow}</a>
            <a class="btn btn--ghost" href="#/caj">Objevit čaje</a>
          </div>
          <a class="hero__hours" href="#/vydejni-misto">
            <span class="hero__hours-ic">${ICON.clock}</span>
            <span><small>Prodejna a výdejní místo Zásilkovny a PPL · Bystřice 5</small>
            <span class="hero__hours-status" data-open-status>${openStatus()}</span>
            <span class="hero__hours-week">Po–Pá <b>9:00–17:00</b> · So <b>8:00–11:00</b> · Ne zavřeno</span></span>
          </a>
        </div>
      </div>
      <div class="hero__stats"><div class="wrap"><div class="stats">
        <div><b>${coffee().length}</b><span>druhů kávy</span></div>
        <div><b>${new Set(coffee().map((p) => p.origin).filter(Boolean)).size}</b><span>kontinentů původu</span></div>
        <div><b>5</b><span>stupňů mletí</span></div>
        <div class="topbar__hide-sm"><b>${tea().length}</b><span>výběrových čajů</span></div>
      </div></div></div>
    </section>

    <div class="usps">
      <div class="usp"><span class="usp__ic">${ICON.bean}</span><div><b>Čerstvě pražená</b><span>Káva z celého světa</span></div></div>
      <div class="usp"><span class="usp__ic">${ICON.grind}</span><div><b>Mletí na míru</b><span>Od zrnkové po džezvu</span></div></div>
      <div class="usp"><span class="usp__ic">${ICON.truck}</span><div><b>Zásilkovna a PPL</b><span>Doručení po ČR a SK</span></div></div>
      <a class="usp" href="#/vydejni-misto"><span class="usp__ic">${ICON.pin}</span><div><b>Výdejní místo</b><span>Zásilkovna a PPL v Bystřici</span></div></a>
    </div>

    <section class="section">
      <div class="wrap">
        <div class="sec-head reveal">
          <div><span class="eyebrow">Sortiment</span><h2>Najděte svou <em>oblíbenou</em> chuť</h2></div>
          <a class="link-arrow" href="#/kava">Celá nabídka kávy ${ICON.arrow}</a>
        </div>
        <div class="cats">
          <a class="cat cat--a reveal" href="#/kava/arabica"><img src="assets/img/brand/arabica-1-m.webp" alt="" loading="lazy"><span class="cat__count">${cnt('arabica')} druhů</span><span class="cat__go">${ICON.arrow}</span><h3>100% Arabica</h3><p>Vyzkoušejte špičkové výběrové kávy, které zákazníci milují – a vy budete také.</p></a>
          <a class="cat cat--b reveal" href="#/kava/top-arabica"><img src="${IMG}thumb/1011-2-jamaica-blue-mountain-2.webp" alt="" loading="lazy"><span class="cat__count">${cnt('top-arabica')} rarit</span><span class="cat__go">${ICON.arrow}</span><h3>Top arabica</h3><p>Jamajka, Jemen, Galapágy, Kopi Luwak</p></a>
          <a class="cat cat--c reveal" href="#/kava/ochucena"><img src="${IMG}thumb/1023-4-visen-v-rumu--2.webp" alt="" loading="lazy"><span class="cat__count">${cnt('ochucena')} příchutí</span><span class="cat__go">${ICON.arrow}</span><h3>Ochucená káva</h3><p>Od karamelu po višeň v rumu</p></a>
          <a class="cat cat--d reveal" href="#/kava/espresso"><img src="${IMG}thumb/1080-1-moravian--1.webp" alt="" loading="lazy"><span class="cat__count">${cnt('espresso')} směsi</span><span class="cat__go">${ICON.arrow}</span><h3>Směsi espresso</h3><p>Silesian, Moravian, Bohemian</p></a>
          <a class="cat cat--e reveal" href="#/caj"><img src="${IMG}thumb/1224-ovocny-kvetinova-zahrada-50g--hmotnost-50g.webp" alt="" loading="lazy"><span class="cat__count">${tea().length} čajů</span><span class="cat__go">${ICON.arrow}</span><h3>Čaj</h3><p>Černý, zelený, ovocný i yerba maté</p></a>
        </div>
      </div>
    </section>

    <section class="section section--cream">
      <div class="wrap">
        <div class="sec-head reveal">
          <div><span class="eyebrow">Top 10</span><h2>To nejoblíbenější <em>od nás</em></h2></div>
          ${railNav('railTop')}
        </div>
        ${rail('railTop', top)}
      </div>
    </section>

    <section class="section section--tight">
      <div class="wrap manifest reveal">
        <span class="eyebrow">Naše filozofie</span>
        <p>Káva, její vůně, její příprava i celá její kultura – to je <em>jedno velké kouzlo</em>. S výběrem vám rádi poradíme.</p>
      </div>
    </section>

    <section class="section" style="padding-top:20px">
      <div class="wrap">
        <div class="sec-head reveal">
          <div><span class="eyebrow">Káva z celého světa</span><h2>Vydejte se na <em>cestu</em> za chutí</h2></div>
        </div>
        <div class="tabs reveal" role="tablist">
          ${origins.map(([k, list], i) => `<button class="tab${i === 0 ? ' is-active' : ''}" role="tab" data-origin="${k}">${ORIGINS[k][0]} <small>${list.length}</small></button>`).join('')}
        </div>
        <div class="origin-wrap reveal">
          <div class="origin-info" id="originInfo"></div>
          <div id="originRail"></div>
        </div>
      </div>
    </section>

    <section class="section section--dark">
      <div class="wrap grind">
        <div>
          <div class="sec-head" style="margin-bottom:28px">
            <div><span class="eyebrow eyebrow--light">Mletí na míru</span><h2>Nameleme ji <em>přesně</em> pro váš kávovar</h2>
            <p>U každé kávy si vyberete jeden z pěti stupňů mletí – nebo si ji vezměte celou a umelte až těsně před přípravou.</p></div>
          </div>
          <div class="grind__steps">
            ${bySlug('brazil-santos-kava').grinds.map((g, i) => {
              const gp = grindParts(g), st = GRIND_STYLE[i];
              const dots = st.bean ? `<span class="gstep__dots gstep__dots--bean" style="--g:6px">${'<i></i>'.repeat(3)}</span>`
                : `<span class="gstep__dots" style="--s:${st.s * 1.2}px;--g:${st.g * 1.2}px">${'<i></i>'.repeat(Math.min(80, Math.floor(60 / (st.s * 1.2 + st.g * 1.2)) * Math.floor(36 / (st.s * 1.2 + st.g * 1.2))))}</span>`;
              return `<div class="gstep">${dots}<div><b>${esc(gp.title)}</b><span>${esc(gp.sub)}</span></div></div>`;
            }).join('')}
          </div>
        </div>
        <div class="grind__media reveal">
          <img src="${IMG}1077-1-colombia-supremo-decaf--1.webp" alt="Balení kávy Colombia Supremo se sklenicí zrn" loading="lazy">
          <div class="grind__note">${ICON.cup}<div><b>Nevíte si rady?</b>Napište nám, jak kávu připravujete, a doporučíme vám tu pravou.</div></div>
        </div>
      </div>
    </section>

    <section class="section section--cream">
      <div class="wrap">
        <div class="sec-head reveal">
          <div><span class="eyebrow">Top arabica</span><h2>Vzácné kávy pro <em>znalce</em></h2>
          <p>Kávy z nejvyhlášenějších a nejodlehlejších oblastí světa. Ideální i jako dárek.</p></div>
          <a class="link-arrow" href="#/kava/top-arabica">Všechny rarity ${ICON.arrow}</a>
        </div>
        <div class="rare">
          ${rare.map((p, i) => `<a class="rare__item reveal" href="#/produkt/${p.slug}">
            <img src="${i === 0 ? large(p, 1) : thumb(p, 1)}" alt="${esc(p.name)}" loading="lazy">
            <span class="eyebrow eyebrow--light">${esc(subtitle(p))}</span>
            <h3>${esc(p.name)}</h3>
            <p>${esc(p.short)}</p>
            <span class="rare__price">od ${kc(p.price)} <i>${ICON.arrow}</i></span>
          </a>`).join('')}
        </div>
      </div>
    </section>

    ${promo ? `<section class="section">
      <div class="wrap">
        <div class="promo reveal">
          <picture><source media="(max-width: 860px)" srcset="assets/img/brand/akce-kava-m.webp"><img class="promo__img" src="assets/img/brand/akce-kava.webp" alt="" loading="lazy"></picture>
          <div class="promo__body">
            <span class="eyebrow eyebrow--light">Dobrá zpráva – zlevněná káva</span>
            <h2>Ethiopia Djimmah <em style="white-space:nowrap">1 + 1 kg</em></h2>
            <p>${esc(promo.short)} Vychutnejte si vybrané kávy nyní za akční ceny.</p>
            <div class="promo__price">${kc(promo.price)} <small>za 2 kg kávy</small></div>
            <div><button class="btn btn--caramel" data-add="${promo.slug}">${ICON.bag} Přidat do košíku</button>
            <a class="btn btn--ghost" href="#/produkt/${promo.slug}" style="margin-left:8px">Detail</a></div>
          </div>
        </div>
      </div>
    </section>` : ''}

    ${pickupSection()}

    <section class="section section--leaf">
      <div class="wrap tea">
        <div class="tea__intro reveal">
          <span class="eyebrow">Výběrové čaje</span>
          <h2>Chvíle klidu v <em>každém šálku</em></h2>
          <p>Sypané černé, zelené i ovocné čaje a yerba maté. Balení 50, 100 i 200 g – vyzkoušejte menší a vraťte se pro větší.</p>
          <div class="tea__types">${CATS.caj.subs.map(([k, t]) => `<a href="#/caj/${k}">${t}</a>`).join('')}</div>
          <a class="btn btn--dark" href="#/caj">Všechny čaje ${ICON.arrow}</a>
        </div>
        <div>
          <div class="sec-head" style="margin-bottom:20px;justify-content:flex-end">${railNav('railTea')}</div>
          <div class="rail" id="railTea">${tea().filter((p) => p.available).sort((a, b) => (a.top || 99) - (b.top || 99)).map(card).join('')}</div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="wrap">
        <a class="journal reveal" href="#/blog/jak-vybrat-kavu">
          <div class="journal__img"><img src="${IMG}1041-2-ethiopia-sidamo--1.webp" alt="" loading="lazy"></div>
          <div class="journal__body">
            <span class="eyebrow">Blog o kávě</span>
            <h2>Jak vybrat kávu, která vám bude chutnat</h2>
            <p>Při výběru kávy je důležité zvážit několik faktorů – druh kávy, pražení, původ a preferovanou chuť.</p>
            <ol class="journal__list"><li>Druh kávy</li><li>Pražení</li><li>Původ</li><li>Čerstvost a skladování</li></ol>
            <span class="link-arrow">Přečíst článek ${ICON.arrow}</span>
          </div>
        </a>
      </div>
    </section>`;
  }

  function mountHome() {
    const show = (k) => {
      $$('[data-origin]').forEach((b) => b.classList.toggle('is-active', b.dataset.origin === k));
      const list = coffee().filter((p) => p.origin === k && p.category !== 'akce');
      $('#originInfo').innerHTML = `<span class="eyebrow">${list.length} ${list.length === 1 ? 'káva' : list.length < 5 ? 'kávy' : 'káv'}</span>
        <h3>${ORIGINS[k][0]}</h3><p>${ORIGINS[k][1]}</p>
        <a class="link-arrow" href="#/kava?puvod=${k}">Zobrazit vše ${ICON.arrow}</a>`;
      $('#originRail').innerHTML = `<div class="rail rail--3">${list.map(card).join('')}</div>`;
    };
    $$('[data-origin]').forEach((b) => b.addEventListener('click', () => show(b.dataset.origin)));
    show('afrika');
  }

  /* ---------- Katalog ---------- */
  const SORTS = { doporucene: 'Doporučené', levne: 'Od nejlevnějších', drahe: 'Od nejdražších', nazev: 'Podle názvu' };

  function pageCatalog(type, sub, params) {
    const C = CATS[type];
    const subInfo = C.subs.find((s) => s[0] === sub);
    const base = PRODUCTS.filter((p) => p.type === type);
    const origin = params.get('puvod');
    const title = subInfo ? subInfo[1] : (origin ? `Káva – ${ORIGINS[origin]?.[0] || ''}` : C.title);
    const lead = subInfo ? subInfo[2] : (origin ? ORIGINS[origin]?.[1] : C.lead);
    const qs = (o) => { const s = new URLSearchParams(params); Object.entries(o).forEach(([k, v]) => (v ? s.set(k, v) : s.delete(k))); const t = s.toString(); return t ? `?${t}` : ''; };
    const subHref = (k) => `#/${type}${k ? `/${k}` : ''}${qs({ puvod: '' })}`;
    const originsHere = type === 'kava' ? Object.keys(ORIGINS).filter((k) => base.some((p) => p.origin === k && (!sub || p.category === sub))) : [];

    return `
    <header class="phead ${type === 'kava' ? 'phead--dark' : ''}">
      <div class="wrap">
        ${crumbs(subInfo || origin ? [[`#/${type}`, C.title], [null, subInfo ? subInfo[1] : ORIGINS[origin]?.[0]]] : [[null, C.title]])}
        <h1>${esc(title)}</h1>
        <p>${esc(lead || '')}</p>
      </div>
    </header>
    <div class="wrap" style="padding-top:40px">
      <div class="chips">
        <a href="${subHref('')}" class="${!sub ? 'is-active' : ''}">Vše</a>
        ${C.subs.filter(([k]) => base.some((p) => p.category === k)).map(([k, t]) => `<a href="${subHref(k)}" class="${sub === k ? 'is-active' : ''}">${t}</a>`).join('')}
      </div>
      <div class="shop">
        <aside class="filters" aria-label="Filtry">
          <div class="fgroup"><h3>Kategorie</h3>
            <a href="${subHref('')}" class="${!sub ? 'is-active' : ''}">Vše <small>${base.length}</small></a>
            ${C.subs.map(([k, t]) => { const n = base.filter((p) => p.category === k).length; return n ? `<a href="${subHref(k)}" class="${sub === k ? 'is-active' : ''}">${t} <small>${n}</small></a>` : ''; }).join('')}
          </div>
          ${originsHere.length > 1 ? `<div class="fgroup"><h3>Původ</h3>
            <a href="#/${type}${sub ? `/${sub}` : ''}${qs({ puvod: '' })}" class="${!origin ? 'is-active' : ''}">Všechny</a>
            ${originsHere.map((k) => `<a href="#/${type}${sub ? `/${sub}` : ''}${qs({ puvod: k })}" class="${origin === k ? 'is-active' : ''}">${ORIGINS[k][0]} <small>${base.filter((p) => p.origin === k && (!sub || p.category === sub)).length}</small></a>`).join('')}
          </div>` : ''}
          <div class="fgroup"><h3>${type === 'kava' ? 'Hledáte čaj?' : 'Hledáte kávu?'}</h3>
            <a href="#/${type === 'kava' ? 'caj' : 'kava'}">${type === 'kava' ? 'Výběrové čaje' : 'Čerstvě pražená káva'} ${ICON.arrow}</a>
          </div>
        </aside>
        <div>
          <div class="toolbar">
            <span class="toolbar__count" id="count"></span>
            <div class="toolbar__right">
              <label class="field-search">${ICON.search}<span class="sr-only">Hledat v kategorii</span><input type="search" id="filterQ" placeholder="Hledat…" value="${esc(params.get('q') || '')}"></label>
              <label><span class="sr-only">Řazení</span><select class="select" id="sort">${Object.entries(SORTS).map(([k, v]) => `<option value="${k}"${params.get('razeni') === k ? ' selected' : ''}>${v}</option>`).join('')}</select></label>
            </div>
          </div>
          <div class="grid grid--3" id="results"></div>
        </div>
      </div>
    </div>`;
  }

  function mountCatalog(type, sub, params) {
    const origin = params.get('puvod');
    const run = () => {
      const q = $('#filterQ').value.trim();
      const sort = $('#sort').value;
      let list = PRODUCTS.filter((p) => p.type === type && (!sub || p.category === sub) && (!origin || p.origin === origin) && (!q || matches(p, q)));
      if (sort === 'levne') list.sort((a, b) => a.price - b.price);
      if (sort === 'drahe') list.sort((a, b) => b.price - a.price);
      if (sort === 'nazev') list.sort((a, b) => a.name.localeCompare(b.name, 'cs'));
      if (sort === 'doporucene') list.sort((a, b) => (b.available - a.available) || ((a.top || 99) - (b.top || 99)));
      $('#results').innerHTML = list.length ? list.map(card).join('') : '<p class="empty">Žádný produkt neodpovídá vašemu výběru.</p>';
      $('#count').textContent = `${list.length} ${list.length === 1 ? 'produkt' : list.length < 5 && list.length ? 'produkty' : 'produktů'}`;
    };
    $('#filterQ').addEventListener('input', run);
    $('#sort').addEventListener('change', run);
    run();
  }

  /* ---------- Detail produktu ---------- */
  function pageProduct(slug) {
    const p = bySlug(slug);
    if (!p) return pageNotFound();
    const C = CATS[p.type];
    const sub = C.subs.find((s) => s[0] === p.category);
    const w0 = p.weights[0];
    const related = PRODUCTS.filter((x) => x.slug !== p.slug && x.category === p.category && x.available).slice(0, 4);
    const more = related.length < 4 ? PRODUCTS.filter((x) => x.type === p.type && x.slug !== p.slug && !related.includes(x) && x.available && x.top).slice(0, 4 - related.length) : [];
    const facts = [
      ['Kategorie', sub ? sub[1] : C.title],
      p.origin ? ['Původ', ORIGINS[p.origin][0]] : null,
      p.weights.length ? ['Balení', p.weights.map(wLabel).join(', ')] : null,
      p.grinds.length ? ['Mletí', `${p.grinds.length} stupňů dle výběru`] : null,
      ['Dostupnost', p.available ? 'Skladem' : 'Momentálně nedostupné'],
    ].filter(Boolean);

    return `
    <div class="wrap" style="padding-top:28px">
      ${crumbs([[`#/${p.type}`, C.title], sub ? [`#/${p.type}/${sub[0]}`, sub[1]] : null, [null, p.name]].filter(Boolean))}
      <div class="pd">
        <div class="gallery ${p.images.length < 2 ? 'gallery--single' : ''}">
          <div class="gallery__main" id="gMain"><img src="${large(p)}" alt="${esc(p.name)}" id="gImg"></div>
          ${p.images.length > 1 ? `<div class="gallery__thumbs">${p.images.map((_, i) => `<button class="${i === 0 ? 'is-active' : ''}" data-img="${i}" aria-label="Obrázek ${i + 1}"><img src="${thumb(p, i)}" alt=""></button>`).join('')}</div>` : ''}
        </div>
        <div>
          <div class="pd__top">${badges(p).replace('<div class="badges">', '').replace(/<\/div>$/, '')}${p.origin ? `<span class="badge badge--muted">${ICON.globe.replace('<svg', '<svg style="width:12px;height:12px;vertical-align:-2px;margin-right:4px"')}${ORIGINS[p.origin][0]}</span>` : ''}</div>
          <h1>${esc(p.name)}</h1>
          <p class="pd__short">${esc(p.short)}</p>
          <div class="pd__price">
            <strong id="pPrice">${kc(w0 ? p.prices[w0] : p.price)}</strong>
            <span id="pUnit"></span>
            <span class="pd__stock ${p.available ? '' : 'pd__stock--no'}">${p.available ? 'Skladem' : 'Momentálně nedostupné'}</span>
          </div>
          ${p.weights.length ? `<div class="opt"><div class="opt__label">Hmotnost <span id="wSel">${wLabel(w0)}</span></div>
            <div class="opt__row">${p.weights.map((w, i) => `<button class="pill${i === 0 ? ' is-active' : ''}" data-w="${w}"><b>${wLabel(w)}</b><small>${kc(p.prices[w])}</small></button>`).join('')}</div></div>` : ''}
          ${p.grinds.length ? `<div class="opt"><div class="opt__label">Mletí <span id="gSel">${esc(grindParts(p.grinds[0]).title)}</span></div>
            <div class="grinds">${p.grinds.map((g, i) => { const gp = grindParts(g); return `<button class="pill${i === 0 ? ' is-active' : ''}" data-g="${i}">${grindDots(i)}<b>${esc(gp.title.replace(' mletá', ''))}</b><small>${esc(gp.sub)}</small></button>`; }).join('')}</div></div>` : ''}
          <div class="pd__buy">
            <div class="qty qty--lg"><button data-q="-1" aria-label="Ubrat">−</button><input id="pQty" value="1" inputmode="numeric" aria-label="Množství"><button data-q="1" aria-label="Přidat">+</button></div>
            <button class="btn btn--dark" id="pAdd" ${p.available ? '' : 'disabled'}>${ICON.bag} ${p.available ? 'Přidat do košíku' : 'Nedostupné'}</button>
          </div>
          <div class="perks">
            <div>${ICON.bean} Čerstvě pražená a balená pro vaši objednávku</div>
            <div>${ICON.truck} Zásilkovna, PPL – doručení po ČR a SK</div>
            <div>${ICON.pin} Osobní odběr zdarma v Bystřici – jsme i <a href="#/vydejni-misto" style="text-decoration:underline">výdejní místo Zásilkovny a PPL</a></div>
          </div>
        </div>
      </div>
      ${p.description ? `<section class="desc-wrap">
        <div class="desc"><h2>O produktu</h2><div class="prose">${p.description}</div></div>
        <aside class="facts"><h3>Parametry</h3><dl>${facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl></aside>
      </section>` : ''}
      ${related.length + more.length ? `<section class="section" style="padding-top:20px">
        <div class="sec-head"><div><span class="eyebrow">Mohlo by vám chutnat</span><h2>Podobné <em>produkty</em></h2></div></div>
        <div class="grid">${[...related, ...more].map(card).join('')}</div>
      </section>` : ''}
    </div>
    <div class="sticky-buy" id="stickyBuy"><div><b>${esc(p.name)}</b><span id="sbMeta"></span></div><button class="btn btn--dark btn--sm" id="sbAdd" ${p.available ? '' : 'disabled'}>Do košíku</button></div>`;
  }

  function mountProduct(slug) {
    const p = bySlug(slug);
    if (!p) return;
    let w = p.weights[0] || '', g = 0;
    const update = () => {
      const price = w ? p.prices[w] : p.price;
      $('#pPrice').textContent = kc(price);
      $('#pUnit').textContent = w ? `${kc((price / grams(w)) * 100)} / 100 g` : '';
      if ($('#wSel')) $('#wSel').textContent = wLabel(w);
      if ($('#gSel')) $('#gSel').textContent = grindParts(p.grinds[g]).title;
      $('#sbMeta').textContent = `${kc(price)}${w ? ` · ${wLabel(w)}` : ''}`;
    };
    $$('[data-w]').forEach((b) => b.addEventListener('click', () => { w = b.dataset.w; $$('[data-w]').forEach((x) => x.classList.toggle('is-active', x === b)); update(); }));
    $$('[data-g]').forEach((b) => b.addEventListener('click', () => { g = +b.dataset.g; $$('[data-g]').forEach((x) => x.classList.toggle('is-active', x === b)); update(); }));
    const qty = $('#pQty');
    $$('[data-q]').forEach((b) => b.addEventListener('click', () => { qty.value = Math.max(1, (parseInt(qty.value, 10) || 1) + +b.dataset.q); }));
    const add = () => addToCart(p.slug, w, p.grinds[g] || '', Math.max(1, parseInt(qty.value, 10) || 1));
    $('#pAdd').addEventListener('click', add);
    $('#sbAdd').addEventListener('click', add);
    $$('[data-img]').forEach((b) => b.addEventListener('click', () => {
      $('#gImg').src = large(p, +b.dataset.img);
      $$('[data-img]').forEach((x) => x.classList.toggle('is-active', x === b));
    }));
    const main = $('#gMain');
    main.addEventListener('click', () => main.classList.toggle('is-zoom'));
    main.addEventListener('mousemove', (e) => {
      if (!main.classList.contains('is-zoom')) return;
      const r = main.getBoundingClientRect();
      $('#gImg').style.transformOrigin = `${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`;
    });
    const sb = $('#stickyBuy');
    const io = new IntersectionObserver(([en]) => sb.classList.toggle('is-show', !en.isIntersecting && en.boundingClientRect.top < 0));
    io.observe($('#pAdd'));
    observers.push(io);
    update();
  }

  /* ---------- Pokladna ---------- */
  const checkout = store.get('sk-checkout', { ship: 'zasilkovna', pay: 'prevod' });

  function pageCheckout() {
    if (!cart.length) {
      return `<div class="wrap thanks"><div class="thanks__ic" style="background:var(--cream);color:var(--muted)">${ICON.bag}</div>
        <h1>Košík je prázdný</h1><p>Než budete pokračovat k pokladně, vyberte si něco dobrého.</p>
        <p style="margin-top:28px"><a class="btn btn--dark" href="#/kava">Vybrat kávu ${ICON.arrow}</a> <a class="btn btn--outline" href="#/caj">Vybrat čaj</a></p></div>`;
    }
    return `
    <header class="phead"><div class="wrap">${crumbs([[null, 'Pokladna']])}<h1>Pokladna</h1></div></header>
    <div class="wrap">
      <form class="co" id="coForm" novalidate>
        <div>
          <div class="notice">${ICON.info}<div><b>Ukázková pokladna.</b> Objednávka se zatím nikam neodesílá. Ceny dopravy a hranice dopravy zdarma jsou orientační – napojení na platební bránu a dopravce popisuje návrh řešení.</div></div>
          <div class="box">
            <h2>1. Doprava</h2>
            ${SHOP.shipping.map((s) => `<label class="radio"><input type="radio" name="ship" value="${s.id}" ${checkout.ship === s.id ? 'checked' : ''}>
              <span><b>${s.name}</b><small>${s.note}</small></span><em data-ship-price="${s.id}"></em>
              ${s.point ? `<span class="radio__extra f"><input name="point_${s.id}" placeholder="Vyberte výdejní místo (např. Třinec, Lidická 1)" aria-label="Výdejní místo"></span>` : ''}
            </label>`).join('')}
          </div>
          <div class="box">
            <h2>2. Platba</h2>
            ${SHOP.payment.map((s) => `<label class="radio" data-pay-row="${s.id}"><input type="radio" name="pay" value="${s.id}" ${checkout.pay === s.id ? 'checked' : ''}>
              <span><b>${s.name}</b><small>${s.note}</small></span><em>${s.price ? `+ ${kc(s.price)}` : 'zdarma'}</em></label>`).join('')}
          </div>
          <div class="box">
            <h2>3. Kontaktní údaje</h2>
            <div class="fields">
              <div class="f"><label for="fName">Jméno a příjmení</label><input id="fName" name="name" required autocomplete="name"></div>
              <div class="f"><label for="fPhone">Telefon</label><input id="fPhone" name="phone" type="tel" required autocomplete="tel" placeholder="+420"></div>
              <div class="f full"><label for="fEmail">E-mail</label><input id="fEmail" name="email" type="email" required autocomplete="email"></div>
              <div class="f full"><label for="fStreet">Ulice a číslo popisné</label><input id="fStreet" name="street" autocomplete="street-address"></div>
              <div class="f"><label for="fCity">Město</label><input id="fCity" name="city" autocomplete="address-level2"></div>
              <div class="f"><label for="fZip">PSČ</label><input id="fZip" name="zip" autocomplete="postal-code" inputmode="numeric"></div>
              <div class="f full"><label for="fCountry">Země</label><select id="fCountry" name="country"><option>Česká republika</option><option>Slovensko</option></select></div>
              <div class="f full"><label for="fNote">Poznámka k objednávce</label><textarea id="fNote" name="note" placeholder="Např. preferovaný čas doručení"></textarea></div>
            </div>
            <label class="check"><input type="checkbox" name="news"> Chci dostávat novinky a slevy e-mailem</label>
          </div>
        </div>
        <aside class="summary" id="summary"></aside>
      </form>
    </div>`;
  }

  function orderCalc() {
    const ship = SHOP.shipping.find((s) => s.id === checkout.ship) || SHOP.shipping[0];
    const pay = SHOP.payment.find((s) => s.id === checkout.pay) || SHOP.payment[0];
    const goods = cartTotal();
    const shipPrice = goods >= SHOP.freeShippingFrom ? 0 : ship.price;
    return { ship, pay, goods, shipPrice, payPrice: pay.price, total: goods + shipPrice + pay.price };
  }

  function renderSummary() {
    const box = $('#summary');
    if (!box) return;
    if (!cart.length) { render(); return; }
    const o = orderCalc();
    const agreed = $('[name=terms]', box)?.checked;
    $$('[data-ship-price]').forEach((el) => {
      const s = SHOP.shipping.find((x) => x.id === el.dataset.shipPrice);
      el.textContent = s.price === 0 || o.goods >= SHOP.freeShippingFrom ? 'zdarma' : kc(s.price);
    });
    box.innerHTML = `<h2>Shrnutí</h2>
      ${cartLines(true)}
      <div style="margin-top:16px">${freeShipHTML()}</div>
      <div class="sum-row"><span>Zboží</span><b>${kc(o.goods)}</b></div>
      <div class="sum-row"><span>${esc(o.ship.name)}</span><b>${o.shipPrice ? kc(o.shipPrice) : 'zdarma'}</b></div>
      <div class="sum-row"><span>${esc(o.pay.name)}</span><b>${o.payPrice ? kc(o.payPrice) : 'zdarma'}</b></div>
      <div class="sum-total"><span>Celkem s DPH</span><strong>${kc(o.total)}</strong></div>
      <button class="btn btn--dark btn--block" type="submit">Objednat s povinností platby</button>
      <label class="check"><input type="checkbox" required name="terms"${agreed ? ' checked' : ''}> <span>Souhlasím s <a href="#/obchodni-podminky" target="_blank">obchodními podmínkami</a> a beru na vědomí <a href="#/ochrana-udaju" target="_blank">zásady ochrany osobních údajů</a>.</span></label>`;
  }

  function syncPayRules() {
    SHOP.payment.forEach((p) => {
      const row = $(`[data-pay-row="${p.id}"]`);
      const off = (p.onlyFor && !p.onlyFor.includes(checkout.ship)) || (p.notFor && p.notFor.includes(checkout.ship));
      row.classList.toggle('is-disabled', !!off);
      $('input', row).disabled = !!off;
      if (off && checkout.pay === p.id) {
        checkout.pay = 'prevod';
        $('[name=pay][value=prevod]').checked = true;
      }
    });
    const addr = checkout.ship !== 'osobni';
    ['fStreet', 'fCity', 'fZip'].forEach((id) => { $(`#${id}`).required = addr && !SHOP.shipping.find((s) => s.id === checkout.ship).point; });
  }

  function mountCheckout() {
    const form = $('#coForm');
    if (!form) return;
    form.addEventListener('change', (e) => {
      if (e.target.name === 'ship') checkout.ship = e.target.value;
      if (e.target.name === 'pay') checkout.pay = e.target.value;
      store.set('sk-checkout', checkout);
      syncPayRules();
      renderSummary();
    });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      const o = orderCalc();
      const order = {
        id: `${new Date().getFullYear()}${String(Date.now()).slice(-6)}`,
        lines: cart.map((l) => ({ ...l, name: bySlug(l.slug).name, price: linePrice(l) })),
        ship: o.ship.name, pay: o.pay.name, total: o.total,
        email: form.email.value,
      };
      store.set('sk-last-order', order);
      cart = [];
      saveCart();
      location.hash = '#/dekujeme';
    });
    syncPayRules();
    renderSummary();
  }

  function pageThanks() {
    const o = store.get('sk-last-order', null);
    if (!o) return pageNotFound();
    return `<div class="wrap thanks">
      <div class="thanks__ic">${ICON.check}</div>
      <span class="eyebrow">Objednávka č. ${esc(o.id)}</span>
      <h1 style="margin-top:14px">Děkujeme za objednávku!</h1>
      <p>Potvrzení jsme (v ostrém provozu) poslali na <b>${esc(o.email)}</b>. Kávu pro vás čerstvě připravíme a dáme vědět, jakmile bude na cestě.</p>
      <div class="box">
        ${o.lines.map((l) => `<div class="sum-row"><span>${l.qty}× ${esc(l.name)} ${l.weight ? `(${wLabel(l.weight)})` : ''}</span><b>${kc(l.price * l.qty)}</b></div>`).join('')}
        <div class="sum-row"><span>Doprava</span><b>${esc(o.ship)}</b></div>
        <div class="sum-row"><span>Platba</span><b>${esc(o.pay)}</b></div>
        <div class="sum-total"><span>Celkem</span><strong>${kc(o.total)}</strong></div>
      </div>
      <a class="btn btn--dark" href="#/">Zpět do obchodu ${ICON.arrow}</a>
    </div>`;
  }

  /* ---------- Obsahové stránky ---------- */
  function pageAbout() {
    return `
    <header class="phead"><div class="wrap">${crumbs([[null, 'O nás']])}</div></header>
    <div class="wrap">
      <div class="about-hero">
        <div class="reveal">
          <span class="eyebrow">O nás</span>
          <h1 style="font-size:clamp(40px,5.4vw,68px);margin:16px 0 22px;font-weight:400">Káva je pro nás <em style="color:var(--caramel-dark);font-weight:300">jedno velké kouzlo</em></h1>
          <div class="prose">
            <p class="lead">Její vůně, její příprava i celá její kultura. Proto jsme založili Slezskou kávu a čaj.</p>
            <p>Naleznete u nás čerstvě praženou kávu z celého světa – od klasické Brazílie a Kolumbie přes africké Etiopie a Keňu až po rarity, jako je Jamajka Blue Mountain nebo Kopi Luwak. Nabídku doplňují domácí espresso směsi Silesian, Moravian a Bohemian House Blend, ochucené kávy a výběrové čaje a čajové směsi, o kterých si myslíme, že stojí za to vyzkoušet.</p>
            <p>S výběrem vám rádi poradíme – stačí nám napsat nebo zavolat.</p>
          </div>
          <p style="margin-top:28px"><a class="btn btn--dark" href="#/kontakt">Kontaktujte nás ${ICON.arrow}</a></p>
        </div>
        <div class="about-hero__img reveal"><img src="${IMG}1083-3-bohemian--2.webp" alt="Balení kávy Bohemian House Blend" loading="lazy"></div>
      </div>
    </div>
    <section class="section section--cream">
      <div class="wrap">
        <div class="sec-head reveal"><div><span class="eyebrow">Na čem nám záleží</span><h2>Tři věci, které <em>nevynecháme</em></h2></div></div>
        <div class="values">
          <div class="value reveal"><div class="value__n">01</div><h3>Čerstvost</h3><p>Káva ztrácí časem chuť a aroma. Proto ji nabízíme čerstvě praženou.</p></div>
          <div class="value reveal"><div class="value__n">02</div><h3>Mletí na míru</h3><p>Pět stupňů mletí – zrnková, pro french press, turka, espresso i džezvu.</p></div>
          <div class="value reveal"><div class="value__n">03</div><h3>Poradíme</h3><p>Nevíte, kterou kávu zvolit? Napište nám, jak ji připravujete, a doporučíme.</p></div>
        </div>
      </div>
    </section>`;
  }

  function pageContact() {
    return `
    <header class="phead"><div class="wrap">${crumbs([[null, 'Kontakty']])}<h1>Kontakty</h1><p>Máte nějaké otázky? Zodpovíme je. Prosíme o pečlivé vyplnění kontaktních údajů.</p></div></header>
    <div class="wrap contact">
      <div class="ccards">
        <a class="ccard" href="tel:+420608805491"><span class="ccard__ic">${ICON.phone}</span><div><small>Telefon – e-shop</small><b>+420 608 805 491</b></div></a>
        <a class="ccard" href="tel:${SHOP_PHONE[0]}"><span class="ccard__ic">${ICON.phone}</span><div><small>Telefon – prodejna</small><b>${SHOP_PHONE[1]}</b></div></a>
        ${hoursCard()}
        <a class="ccard" href="mailto:info@slezskakava.cz"><span class="ccard__ic">${ICON.mail}</span><div><small>E-mail</small><b>info@slezskakava.cz</b></div></a>
        <div class="ccard"><span class="ccard__ic">${ICON.pin}</span><div><small>Provozovna · osobní odběr</small><b>Bystřice 5, 739 95</b></div></div>
        <a class="ccard" href="#/vydejni-misto"><span class="ccard__ic">${ICON.box}</span><div><small>Výdejní místo</small><b>Zásilkovna a PPL</b><p>Na provozovně si vyzvednete zásilky z jakéhokoli e-shopu.</p></div></a>
        <div class="ccard"><span class="ccard__ic">${ICON.id}</span><div><small>Provozovatel</small><b>Jana Lancová</b><p>Sídlo: Vendryně 1022, 739 94 · IČO 64147746 · DIČ CZ7453244975</p></div></div>
        <div class="map"><iframe title="Mapa – Bystřice 5" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=Byst%C5%99ice%205%2C%20739%2095&output=embed"></iframe></div>
      </div>
      <form class="box" data-demo-form="Děkujeme, zprávu jsme přijali. Ozveme se co nejdříve.">
        <h2>Napište nám</h2>
        <div class="fields">
          <div class="f full"><label for="cName">Jméno a příjmení</label><input id="cName" required autocomplete="name"></div>
          <div class="f full"><label for="cEmail">E-mail</label><input id="cEmail" type="email" required autocomplete="email"></div>
          <div class="f full"><label for="cMsg">Zpráva</label><textarea id="cMsg" required></textarea></div>
        </div>
        <label class="check"><input type="checkbox" required> <span>Vložením zprávy souhlasíte s <a href="#/ochrana-udaju">podmínkami ochrany osobních údajů</a>.</span></label>
        <button class="btn btn--dark" style="margin-top:20px" type="submit">Odeslat ${ICON.arrow}</button>
      </form>
    </div>`;
  }

  /* ---------- Výdejní místo Zásilkovny a PPL ---------- */
  const MAP = '<div class="map"><iframe title="Mapa – Bystřice 5" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=Byst%C5%99ice%205%2C%20739%2095&output=embed"></iframe></div>';

  function pragueNow() {
    const parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Prague', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' })
      .formatToParts(new Date()).map((x) => [x.type, x.value]));
    return { day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(parts.weekday), h: +parts.hour + +parts.minute / 60 };
  }

  function openStatus() {
    const { day, h } = pragueNow();
    const today = HOURS[day];
    if (today && h >= today[0] && h < today[1]) return `<span class="open-dot"></span><b>Právě otevřeno</b> · dnes do ${today[1]}:00`;
    if (today && h < today[0]) return `<span class="open-dot open-dot--off"></span><b>Zavřeno</b> · dnes otevíráme v ${today[0]}:00`;
    for (let i = 1; i <= 7; i++) {
      const d = (day + i) % 7;
      if (HOURS[d]) return `<span class="open-dot open-dot--off"></span><b>Zavřeno</b> · otevíráme ${i === 1 ? 'zítra' : `${DAYS[d].toLowerCase()}`} v ${HOURS[d][0]}:00`;
    }
    return '';
  }

  function hoursCard() {
    const { day } = pragueNow();
    const order = [1, 2, 3, 4, 5, 6, 0];
    return `<div class="ccard"><span class="ccard__ic">${ICON.clock}</span><div style="flex:1"><small>Otevírací doba prodejny a výdejního místa</small>
      <p class="hours-status">${openStatus()}</p>
      <dl class="hours">${order.map((d) => `<div class="${d === day ? 'is-today' : ''}"><dt>${DAYS[d]}</dt><dd>${HOURS[d] ? `${HOURS[d][0]}:00–${HOURS[d][1]}:00` : 'Zavřeno'}</dd></div>`).join('')}</dl>
    </div></div>`;
  }

  function pickupSection() {
    return `<section class="section" style="padding-top:0">
      <div class="wrap">
        <div class="pickup reveal">
          <div class="pickup__body">
            <span class="eyebrow eyebrow--light">Výdejní místo v Bystřici</span>
            <h2>Vyzvedněte si u nás zásilky <em>Zásilkovny i PPL</em></h2>
            <p>Na naší provozovně v Bystřici 5 je výdejní místo Zásilkovny a PPL. Vyzvednout si tu můžete balíky z jakéhokoli e-shopu – a když už tu budete, přivoňte k čerstvé kávě.</p>
            <div class="pickup__carriers"><span>${ICON.box} Zásilkovna</span><span>${ICON.box} PPL Parcelshop</span></div>
            <p class="pickup__hours">${openStatus()}<br>Po–Pá 9:00–17:00 · So 8:00–11:00 · Ne zavřeno</p>
            <a class="btn btn--caramel" href="#/vydejni-misto">Jak to funguje ${ICON.arrow}</a>
          </div>
          <ol class="pickup__steps">
            <li><b>Vyberte nás jako výdejní místo</b><span>Při objednávce v libovolném e-shopu zvolte Zásilkovnu nebo PPL Parcelshop a výdejní místo Bystřice 5.</span></li>
            <li><b>Počkejte na zprávu</b><span>Jakmile zásilka dorazí, dopravce vám pošle SMS nebo e-mail s kódem pro vyzvednutí.</span></li>
            <li><b>Vyzvedněte si ji</b><span>Přijďte na provozovnu, nahlaste kód a zásilku vám vydáme.</span></li>
          </ol>
        </div>
      </div>
    </section>`;
  }

  function pagePickup() {
    const carrier = (name, sub, steps) => `<div class="box carrier reveal">
      <span class="carrier__ic">${ICON.box}</span>
      <h2>${name}</h2><p class="carrier__sub">${sub}</p>
      <ol>${steps.map((x) => `<li>${x}</li>`).join('')}</ol>
    </div>`;
    return `
    <header class="phead phead--dark"><div class="wrap">
      ${crumbs([[null, 'Výdejní místo']])}
      <h1>Výdejní místo <em>Zásilkovny a PPL</em></h1>
      <p>Na naší provozovně v Bystřici si vyzvednete zásilky ze Zásilkovny i PPL – nejen ty od nás, ale z jakéhokoli e-shopu.</p>
    </div></header>
    <div class="wrap" style="padding-top:56px;padding-bottom:110px">
      <div class="carriers">
        ${carrier('Zásilkovna', 'Výdejní místo Zásilkovny', [
          'V košíku libovolného e-shopu zvolte dopravu <b>Zásilkovna – výdejní místo</b>.',
          'Na mapě vyhledejte <b>Bystřice 5, 739 95</b> a vyberte naše výdejní místo.',
          'Až zásilka dorazí, přijde vám SMS nebo e-mail s kódem.',
          'Přijďte na provozovnu, nahlaste kód a zásilku si vyzvedněte.',
        ])}
        ${carrier('PPL Parcelshop', 'Výdejní místo PPL', [
          'V košíku libovolného e-shopu zvolte dopravu <b>PPL Parcelshop</b>.',
          'Ve výběru výdejních míst vyhledejte <b>Bystřice 5, 739 95</b>.',
          'Až zásilka dorazí, PPL vám pošle SMS nebo e-mail s informacemi k vyzvednutí.',
          'Přijďte na provozovnu a zásilku si vyzvedněte.',
        ])}
      </div>
      <div class="pickup-info">
        <div class="ccards">
          <div class="ccard"><span class="ccard__ic">${ICON.pin}</span><div><small>Adresa výdejního místa</small><b>Bystřice 5, 739 95 Bystřice</b><p>Provozovna Slezská káva a čaj</p></div></div>
          ${hoursCard()}
          <a class="ccard" href="tel:${SHOP_PHONE[0]}"><span class="ccard__ic">${ICON.phone}</span><div><small>Telefon na prodejnu</small><b>${SHOP_PHONE[1]}</b></div></a>
        </div>
        ${MAP}
      </div>
      <div class="box" style="margin-top:20px;display:flex;justify-content:space-between;align-items:center;gap:20px;flex-wrap:wrap">
        <div><h2 style="margin:0 0 6px">Jdete si pro balík? Vezměte si i kávu.</h2><p style="color:var(--muted)">Objednejte online s osobním odběrem a vyzvedněte vše najednou.</p></div>
        <a class="btn btn--dark" href="#/kava">Vybrat kávu ${ICON.arrow}</a>
      </div>
    </div>`;
  }

  function pageHowTo() {
    return `
    <header class="phead"><div class="wrap">${crumbs([[null, 'Jak nakupovat']])}<h1>Jak nakupovat</h1><p>Nákup zvládnete během pár minut. Tady je, jak to celé probíhá.</p></div></header>
    <div class="wrap" style="padding-bottom:110px">
      <ol class="steps-list" style="padding:0">
        <li><div><h3>Vyberte si kávu nebo čaj</h3><p>U kávy zvolte hmotnost balení (150 g, 250 g, 500 g nebo 1 kg) a způsob mletí. U čaje balení 50, 100 nebo 200 g. Tlačítkem „Do košíku“ zboží přidáte do košíku.</p></div></li>
        <li><div><h3>Zvolte dopravu</h3><ul><li>Osobní odběr na provozovně v Bystřici 5, 739 95 – zde je zároveň <a href="#/vydejni-misto" style="text-decoration:underline">výdejní místo Zásilkovny a PPL</a></li><li>Výdejní místa Zásilkovna a PPL Parcelshop</li><li>Doručení na adresu přes PPL CZ nebo Zásilkovnu</li></ul><p style="margin-top:8px">Doručujeme v rámci České republiky a Slovenska.</p></div></li>
        <li><div><h3>Zvolte platbu</h3><ul><li>Bankovním převodem – údaje pošleme v potvrzení objednávky</li><li>Kartou online přes platební bránu</li><li>Dobírkou při převzetí zásilky</li><li>Hotově při osobním odběru</li></ul></div></li>
        <li><div><h3>Odešlete objednávku</h3><p>Vyplňte kontaktní údaje, potvrďte souhlas s obchodními podmínkami a klikněte na „Objednat s povinností platby“. Potvrzení vám přijde e-mailem.</p></div></li>
      </ol>
    </div>`;
  }

  function pageBlog() {
    return `
    <header class="phead"><div class="wrap">${crumbs([[null, 'Blog o kávě']])}<h1>Blog o <em>kávě</em></h1><p>Tady bychom vám nabídli několik informací o kávě a čaji.</p></div></header>
    <div class="wrap">
      <a class="blog-card reveal" href="#/blog/jak-vybrat-kavu">
        <div class="blog-card__img"><img src="assets/img/brand/arabica-1-m.webp" alt="" loading="lazy"></div>
        <div class="blog-card__body"><span class="eyebrow">Průvodce</span><h2>Jak vybrat kávu</h2>
        <p>Při výběru kávy je důležité zvážit několik faktorů. Druh kávy, pražení, původ a preferovanou chuť. Důležitá je také čerstvost a správné skladování.</p>
        <span class="link-arrow">Přečíst ${ICON.arrow}</span></div>
      </a>
    </div>`;
  }

  function pageArticle() {
    return `
    <header class="phead"><div class="wrap" style="max-width:808px">${crumbs([['#/blog', 'Blog o kávě'], [null, 'Jak vybrat kávu']])}<h1>Jak vybrat <em>kávu</em></h1></div></header>
    <div class="wrap">
      <article class="article">
        <div class="article__cover"><img src="assets/img/brand/arabica-1-m.webp" alt="" loading="lazy"></div>
        <div class="prose">${PAGES['jak-vybrat-kavu'] || ''}</div>
        <div class="box" style="margin-top:48px;display:flex;justify-content:space-between;align-items:center;gap:20px;flex-wrap:wrap">
          <div><h2 style="margin:0 0 6px">Vyzkoušejte to v praxi</h2><p style="color:var(--muted)">Začněte jemnou Brazílií nebo ovocnou Etiopií.</p></div>
          <a class="btn btn--dark" href="#/kava/arabica">Vybrat kávu ${ICON.arrow}</a>
        </div>
      </article>
    </div>`;
  }

  function pageLegal(key, title) {
    return `
    <header class="phead"><div class="wrap">${crumbs([[null, title]])}<h1>${title}</h1></div></header>
    <div class="wrap legal"><div class="prose prose--legal">${PAGES[key] || ''}</div></div>`;
  }

  function pageNotFound() {
    return `<div class="wrap thanks"><span class="eyebrow">Chyba 404</span><h1 style="margin-top:14px">Tahle stránka se vypařila</h1>
      <p>Jako vůně dobré kávy. Zkuste to z hlavní stránky.</p><p style="margin-top:28px"><a class="btn btn--dark" href="#/">Na úvod ${ICON.arrow}</a></p></div>`;
  }

  /* ------------------------------------------------------------------ Router */
  let route = { name: '' };
  let observers = [];

  function parse() {
    const raw = location.hash.replace(/^#\/?/, '');
    const [path, query] = raw.split('?');
    const parts = path.split('/').filter(Boolean).map(decodeURIComponent);
    return { parts, params: new URLSearchParams(query || '') };
  }

  function render() {
    const { parts, params } = parse();
    const [a, b] = parts;
    const main = $('#main');
    observers.forEach((o) => o.disconnect());
    observers = [];
    let html, mount = null, title = 'Slezská káva a čaj – čerstvě pražená káva a výběrové čaje', nav = a || '';

    if (!a) { html = pageHome(); mount = mountHome; }
    else if (a === 'kava' || a === 'caj') {
      const sub = CATS[a].subs.some((s) => s[0] === b) ? b : null;
      html = pageCatalog(a, sub, params); mount = () => mountCatalog(a, sub, params);
      title = `${sub ? CATS[a].subs.find((s) => s[0] === sub)[1] : CATS[a].title} | Slezská káva a čaj`;
      if (sub === 'darky' || sub === 'akce') nav = 'akce';
    } else if (a === 'produkt') {
      const p = bySlug(b);
      html = pageProduct(b); mount = () => mountProduct(b);
      if (p) { title = `${p.name} | Slezská káva a čaj`; nav = p.type; }
    } else if (a === 'pokladna' || a === 'kosik') { html = pageCheckout(); mount = mountCheckout; title = 'Pokladna | Slezská káva a čaj'; }
    else if (a === 'dekujeme') { html = pageThanks(); }
    else if (a === 'o-nas') { html = pageAbout(); title = 'O nás | Slezská káva a čaj'; }
    else if (a === 'kontakt') { html = pageContact(); title = 'Kontakty | Slezská káva a čaj'; }
    else if (a === 'vydejni-misto') { html = pagePickup(); title = 'Výdejní místo Zásilkovny a PPL v Bystřici | Slezská káva a čaj'; }
    else if (a === 'jak-nakupovat') { html = pageHowTo(); title = 'Jak nakupovat | Slezská káva a čaj'; }
    else if (a === 'blog' && b === 'jak-vybrat-kavu') { html = pageArticle(); title = 'Jak vybrat kávu | Slezská káva a čaj'; }
    else if (a === 'blog') { html = pageBlog(); title = 'Blog o kávě | Slezská káva a čaj'; }
    else if (a === 'obchodni-podminky') { html = pageLegal('obchodni-podminky', 'Obchodní podmínky'); title = 'Obchodní podmínky | Slezská káva a čaj'; }
    else if (a === 'ochrana-udaju') { html = pageLegal('ochrana-udaju', 'Ochrana osobních údajů'); title = 'Ochrana osobních údajů | Slezská káva a čaj'; }
    else { html = pageNotFound(); }

    route = { name: a || 'home' };
    main.innerHTML = `<div class="page-enter">${html}</div>`;
    document.title = title;
    $$('.nav__link').forEach((l) => l.classList.toggle('is-active', l.dataset.nav === nav));
    mount?.();
    reveal();
  }

  function reveal() {
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    }), { rootMargin: '0px 0px -8% 0px' });
    $$('.reveal').forEach((el) => io.observe(el));
    observers.push(io);
  }

  let lastPath = null;
  addEventListener('hashchange', () => {
    const path = location.hash.split('?')[0];
    const samePage = lastPath === path;
    lastPath = path;
    render();
    if (!samePage) scrollTo({ top: 0, behavior: 'instant' });
  });

  /* ------------------------------------------------------------------ Start */
  $('#year').textContent = new Date().getFullYear();
  // stav prodejny v horní liště a na úvodní stránce, obnovuje se každou minutu
  const tickStatus = () => {
    $('#topbarStatus').innerHTML = `Prodejna: ${openStatus().replace(/<\/?b>/g, '')}`;
    $$('[data-open-status]').forEach((el) => { el.innerHTML = openStatus(); });
  };
  tickStatus();
  setInterval(tickStatus, 60000);
  Promise.all([
    fetch(`data/products.json?v=${VERSION}`).then((r) => r.json()),
    fetch(`data/pages.json?v=${VERSION}`).then((r) => r.json()),
  ]).then(([products, pages]) => {
    PRODUCTS = products.map((p) => ({ ...p, weights: Object.keys(p.prices) }));
    PAGES = pages;
    lastPath = location.hash.split('?')[0];
    render();
    renderCart();
  }).catch(() => {
    $('#main').innerHTML = '<div class="wrap thanks"><h1>Obchod se nepodařilo načíst</h1><p>Zkuste prosím stránku obnovit.</p></div>';
  });
})();
