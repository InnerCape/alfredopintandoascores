/* ================================================
   ALFRED PINTANDO AS CORES — main.js (fixed)
   ================================================ */

/* ── overflow lock counter (prevents menu/modal race) ── */
let _overflowLocks = 0;
let _touchBlocker = null;

function lockScroll() {
  if (++_overflowLocks === 1) {
    document.body.style.overflow = 'hidden';
    /* iOS Safari fix: block touchmove so page doesn't scroll behind modal */
    _touchBlocker = e => { if (e.cancelable) e.preventDefault(); };
    document.addEventListener('touchmove', _touchBlocker, { passive: false });
  }
}

function unlockScroll() {
  if (--_overflowLocks <= 0) {
    _overflowLocks = 0;
    document.body.style.overflow = '';
    if (_touchBlocker) {
      document.removeEventListener('touchmove', _touchBlocker, { passive: false });
      _touchBlocker = null;
    }
  }
}

/* ── 1. Mobile Menu ── */
function toggleMenu() {
  const menu = document.getElementById('mobileMenu');
  if (!menu) return;
  const isOpen = menu.classList.toggle('open');
  isOpen ? lockScroll() : unlockScroll();
}

/* close menu on outside click */
document.addEventListener('click', e => {
  const menu = document.getElementById('mobileMenu');
  const burger = document.querySelector('[onclick="toggleMenu()"]');
  if (menu?.classList.contains('open') && !menu.contains(e.target) && !burger?.contains(e.target)) {
    menu.classList.remove('open');
    unlockScroll();
  }
});

/* close menu when a nav link is clicked */
document.querySelectorAll('#mobileMenu a').forEach(a => {
  a.addEventListener('click', () => {
    const menu = document.getElementById('mobileMenu');
    if (menu?.classList.contains('open')) {
      menu.classList.remove('open');
      unlockScroll();
    }
  });
});

/* ── 2. Nav shrink on scroll ── */
window.addEventListener('scroll', () => {
  const nav = document.getElementById('nav');
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

/* ── 3. Scroll reveal ── */
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); revealObs.unobserve(e.target); }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

document.querySelectorAll('.fade-up').forEach(el => revealObs.observe(el));

/* ── 4. Smooth scroll (nav-height aware) ── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (!id || id === '#') return;
    const target = document.querySelector(id);
    if (target) {
      e.preventDefault();
      const navH = document.getElementById('nav')?.offsetHeight || 68;
      const top = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

/* ══ GALLERY ══ */
(function initGallery() {
  const grid    = document.getElementById('baGrid');
  const btnMore = document.getElementById('baNext');
  const btnLess = document.getElementById('baPrev');
  if (!grid || !btnMore) return;

  const SHOW_DEFAULT = 2;
  const cards = Array.from(grid.querySelectorAll('.ba-card'));

  function collapse() {
    cards.forEach((c, i) => c.classList.toggle('hidden', i >= SHOW_DEFAULT));
    btnMore.style.display = cards.length > SHOW_DEFAULT ? '' : 'none';
    if (btnLess) btnLess.style.display = 'none';
  }

  function expandAll() {
    cards.forEach(c => {
      c.classList.remove('hidden');
      if (!c.classList.contains('visible')) revealObs.observe(c);
    });
    btnMore.style.display = 'none';
    if (btnLess) btnLess.style.display = '';
    attachLightboxClicks();
  }

  collapse();
  btnMore.addEventListener('click', expandAll);
  if (btnLess) {
    btnLess.addEventListener('click', () => {
      collapse();
      const gallery = document.getElementById('gallery');
      if (gallery) {
        const navH = document.getElementById('nav')?.offsetHeight || 68;
        window.scrollTo({ top: gallery.offsetTop - navH, behavior: 'smooth' });
      }
    });
  }
})();

/* ══ LIGHTBOX ══ */
let _allImgs    = [];
let _currentIdx = -1;

function buildImgList() {
  _allImgs = Array.from(document.querySelectorAll('.ba-card:not(.hidden) .ba-side img'));
}

function openModal(idx) {
  buildImgList();
  const modal    = document.getElementById('imageModal');
  const modalImg = document.getElementById('imageModalImg');
  const caption  = document.getElementById('imageModalCaption');
  if (!modal || !modalImg || idx < 0 || idx >= _allImgs.length) return;
  _currentIdx = idx;
  modalImg.src = _allImgs[idx].src;
  modalImg.alt = _allImgs[idx].alt;
  if (caption) caption.textContent = _allImgs[idx].alt || '';
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  lockScroll();
  updateModalNav();
}

function closeModal() {
  const modal    = document.getElementById('imageModal');
  const modalImg = document.getElementById('imageModalImg');
  if (!modal) return;
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  /* FIX: force-reset counter so unlock always fires, even if
     openModal was called with an invalid index and lockScroll
     ran without a matching unlockScroll */
  _overflowLocks = 1;
  unlockScroll();
  _currentIdx = -1;
  if (modalImg) { modalImg.src = ''; modalImg.alt = ''; }
}

function updateModalNav() {
  const p = document.getElementById('imageModalPrev');
  const n = document.getElementById('imageModalNext');
  if (p) p.style.display = _currentIdx > 0                    ? 'flex' : 'none';
  if (n) n.style.display = _currentIdx < _allImgs.length - 1  ? 'flex' : 'none';
}

/* FIX: removed cloneNode approach — cloning detached img refs from
   _allImgs, causing indexOf() to return -1 and openModal(-1) to
   bail out without ever releasing the scroll lock.
   Now we bind directly on the img element using a data-attribute
   guard to prevent double-binding on repeated calls. */
