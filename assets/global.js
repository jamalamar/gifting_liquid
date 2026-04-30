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

    // Quantity buttons (cart page)
    document.addEventListener('click', (e) => {
      // Cart page quantity buttons
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
          const newVal = parseInt(input.value) + 1;
          const max = input.hasAttribute('max') ? parseInt(input.max) : Infinity;
          if (newVal <= max) {
            input.value = newVal;
            this.updateQuantity(input);
          }
        }
      }

      // Cart drawer quantity buttons
      if (e.target.closest('[data-drawer-qty-minus]')) {
        const btn = e.target.closest('[data-drawer-qty-minus]');
        const key = btn.dataset.key;
        if (key) {
          this.changeDrawerQuantity(key, -1);
        }
      }
      if (e.target.closest('[data-drawer-qty-plus]')) {
        const btn = e.target.closest('[data-drawer-qty-plus]');
        const key = btn.dataset.key;
        if (key) {
          this.changeDrawerQuantity(key, 1);
        }
      }

      // Remove buttons (both cart page and drawer)
      if (e.target.closest('[data-remove-item]')) {
        const key = e.target.closest('[data-remove-item]').dataset.key;
        if (key) {
          this.removeFromCart(key);
        }
      }
      if (e.target.closest('[data-drawer-remove-item]')) {
        const key = e.target.closest('[data-drawer-remove-item]').dataset.key;
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
        const submitBtn = form.querySelector('[data-add-to-cart]');
        this.addToCart(formData.get('id'), formData.get('quantity') || 1, submitBtn, form);
      });
    });

    // Cart note textarea - save on blur with debounce
    const cartNoteTextarea = document.querySelector('.cart-page__gift-textarea');
    if (cartNoteTextarea) {
      let noteTimeout;
      cartNoteTextarea.addEventListener('input', () => {
        clearTimeout(noteTimeout);
        noteTimeout = setTimeout(() => {
          this.saveCartNote(cartNoteTextarea.value);
        }, 500);
      });
      cartNoteTextarea.addEventListener('blur', () => {
        clearTimeout(noteTimeout);
        this.saveCartNote(cartNoteTextarea.value);
      });
    }

  }

  async saveCartNote(note) {
    try {
      await fetch('/cart/update.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ note })
      });
    } catch (error) {
      console.error('Error saving cart note:', error);
    }
  }

  async addToCart(id, quantity = 1, submitBtn = null, form = null) {
    // Add loading state
    if (submitBtn) {
      submitBtn.classList.add('is-loading');
      submitBtn.disabled = true;
    }

    try {
      // Add unique instance ID so same product can be added as separate line items
      // This allows assigning the same product to different gift boxes
      const instanceId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const response = await fetch(window.routes.cart_add_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          id: parseInt(id),
          quantity: parseInt(quantity),
          properties: {
            _instance_id: instanceId
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.description || 'Error adding to cart');
      }

      const data = await response.json();
      this.updateCartUI();
      this.showAddedMessage(form);

      // Open cart drawer
      const cartDrawer = document.querySelector('[data-cart-drawer]');
      if (cartDrawer) {
        cartDrawer.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
      }

    } catch (error) {
      console.error('Add to cart error:', error);
      this.showErrorMessage(form, error.message);
    } finally {
      // Remove loading state
      if (submitBtn) {
        submitBtn.classList.remove('is-loading');
        submitBtn.disabled = false;
      }
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
      this.refreshCartDrawer();

    } catch (error) {
      console.error('Remove from cart error:', error);
    }
  }

  async changeDrawerQuantity(key, delta) {
    // Get current quantity from the drawer item
    const item = document.querySelector(`[data-cart-drawer-item][data-key="${key}"]`);
    const qtyValue = item?.querySelector('[data-drawer-qty-value]');
    if (!qtyValue) return;

    const currentQty = parseInt(qtyValue.textContent) || 1;
    const newQty = Math.max(0, currentQty + delta);

    if (newQty === 0) {
      this.removeFromCart(key);
      return;
    }

    try {
      const response = await fetch(window.routes.cart_change_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          id: key,
          quantity: newQty
        })
      });

      if (!response.ok) throw new Error('Error updating cart');

      // Update the quantity display immediately
      qtyValue.textContent = newQty;

      this.updateCartUI();

    } catch (error) {
      console.error('Update cart error:', error);
    }
  }

  async refreshCartDrawer() {
    // Reload the page if we're on the cart page to refresh items
    if (window.location.pathname === '/cart') {
      window.location.reload();
      return;
    }

    // For drawer, we'll just close it if empty
    try {
      const response = await fetch('/cart.js');
      const cart = await response.json();

      if (cart.item_count === 0) {
        // Reload to show empty state in drawer
        window.location.reload();
      }
    } catch (error) {
      console.error('Refresh cart error:', error);
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
      this.renderCartDrawerItems(cart);

    } catch (error) {
      console.error('Update cart UI error:', error);
    }
  }

  renderCartDrawerItems(cart) {
    const drawerPanel = document.querySelector('.cart-drawer__panel');
    const drawerBody = document.querySelector('[data-cart-drawer-body]');
    if (!drawerBody || !drawerPanel) return;

    // Remove existing footer if any
    const existingFooter = drawerPanel.querySelector('.cart-drawer__footer');
    if (existingFooter) existingFooter.remove();

    if (cart.item_count === 0) {
      // Show empty state
      drawerBody.innerHTML = `
        <div class="cart-drawer__empty">
          <div class="cart-drawer__empty-icon">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
          </div>
          <p class="cart-drawer__empty-title">Tu carrito esta vacio</p>
          <p class="cart-drawer__empty-text">Explora nuestros productos y encuentra el regalo perfecto.</p>
          <a href="/collections/catalogo" class="btn btn--secondary cart-drawer__empty-btn" data-cart-drawer-close>
            Ver productos
          </a>
        </div>
      `;
      // Notify gift box manager of empty cart
      if (window.giftBoxManager) {
        window.giftBoxManager.renderAfterCartUpdate(cart);
      }
      return;
    }

    // Check if item is a gift box product
    const isGiftBoxProduct = (item) => {
      return item.properties && item.properties._is_gift_box === 'true';
    };

    // Build items HTML
    const itemsHtml = cart.items.map(item => {
      const hasVariant = item.variant_title && item.variant_title !== 'Default Title';
      const imageUrl = item.image ? this.getSizedImageUrl(item.image, '150x') : null;
      const isGiftBox = isGiftBoxProduct(item);

      // Gift box products don't show quantity controls or box assignment
      if (isGiftBox) {
        return `
          <div class="cart-drawer__item cart-drawer__item--box-product" data-cart-drawer-item data-key="${item.key}" data-is-box-product>
            <div class="cart-drawer__item-image">
              ${imageUrl ? `
                <a href="${item.url}">
                  <img src="${imageUrl}" alt="${item.title}" width="70" height="70" loading="lazy">
                </a>
              ` : `
                <div class="cart-drawer__item-placeholder">
                  <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M12 8v13m0-13V6a4 4 0 00-4-4H6a4 4 0 00-4 4v2h10zm0 0V6a4 4 0 014-4h2a4 4 0 014 4v2H12z"/>
                  </svg>
                </div>
              `}
            </div>
            <div class="cart-drawer__item-info">
              <h3 class="cart-drawer__item-title">
                <a href="${item.url}">${item.product_title}</a>
              </h3>
              ${hasVariant ? `<p class="cart-drawer__item-variant">${item.variant_title}</p>` : ''}
            </div>
          </div>
        `;
      }

      return `
        <div class="cart-drawer__item" data-cart-drawer-item data-key="${item.key}">
          <div class="cart-drawer__item-image">
            ${imageUrl ? `
              <a href="${item.url}">
                <img src="${imageUrl}" alt="${item.title}" width="70" height="70" loading="lazy">
              </a>
            ` : `
              <div class="cart-drawer__item-placeholder">
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M12 8v13m0-13V6a4 4 0 00-4-4H6a4 4 0 00-4 4v2h10zm0 0V6a4 4 0 014-4h2a4 4 0 014 4v2H12z"/>
                </svg>
              </div>
            `}
          </div>
          <div class="cart-drawer__item-info">
            <h3 class="cart-drawer__item-title">
              <a href="${item.url}">${item.product_title}</a>
            </h3>
            ${hasVariant ? `<p class="cart-drawer__item-variant">${item.variant_title}</p>` : ''}
            <div class="cart-drawer__qty-group">
              <button type="button" class="cart-drawer__qty-btn" data-drawer-qty-minus data-key="${item.key}" aria-label="Disminuir cantidad">
                <span>−</span>
              </button>
              <span class="cart-drawer__qty-value" data-drawer-qty-value>${item.quantity}</span>
              <button type="button" class="cart-drawer__qty-btn" data-drawer-qty-plus data-key="${item.key}" aria-label="Aumentar cantidad">
                <span>+</span>
              </button>
            </div>
            <div class="cart-drawer__item-box-assign">
              <div class="cart-item-box-dropdown" data-box-dropdown-container data-item-key="${item.key}">
                <select class="cart-item-box-dropdown__select collage-select" data-box-select data-item-key="${item.key}">
                  <option value="">Seleccionar caja...</option>
                </select>
              </div>
            </div>
          </div>
          <div class="cart-drawer__item-price">
            ${item.original_line_price !== item.final_line_price ? `
              <span class="cart-drawer__item-price-compare">${this.formatMoney(item.original_line_price)}</span>
            ` : ''}
            <span class="cart-drawer__item-price-current">${this.formatMoney(item.final_line_price)}</span>
          </div>
          <button type="button" class="cart-drawer__item-remove" data-drawer-remove-item data-key="${item.key}" aria-label="Eliminar ${item.product_title}">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      `;
    }).join('');

    // Build gift box selector HTML
    const giftBoxSelectorHtml = this.buildGiftBoxSelector(cart);

    drawerBody.innerHTML = `
      ${giftBoxSelectorHtml}
      <div class="cart-drawer__items">${itemsHtml}</div>
    `;

    // Build and append footer
    const footerHtml = this.buildCartDrawerFooter(cart);
    drawerPanel.insertAdjacentHTML('beforeend', footerHtml);

    // Notify gift box manager of cart update
    if (window.giftBoxManager) {
      window.giftBoxManager.renderAfterCartUpdate(cart);
    }
  }

  buildGiftBoxSelector(cart) {
    // Check if we have box products data
    const boxProductsData = document.querySelector('[data-box-products]');
    if (!boxProductsData) return '';

    // Count regular items (not gift boxes)
    const regularItemCount = cart.items
      .filter(item => !(item.properties && item.properties._is_gift_box === 'true'))
      .reduce((sum, item) => sum + item.quantity, 0);

    if (regularItemCount === 0) return '';

    return `
      <div class="gift-box-selector" data-gift-box-selector>
        <div class="gift-box-selector__header">
          <svg class="gift-box-selector__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M12 8v13m0-13V6a4 4 0 00-4-4H6a4 4 0 00-4 4v2h10zm0 0V6a4 4 0 014-4h2a4 4 0 014 4v2H12z"/>
            <rect x="2" y="8" width="20" height="13" rx="2"/>
          </svg>
          <h3 class="gift-box-selector__title">Selecciona tus cajas de regalo</h3>
          <p class="gift-box-selector__subtitle">Cada caja puede contener hasta 6 productos - incluida gratis</p>
        </div>

        <div class="gift-box-selector__boxes" data-box-selectors-container>
        </div>

        <div class="gift-box-selector__validation" data-box-validation hidden>
          <p class="gift-box-selector__error" data-box-error></p>
        </div>
      </div>
    `;
  }

  buildCartDrawerFooter(cart) {
    const cartDrawer = document.querySelector('[data-cart-drawer]');
    const threshold = parseInt(cartDrawer?.dataset.freeShippingThreshold || '0') * 100;
    const remaining = threshold - cart.total_price;
    const progress = threshold > 0 ? Math.min(100, (cart.total_price / threshold) * 100) : 0;

    let shippingHtml = '';
    if (threshold > 0) {
      if (remaining > 0) {
        shippingHtml = `
          <div class="cart-drawer__shipping">
            <p class="cart-drawer__shipping-text">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16">
                <path d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"/>
              </svg>
              <span>Te faltan <strong>${this.formatMoney(remaining)}</strong> para envio gratis</span>
            </p>
            <div class="cart-drawer__shipping-bar">
              <div class="cart-drawer__shipping-progress" style="width: ${progress}%"></div>
            </div>
          </div>
        `;
      } else {
        shippingHtml = `
          <div class="cart-drawer__shipping">
            <p class="cart-drawer__shipping-text cart-drawer__shipping-text--free">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                <path d="M5 13l4 4L19 7"/>
              </svg>
              <span>Tienes envio gratis</span>
            </p>
            <div class="cart-drawer__shipping-bar">
              <div class="cart-drawer__shipping-progress" style="width: 100%"></div>
            </div>
          </div>
        `;
      }
    }

    const cartUrl = window.routes?.cart_url || '/cart';

    return `
      <div class="cart-drawer__footer">
        ${shippingHtml}
        <div class="cart-drawer__subtotal">
          <span>Subtotal</span>
          <span data-drawer-subtotal>${this.formatMoney(cart.total_price)}</span>
        </div>
        <a href="${cartUrl}" class="btn btn--primary cart-drawer__continue-to-cart">
          Continuar al carrito
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
            <path d="M14 5l7 7m0 0l-7 7m7-7H3"/>
          </svg>
        </a>
      </div>
    `;
  }

  getSizedImageUrl(url, size) {
    if (!url) return null;
    // Handle Shopify CDN URLs
    if (url.includes('cdn.shopify.com')) {
      return url.replace(/(_\d+x\d+)?(\.[^.]+)$/, `_${size}$2`);
    }
    return url;
  }


  formatMoney(cents) {
    return '$' + (cents / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' MXN';
  }

  showAddedMessage(form = null) {
    const message = form ? form.querySelector('[data-add-message]') : document.querySelector('[data-add-message]');
    if (message) {
      message.textContent = '¡Listo! Agregado al carrito';
      message.classList.remove('is-error');
      message.classList.add('is-visible');
      setTimeout(() => {
        message.classList.remove('is-visible');
      }, 3000);
    }
  }

  showErrorMessage(form = null, errorText = 'Error al agregar al carrito') {
    const message = form ? form.querySelector('[data-add-message]') : document.querySelector('[data-add-message]');
    if (message) {
      message.textContent = errorText;
      message.classList.add('is-visible', 'is-error');
      setTimeout(() => {
        message.classList.remove('is-visible', 'is-error');
      }, 5000);
    }
  }
}

