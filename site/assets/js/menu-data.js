// Amira's Plate — reads the menu from the published Google Sheet (or the /data/ copies) for every page.
// Exposes window.MenuData.load() -> Promise<{ menu, offers, messages }>.
(function () {
  'use strict';
  const S = window.SITE;

  // ---------- CSV (handles quoted cells with commas and line breaks) ----------
  function parseCSV(text) {
    text = text.replace(/^﻿/, '');
    const rows = []; let row = [], cell = '', q = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (q) {
        if (c === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; }
        else cell += c;
      } else if (c === '"') q = true;
      else if (c === ',') { row.push(cell); cell = ''; }
      else if (c === '\n' || c === '\r') {
        if (c === '\r' && text[i + 1] === '\n') i++;
        row.push(cell); rows.push(row); row = []; cell = '';
      } else cell += c;
    }
    if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
    const head = (rows.shift() || []).map(h => h.trim());
    return rows.filter(r => r.some(v => v.trim() !== ''))
      .map(r => Object.fromEntries(head.map((h, i) => [h, (r[i] || '').trim()])));
  }

  // One sheet tab: the published link when set and reachable, otherwise /data/<name>.csv.
  async function loadTab(name) {
    const sheetUrl = (S.sheet || {})[name];
    if (sheetUrl) {
      try {
        const r = await fetch(sheetUrl, { cache: 'no-store' });
        if (r.ok) return parseCSV(await r.text());
        console.warn('Sheet tab "' + name + '" answered ' + r.status + '; using the copy in /data/.');
      } catch (e) { console.warn('Sheet tab "' + name + '" could not be read; using the copy in /data/.', e); }
    }
    const r = await fetch('data/' + name + '.csv', { cache: 'no-cache' });
    if (!r.ok) throw new Error('data/' + name + '.csv answered ' + r.status);
    return parseCSV(await r.text());
  }

  const isNo = v => /^(لا|no|0|false)$/i.test(v || '');
  const isYes = v => /^(نعم|اه|أيوه|yes|1|true)$/i.test(v || '');
  const toPrice = v => { const n = parseFloat(String(v || '').replace(/[^\d.]/g, '')); return isNaN(n) ? null : n; };
  const lines = v => (v || '').split(/\r?\n/).map(s => s.trim()).filter(Boolean);

  async function load() {
    const [cats, items, offers, messages] = await Promise.all([
      loadTab('categories'), loadTab('items'), loadTab('offers'),
      loadTab('messages').catch(e => { console.warn('No messages tab; posts use their built-in wording.', e); return []; })
    ]);
    let menu = cats.map(c => ({ name: c['القسم'], desc: c['الوصف'], img: c['الصورة'], icon: c['الأيقونة'], items: [] }));
    items.forEach(r => {
      let cat = menu.find(c => c.name === r['القسم']);
      if (!cat) { cat = { name: r['القسم'], desc: '', img: '', icon: '', items: [] }; menu.push(cat); }
      cat.items.push({
        name: r['الصنف'], unit: r['الوحدة'], price: toPrice(r['السعر']),
        off: isNo(r['متاح']), post: isYes(r['انشر'])
      });
    });
    menu = menu.filter(c => c.items.length);
    const offerList = offers.filter(o => !isNo(o['متاح'])).map(o => ({
      name: o['العرض'], price: toPrice(o['السعر']), desc: o['الوصف'], note: o['ملاحظة'], choices: lines(o['الاختيارات'])
    }));
    const msg = {};
    messages.forEach(m => { if (m['النوع']) msg[m['النوع']] = { intro: m['أول الرسالة'] || '', outro: m['آخر الرسالة'] || '' }; });
    return { menu, offers: offerList, messages: msg };
  }

  window.MenuData = { load, parseCSV };
})();
