// Amira's Plate — post maker: builds the WhatsApp group posts from the menu sheet.
(function () {
  'use strict';
  const S = window.SITE;
  const $ = id => document.getElementById(id);
  const fmt = n => n.toLocaleString('en-US');

  // Sheet names of the three post types in the الرسائل tab, and the wording used when the tab has no row for one.
  const KINDS = { offers: 'العروض', menu: 'المنيو', today: 'متاح النهارده' };
  const DEFAULTS = {
    'العروض': { intro: "✨ العروض الدايمة من Amira's Plate ✨", outro: '🌶️ كل المنتجات جاهزة على التسوية وبتتبيلة شيف أميرة الخاصة' },
    'المنيو': { intro: "🥩🍗 منتجات Amira's Plate\nجاهزة على التسوية – فريش شغل بيتي 👩‍🍳✨", outro: '' },
    'متاح النهارده': { intro: '🔔 متاح النهارده من مطبخ أميرة 👩‍🍳', outro: '' }
  };
  const SITE_URL = new URL('./', location.href).href;

  let DATA = null, kind = 'offers';

  const priceText = p => p == null ? 'حسب سعر اليوم' : fmt(p) + ' ج';
  const itemLine = it => `🔸 ${it.name}${it.unit ? ' (' + it.unit + ')' : ''} — ${priceText(it.price)}`;

  function catBlock(c, items) {
    return [`${c.icon ? c.icon + ' ' : ''}*${c.name}*`, ...items.map(itemLine)].join('\n');
  }

  function body() {
    if (kind === 'offers') {
      if (!DATA.offers.length) return null;
      return DATA.offers.map(o => {
        const out = [`⭐ *${o.name}*${o.price != null ? ' — ' + fmt(o.price) + ' ج' : ''}`];
        if (o.desc) out.push(o.desc);
        o.choices.forEach(x => out.push('✔️ ' + x));
        if (o.note) out.push('➕ ' + o.note);
        return out.join('\n');
      }).join('\n\n');
    }
    if (kind === 'menu') {
      const sel = $('catSel').value;
      const cats = DATA.menu.filter(c => !sel || c.name === sel)
        .map(c => [c, c.items.filter(it => !it.off)]).filter(([, items]) => items.length);
      return cats.length ? cats.map(([c, items]) => catBlock(c, items)).join('\n\n') : null;
    }
    const cats = DATA.menu.map(c => [c, c.items.filter(it => it.post && !it.off)]).filter(([, items]) => items.length);
    return cats.length ? cats.map(([c, items]) => catBlock(c, items)).join('\n\n') : null;
  }

  function message() {
    const b = body();
    if (b == null) return null;
    const words = DATA.messages[KINDS[kind]] || DEFAULTS[KINDS[kind]];
    const parts = [];
    if (words.intro) parts.push(words.intro);
    parts.push(b);
    if (words.outro) parts.push(words.outro);
    parts.push(`🛒 اطلبي من الموقع: ${SITE_URL}\n💬 أو على الخاص: wa.me/${S.whatsapp}`);
    return parts.join('\n\n');
  }

  const EMPTY = {
    offers: 'مفيش عروض متاحة في الشيت دلوقتي.',
    menu: 'مفيش أصناف متاحة في القسم ده.',
    today: 'مفيش أصناف عليها "نعم" في عمود "انشر". اكتبي "نعم" قدام الأصناف اللي عايزة تنشريها في الشيت، واستني حوالي 5 دقايق وافتحي الصفحة تاني.'
  };

  function update() {
    $('menuOpt').hidden = kind !== 'menu';
    $('todayNote').hidden = kind !== 'today';
    document.querySelectorAll('[data-type]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.type === kind)));
    const text = message();
    const ok = text != null;
    $('preview').textContent = ok ? text : EMPTY[kind];
    $('preview').classList.toggle('pm-warn', !ok);
    $('meta').textContent = ok ? `${text.length} حرف` : '';
    $('sendWa').href = ok ? 'https://wa.me/?text=' + encodeURIComponent(text) : '#';
    $('sendWa').toggleAttribute('aria-disabled', !ok);
    [$('sendWa'), $('copyBtn'), $('shareBtn')].forEach(el => { el.style.opacity = ok ? '' : '.45'; el.style.pointerEvents = ok ? '' : 'none'; });
  }

  let tt;
  function toast(t) { const el = $('toast'); el.textContent = t; el.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => el.classList.remove('on'), 1600); }

  document.addEventListener('click', e => {
    const t = e.target.closest('[data-type]');
    if (t && DATA) { kind = t.dataset.type; update(); }
  });
  $('catSel').addEventListener('change', update);
  $('copyBtn').addEventListener('click', async () => {
    const text = message(); if (!text) return;
    try { await navigator.clipboard.writeText(text); toast('اتنسخت الرسالة'); }
    catch (e) {
      const r = document.createRange(); r.selectNodeContents($('preview'));
      const s = getSelection(); s.removeAllRanges(); s.addRange(r);
      toast('الرسالة متحددة، اضغطي نسخ');
    }
  });
  if (navigator.share) {
    $('shareBtn').hidden = false;
    $('shareBtn').addEventListener('click', () => { const text = message(); if (text) navigator.share({ text }).catch(() => {}); });
  }

  window.MenuData.load().then(d => {
    DATA = d;
    $('catSel').insertAdjacentHTML('beforeend', d.menu.map(c => {
      const o = document.createElement('option'); o.value = c.name; o.textContent = (c.icon ? c.icon + ' ' : '') + c.name; return o.outerHTML;
    }).join(''));
    update();
  }).catch(e => {
    console.error(e);
    $('preview').textContent = 'المنيو مش راضي يحمل دلوقتي. جربي تاني بعد شوية.';
    $('preview').classList.add('pm-warn');
  });
})();
