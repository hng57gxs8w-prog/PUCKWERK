/* PUCKWERK Theme JS – kein Framework, keine Abhängigkeiten */
(function () {
  'use strict';
  document.documentElement.classList.remove('no-js');


  /* ---------- Bewegung: Grundlagen ---------- */
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var designMode = !!(window.Shopify && window.Shopify.designMode);

  /* ---------- Hero: Höhe unter Header, Neigen mit der Maus, Drehen beim Scrollen ---------- */
  function setHeaderOffset() {
    var header = document.querySelector('[data-header]');
    var ann = document.querySelector('.announcement');
    var h = (header ? header.offsetHeight : 0) + (ann ? ann.offsetHeight : 0);
    document.documentElement.style.setProperty('--header-offset', h + 'px');
  }

  /* ---------- Hero-Hintergrund „Braunes Rauschen“ (WebGL) ---------- */
  var NOISE_FS = [
    '#ifdef GL_FRAGMENT_PRECISION_HIGH', 'precision highp float;', '#else', 'precision mediump float;', '#endif',
    'uniform vec2 u_res; uniform float u_time; uniform vec2 u_mouse; uniform float u_strength;',
    'uniform vec3 u_c0; uniform vec3 u_c1; uniform vec3 u_c2; uniform vec3 u_c3; uniform vec3 u_c4;',
    'float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }',
    'float noise(vec2 p){ vec2 i = floor(p); vec2 f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);',
    '  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y); }',
    'float fbm(vec2 p){ float v = 0.0; float a = 0.5; mat2 m = mat2(1.6, 1.2, -1.2, 1.6);',
    '  for (int i = 0; i < 5; i++) { v += a * noise(p); p = m * p; a *= 0.5; } return v; }',
    'void main(){',
    '  vec2 p = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;',
    '  float t = u_time * 0.075;',
    '  p += u_mouse * 0.05;',
    // Domain Warping: Rauschen wird durch Rauschen verschoben → fließende Schwaden
    '  vec2 q = vec2(fbm(p * 1.5 + vec2(0.0, t)), fbm(p * 1.5 + vec2(5.2, 1.3) - t * 0.8));',
    '  vec2 r = vec2(fbm(p * 1.5 + 3.0 * q + vec2(1.7, 9.2) + t * 0.6), fbm(p * 1.5 + 3.0 * q + vec2(8.3, 2.8) - t * 0.5));',
    '  float f = fbm(p * 1.5 + 3.2 * r);',
    '  vec3 col = mix(u_c0, u_c1, smoothstep(0.06, 0.42, f));',
    '  col = mix(col, u_c2, smoothstep(0.32, 0.74, f));',
    '  col = mix(col, u_c3, smoothstep(0.62, 0.98, f * (0.8 + 0.4 * length(q))) * 0.6);',
    '  col = mix(col, u_c4, smoothstep(0.92, 1.15, f + 0.25 * length(r)) * 0.14);',
    '  float vig = smoothstep(1.35, 0.15, length(p * vec2(0.85, 1.1)));',
    '  col = mix(u_c0, col, mix(0.6, 1.0, vig));',
    '  col = mix(u_c0, col, u_strength);',
    '  col += (hash(gl_FragCoord.xy + fract(u_time * 7.0) * 113.0) - 0.5) * 0.035;',
    '  gl_FragColor = vec4(col, 1.0);',
    '}'
  ].join('\n');

  function hexToRgb(v) {
    v = (v || '').trim().replace('#', '');
    if (v.length === 3) v = v.replace(/(.)/g, '$1$1');
    var n = parseInt(v.slice(0, 6), 16);
    if (isNaN(n)) return [0, 0, 0];
    return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255];
  }

  function initNoise(hero, wrap) {
    if (wrap.dataset.noiseReady) return;
    wrap.dataset.noiseReady = '1';
    var canvas = wrap.querySelector('canvas');
    if (!canvas) return;
    var gl = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: 'low-power' });
    if (!gl) return; // CSS-Rückfallebene bleibt sichtbar

    function shader(type, src) {
      var sh = gl.createShader(type);
      gl.shaderSource(sh, src); gl.compileShader(sh);
      return gl.getShaderParameter(sh, gl.COMPILE_STATUS) ? sh : null;
    }
    var vs = shader(gl.VERTEX_SHADER, 'attribute vec2 a; void main(){ gl_Position = vec4(a, 0.0, 1.0); }');
    var fs = shader(gl.FRAGMENT_SHADER, NOISE_FS);
    if (!vs || !fs) return;
    var prog = gl.createProgram();
    gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var aLoc = gl.getAttribLocation(prog, 'a');
    gl.enableVertexAttribArray(aLoc);
    gl.vertexAttribPointer(aLoc, 2, gl.FLOAT, false, 0, 0);
    var U = {};
    ['u_res', 'u_time', 'u_mouse', 'u_strength', 'u_c0', 'u_c1', 'u_c2', 'u_c3', 'u_c4'].forEach(function (n) { U[n] = gl.getUniformLocation(prog, n); });

    // Farben aus der CI (Farbmodus-abhängig): Grund → Fläche → Kaffeebraun → Kupfer → seltene Lichter
    var cs = getComputedStyle(document.documentElement);
    var c0 = hexToRgb(cs.getPropertyValue('--c-bg'));
    var c1 = hexToRgb(cs.getPropertyValue('--c-surface'));
    var acc = hexToRgb(cs.getPropertyValue('--c-accent'));
    var c4 = hexToRgb(cs.getPropertyValue('--c-text'));
    var c2 = [0, 1, 2].map(function (i) { return c1[i] * 0.62 + acc[i] * 0.38; });
    gl.uniform3fv(U.u_c0, c0); gl.uniform3fv(U.u_c1, c1); gl.uniform3fv(U.u_c2, c2);
    gl.uniform3fv(U.u_c3, acc); gl.uniform3fv(U.u_c4, c4);
    var strength = parseFloat(getComputedStyle(hero).getPropertyValue('--bg-strength')) || 0.7;
    gl.uniform1f(U.u_strength, Math.max(0.2, Math.min(1, strength)));

    var scale = window.innerWidth < 750 ? 0.45 : 0.6; // weiches Rauschen braucht keine volle Auflösung
    function resize() {
      var w = Math.max(1, Math.round(wrap.clientWidth * scale));
      var h = Math.max(1, Math.round(wrap.clientHeight * scale));
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h); }
      gl.uniform2f(U.u_res, w, h);
    }
    var mx = 0, my = 0, tx = 0, ty = 0;
    if (!reduceMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      hero.addEventListener('pointermove', function (e) {
        var r = hero.getBoundingClientRect();
        tx = (e.clientX - r.left) / r.width * 2 - 1;
        ty = (e.clientY - r.top) / r.height * 2 - 1;
      });
      hero.addEventListener('pointerleave', function () { tx = 0; ty = 0; });
    }
    function render(t) {
      resize();
      mx += (tx - mx) * 0.05; my += (ty - my) * 0.05;
      gl.uniform2f(U.u_mouse, mx, -my);
      gl.uniform1f(U.u_time, t);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    canvas.__pwRender = render; // für Vorschau und Tests
    canvas.addEventListener('webglcontextlost', function (e) { e.preventDefault(); wrap.classList.remove('is-live'); });

    render(0);
    wrap.classList.add('is-live');
    if (reduceMotion) return; // Standbild

    var start = performance.now(), last = 0;
    (function loop(now) {
      if (!canvas.isConnected) return;          // Sektion entfernt (Theme-Editor)
      requestAnimationFrame(loop);
      if (hero.classList.contains('is-paused') || now - last < 33) return; // max. ~30 fps, Pause außer Sicht
      last = now;
      render((now - start) / 1000);
    })(start);
  }

  function initHero(scope) {
    (scope || document).querySelectorAll('[data-hero]').forEach(function (hero) {
      if (hero.dataset.heroReady) return;
      hero.dataset.heroReady = '1';
      var next = hero.querySelector('[data-scroll-next]');
      if (next) next.addEventListener('click', function () {
        var section = hero.closest('.shopify-section') || hero.closest('[id^="shopify-section"]') || hero;
        var target = section.nextElementSibling || hero.nextElementSibling;
        var header = document.querySelector('[data-header]');
        if (!target) return;
        var top = target.getBoundingClientRect().top + window.pageYOffset - (header ? header.offsetHeight : 0);
        window.scrollTo({ top: top, behavior: reduceMotion ? 'auto' : 'smooth' });
      });

      var puck = hero.querySelector('.puck-anim__svg');        // Layout „Geteilt“
      var rings = hero.querySelector('.hero-bg__svg');          // Hintergrund: Linien
      var noise = hero.querySelector('[data-hero-noise]');      // Hintergrund: Rauschen
      var layers = hero.querySelectorAll('[data-hero-bg]');
      if (noise) initNoise(hero, noise);
      if (reduceMotion || (!puck && !layers.length)) return;

      // Außer Sicht: Endlos-Animationen und Shader pausieren
      var visible = true, ticking = false;
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
          visible = entries[0].isIntersecting;
          hero.classList.toggle('is-paused', !visible);
        }).observe(hero);
      }

      // Maus: Puck neigt sich, Linien verschieben sich leicht (das Rauschen reagiert selbst)
      if (window.matchMedia('(hover: hover) and (pointer: fine)').matches && (puck || rings)) {
        hero.addEventListener('pointermove', function (e) {
          var r = hero.getBoundingClientRect();
          var x = (e.clientX - (r.left + r.width / 2)) / r.width;
          var y = (e.clientY - (r.top + r.height / 2)) / r.height;
          if (puck) {
            var pr = puck.getBoundingClientRect();
            puck.style.setProperty('--tilt-x', (-(e.clientY - (pr.top + pr.height / 2)) / pr.height * 10).toFixed(2) + 'deg');
            puck.style.setProperty('--tilt-y', ((e.clientX - (pr.left + pr.width / 2)) / pr.width * 10).toFixed(2) + 'deg');
          }
          if (rings) {
            rings.style.setProperty('--px', (-x * 28).toFixed(1) + 'px');
            rings.style.setProperty('--py', (-y * 28).toFixed(1) + 'px');
          }
        });
        hero.addEventListener('pointerleave', function () {
          if (puck) { puck.style.setProperty('--tilt-x', '0deg'); puck.style.setProperty('--tilt-y', '0deg'); }
          if (rings) { rings.style.setProperty('--px', '0px'); rings.style.setProperty('--py', '0px'); }
        });
      }

      // Scrollen: Puck dreht sich; Hintergrund blendet aus, Linien drehen/wachsen, Überschrift gleitet mit
      function update() {
        var y = window.pageYOffset;
        if (puck) puck.style.setProperty('--spin', (y * 0.12).toFixed(1) + 'deg');
        if (layers.length) {
          var p = Math.max(0, Math.min(1, y / Math.max(1, hero.offsetHeight)));
          hero.style.setProperty('--hp', p.toFixed(3));
          layers.forEach(function (l) { l.style.setProperty('--hb-fade', (1 - p * 0.6).toFixed(3)); });
          if (rings) {
            rings.style.setProperty('--hb-rot', (p * 30).toFixed(2) + 'deg');
            rings.style.setProperty('--hb-scale', (1 + p * 0.12).toFixed(3));
          }
        }
        ticking = false;
      }
      window.addEventListener('scroll', function () {
        if (!visible || ticking) return;
        ticking = true;
        requestAnimationFrame(update);
      }, { passive: true });
    });
  }

  /* ---------- Inhalte beim Scrollen einblenden ---------- */
  var REVEAL = '.section-head, .divider-row, .cats .divider, .cat, .card, .iwt__grid, .richtext__inner > *, .usp__item, .newsletter__box, .value, .values__heading, .values__intro, .page-hero__inner > *, .footer__grid > *, .post-card, .account__card, .product__media-item';
  var revealObserver = null;
  function initReveal(scope) {
    if (!document.body.classList.contains('has-reveal') || reduceMotion || designMode || !('IntersectionObserver' in window)) return;
    document.documentElement.classList.add('reveal-on');
    if (!revealObserver) {
      revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { entry.target.classList.add('is-visible'); revealObserver.unobserve(entry.target); }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    }
    (scope || document).querySelectorAll(REVEAL).forEach(function (el) {
      if (el.closest('[data-hero]') || el.hasAttribute('data-reveal')) return;
      var siblings = Array.prototype.filter.call(el.parentElement.children, function (c) { return c.matches(REVEAL); });
      el.style.setProperty('--ri', Math.min(siblings.indexOf(el), 6));
      el.setAttribute('data-reveal', '');
      revealObserver.observe(el);
    });
  }

  /* ---------- Mobile Menü ---------- */
  function initMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-menu]');
    var header = document.querySelector('[data-header]');
    if (!toggle || !menu) return;
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      if (header) {
        document.documentElement.style.setProperty('--header-bottom', header.getBoundingClientRect().bottom + 'px');
      }
      toggle.setAttribute('aria-expanded', String(!open));
      toggle.setAttribute('aria-label', open ? 'Menü öffnen' : 'Menü schließen');
      menu.classList.toggle('is-open', !open);
      document.body.style.overflow = open ? '' : 'hidden';
    });
  }

  /* ---------- Suche ---------- */
  function initSearch() {
    var panel = document.querySelector('[data-search]');
    if (!panel) return;
    document.querySelectorAll('[data-search-toggle]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        panel.hidden = !panel.hidden;
        if (!panel.hidden) {
          var input = panel.querySelector('input[type="search"]');
          if (input) input.focus();
        }
      });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !panel.hidden) panel.hidden = true;
    });
  }

  /* ---------- Ankündigungsleiste ---------- */
  function initAnnouncement() {
    var track = document.querySelector('[data-announcement]');
    if (!track) return;
    var items = track.querySelectorAll('.announcement__item');
    if (items.length < 2) return;
    var i = 0;
    setInterval(function () {
      var cur = items[i];
      i = (i + 1) % items.length;
      cur.classList.remove('is-active');
      cur.classList.add('is-leaving');
      items[i].classList.remove('is-leaving');
      items[i].classList.add('is-active');
      setTimeout(function () { cur.classList.remove('is-leaving'); }, 450);
    }, 4500);
  }

  /* ---------- Mengen-Buttons ---------- */
  function initQty() {
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-qty]');
      if (!btn) return;
      var input = btn.parentElement.querySelector('input[type="number"]');
      if (!input) return;
      var min = parseInt(input.min || '0', 10);
      var val = (parseInt(input.value, 10) || 0) + parseInt(btn.getAttribute('data-qty'), 10);
      input.value = Math.max(min, val);
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }

  /* ---------- Warenkorb: Mengen automatisch übernehmen ---------- */
  function initCartAutoUpdate() {
    var form = document.querySelector('[data-cart-form]');
    if (!form) return;
    var timer;
    form.addEventListener('change', function (e) {
      if (!e.target.matches('[data-cart-qty]')) return;
      clearTimeout(timer);
      timer = setTimeout(function () { form.submit(); }, 700);
    });
  }

  /* ---------- Videos: Rücksicht auf „Bewegung reduzieren“ ---------- */
  function initMotion() {
    if (!window.matchMedia || !window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    document.querySelectorAll('video[autoplay]').forEach(function (v) { v.removeAttribute('autoplay'); v.pause(); v.controls = true; });
  }

  /* ---------- Sortierung ---------- */
  function initSort() {
    var select = document.querySelector('[data-sort]');
    if (!select) return;
    select.addEventListener('change', function () {
      var url = new URL(window.location.href);
      url.searchParams.set('sort_by', select.value);
      url.searchParams.delete('page');
      window.location.href = url.toString();
    });
  }

  /* ---------- Geldformat ---------- */
  function formatMoney(cents, format) {
    if (typeof cents === 'string') cents = cents.replace('.', '');
    format = format || '€{{amount_with_comma_separator}}';
    function fmt(number, precision, thousands, decimal) {
      thousands = typeof thousands === 'undefined' ? ',' : thousands;
      decimal = typeof decimal === 'undefined' ? '.' : decimal;
      if (isNaN(number) || number == null) return '0';
      number = (number / 100.0).toFixed(precision);
      var parts = number.split('.');
      var dollars = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + thousands);
      var c = parts[1] ? decimal + parts[1] : '';
      return dollars + c;
    }
    return format.replace(/\{\{\s*(\w+)\s*\}\}/, function (_, key) {
      switch (key) {
        case 'amount': return fmt(cents, 2);
        case 'amount_no_decimals': return fmt(cents, 0);
        case 'amount_with_comma_separator': return fmt(cents, 2, '.', ',');
        case 'amount_no_decimals_with_comma_separator': return fmt(cents, 0, '.', ',');
        case 'amount_with_apostrophe_separator': return fmt(cents, 2, "'", '.');
        case 'amount_with_space_separator': return fmt(cents, 2, ' ', ',');
        default: return fmt(cents, 2);
      }
    });
  }

  /* ---------- Produkt-Varianten ---------- */
  function initProduct() {
    document.querySelectorAll('[data-product]').forEach(function (root) {
      var json = root.querySelector('[data-variants-json]');
      var idInput = root.querySelector('[data-variant-id]');
      if (!json || !idInput) return;
      var variants = JSON.parse(json.textContent);
      var moneyFormat = root.getAttribute('data-money-format');
      var fieldsets = root.querySelectorAll('[data-option]');
      var priceEl = root.querySelector('[data-price]');
      var compareEl = root.querySelector('[data-compare-price]');
      var priceWrap = priceEl ? priceEl.closest('.price') : null;
      var addBtn = root.querySelector('[data-add-button]');
      var addLabel = root.querySelector('[data-add-label]');

      // Radios mit aktueller Variante synchronisieren
      var current = variants.find(function (v) { return String(v.id) === String(idInput.value); }) || variants[0];
      if (current) {
        fieldsets.forEach(function (fs, idx) {
          fs.querySelectorAll('input').forEach(function (inp) {
            inp.checked = inp.value === current.options[idx];
          });
        });
      }

      function selected() {
        return Array.prototype.map.call(fieldsets, function (fs) {
          var c = fs.querySelector('input:checked');
          return c ? c.value : null;
        });
      }

      function markAvailability(sel) {
        fieldsets.forEach(function (fs, idx) {
          fs.querySelectorAll('input').forEach(function (inp) {
            var test = sel.slice(); test[idx] = inp.value;
            var ok = variants.some(function (v) {
              return v.available && v.options.every(function (o, i) { return o === test[i]; });
            });
            var label = fs.querySelector('label[for="' + inp.id + '"]');
            if (label) label.classList.toggle('is-unavailable', !ok);
          });
        });
      }

      function update() {
        var sel = selected();
        var variant = variants.find(function (v) {
          return v.options.every(function (o, i) { return o === sel[i]; });
        });
        fieldsets.forEach(function (fs, idx) {
          var out = fs.querySelector('[data-option-value]');
          if (out) out.textContent = sel[idx] || '';
        });
        markAvailability(sel);
        if (!variant) {
          if (addBtn) addBtn.disabled = true;
          if (addLabel) addLabel.textContent = 'Nicht verfügbar';
          return;
        }
        idInput.value = variant.id;
        if (priceEl) priceEl.textContent = formatMoney(variant.price, moneyFormat);
        if (compareEl) {
          var onSale = variant.compare_at_price && variant.compare_at_price > variant.price;
          compareEl.hidden = !onSale;
          compareEl.textContent = onSale ? formatMoney(variant.compare_at_price, moneyFormat) : '';
          if (priceWrap) priceWrap.classList.toggle('price--sale', !!onSale);
        }
        if (addBtn) addBtn.disabled = !variant.available;
        if (addLabel) addLabel.textContent = variant.available ? 'In den Warenkorb' : 'Ausverkauft';
        if (variant.featured_media) {
          var m = root.querySelector('[data-media-id="' + variant.featured_media.id + '"]');
          var gallery = m ? m.parentElement : null;
          if (m && gallery && gallery.firstElementChild !== m) {
            gallery.querySelectorAll('.is-first').forEach(function (el) { el.classList.remove('is-first'); });
            m.classList.add('is-first');
            gallery.insertBefore(m, gallery.firstElementChild);
          }
        }
        var url = new URL(window.location.href);
        url.searchParams.set('variant', variant.id);
        window.history.replaceState({}, '', url.toString());
      }

      fieldsets.forEach(function (fs) { fs.addEventListener('change', update); });
      if (fieldsets.length) markAvailability(selected());

      // Ajax Add-to-Cart – Rückmeldung im CI-Ton direkt am Button
      var form = root.querySelector('form[action*="/cart/add"]');
      var msg = root.querySelector('[data-form-message]');
      function say(text, isError) {
        if (!msg) return;
        msg.hidden = !text;
        msg.textContent = text || '';
        msg.classList.toggle('form-message--error', !!isError);
      }
      if (form && window.fetch) {
        form.addEventListener('submit', function (e) {
          e.preventDefault();
          if (addBtn) addBtn.disabled = true;
          var prev = addLabel ? addLabel.textContent : '';
          if (addLabel) addLabel.textContent = 'Kommt in den Warenkorb …';
          say('');
          var root_url = (window.Shopify && Shopify.routes && Shopify.routes.root) || '/';
          fetch(root_url + 'cart/add.js', { method: 'POST', headers: { 'Accept': 'application/json' }, body: new FormData(form) })
            .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, data: d }; }); })
            .then(function (res) {
              if (!res.ok) {
                var err = new Error(res.data.description || res.data.message || '');
                err.userFacing = !!res.data.description;
                throw err;
              }
              if (addLabel) addLabel.textContent = 'Liegt im Warenkorb';
              say('Liegt im Warenkorb. Weiter stöbern oder direkt zur Kasse.');
              return fetch(root_url + 'cart.js').then(function (r) { return r.json(); });
            })
            .then(function (cart) {
              document.querySelectorAll('[data-cart-count]').forEach(function (el) {
                el.textContent = cart.item_count;
                el.classList.toggle('is-empty', cart.item_count === 0);
              });
              setTimeout(function () {
                if (addLabel) addLabel.textContent = prev;
                if (addBtn) addBtn.disabled = false;
              }, 2000);
            })
            .catch(function (err) {
              if (addLabel) addLabel.textContent = prev;
              if (addBtn) addBtn.disabled = false;
              say(err.userFacing ? err.message : 'Da ist was schiefgelaufen. Probier’s bitte gleich noch mal.', true);
            });
        });
      }
    });
  }

  /* ---------- Produktempfehlungen ---------- */
  function initRecommendations() {
    var el = document.querySelector('[data-recommendations]');
    if (!el || el.children.length || !window.fetch) return;
    fetch(el.getAttribute('data-url'))
      .then(function (r) { return r.text(); })
      .then(function (html) {
        var tmp = document.createElement('div');
        tmp.innerHTML = html;
        var inner = tmp.querySelector('[data-recommendations]');
        if (inner && inner.innerHTML.trim()) el.innerHTML = inner.innerHTML;
      })
      .catch(function () {});
  }

  /* ---------- Login: Passwort vergessen ---------- */
  function initRecover() {
    var link = document.querySelector('[data-recover-toggle]');
    var box = document.getElementById('recover');
    if (!box) return;
    if (link) link.addEventListener('click', function (e) {
      e.preventDefault();
      box.classList.toggle('is-open');
      if (box.classList.contains('is-open')) box.scrollIntoView({ behavior: 'smooth' });
    });
    if (box.querySelector('.form-success, .form-error')) box.classList.add('is-open');
  }

  /* ---------- Adressen: Land vorauswählen, Löschen bestätigen ---------- */
  function initAddresses() {
    document.querySelectorAll('select[data-default]').forEach(function (s) {
      var d = s.getAttribute('data-default');
      if (d) s.value = d;
    });
    document.querySelectorAll('form[data-confirm]').forEach(function (f) {
      f.addEventListener('submit', function (e) {
        if (!window.confirm(f.getAttribute('data-confirm'))) e.preventDefault();
      });
    });
  }

  function init() {
    setHeaderOffset();
    initMenu(); initSearch(); initAnnouncement(); initQty(); initSort();
    initProduct(); initRecommendations(); initRecover(); initAddresses(); initCartAutoUpdate(); initMotion();
    initHero(); initReveal();
    window.addEventListener('resize', setHeaderOffset);
    // Theme-Editor: neu geladene Sektionen wieder initialisieren
    document.addEventListener('shopify:section:load', function (e) { setHeaderOffset(); initHero(e.target); initReveal(e.target); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
