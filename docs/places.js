/* ============================================
   التجمع الثالث - عرض الأماكن وصفحة التفاصيل
   يعتمد على places-data.js
   ============================================ */

'use strict';

(function () {
  var DATA = window.PLACES_DATA || [];
  var CATS = window.PLACES_CATEGORIES || [];

  // ---------- أدوات مساعدة ----------
  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function byId(id) {
    for (var i = 0; i < DATA.length; i++) {
      if (DATA[i].id === id) return DATA[i];
    }
    return null;
  }

  // كشف العناصر عند التمرير (للعناصر المُنشأة ديناميكياً)
  function revealIn(scope) {
    var els = scope.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      for (var i = 0; i < els.length; i++) els[i].classList.add('visible');
      return;
    }
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (el) { obs.observe(el); });
  }

  function delayClass(i) {
    var n = i % 3;
    return n === 0 ? '' : ' reveal-delay-' + n;
  }

  // ---------- كارت المكان ----------
  function cardHTML(place, index) {
    var img = place.images[0];
    var count = place.images.length;
    return '' +
      '<a class="place-full-card fx-tilt reveal' + delayClass(index) + '" href="place.html?id=' + encodeURIComponent(place.id) + '" aria-label="عرض تفاصيل ' + esc(place.name) + '">' +
        '<div class="place-full-card-img">' +
          '<img src="' + esc(img.src) + '" alt="' + esc(img.alt) + '" loading="lazy" />' +
          '<span class="place-card-tag">' + esc(place.tag) + '</span>' +
          '<span class="place-photo-count"><i class="fas fa-images" aria-hidden="true"></i> ' + count + '</span>' +
        '</div>' +
        '<div class="place-full-card-body">' +
          '<h3>' + esc(place.name) + '</h3>' +
          '<p>' + esc(place.short) + '</p>' +
          '<div class="place-full-card-footer">' +
            '<div class="place-location"><i class="fas fa-map-marker-alt" aria-hidden="true"></i> ' + esc(place.area) + '</div>' +
            '<span class="place-more">عرض التفاصيل <i class="fas fa-arrow-left" aria-hidden="true"></i></span>' +
          '</div>' +
        '</div>' +
      '</a>';
  }

  // ---------- صفحة الأماكن ----------
  function renderPlacesPage(root) {
    var html = '<div class="services-filter places-filter" role="group" aria-label="تصفية الأماكن">' +
      '<button class="filter-btn active" data-place-filter="all">الكل</button>';
    CATS.forEach(function (cat) {
      var has = DATA.some(function (p) { return p.category === cat.id; });
      if (has) html += '<button class="filter-btn" data-place-filter="' + esc(cat.id) + '">' + esc(cat.tagline) + '</button>';
    });
    html += '</div>';

    CATS.forEach(function (cat) {
      var items = DATA.filter(function (p) { return p.category === cat.id; });
      if (!items.length) return;
      html += '<div class="places-block" data-place-group="' + esc(cat.id) + '">' +
        '<div class="section-header places-block-header">' +
          '<span class="section-label">' + esc(cat.tagline) + '</span>' +
          '<h2 class="section-title">' + esc(cat.label) + '</h2>' +
        '</div>' +
        '<div class="places-full-grid">';
      items.forEach(function (p, i) { html += cardHTML(p, i); });
      html += '</div></div>';
    });

    root.innerHTML = html;
    revealIn(root);

    var btns = root.querySelectorAll('[data-place-filter]');
    var groups = root.querySelectorAll('[data-place-group]');
    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        btns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        var f = btn.dataset.placeFilter;
        groups.forEach(function (g) {
          g.style.display = (f === 'all' || g.dataset.placeGroup === f) ? '' : 'none';
        });
      });
    });
  }

  // ---------- صفحة تفاصيل المكان ----------
  function renderDetailPage(root) {
    var params = new URLSearchParams(window.location.search);
    var place = byId(params.get('id') || '');

    if (!place) {
      root.innerHTML = '<section class="section-padding"><div class="container">' +
        '<div class="place-notfound">' +
          '<i class="fas fa-map-location-dot" aria-hidden="true"></i>' +
          '<h1>لم نتمكن من العثور على هذا المكان</h1>' +
          '<p>ربما تم تغيير الرابط أو حذف المكان. يمكنك تصفح جميع الأماكن من الصفحة التالية.</p>' +
          '<a href="places.html" class="btn btn-primary"><i class="fas fa-arrow-left" aria-hidden="true"></i> كل الأماكن</a>' +
        '</div>' +
      '</div></section>';
      return;
    }

    document.title = place.name + ' | التجمع الثالث';
    var metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', place.short);

    var cover = place.images[0];

    // معرض الصور
    var gallery = '';
    place.images.forEach(function (im, i) {
      gallery += '<button type="button" class="gallery-item fx-tilt reveal' + delayClass(i) + '" data-index="' + i + '" aria-label="تكبير الصورة ' + (i + 1) + '">' +
        '<img src="' + esc(im.src) + '" alt="' + esc(im.alt) + '" loading="lazy" />' +
        '<span class="gallery-zoom"><i class="fas fa-expand" aria-hidden="true"></i></span>' +
      '</button>';
    });

    // المميزات
    var highlights = '';
    (place.highlights || []).forEach(function (h, i) {
      highlights += '<div class="detail-highlight fx-tilt reveal' + delayClass(i) + '">' +
        '<div class="detail-highlight-icon"><i class="fas ' + esc(h.icon) + '" aria-hidden="true"></i></div>' +
        '<h4>' + esc(h.title) + '</h4>' +
        '<p>' + esc(h.text) + '</p>' +
      '</div>';
    });

    // الفقرات
    var about = '';
    (place.about || []).forEach(function (p) { about += '<p>' + esc(p) + '</p>'; });

    // أماكن أخرى
    var others = DATA.filter(function (p) { return p.id !== place.id; }).slice(0, 3);
    var related = '';
    others.forEach(function (p, i) { related += cardHTML(p, i); });

    root.innerHTML = '' +
      '<section class="detail-hero" aria-labelledby="placeTitle">' +
        '<img class="detail-hero-img fx-parallax" src="' + esc(cover.src) + '" alt="' + esc(cover.alt) + '" />' +
        '<div class="detail-hero-overlay" aria-hidden="true"></div>' +
        '<div class="container">' +
          '<div class="detail-hero-content">' +
            '<nav class="breadcrumb" aria-label="مسار التنقل">' +
              '<a href="index.html">الرئيسية</a>' +
              '<i class="fas fa-chevron-right" aria-hidden="true"></i>' +
              '<a href="places.html">الأماكن</a>' +
              '<i class="fas fa-chevron-right" aria-hidden="true"></i>' +
              '<span>' + esc(place.name) + '</span>' +
            '</nav>' +
            '<span class="detail-tag"><i class="fas ' + esc(place.icon) + '" aria-hidden="true"></i> ' + esc(place.tag) + '</span>' +
            '<h1 id="placeTitle">' + esc(place.name) + '</h1>' +
            '<p>' + esc(place.short) + '</p>' +
            '<div class="detail-meta">' +
              '<span><i class="fas fa-map-marker-alt" aria-hidden="true"></i> ' + esc(place.area) + '</span>' +
              '<span><i class="fas fa-images" aria-hidden="true"></i> ' + place.images.length + ' صور</span>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</section>' +

      '<section class="section-padding">' +
        '<div class="container">' +
          '<div class="detail-layout">' +
            '<div class="detail-main">' +
              '<div class="section-header">' +
                '<span class="section-label">نبذة</span>' +
                '<h2 class="section-title">عن ' + esc(place.name) + '</h2>' +
              '</div>' +
              '<div class="detail-text reveal">' + about + '</div>' +
              '<div class="detail-highlights">' + highlights + '</div>' +
            '</div>' +
            '<aside class="detail-side">' +
              '<div class="detail-info-card glass-card">' +
                '<h3><i class="fas fa-circle-info" aria-hidden="true"></i> معلومات سريعة</h3>' +
                '<div class="detail-info-row"><span>النوع</span><strong>' + esc(place.type) + '</strong></div>' +
                '<div class="detail-info-row"><span>الموقع</span><strong>' + esc(place.area) + '</strong></div>' +
                '<div class="detail-info-row"><span>مواعيد العمل</span><strong class="detail-live"><i class="fas fa-clock" aria-hidden="true"></i> مباشرة من Google Maps</strong></div>' +
                '<div class="detail-map-embed">' +
                  '<iframe src="' + esc(place.embedUrl) + '" title="خريطة ' + esc(place.name) + '" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>' +
                '</div>' +
                '<a class="btn btn-primary detail-map-btn" href="' + esc(place.mapUrl) + '" target="_blank" rel="noopener noreferrer">' +
                  '<i class="fas fa-clock" aria-hidden="true"></i> مواعيد العمل على Google Maps' +
                '</a>' +
                '<p class="detail-note">مواعيد الفتح والغلق تُعرض مباشرة من Google Maps لضمان دقتها وتحديثها تلقائياً.</p>' +
              '</div>' +
            '</aside>' +
          '</div>' +
        '</div>' +
      '</section>' +

      '<section class="section-padding bg-off-white" aria-labelledby="galleryHeading">' +
        '<div class="container">' +
          '<div class="section-header centered">' +
            '<span class="section-label">معرض الصور</span>' +
            '<h2 class="section-title" id="galleryHeading">صور من ' + esc(place.name) + '</h2>' +
            '<p class="section-subtitle">اضغط على أي صورة لعرضها بالحجم الكامل</p>' +
          '</div>' +
          '<div class="detail-gallery">' + gallery + '</div>' +
        '</div>' +
      '</section>' +

      '<section class="section-padding" aria-labelledby="relatedHeading">' +
        '<div class="container">' +
          '<div class="section-header centered">' +
            '<span class="section-label">اكتشف المزيد</span>' +
            '<h2 class="section-title" id="relatedHeading">أماكن أخرى قد تهمك</h2>' +
          '</div>' +
          '<div class="places-full-grid">' + related + '</div>' +
          '<div style="text-align:center; margin-top:48px;">' +
            '<a href="places.html" class="btn btn-outline-navy"><i class="fas fa-arrow-left" aria-hidden="true"></i> كل الأماكن</a>' +
          '</div>' +
        '</div>' +
      '</section>';

    revealIn(root);
    initLightbox(root, place.images);
  }

  // ---------- اللايت بوكس ----------
  function initLightbox(root, images) {
    var items = root.querySelectorAll('.gallery-item');
    if (!items.length) return;

    var box = document.createElement('div');
    box.className = 'lightbox';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', 'عارض الصور');
    box.innerHTML =
      '<button class="lightbox-close" aria-label="إغلاق">&times;</button>' +
      '<button class="lightbox-nav lightbox-prev" aria-label="الصورة السابقة"><i class="fas fa-chevron-right"></i></button>' +
      '<figure class="lightbox-figure">' +
        '<img alt="" />' +
        '<figcaption></figcaption>' +
      '</figure>' +
      '<button class="lightbox-nav lightbox-next" aria-label="الصورة التالية"><i class="fas fa-chevron-left"></i></button>';
    document.body.appendChild(box);

    var imgEl = box.querySelector('img');
    var capEl = box.querySelector('figcaption');
    var current = 0;
    var lastFocus = null;

    function show(i) {
      current = (i + images.length) % images.length;
      imgEl.src = images[current].src;
      imgEl.alt = images[current].alt;
      capEl.textContent = images[current].alt + ' • ' + (current + 1) + '/' + images.length;
      if (images.length < 2) box.classList.add('is-single');
      else box.classList.remove('is-single');
    }

    function open(i) {
      lastFocus = document.activeElement;
      show(i);
      box.classList.add('open');
      document.body.style.overflow = 'hidden';
      box.querySelector('.lightbox-close').focus();
    }

    function close() {
      box.classList.remove('open');
      document.body.style.overflow = '';
      if (lastFocus) lastFocus.focus();
    }

    items.forEach(function (item) {
      item.addEventListener('click', function () { open(parseInt(item.dataset.index, 10) || 0); });
    });

    box.querySelector('.lightbox-close').addEventListener('click', close);
    box.querySelector('.lightbox-prev').addEventListener('click', function () { show(current - 1); });
    box.querySelector('.lightbox-next').addEventListener('click', function () { show(current + 1); });
    box.addEventListener('click', function (e) { if (e.target === box) close(); });

    document.addEventListener('keydown', function (e) {
      if (!box.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') show(current - 1);
      if (e.key === 'ArrowLeft') show(current + 1);
    });
  }

  // ---------- التشغيل ----------
  function init() {
    var placesRoot = document.getElementById('placesRoot');
    if (placesRoot) renderPlacesPage(placesRoot);

    var detailRoot = document.getElementById('placeDetail');
    if (detailRoot) renderDetailPage(detailRoot);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
