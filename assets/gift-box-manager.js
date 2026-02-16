/* ============================================
   Gift Box Manager
   Handles box selection and item assignment in cart
   ============================================ */

class GiftBoxManager {
  constructor() {
    this.storageKey = 'giftBoxState';
    this.maxItemsPerBox = 6;
    this.boxProducts = [];
    this.cart = null;
    this.state = {
      itemAssignments: {},   // { "item_key": "1", "item_key2": "2" }
      selectedProducts: {}   // { "1": variantId, "2": variantId }
    };

    this.init();
  }

  init() {
    this.loadBoxProducts();
    this.loadState();
    this.bindEvents();
    this.fetchCartAndRender();
  }

  // ============= LOAD BOX PRODUCTS FROM DOM =============

  loadBoxProducts() {
    // First check if we already have cached products
    const cached = sessionStorage.getItem('giftBoxProducts');
    if (cached) {
      try {
        this.boxProducts = JSON.parse(cached);
        return;
      } catch (e) {
        // Fall through to load from DOM
      }
    }

    // Load from DOM and cache
    const dataEl = document.querySelector('[data-box-products]');
    if (dataEl) {
      try {
        this.boxProducts = JSON.parse(dataEl.textContent);
        // Cache for when DOM element is removed during re-render
        sessionStorage.setItem('giftBoxProducts', JSON.stringify(this.boxProducts));
      } catch (e) {
        console.warn('Failed to parse box products:', e);
        this.boxProducts = [];
      }
    }
  }

  // ============= STATE MANAGEMENT =============

