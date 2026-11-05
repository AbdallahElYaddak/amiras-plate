// Amira's Plate — draws the menu (read by menu-data.js) and runs the WhatsApp basket.
(function () {
  'use strict';
  const S = window.SITE;
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const fmt = n => n.toLocaleString('en-US');
  const wa = text => 'https://wa.me/' + S.whatsapp + (text ? '?text=' + encodeURIComponent(text) : '');

  // ---------- state ----------
  let MENU = [], OFFERS = [];
  const basket = new Map(); // key -> {name, unit, price, qty}

  // ---------- render ----------
  function renderOffers() {
    $('offersList').innerHTML = OFFERS.map((o, k) =>
      `<article class="offer"><h3>${esc(o.name)}</h3>` +
      (o.price != null ? `<div class="pr">${fmt(o.price)} <small>جنيه</small></div>` : '') +
      (o.desc ? `<div>${esc(o.desc)}</div>` : '') +
      (o.choices.length ? `<ul>${o.choices.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : '') +
      (o.note ? `<div class="ex">${esc(o.note)}</div>` : '') +
      (o.price != null ? `<button class="btn red" type="button" data-offer="${k}">أضيفي العرض</button>` : '') +
      `</article>`).join('') || '<p class="loading">مفيش عروض دلوقتي.</p>';
  }

  function itemRow(ci, i, it) {
    const t = `<span class="item-t">${esc(it.name)}${it.unit ? ` <small>(${esc(it.unit)})</small>` : ''}</span><span class="dots"></span>`;
    if (it.off) return `<div class="item off">${t}<span class="soldout">مش متاح دلوقتي</span></div>`;
    if (it.price == null) return `<div class="item">${t}<a class="ask" href="${wa('مساء الخير، عايزة أعرف سعر ' + it.name + ' النهارده')}" target="_blank" rel="noopener">حسب سعر اليوم</a></div>`;
    return `<div class="item">${t}<span class="price">${fmt(it.price)} ج</span><button class="add" type="button" data-add="${ci}:${i}" aria-label="أضيفي ${esc(it.name)} ${esc(it.unit)} للسلة">+</button></div>`;
  }

  function renderMenu() {
    $('catChips').innerHTML = MENU.map((c, ci) => `<a href="#cat-${ci}">${c.icon ? c.icon + ' ' : ''}${esc(c.name)}</a>`).join('');
    $('menuList').innerHTML = MENU.map((c, ci) =>
      `<div class="cat" id="cat-${ci}"><div class="cat-h">` +
      (c.img ? `<img src="img/${esc(c.img)}" alt="" width="62" height="62" loading="lazy">` : `<span class="noimg" aria-hidden="true">${c.icon || '✦'}</span>`) +
      `<div><h3>${esc(c.name)}</h3>${c.desc ? `<p>${esc(c.desc)}</p>` : ''}</div></div>` +
      c.items.map((it, i) => itemRow(ci, i, it)).join('') + `</div>`).join('');
  }

  // ---------- basket ----------
  function save() { try { localStorage.setItem('ap-basket', JSON.stringify([...basket])); } catch (e) {} }
  function restore() {
    try { (JSON.parse(localStorage.getItem('ap-basket') || '[]') || []).forEach(([k, v]) => basket.set(k, v)); } catch (e) {}
  }
  function add(key, rec) {
    const b = basket.get(key);
    if (b) b.qty++; else basket.set(key, { ...rec, qty: 1 });
    refresh(); toast('اتضافت للسلة: ' + rec.name);
  }
  function message(total) {
    if (!basket.size) return 'أهلاً Amira\'s Plate، عايزة أطلب';
    const v = id => $(id).value.trim();
    const lines = ['طلب جديد من الموقع 🛒', ''];
    basket.forEach(b => lines.push(`• ${b.name}${b.unit ? ' (' + b.unit + ')' : ''} × ${b.qty} = ${fmt(b.price * b.qty)} ج`));
    lines.push('', `الإجمالي: ${fmt(total)} ج (من غير التوصيل)`);
    if (v('fNotes')) lines.push('ملاحظات: ' + v('fNotes'));
    lines.push('', 'الاسم: ' + v('fName'), 'الموبايل: ' + v('fPhone'), 'العنوان: ' + v('fAddr'));
    return lines.join('\n');
  }
  function refresh() {
    let count = 0, total = 0;
    basket.forEach(b => { count += b.qty; total += b.qty * b.price; });
    $('bkSum').innerHTML = count
      ? `في السلة ${count} · ${fmt(total)} ج<small>من غير رسوم التوصيل</small>`
      : 'السلة فاضية<small>اضغطي + جنب أي صنف</small>';
    $('bkToggle').hidden = !count;
    if (!count) { $('bkPanel').hidden = true; $('bkToggle').setAttribute('aria-expanded', 'false'); }
    $('bkLines').innerHTML = [...basket].map(([k, b]) =>
      `<div class="bk-line"><span>${esc(b.name)}${b.unit ? ` <small>(${esc(b.unit)})</small>` : ''} · ${fmt(b.price * b.qty)} ج</span>` +
      `<span class="bk-q"><button type="button" data-q="${esc(k)}" data-d="-1" aria-label="قللي ${esc(b.name)}">−</button>${b.qty}` +
      `<button type="button" data-q="${esc(k)}" data-d="1" aria-label="زوّدي ${esc(b.name)}">+</button></span></div>`).join('');
    $('bkSend').href = wa(message(total));
    save();
  }
  let tt;
  function toast(t) { const el = $('toast'); el.textContent = t; el.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => el.classList.remove('on'), 1400); }

  document.addEventListener('click', e => {
    const a = e.target.closest('[data-add]');
    if (a) { const [ci, i] = a.dataset.add.split(':').map(Number); const it = MENU[ci].items[i]; add('m:' + MENU[ci].name + ':' + it.name + ':' + it.unit, { name: it.name, unit: it.unit, price: it.price }); return; }
    const o = e.target.closest('[data-offer]');
    if (o) { const of = OFFERS[+o.dataset.offer]; add('o:' + of.name, { name: of.name, unit: 'عرض', price: of.price }); return; }
    const q = e.target.closest('[data-q]');
    if (q) { const b = basket.get(q.dataset.q); if (!b) return; b.qty += +q.dataset.d; if (b.qty <= 0) basket.delete(q.dataset.q); refresh(); }
  });
  $('bkToggle').addEventListener('click', e => {
    const p = $('bkPanel'); p.hidden = !p.hidden; e.currentTarget.setAttribute('aria-expanded', String(!p.hidden));
  });
  $('bkForm').addEventListener('input', refresh);
  $('bkForm').addEventListener('submit', e => e.preventDefault());

  // ---------- static bits from config ----------
  document.querySelectorAll('[data-wa]').forEach(a => { a.href = wa('أهلاً Amira\'s Plate، عايزة أطلب'); });
  document.querySelectorAll('[data-social]').forEach(a => { a.href = S.social[a.dataset.social]; });
  document.querySelectorAll('[data-delivery]').forEach(el => { el.textContent = S.delivery[el.dataset.delivery]; });
  $('waNumber').textContent = S.whatsappDisplay;
  $('year').textContent = new Date().getFullYear();

  // ---------- boot ----------
  restore(); refresh();
  window.MenuData.load().then(data => {
    MENU = data.menu; OFFERS = data.offers;
    renderOffers(); renderMenu();
    // A basket kept from an earlier visit takes today's prices; dishes no longer offered drop out.
    [...basket.keys()].forEach(k => {
      const [kind, ...rest] = k.split(':');
      let price = null;
      if (kind === 'm') {
        const [cat, name, unit] = rest;
        const it = (MENU.find(c => c.name === cat) || { items: [] }).items.find(x => x.name === name && x.unit === unit);
        if (it && !it.off) price = it.price;
      } else {
        const of = OFFERS.find(x => x.name === rest.join(':'));
        if (of) price = of.price;
      }
      if (price == null) basket.delete(k); else basket.get(k).price = price;
    });
    refresh();
  }).catch(e => {
    console.error(e);
    $('menuList').innerHTML = $('offersList').innerHTML =
      `<p class="loading">القائمة مش راضية تحمل دلوقتي. اطلبي على واتساب: <a href="${wa()}" target="_blank" rel="noopener">${esc(S.whatsappDisplay)}</a></p>`;
  });
})();
