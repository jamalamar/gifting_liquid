/* ============================================
   Gifting Marketplace - Collage Effects
   Animations and visual effects for collage style
   ============================================ */

// Parallax effect on scroll (enhanced with depth layers)
class ParallaxEffect {
  constructor() {
    this.elements = document.querySelectorAll('[data-parallax-speed], .collage-deco, .collage-element--paper-airplane');
    this.init();
  }

  init() {
    if (this.elements.length === 0) return;
    window.addEventListener('scroll', () => {
      requestAnimationFrame(() => this.onScroll());
    }, { passive: true });
  }

  onScroll() {
    const scrollY = window.scrollY;
    this.elements.forEach((el, index) => {
      const speed = parseFloat(el.dataset.parallaxSpeed) || (0.05 + (index * 0.02));
      const yPos = scrollY * speed;
      el.style.transform = `translateY(${yPos}px)`;
    });
  }
}

// Random rotation on hover for collage cards
class CollageCardEffects {
  constructor() {
    this.cards = document.querySelectorAll('.collage-card, .collage-photo, .collage-polaroid');
    this.init();
  }

  init() {
    this.cards.forEach(card => {
      const originalTransform = window.getComputedStyle(card).transform;

      card.addEventListener('mouseenter', () => {
        const randomRotation = (Math.random() - 0.5) * 4;
        card.style.transition = 'transform 0.3s ease';
        card.style.transform = `${originalTransform === 'none' ? '' : originalTransform} rotate(${randomRotation}deg) translateY(-5px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = originalTransform;
      });
    });
  }
}

// Sticker bounce effect
class StickerEffects {
  constructor() {
    this.stickers = document.querySelectorAll('.collage-sticker');
    this.init();
  }

  init() {
    this.stickers.forEach(sticker => {
      sticker.addEventListener('mouseenter', () => {
        sticker.style.animation = 'stickerBounce 0.5s ease';
      });

      sticker.addEventListener('animationend', () => {
        sticker.style.animation = '';
      });
    });
  }
}

// Enhanced Scroll Animations with stagger support and text splitting
class ScrollAnimations {
  constructor() {
    this.sections = document.querySelectorAll('[data-animate]');
    this.legacyElements = document.querySelectorAll(
      '.collage-paper:not([data-animate] .collage-paper), .collage-card:not([data-animate] .collage-card), .step:not([data-animate] .step), .category-card:not([data-animate] .category-card), .benefit-card:not([data-animate] .benefit-card), .occasion-card:not([data-animate] .occasion-card)'
    );
    this.init();
  }

  init() {
    if (!('IntersectionObserver' in window)) {
      this.sections.forEach(el => el.classList.add('is-visible'));
      this.legacyElements.forEach(el => el.classList.add('is-visible'));
      return;
    }

    // Split hero headline text into words
    this.splitHeroText();

    // Observe animated sections
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            sectionObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    this.sections.forEach(el => sectionObserver.observe(el));

    // Legacy elements (non data-animate)
    const legacyObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            legacyObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    this.legacyElements.forEach(el => {
      el.classList.add('animate-on-scroll');
      legacyObserver.observe(el);
    });
  }

  splitHeroText() {
    const headlines = document.querySelectorAll('[data-split-text]');
    headlines.forEach(headline => {
      const text = headline.textContent.trim();
      const words = text.split(/\s+/);
      headline.innerHTML = words.map((word, i) =>
        `<span class="hero__word" style="--i:${i + 1}">${word}</span>`
      ).join(' ');
    });
  }
}

// Cursor follower for collage effect
class CursorFollower {
  constructor() {
    this.cursor = null;
    this.enabled = window.matchMedia('(min-width: 990px)').matches;
    this.init();
  }

  init() {
    if (!this.enabled) return;

    this.cursor = document.createElement('div');
    this.cursor.className = 'cursor-follower';
    this.cursor.innerHTML = '<span class="cursor-dot"></span>';
    document.body.appendChild(this.cursor);

    document.addEventListener('mousemove', (e) => {
      requestAnimationFrame(() => {
        this.cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      });
    });

    const interactiveElements = document.querySelectorAll('a, button, .collage-card, .product-card');
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', () => this.cursor.classList.add('is-hovering'));
      el.addEventListener('mouseleave', () => this.cursor.classList.remove('is-hovering'));
    });
  }
}

// Carousel for occasions
class Carousel {
  constructor(container) {
    this.container = container;
    this.track = container.querySelector('.occasions__track');
    this.prevBtn = container.querySelector('[data-carousel-prev]');
    this.nextBtn = container.querySelector('[data-carousel-next]');
    this.items = container.querySelectorAll('.occasion-card');
    this.init();
  }

  init() {
    if (!this.track || this.items.length === 0) return;
    this.prevBtn?.addEventListener('click', () => this.scroll('prev'));
    this.nextBtn?.addEventListener('click', () => this.scroll('next'));
  }

  scroll(direction) {
    const itemWidth = this.items[0].offsetWidth + 24;
    const scrollAmount = direction === 'next' ? itemWidth : -itemWidth;
    this.track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  }
}

// Add CSS for legacy animations
const style = document.createElement('style');
style.textContent = `
  .animate-on-scroll {
    opacity: 0;
    transform: translateY(30px);
    transition: opacity 0.6s ease, transform 0.6s ease;
  }

  .animate-on-scroll.is-visible {
    opacity: 1;
    transform: translateY(0);
  }

  @keyframes stickerBounce {
    0%, 100% { transform: rotate(-2deg) scale(1); }
    25% { transform: rotate(-2deg) scale(1.1); }
    50% { transform: rotate(-2deg) scale(0.95); }
    75% { transform: rotate(-2deg) scale(1.05); }
  }

  .cursor-follower {
    position: fixed;
    top: 0;
    left: 0;
    width: 20px;
    height: 20px;
    pointer-events: none;
    z-index: 9999;
    mix-blend-mode: difference;
    transition: width 0.2s ease, height 0.2s ease;
  }

  .cursor-dot {
    display: block;
    width: 100%;
    height: 100%;
    background: var(--color-accent);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    transition: transform 0.2s ease;
  }

  .cursor-follower.is-hovering {
    width: 40px;
    height: 40px;
  }

  .cursor-follower.is-hovering .cursor-dot {
    background: var(--color-primary);
  }

  @media (prefers-reduced-motion: reduce) {
    .animate-on-scroll {
      opacity: 1;
      transform: none;
      transition: none;
    }

    .cursor-follower {
      display: none;
    }
  }
`;
document.head.appendChild(style);

// Initialize all effects
document.addEventListener('DOMContentLoaded', () => {
  new ParallaxEffect();
  new CollageCardEffects();
  new StickerEffects();
  new ScrollAnimations();
  // new CursorFollower(); // Uncomment if you want custom cursor

  // Initialize carousels
  document.querySelectorAll('[data-carousel]').forEach(carousel => {
    new Carousel(carousel);
  });
});
