/* Mrs. Potato, prévia de site */
(function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile = () => innerWidth <= 820;
  const pt = document.body.dataset.lang === 'pt';
  const page = document.body.dataset.page;
  const hasG = typeof gsap !== 'undefined';
  const money = v => pt ? '$' + v.toFixed(2).replace('.', ',') : '$' + v.toFixed(2);
  const I = (window.MP && MP.i18n) || {
    open: pt ? 'Aberto agora' : 'Open now', closed: pt ? 'Fechado agora' : 'Closed now', until: pt ? 'até' : 'until', opens: pt ? 'Abre' : 'Opens', today: pt ? 'hoje às' : 'today at', tomorrow: pt ? 'amanhã às' : 'tomorrow at',
  };

  /* Rolagem suave */
  let lenis = null;
  if (hasG) gsap.registerPlugin(ScrollTrigger);
  if (!reduce && typeof Lenis !== 'undefined' && hasG) {
    lenis = new Lenis({ lerp: 0.12 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  /* Menu móvel */
  const burger = $('.burger'), drawer = $('#drawer');
  if (burger) burger.addEventListener('click', () => {
    const open = burger.getAttribute('aria-expanded') === 'true';
    burger.setAttribute('aria-expanded', String(!open));
    drawer.hidden = open;
    document.documentElement.style.overflow = open ? '' : 'hidden';
  });

  /* Logo rolando conforme a página */
  const roller = $('.roller');
  if (roller && hasG && !reduce) {
    const img = roller.firstElementChild;
    const upd = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      const p = max > 0 ? scrollY / max : 0;
      const range = innerHeight * 0.76;
      gsap.set(roller, { y: (p - 0.5) * range });
      gsap.set(img, { rotation: scrollY * 0.22 });
    };
    addEventListener('scroll', upd, { passive: true }); upd();
  } else if (roller) roller.hidden = true;

  /* Horário ao vivo, sempre em Orlando */
  const nyParts = () => {
    const p = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', weekday: 'short', hour: 'numeric', hour12: false, minute: 'numeric', second: 'numeric', month: 'numeric', day: 'numeric' }).formatToParts(new Date()).forEach(x => { p[x.type] = x.value; });
    return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(p.weekday), h: +p.hour % 24, m: +p.minute, s: +p.second, mo: +p.month, day: +p.day };
  };
  const hoursFor = (d, mo, day) => {
    if (mo === 12 && day === 31) return [11, 16];
    if (mo === 1 && day === 1) return [16, 22];
    if (d === 0) return [11, 21];
    return d >= 5 ? [11, 23] : [11, 22];
  };
  const fmtH = h => pt ? h + 'h' : (h > 12 ? h - 12 : h) + (h >= 12 ? ' pm' : ' am');
  function live() {
    const n = nyParts(); const [o, c] = hoursFor(n.d, n.mo, n.day); const now = n.h + n.m / 60;
    let txt, open = false;
    if (now >= o && now < c) { open = true; txt = `${I.open}, ${I.until} ${fmtH(c)}`; }
    else if (now < o) txt = `${I.closed}. ${I.opens} ${I.today} ${fmtH(o)}`;
    else { const nx = hoursFor((n.d + 1) % 7, n.mo, n.day + 1); txt = `${I.closed}. ${I.opens} ${I.tomorrow} ${fmtH(nx[0])}`; }
    $$('[data-live]').forEach(e => { e.textContent = txt; e.classList.toggle('is-open', open); });
    $$('.hours tr').forEach(r => r.classList.toggle('today', +r.dataset.day === n.d));
  }
  live(); setInterval(live, 30000);

  /* Home ----------------------------------------------------------- */
  if (page === 'index') {
    /* Rosti rola para fora do hero; títulos ficam */
    if (hasG && !reduce) {
      const tl = gsap.timeline({ scrollTrigger: { trigger: '.hero', start: 'top top', end: '+=110%', pin: true, scrub: 0.6 } });
      tl.to('.hero-disc', { x: () => innerWidth * 0.82, rotation: 0, ease: 'none', duration: 1 }, 0)
        .to('.rosti', { rotation: 420, ease: 'none', duration: 1 }, 0)
        .to('.hero-m', { x: () => innerWidth * 0.34, ease: 'none', duration: 1 }, 0)
        .to('.hero-f', { y: 60, opacity: 0, ease: 'none', duration: 0.5 }, 0.1)
        .to('.hero h1 span:nth-child(1)', { x: -40, ease: 'none', duration: 1 }, 0)
        .to('.hero h1 span:nth-child(3)', { x: 40, ease: 'none', duration: 1 }, 0);
      gsap.to('.hero-m', { rotation: -4, y: -6, duration: 1.1, yoyo: true, repeat: -1, ease: 'sine.inOut', paused: false });
    }

    /* Microscópio */
    const lis = $$('.scope-l li'), lens = $('.lens'), lx = $('#lensx');
    const a = $('.lens-a'), b = $('.lens-b');
    // cada parada: imagem, zoom, deslocamento (fração do diâmetro)
    const stops = [
      { im: a, s: 1, x: 0, y: 0, label: '×1' },
      { im: a, s: 2.1, x: 0.34, y: 0.1, label: '×2' },
      { im: a, s: 1.9, x: -0.08, y: -0.04, label: '×2' },
      { im: b, s: 1.8, x: -0.42, y: 0.34, label: '×2' },
    ];
    const setStop = i => { lis.forEach((l, k) => l.classList.toggle('on', k === i)); if (lx) lx.textContent = stops[i].label; };
    if (hasG && lens && !reduce) {
      const D = () => lens.clientWidth;
      gsap.set(a, { xPercent: -50, yPercent: -50, x: 0, y: 0 });
      gsap.set(b, { xPercent: -50, yPercent: -50, x: 0, y: 0, opacity: 0 });
      const tl = gsap.timeline({ scrollTrigger: { trigger: '.scope', start: 'top top', end: '+=240%', pin: true, scrub: 0.7, onUpdate: s => setStop(Math.min(3, Math.floor(s.progress * 4))) } });
      tl.to(a, { scale: 2.1, x: () => 0.34 * D(), y: () => 0.1 * D(), duration: 1, ease: 'power1.inOut' })
        .to(a, { scale: 1.9, x: () => -0.08 * D(), y: () => -0.04 * D(), duration: 1, ease: 'power1.inOut' })
        .to(a, { opacity: 0, duration: 0.3 }, '+=0.2')
        .to(b, { opacity: 1, duration: 0.3 }, '<')
        .fromTo(b, { scale: 1.2, x: 0, y: 0 }, { scale: 1.8, x: () => -0.42 * D(), y: () => 0.34 * D(), duration: 0.9, ease: 'power1.out' }, '<');
    }

    /* Laboratório */
    const F = MP.fillings, state = { fmt: 'rosti', id: F[0].id };
    const chipsBox = $('#chips'), top = $('#ptop'), say = $('#psay'), rosti = $('.p-rosti'), baked = $('.p-baked'), masc = $('.p-mascot');
    const from = new URLSearchParams(location.search);
    if (from.get('fill') && F.some(f => f.id === from.get('fill'))) state.id = from.get('fill');
    if (['rosti', 'baked', 'small'].includes(from.get('format'))) state.fmt = from.get('format');
    const spots = [[28, 30], [52, 24], [66, 44], [38, 52], [22, 56], [56, 64], [40, 72], [70, 28], [30, 42], [48, 44], [62, 60], [34, 26]];
    function drop(animated) {
      const f = F.find(x => x.id === state.id); const isB = state.fmt === 'baked';
      rosti.hidden = isB; baked.hidden = !isB;
      chipsBox.textContent = '';
      if (hasG) gsap.killTweensOf([top, say]);
      top.style.opacity = 0;
      const made = [];
      const n = 12;
      for (let k = 0; k < n; k++) {
        const c = f.chips[k % f.chips.length];
        const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        s.setAttribute('viewBox', '0 0 80 60');
        const u = document.createElementNS('http://www.w3.org/2000/svg', 'use');
        u.setAttribute('href', '#c-' + c); s.appendChild(u);
        const [x, y] = spots[k];
        s.style.left = x + '%'; s.style.top = y + '%';
        chipsBox.appendChild(s); made.push(s);
      }
      const text = isB ? I.loaded : I.sealed;
      if (hasG && animated && !reduce) {
        gsap.fromTo(made, { y: () => -420 - Math.random() * 180, rotation: () => Math.random() * 300 - 150, opacity: 1 },
          { y: 0, rotation: () => Math.random() * 50 - 25, duration: 0.7, ease: 'bounce.out', stagger: 0.035 });
        gsap.fromTo(masc, { y: 0 }, { y: -18, duration: 0.18, yoyo: true, repeat: 3, ease: 'power1.out' });
        gsap.set(say, { opacity: 0 });
        if (!isB) {
          gsap.fromTo(top, { opacity: 0, scale: 1.55, y: -160, rotation: -60 }, { opacity: 1, scale: 1, y: 0, rotation: 0, duration: 0.5, delay: 1, ease: 'back.in(1.1)', onComplete() { gsap.to('.petri', { scale: 0.975, duration: 0.07, yoyo: true, repeat: 1 }); } });
        }
        gsap.to(say, { opacity: 1, delay: isB ? 1 : 1.5, duration: 0.2, onStart() { say.textContent = text; } });
      } else {
        if (!isB) top.style.opacity = 1;
        say.textContent = text; say.style.opacity = 1;
      }
    }
    function report() {
      const f = F.find(x => x.id === state.id), p = f[state.fmt];
      const fmtName = I[state.fmt];
      $('#rname').textContent = `${f.name}`;
      $('#ring').textContent = `${fmtName}. ${f.ing}.`;
      const g = $('#rguy'); const isGuy = f.guy && state.fmt !== 'small' && !(f.id === 'catupiry' && state.fmt === 'rosti');
      g.hidden = !isGuy; g.textContent = I.guy;
      $('#rprice').innerHTML = p == null ? `<small>${I.na}. ${I.pickOther}</small>` : money(p);
      $('#rorder').classList.toggle('dis', p == null);
      $$('.fills button').forEach(b => {
        const on = b.dataset.fill === state.id, x = F.find(z => z.id === b.dataset.fill);
        b.setAttribute('aria-checked', on); b.classList.toggle('off', x[state.fmt] == null);
      });
      $$('.seg button').forEach(b => b.setAttribute('aria-checked', b.dataset.fmt === state.fmt));
    }
    $$('.fills button').forEach(b => b.addEventListener('click', () => { state.id = b.dataset.fill; report(); drop(true); }));
    $$('.seg button').forEach(b => b.addEventListener('click', () => { state.fmt = b.dataset.fmt; report(); drop(true); }));
    report(); drop(false);
    let labDone = false;
    if (hasG) ScrollTrigger.create({ trigger: '#lab', start: 'top 55%', once: true, onEnter() { if (!labDone) { labDone = true; drop(true); } } });

    /* Queijo */
    const letters = $$('.pull-w span');
    if (hasG && letters.length && !reduce) {
      const tl = gsap.timeline({ scrollTrigger: { trigger: '.pull', start: 'top top', end: '+=170%', pin: true, scrub: 0.5 } });
      letters.forEach(l => tl.fromTo(l, { scaleY: 1 }, { scaleY: () => parseFloat(getComputedStyle(l).getPropertyValue('--s')) * (mobile() ? 1 : 0.86), ease: 'sine.in', duration: 1 }, 0));
      tl.fromTo('.pull-p', { yPercent: 62 }, { yPercent: 0, ease: 'none', duration: 1 }, 0);
    }

    /* Calendário da feijoada */
    const clock = $('#clock');
    function fei() {
      if (!clock) return;
      const n = nyParts();
      if (n.d === 6 || n.d === 0) { clock.innerHTML = `<p class="on">${I.feiOn}</p>`; return; }
      const days = 6 - n.d; const openAt = 11;
      const totalMin = days * 1440 + openAt * 60 - (n.h * 60 + n.m);
      const d = Math.floor(totalMin / 1440), h = Math.floor(totalMin % 1440 / 60), m = totalMin % 60;
      clock.innerHTML = `<p>${I.feiOff}</p><div><b>${d}</b><span>${I.d}</span></div><div><b>${h}</b><span>${I.h}</span></div><div><b>${m}</b><span>${I.m}</span></div>`;
    }
    fei(); setInterval(fei, 30000);

    /* Termômetro: temperatura real de Orlando */
    const temp = $('#ttemp'), tsay = $('#tsay'), thm = $('#thm');
    tsay.textContent = I.noTemp;
    fetch('https://api.open-meteo.com/v1/forecast?latitude=28.486&longitude=-81.459&current=temperature_2m&temperature_unit=fahrenheit')
      .then(r => r.json()).then(j => {
        const f = Math.round(j.current.temperature_2m);
        temp.textContent = pt ? `${f}°F (${Math.round((f - 32) * 5 / 9)}°C)` : `${f}°F`;
        tsay.textContent = f < 70 ? I.cold : I.warm;
        thm.style.height = Math.max(8, Math.min(96, (f - 30) / 70 * 100)) + '%';
      }).catch(() => { temp.parentElement.hidden = true; });

    /* s de Mrs. */
    if (hasG && !reduce) gsap.fromTo('.mrs-big span', { scale: 0, rotation: -50 }, { scale: 1, rotation: 0, ease: 'back.out(3)', duration: 0.6, scrollTrigger: { trigger: '.mrs', start: 'top 62%' } });

    /* Prova final */
    const ans = {}, sets = $$('.exq'), dip = $('#dip');
    sets.forEach((s, i) => $$('button', s).forEach(b => b.addEventListener('click', () => {
      ans[s.dataset.k] = b.dataset.v;
      s.hidden = true;
      if (sets[i + 1]) sets[i + 1].hidden = false;
      else {
        const [nm, pr] = MP.exam[ans.tex][ans.fla];
        $('#dipr').textContent = nm;
        const extra = ans.hun === 'share' ? I.sharePlus : (ans.hun === 'light' && ans.tex === 'rosti' ? I.lightPlus : '');
        $('#dipx').textContent = `${money(pr)}${extra ? '. ' + extra : ''}`;
        dip.hidden = false;
        if (hasG && !reduce) gsap.fromTo('.dip-stamp', { scale: 3, opacity: 0, rotation: 30 }, { scale: 1, opacity: 1, rotation: 11, duration: 0.35, delay: 0.2, ease: 'power3.in' });
      }
    })));
    $('#dipa').addEventListener('click', () => { dip.hidden = true; sets.forEach((s, i) => { s.hidden = i > 0; }); });

    /* Revelações leves */
    if (hasG && !reduce) $$('.cat-h,.fei-t,.soup-t,.mrs-t,.say blockquote,.last h2').forEach(e => gsap.from(e, { y: 40, opacity: 0, duration: 0.7, ease: 'power3.out', scrollTrigger: { trigger: e, start: 'top 86%' } }));
    if (location.hash && lenis) setTimeout(() => { ScrollTrigger.refresh(); const t = $(location.hash); if (t) lenis.scrollTo(t, { immediate: true, force: true }); }, 200);
  }

  /* Cardápio ------------------------------------------------------- */
  if (page === 'menu') {
    const dishes = $$('.dish'), depts = $$('.dept'), q = $('#q'), chips = $$('.filters .chip'), countEl = $('#mcount'), none = $('#mnone'), electives = $$('.elective');
    let f = 'all';
    const countT = n => pt ? `${n} ${n === 1 ? 'prato' : 'pratos'}` : `${n} ${n === 1 ? 'dish' : 'dishes'}`;
    const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    function apply() {
      const term = norm(q.value.trim()); let n = 0;
      dishes.forEach(d => {
        const ok = (f === 'all' || d.dataset.tags.split(' ').includes(f)) && (!term || norm(d.dataset.q).includes(term));
        d.hidden = !ok; if (ok) n++;
      });
      depts.forEach(s => { s.hidden = !$$('.dish', s).some(d => !d.hidden); });
      countEl.textContent = (term || f !== 'all') ? countT(n) : '';
      none.hidden = n > 0;
      electives.forEach(e => {
        const lis = $$('li', e); let hit = 0;
        lis.forEach(l => { const ok = !term || norm(l.dataset.q).includes(term); l.hidden = !ok; if (ok) hit++; });
        e.hidden = (f !== 'all') || !hit; e.open = !!term && hit > 0;
      });
      $('#electives').hidden = electives.every(e => e.hidden);
      if (hasG) ScrollTrigger.refresh();
    }
    q.addEventListener('input', apply);
    chips.forEach(c => c.addEventListener('click', () => {
      f = c.dataset.filter; chips.forEach(x => { const on = x === c; x.classList.toggle('on', on); x.setAttribute('aria-pressed', on); }); apply();
      const bar = $('#mbar'); if (bar.getBoundingClientRect().top < 76) { const y = $('.m-list').getBoundingClientRect().top + scrollY - bar.offsetHeight - 84; lenis ? lenis.scrollTo(y, { immediate: true }) : scrollTo(0, y); }
    }));
    const barEl = $('#mbar'); const st = () => barEl.classList.toggle('stuck', barEl.getBoundingClientRect().top < 76); addEventListener('scroll', st, { passive: true }); st();
    /* Nav dos departamentos */
    const navs = $$('.dept-nav a');
    const go = (e, a) => { const t = $(a.getAttribute('href')); if (!t || t.hidden) return; e.preventDefault(); const y = t.getBoundingClientRect().top + scrollY - $('#mbar').offsetHeight - 72; lenis ? lenis.scrollTo(y, { duration: 0.9 }) : scrollTo({ top: y }); history.replaceState(null, '', a.getAttribute('href')); };
    navs.forEach(a => a.addEventListener('click', e => go(e, a)));
    const obs = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      navs.forEach(a => { const on = a.getAttribute('href') === '#' + e.target.id; a.classList.toggle('on', on); if (on) { const p = a.parentElement; p.scrollLeft = a.offsetLeft - p.clientWidth / 2 + a.clientWidth / 2; } });
    }), { rootMargin: '-40% 0px -55% 0px' });
    depts.forEach(d => obs.observe(d));
    obs.observe($('#electives'));
    if (location.hash) { const t = $(location.hash); if (t) setTimeout(() => { const y = t.getBoundingClientRect().top + scrollY - $('#mbar').offsetHeight - 72; lenis ? lenis.scrollTo(y, { immediate: true, force: true }) : scrollTo(0, y); }, 120); }
    /* Ficha do prato */
    const sheet = $('#sheet');
    const base = document.body.dataset.base;
    dishes.forEach(d => $('.dish-b', d).addEventListener('click', () => {
      $('#sheet-i').src = `${base}img/${d.dataset.img}.webp`;
      $('#sheet-i').alt = d.dataset.name;
      $('#sheet-n').textContent = d.dataset.name;
      $('#sheet-d').textContent = d.dataset.desc;
      $('#sheet-d').hidden = !d.dataset.desc;
      $('#sheet-p').textContent = pt ? d.dataset.price.replace('.', ',') : d.dataset.price;
      $('#sheet-dept').textContent = d.dataset.dept;
      const lab = $('#sheet-lab');
      lab.hidden = !d.dataset.lab;
      if (d.dataset.lab) lab.href = `index.html?fill=${d.dataset.lab}&format=${d.dataset.format}#lab`;
      sheet.showModal(); if (lenis) lenis.stop();
    }));
    $('.sheet-x').addEventListener('click', () => sheet.close());
    sheet.addEventListener('click', e => { if (e.target === sheet) sheet.close(); });
    sheet.addEventListener('close', () => { if (lenis) lenis.start(); });
    if (pt) $$('.dish-p').forEach(p => { if (!p.querySelector('small')) p.textContent = p.textContent.replace('.', ','); });
    if (pt) $$('.elective li b').forEach(p => { if (!p.querySelector('small')) p.textContent = p.textContent.replace('.', ','); });
    if (hasG && !reduce) gsap.to('.m-hero-rosti', { rotation: 90, ease: 'none', scrollTrigger: { trigger: '.m-hero', start: 'top top', end: 'bottom top', scrub: 0.5 } });
  }

  /* História ------------------------------------------------------- */
  if (page === 'story') {
    if (hasG && !reduce) {
      gsap.from('.mr-s', { scale: 0, rotation: -60, duration: 0.7, delay: 0.5, ease: 'back.out(3)' });
      const path = $('#routePath'), r = $('.route-rosti');
      const L = path.getTotalLength();
      const move = p => { const pt2 = path.getPointAtLength(L * p); r.setAttribute('transform', `translate(${pt2.x} ${pt2.y}) rotate(${p * 720})`); };
      move(0);
      ScrollTrigger.create({ trigger: '#route', start: 'top 70%', end: 'bottom 60%', scrub: 0.5, onUpdate: s => move(s.progress) });
      gsap.from('.yr', { y: 30, opacity: 0, stagger: 0.1, duration: 0.6, scrollTrigger: { trigger: '.years', start: 'top 85%' } });
    } else {
      const path = $('#routePath'); const r = $('.route-rosti'); const p = path.getPointAtLength(path.getTotalLength());
      r.setAttribute('transform', `translate(${p.x} ${p.y})`);
    }
    /* Mural arrastável */
    if (!mobile()) $$('.frame').forEach(fr => {
      let sx = 0, sy = 0, ox = 0, oy = 0, on = false;
      fr.addEventListener('pointerdown', e => { if (e.target.closest('a')) return; on = true; sx = e.clientX; sy = e.clientY; fr.classList.add('grab'); fr.setPointerCapture(e.pointerId); });
      fr.addEventListener('pointermove', e => { if (!on) return; const x = ox + e.clientX - sx, y = oy + e.clientY - sy; fr.style.transform = `translate(${x}px,${y}px) rotate(calc(var(--r) * .3))`; fr.dataset.x = x; fr.dataset.y = y; });
      const up = () => { if (!on) return; on = false; fr.classList.remove('grab'); ox = +fr.dataset.x || 0; oy = +fr.dataset.y || 0; };
      fr.addEventListener('pointerup', up); fr.addEventListener('pointercancel', up);
    });
  }

  /* Galeria -------------------------------------------------------- */
  if (page === 'gallery') {
    const items = $$('.g-item'), chips = $$('[data-gal]'), lb = $('#lb'), img = $('#lb-i'), cap = $('#lb-c');
    const base = document.body.dataset.base;
    let list = items, idx = 0;
    chips.forEach(c => c.addEventListener('click', () => {
      const k = c.dataset.gal; chips.forEach(x => { const on = x === c; x.classList.toggle('on', on); x.setAttribute('aria-pressed', on); });
      items.forEach(i => { i.hidden = k !== 'all' && i.dataset.cat !== k; });
      list = items.filter(i => !i.hidden); if (hasG) ScrollTrigger.refresh();
    }));
    const show = i => { idx = (i + list.length) % list.length; const it = list[idx]; img.src = base + it.dataset.full; img.alt = it.dataset.cap; cap.textContent = it.dataset.cap; };
    items.forEach(it => it.addEventListener('click', () => { show(list.indexOf(it)); lb.showModal(); if (lenis) lenis.stop(); }));
    $('.lb-x').addEventListener('click', () => lb.close());
    $('.lb-p').addEventListener('click', () => show(idx - 1));
    $('.lb-n').addEventListener('click', () => show(idx + 1));
    lb.addEventListener('close', () => { if (lenis) lenis.start(); });
    lb.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') show(idx - 1); if (e.key === 'ArrowRight') show(idx + 1); });
    lb.addEventListener('click', e => { if (e.target === lb) lb.close(); });
  }

  /* Visita --------------------------------------------------------- */
  if (page === 'visit') {
    const form = $('#resform'), date = form.elements.date;
    const n = new Date(); const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    date.min = iso(n); date.value = iso(n);
    form.addEventListener('submit', e => {
      e.preventDefault();
      const u = new URL('https://www.opentable.com/restref/client/');
      u.searchParams.set('restref', '1241665'); u.searchParams.set('lang', pt ? 'pt-BR' : 'en-US');
      u.searchParams.set('covers', form.elements.covers.value);
      u.searchParams.set('datetime', `${date.value}T${form.elements.time.value}`);
      u.searchParams.set('ot_source', 'Restaurant website');
      window.open(u.href, '_blank', 'noopener');
    });
    const ask = $('#askform');
    ask.addEventListener('submit', e => {
      e.preventDefault();
      const via = e.submitter ? e.submitter.value : 'wa';
      const text = `${ask.elements.name.value}: ${ask.elements.msg.value}`;
      const url = via === 'mail' ? `mailto:mrspotatofl@gmail.com?subject=${encodeURIComponent(pt ? 'Pergunta pelo site' : 'Question from the website')}&body=${encodeURIComponent(text)}` : `https://wa.me/14072900991?text=${encodeURIComponent(text)}`;
      if (via === 'mail') location.href = url; else window.open(url, '_blank', 'noopener');
    });
    if (hasG && !reduce) gsap.to('.v-mascot', { rotation: 3, y: -8, transformOrigin: '50% 100%', duration: 1, yoyo: true, repeat: -1, ease: 'sine.inOut' });
  }

  /* Recalcula pins depois das imagens */
  if (hasG) addEventListener('load', () => ScrollTrigger.refresh());
})();
