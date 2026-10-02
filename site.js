// Google Sheets booking link (Apps Script web app URL). Leave empty to use Netlify Forms only.
window.WT_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbwBF9dTUUOXc9hJaLkaX9sUT13Zm3yHvShqUjbZ_RGCtVI449radiaShyzjko81mDfj/exec';

// Always open pages at the top (not a remembered scroll position)
(function () {
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  if (location.hash && location.hash !== '#top') return;
  function top() {
    window.scrollTo(0, 0);
    if (document.scrollingElement) document.scrollingElement.scrollTop = 0;
    document.documentElement.scrollTop = 0; document.body.scrollTop = 0;
  }
  top();
  document.addEventListener('DOMContentLoaded', top);
  window.addEventListener('load', function () { top(); setTimeout(top, 60); setTimeout(top, 300); });
  window.addEventListener('pageshow', top);
})();

// Mobile menu
(function () {
  var btn = document.querySelector('.nav-toggle');
  var menu = document.getElementById('menu');
  if (!btn || !menu) return;
  btn.addEventListener('click', function () {
    var open = menu.classList.toggle('open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  menu.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') { menu.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); }
  });
})();

// Runners page: build cards + gathering filter
(function () {
  var root = document.getElementById('runners');
  if (!root || !window.RUNNER_GROUPS) return;
  var TIERS = ['Sweetheart', 'Storybook', 'Once Upon', 'Ever After'];
  var LABEL = ['Sweetheart only', 'Up to Storybook', 'Up to Once Upon', 'Up to Ever After'];
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  var html = '';
  window.RUNNER_GROUPS.forEach(function (g) {
    html += '<section class="fabric"><div class="fabric-head"><h2>' + esc(g.title) + '</h2><p>' + esc(g.desc) + '</p></div><div class="runner-grid">';
    g.items.forEach(function (r) {
      var ph = r.img
        ? '<div class="ph"><img src="' + esc(r.img) + '" alt="' + esc(r.name + ' ' + r.fabric) + ' runner on a wooden table with candles and flowers" loading="lazy"></div>'
        : '<div class="ph empty">Photo coming soon</div>';
      html += '<article class="runner" data-max="' + r.max + '">' + ph +
        '<div class="meta"><div class="sw" style="background:' + esc(r.hex) + '"></div><div><div class="name">' + esc(r.name) + '</div><div class="fab">' + esc(r.fabric) + '</div></div></div>' +
        '<div class="tags"><span class="pill">' + LABEL[r.max] + '</span>' + '' + '</div></article>';
    });
    html += '</div></section>';
  });
  root.innerHTML = html;

  var cards = root.querySelectorAll('.runner');
  var note = document.querySelector('.filter-note');
  var buttons = document.querySelectorAll('.filter-pills button');
  function apply(t) {
    var n = 0;
    cards.forEach(function (c) {
      var ok = t < 0 || Number(c.getAttribute('data-max')) >= t;
      c.classList.toggle('dim', !ok);
      if (ok) n++;
    });
    buttons.forEach(function (b) { b.setAttribute('aria-pressed', Number(b.getAttribute('data-tier')) === t ? 'true' : 'false'); });
    if (note) note.textContent = t < 0 ? '' : n + ' runners available for ' + TIERS[t];
  }
  buttons.forEach(function (b) { b.addEventListener('click', function () { apply(Number(b.getAttribute('data-tier'))); }); });
})();

// ---------- Shared helpers ----------
var WT = (function () {
  var TIERS = ['Sweetheart', 'Storybook', 'Once Upon', 'Ever After'];
  var LABEL = ['Sweetheart only', 'Up to Storybook', 'Up to Once Upon', 'All gatherings'];
  function runners() {
    var out = [];
    (window.RUNNER_GROUPS || []).forEach(function (g) { g.items.forEach(function (r) { out.push(r); }); });
    return out;
  }
  function peso(n) { return '₱' + n.toLocaleString('en-US'); }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function fabricLabel(g) { var f = {}; g.items.forEach(function (r) { f[r.fabric] = 1; }); return Object.keys(f).join(' & '); }
  return { fabricLabel: fabricLabel, TIERS: TIERS, LABEL: LABEL, runners: runners, peso: peso, el: el };
})();

