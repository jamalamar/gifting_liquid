/* ============================================
   Gifting Marketplace - Global JavaScript
   ============================================ */

// Utility Functions
const debounce = (fn, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

const trapFocus = (container, elementToFocus = container) => {
  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];

  container.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        lastFocusable.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        firstFocusable.focus();
        e.preventDefault();
      }
    }
  });

  elementToFocus.focus();
};

// Header Navigation
class Header {
  constructor() {
    this.header = document.querySelector('.header');
    this.menuToggle = document.querySelector('[data-menu-toggle]');
    this.menuClose = document.querySelector('[data-menu-close]');
    this.mobileMenu = document.querySelector('[data-mobile-menu]');
    this.searchToggle = document.querySelector('[data-search-toggle]');
    this.searchClose = document.querySelector('[data-search-close]');
    this.searchPanel = document.querySelector('[data-search-panel]');
    this.cartToggle = document.querySelector('[data-cart-toggle]');
    this.cartDrawer = document.querySelector('[data-cart-drawer]');
    this.cartDrawerClose = document.querySelectorAll('[data-cart-drawer-close]');

    this.init();
  }

  init() {
    // Mobile menu
    if (this.menuToggle && this.mobileMenu) {
      this.menuToggle.addEventListener('click', () => this.toggleMobileMenu());
      this.menuClose?.addEventListener('click', () => this.closeMobileMenu());
    }

    // Search
    if (this.searchToggle && this.searchPanel) {
      this.searchToggle.addEventListener('click', () => this.toggleSearch());
      this.searchClose?.addEventListener('click', () => this.closeSearch());
    }

    // Cart drawer
    if (this.cartToggle && this.cartDrawer) {
      this.cartToggle.addEventListener('click', () => this.toggleCartDrawer());
      this.cartDrawerClose.forEach(btn => {
        btn.addEventListener('click', () => this.closeCartDrawer());
      });
    }

    // Close on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeMobileMenu();
        this.closeSearch();
        this.closeCartDrawer();
      }
    });

    // Sticky header
    this.handleScroll();
    window.addEventListener('scroll', debounce(() => this.handleScroll(), 10));
  }

  toggleMobileMenu() {
    const isOpen = this.mobileMenu.classList.contains('is-open');
    if (isOpen) {
      this.closeMobileMenu();
    } else {
      this.mobileMenu.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      trapFocus(this.mobileMenu);
    }
  }

  closeMobileMenu() {
    this.mobileMenu?.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  toggleSearch() {
    const isOpen = this.searchPanel.classList.contains('is-open');
    if (isOpen) {
      this.closeSearch();
    } else {
      this.searchPanel.classList.add('is-open');
      this.searchPanel.querySelector('input')?.focus();
    }
  }

  closeSearch() {
    this.searchPanel?.classList.remove('is-open');
  }

  toggleCartDrawer() {
    const isHidden = this.cartDrawer.getAttribute('aria-hidden') === 'true';
    if (isHidden) {
      this.openCartDrawer();
    } else {
      this.closeCartDrawer();
    }
  }

  openCartDrawer() {
    this.cartDrawer?.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    trapFocus(this.cartDrawer);
  }

  closeCartDrawer() {
    this.cartDrawer?.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  handleScroll() {
    if (window.scrollY > 100) {
      this.header?.classList.add('is-scrolled');
    } else {
      this.header?.classList.remove('is-scrolled');
    }
  }
}

// Cart Functions
class Cart {
  constructor() {
    this.cartCount = document.querySelectorAll('[data-cart-count], [data-drawer-cart-count]');
    this.cartSubtotal = document.querySelectorAll('[data-cart-subtotal], [data-drawer-subtotal]');
    this.cartTotal = document.querySelectorAll('[data-cart-total]');

    this.init();
  }

  init() {
    // Quick add buttons
    document.querySelectorAll('[data-quick-add]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const productId = btn.dataset.productId;
        if (productId) {
          this.addToCart(productId, 1);
        }
      });
    });

    // Quantity buttons
    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-quantity-minus]')) {
        const input = e.target.closest('[data-quantity-minus]').parentElement.querySelector('input');
        if (input && parseInt(input.value) > 1) {
          input.value = parseInt(input.value) - 1;
          this.updateQuantity(input);
        }
      }
      if (e.target.closest('[data-quantity-plus]')) {
        const input = e.target.closest('[data-quantity-plus]').parentElement.querySelector('input');
        if (input) {
          input.value = parseInt(input.value) + 1;
          this.updateQuantity(input);
        }
      }
      if (e.target.closest('[data-remove-item]')) {
        const key = e.target.closest('[data-remove-item]').dataset.key;
        if (key) {
          this.removeFromCart(key);
        }
      }
    });

    // Add to cart form
    document.querySelectorAll('[data-product-form]').forEach(form => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        this.addToCart(formData.get('id'), formData.get('quantity') || 1);
      });
    });
  }

  async addToCart(id, quantity = 1) {
    try {
      const response = await fetch(window.routes.cart_add_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          id: parseInt(id),
          quantity: parseInt(quantity)
        })
      });

      if (!response.ok) throw new Error('Error adding to cart');

      const data = await response.json();
      this.updateCartUI();
      this.showAddedMessage();

      // Open cart drawer
      const cartDrawer = document.querySelector('[data-cart-drawer]');
      if (cartDrawer) {
        cartDrawer.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
      }

    } catch (error) {
      console.error('Add to cart error:', error);
    }
  }

  async updateQuantity(input) {
    const key = input.dataset.key;
    if (!key) return;

    try {
      const response = await fetch(window.routes.cart_change_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          id: key,
          quantity: parseInt(input.value)
        })
      });

      if (!response.ok) throw new Error('Error updating cart');

      this.updateCartUI();

    } catch (error) {
      console.error('Update cart error:', error);
    }
  }

  async removeFromCart(key) {
    try {
      const response = await fetch(window.routes.cart_change_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          id: key,
          quantity: 0
        })
      });

      if (!response.ok) throw new Error('Error removing from cart');

      this.updateCartUI();

    } catch (error) {
      console.error('Remove from cart error:', error);
    }
  }

  async updateCartUI() {
    try {
      const response = await fetch('/cart.js');
      const cart = await response.json();

      // Update count
      this.cartCount.forEach(el => {
        el.textContent = cart.item_count;
      });

      // Update totals
      const formattedTotal = this.formatMoney(cart.total_price);
      this.cartSubtotal.forEach(el => {
        el.textContent = formattedTotal;
      });
      this.cartTotal.forEach(el => {
        el.textContent = formattedTotal;
      });

      // Refresh cart drawer content
      const drawerBody = document.querySelector('[data-cart-drawer-body]');
      if (drawerBody) {
        const cartResponse = await fetch('/?section_id=cart-drawer-items');
        // You would need to create this section or refresh the drawer content
      }

    } catch (error) {
      console.error('Update cart UI error:', error);
    }
  }

  formatMoney(cents) {
    return '$' + (cents / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' MXN';
  }

  showAddedMessage() {
    const message = document.querySelector('[data-add-message]');
    if (message) {
      message.textContent = '¡Listo! Ya esta en tu caja de regalo';
      message.classList.add('is-visible');
      setTimeout(() => {
        message.classList.remove('is-visible');
      }, 3000);
    }
  }
}

