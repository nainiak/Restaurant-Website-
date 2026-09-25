/**
 * Solstice & Sage Restaurant - Tasting Bag / Order System
 * Handles cart state, localStorage persistence, quantity modifications,
 * promo code validation, drawer animations, and simulated checkout.
 */

(function () {
  const STORAGE_KEY = "solstice_tasting_bag_v1";
  let items = []; // [{ dishId, quantity }]
  let discountPercent = 0;
  let appliedPromoCode = "";

  // DOM Elements
  let drawerEl = null;
  let overlayEl = null;
  let badgeEl = null;
  let itemsContainerEl = null;
  let subtotalEl = null;
  let taxEl = null;
  let discountRowEl = null;
  let discountAmountEl = null;
  let finalTotalEl = null;
  let promoInputEl = null;
  let promoApplyBtn = null;
  let promoFeedbackEl = null;

  function initCart() {
    drawerEl = document.getElementById("cartDrawer");
    overlayEl = document.getElementById("cartDrawerOverlay");
    badgeEl = document.getElementById("cartBadgeCount");
    itemsContainerEl = document.getElementById("cartItemsContainer");
    subtotalEl = document.getElementById("cartSubtotal");
    taxEl = document.getElementById("cartTax");
    discountRowEl = document.getElementById("cartDiscountRow");
    discountAmountEl = document.getElementById("cartDiscountAmount");
    finalTotalEl = document.getElementById("cartFinalTotal");
    promoInputEl = document.getElementById("promoCodeInput");
    promoApplyBtn = document.getElementById("applyPromoBtn");
    promoFeedbackEl = document.getElementById("promoFeedback");

    loadCartFromStorage();
    setupCartListeners();
    renderCart();
  }

  function loadCartFromStorage() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        items = JSON.parse(saved);
      }
    } catch (e) {
      console.warn("Could not load cart from storage", e);
      items = [];
    }
  }

  function saveCartToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn("Could not save cart to storage", e);
    }
  }

  function setupCartListeners() {
    // Drawer open triggers
    document.querySelectorAll('[data-action="open-cart"]').forEach(btn => {
      btn.addEventListener("click", openDrawer);
    });

    // Drawer close triggers
    const closeBtn = document.getElementById("closeCartDrawerBtn");
    if (closeBtn) closeBtn.addEventListener("click", closeDrawer);
    if (overlayEl) overlayEl.addEventListener("click", closeDrawer);

    // Escape key closes drawer
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && drawerEl && drawerEl.classList.contains("open")) {
        closeDrawer();
      }
    });

    // Promo code apply
    if (promoApplyBtn && promoInputEl) {
      promoApplyBtn.addEventListener("click", applyPromoCode);
      promoInputEl.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          applyPromoCode();
        }
      });
    }

    // Checkout button
    const checkoutBtn = document.getElementById("cartCheckoutBtn");
    if (checkoutBtn) {
      checkoutBtn.addEventListener("click", triggerCheckout);
    }

    // Event delegation on items container (qty +, -, remove)
    if (itemsContainerEl) {
      itemsContainerEl.addEventListener("click", (e) => {
        const increaseBtn = e.target.closest('[data-cart-action="increase"]');
        const decreaseBtn = e.target.closest('[data-cart-action="decrease"]');
        const removeBtn = e.target.closest('[data-cart-action="remove"]');

        if (increaseBtn) {
          const dishId = increaseBtn.getAttribute("data-dish-id");
          updateQuantity(dishId, 1);
        } else if (decreaseBtn) {
          const dishId = decreaseBtn.getAttribute("data-dish-id");
          updateQuantity(dishId, -1);
        } else if (removeBtn) {
          const dishId = removeBtn.getAttribute("data-dish-id");
          removeItem(dishId);
        }
      });
    }
  }

  function openDrawer() {
    if (!drawerEl || !overlayEl) return;
    drawerEl.classList.add("open");
    overlayEl.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeDrawer() {
    if (!drawerEl || !overlayEl) return;
    drawerEl.classList.remove("open");
    overlayEl.classList.remove("open");
    document.body.style.overflow = "";
  }

  function addItem(dishId, qty = 1) {
    const existing = items.find(i => i.dishId === dishId);
    if (existing) {
      existing.quantity += qty;
    } else {
      items.push({ dishId, quantity: qty });
    }
    saveCartToStorage();
    renderCart();

    const dish = window.SolsticeMenuData ? window.SolsticeMenuData.getById(dishId) : null;
    const dishName = dish ? dish.name : "Dish";
    if (window.SolsticeApp && window.SolsticeApp.showToast) {
      window.SolsticeApp.showToast(`✨ Added 1x "${dishName}" to your Tasting Bag!`);
    }
    openDrawer();
  }

  function updateQuantity(dishId, change) {
    const item = items.find(i => i.dishId === dishId);
    if (!item) return;

    item.quantity += change;
    if (item.quantity <= 0) {
      removeItem(dishId);
      return;
    }

    saveCartToStorage();
    renderCart();
  }

  function removeItem(dishId) {
    items = items.filter(i => i.dishId !== dishId);
    saveCartToStorage();
    renderCart();
  }

  function applyPromoCode() {
    if (!promoInputEl) return;
    const code = promoInputEl.value.trim().toUpperCase();

    if (code === "WELCOME10" || code === "CHEFSPECIAL") {
      discountPercent = 10;
      appliedPromoCode = code;
      if (promoFeedbackEl) {
        promoFeedbackEl.textContent = `Promo "${code}" applied (10% Off)!`;
        promoFeedbackEl.style.color = "var(--accent-emerald)";
      }
      if (window.SolsticeApp && window.SolsticeApp.showToast) {
        window.SolsticeApp.showToast(`🎉 10% Culinary Discount applied successfully!`);
      }
    } else {
      if (promoFeedbackEl) {
        promoFeedbackEl.textContent = "Invalid code. Try 'WELCOME10' or 'CHEFSPECIAL'";
        promoFeedbackEl.style.color = "var(--accent-terracotta)";
      }
    }
    renderCart();
  }

  function renderCart() {
    const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

    // Update Badge
    if (badgeEl) {
      badgeEl.textContent = totalCount;
      badgeEl.style.display = totalCount > 0 ? "flex" : "none";
    }

    // Render Items
    if (!itemsContainerEl) return;

    if (items.length === 0) {
      itemsContainerEl.innerHTML = `
        <div class="cart-empty-message">
          <div style="font-size: 3rem; margin-bottom: 0.8rem; opacity: 0.5;">🛍️</div>
          <h4 style="font-family: var(--font-serif); font-size: 1.25rem; margin-bottom: 0.5rem;">Your Tasting Bag is Empty</h4>
          <p style="font-size: 0.88rem; line-height: 1.6; color: var(--text-muted); max-width: 260px; margin: 0 auto 1.5rem;">
            Explore our curated chef specials and artisanal courses to build your gourmet order.
          </p>
          <a href="#menu" class="btn btn-secondary btn-sm" onclick="window.SolsticeCart.close()">Browse Menu</a>
        </div>
      `;
      updateTotals(0);
      return;
    }

    let subtotal = 0;
    const itemsHtml = items.map(item => {
      const dish = window.SolsticeMenuData ? window.SolsticeMenuData.getById(item.dishId) : null;
      if (!dish) return "";

      const itemTotal = dish.price * item.quantity;
      subtotal += itemTotal;

      return `
        <div class="cart-item-row">
          <img src="${dish.image}" alt="${dish.name}" class="cart-item-thumb" />
          <div class="cart-item-info">
            <h5 class="cart-item-title">${dish.name}</h5>
            <div class="cart-item-price">$${dish.price} × ${item.quantity} = $${itemTotal}</div>
            <div class="cart-qty-controls">
              <button class="qty-btn" data-cart-action="decrease" data-dish-id="${dish.id}">-</button>
              <span class="qty-val">${item.quantity}</span>
              <button class="qty-btn" data-cart-action="increase" data-dish-id="${dish.id}">+</button>
            </div>
          </div>
          <button class="cart-item-remove-btn" data-cart-action="remove" data-dish-id="${dish.id}" title="Remove item">
            ✕
          </button>
        </div>
      `;
    }).join("");

    itemsContainerEl.innerHTML = itemsHtml;
    updateTotals(subtotal);
  }

  function updateTotals(subtotal) {
    const tax = +(subtotal * 0.08).toFixed(2);
    const discountAmount = +(subtotal * (discountPercent / 100)).toFixed(2);
    const finalTotal = +(subtotal - discountAmount + (subtotal > 0 ? tax : 0)).toFixed(2);

    if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    if (taxEl) taxEl.textContent = `$${tax.toFixed(2)}`;

    if (discountRowEl && discountAmountEl) {
      if (discountPercent > 0 && subtotal > 0) {
        discountRowEl.style.display = "flex";
        discountAmountEl.textContent = `-$${discountAmount.toFixed(2)} (${discountPercent}%)`;
      } else {
        discountRowEl.style.display = "none";
      }
    }

    if (finalTotalEl) {
      finalTotalEl.textContent = `$${finalTotal.toFixed(2)}`;
    }

    const checkoutBtn = document.getElementById("cartCheckoutBtn");
    if (checkoutBtn) {
      checkoutBtn.disabled = items.length === 0;
    }
  }

  function triggerCheckout() {
    if (items.length === 0) return;

    const orderNumber = "SLS-ORD-" + Math.floor(100000 + Math.random() * 900000);
    closeDrawer();

    const checkoutModal = document.getElementById("checkoutModal");
    const container = document.getElementById("checkoutModalContent");

    if (checkoutModal && container) {
      let subtotal = 0;
      const orderSummaryList = items.map(item => {
        const dish = window.SolsticeMenuData.getById(item.dishId);
        if (!dish) return "";
        subtotal += dish.price * item.quantity;
        return `
          <div style="display: flex; justify-content: space-between; font-size: 0.9rem; padding: 0.4rem 0; border-bottom: 1px dashed var(--border-subtle);">
            <span>${item.quantity}x ${dish.name}</span>
            <span style="font-weight: 600;">$${dish.price * item.quantity}</span>
          </div>
        `;
      }).join("");

      const tax = +(subtotal * 0.08).toFixed(2);
      const discountAmount = +(subtotal * (discountPercent / 100)).toFixed(2);
      const total = +(subtotal - discountAmount + tax).toFixed(2);

      container.innerHTML = `
        <div style="padding: 2.5rem; text-align: center;">
          <div style="width: 72px; height: 72px; margin: 0 auto 1.25rem; background: rgba(46, 196, 182, 0.15); color: var(--accent-emerald); border: 2px solid var(--accent-emerald); border-radius: 50%; display: grid; place-items: center; font-size: 2rem;">
            ✓
          </div>
          <h3 style="font-family: var(--font-serif); font-size: 1.8rem; margin-bottom: 0.4rem;">Order Placed Successfully!</h3>
          <p style="color: var(--text-secondary); font-size: 0.95rem; margin-bottom: 1.5rem;">
            Our kitchen team has received your order and begun artisan preparation.
          </p>

          <div style="background: var(--bg-tertiary); padding: 0.8rem; border-radius: var(--radius-md); font-family: monospace; font-size: 1.1rem; color: var(--accent-gold); margin-bottom: 1.5rem; border: 1px dashed var(--border-gold);">
            Order Tracking: ${orderNumber}
          </div>

          <div style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 1.25rem; margin-bottom: 2rem; text-align: left;">
            <h5 style="font-size: 0.82rem; text-transform: uppercase; color: var(--text-muted); margin-bottom: 0.75rem;">Order Summary</h5>
            ${orderSummaryList}
            <div style="margin-top: 1rem; padding-top: 0.75rem; border-top: 1px solid var(--border-subtle); display: flex; justify-content: space-between; font-weight: 800; font-size: 1.1rem; color: var(--accent-gold);">
              <span>Total Paid:</span>
              <span>$${total}</span>
            </div>
          </div>

          <div style="display: flex; gap: 1rem; justify-content: center;">
            <button class="btn btn-primary" id="finishCheckoutBtn">Back to Dining Experience</button>
          </div>
        </div>
      `;

      checkoutModal.classList.add("open");

      const finishBtn = document.getElementById("finishCheckoutBtn");
      if (finishBtn) {
        finishBtn.addEventListener("click", () => {
          checkoutModal.classList.remove("open");
          items = [];
          discountPercent = 0;
          appliedPromoCode = "";
          saveCartToStorage();
          renderCart();
        });
      }
    }
  }

  // Initialize once DOM is ready
  document.addEventListener("DOMContentLoaded", initCart);

  window.SolsticeCart = {
    addItem,
    updateQuantity,
    removeItem,
    open: openDrawer,
    close: closeDrawer,
    getCart: () => items
  };
})();