// ---------- Runner color picker (runners page) ----------
(function () {
  var sw = document.getElementById('pickerSwatches');
  if (!sw || !window.RUNNER_GROUPS) return;
  var img = document.getElementById('pickerImg'), img2 = document.getElementById('pickerImg2');
  var nameEl = document.getElementById('pickerName'), fabEl = document.getElementById('pickerFab');
  var tierEl = document.getElementById('pickerTier'), quote = document.getElementById('pickerQuote');
  var list = WT.runners(), btns = [];
  var idx = 0;
  window.RUNNER_GROUPS.forEach(function (g) {
    var row = WT.el('div', 'sw-group', '<span class="sw-label">' + WT.fabricLabel(g) + '</span>');
    var box = WT.el('div', 'sw-row');
    g.items.forEach(function (r) {
      var i = idx++;
      var b = WT.el('button', 'swatch');
      b.type = 'button';
      b.style.background = r.hex;
      b.setAttribute('role', 'radio');
      b.setAttribute('aria-label', r.name + ' ' + r.fabric);
      b.title = r.name + ' · ' + r.fabric;
      b.addEventListener('click', function () { pick(i, true); });
      b.addEventListener('mouseenter', function () { new Image().src = r.img; });
      box.appendChild(b); btns.push(b);
    });
    row.appendChild(box); sw.appendChild(row);
  });
  var cur = -1;
  function pick(i, animate) {
    if (i === cur) return;
    var r = list[i]; cur = i;
    btns.forEach(function (b, j) { b.setAttribute('aria-checked', j === i ? 'true' : 'false'); });
    nameEl.textContent = r.name;
    fabEl.textContent = r.fabric;
    tierEl.textContent = WT.LABEL[r.max];
    quote.href = 'book.html?runner=' + encodeURIComponent(r.name);
    if (!animate) { img.src = r.img; img.alt = r.name + ' ' + r.fabric + ' runner on the table'; return; }
    img2.src = r.img;
    img2.onload = function () {
      img2.classList.add('show');
      setTimeout(function () {
        img.src = r.img; img.alt = r.name + ' ' + r.fabric + ' runner on the table';
        img2.classList.remove('show');
      }, 380);
    };
  }
  var start = 0;
  list.forEach(function (r, i) { if (r.name === 'Pink') start = i; });
  pick(start, false);
  // tapping a card below shows it in the picker
  document.addEventListener('click', function (e) {
    var card = e.target.closest && e.target.closest('.runner');
    if (!card) return;
    var idx = Array.prototype.indexOf.call(document.querySelectorAll('#runners .runner'), card);
    if (idx < 0) return;
    pick(idx, true);
    document.querySelector('.picker').scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
})();

// ---------- Build-your-table quote (home page) ----------
(function () {
  var root = document.getElementById('quote');
  if (!root || !window.RUNNER_GROUPS) return;
  var BASE = [500, 1000, 2000, 3000], GUESTS = ['2 guests', '10–15 guests', '15–30 guests', '30–40 guests'];
  var FD = { tiered: [60, 150, 250], glass: [100, 250, 500] }, FB = [700, 1500, 2500];
  var TAPER = [50, 150, 200, 400], GM = [1000, 1500, 2000], LAYER = [50, 50, 100, 150];
  var ALA = [
    { id: 'cream', name: 'Cream LED taper candles', set: 'set of 6', price: 150 },
    { id: 'pink', name: 'Pink LED taper candles', set: 'set of 6', price: 180 },
    { id: 'pillar', name: 'LED pillar candles', set: 'set of 6', price: 150 },
    { id: 'tiered', name: 'Gold candle holders, tiered', set: 'set of 6', price: 150 },
    { id: 'short', name: 'Gold candle holders, short', set: 'set of 6', price: 100 },
    { id: 'glass', name: 'Glass candle holders', set: 'set of 6', price: 250 },
    { id: 'vase', name: 'Glass vases', set: 'set of 4', price: 150 }
  ], ALA_DEP = 200;
  var RUN = WT.runners();
  var s = { tier: 0, runner: null, vase: 'acrylic', up: 'none', holder: 'tiered', mat: 'gold', layer: false, runner2: null, ribbon: 'match', ribbonColor: '', taper: false, gm: false, alc: false, ala: {} };
  var q = new URLSearchParams(location.search).get('runner');
  if (q) RUN.forEach(function (r, i) { if (r.name === q) s.runner = i; });
  if (new URLSearchParams(location.search).get('alc')) s.alc = true;
  // runner availability for the chosen date (from the bookings sheet)
  var AV = null, avDate = '', avBusy = false, avLost = '';
  // delivery (Full Bloom / Fairy Godmother): zone check runs in the bookings sheet
  var DLV = null, DLVP = null, dlvBusy = false, dlvFor = '';
  function needsDelivery() { return !s.alc && (s.gm || (s.up === 'fb' && (s.tier === 1 || s.tier === 2))); }
  var ZONE_NAME = { buhangin: 'Buhangin', lanang: 'Lanang to Roxas' };
  // price of ONE trip (drop-off or pickup) for a checked location; null = too far, message us
  function tripPrice(q) {
    if (!q) return null;
    if (q.zone !== 'outside') return s.gm ? 0 : (q.zone === 'buhangin' ? 100 : 200);
    if (q.km <= 10) return 250;
    if (q.km <= 20) return 300;
    return null;
  }
  function tripWhere(q) {
    if (q.zone !== 'outside') return ZONE_NAME[q.zone];
    return q.km <= 10 ? 'up to 10 km past Lanang to Roxas' : q.km <= 20 ? '10–20 km past Lanang to Roxas' : 'over 20 km past Lanang to Roxas';
  }
  function pickupSame() { var c = document.getElementById('qPickSame'); return !c || c.checked; }
  function pickQ() { return pickupSame() ? DLV : DLVP; }
  function dlvFar() { return !!(DLV && (tripPrice(DLV) === null || (pickQ() && tripPrice(pickQ()) === null))); }
  function deliveryLine() {
    if (!needsDelivery() || !DLV || !pickQ() || dlvFar()) return null;
    var a = tripPrice(DLV), b = tripPrice(pickQ());
    var note = 'Drop-off (' + tripWhere(DLV) + '): ' + (a ? WT.peso(a) : 'free') + ' · Pickup (' + tripWhere(pickQ()) + '): ' + (b ? WT.peso(b) : 'free');
    return ['Delivery & pickup', a + b, null, note];
  }
  function isBooked(r, n) { return !!(AV && AV['b' + n] && AV['b' + n].indexOf(r.name) >= 0); }
  function niceDate(v) { var p = String(v).split('-'); var mo = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']; return p.length === 3 ? mo[+p[1] - 1] + ' ' + (+p[2]) : v; }
  function checkAvail(v, done) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(v || '') || !window.WT_SHEETS_URL) { AV = null; avDate = ''; render(); if (done) done(); return; }
    avBusy = true; avDate = v; render();
    fetch(window.WT_SHEETS_URL + '?avail=' + v).then(function (r) { return r.json(); }).then(function (j) {
      if (avDate !== v) return; AV = (j && j.b1) ? j : null; avBusy = false; render(); if (done) done();
    }).catch(function () { if (avDate !== v) return; AV = null; avBusy = false; render(); if (done) done(); });
  }

  function opt(label, sub, on, click, disabled) {
    var b = WT.el('button', 'q-opt', label + (sub ? '<small>' + sub + '</small>' : ''));
    b.type = 'button'; b.setAttribute('aria-pressed', on ? 'true' : 'false');
    if (disabled) { b.disabled = true; } else b.addEventListener('click', click);
    return b;
  }
  function render() {
    var t = s.tier, $ = function (id) { return document.getElementById(id); };
    // 1 tier
    var tierBox = $('qTier'); tierBox.innerHTML = '';
    WT.TIERS.forEach(function (n, i) {
      tierBox.appendChild(opt(n, WT.peso(BASE[i]) + ' · ' + GUESTS[i], !s.alc && t === i, function () { s.tier = i; s.alc = false; render(); }));
    });
    tierBox.appendChild(opt('À la carte only', 'just a few pieces', s.alc, function () { s.alc = true; render(); }));
    document.querySelectorAll('.q-pkg').forEach(function (f) { f.hidden = s.alc; });
    $('qAlaNum').textContent = s.alc ? '2' : '6';
    $('qAlaTag').textContent = s.alc ? 'pick your pieces' : 'optional';
    // à la carte picker
    var ab = $('qAla'); ab.innerHTML = '';
    ALA.forEach(function (it) {
      var q = s.ala[it.id] || 0;
      var row = WT.el('div', 'q-ala-row' + (q ? ' on' : ''), '<span class="q-ala-name">' + it.name + '<small>' + it.set + ' · ' + WT.peso(it.price) + '</small></span>');
      var st = WT.el('span', 'q-step-qty');
      var minus = WT.el('button', '', '−'); minus.type = 'button'; minus.setAttribute('aria-label', 'Remove one ' + it.name); minus.disabled = !q;
      minus.addEventListener('click', function () { s.ala[it.id] = Math.max(0, q - 1); render(); });
      var num = WT.el('b', '', String(q));
      var plus = WT.el('button', '', '+'); plus.type = 'button'; plus.setAttribute('aria-label', 'Add one ' + it.name); plus.disabled = q >= 10;
      plus.addEventListener('click', function () { s.ala[it.id] = q + 1; render(); });
      st.appendChild(minus); st.appendChild(num); st.appendChild(plus); row.appendChild(st); ab.appendChild(row);
    });
    ab.appendChild(WT.el('p', 'q-note', 'Napkins: ask us what’s available.' + (s.alc ? ' À la carte orders carry a ' + WT.peso(ALA_DEP) + ' refundable security deposit.' : '')));
    var alaLines = ALA.filter(function (it) { return s.ala[it.id]; }).map(function (it) { var q = s.ala[it.id]; return [q + ' × ' + it.name + ' (' + it.set + ')', q * it.price]; });
    // 2 runner
    var NRt = [1, 1, 2, 3][t];
    avLost = '';
    if (s.runner != null && isBooked(RUN[s.runner], NRt)) { avLost = RUN[s.runner].name; s.runner = null; }
    if (s.runner2 != null && isBooked(RUN[s.runner2], NRt)) { avLost = RUN[s.runner2].name; s.runner2 = null; }
    if (s.runner != null && RUN[s.runner].max < t) s.runner = null;
    if (s.runner2 != null && (RUN[s.runner2].max < t || s.runner2 === s.runner)) s.runner2 = null;
    var dBox = $('qDlv');
    if (dBox) {
      dBox.hidden = !needsDelivery();
      var pw = $('qPickWrap'); if (pw) pw.hidden = !needsDelivery();
      var dN = $('qDlvNote'), dlNow = deliveryLine();
      dN.classList.remove('warn');
      if (dlvBusy) dN.textContent = 'Checking your location…';
      else if (DLV === false || DLVP === false) { dN.textContent = 'We couldn’t read that link. Please copy the Google Maps link again (Share → Copy link) and paste it above.'; dN.classList.add('warn'); }
      else if (dlvFar()) { dN.innerHTML = '<b>This location is outside our usual delivery area.</b><br><small>Please message us on Instagram or Facebook before booking, and we’ll see what we can do.</small>'; dN.classList.add('warn'); }
      else if (dlNow) dN.innerHTML = '<b>Delivery & pickup: ' + (dlNow[1] ? WT.peso(dlNow[1]) : 'free') + '</b><br><small>' + dlNow[3] + '</small>' + (DLV.place ? '<br><small>📍 ' + DLV.place + '</small>' : '') + '<br><small>We’ll double-check your location and let you know if anything changes.</small>';
      else dN.textContent = '';
    }
    var avN = $('qAvNote');
    if (avN) {
      avN.classList.toggle('warn', !!avLost);
      avN.textContent = avBusy ? 'Checking what’s available on ' + niceDate(avDate) + '…' :
        avLost ? 'Sorry, ' + avLost + ' is already booked on ' + niceDate(avDate) + '. Please pick another color.' :
        AV && RUN.some(function (r) { return r.max >= t && isBooked(r, NRt); }) ? 'Crossed-out colors are booked that day.' :
        AV || avDate ? '' : 'Pick your event date first to see which runners are available.';
    }
    var rb = $('qRunner'); rb.innerHTML = '';
    function chips(sel, exclude, pickFn, layerPick) {
      var wrap = WT.el('div', 'q-runners');
      var groups = layerPick ? [
        { label: 'Always available', items: RUN.filter(function (r) { return r.layer; }) },
        { label: 'Subject to availability', items: RUN.filter(function (r) { return !r.layer; }) }
      ] : window.RUNNER_GROUPS;
      groups.forEach(function (g) {
        var row = WT.el('div', 'q-rgroup', '<span class="q-rlabel">' + (g.label || WT.fabricLabel(g)) + '</span>');
        var box = WT.el('div', 'q-rrow');
        g.items.forEach(function (r) {
          var i = RUN.indexOf(r), booked = r.max >= t && isBooked(r, NRt), ok = r.max >= t && i !== exclude && !booked && !!avDate;
          var b = WT.el('button', 'q-chip' + (booked ? ' is-booked' : ''), '<i style="background:' + r.hex + '"></i>' + r.name);
          b.type = 'button'; b.title = r.name + ' · ' + r.fabric + (booked ? ' · booked on ' + niceDate(avDate) : '');
          b.setAttribute('aria-label', r.name + ' ' + r.fabric + (booked ? ' (booked on this date)' : r.max >= t ? '' : ' (not available for ' + WT.TIERS[t] + ')'));
          b.setAttribute('aria-pressed', sel === i ? 'true' : 'false');
          if (!ok) b.disabled = true; else b.addEventListener('click', function () { pickFn(i); render(); });
          box.appendChild(b);
        });
        if (box.children.length) { row.appendChild(box); wrap.appendChild(row); }
      });
      return wrap;
    }
    rb.appendChild(chips(s.runner, -1, function (i) { s.runner = i; }));
    var R = s.runner != null ? RUN[s.runner] : null;
    var R2 = s.layer && s.runner2 != null ? RUN[s.runner2] : null;
    var canLayer = R && RUN.some(function (r, i) { return i !== s.runner && r.max >= t && !isBooked(r, NRt); });
    if (R && !canLayer) { s.layer = false; s.runner2 = null; }
    if (R && canLayer) {
      var lr = WT.el('div', 'q-layer');
      lr.appendChild(opt(s.layer ? 'Layering ✓' : 'Layer it with a second color', '+' + WT.peso(LAYER[t]) + ' · two runners, one on top of the other', s.layer, function () { s.layer = !s.layer; if (!s.layer) s.runner2 = null; render(); }));
      rb.appendChild(lr);
      if (s.layer) {
        rb.appendChild(WT.el('p', 'q-sublabel', 'Second color'));
        rb.appendChild(chips(s.runner2, s.runner, function (i) { s.runner2 = i; }, true));
        rb.appendChild(WT.el('p', 'q-note', 'With Pink or White, the +' + WT.peso(LAYER[t]) + ' is part of your downpayment. Other colors are subject to availability, so we’ll confirm them one day before your event and add the +' + WT.peso(LAYER[t]) + ' to your balance then.'));
      }
    } else if (!R) { s.layer = false; s.runner2 = null; }
    var runnerName = R ? (R2 ? R.name + ' + ' + R2.name + ' (layered)' : R.name + (s.layer ? ' + second color to choose' : '')) : '';
    $('qRunnerNote').classList.remove('warn');
    $('qRunnerNote').textContent = R ? (R2 ? R.name + ' ' + R.fabric.toLowerCase() + ' layered with ' + R2.name + ' ' + R2.fabric.toLowerCase() : R.name + ' · ' + R.fabric) : 'Tap a runner. Faded ones aren’t available for ' + WT.TIERS[t] + '.';
    s.vase = 'acrylic';
    // 3 upgrade
    if (t === 3) { s.up = 'none'; s.gm = false; }
    var ub = $('qUp'); ub.innerHTML = '';
    var fdFrom = t < 3 ? 'from ' + WT.peso(FD.tiered[t]) : 'not for Ever After';
    ub.appendChild(opt('Just the standard', 'included', s.up === 'none', function () { s.up = 'none'; s.gm = false; render(); }));
    ub.appendChild(opt('Fairy Dust', fdFrom, s.up === 'fd', function () { s.up = 'fd'; s.gm = false; render(); }, t === 3));
    ub.appendChild(opt('Full Bloom', t < 3 ? WT.peso(FB[t]) : 'not for Ever After', s.up === 'fb', function () { s.up = 'fb'; render(); }, t === 3));
    var sub = $('qUpSub'); sub.innerHTML = '';
    if (s.up !== 'none') {
      var row = WT.el('div', 'q-subrow', '<span class="lbl">Candle holder</span>');
      row.appendChild(opt('<img class="pm-thumb hd-thumb" src="img/holder-tiered.jpg" alt="">Tiered gold', s.up === 'fd' ? WT.peso(FD.tiered[t]) : '', s.holder === 'tiered', function () { s.holder = 'tiered'; render(); }));
      row.appendChild(opt('<img class="pm-thumb hd-thumb" src="img/holder-glass.jpg" alt="">Glass', s.up === 'fd' ? WT.peso(FD.glass[t]) : '', s.holder === 'glass', function () { s.holder = 'glass'; render(); }));
      sub.appendChild(row);
      {
        var rr = WT.el('div', 'q-subrow', '<span class="lbl">Ribbon</span>');
        rr.appendChild(opt('Match my runner', '', s.ribbon === 'match', function () { s.ribbon = 'match'; render(); }));
        rr.appendChild(opt('Choose a color', '', s.ribbon === 'custom', function () { s.ribbon = 'custom'; render(); var i = document.getElementById('qRibbon'); if (i) i.focus(); }));
        sub.appendChild(rr);
        if (s.ribbon === 'custom') {
          var ri = document.createElement('input');
          ri.id = 'qRibbon'; ri.className = 'q-text'; ri.placeholder = 'Ribbon color, e.g. dusty blue, champagne';
          ri.value = s.ribbonColor; ri.setAttribute('aria-label', 'Ribbon color');
          ri.addEventListener('input', function () { s.ribbonColor = ri.value; });
          ri.addEventListener('change', function () { s.ribbonColor = ri.value; render(); });
          sub.appendChild(ri);
        }
      }
      if (s.up === 'fb') {
        var row2 = WT.el('div', 'q-subrow', '<span class="lbl">Placemat</span>');
        row2.appendChild(opt('<img class="pm-thumb" src="img/placemat-gold.jpg" alt="">Sheer Gold', '', s.mat === 'gold', function () { s.mat = 'gold'; render(); }));
        row2.appendChild(opt('<img class="pm-thumb" src="img/placemat-jute.jpg" alt="">Jute', '', s.mat === 'jute', function () { s.mat = 'jute'; render(); }));
        sub.appendChild(row2);
      }
    }
    // 4 extras
    var eb = $('qExtras'); eb.innerHTML = '';
    var pinkOk = true;
    if (!pinkOk) s.taper = false;
    if (s.up !== 'fb') s.gm = false;
    function check(label, price, on, ok, why, set) {
      var l = WT.el('label', 'q-check' + (ok ? '' : ' off'));
      var c = document.createElement('input'); c.type = 'checkbox'; c.checked = on; c.disabled = !ok;
      c.addEventListener('change', function () { set(c.checked); render(); });
      l.appendChild(c);
      l.appendChild(WT.el('span', '', label + ' <b>+' + WT.peso(price) + '</b>' + (ok ? '' : '<small>' + why + '</small>')));
      eb.appendChild(l);
    }
    check('Pink LED taper candles', TAPER[t], s.taper, pinkOk, 'Pick a Pink or Pink + White runner', function (v) { s.taper = v; });
    // 4 setup
    var sb = $('qSetup'); sb.innerHTML = '';
    // Dates when Fairy Godmother Service is not available (edit this list anytime: ['start', 'end'])
    var GM_OFF = [['2026-10-30', '2026-11-06'], ['2026-11-27', '2026-11-29']];
    var gmOffDay = !!avDate && GM_OFF.some(function (r) { return avDate >= r[0] && avDate <= r[1]; });
    if (gmOffDay) s.gm = false;
    var gmOk = t < 3 && s.up === 'fb' && !gmOffDay;
    sb.appendChild(opt('I’ll set it up', 'included · with our care card', !s.gm, function () { s.gm = false; render(); }));
    sb.appendChild(opt('Fairy Godmother Service', gmOffDay ? 'not available on ' + niceDate(avDate) : t < 3 ? 'we set it up for you · +' + WT.peso(GM[t]) : 'not for Ever After', s.gm, function () { s.gm = true; render(); }, !gmOk));
    $('qSetupNote').textContent = gmOffDay ? 'Fairy Godmother Service isn’t available on ' + niceDate(avDate) + ', but you can still book your table and set it up yourself with our care card.' : gmOk ? 'Free delivery within Lanang to Roxas. Farther venues have a delivery fee, shown when you enter your venue.' : (t < 3 ? 'Fairy Godmother Service is available with Full Bloom.' : '');
    // summary
    var lines = [], total = s.alc ? 0 : BASE[t];
    if (s.alc) lines.push(['À la carte order', 0]);
    else {
    var NV = [1, 4, 8, 12][t], NT = [3, 8, 16, 24][t], NR = [1, 1, 2, 3][t];
    var ribTxt = s.ribbon === 'custom' ? (s.ribbonColor.trim() ? s.ribbonColor.trim() + ' ribbon' : 'ribbon, color to confirm') : 'ribbon matched to your runner';
    var holderTxt = NT + ' ' + (s.holder === 'tiered' ? 'tiered gold' : 'glass') + ' candle holders with ' + ribTxt;
    var incG = [
      NR + (NR > 1 ? ' runners' : ' runner') + (R ? ' in ' + runnerName : ''),
      NV + (NV > 1 ? ' clear acrylic vases' : ' clear acrylic vase')
    ];
    if (s.up === 'fb') incG.push(
      NV + (NV > 1 ? ' fresh flower arrangements, one at every vase' : ' fresh flower arrangement'),
      NV + (NV > 1 ? ' LED pillar candles, one at every vase' : ' LED pillar candle'));
    incG.push(NT + ' ' + (s.taper ? 'pink' : 'cream') + ' LED taper candles');
    incG.push(s.up === 'none' ? NT + ' gold candle holders' : holderTxt);
    if (s.up === 'fb') incG.push((s.mat === 'gold' ? 'Sheer gold' : 'Jute') + ' placemats', 'Cloth napkins with rings', 'Name cards', 'Kraft-paper wrap to take a bloom home');
    incG.push('Spare batteries and a care card');
    incG.push('24-hour rental, starting when you receive the items');
    lines.push([WT.TIERS[t] + ' gathering', BASE[t], s.up === 'none' ? incG : null]);
    if (s.up === 'fd') lines.push(['Fairy Dust', FD[s.holder][t], incG]);
    if (s.up === 'fb') lines.push(['Full Bloom', FB[t], incG, 'Tableware (plates, glasses and cutlery) not included']);
    if (s.layer && R) lines.push([R2 ? 'Layering: ' + R2.name : 'Layering: second color to choose', LAYER[t], null, !(R2 && R2.layer) ? 'Paid with your balance once we confirm your second color' : '']);
    if (s.taper) lines.push(['Pink LED taper candles', TAPER[t]]);
    if (s.gm) lines.push(['Setup: Fairy Godmother Service', GM[t]]);
    var dl = deliveryLine();
    }
    alaLines.forEach(function (l) { lines.push(l); });
    if (s.alc && !alaLines.length) lines.push(['Add at least one item', 0]);
    var ul = $('qLines'); ul.innerHTML = '';
    lines.forEach(function (l, i) {
      total += i ? l[1] : 0;
      var inc = (l[2] ? '<ul class="q-inc">' + l[2].map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul>' : '') + (l[3] ? '<em class="q-inc-note">' + l[3] + '</em>' : '');
      ul.appendChild(WT.el('li', (l[2] ? 'has-inc' : '') + (i === 0 && !s.alc && s.up !== 'none' ? ' q-joined' : ''), '<span>' + l[0] + inc + '</span><span>' + (i === 0 ? (s.alc ? '' : WT.peso(l[1])) : l[1] ? (s.alc ? WT.peso(l[1]) : '+' + WT.peso(l[1])) : (s.alc ? '' : 'included')) + '</span>'));
    });
    var depAmt = s.alc ? (alaLines.length ? ALA_DEP : 0) : (s.up === 'fb' ? [350, 500, 600, 500] : [300, 300, 500, 500])[t];
    if (depAmt) ul.appendChild(WT.el('li', '', '<span>Security deposit<em class="q-inc-note">Refundable once every piece is back safe and sound</em></span><span>+' + WT.peso(depAmt) + '</span>'));
    if (dl) { total += dl[1]; ul.appendChild(WT.el('li', '', '<span>' + dl[0] + (dl[3] ? '<em class="q-inc-note">' + dl[3] + '</em>' : '') + '</span><span>' + (dl[1] ? '+' + WT.peso(dl[1]) : 'free') + '</span>')); }
    var tot = $('qTotal'), newTxt = WT.peso(total), shown = WT.peso(total + depAmt);
    var pending = needsDelivery() && !DLV;
    var info = $('qDlvInfo');
    var R24 = ' The rental is for 24 hours from when you receive the items, so plan where everything will be picked up.';
    if (info) info.textContent = !needsDelivery() ? 'So we know where your items are going. Delivery and return are arranged by you and paid to the courier directly. The rental is for 24 hours from when you receive the items, so plan where you’ll send everything back from.' :
      s.gm ? 'With Fairy Godmother Service, delivery is free within Lanang to Roxas. Farther venues: ₱250 each way up to 10 km past, ₱300 each way up to 20 km past.' + R24 :
      'Full Bloom is a big setup that doesn’t fit on a motorbike, so we deliver and pick it up by car. Each way: ₱100 within Buhangin, ₱200 within Lanang to Roxas, ₱250 up to 10 km past, ₱300 up to 20 km past.' + R24;
    var fine = $('qFine');
    if (fine) fine.textContent = s.alc ? 'Includes the refundable security deposit. Pickup or delivery is arranged on the day and paid to the courier directly.' :
      needsDelivery() ? (DLV ? 'Includes delivery and the refundable security deposit.' : 'Includes the refundable security deposit. Check your venue to add your delivery fee.') :
      'Includes the refundable security deposit. Delivery is arranged on the day and paid to the courier directly.';
    if (pending) tot.innerHTML = shown + '<small>+ delivery</small>';
    else if (tot.textContent !== shown) { tot.textContent = shown; tot.classList.remove('pop'); void tot.offsetWidth; tot.classList.add('pop'); }
    var ph = $('qPhoto'), want = (!s.alc && R) ? R.img : 'img/standard-setup.jpg';
    if (ph.getAttribute('src') !== want) { ph.classList.add('fade'); var pre = new Image(); pre.onload = pre.onerror = function () { if (ph._want === want) { ph.src = want; ph.classList.remove('fade'); } }; ph._want = want; pre.src = want; }
    ph.alt = R ? R.name + ' ' + R.fabric + ' runner' : 'Standard setup';
    ph.parentNode.hidden = !!s.alc;
    var inset = $('qInset'), upImg = s.alc ? '' : s.up === 'fb' ? 'img/fullbloom-1.jpg' : s.up === 'fd' ? (s.holder === 'glass' ? 'img/fairydust-glass.jpg' : 'img/fairydust-tiered.jpg') : '';
    inset.hidden = !upImg;
    if (upImg) { inset.querySelector('img').src = upImg; inset.querySelector('figcaption').textContent = s.up === 'fb' ? 'Full Bloom' : 'Fairy Dust · ' + (s.holder === 'glass' ? 'glass' : 'tiered'); }
    // customer-facing lines for the payment / confirmation messages
    var PAX = [2, 15, 30, 40], DEP = [300, 300, 500, 500];
    var rib = s.ribbon === 'custom' ? (s.ribbonColor.trim() ? s.ribbonColor.trim() + ' ribbon' : 'ribbon color to confirm') : 'ribbon matched to runner';
    var ml = [];
    var first = WT.TIERS[t] + ' gathering (' + (t === 0 ? '2 pax' : 'up to ' + PAX[t] + ' pax') + ')';
    if (R && !R2) first += ', ' + R.name + ' runner';
    ml.push(first);
    if (R2) ml.push('Layered ' + R.name + ' + ' + R2.name + ' runner, +' + WT.peso(LAYER[t]) + (R2.layer ? '' : ' (second color confirmed one day before, paid with your balance)'));
    if (s.up === 'fd') ml.push('Fairy Dust, ' + (s.holder === 'tiered' ? 'tiered gold' : 'glass') + ' candle holders (' + rib + '), +' + WT.peso(FD[s.holder][t]));
    if (s.up === 'fb') ml.push('Full Bloom, ' + (s.holder === 'tiered' ? 'tiered gold' : 'glass') + ' candle holders, ' + (s.mat === 'gold' ? 'sheer gold' : 'jute') + ' placemats (' + rib + '), +' + WT.peso(FB[t]));
    if (s.taper) ml.push('Pink LED taper candles, +' + WT.peso(TAPER[t]));
    if (s.gm) ml.push('Setup: Fairy Godmother Service, +' + WT.peso(GM[t]));
    if (dl) ml.push(dl[0] + (dl[1] ? ', +' + WT.peso(dl[1]) : ''));
    alaLines.forEach(function (l) { ml.push(l[0] + ', ' + (s.alc ? '' : '+') + WT.peso(l[1])); });
    if (s.alc) ml = ['À la carte order:'].concat(alaLines.map(function (l) { return l[0] + ', ' + WT.peso(l[1]); }));
    root._msg = { lines: ml, total: total, deposit: s.alc ? ALA_DEP : depAmt, layer: (!s.alc && s.layer && R2 && !R2.layer) ? LAYER[t] : 0, delivery: dl ? dl[1] : 0 };
    root._total = newTxt; root._hasRunner = s.alc ? alaLines.length > 0 : (!!avDate && !!R && (!s.layer || !!R2));
    root._summary = 'My Whimsy Touch table:\n' + lines.map(function (l, i) { return '• ' + l[0] + (i === 0 ? ' — ' + WT.peso(l[1]) : l[1] ? ' — +' + WT.peso(l[1]) : '') + (l[2] ? l[2].map(function (x) { return '\n   – ' + x; }).join('') + '\n' : ''); }).join('\n') + (depAmt ? '\n• Security deposit (refundable) — +' + WT.peso(depAmt) : '') + (dl ? '\n• ' + dl[0] + (dl[1] ? ' — +' + WT.peso(dl[1]) : ' — free') : '') + '\nTotal: ' + shown + (depAmt ? ' (' + newTxt + ' rental + ' + WT.peso(depAmt) + ' refundable deposit)' : '');
  }
  document.getElementById('qCopy').addEventListener('click', function () {
    render();
    var b = this, txt = root._summary;
    function done() { b.textContent = 'Copied! Paste it in your booking'; setTimeout(function () { b.textContent = 'Copy my picks'; }, 2200); }
    if (navigator.clipboard) navigator.clipboard.writeText(txt).then(done, function () { window.prompt('Copy your picks:', txt); });
    else window.prompt('Copy your picks:', txt);
  });
  function R_missing() { if (s.alc) return 'Add at least one à la carte item first.'; if (!avDate) return 'Pick your event date first, then choose your runner.'; return s.runner == null ? 'Pick a runner color first, then book.' : 'Pick your second layering color, or turn layering off.'; }
  // ready-to-send messages for Whimsy Touch (saved in the bookings sheet)
  function buildMessages(ref, f) {
    var M = root._msg, peso = WT.peso;
    var first = String(f.get('name') || '').trim().split(/\s+/)[0] || 'there';
    var mo = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    var d = String(f.get('date') || '').split('-'), when = '', due = '';
    if (d.length === 3) {
      var dt = new Date(+d[0], +d[1] - 1, +d[2]), pd = new Date(+d[0], +d[1] - 1, +d[2] - 1);
      when = mo[dt.getMonth()] + ' ' + dt.getDate() + ', ' + dt.getFullYear();
      due = mo[pd.getMonth()] + ' ' + pd.getDate();
    }
    var tm = String(f.get('time') || ''), tt = '';
    if (/^\d{1,2}:\d{2}/.test(tm)) { var h = +tm.split(':')[0], m = tm.split(':')[1]; tt = (h % 12 || 12) + ':' + m + ' ' + (h < 12 ? 'AM' : 'PM'); }
    var dateLine = 'Date: ' + when + (tt ? ', ' + tt : '');
    var venue = 'Venue: ' + String(f.get('venue') || '').trim();
    var LF = M.layer || 0, DF = M.delivery || 0, half = Math.round((M.total - LF - DF) / 2), rest = M.total - LF - DF - half;
    var layerBit = (DF ? ' + ' + peso(DF) + ' delivery' : '') + (LF ? ' + ' + peso(LF) + ' layering, once your second color is confirmed' : '');
    var closer = s.gm ? 'We can\'t wait to set your table!' : 'We hope you have the loveliest time setting up your table!';
    var pay = 'Hi ' + first + '! Thank you for booking with Whimsy Touch 🌸\n\n' +
      'Here\'s your booking summary (Ref: ' + ref + '):\n\n' + M.lines.join('\n') + '\n' + dateLine + '\n' + venue + '\n\n' +
      'Total: ' + peso(M.total) + '\nSecurity deposit: ' + peso(M.deposit) + ' (refundable)\n\n' +
      'To lock in your date, please send the 50% downpayment of ' + peso(half) + ' through the QR above.\n\n' +
      'Your total remaining balance of ' + peso(rest + LF + DF + M.deposit) + ' (' + peso(rest) + ' rental balance' + layerBit + ' + ' + peso(M.deposit) + ' refundable security deposit) is due on ' + due + ', one day before your event.\n\n' +
      'Once your downpayment is in, we\'ll send your official invoice. Thank you po! ☺️';
    var conf = 'Hi ' + first + '! We\'ve received your ' + peso(half) + ' downpayment, so your date is officially booked 🌸\n\n' +
      'Attached is your invoice for your records (Ref: ' + ref + '). Your total remaining balance of ' + peso(rest + LF + DF + M.deposit) + (DF || LF ? ' (including ' + [DF ? peso(DF) + ' delivery' : '', LF ? peso(LF) + ' layering, once your second color is confirmed' : ''].filter(String).join(' and ') + ')' : '') + ' is due on ' + due + ', one day before your event.\n\n' +
      'Please send your exact Google Maps pin so we can confirm delivery. ' + closer + ' Thank you po! ☺️';
    // event today or tomorrow: full payment + deposit now
    var rush = false, dayWord = '';
    if (d.length === 3) {
      var t0 = new Date(); t0.setHours(0, 0, 0, 0);
      var days = Math.round((new Date(+d[0], +d[1] - 1, +d[2]) - t0) / 86400000);
      if (days <= 1) { rush = true; dayWord = days <= 0 ? 'today' : 'tomorrow'; }
    }
    if (rush) {
      var full = M.total + M.deposit;
      pay = 'Hi ' + first + '! Thank you for booking with Whimsy Touch 🌸\n\n' +
        'Here\'s your booking summary (Ref: ' + ref + '):\n\n' + M.lines.join('\n') + '\n' + dateLine + '\n' + venue + '\n\n' +
        'Total: ' + peso(M.total) + '\nSecurity deposit: ' + peso(M.deposit) + ' (refundable)\n\n' +
        'Since your event is ' + dayWord + ', we\'ll need the full payment settled today to lock in your date and prepare your table on time: ' +
        peso(M.total) + ' rental + ' + peso(M.deposit) + ' refundable security deposit = ' + peso(full) + '. Please send it through the QR above.\n\n' +
        'Once your payment is in, we\'ll send your official invoice. Thank you po! ☺️';
      conf = 'Hi ' + first + '! We\'ve received your full payment of ' + peso(full) + ', so your date is officially booked 🌸\n\n' +
        'Attached is your invoice for your records (Ref: ' + ref + '). Your ' + peso(M.deposit) + ' security deposit will be returned once every piece is back safe and sound.\n\n' +
        'Please send your exact Google Maps pin so we can confirm delivery. ' + closer + ' Thank you po! ☺️';
    }
    return { pay: pay, conf: conf, due: rush ? M.total + M.deposit : half, rush: rush, rest: rush ? 0 : rest + LF + DF + M.deposit, restDue: due, df: DF, dep: M.deposit };
  }
  // booking form (Netlify Forms)
  var form = document.getElementById('qForm'), bookBtn = document.getElementById('qBookBtn');
  var dateIn = document.getElementById('qDate');
  if (dateIn) { var d = new Date(); d.setDate(d.getDate() + 1); dateIn.min = d.toISOString().slice(0, 10); }
  var avIn = document.getElementById('qAvDate');
  if (avIn && dateIn) {
    avIn.min = dateIn.min;
    avIn.addEventListener('change', function () { dateIn.value = avIn.value; checkAvail(avIn.value); });
    dateIn.addEventListener('change', function () { if (avIn.value !== dateIn.value) { avIn.value = dateIn.value; checkAvail(dateIn.value); } });
  }
  function showPayment(ref, mm) {
    var box = document.getElementById('qPay'); if (!box || !mm) return;
    box.hidden = false;
    document.getElementById('qPayAmt').textContent = WT.peso(mm.due);
    document.getElementById('qPayWhat').textContent = mm.rush ? 'Full payment (your event is very soon)' : '50% downpayment';
    var restEl = document.getElementById('qPayRest');
    if (restEl) { restEl.hidden = !mm.rest; if (mm.rest) restEl.innerHTML = '<span>Remaining balance' + (mm.restDue ? ', due ' + mm.restDue : '') + '<small>' + ['rental balance', mm.df ? 'delivery' : '', 'refundable security deposit'].filter(String).join(' + ') + '</small></span><b>' + WT.peso(mm.rest) + '</b>'; }
    var fileIn = document.getElementById('qRcpt'), btn = document.getElementById('qRcptSend'), note = document.getElementById('qRcptNote');
    document.getElementById('qPayCopy').onclick = function () { var b = this; if (navigator.clipboard) navigator.clipboard.writeText('15454836781').then(function () { b.textContent = 'Copied!'; }); };
    btn.onclick = function () {
      var f = fileIn.files && fileIn.files[0];
      if (!f) { note.textContent = 'Please choose a screenshot of your receipt first.'; note.classList.add('warn'); return; }
      btn.disabled = true; btn.textContent = 'Sending…'; note.classList.remove('warn'); note.textContent = '';
      var rd = new FileReader();
      rd.onload = function () {
        var img = new Image();
        img.onload = function () {
          var k = Math.min(1, 1600 / Math.max(img.width, img.height)), c = document.createElement('canvas');
          c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
          c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
          var body = new URLSearchParams(); body.set('type', 'receipt'); body.set('ref', ref); body.set('amount', WT.peso(mm.due));
          body.set('file', c.toDataURL('image/jpeg', 0.85).split(',')[1]);
          fetch(window.WT_SHEETS_URL, { method: 'POST', mode: 'no-cors', body: body }).then(function () {
            btn.textContent = 'Receipt sent ✓'; fileIn.disabled = true;
            note.textContent = 'Thank you! We’ll check your payment and email your invoice shortly.';
          }).catch(function () {
            btn.disabled = false; btn.textContent = 'Send my receipt';
            note.textContent = 'Sorry, that didn’t go through. Please try again, or send your receipt to us on Instagram or Facebook.'; note.classList.add('warn');
          });
        };
        img.onerror = function () { btn.disabled = false; btn.textContent = 'Send my receipt'; note.textContent = 'Please upload an image (a screenshot of your receipt).'; note.classList.add('warn'); };
        img.src = rd.result;
      };
      rd.readAsDataURL(f);
    };
  }
  var venueIn = document.getElementById('qVenueLink'), venueName = document.getElementById('qVenueName'), dlvBtn = document.getElementById('qDlvBtn');
  if (venueIn) venueIn.addEventListener('input', function () { if (DLV !== null || DLVP !== null || dlvFor) { DLV = null; DLVP = null; dlvFor = ''; render(); } });
  var pickIn = document.getElementById('qPickLink'), pickSame = document.getElementById('qPickSame');
  function resetDlv() { if (DLV !== null || DLVP !== null || dlvFor) { DLV = null; DLVP = null; dlvFor = ''; render(); } }
  if (pickIn) pickIn.addEventListener('input', resetDlv);
  if (pickSame) pickSame.addEventListener('change', function () { document.getElementById('qPickBox').hidden = pickSame.checked; resetDlv(); });
  function dlvKey() { return venueIn.value.trim() + '|' + (pickupSame() ? '' : pickIn.value.trim()); }
  function quote(q) { return fetch(window.WT_SHEETS_URL + '?delivery=' + encodeURIComponent(q)).then(function (r) { return r.json(); }).then(function (j) { return j && j.ok ? j : false; }).catch(function () { return false; }); }
  if (dlvBtn) dlvBtn.addEventListener('click', function () {
    var q = venueIn.value.trim(), pq = pickupSame() ? '' : pickIn.value.trim();
    var bad = !isMapsLink(q) ? venueIn : (!pickupSame() && !isMapsLink(pq)) ? pickIn : null;
    if (bad) { DLV = null; DLVP = null; dlvFor = ''; render(); $('qDlvNote').textContent = 'Please paste a Google Maps link (it starts with https://maps.app.goo.gl/ or https://www.google.com/maps/).'; $('qDlvNote').classList.add('warn'); bad.focus(); return; }
    var key = dlvKey(); dlvBusy = true; dlvFor = key; DLV = null; DLVP = null; render(); dlvBtn.disabled = true;
    Promise.all([quote(q), pq ? quote(pq) : Promise.resolve(null)]).then(function (r) {
      if (dlvFor !== key) return; DLV = r[0]; DLVP = r[1];
    }).then(function () { dlvBusy = false; dlvBtn.disabled = false; render(); });
  });
  function isMapsLink(v) { return /^https?:\/\/(maps\.app\.goo\.gl|goo\.gl\/maps|(www\.)?google\.[a-z.]+\/maps|maps\.google\.[a-z.]+)\S*/i.test(String(v || '').trim()); }
  function runnersField() {
    if (s.alc || s.runner == null) return '';
    var n = [1, 1, 2, 3][s.tier], out = [RUN[s.runner].name + ' x' + n];
    if (s.layer && s.runner2 != null) out.push(RUN[s.runner2].name + ' x' + n + (RUN[s.runner2].layer ? '' : ' (layer)'));
    return out.join(', ');
  }
  function detailsMode(on) {
    var qs = document.getElementById('quote'), grid = qs.querySelector('.q-grid'), bk = document.getElementById('book');
    grid.classList.toggle('is-details', on);
    qs.classList.toggle('is-details', on);
    ['.eyebrow', '.script-title', '.lead'].forEach(function (sel) { var el = qs.querySelector('.wrap > ' + sel); if (el) el.style.display = on ? 'none' : ''; });
    if (bk) bk.style.display = on ? 'none' : '';
    document.getElementById('qBack').hidden = !on;
    document.getElementById('qVenueStep').hidden = !on;
    document.getElementById('qCopy').style.display = on ? 'none' : '';
    if (!on) { form.hidden = true; bookBtn.hidden = false; document.getElementById('qErr').hidden = true; }
    window.scrollTo(0, Math.max(0, qs.getBoundingClientRect().top + window.pageYOffset - 90));
  }
  document.getElementById('qBack').addEventListener('click', function () { detailsMode(false); });
  bookBtn.addEventListener('click', function () {
    if (!root._hasRunner) {
      var n = document.getElementById('qRunnerNote'); n.textContent = R_missing(); n.classList.add('warn');
      document.getElementById(s.alc ? 'qAla' : 'qRunner').scrollIntoView({ behavior: 'smooth', block: 'center' }); return;
    }
    form.hidden = false; bookBtn.hidden = true;
    detailsMode(true);
  });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var self = this, fdate = dateIn ? dateIn.value : '';
    if (!venueName.value.trim()) {
      var er3 = document.getElementById('qErr'); er3.hidden = false; er3.textContent = 'Please add your venue name at the top.';
      venueName.focus(); return;
    }
    if (!isMapsLink(venueIn.value)) {
      var er1 = document.getElementById('qErr'); er1.hidden = false; er1.textContent = 'Please paste the Google Maps link of your exact venue (open Google Maps, tap your venue, then Share → Copy link).';
      venueIn.focus(); return;
    }
    document.getElementById('qVenue').value = venueName.value.trim() + ' · ' + venueIn.value.trim();
    var ig = document.getElementById('qIg').value.trim(), fb = document.getElementById('qFb').value.trim();
    if (!ig && !fb) {
      var er2 = document.getElementById('qErr'); er2.hidden = false; er2.textContent = 'Please add your Instagram or Facebook (the account you message us from).';
      document.getElementById('qIg').focus(); return;
    }
    document.getElementById('qSocial').value = [ig ? 'IG: ' + ig : '', fb ? 'FB: ' + fb : ''].filter(String).join(' · ');
    if (needsDelivery() && (dlvFar() || !deliveryLine() || dlvFor !== dlvKey())) {
      var er0 = document.getElementById('qErr'); er0.hidden = false;
      er0.textContent = dlvFar() ? 'This location is outside our usual delivery area. Please message us on Instagram or Facebook before booking.' : 'Please tap “Check delivery fee” first, so your delivery is included in your total.';
      document.getElementById('qVenueStep').scrollIntoView({ behavior: 'smooth', block: 'center' }); return;
    }
    if (!e._checked && !s.alc && fdate) {
      var sendBtn = document.getElementById('qSend'); sendBtn.disabled = true; sendBtn.textContent = 'Checking your date…';
      if (avIn) avIn.value = fdate;
      checkAvail(fdate, function () {
        sendBtn.disabled = false; sendBtn.textContent = 'Send my booking';
        if (!root._hasRunner) {
          var n = document.getElementById('qRunnerNote'); n.textContent = (avLost || 'That color') + ' was just booked for ' + niceDate(fdate) + '. Please pick another runner, then send again.'; n.classList.add('warn');
          document.getElementById('qRunner').scrollIntoView({ behavior: 'smooth', block: 'center' }); return;
        }
        var ev = new Event('submit', { cancelable: true }); ev._checked = true; self.dispatchEvent(ev);
      });
      return;
    }
    render();
    var err = document.getElementById('qErr'), send = document.getElementById('qSend');
    err.hidden = true;
    var ref = 'WT-' + Date.now().toString(36).toUpperCase().slice(-6);
    var agreedAt = new Date().toLocaleString('en-PH', { timeZone: 'Asia/Manila' });
    document.getElementById('qOrder').value = ref + '\n' + root._summary + '\nUnderstood this is a booking request, not a confirmed booking: yes\nRead the full Terms & Conditions and agreed: ' + agreedAt;
    document.getElementById('qOrderTotal').value = root._total;
    send.disabled = true; send.textContent = 'Sending…';
    var body = new URLSearchParams(new FormData(form)).toString();
    var toNetlify = fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return true; });
    var sheetBody = new URLSearchParams(new FormData(form)); sheetBody.set('ref', ref); sheetBody.set('runners', runnersField());
    var mm = null;
    try { mm = buildMessages(ref, new FormData(form)); sheetBody.set('payment_msg', mm.pay); sheetBody.set('confirm_msg', mm.conf); } catch (err) {}
    var dlx = deliveryLine();
    if (dlx) { var pq0 = pickQ(); sheetBody.set('delivery_fee', String(dlx[1])); sheetBody.set('delivery_info', WT.peso(dlx[1]) + ' · ' + dlx[3] + (DLV.km ? ' · venue ' + DLV.km + ' km from ' + (DLV.from || 'edge') : '') + (DLV.place ? ' · ' + DLV.place : '') + (pickupSame() ? ' · pickup same as venue' : ' · pickup: ' + pickIn.value.trim() + (pq0 && pq0.place ? ' (' + pq0.place + ')' : ''))); }
    var toSheet = window.WT_SHEETS_URL
      ? fetch(window.WT_SHEETS_URL, { method: 'POST', mode: 'no-cors', body: sheetBody }).then(function () { return true; })
      : Promise.reject(new Error('no sheet'));
    Promise.allSettled([toNetlify, toSheet])
      .then(function (res) { if (!res.some(function (x) { return x.status === 'fulfilled'; })) throw new Error('not sent'); })
      .then(function () {
        var f = new FormData(form);
        var copy = root._summary + '\n\nName: ' + f.get('name') + '\nMobile: ' + f.get('phone') + '\nInstagram/Facebook: ' + f.get('social') + '\nDate: ' + f.get('date') + ' at ' + f.get('time') + '\nVenue: ' + f.get('venue') + (f.get('notes') ? '\nNotes: ' + f.get('notes') : '');
        document.getElementById('qRef').textContent = 'Booking reference: ' + ref;
        showPayment(ref, mm);
        document.getElementById('qCopyTxt').textContent = copy;
        form.hidden = true; document.querySelector('.q-actions').hidden = true;
        var done = document.getElementById('qDone'), qs = document.getElementById('quote'), wrap = qs.querySelector('.wrap');
        Array.prototype.forEach.call(wrap.children, function (el) { el.style.display = 'none'; });
        var bk = document.getElementById('book'); if (bk) bk.style.display = 'none';
        wrap.appendChild(done); done.classList.add('q-done-page'); done.hidden = false; qs.classList.add('is-details');
        window.scrollTo(0, Math.max(0, qs.getBoundingClientRect().top + window.pageYOffset - 90));
        document.getElementById('qCopy2').onclick = function () {
          var b = this; if (navigator.clipboard) navigator.clipboard.writeText('Ref ' + ref + '\n' + copy).then(function () { b.textContent = 'Copied!'; });
        };
      })
      .catch(function () {
        send.disabled = false; send.textContent = 'Send my booking';
        err.hidden = false;
        err.innerHTML = 'Sorry, that didn’t go through. Please try again, or message us on <a href="https://ig.me/m/thewhimsytouch" target="_blank" rel="noopener">Instagram</a> or <a href="https://m.me/61594083157602" target="_blank" rel="noopener">Facebook</a>.';
      });
  });
  render();
})();

