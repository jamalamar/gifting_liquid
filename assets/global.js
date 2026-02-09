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
          input.value = parseInt(input.value) + 1;
          this.updateQuantity(input);
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
  }

  async addToCart(id, quantity = 1, submitBtn = null, form = null) {
    // Add loading state
    if (submitBtn) {
      submitBtn.classList.add('is-loading');
      submitBtn.disabled = true;
    }

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
    this.variantInput = container.querySelector('[data-variant-id]');
    this.optionSelectors = container.querySelectorAll('[data-option-selector]');
    this.mainImage = container.querySelector('[data-main-image]');
    this.thumbnails = container.querySelectorAll('[data-thumbnail]');
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

    if (variant && this.variantInput) {
      this.variantInput.value = variant.id;

      // Update variant image if available
      if (variant.featured_image && this.mainImage) {
        this.mainImage.src = variant.featured_image.src;
      }
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
    this.resultsCount = this.section.querySelector('[data-search-results-count]');
    this.filterCount = this.section.querySelector('[data-filter-count]');
    this.applyButton = this.section.querySelector('[data-apply-filters]');

    // State
    this.isLoading = false;
    this.searchQuery = '';
    this.abortController = null;

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

  // ========== INLINE SEARCH ==========
  bindSearch() {
    if (!this.searchInput) return;

    this.searchInput.addEventListener('input', debounce((e) => {
      this.searchQuery = e.target.value.trim();
      this.toggleSearchClear();
      this.applyFilters();
    }, 300));

    this.searchClear?.addEventListener('click', () => {
      this.searchInput.value = '';
      this.searchQuery = '';
      this.toggleSearchClear();
      this.applyFilters();
    });
  }

  toggleSearchClear() {
    if (this.searchClear) {
      this.searchClear.hidden = !this.searchQuery;
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
      url.searchParams.set(minPrice.name, Math.round(parseFloat(minPrice.value) * 100));
    }
    if (maxPrice?.value) {
      url.searchParams.set(maxPrice.name, Math.round(parseFloat(maxPrice.value) * 100));
    }

    // Add sort
    if (this.sortSelect?.value) {
      url.searchParams.set('sort_by', this.sortSelect.value);
    }

    // Add search query
    if (this.searchQuery) {
      url.searchParams.set('q', this.searchQuery);
    }

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
  new Cart();
  new NewsletterPopup();
  new CollectionFilters();

  // Product forms (support both old .product and new .product-page classes)
  document.querySelectorAll('.product, .product-page').forEach(container => {
    new ProductForm(container);
  });
});
