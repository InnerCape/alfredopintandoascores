/* ================================================
   ALFRED PINTANDO AS CORES — main.js
   ================================================ */

/* ── 1. Mobile Menu Toggle ── */
function toggleMenu() {
  const menu = document.getElementById('mobileMenu');
  menu.classList.toggle('open');
  document.body.style.overflow = menu.classList.contains('open') ? 'hidden' : '';
}

/* ── 2. Sticky Nav Shrink on Scroll ── */
window.addEventListener('scroll', () => {
  document.getElementById('nav').classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

/* ── 3. Scroll Reveal (Intersection Observer) ── */
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObs.unobserve(e.target);
      
      // Lazy init gallery slider
      if (!baSlider.initialized && e.target.id === 'gallery') {
        baSlider.grid = document.getElementById('baGrid');
        if (baSlider.grid) {
          baSlider.cards = Array.from(baSlider.grid.querySelectorAll('.ba-card'));
          baSlider.prev = document.getElementById('baPrev');
          baSlider.next = document.getElementById('baNext');
          baSlider.pagination = document.getElementById('baPagination');
          baSlider.initialized = true;
          
          if (baSlider.prev) baSlider.prev.addEventListener('click', () => changeBaSlide(-1));
          if (baSlider.next) baSlider.next.addEventListener('click', () => {
            // Show all hidden cards on "Ver mais"
            baSlider.cards.forEach(card => card.classList.remove('hidden'));
            baSlider.next.style.display = 'none'; // Hide the button after showing all
            if (baSlider.pagination) baSlider.pagination.style.display = 'none';
          });
          window.addEventListener('resize', renderBaSlides, { passive: true });
          renderBaSlides();
        }
      }
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.fade-up').forEach(el => revealObs.observe(el));

/* ── 4. Smooth Scroll for all anchor links ── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ===== BEFORE & AFTER SLIDER ===== */
let baSlider = {
  grid: null,
  cards: [],
  prev: null,
  next: null,
  pagination: null,
  pageIndex: 0,
  initialized: false
};

function getBaItemsPerPage() {
  return window.matchMedia('(max-width: 900px)').matches ? 1 : 2;
}

function renderBaSlides() {
  if (!baSlider.cards.length || !baSlider.pagination) return;
  const perPage = getBaItemsPerPage();
  const pages = Math.max(1, Math.ceil(baCards.length / perPage));
  baSlider.pageIndex = Math.min(Math.max(baSlider.pageIndex, 0), pages - 1);

  baSlider.cards.forEach((card, index) => {
    const page = Math.floor(index / perPage);
    card.classList.toggle('hidden', page !== baPageIndex);
  });

  baPagination.innerHTML = '';
  for (let i = 0; i < pages; i += 1) {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = i === baPageIndex ? 'active' : '';
    dot.addEventListener('click', () => {
      baPageIndex = i;
      renderBaSlides();
    });
    baPagination.appendChild(dot);
  }

  if (baPrev) baPrev.disabled = baPageIndex === 0;
  if (baNext) baNext.disabled = baPageIndex === pages - 1;
}

function changeBaSlide(direction) {
  const perPage = getBaItemsPerPage();
  const pages = Math.max(1, Math.ceil(baCards.length / perPage));
  baPageIndex = Math.min(Math.max(baPageIndex + direction, 0), pages - 1);
  renderBaSlides();
}

/* Lazy init moved to revealObs for gallery section */

/* ===== BEFORE & AFTER IMAGE MODAL ===== */
const imageModal = document.getElementById('imageModal');
const imageModalImg = document.getElementById('imageModalImg');
const imageModalCaption = document.getElementById('imageModalCaption');
const imageModalClose = document.getElementById('imageModalClose');
const imageModalBackdrop = document.getElementById('imageModalBackdrop');
const imageModalPrev = document.getElementById('imageModalPrev');
const imageModalNext = document.getElementById('imageModalNext');

let currentImageIndex = -1;
let allImages = [];

function collectImages() {
  allImages = Array.from(document.querySelectorAll('.ba-side img'));
}

function openImageModal(index) {
  if (!imageModal || !imageModalImg || !imageModalCaption || index < 0 || index >= allImages.length) return;
  currentImageIndex = index;
  const img = allImages[index];
  imageModalImg.src = img.src;
  imageModalImg.alt = img.alt;
  imageModalCaption.textContent = img.alt || 'Imagem ampliada';
  imageModal.classList.add('open');
  document.body.style.overflow = 'hidden';
  updateNavButtons();
}

function closeImageModal() {
  if (!imageModal) return;
  imageModal.classList.remove('open');
  document.body.style.overflow = '';
  currentImageIndex = -1;
}

function updateNavButtons() {
  if (!imageModalPrev || !imageModalNext) return;
  imageModalPrev.style.display = currentImageIndex > 0 ? 'flex' : 'none';
  imageModalNext.style.display = currentImageIndex < allImages.length - 1 ? 'flex' : 'none';
}

function showPrevImage() {
  if (currentImageIndex > 0) {
    openImageModal(currentImageIndex - 1);
  }
}

function showNextImage() {
  if (currentImageIndex < allImages.length - 1) {
    openImageModal(currentImageIndex + 1);
  }
}

collectImages();

document.querySelectorAll('.ba-side img').forEach((img, index) => {
  img.addEventListener('click', () => {
    openImageModal(index);
  });
});

if (imageModalClose) {
  imageModalClose.addEventListener('click', closeImageModal);
}

if (imageModalBackdrop) {
  imageModalBackdrop.addEventListener('click', closeImageModal);
}

if (imageModalPrev) {
  imageModalPrev.addEventListener('click', showPrevImage);
}

if (imageModalNext) {
  imageModalNext.addEventListener('click', showNextImage);
}

document.addEventListener('keydown', (e) => {
  if (!imageModal.classList.contains('open')) return;
  if (e.key === 'Escape') {
    closeImageModal();
  } else if (e.key === 'ArrowLeft') {
    showPrevImage();
  } else if (e.key === 'ArrowRight') {
    showNextImage();
  }
});

/* ── 5. Contact Form → WhatsApp ── */
function handleForm(e) {
  e.preventDefault();

  const nome   = document.getElementById('nome').value.trim();
  const tel    = document.getElementById('telefone').value.trim();
  const serv   = document.getElementById('servico').value || 'Não informado';
  const msg    = document.getElementById('mensagem').value.trim() || 'Não informado';

  if (!nome || !tel) {
    alert('Por favor, preencha nome e telefone!');
    return;
  }

  const text = `Olá! Vim pelo site e gostaria de solicitar um orçamento. 😊\n\n*Nome:* ${nome}\n*Telefone:* ${tel}\n*Serviço:* ${serv}\n*Mensagem:* ${msg}`;

  window.open(
    `https://wa.me/5583996956060?text=${encodeURIComponent(text)}`,
    '_blank',
    'noopener,noreferrer'
  );

  document.getElementById('contactForm').reset();
}

/* ── 6. Graceful image error fallback ── */
document.querySelectorAll('img').forEach(img => {
  if (img.id === 'imageModalImg') return;
  img.addEventListener('error', function () {
    this.style.display = 'none';
  });
});