// ---------- Gentle scroll animations ----------
(function () {
  if (!('IntersectionObserver' in window)) return;
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var sel = '.eyebrow, .script-title, .lead, .about p, .doily, .stem, .gathering, .standard, .addon, .addon-foot, .godmother, .alacarte table, .q-grid, .fabric-head, .picker, .cta-strip, .book .wrap > *';
  var items = document.querySelectorAll(sel);
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' });
  items.forEach(function (el) { el.classList.add('rv'); io.observe(el); });
  // polaroids drop onto the table one by one
  var ms = document.querySelectorAll('.moment');
  ms.forEach(function (m, i) {
    var rot = ((i * 37) % 11) - 5;
    m.style.setProperty('--drop', rot + 'deg');
    m.style.transitionDelay = (i * 70) + 'ms';
    m.classList.add('drop');
  });
  var grid = document.querySelector('.moments-grid');
  if (grid) new IntersectionObserver(function (es, o) {
    es.forEach(function (e) { if (e.isIntersecting) { ms.forEach(function (m) { m.classList.add('in'); }); o.disconnect(); setTimeout(function () { ms.forEach(function (m) { m.style.transitionDelay = ''; }); }, 1800); } });
  }, { rootMargin: '0px 0px -15% 0px' }).observe(grid);
  // runner cards (built by JS) fade in too
  document.querySelectorAll('#runners .runner').forEach(function (c, i) { c.classList.add('rv'); c.style.transitionDelay = (i % 4) * 60 + 'ms'; io.observe(c); });
})();