function attachLightboxClicks() {
  document.querySelectorAll('.ba-card:not(.hidden) .ba-side img').forEach(img => {
    if (img.dataset.lightboxBound) return; /* skip already-bound images */
    img.dataset.lightboxBound = '1';
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', () => {
      buildImgList();
      const idx = _allImgs.indexOf(img);
      if (idx !== -1) openModal(idx);
    });
  });
  buildImgList();
}

(function initModal() {
  const btnClose = document.getElementById('imageModalClose');
  const backdrop = document.getElementById('imageModalBackdrop');
  const btnPrev  = document.getElementById('imageModalPrev');
  const btnNext  = document.getElementById('imageModalNext');
  if (btnClose) btnClose.addEventListener('click', closeModal);
  if (backdrop) backdrop.addEventListener('click', closeModal);
  if (btnPrev)  btnPrev.addEventListener('click', () => { if (_currentIdx > 0) openModal(_currentIdx - 1); });
  if (btnNext)  btnNext.addEventListener('click', () => { if (_currentIdx < _allImgs.length - 1) openModal(_currentIdx + 1); });
  document.addEventListener('keydown', e => {
    const modal = document.getElementById('imageModal');
    if (!modal?.classList.contains('open')) return;
    if (e.key === 'Escape')    closeModal();
    if (e.key === 'ArrowLeft'  && _currentIdx > 0)                   openModal(_currentIdx - 1);
    if (e.key === 'ArrowRight' && _currentIdx < _allImgs.length - 1) openModal(_currentIdx + 1);
  });
  attachLightboxClicks();
})();

/* ══ TOAST NOTIFICATION ══ */
let _toastTimer = null;

function showToast(type, title, message) {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.setAttribute('aria-live', 'polite');
    Object.assign(container.style, {
      position: 'fixed', bottom: '2rem', right: '1.5rem',
      zIndex: '9999', display: 'flex', flexDirection: 'column', gap: '10px'
    });
    document.body.appendChild(container);
  }

  const icons = {
    success: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="10" cy="10" r="8"/><path d="M6.5 10.5l2.5 2.5 4.5-5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    error:   '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="10" cy="10" r="8"/><path d="M7 13l6-6M13 13L7 7" stroke-linecap="round"/></svg>',
    warning: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M10 3L18 17H2L10 3z" stroke-linejoin="round"/><line x1="10" y1="9" x2="10" y2="13" stroke-linecap="round"/><circle cx="10" cy="15.5" r="0.8" fill="currentColor" stroke="none"/></svg>'
  };
  const colors = {
    success: { bg: '#0F6E56', icon: '#5DCAA5' },
    error:   { bg: '#7A1F1F', icon: '#F09595' },
    warning: { bg: '#633806', icon: '#FAC775' }
  };
  const c = colors[type] || colors.success;

  const toast = document.createElement('div');
  toast.innerHTML = `
    <div style="width:20px;height:20px;flex-shrink:0;color:${c.icon}">${icons[type]}</div>
    <div style="flex:1;min-width:0">
      <div style="font-weight:600;font-size:14px;color:#fff;margin-bottom:2px">${title}</div>
      <div style="font-size:13px;color:rgba(255,255,255,0.75);line-height:1.4">${message}</div>
    </div>
    <button aria-label="Fechar" style="background:none;border:none;cursor:pointer;color:rgba(255,255,255,0.5);padding:2px;line-height:1;font-size:18px;flex-shrink:0">&times;</button>
  `;
  Object.assign(toast.style, {
    display: 'flex', alignItems: 'flex-start', gap: '12px',
    background: c.bg, borderRadius: '10px', padding: '14px 16px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.35)', maxWidth: '340px', width: '100%',
    opacity: '0', transform: 'translateY(12px)',
    transition: 'opacity 0.28s ease, transform 0.28s ease'
  });

  toast.querySelector('button').addEventListener('click', () => dismissToast(toast));
  container.appendChild(toast);

  requestAnimationFrame(() => requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  }));

  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => dismissToast(toast), 5000);
}

function dismissToast(toast) {
  toast.style.opacity = '0';
  toast.style.transform = 'translateY(12px)';
  setTimeout(() => toast.remove(), 300);
}

/* ── 5. Contact form ── */
function handleForm(e) {
  e.preventDefault();
  const nome = document.getElementById('nome')?.value.trim();
  const tel  = document.getElementById('telefone')?.value.trim();

  if (!nome || !tel) {
    showToast('warning', 'Campos obrigatórios', 'Por favor preencha o seu nome e telefone.');
    return;
  }

  const btn = e.target.querySelector('button[type="submit"]');
  const originalText = btn?.textContent;
  if (btn) { btn.disabled = true; btn.textContent = 'A enviar…'; }

  fetch('https://formspree.io/f/xvzlknad', {
    method: 'POST',
    body: new FormData(document.getElementById('contactForm')),
    headers: { 'Accept': 'application/json' }
  })
  .then(r => r.json())
  .then(data => {
    if (data.ok) {
      showToast('success', 'Mensagem enviada!', 'Entraremos em contacto em breve. Obrigado!');
      document.getElementById('contactForm').reset();
    } else {
      showToast('error', 'Erro ao enviar', 'Tente novamente ou contacte-nos pelo WhatsApp.');
    }
  })
  .catch(() => {
    showToast('error', 'Sem ligação', 'Verifique a sua ligação ou contacte-nos pelo WhatsApp.');
  })
  .finally(() => {
    if (btn) { btn.disabled = false; btn.textContent = originalText; }
  });
}

/* ── 6. Image error fallback ── */
document.querySelectorAll('img').forEach(img => {
  if (img.id === 'imageModalImg') return;
  img.addEventListener('error', function () { this.style.display = 'none'; });
});