// Product Variant Selector
class ProductForm {
  constructor(container) {
    this.container = container;
    this.productJson = JSON.parse(container.querySelector('[data-product-json]')?.textContent || '{}');
    this.inventoryData = JSON.parse(container.querySelector('[data-variant-inventory]')?.textContent || '{}');
    this.variantInput = container.querySelector('[data-variant-id]');
    this.optionSelectors = container.querySelectorAll('[data-option-selector]');
    this.mainImage = container.querySelector('[data-main-image]');
    this.thumbnails = container.querySelectorAll('[data-thumbnail]');
    this.priceCurrent = container.querySelector('.product-page__price-current');
    this.priceCompare = container.querySelector('.product-page__price-compare');
    this.addToCartBtn = container.querySelector('[data-add-to-cart]');
    this.soldoutBadge = container.querySelector('.product-page__badge--soldout');
    this.saleBadge = container.querySelector('.product-page__badge--sale');
    this.stockDisplay = container.querySelector('[data-stock-display]');
    this.quantityInput = container.querySelector('[data-quantity-input]');
    this.selectedOptions = {};

    this.init();
  }

  init() {
    if (!this.productJson.variants) return;

    // Initialize selected options from current state
    this.optionSelectors.forEach(selector => {
      if (selector.classList.contains('is-selected')) {
        const optionName = selector.dataset.optionName;
        const optionValue = selector.dataset.optionValue;
        if (optionName && optionValue) {
          this.selectedOptions[optionName] = optionValue;
        }
      }
    });

    // Option button clicks
    this.optionSelectors.forEach(selector => {
      selector.addEventListener('click', (e) => {
        e.preventDefault();
        this.onOptionClick(selector);
      });
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

  onOptionClick(selector) {
    const optionName = selector.dataset.optionName;
    const optionValue = selector.dataset.optionValue;

    if (!optionName || !optionValue) return;

    // Update selected options
    this.selectedOptions[optionName] = optionValue;

    // Update button states for this option group
    const optionGroup = selector.closest('.product-page__option-values');
    if (optionGroup) {
      optionGroup.querySelectorAll('[data-option-selector]').forEach(btn => {
        const isSelected = btn.dataset.optionValue === optionValue;
        btn.classList.toggle('is-selected', isSelected);
        btn.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
      });
    }

    // Find matching variant
    this.updateVariant();
  }

  updateVariant() {
    // Build options array in order
    const optionNames = this.productJson.options || [];
    const selectedOptionsArray = optionNames.map(name => this.selectedOptions[name]);

    // Find variant that matches all selected options
    const variant = this.productJson.variants.find(v => {
      return JSON.stringify(v.options) === JSON.stringify(selectedOptionsArray);
    });

    if (!variant) return;

    if (this.variantInput) {
      this.variantInput.value = variant.id;
    }

    // Update variant image
    if (variant.featured_image && this.mainImage) {
      this.mainImage.src = variant.featured_image.src;
      // Sync active thumbnail
      this.thumbnails.forEach(t => {
        t.classList.toggle('is-active', t.dataset.src === variant.featured_image.src);
      });
    }

    // Update price
    if (this.priceCurrent) {
      this.priceCurrent.textContent = this.formatMoney(variant.price);
    }
    if (this.priceCompare) {
      if (variant.compare_at_price && variant.compare_at_price > variant.price) {
        this.priceCompare.textContent = this.formatMoney(variant.compare_at_price);
        this.priceCompare.style.display = '';
      } else {
        this.priceCompare.textContent = '';
        this.priceCompare.style.display = 'none';
      }
    }

    // Update sale badge
    if (this.saleBadge) {
      if (variant.compare_at_price && variant.compare_at_price > variant.price) {
        const discount = Math.round((variant.compare_at_price - variant.price) / variant.compare_at_price * 100);
        this.saleBadge.textContent = `-${discount}%`;
        this.saleBadge.style.display = '';
      } else {
        this.saleBadge.style.display = 'none';
      }
    }

    // Update add-to-cart button and soldout badge
    if (this.addToCartBtn) {
      const btnText = this.addToCartBtn.querySelector('.product-page__add-btn-text');
      if (variant.available) {
        this.addToCartBtn.disabled = false;
        if (btnText) {
          btnText.innerHTML = `<svg class="icon icon-cart" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg> <span>Agregar a Carrito</span>`;
        }
        if (this.soldoutBadge) this.soldoutBadge.style.display = 'none';
      } else {
        this.addToCartBtn.disabled = true;
        if (btnText) {
          btnText.innerHTML = '<span>Agotado</span>';
        }
        if (this.soldoutBadge) this.soldoutBadge.style.display = '';
      }
    }

    // Look up inventory from Liquid-generated data (not available in product JSON)
    const inventory = this.inventoryData[variant.id] || {};
    const invQty = inventory.inventory_quantity || 0;
    const invManaged = inventory.inventory_management === 'shopify';

    // Update stock display
    if (this.stockDisplay) {
      if (invManaged) {
        this.stockDisplay.style.display = '';
        if (invQty > 0) {
          this.stockDisplay.textContent = `${invQty} en stock`;
          this.stockDisplay.classList.remove('product-page__stock--out');
        } else {
          this.stockDisplay.textContent = 'Agotado';
          this.stockDisplay.classList.add('product-page__stock--out');
        }
      } else {
        this.stockDisplay.style.display = 'none';
      }
    }

    // Update quantity max
    if (this.quantityInput) {
      if (invManaged && invQty > 0) {
        this.quantityInput.max = invQty;
        if (parseInt(this.quantityInput.value) > invQty) {
          this.quantityInput.value = invQty;
        }
      } else {
        this.quantityInput.removeAttribute('max');
      }
      // Reset to 1 on variant change
      this.quantityInput.value = 1;
    }
  }

  formatMoney(cents) {
    return '$' + (cents / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' MXN';
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

// Collection AJAX Filters, Search & Pagination
class CollectionFilters {
  constructor() {
    this.section = document.querySelector('[data-ajax-collection]');
    if (!this.section) return;

    this.sectionId = this.section.dataset.sectionId;
    this.collectionUrl = this.section.dataset.collectionUrl;

    // DOM references
    this.productGrid = this.section.querySelector('[data-product-grid]');
    this.productsContainer = this.section.querySelector('[data-products-container]');
    this.activeFiltersContainer = this.section.querySelector('[data-active-filters-list]');
    this.activeFiltersWrapper = this.section.querySelector('[data-active-filters]');
    this.filterSidebar = this.section.querySelector('[data-filter-sidebar]');
    this.filterToggle = this.section.querySelector('[data-filter-toggle]');
    this.filterCloseButtons = this.section.querySelectorAll('[data-filter-close]');
    this.sortSelect = this.section.querySelector('[data-sort-select]');
    this.searchInput = this.section.querySelector('[data-collection-search-input]');
    this.searchClear = this.section.querySelector('[data-search-clear]');
    this.searchForm = this.section.querySelector('[data-predictive-search-form]');
    this.searchResults = this.section.querySelector('[data-predictive-results]');
    this.searchResultsInner = this.section.querySelector('[data-predictive-results-inner]');
    this.searchAllLink = this.section.querySelector('[data-search-all]');
    this.resultsCount = this.section.querySelector('[data-search-results-count]');
    this.filterCount = this.section.querySelector('[data-filter-count]');
    this.applyButton = this.section.querySelector('[data-apply-filters]');

    // Guided filters (catalog page)
    this.guidedFiltersContainer = this.section.querySelector('[data-guided-filters]');
    this.clearGuidedButton = this.section.querySelector('[data-clear-guided-filters]');

    // State
    this.isLoading = false;
    this.searchQuery = '';
    this.abortController = null;
    this.searchAbortController = null;

    this.init();
  }

  init() {
    this.bindFilterDrawer();
    this.bindFilterGroups();
    this.bindFilterInputs();
    this.bindSort();
    this.bindSearch();
    this.bindPagination();
    this.bindActiveFilters();
    this.bindGuidedChips();
    this.updateFilterCount();
  }

  // ========== FILTER DRAWER ==========
  bindFilterDrawer() {
    this.filterToggle?.addEventListener('click', () => this.openFilters());
    this.filterCloseButtons.forEach(btn => {
      btn.addEventListener('click', () => this.closeFilters());
    });

    // Mobile apply button closes drawer
    this.applyButton?.addEventListener('click', () => this.closeFilters());

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeFilters();
    });
  }

  openFilters() {
    this.filterSidebar?.setAttribute('aria-hidden', 'false');
    this.filterToggle?.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    if (this.filterSidebar) trapFocus(this.filterSidebar);
  }

  closeFilters() {
    this.filterSidebar?.setAttribute('aria-hidden', 'true');
    this.filterToggle?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  // ========== FILTER GROUPS (accordion) ==========
  bindFilterGroups() {
    this.section.querySelectorAll('[data-filter-toggle-group]').forEach(toggle => {
      toggle.addEventListener('click', () => {
        const group = toggle.closest('[data-filter-group]');
        if (group) {
          group.classList.toggle('is-open');
          toggle.setAttribute('aria-expanded', group.classList.contains('is-open'));
        }
      });
    });
  }

  // ========== FILTER INPUTS (checkboxes, price) ==========
  bindFilterInputs() {
    // Checkboxes - immediate AJAX
    this.section.querySelectorAll('[data-filter-checkbox]').forEach(checkbox => {
      checkbox.addEventListener('change', () => this.applyFilters());
    });

    // Price range - debounced
    const priceInputs = this.section.querySelectorAll('[data-filter-price-min], [data-filter-price-max]');
    priceInputs.forEach(input => {
      input.addEventListener('input', debounce(() => this.applyFilters(), 500));
    });
  }

  // ========== SORTING ==========
  bindSort() {
    this.sortSelect?.addEventListener('change', () => this.applyFilters());
  }

  // ========== PREDICTIVE SEARCH ==========
  bindSearch() {
    if (!this.searchInput) return;

    // Input handler - fetch predictions
    this.searchInput.addEventListener('input', debounce((e) => {
      this.searchQuery = e.target.value.trim();
      this.toggleSearchClear();

      if (this.searchQuery.length >= 2) {
        this.fetchPredictiveSearch(this.searchQuery);
      } else {
        this.hideSearchResults();
      }
    }, 200));

    // Clear button
    this.searchClear?.addEventListener('click', () => {
      this.searchInput.value = '';
      this.searchQuery = '';
      this.toggleSearchClear();
      this.hideSearchResults();
    });

    // Focus handler
    this.searchInput.addEventListener('focus', () => {
      if (this.searchQuery.length >= 2 && this.searchResultsInner?.innerHTML) {
        this.showSearchResults();
      }
    });

    // Click outside to close
    document.addEventListener('click', (e) => {
      const searchWrapper = this.section.querySelector('.collection-toolbar__search-wrapper');
      if (searchWrapper && !searchWrapper.contains(e.target)) {
        this.hideSearchResults();
      }
    });

    // Keyboard navigation
    this.searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.hideSearchResults();
        this.searchInput.blur();
      }
    });

    // Always prevent form submit — keep results in dropdown only
    this.searchForm?.addEventListener('submit', (e) => {
      e.preventDefault();
    });
  }

  toggleSearchClear() {
    if (this.searchClear) {
      this.searchClear.hidden = !this.searchQuery;
    }
  }

  async fetchPredictiveSearch(query) {
    // Abort previous request
    if (this.searchAbortController) {
      this.searchAbortController.abort();
    }
    this.searchAbortController = new AbortController();

    try {
      const response = await fetch(
        `/search/suggest.json?q=${encodeURIComponent(query)}&resources[type]=product&resources[limit]=6&resources[options][fields]=title,vendor,product_type,tag`,
        { signal: this.searchAbortController.signal }
      );

      if (!response.ok) throw new Error('Search failed');

      const data = await response.json();
      this.renderSearchResults(data.resources.results.products, query);

    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Predictive search error:', error);
        this.hideSearchResults();
      }
    }
  }

  renderSearchResults(products, query) {
    if (!this.searchResultsInner) return;

    if (!products || products.length === 0) {
      this.searchResultsInner.innerHTML = `
        <div class="collection-toolbar__no-results">
          No encontramos productos para "<strong>${query}</strong>"
        </div>
      `;
    } else {
      this.searchResultsInner.innerHTML = products.map(product => `
        <a href="${product.url}" class="collection-toolbar__result-item">
          <div class="collection-toolbar__result-image">
            ${product.featured_image?.url
              ? `<img src="${product.featured_image.url.replace(/(\.[^.]+)$/, '_100x100$1')}" alt="${product.title}" loading="lazy">`
              : '<span class="collection-toolbar__result-placeholder"></span>'
            }
          </div>
          <div class="collection-toolbar__result-info">
            <span class="collection-toolbar__result-title">${product.title}</span>
            ${product.vendor ? `<span class="collection-toolbar__result-vendor">${product.vendor}</span>` : ''}
            <span class="collection-toolbar__result-price">${this.formatPrice(product.price)}</span>
          </div>
        </a>
      `).join('');
    }

    // Update "see all" link
    if (this.searchAllLink) {
      this.searchAllLink.href = `/search?q=${encodeURIComponent(query)}&type=product`;
    }

    this.showSearchResults();
  }

  formatMoney(cents) {
    return '$' + (cents / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' MXN';
  }

  formatPrice(price) {
    return '$' + parseFloat(price).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' MXN';
  }

  showSearchResults() {
    if (this.searchResults) {
      this.searchResults.hidden = false;
    }
  }

  hideSearchResults() {
    if (this.searchResults) {
      this.searchResults.hidden = true;
    }
  }

  // ========== PAGINATION (AJAX) ==========
  bindPagination() {
    // Use event delegation for dynamically updated pagination
    this.productGrid?.addEventListener('click', (e) => {
      const paginationLink = e.target.closest('.collection-pagination__btn:not(.collection-pagination__btn--disabled), .collection-pagination__page:not(.collection-pagination__page--current):not(.collection-pagination__page--ellipsis)');
      if (paginationLink && paginationLink.href) {
        e.preventDefault();
        this.fetchPage(paginationLink.href);
      }
    });
  }

  // ========== ACTIVE FILTER CHIPS ==========
  bindActiveFilters() {
    // Use event delegation for dynamically updated chips
    this.section.addEventListener('click', (e) => {
      const chip = e.target.closest('[data-filter-chip]');
      if (chip) {
        e.preventDefault();
        this.removeFilter(chip.dataset.filterParam, chip.dataset.filterValue);
      }

      const clearAll = e.target.closest('[data-clear-all-filters]');
      if (clearAll) {
        e.preventDefault();
        this.clearAllFilters();
      }
    });
  }

  // ========== GUIDED CHIPS (Catalog Page) ==========
  bindGuidedChips() {
    if (!this.guidedFiltersContainer) return;

    // Event delegation for chip clicks
    this.guidedFiltersContainer.addEventListener('click', (e) => {
      const chip = e.target.closest('[data-guided-chip]');
      if (chip) {
        e.preventDefault();
        this.handleGuidedChipClick(chip);
      }
    });

    // Clear guided filters button
    this.clearGuidedButton?.addEventListener('click', () => {
      this.clearAllGuidedFilters();
    });
  }

  handleGuidedChipClick(chip) {
    const tagValue = chip.dataset.tagValue;
    const filterType = chip.dataset.filterType;
    const isActive = chip.classList.contains('is-active');

    // For recipient: single select (toggle off others in same group)
    if (filterType === 'recipient' && !isActive) {
      this.clearGuidedGroup('recipient');
    }

    // Toggle the clicked chip
    chip.classList.toggle('is-active');
    chip.setAttribute('aria-pressed', !isActive);

    // Apply filters via AJAX
    this.applyGuidedFilters();
  }

  clearGuidedGroup(filterType) {
    const chips = this.guidedFiltersContainer?.querySelectorAll(
      `[data-filter-type="${filterType}"][data-guided-chip].is-active`
    );
    chips?.forEach(chip => {
      chip.classList.remove('is-active');
      chip.setAttribute('aria-pressed', 'false');
    });
  }

  clearAllGuidedFilters() {
    const allChips = this.guidedFiltersContainer?.querySelectorAll('[data-guided-chip].is-active');
    allChips?.forEach(chip => {
      chip.classList.remove('is-active');
      chip.setAttribute('aria-pressed', 'false');
    });

    this.applyGuidedFilters();
  }

  applyGuidedFilters() {
    const url = this.buildUrlWithGuidedFilters();
    // Reset to page 1 when filters change
    url.searchParams.delete('page');
    this.fetchAndRender(url);
  }

  buildUrlWithGuidedFilters() {
    const url = new URL(this.collectionUrl, window.location.origin);

    // Clear existing tag filters
    const keysToDelete = [];
    for (const key of url.searchParams.keys()) {
      if (key.startsWith('filter.v.tag')) keysToDelete.push(key);
    }
    keysToDelete.forEach(key => url.searchParams.delete(key));

    // Add active guided chip filters
    const activeChips = this.guidedFiltersContainer?.querySelectorAll('[data-guided-chip].is-active');
    activeChips?.forEach(chip => {
      url.searchParams.append('filter.v.tag', chip.dataset.tagValue);
    });

    // Preserve sort
    if (this.sortSelect?.value) {
      url.searchParams.set('sort_by', this.sortSelect.value);
    }

    // Preserve other filters (price, etc.)
    this.section.querySelectorAll('[data-filter-checkbox]:checked').forEach(checkbox => {
      if (!checkbox.name.includes('filter.v.tag')) {
        url.searchParams.append(checkbox.name, checkbox.value);
      }
    });

    const minPrice = this.section.querySelector('[data-filter-price-min]');
    const maxPrice = this.section.querySelector('[data-filter-price-max]');
    if (minPrice?.value) {
      url.searchParams.set(minPrice.name, parseFloat(minPrice.value));
    }
    if (maxPrice?.value) {
      url.searchParams.set(maxPrice.name, parseFloat(maxPrice.value));
    }

    return url;
  }

  removeFilter(paramName, value) {
    // Handle price range specially
    if (paramName === 'filter.v.price' || value === 'price') {
      const minInput = this.section.querySelector('[data-filter-price-min]');
      const maxInput = this.section.querySelector('[data-filter-price-max]');
      if (minInput) minInput.value = '';
      if (maxInput) maxInput.value = '';
    } else {
      // Find and uncheck the corresponding checkbox
      const checkbox = this.section.querySelector(
        `[data-filter-checkbox][name="${paramName}"][value="${value}"]`
      );
      if (checkbox) {
        checkbox.checked = false;
      }
    }

    this.applyFilters();
  }

  clearAllFilters() {
    // Uncheck all checkboxes
    this.section.querySelectorAll('[data-filter-checkbox]:checked').forEach(cb => {
      cb.checked = false;
    });

    // Clear price inputs
    this.section.querySelectorAll('[data-filter-price-min], [data-filter-price-max]').forEach(input => {
      input.value = '';
    });

    // Clear search
    if (this.searchInput) {
      this.searchInput.value = '';
      this.searchQuery = '';
      this.toggleSearchClear();
    }

    this.applyFilters();
  }

  // ========== BUILD URL & FETCH ==========
  buildUrl(baseUrl = null) {
    const url = new URL(baseUrl || this.collectionUrl, window.location.origin);

    // Clear existing filter params
    const keysToDelete = [];
    for (const key of url.searchParams.keys()) {
      if (key.startsWith('filter.')) keysToDelete.push(key);
    }
    keysToDelete.forEach(key => url.searchParams.delete(key));
    url.searchParams.delete('q');

    // Add checked filters
    this.section.querySelectorAll('[data-filter-checkbox]:checked').forEach(checkbox => {
      url.searchParams.append(checkbox.name, checkbox.value);
    });

    // Add price range
    const minPrice = this.section.querySelector('[data-filter-price-min]');
    const maxPrice = this.section.querySelector('[data-filter-price-max]');
    if (minPrice?.value) {
      url.searchParams.set(minPrice.name, parseFloat(minPrice.value));
    }
    if (maxPrice?.value) {
      url.searchParams.set(maxPrice.name, parseFloat(maxPrice.value));
    }

    // Add sort
    if (this.sortSelect?.value) {
      url.searchParams.set('sort_by', this.sortSelect.value);
    }

    // Note: Search is handled client-side, not via URL params
    return url;
  }

  async applyFilters() {
    const url = this.buildUrl();
    // Reset to page 1 when filters change
    url.searchParams.delete('page');
    await this.fetchAndRender(url);
  }

  async fetchPage(pageUrl) {
    const url = new URL(pageUrl, window.location.origin);
    await this.fetchAndRender(url);
  }

  async fetchAndRender(url) {
    // Abort previous request
    if (this.abortController) {
      this.abortController.abort();
    }
    this.abortController = new AbortController();

    this.setLoading(true);

    try {
      // Add section parameter for Section Rendering API
      const fetchUrl = new URL(url);
      fetchUrl.searchParams.set('sections', this.sectionId);

      const response = await fetch(fetchUrl.toString(), {
        signal: this.abortController.signal
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();
      const html = data[this.sectionId];

      this.renderContent(html);
      this.updateUrl(url);
      this.updateFilterCount();

    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Collection fetch error:', error);
      }
    } finally {
      this.setLoading(false);
    }
  }

  renderContent(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Update product grid
    const newGrid = doc.querySelector('[data-product-grid]');
    if (newGrid && this.productGrid) {
      this.productGrid.innerHTML = newGrid.innerHTML;
    }

    // Update active filters
    const newActiveFilters = doc.querySelector('[data-active-filters-list]');
    if (newActiveFilters && this.activeFiltersContainer) {
      this.activeFiltersContainer.innerHTML = newActiveFilters.innerHTML;
    }

    // Show/hide active filters wrapper
    const newActiveFiltersWrapper = doc.querySelector('[data-active-filters]');
    if (newActiveFiltersWrapper && this.activeFiltersWrapper) {
      this.activeFiltersWrapper.className = newActiveFiltersWrapper.className;
    }

    // Update filter sidebar (to reflect new counts)
    const newFiltersBody = doc.querySelector('.collection-filters__body');
    const currentFiltersBody = this.section.querySelector('.collection-filters__body');
    if (newFiltersBody && currentFiltersBody) {
      currentFiltersBody.innerHTML = newFiltersBody.innerHTML;
      // Rebind after DOM replacement
      this.bindFilterInputs();
      this.bindFilterGroups();
    }

    // Update results count
    const newResultsCount = doc.querySelector('[data-search-results-count]');
    if (newResultsCount && this.resultsCount) {
      this.resultsCount.textContent = newResultsCount.textContent;
    }

    // Update apply button count
    const newApplyButton = doc.querySelector('[data-apply-filters]');
    if (newApplyButton && this.applyButton) {
      this.applyButton.textContent = newApplyButton.textContent;
    }

    // Update guided chips state (catalog page)
    const newGuidedFilters = doc.querySelector('[data-guided-filters]');
    if (newGuidedFilters && this.guidedFiltersContainer) {
      // Update chip active states from new HTML
      const newChips = newGuidedFilters.querySelectorAll('[data-guided-chip]');
      newChips.forEach(newChip => {
        const tagValue = newChip.dataset.tagValue;
        const currentChip = this.guidedFiltersContainer.querySelector(`[data-tag-value="${tagValue}"]`);
        if (currentChip) {
          const isActive = newChip.classList.contains('is-active');
          currentChip.classList.toggle('is-active', isActive);
          currentChip.setAttribute('aria-pressed', isActive);
        }
      });

      // Update clear button visibility
      const newClearButton = doc.querySelector('[data-clear-guided-filters]');
      if (newClearButton && this.clearGuidedButton) {
        this.clearGuidedButton.hidden = newClearButton.hidden;
      }
    }

    // Update products container reference (it was replaced)
    this.productsContainer = this.section.querySelector('[data-products-container]');

    // Scroll to top of grid (smooth)
    this.productGrid?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  updateUrl(url) {
    // Remove sections param before updating history
    url.searchParams.delete('sections');
    window.history.replaceState({}, '', url.toString());
  }

  setLoading(loading) {
    this.isLoading = loading;
    this.section.classList.toggle('is-loading', loading);
    this.productGrid?.setAttribute('aria-busy', loading);
    this.guidedFiltersContainer?.classList.toggle('is-loading', loading);
  }

  updateFilterCount() {
    const checkedCount = this.section.querySelectorAll('[data-filter-checkbox]:checked').length;
    const minPrice = this.section.querySelector('[data-filter-price-min]');
    const maxPrice = this.section.querySelector('[data-filter-price-max]');
    const priceCount = (minPrice?.value || maxPrice?.value) ? 1 : 0;
    const total = checkedCount + priceCount;

    if (this.filterCount) {
      this.filterCount.textContent = total;
      this.filterCount.hidden = total === 0;
    }

    // Update toolbar button text
    if (this.filterToggle) {
      const span = this.filterToggle.querySelector('span');
      if (span) {
        span.textContent = total > 0 ? `Filtros (${total})` : 'Filtros';
      }
    }
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  new Header();
  window.cart = new Cart();
  new NewsletterPopup();
  new CollectionFilters();

  // Product forms (support both old .product and new .product-page classes)
  document.querySelectorAll('.product, .product-page').forEach(container => {
    new ProductForm(container);
  });
});
