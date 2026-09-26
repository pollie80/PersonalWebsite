(function () {
    var root = document.documentElement;

    function store(key, value) {
        try { localStorage.setItem(key, value); } catch (e) {}
    }
    function recall(key) {
        try { return localStorage.getItem(key); } catch (e) { return null; }
    }

    /* ---------- Theme ---------- */
    document.getElementById('themeToggle').addEventListener('click', function () {
        var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        root.setAttribute('data-theme', next);
        store('theme', next);
    });

    /* ---------- Language ---------- */
    var dict = window.I18N || {};
    var textEls = document.querySelectorAll('[data-i18n]');
    var htmlEls = document.querySelectorAll('[data-i18n-html]');
    var attrEls = document.querySelectorAll('[data-i18n-attr]');

    // English is the markup itself: capture it once so we can switch back
    var en = { 'contact.copied': 'Copied!' };
    textEls.forEach(function (el) { en[el.dataset.i18n] = el.textContent; });
    htmlEls.forEach(function (el) { en[el.dataset.i18nHtml] = el.innerHTML; });
    attrEls.forEach(function (el) {
        var parts = el.dataset.i18nAttr.split(':');
        en[parts[1]] = el.getAttribute(parts[0]);
    });
    dict.en = en;

    var current = 'en';

    function t(key) {
        return (dict[current] && dict[current][key]) || en[key] || '';
    }

    function apply(lang) {
        current = dict[lang] ? lang : 'en';
        root.lang = current;
        textEls.forEach(function (el) { el.textContent = t(el.dataset.i18n); });
        htmlEls.forEach(function (el) { el.innerHTML = t(el.dataset.i18nHtml); });
        attrEls.forEach(function (el) {
            var parts = el.dataset.i18nAttr.split(':');
            el.setAttribute(parts[0], t(parts[1]));
        });
        document.querySelectorAll('[data-lang]').forEach(function (b) {
            b.setAttribute('aria-pressed', String(b.dataset.lang === current));
        });
    }

    function setLang(lang) {
        if (lang === current) return;
        store('lang', lang);
        var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduce) { apply(lang); return; }
        document.body.classList.add('swapping');
        setTimeout(function () {
            apply(lang);
            document.body.classList.remove('swapping');
        }, 180);
    }

    document.querySelectorAll('[data-lang]').forEach(function (b) {
        b.addEventListener('click', function () { setLang(b.dataset.lang); });
    });

    var saved = recall('lang');
    var browser = (navigator.language || 'en').slice(0, 2).toLowerCase();
    var initial = saved || (dict[browser] ? browser : 'en');
    if (initial !== 'en') apply(initial);

    /* ---------- Header + mobile menu ---------- */
    var header = document.querySelector('.site-header');
    function onScroll() { header.classList.toggle('scrolled', window.scrollY > 20); }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    var nav = document.getElementById('nav');
    var menuBtn = document.getElementById('menuToggle');
    function closeMenu() {
        nav.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
    }
    menuBtn.addEventListener('click', function () {
        var open = nav.classList.toggle('open');
        menuBtn.setAttribute('aria-expanded', String(open));
    });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) closeMenu(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
    document.addEventListener('click', function (e) {
        if (!nav.contains(e.target) && !menuBtn.contains(e.target)) closeMenu();
    });

    /* ---------- Reveal on scroll + active nav link ---------- */
    if ('IntersectionObserver' in window) {
        var revealer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in');
                    revealer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
        document.querySelectorAll('.reveal').forEach(function (el, i) {
            // Stagger siblings slightly so grids cascade in
            el.style.transitionDelay = (i % 4) * 70 + 'ms';
            revealer.observe(el);
        });

        var links = {};
        nav.querySelectorAll('a').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
        var spy = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                var link = links[entry.target.id];
                if (link && entry.isIntersecting) {
                    Object.keys(links).forEach(function (k) { links[k].classList.remove('active'); });
                    link.classList.add('active');
                }
            });
        }, { rootMargin: '-45% 0px -50% 0px' });
        document.querySelectorAll('main section[id]').forEach(function (s) { spy.observe(s); });
    } else {
        document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); });
    }

    /* ---------- Photo lightbox ---------- */
    var lightbox = document.getElementById('lightbox');
    if (lightbox && typeof lightbox.showModal === 'function') {
        var lbImg = lightbox.querySelector('img');
        var lbCap = lightbox.querySelector('.lb-cap');
        document.querySelectorAll('.shot').forEach(function (shot) {
            shot.addEventListener('click', function () {
                var img = shot.querySelector('img');
                lbImg.src = shot.dataset.full;
                lbImg.alt = img.alt;
                lbCap.textContent = shot.querySelector('.cap').textContent;
                lightbox.showModal();
            });
        });
        // Clicking the backdrop (or the photo) closes it too
        lightbox.addEventListener('click', function (e) {
            if (e.target === lightbox || e.target === lbImg) lightbox.close();
        });
    }

    /* ---------- Copy email ---------- */
    var copyBtn = document.getElementById('copyEmail');
    copyBtn.addEventListener('click', function () {
        var email = copyBtn.dataset.email;
        var done = function () {
            copyBtn.textContent = t('contact.copied');
            setTimeout(function () { copyBtn.textContent = t('contact.copy'); }, 1800);
        };
        if (navigator.clipboard) {
            navigator.clipboard.writeText(email).then(done, function () { window.location.href = 'mailto:' + email; });
        } else {
            window.location.href = 'mailto:' + email;
        }
    });
})();
