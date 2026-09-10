/* ============================================
   التجمع الثالث - Premium Interactions
   طبقة تأثيرات مستقلة لا تعدل أي وظيفة قائمة
   ============================================ */

'use strict';

(function () {
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  // ============================================
  // 1. شريط تقدم القراءة
  // ============================================
  function initProgress() {
    var bar = document.createElement('div');
    bar.className = 'fx-progress';
    bar.setAttribute('aria-hidden', 'true');
    var fill = document.createElement('span');
    bar.appendChild(fill);
    document.body.appendChild(bar);

    var ticking = false;
    function update() {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      var p = h > 0 ? (window.scrollY / h) * 100 : 0;
      fill.style.width = Math.min(100, Math.max(0, p)) + '%';
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    }, { passive: true });

    update();
  }

  // ============================================
  // 2. تأثير 3D تفاعلي على الكروت
  // ============================================
  var TILT_TARGETS = [
    '.info-card', '.service-card', '.service-full-card',
    '.place-card', '.place-full-card', '.stat-item',
    '.detail-highlight', '.gallery-item',
    '.contact-card', '.about-feature'
  ].join(', ');

  var MAX_TILT = 7;

  function initTilt() {
    if (!finePointer) return;

    var cards = document.querySelectorAll(TILT_TARGETS);

    cards.forEach(function (card) {
      if (card.dataset.fxTilt === '1') return;
      card.dataset.fxTilt = '1';
      card.classList.add('fx-tilt');

      var sheen = document.createElement('span');
      sheen.className = 'fx-sheen';
      sheen.setAttribute('aria-hidden', 'true');
      card.appendChild(sheen);

      var frame = null;

      card.addEventListener('pointermove', function (e) {
        if (frame) return;
        frame = window.requestAnimationFrame(function () {
          var r = card.getBoundingClientRect();
          var x = (e.clientX - r.left) / r.width;
          var y = (e.clientY - r.top) / r.height;
          card.style.setProperty('--fx-ry', ((x - 0.5) * MAX_TILT * 2).toFixed(2) + 'deg');
          card.style.setProperty('--fx-rx', ((0.5 - y) * MAX_TILT * 2).toFixed(2) + 'deg');
          card.style.setProperty('--fx-mx', (x * 100).toFixed(1) + '%');
          card.style.setProperty('--fx-my', (y * 100).toFixed(1) + '%');
          card.classList.add('is-tilting');
          frame = null;
        });
      });

      card.addEventListener('pointerleave', function () {
        card.classList.remove('is-tilting');
        card.style.setProperty('--fx-rx', '0deg');
        card.style.setProperty('--fx-ry', '0deg');
      });
    });
  }

  // ============================================
  // 3. أجواء الهيرو (أضواء + نقش هندسي)
  // ============================================
  function initAtmosphere() {
    var heroes = document.querySelectorAll('.hero, .page-hero, .detail-hero, .cta-section');

    heroes.forEach(function (hero) {
      if (getComputedStyle(hero).position === 'static') hero.style.position = 'relative';

      var orbs = document.createElement('div');
      orbs.className = 'fx-orbs';
      orbs.setAttribute('aria-hidden', 'true');
      orbs.innerHTML =
        '<span class="fx-orb fx-orb-1"></span>' +
        '<span class="fx-orb fx-orb-2"></span>' +
        '<span class="fx-orb fx-orb-3"></span>';
      hero.insertBefore(orbs, hero.firstChild);

      var pattern = document.createElement('div');
      pattern.className = 'fx-pattern';
      pattern.setAttribute('aria-hidden', 'true');
      hero.insertBefore(pattern, hero.firstChild);
    });
  }

  // ============================================
  // 4. Parallax للصور الكبيرة
  // ============================================
  function initParallax() {
    var heroImg = document.querySelector('.hero-img, .detail-hero-img');
    if (!heroImg) return;
    heroImg.classList.add('fx-parallax');

    var ticking = false;
    function update() {
      var offset = Math.min(window.scrollY * 0.18, 160);
      heroImg.style.transform = 'translate3d(0, ' + offset.toFixed(1) + 'px, 0) scale(1.08)';
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    }, { passive: true });

    update();
  }

  // ============================================
  // 5. دخول سينمائي لمحتوى الهيرو
  // ============================================
  function initHeroEntrance() {
    var scope = document.querySelector('.hero-content, .page-hero-content, .detail-hero-content');
    if (!scope) return;

    var kids = scope.children;
    for (var i = 0; i < kids.length && i < 5; i++) {
      kids[i].classList.add('fx-enter', 'fx-enter-' + (i + 1));
    }
  }

  // ============================================
  // 6. عدّاد الأرقام في شريط الإحصائيات
  // ============================================
  function initCounters() {
    var nums = document.querySelectorAll('.stat-number');
    if (!nums.length || !('IntersectionObserver' in window)) return;

    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        obs.unobserve(el);

        var raw = el.textContent.trim();
        var match = raw.match(/\d+/);
        if (!match) return;

        var target = parseInt(match[0], 10);
        var prefix = raw.slice(0, match.index);
        var suffix = raw.slice(match.index + match[0].length);
        var start = null;
        var duration = 1400;

        function step(ts) {
          if (start === null) start = ts;
          var p = Math.min((ts - start) / duration, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = prefix + Math.round(target * eased) + suffix;
          if (p < 1) window.requestAnimationFrame(step);
        }

        window.requestAnimationFrame(step);
      });
    }, { threshold: 0.4 });

    nums.forEach(function (n) { obs.observe(n); });
  }

  // ============================================
  // التشغيل
  // ============================================
  ready(function () {
    initProgress();
    initAtmosphere();

    if (reduced) return;

    initTilt();
    initParallax();
    initHeroEntrance();
    initCounters();
  });
})();