// Moments videos: only one plays at a time
(function () {
  var vids = document.querySelectorAll('.mvid video');
  vids.forEach(function (v) { v.addEventListener('play', function () { vids.forEach(function (o) { if (o !== v) o.pause(); }); }); });
})();

// Terms & Conditions pop-up (opens over the page instead of leaving it)
(function () {
  var cache = null, box = null, needAgree = false;
  var agreeBox = document.getElementById('qAgree');
  function build(html) {
    box = document.createElement('div');
    box.className = 'tc-modal';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', 'Terms and Conditions');
    box.innerHTML = '<div class="tc-backdrop"></div><div class="tc-panel"><button type="button" class="tc-close" aria-label="Close">×</button><div class="tc-body">' + html + '</div><div class="tc-actions"><p class="tc-hint">Scroll to the end to continue</p><button type="button" class="btn tc-ok">Close</button></div></div>';
    document.body.appendChild(box);
    box.querySelector('.tc-backdrop').onclick = close;
    box.querySelector('.tc-close').onclick = close;
    box.querySelector('.tc-ok').onclick = function () {
      if (needAgree && agreeBox) {
        agreeBox.disabled = false; agreeBox.checked = true;
        var l = document.getElementById('qAgreeLabel'); l.classList.remove('is-locked'); l.classList.add('is-done');
        document.getElementById('qAgreeText').innerHTML = 'I have read and agree to the <a href="terms.html">Terms &amp; Conditions</a>.';
      }
      close();
    };
    box.querySelector('.tc-panel').addEventListener('scroll', check);
  }
  function check() {
    if (!needAgree) return;
    var p = box.querySelector('.tc-panel'), ok = box.querySelector('.tc-ok');
    var end = p.scrollTop + p.clientHeight >= p.scrollHeight - 30;
    if (end) { ok.disabled = false; box.querySelector('.tc-hint').style.visibility = 'hidden'; }
  }
  function open(html, agreeMode) {
    if (!box) build(html);
    needAgree = !!agreeMode && !!agreeBox;
    var ok = box.querySelector('.tc-ok'), hint = box.querySelector('.tc-hint');
    ok.textContent = needAgree ? 'I have read and agree' : 'Close';
    ok.disabled = needAgree;
    hint.style.display = needAgree ? '' : 'none'; hint.style.visibility = 'visible';
    box.classList.add('open');
    document.documentElement.style.overflow = 'hidden';
    box.querySelector('.tc-panel').scrollTop = 0;
    box.querySelector('.tc-close').focus();
    setTimeout(check, 50);
  }
  function close() { if (box) box.classList.remove('open'); document.documentElement.style.overflow = ''; }
  function show(agreeMode) {
    if (cache) return open(cache, agreeMode);
    fetch('terms.html').then(function (r) { return r.text(); }).then(function (t) {
      var d = new DOMParser().parseFromString(t, 'text/html');
      var sec = d.querySelector('.terms .wrap');
      cache = sec ? sec.innerHTML : '';
      if (!cache) { location.href = 'terms.html'; return; }
      open(cache, agreeMode);
    }).catch(function () { location.href = 'terms.html'; });
  }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  document.addEventListener('click', function (e) {
    var r = e.target.closest && e.target.closest('#qReadTerms, #qAgreeLabel.is-locked');
    if (r) { e.preventDefault(); show(true); return; }
    var a = e.target.closest && e.target.closest('a[href="terms.html"]');
    if (!a) return;
    e.preventDefault();
    show(!!(agreeBox && agreeBox.disabled && a.closest('.q-form')));
  });
})();