// Product Variant Selector
class ProductForm {
  constructor(container) {
    this.container = container;
    this.productJson = JSON.parse(container.querySelector('[data-product-json]')?.textContent || '{}');
    this.variantInput = container.querySelector('[data-variant-id]');
    this.optionSelectors = container.querySelectorAll('[data-option-selector]');
    this.mainImage = container.querySelector('[data-main-image]');
    this.thumbnails = container.querySelectorAll('[data-thumbnail]');

    this.init();
  }

  init() {
    if (!this.productJson.variants) return;

    // Option changes
    this.optionSelectors.forEach(selector => {
      selector.addEventListener('change', () => this.onVariantChange());
    });

    // Thumbnails
    this.thumbnails.forEach(thumb => {
      thumb.addEventListener('click', () => {
        const src = thumb.dataset.src;
        if (src && this.mainImage) {
          this.mainImage.src = src;
          this.thumbnails.forEach(t => t.classList.remove('is-active'));
          thumb.classList.add('is-active');
        }
      });
    });
  }

  onVariantChange() {
    const selectedOptions = [];
    this.optionSelectors.forEach(selector => {
      if (selector.checked) {
        selectedOptions.push(selector.value);
      }
    });

    const variant = this.productJson.variants.find(v => {
      return JSON.stringify(v.options) === JSON.stringify(selectedOptions);
    });

    if (variant && this.variantInput) {
      this.variantInput.value = variant.id;

      // Update radio styles
      this.optionSelectors.forEach(selector => {
        const label = selector.closest('.collage-radio');
        if (label) {
          label.classList.toggle('is-selected', selector.checked);
        }
      });
    }
  }
}

