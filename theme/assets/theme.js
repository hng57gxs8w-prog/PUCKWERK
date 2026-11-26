/* PUCKWERK Theme „Morgenlicht“ – kein Framework, keine Abhängigkeiten. Bewegung nur weich und dezent. */
(function () {
  'use strict';
  document.documentElement.classList.remove('no-js');

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var designMode = !!(window.Shopify && window.Shopify.designMode);

  /* ---------- Navigation: Höhe der Ankündigung, Zustand beim Scrollen ---------- */
  function setOffsets() {
    var ann = document.querySelector('.announcement');
    document.documentElement.style.setProperty('--ann-h', (ann ? ann.offsetHeight : 0) + 'px');
  }
  function initNavState() {
    var ticking = false;
    function update() {
      document.body.classList.toggle('is-scrolled', window.pageYOffset > 24);
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }, { passive: true });
    update();
  }

  /* ---------- Menü (Handy): ruhiges Vollbild-Menü ---------- */
  function initMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-menu]');
    if (!toggle || !menu) return;
    function set(open) {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
      document.body.classList.toggle('menu-open', open);
      if (open) {
        menu.hidden = false;
        requestAnimationFrame(function () { menu.classList.add('is-open'); });
      } else {
        menu.classList.remove('is-open');
        setTimeout(function () { if (!menu.classList.contains('is-open')) menu.hidden = true; }, reduceMotion ? 0 : 450);
      }
    }
    toggle.addEventListener('click', function () { set(toggle.getAttribute('aria-expanded') !== 'true'); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) set(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { set(false); toggle.focus(); } });
  }

  /* ---------- Suche: weiches Feld unter der Navigation ---------- */
  function initSearch() {
    var panel = document.querySelector('[data-search]');
    if (!panel) return;
    var toggles = document.querySelectorAll('[data-search-toggle]');
    function set(open) {
      panel.hidden = !open;
      toggles.forEach(function (t) { t.setAttribute('aria-expanded', String(open)); });
      if (open) { var input = panel.querySelector('input[type="search"]'); if (input) input.focus(); }
    }
    toggles.forEach(function (btn) { btn.addEventListener('click', function () { set(panel.hidden); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) set(false); });
    document.addEventListener('click', function (e) {
      if (!panel.hidden && !e.target.closest('[data-search]') && !e.target.closest('[data-search-toggle]')) set(false);
    });
  }

  /* ---------- Hero: Scroll-Hinweis, Text gleitet beim Scrollen, Licht pausiert außer Sicht ---------- */
  function initHero(scope) {
    (scope || document).querySelectorAll('[data-hero]').forEach(function (hero) {
      if (hero.dataset.heroReady) return;
      hero.dataset.heroReady = '1';
      var next = hero.querySelector('[data-scroll-next]');
      if (next) next.addEventListener('click', function () {
        var section = hero.closest('.shopify-section') || hero.closest('[id^="shopify-section"]') || hero;
        var target = section.nextElementSibling || hero.nextElementSibling;
        if (!target) return;
        var top = target.getBoundingClientRect().top + window.pageYOffset - 96;
        window.scrollTo({ top: top, behavior: reduceMotion ? 'auto' : 'smooth' });
      });
      if (reduceMotion) return;
      // Der Hero bleibt stehen, die Karten gleiten darüber. Sobald er ganz verdeckt ist,
      // pausiert das Licht (spart Akku) – das lässt sich nur über die Scrollposition erkennen.
      var ticking = false;
      function update() {
        var h = Math.max(1, hero.offsetHeight);
        var y = window.pageYOffset;
        hero.style.setProperty('--hp', Math.max(0, Math.min(1, y / h)).toFixed(3));
        hero.classList.toggle('is-paused', y > h + 24);
        ticking = false;
      }
      window.addEventListener('scroll', function () {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(update);
      }, { passive: true });
      update();
    });
  }

  /* ---------- Weiches Einblenden beim Scrollen ---------- */
  var REVEAL = '.sec-head, .bento__tile, .products__track, .ritual__head, .ritual__step, .iwt__grid, .richtext__inner > *, .usp__item, .newsletter__box, .values__heading, .values__intro, .value, .page-hero__inner > *, .footer__top, .footer__grid > *, .post-card, .account__card, .product__media-item';
  var revealObserver = null;
  function initReveal(scope) {
    if (!document.body.classList.contains('has-reveal') || reduceMotion || designMode || !('IntersectionObserver' in window)) return;
    document.documentElement.classList.add('reveal-on');
    if (!revealObserver) {
      revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { entry.target.classList.add('is-visible'); revealObserver.unobserve(entry.target); }
        });
      }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
    }
    (scope || document).querySelectorAll(REVEAL).forEach(function (el) {
      if (el.closest('[data-hero]') || el.hasAttribute('data-reveal')) return;
      var siblings = Array.prototype.filter.call(el.parentElement.children, function (c) { return c.matches(REVEAL); });
      el.style.setProperty('--ri', Math.min(siblings.indexOf(el), 6));
      el.setAttribute('data-reveal', '');
      revealObserver.observe(el);
    });
  }

  /* ---------- Produktreihe: Blättern mit Pfeilen, Wischen auf dem Handy ---------- */
  function initSliders(scope) {
    (scope || document).querySelectorAll('[data-slider]').forEach(function (root) {
      if (root.dataset.sliderReady) return;
      root.dataset.sliderReady = '1';
      var track = root.querySelector('[data-slider-track]');
      var prev = root.querySelector('[data-slider-prev]');
      var next = root.querySelector('[data-slider-next]');
      if (!track) return;
      function step() {
        var slide = track.querySelector(':scope > *');
        if (!slide) return track.clientWidth * 0.8;
        var gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 16;
        return slide.getBoundingClientRect().width + gap;
      }
      function state() {
        var max = track.scrollWidth - track.clientWidth - 2;
        if (prev) prev.disabled = track.scrollLeft <= 2;
        if (next) next.disabled = track.scrollLeft >= max;
        root.classList.toggle('is-static', max <= 0);
      }
      if (prev) prev.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: reduceMotion ? 'auto' : 'smooth' }); });
      if (next) next.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: reduceMotion ? 'auto' : 'smooth' }); });
      track.addEventListener('scroll', function () { requestAnimationFrame(state); }, { passive: true });
      window.addEventListener('resize', state);
      state();
    });
  }

  /* ---------- Leitsatz: Wörter hellen sich beim Scrollen nacheinander auf ---------- */
  function initStatements(scope) {
    var items = (scope || document).querySelectorAll('[data-statement]');
    if (!items.length || reduceMotion) return;
    document.documentElement.classList.add('statement-on');
    var list = Array.prototype.map.call(items, function (el) { return { el: el, words: el.querySelectorAll('.statement__w') }; });
    var ticking = false;
    function update() {
      var vh = window.innerHeight;
      list.forEach(function (it) {
        var r = it.el.getBoundingClientRect();
        var p = (vh * 0.88 - r.top) / (vh * 0.5 + r.height);
        p = Math.max(0, Math.min(1, p));
        var lit = Math.round(p * it.words.length);
        it.words.forEach(function (w, i) { w.classList.toggle('is-lit', i < lit); });
      });
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }, { passive: true });
    window.addEventListener('resize', update);
    update();
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
    setOffsets();
    initNavState(); initMenu(); initSearch(); initAnnouncement(); initQty(); initSort();
    initProduct(); initRecommendations(); initRecover(); initAddresses(); initCartAutoUpdate(); initMotion();
    initHero(); initReveal(); initSliders(); initStatements();
    window.addEventListener('resize', setOffsets);
    // Theme-Editor: neu geladene Sektionen wieder initialisieren
    document.addEventListener('shopify:section:load', function (e) {
      setOffsets(); initHero(e.target); initReveal(e.target); initSliders(e.target); initStatements(e.target);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