// Gatherings header: letter-by-letter reveal + labels
(function () {
  var h = document.getElementById('gHero');
  if (!h) return;
  h.querySelectorAll('[data-split]').forEach(function (el) {
    var t = el.textContent, out = '', c = 0;
    for (var i = 0; i < t.length; i++) out += t[i] === ' ' ? ' ' : '<span class="ch" style="--c:' + (c++) + '">' + t[i] + '</span>';
    el.setAttribute('aria-label', t); el.innerHTML = out;
  });
  function go() { requestAnimationFrame(function () { h.classList.add('on'); }); }
  var img = h.querySelector('img');
  if (img.complete) go(); else { img.addEventListener('load', go); setTimeout(go, 1500); }
})();

// Runners page: Daylight / Candlelight photos
(function () {
  var btns = document.querySelectorAll('.daynight button');
  if (!btns.length) return;
  function nightSrc(src) { return src.replace('/runner-', '/night-').replace(/^img\/runner-/, 'img/night-'); }
  function daySrc(src) { return src.replace('/night-', '/runner-').replace(/^img\/night-/, 'img/runner-'); }
  var mode = 'day';
  function apply(m) {
    mode = m;
    document.body.classList.toggle('is-night', m === 'night');
    btns.forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-mode') === m ? 'true' : 'false'); });
    document.querySelectorAll('#runners .runner .ph img, #pickerImg').forEach(function (img) {
      var s = img.getAttribute('src'); if (!s) return;
      var n = m === 'night' ? nightSrc(s) : daySrc(s);
      if (n !== s) { img.classList.add('swap'); var pre = new Image(); pre.onload = function () { img.src = n; img.classList.remove('swap'); }; pre.onerror = function () { img.classList.remove('swap'); }; pre.src = n; }
    });
  }
  btns.forEach(function (b) { b.addEventListener('click', function () { apply(b.getAttribute('data-mode')); }); });
  // keep picker in the chosen mode when a new color is picked
  var pi = document.getElementById('pickerImg'), p2 = document.getElementById('pickerImg2');
  [pi, p2].forEach(function (img) {
    if (!img) return;
    new MutationObserver(function () {
      var s = img.getAttribute('src') || '';
      if (mode === 'night' && s.indexOf('runner-') > -1) img.setAttribute('src', nightSrc(s));
    }).observe(img, { attributes: true, attributeFilter: ['src'] });
  });
})();