// Newsletter Popup
class NewsletterPopup {
  constructor() {
    this.popup = document.querySelector('[data-newsletter-popup]');
    this.closeButtons = document.querySelectorAll('[data-newsletter-popup-close]');

    this.init();
  }

  init() {
    if (!this.popup) return;

    // Check if already shown
    const hasShown = sessionStorage.getItem('newsletter-popup-shown');
    if (hasShown) return;

    // Show after delay
    setTimeout(() => {
      this.show();
    }, 5000);

    // Close handlers
    this.closeButtons.forEach(btn => {
      btn.addEventListener('click', () => this.hide());
    });

    // Form submission
    const form = this.popup.querySelector('form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        // Handle newsletter signup
        const message = this.popup.querySelector('[data-popup-newsletter-message]');
        if (message) {
          message.textContent = '¡Gracias! Revisa tu email para tu descuento.';
          message.classList.add('is-visible');
        }
        setTimeout(() => this.hide(), 3000);
      });
    }
  }

  show() {
    this.popup.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    sessionStorage.setItem('newsletter-popup-shown', 'true');
  }

  hide() {
    this.popup.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
}

// Collection Filters
class CollectionFilters {
  constructor() {
    this.filterToggle = document.querySelector('[data-filter-toggle]');
    this.filterSidebar = document.querySelector('[data-filter-sidebar]');
    this.filterCloseButtons = document.querySelectorAll('[data-filter-close]');
    this.sortSelect = document.querySelector('[data-sort-select]');

    this.init();
  }

  init() {
    // Filter drawer toggle
    if (this.filterToggle && this.filterSidebar) {
      this.filterToggle.addEventListener('click', () => this.openFilters());

      this.filterCloseButtons.forEach(btn => {
        btn.addEventListener('click', () => this.closeFilters());
      });

      // Close on escape
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.closeFilters();
        }
      });
    }

    // Sort select
    if (this.sortSelect) {
      this.sortSelect.addEventListener('change', () => {
        const url = new URL(window.location.href);
        url.searchParams.set('sort_by', this.sortSelect.value);
        window.location.href = url.toString();
      });
    }

    // Filter group toggles
    document.querySelectorAll('[data-filter-toggle-group]').forEach(toggle => {
      toggle.addEventListener('click', () => {
        const group = toggle.closest('[data-filter-group]');
        if (group) {
          group.classList.toggle('is-open');
          const isOpen = group.classList.contains('is-open');
          toggle.setAttribute('aria-expanded', isOpen);
        }
      });
    });

    // Filter checkboxes
    document.querySelectorAll('[data-filter-checkbox]').forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        this.applyFilters();
      });
    });

    // Price range inputs
    const priceInputs = document.querySelectorAll('[data-filter-price-min], [data-filter-price-max]');
    priceInputs.forEach(input => {
      input.addEventListener('change', debounce(() => {
        this.applyFilters();
      }, 500));
    });
  }

  openFilters() {
    this.filterSidebar.setAttribute('aria-hidden', 'false');
    this.filterToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    trapFocus(this.filterSidebar);
  }

  closeFilters() {
    this.filterSidebar?.setAttribute('aria-hidden', 'true');
    this.filterToggle?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  applyFilters() {
    const url = new URL(window.location.href);

    // Clear existing filter params
    const filterParams = Array.from(url.searchParams.keys()).filter(key =>
      key.startsWith('filter.')
    );
    filterParams.forEach(param => url.searchParams.delete(param));

    // Add checked filters
    document.querySelectorAll('[data-filter-checkbox]:checked').forEach(checkbox => {
      url.searchParams.append(checkbox.name, checkbox.value);
    });

    // Add price range
    const minPrice = document.querySelector('[data-filter-price-min]');
    const maxPrice = document.querySelector('[data-filter-price-max]');
    if (minPrice?.value) {
      url.searchParams.set(minPrice.name, minPrice.value * 100);
    }
    if (maxPrice?.value) {
      url.searchParams.set(maxPrice.name, maxPrice.value * 100);
    }

    window.location.href = url.toString();
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  new Header();
  new Cart();
  new NewsletterPopup();
  new CollectionFilters();

  // Product forms
  document.querySelectorAll('.product').forEach(container => {
    new ProductForm(container);
  });
});
