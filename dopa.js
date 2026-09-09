/*!
 * DOPAStrap v0.1 — dopamine-driven UI feedback, zero dependencies.
 * Auto-initializes: just include this file + dopa.css and add .dopa to
 * any clickable element. See dopa.css header / demo.html for the full API.
 */
(function () {
  'use strict';

  var SIZES = {
    sm:  { particles: 8,  flash: 0,   shake: 0,  scale: 1.12, text: '+1' },
    md:  { particles: 16, flash: .35, shake: 3,  scale: 1.2,  text: 'GET!' },
    lg:  { particles: 28, flash: .55, shake: 6,  scale: 1.3,  text: 'NICE!' },
    max: { particles: 46, flash: .85, shake: 10, scale: 1.45, text: 'LEGENDARY GET!!' }
  };

  var RARITY = {
    common:    ['#9aa0a6', '#d8dbdf'],
    rare:      ['#4dabf7', '#a5d8ff'],
    epic:      ['#b967ff', '#e0aaff'],
    legendary: ['#ffb703', '#ffe066']
  };

  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function pick(el, table, fallback) {
    for (var key in table) {
      if (table.hasOwnProperty(key) && el.classList.contains('dopa-' + key)) return key;
    }
    return fallback;
  }

  function spawnParticles(x, y, n, colors, spread) {
    for (var i = 0; i < n; i++) {
      var p = document.createElement('span');
      p.className = 'dopa-particle';
      var angle = Math.random() * Math.PI * 2;
      var dist = spread * (0.5 + Math.random() * 0.8);
      var size = 4 + Math.random() * 6;
      p.style.setProperty('--dopa-p-x', Math.cos(angle) * dist + 'px');
      p.style.setProperty('--dopa-p-y', Math.sin(angle) * dist - dist * 0.3 + 'px');
      p.style.setProperty('--dopa-p-r', (Math.random() * 360) + 'deg');
      p.style.setProperty('--dopa-p-dur', (500 + Math.random() * 400) + 'ms');
      p.style.width = size + 'px';
      p.style.height = size + 'px';
      p.style.left = x + 'px';
      p.style.top = y + 'px';
      p.style.background = colors[Math.random() < 0.5 ? 0 : 1];
      document.body.appendChild(p);
      p.addEventListener('animationend', function () { this.remove(); });
    }
  }

  function screenFlash(x, y, strength, color) {
    if (!strength) return;
    var f = document.createElement('div');
    f.className = 'dopa-flash';
    f.style.setProperty('--dopa-fx-x', x + 'px');
    f.style.setProperty('--dopa-fx-y', y + 'px');
    f.style.setProperty('--dopa-fx-strength', strength);
    f.style.setProperty('--dopa-fx-color', color);
    document.body.appendChild(f);
    f.addEventListener('animationend', function () { this.remove(); });
  }

  function screenShake(amount) {
    if (!amount) return;
    var target = document.body;
    target.style.setProperty('--dopa-shake-amt', amount + 'px');
    target.classList.remove('dopa-shake');
    void target.offsetWidth;
    target.classList.add('dopa-shake');
    target.addEventListener('animationend', function handler() {
      target.classList.remove('dopa-shake');
      target.removeEventListener('animationend', handler);
    });
  }

  function popupText(el, text, color) {
    if (!text) return;
    var rect = el.getBoundingClientRect();
    var t = document.createElement('div');
    t.className = 'dopa-popup';
    t.textContent = text;
    t.style.left = (rect.left + rect.width / 2) + 'px';
    t.style.top = rect.top + 'px';
    t.style.color = color;
    t.style.fontSize = Math.max(14, Math.min(32, rect.width / 4)) + 'px';
    document.body.appendChild(t);
    t.addEventListener('animationend', function () { this.remove(); });
  }

  function trigger(el) {
    var sizeKey = pick(el, SIZES, 'md');
    var rarityKey = pick(el, RARITY, 'legendary');
    var cfg = SIZES[sizeKey];
    var colors = RARITY[rarityKey];
    var rect = el.getBoundingClientRect();
    var cx = rect.left + rect.width / 2;
    var cy = rect.top + rect.height / 2;
    var text = el.dataset.dopaText || cfg.text;

    el.classList.remove('is-dopa-active');
    void el.offsetWidth;
    el.classList.add('is-dopa-active');

    if (!reduceMotion) {
      spawnParticles(cx, cy, cfg.particles, colors, 60 + cfg.scale * 40);
      screenFlash(cx, cy, cfg.flash, colors[0]);
      screenShake(cfg.shake);
    }
    popupText(el, text, colors[0]);

    el.dispatchEvent(new CustomEvent('dopa:trigger', {
      bubbles: true,
      detail: { size: sizeKey, rarity: rarityKey }
    }));
  }

  document.addEventListener('click', function (e) {
    var el = e.target.closest && e.target.closest('.dopa');
    if (el) trigger(el);
  });

  window.DOPAStrap = { trigger: trigger };
})();