// Full Bloom gallery: filter, arrows, lightbox
(function () {
  var g = document.getElementById('fullbloomGallery');
  if (!g) return;
  var strip = g.querySelector('.fbg-strip'), items = [].slice.call(g.querySelectorAll('.fbg-item'));
  g.querySelectorAll('.fbg-tabs button').forEach(function (b) {
    b.addEventListener('click', function () {
      var f = b.getAttribute('data-f');
      g.querySelectorAll('.fbg-tabs button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      items.forEach(function (it) { it.hidden = f !== 'all' && it.getAttribute('data-kind') !== f; });
      strip.scrollLeft = 0;
    });
  });
  function step(d) { strip.scrollBy({ left: d * strip.clientWidth * 0.8, behavior: 'smooth' }); }
  g.querySelector('.fbg-nav.prev').addEventListener('click', function () { step(-1); });
  g.querySelector('.fbg-nav.next').addEventListener('click', function () { step(1); });
  var box = document.createElement('div');
  box.className = 'fbg-box'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-label', 'Full Bloom photo');
  box.innerHTML = '<img alt=""><button type="button" class="x" aria-label="Close">×</button><button type="button" class="p" aria-label="Previous">‹</button><button type="button" class="n" aria-label="Next">›</button><div class="c"></div>';
  document.body.appendChild(box);
  var bi = box.querySelector('img'), cap = box.querySelector('.c'), cur = 0, vis = [];
  function show(i) { cur = (i + vis.length) % vis.length; var it = vis[cur]; bi.src = it.getAttribute('data-src'); bi.alt = it.querySelector('img').alt; cap.textContent = (cur + 1) + ' / ' + vis.length; }
  function close() { box.classList.remove('open'); document.documentElement.style.overflow = ''; }
  items.forEach(function (it) {
    it.addEventListener('click', function () {
      vis = items.filter(function (x) { return !x.hidden; });
      show(vis.indexOf(it)); box.classList.add('open'); document.documentElement.style.overflow = 'hidden';
    });
  });
  box.querySelector('.x').onclick = close;
  box.querySelector('.p').onclick = function () { show(cur - 1); };
  box.querySelector('.n').onclick = function () { show(cur + 1); };
  box.addEventListener('click', function (e) { if (e.target === box) close(); });
  document.addEventListener('keydown', function (e) {
    if (!box.classList.contains('open')) return;
    if (e.key === 'Escape') close(); else if (e.key === 'ArrowLeft') show(cur - 1); else if (e.key === 'ArrowRight') show(cur + 1);
  });
  var sx = null;
  box.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
  box.addEventListener('touchend', function (e) { if (sx == null) return; var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 40) show(cur + (dx < 0 ? 1 : -1)); sx = null; });
})();