  loadState() {
    try {
      const stored = sessionStorage.getItem(this.storageKey);
      if (stored) {
        this.state = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load box state:', e);
    }
  }

  saveState() {
    try {
      sessionStorage.setItem(this.storageKey, JSON.stringify(this.state));
    } catch (e) {
      console.warn('Failed to save box state:', e);
    }
  }

  clearState() {
    this.state = { itemAssignments: {}, selectedProducts: {} };
    sessionStorage.removeItem(this.storageKey);
  }

  // ============= EVENT BINDING =============

  bindEvents() {
    // Box product selection via image cards
    document.addEventListener('click', (e) => {
      const boxOption = e.target.closest('[data-box-option]');
      if (boxOption) {
        const boxNumber = boxOption.dataset.boxNumber;
        const variantId = boxOption.dataset.variantId;
        this.setBoxProduct(boxNumber, variantId);
        this.updateBoxOptionSelection(boxNumber, variantId);
      }
    });

    // Item assignment changes (dropdown)
    document.addEventListener('change', (e) => {
      if (e.target.matches('[data-box-select]')) {
        const itemKey = e.target.dataset.itemKey;
        const boxNumber = e.target.value;
        this.assignItemToBox(itemKey, boxNumber);
      }
    });

    // Checkout validation
    document.addEventListener('click', (e) => {
      const checkoutBtn = e.target.closest('.cart-drawer__checkout, .cart-page__checkout');
      if (checkoutBtn && !checkoutBtn.classList.contains('gift-box-checkout-validated')) {
        const validation = this.validateAllBoxes();
        if (!validation.valid) {
          e.preventDefault();
          e.stopPropagation();
          this.showValidationErrors(validation.errors);
          return false;
        }
        // Add box products to cart before checkout
        this.prepareForCheckout(checkoutBtn);
        e.preventDefault();
      }
    }, true);
  }

  // ============= CART FETCHING =============

  async fetchCartAndRender() {
    try {
      const response = await fetch('/cart.js');
      this.cart = await response.json();
      this.renderAfterCartUpdate(this.cart);
    } catch (e) {
      console.error('Failed to fetch cart:', e);
    }
  }

  // ============= BOX CALCULATIONS =============

  calculateRequiredBoxes(cart) {
    if (!cart || !cart.items) return 1;

    // Count only regular items (not gift box products)
    let totalQuantity = 0;
    for (const item of cart.items) {
      if (!this.isGiftBoxProduct(item)) {
        totalQuantity += item.quantity;
      }
    }

    return Math.max(1, Math.ceil(totalQuantity / this.maxItemsPerBox));
  }

  isGiftBoxProduct(item) {
    return item.properties && item.properties._is_gift_box === 'true';
  }

  getRegularItems(cart) {
    if (!cart || !cart.items) return [];
    return cart.items.filter(item => !this.isGiftBoxProduct(item));
  }

  getItemsInBox(boxNumber) {
    return Object.entries(this.state.itemAssignments)
      .filter(([_, box]) => box === String(boxNumber))
      .map(([key, _]) => key);
  }

  getBoxItemCount(boxNumber) {
    if (!this.cart) return 0;

    const assignedKeys = this.getItemsInBox(boxNumber);
    return this.cart.items
      .filter(item => assignedKeys.includes(item.key))
      .reduce((sum, item) => sum + item.quantity, 0);
  }

  // ============= BOX PRODUCT SELECTION =============

  setBoxProduct(boxNumber, variantId) {
    if (variantId) {
      this.state.selectedProducts[boxNumber] = variantId;
    } else {
      delete this.state.selectedProducts[boxNumber];
    }
    this.saveState();
    this.updateValidationUI();
  }

  updateBoxOptionSelection(boxNumber, variantId) {
    // Remove selected state from all options in this box
    const boxSlot = document.querySelector(`[data-box-slot="${boxNumber}"]`);
    if (!boxSlot) return;

    boxSlot.querySelectorAll('[data-box-option]').forEach(option => {
      const isSelected = option.dataset.variantId === variantId;
      option.classList.toggle('gift-box-option--selected', isSelected);

      // Update checkmark
      const existingCheck = option.querySelector('.gift-box-option__check');
      if (isSelected && !existingCheck) {
        option.insertAdjacentHTML('beforeend', '<span class="gift-box-option__check">✓</span>');
      } else if (!isSelected && existingCheck) {
        existingCheck.remove();
      }
    });
  }

  getBoxProduct(boxNumber) {
    return this.state.selectedProducts[boxNumber] || null;
  }

  // ============= ITEM ASSIGNMENT =============

  assignItemToBox(itemKey, boxNumber) {
    if (boxNumber) {
      this.state.itemAssignments[itemKey] = boxNumber;
    } else {
      delete this.state.itemAssignments[itemKey];
    }
    this.saveState();
    this.updateBoxCounts();
    this.updateValidationUI();
  }

  getItemAssignment(itemKey) {
    return this.state.itemAssignments[itemKey] || null;
  }

  // ============= VALIDATION =============

  validateAllBoxes() {
    const errors = [];
    const requiredBoxes = this.calculateRequiredBoxes(this.cart);
    const regularItems = this.getRegularItems(this.cart);

    // If no regular items, no validation needed
    if (regularItems.length === 0) {
      return { valid: true, errors: [] };
    }

    // Check each box doesn't exceed capacity
    for (let i = 1; i <= requiredBoxes; i++) {
      const count = this.getBoxItemCount(i);
      if (count > this.maxItemsPerBox) {
        errors.push(`Caja ${i} tiene ${count} productos (maximo ${this.maxItemsPerBox})`);
      }
    }

    // Check all items are assigned
    const unassigned = regularItems.filter(item => !this.state.itemAssignments[item.key]);
    if (unassigned.length > 0) {
      errors.push(`${unassigned.length} producto(s) sin caja asignada`);
    }

    // Check all boxes have a product selected
    for (let i = 1; i <= requiredBoxes; i++) {
      if (!this.state.selectedProducts[i]) {
        errors.push(`Selecciona un estilo para Caja ${i}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  showValidationErrors(errors) {
    const errorContainer = document.querySelector('[data-box-validation]');
    const errorText = document.querySelector('[data-box-error]');

    if (errorContainer && errorText) {
      errorContainer.hidden = false;
      errorText.innerHTML = errors.join('<br>');
    } else {
      // Fallback to alert
      alert(errors.join('\n'));
    }
  }

  // ============= CHECKOUT PREPARATION =============

  async prepareForCheckout(checkoutBtn) {
    checkoutBtn.classList.add('is-loading');
    checkoutBtn.style.pointerEvents = 'none';

    try {
      // Sync item properties to cart
      await this.syncToCart();

      // Add box products
      await this.addBoxProductsToCart();

      // Mark as validated and redirect
      checkoutBtn.classList.add('gift-box-checkout-validated');

      const checkoutUrl = window.routes?.checkout_url || '/checkout';
      window.location.href = checkoutUrl;

    } catch (error) {
      console.error('Checkout preparation failed:', error);
      checkoutBtn.classList.remove('is-loading');
      checkoutBtn.style.pointerEvents = '';
      alert('Error al preparar el pedido. Por favor intenta de nuevo.');
    }
  }

  // ============= CART SYNC =============

  getBoxStyleName(boxNumber) {
    const variantId = this.state.selectedProducts[boxNumber];
    if (!variantId) return null;
    const boxProduct = this.boxProducts.find(p => String(p.variantId) === String(variantId));
    return boxProduct ? boxProduct.title : null;
  }

  async syncToCart() {
    const regularItems = this.getRegularItems(this.cart);

    for (const item of regularItems) {
      const boxNumber = this.state.itemAssignments[item.key];
      if (boxNumber) {
        const boxStyle = this.getBoxStyleName(boxNumber);
        // Remove old underscore properties and add readable ones
        const cleanProperties = { ...item.properties };
        delete cleanProperties._box_number;
        delete cleanProperties._box_style;

        await this.updateItemProperties(item.key, item.quantity, {
          ...cleanProperties,
          'Caja': boxNumber,
          'Estilo de Caja': boxStyle || 'Sin estilo seleccionado'
        });
      }
    }
  }

  async updateItemProperties(key, quantity, properties) {
    await fetch('/cart/change.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: key,
        quantity: quantity,
        properties: properties
      })
    });
  }

  async addBoxProductsToCart() {
    const requiredBoxes = this.calculateRequiredBoxes(this.cart);

    // First remove any existing box products
    await this.removeBoxProductsFromCart();

    // Add new box products
    const itemsToAdd = [];
    for (let i = 1; i <= requiredBoxes; i++) {
      const variantId = this.state.selectedProducts[i];
      if (variantId) {
        const boxStyle = this.getBoxStyleName(i);
        itemsToAdd.push({
          id: parseInt(variantId),
          quantity: 1,
          properties: {
            _is_gift_box: 'true',
            'Caja': String(i),
            'Estilo': boxStyle || 'Sin estilo'
          }
        });
      }
    }

    if (itemsToAdd.length > 0) {
      await fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: itemsToAdd })
      });
    }
  }

  async removeBoxProductsFromCart() {
    const boxItems = this.cart.items.filter(item => this.isGiftBoxProduct(item));

    for (const item of boxItems) {
      await fetch('/cart/change.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.key, quantity: 0 })
      });
    }
  }

  // ============= UI RENDERING =============

  renderAfterCartUpdate(cart) {
    this.cart = cart;
    this.loadState();
    this.cleanupStaleAssignments();
    this.autoAssignUnassignedItems();
    this.renderBoxSelectors();
    this.renderItemDropdowns();
    this.restoreDropdownSelections();
    this.updateBoxCounts();
    this.updateValidationUI();
  }

  cleanupStaleAssignments() {
    if (!this.cart) return;

    // Remove assignments for items no longer in cart
    const currentKeys = this.cart.items.map(i => i.key);
    for (const key of Object.keys(this.state.itemAssignments)) {
      if (!currentKeys.includes(key)) {
        delete this.state.itemAssignments[key];
      }
    }
    this.saveState();
  }

  autoAssignUnassignedItems() {
    if (!this.cart) return;

    const regularItems = this.getRegularItems(this.cart);
    const requiredBoxes = this.calculateRequiredBoxes(this.cart);

    // Get unassigned items
    const unassigned = regularItems.filter(item => !this.state.itemAssignments[item.key]);

    // Auto-assign to first box with space
    for (const item of unassigned) {
      for (let boxNum = 1; boxNum <= requiredBoxes; boxNum++) {
        const count = this.getBoxItemCount(boxNum);
        if (count + item.quantity <= this.maxItemsPerBox) {
          this.state.itemAssignments[item.key] = String(boxNum);
          break;
        }
      }
    }

    this.saveState();
  }

  renderBoxSelectors() {
    const container = document.querySelector('[data-box-selectors-container]');
    if (!container) return;

    const regularItems = this.getRegularItems(this.cart);

    // Don't show if no regular items
    if (regularItems.length === 0) {
      container.innerHTML = '';
      const selectorWrapper = document.querySelector('[data-gift-box-selector]');
      if (selectorWrapper) selectorWrapper.hidden = true;
      return;
    }

    const selectorWrapper = document.querySelector('[data-gift-box-selector]');
    if (selectorWrapper) selectorWrapper.hidden = false;

    const requiredBoxes = this.calculateRequiredBoxes(this.cart);

    let html = '';
    for (let i = 1; i <= requiredBoxes; i++) {
      const selectedProduct = this.state.selectedProducts[i] || '';
      const itemCount = this.getBoxItemCount(i);
      const isOverCapacity = itemCount > this.maxItemsPerBox;
      const isValid = itemCount > 0 && itemCount <= this.maxItemsPerBox;

      html += `
        <div class="gift-box-slot" data-box-slot="${i}">
          <div class="gift-box-slot__header">
            <span class="gift-box-slot__number">Caja ${i}</span>
            <span class="gift-box-slot__count ${isOverCapacity ? 'gift-box-slot__count--warning' : ''} ${isValid ? 'gift-box-slot__count--valid' : ''}"
                  data-box-count="${i}">
              ${itemCount}/${this.maxItemsPerBox} productos
            </span>
          </div>
          <div class="gift-box-slot__options">
            ${this.boxProducts.map(p => `
              <button type="button"
                      class="gift-box-option ${selectedProduct == p.variantId ? 'gift-box-option--selected' : ''}"
                      data-box-option
                      data-box-number="${i}"
                      data-variant-id="${p.variantId}">
                <div class="gift-box-option__image">
                  <img src="${p.image}" alt="${p.title}" loading="lazy">
                </div>
                <span class="gift-box-option__name">${p.title}</span>
                ${selectedProduct == p.variantId ? '<span class="gift-box-option__check">✓</span>' : ''}
              </button>
            `).join('')}
          </div>
        </div>
      `;
    }

    container.innerHTML = html;
  }

  renderItemDropdowns() {
    if (!this.cart) return;

    const requiredBoxes = this.calculateRequiredBoxes(this.cart);
    const dropdownContainers = document.querySelectorAll('[data-box-dropdown-container]');

    dropdownContainers.forEach(container => {
      const itemKey = container.dataset.itemKey;
      const currentAssignment = this.state.itemAssignments[itemKey] || '';

      let options = '<option value="">Seleccionar caja...</option>';
      for (let i = 1; i <= requiredBoxes; i++) {
        options += `<option value="${i}" ${currentAssignment === String(i) ? 'selected' : ''}>Caja ${i}</option>`;
      }

      container.innerHTML = `
        <select class="cart-item-box-dropdown__select collage-select"
                data-box-select
                data-item-key="${itemKey}">
          ${options}
        </select>
      `;
    });
  }

  restoreDropdownSelections() {
    document.querySelectorAll('[data-box-select]').forEach(select => {
      const itemKey = select.dataset.itemKey;
      const assignment = this.state.itemAssignments[itemKey];
      if (assignment) {
        select.value = assignment;
      }
    });
  }

  updateBoxCounts() {
    const requiredBoxes = this.calculateRequiredBoxes(this.cart);

    for (let i = 1; i <= requiredBoxes; i++) {
      const countEl = document.querySelector(`[data-box-count="${i}"]`);
      if (countEl) {
        const count = this.getBoxItemCount(i);
        const isOverCapacity = count > this.maxItemsPerBox;
        const isValid = count > 0 && count <= this.maxItemsPerBox;

        countEl.textContent = `${count}/${this.maxItemsPerBox}`;
        countEl.classList.toggle('gift-box-slot__count--warning', isOverCapacity);
        countEl.classList.toggle('gift-box-slot__count--valid', isValid);
      }
    }
  }

  updateValidationUI() {
    const validation = this.validateAllBoxes();
    const errorContainer = document.querySelector('[data-box-validation]');
    const errorText = document.querySelector('[data-box-error]');
    const checkoutButtons = document.querySelectorAll('.cart-drawer__checkout, .cart-page__checkout');

    // Hide error container if valid
    if (errorContainer) {
      errorContainer.hidden = validation.valid;
      if (!validation.valid && errorText) {
        errorText.innerHTML = validation.errors[0];
      }
    }

    // Update checkout button state
    checkoutButtons.forEach(btn => {
      btn.classList.toggle('gift-box-checkout--disabled', !validation.valid);
    });
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Only initialize if box products exist
  if (document.querySelector('[data-box-products]')) {
    window.giftBoxManager = new GiftBoxManager();
  }
});

// Export for use in other scripts
window.GiftBoxManager = GiftBoxManager;
