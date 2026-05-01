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
  img.addEventListener('error', function () {
    this.style.display = 'none';
  });
});