// Shared-moment story carousels
(function () {
  document.querySelectorAll('.story').forEach(function (s) {
    var tr = s.querySelector('.story-track'), n = tr.children.length, cnt = s.querySelector('.story-count'), dots = s.querySelectorAll('.story-dots i');
    function upd() { var i = Math.round(tr.scrollLeft / tr.clientWidth); cnt.textContent = (i + 1) + ' / ' + n; dots.forEach(function (d, j) { d.classList.toggle('on', j === i); }); tr.querySelectorAll('video').forEach(function (v) { v.pause(); }); }
    tr.addEventListener('scroll', function () { clearTimeout(tr._t); tr._t = setTimeout(upd, 80); });
    tr.addEventListener('click', function (e) { if (e.target.tagName === 'VIDEO') return; var i = Math.round(tr.scrollLeft / tr.clientWidth); tr.scrollTo({ left: ((i + 1) % n) * tr.clientWidth, behavior: 'smooth' }); });
    upd();
  });
})();

// Share your moments form -> Google Drive (via the same Apps Script)
(function () {
  var f = document.getElementById('shareForm');
  if (!f) return;
  var input = document.getElementById('sfFiles'), prev = document.getElementById('sfPrev'), err = document.getElementById('sfErr'), send = document.getElementById('sfSend');
  var MAXV = 25 * 1024 * 1024;
  function pick() {
    var all = [].slice.call(input.files), imgs = all.filter(function (x) { return /^image\//.test(x.type) || /\.(heic|heif)$/i.test(x.name); }).slice(0, 8);
    var vid = all.filter(function (x) { return /^video\//.test(x.type); })[0] || null;
    return { imgs: imgs, vid: vid, extra: all.length - imgs.length - (vid ? 1 : 0) };
  }
  function shrink(file) {
    return new Promise(function (res, rej) {
      var img = new Image(), url = URL.createObjectURL(file);
      img.onload = function () {
        var s = Math.min(1, 2000 / Math.max(img.width, img.height)), c = document.createElement('canvas');
        c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
        res(c.toDataURL('image/jpeg', 0.85).split(',')[1]);
      };
      img.onerror = function () { rej(new Error('bad image')); };
      img.src = url;
    });
  }
  function readB64(file) {
    return new Promise(function (res, rej) { var r = new FileReader(); r.onload = function () { res(String(r.result).split(',')[1]); }; r.onerror = rej; r.readAsDataURL(file); });
  }
  function msg(t) { err.hidden = false; err.innerHTML = t; }
  input.addEventListener('change', function () {
    prev.innerHTML = ''; err.hidden = true;
    var p = pick();
    p.imgs.forEach(function (file) { var i = new Image(); i.src = URL.createObjectURL(file); prev.appendChild(i); });
    if (p.vid) { var v = WT.el('span', 'sf-vid', '▶ ' + p.vid.name); prev.appendChild(v); }
    if (p.vid && p.vid.size > MAXV) msg('That video is over 25 MB. Please send a shorter clip, or message it to us on Instagram or Facebook.');
    else if (p.extra > 0) msg('Only 8 photos and 1 video will be sent.');
  });
  f.addEventListener('submit', function (e) {
    e.preventDefault(); err.hidden = true;
    var fd = new FormData(f), p = pick();
    if (!String(fd.get('name') || '').trim()) return msg('Please add your name.');
    if (!p.imgs.length && !p.vid) return msg('Please choose at least one photo or video.');
    if (p.vid && p.vid.size > MAXV) return msg('That video is over 25 MB. Please send a shorter clip, or message it to us on Instagram or Facebook.');
    if (!fd.get('consent')) return msg('Please tick the box to let us repost your photos and videos.');
    if (!window.WT_SHEETS_URL) return msg('Sharing isn’t set up yet. Please message us instead.');
    send.disabled = true; send.textContent = 'Sending… please keep this page open';
    Promise.all([Promise.all(p.imgs.map(shrink)), p.vid ? readB64(p.vid) : Promise.resolve(null)]).then(function (r) {
      var body = new URLSearchParams();
      body.set('type', 'moment'); body.set('name', fd.get('name')); body.set('social', fd.get('social') || '');
      body.set('note', fd.get('note') || ''); body.set('consent', 'yes');
      body.set('consent_at', new Date().toLocaleString('en-PH', { timeZone: 'Asia/Manila' }));
      r[0].forEach(function (d, i) { body.set('photo' + i, d); });
      body.set('count', String(r[0].length));
      if (r[1]) { body.set('video', r[1]); body.set('video_type', p.vid.type || 'video/mp4'); body.set('video_name', p.vid.name); }
      return fetch(window.WT_SHEETS_URL, { method: 'POST', mode: 'no-cors', body: body });
    }).then(function () {
      f.hidden = true; document.getElementById('sfDone').hidden = false;
    }).catch(function () {
      send.disabled = false; send.textContent = 'Share my moment';
      msg('Sorry, that didn’t go through. Please try again, or send them to us on <a href="https://ig.me/m/thewhimsytouch" target="_blank" rel="noopener">Instagram</a>.');
    });
  });
})();

// Client-shared moments (approved in the sheet) shown on the Moments page
(function () {
  var box = document.getElementById('clientMoments');
  if (!box || !window.WT_SHEETS_URL) return;
  function esc(t) { return String(t || '').replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  fetch(window.WT_SHEETS_URL + '?moments=1').then(function (r) { return r.json(); }).then(function (list) {
    if (!list || !list.length) return;
    var html = '';
    list.forEach(function (m) {
      var media = m.photos.map(function (u) { return '<img src="' + esc(u) + '" alt="Shared by ' + esc(m.name) + '" loading="lazy" referrerpolicy="no-referrer">'; })
        .concat(m.videos.map(function (u) { return '<iframe src="' + esc(u) + '" allow="autoplay" loading="lazy" title="Video shared by ' + esc(m.name) + '"></iframe>'; }));
      var n = media.length, dots = new Array(n + 1).join('<i></i>');
      html += '<article class="story cm"><div class="story-media"><div class="story-track">' + media.join('') + '</div>' +
        (n > 1 ? '<span class="story-count">1 / ' + n + '</span><div class="story-dots">' + dots + '</div>' : '') + '</div>' +
        '<div class="story-body">' + (m.note ? '<p class="cm-quote">“' + esc(m.note) + '”</p>' : '') +
        '<p class="cm-by">— ' + esc(m.name) + (m.social ? ' <span>' + esc(m.social) + '</span>' : '') + '</p></div></article>';
    });
    document.getElementById('cmList').innerHTML = html;
    box.hidden = false;
    box.querySelectorAll('.story').forEach(function (s) {
      var tr = s.querySelector('.story-track'), n = tr.children.length, cnt = s.querySelector('.story-count'), dots = s.querySelectorAll('.story-dots i');
      function upd() { var i = Math.round(tr.scrollLeft / tr.clientWidth); if (cnt) cnt.textContent = (i + 1) + ' / ' + n; dots.forEach(function (d, j) { d.classList.toggle('on', j === i); }); }
      tr.addEventListener('scroll', function () { clearTimeout(tr._t); tr._t = setTimeout(upd, 80); });
      upd();
    });
  }).catch(function () {});
})();

// Moments: tap a polaroid to see it bigger
(function () {
  var ms = [].slice.call(document.querySelectorAll('.moment img'));
  if (!ms.length) return;
  var box = document.createElement('div');
  box.className = 'pl-box'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-label', 'Photo');
  box.innerHTML = '<figure><img alt=""></figure><button type="button" class="x" aria-label="Close">×</button><button type="button" class="p" aria-label="Previous">‹</button><button type="button" class="n" aria-label="Next">›</button>';
  document.body.appendChild(box);
  var bi = box.querySelector('img'), cur = 0, sx = null;
  function show(i) { cur = (i + ms.length) % ms.length; bi.src = ms[cur].src; bi.alt = ms[cur].alt; }
  function close() { box.classList.remove('open'); document.documentElement.style.overflow = ''; }
  ms.forEach(function (im, i) { im.parentNode.style.cursor = 'zoom-in'; im.parentNode.addEventListener('click', function () { show(i); box.classList.add('open'); document.documentElement.style.overflow = 'hidden'; }); });
  box.querySelector('.x').onclick = close;
  box.querySelector('.p').onclick = function (e) { e.stopPropagation(); show(cur - 1); };
  box.querySelector('.n').onclick = function (e) { e.stopPropagation(); show(cur + 1); };
  box.addEventListener('click', function (e) { if (e.target === box) close(); });
  document.addEventListener('keydown', function (e) { if (!box.classList.contains('open')) return; if (e.key === 'Escape') close(); else if (e.key === 'ArrowLeft') show(cur - 1); else if (e.key === 'ArrowRight') show(cur + 1); });
  box.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
  box.addEventListener('touchend', function (e) { if (sx == null) return; var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 40) show(cur + (dx < 0 ? 1 : -1)); sx = null; });
})();

// Moments videos: swipe dots on phones
(function () {
  var row = document.querySelector('.moment-videos');
  if (!row) return;
  var n = row.children.length, dots = document.createElement('div');
  dots.className = 'mv-dots'; dots.innerHTML = new Array(n + 1).join('<i></i>');
  row.parentNode.insertBefore(dots, row.nextSibling);
  var ds = dots.querySelectorAll('i');
  function upd() { var w = row.children[0].getBoundingClientRect().width + 16, i = Math.min(n - 1, Math.round(row.scrollLeft / w)); ds.forEach(function (d, j) { d.classList.toggle('on', j === i); }); }
  row.addEventListener('scroll', function () { clearTimeout(row._t); row._t = setTimeout(function () { upd(); row.querySelectorAll('video').forEach(function (v) { var r = v.getBoundingClientRect(); if (r.left < 0 || r.right > innerWidth) v.pause(); }); }, 80); });
  upd();
})();
