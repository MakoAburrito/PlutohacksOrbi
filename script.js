const dropdownMenus = document.querySelectorAll('.nav-dropdown, .archive-menu');
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

dropdownMenus.forEach((menu) => {
  const button = menu.querySelector('.dropdown-button, .archive-button');
  if (!button) return;

  button.addEventListener('click', (event) => {
    event.stopPropagation();
    const isOpen = menu.classList.contains('open');
    dropdownMenus.forEach((otherMenu) => {
      otherMenu.classList.remove('open');
      otherMenu.querySelector('.dropdown-button, .archive-button')?.setAttribute('aria-expanded', 'false');
    });
    menu.classList.toggle('open', !isOpen);
    button.setAttribute('aria-expanded', String(!isOpen));
  });
});

document.addEventListener('click', (event) => {
  dropdownMenus.forEach((menu) => {
    if (!menu.contains(event.target)) {
      menu.classList.remove('open');
      menu.querySelector('.dropdown-button, .archive-button')?.setAttribute('aria-expanded', 'false');
    }
  });
});


navToggle?.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

navLinks?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle?.setAttribute('aria-expanded', 'false');
  });
});

// Lightweight starfield. Keeps the HTML clean and is intentionally subtle.
const stars = document.querySelector('#stars');
if (stars) {
  const count = window.innerWidth < 700 ? 65 : 120;
  for (let i = 0; i < count; i += 1) {
    const star = document.createElement('span');
    star.className = 'star-dot';
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 100}%`;
    star.style.opacity = `${0.25 + Math.random() * 0.7}`;
    star.style.animationDelay = `${Math.random() * 4}s`;
    star.style.transform = `scale(${0.65 + Math.random() * 1.45})`;
    stars.appendChild(star);
  }
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));


// Horizontally scrollable yearly evolution timeline.
// New .year-card elements are discovered automatically, so future years only need HTML.
document.querySelectorAll('[data-evolution-carousel]').forEach((carousel) => {
  const track = carousel.querySelector('.evolution-track');
  const prev = carousel.querySelector('.evolution-prev');
  const next = carousel.querySelector('.evolution-next');
  const progress = carousel.querySelector('.evolution-progress-bar');
  if (!track) return;

  const cardStep = () => {
    const card = track.querySelector('.year-card');
    if (!card) return Math.max(track.clientWidth * 0.8, 280);
    const gap = parseFloat(getComputedStyle(track).gap) || 24;
    return card.getBoundingClientRect().width + gap;
  };

  const updateEvolutionUI = () => {
    const maxScroll = Math.max(track.scrollWidth - track.clientWidth, 0);
    const position = Math.min(Math.max(track.scrollLeft, 0), maxScroll);
    const percent = maxScroll ? (position / maxScroll) * 100 : 100;
    if (progress) progress.style.width = `${percent}%`;
    if (prev) prev.disabled = position <= 2;
    if (next) next.disabled = position >= maxScroll - 2;
  };

  prev?.addEventListener('click', () => {
    track.scrollBy({ left: -cardStep(), behavior: 'smooth' });
  });

  next?.addEventListener('click', () => {
    track.scrollBy({ left: cardStep(), behavior: 'smooth' });
  });

  // Mouse-wheel users can move through the timeline without hunting for a scrollbar.
  track.addEventListener('wheel', (event) => {
    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
    const maxScroll = track.scrollWidth - track.clientWidth;
    if (maxScroll <= 0) return;
    const atStart = track.scrollLeft <= 0 && event.deltaY < 0;
    const atEnd = track.scrollLeft >= maxScroll - 1 && event.deltaY > 0;
    if (atStart || atEnd) return;
    event.preventDefault();
    track.scrollLeft += event.deltaY;
  }, { passive: false });

  // Click-and-drag on desktop; touch devices keep their native swipe behavior.
  let dragging = false;
  let startX = 0;
  let startScroll = 0;

  track.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'touch' || event.button !== 0) return;
    dragging = true;
    startX = event.clientX;
    startScroll = track.scrollLeft;
    track.classList.add('dragging');
    track.setPointerCapture?.(event.pointerId);
  });

  track.addEventListener('pointermove', (event) => {
    if (!dragging) return;
    track.scrollLeft = startScroll - (event.clientX - startX);
  });

  const stopDrag = (event) => {
    if (!dragging) return;
    dragging = false;
    track.classList.remove('dragging');
    if (event?.pointerId != null && track.hasPointerCapture?.(event.pointerId)) {
      track.releasePointerCapture(event.pointerId);
    }
  };

  track.addEventListener('pointerup', stopDrag);
  track.addEventListener('pointercancel', stopDrag);
  track.addEventListener('scroll', updateEvolutionUI, { passive: true });
  window.addEventListener('resize', updateEvolutionUI);
  updateEvolutionUI();
});


// Full-size gallery viewer for both the About page and the dedicated gallery page.
// This intentionally mirrors the simple fixed-overlay approach used on the 2025 site
// instead of relying on the native <dialog> element.
const lightbox = document.querySelector('#image-lightbox');
const lightboxImage = lightbox?.querySelector('.lightbox-image');
const lightboxCaption = lightbox?.querySelector('.lightbox-caption');
const lightboxClose = lightbox?.querySelector('.lightbox-close');
let lastGalleryTrigger = null;

function openLightbox(button) {
  const image = button.querySelector('img');
  if (!lightbox || !image || !lightboxImage || !lightboxCaption) return;

  lastGalleryTrigger = button;
  lightboxImage.src = button.dataset.full || image.currentSrc || image.src;
  lightboxImage.alt = image.alt || '';
  lightboxCaption.textContent = button.dataset.caption || image.alt || '';

  lightbox.classList.add('is-open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.classList.add('lightbox-open');
  lightboxClose?.focus();
}

function closeLightbox() {
  if (!lightbox?.classList.contains('is-open')) return;

  lightbox.classList.remove('is-open');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('lightbox-open');

  if (lightboxImage) lightboxImage.src = '';
  lastGalleryTrigger?.focus();
}

document.querySelectorAll('.gallery-open').forEach((button) => {
  button.addEventListener('click', () => openLightbox(button));
});

lightboxClose?.addEventListener('click', closeLightbox);

// Clicking or tapping the dark area outside the image closes it.
lightbox?.addEventListener('click', (event) => {
  if (event.target === lightbox) closeLightbox();
});

// Escape works on desktop keyboards.
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && lightbox?.classList.contains('is-open')) {
    closeLightbox();
  }
});

// Orbi music player: mirrors the 2025 interaction, but is reusable on every page.
document.querySelectorAll('.orbi-music-player').forEach((player) => {
  const button = player.querySelector('.orbi-music-toggle');
  const waveGif = player.querySelector('.orbi-music-gif-wave');
  const snapGif = player.querySelector('.orbi-music-gif-snap');
  const audio = player.querySelector('.orbi-music-audio');
  const status = player.querySelector('.orbi-music-status');

  if (!button || !waveGif || !snapGif || !audio || !status) return;

  const setPlaying = (playing) => {
    button.setAttribute('aria-pressed', String(playing));
    button.setAttribute(
      'aria-label',
      playing
        ? 'Stop Ready, Set, Drift and switch Orbi animation'
        : 'Play Ready, Set, Drift and switch Orbi animation'
    );
    waveGif.hidden = playing;
    snapGif.hidden = !playing;
    status.textContent = playing ? 'Stop music' : 'Play music';
  };

  setPlaying(false);

  button.addEventListener('click', async () => {
    const isPlaying = button.getAttribute('aria-pressed') === 'true';

    if (isPlaying) {
      audio.pause();
      audio.currentTime = 0;
      setPlaying(false);
      return;
    }

    try {
      await audio.play();
      setPlaying(true);
    } catch (error) {
      // Browsers can block playback in unusual contexts; keep the UI truthful.
      setPlaying(false);
    }
  });

  audio.addEventListener('pause', () => {
    if (audio.currentTime === 0) setPlaying(false);
  });
});

// Footer half-circle back-to-top control.
document.querySelectorAll('.footer-back-to-top').forEach((button) => {
  button.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
    });
  });
});
