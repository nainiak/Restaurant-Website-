/**
 * Solstice & Sage Restaurant - Interactive Menu Controller
 * Handles filtering, search, dietary toggles, sorting, and dish detail modal.
 */

(function () {
  let activeCategory = "all";
  let activeDietary = new Set();
  let searchQuery = "";
  let currentSort = "recommended";

  // DOM Elements
  let menuGridEl = null;
  let categoryTabsEl = null;
  let searchInputEl = null;
  let sortSelectEl = null;
  let dietaryChipsEl = null;

  function initMenu() {
    menuGridEl = document.getElementById("menuGrid");
    categoryTabsEl = document.getElementById("categoryTabs");
    searchInputEl = document.getElementById("menuSearchInput");
    sortSelectEl = document.getElementById("menuSortSelect");
    dietaryChipsEl = document.getElementById("dietaryChips");

    if (!menuGridEl) return;

    renderCategoryTabs();
    setupEventListeners();
    renderMenu();
    renderSpecialsGrid();
  }

  function renderCategoryTabs() {
    if (!categoryTabsEl || !window.SolsticeMenuData) return;
    const categories = window.SolsticeMenuData.getCategories();
    
    categoryTabsEl.innerHTML = categories.map(cat => `
      <button class="category-tab-btn ${cat.id === activeCategory ? 'active' : ''}" data-category="${cat.id}">
        <span>${cat.icon}</span>
        <span>${cat.name}</span>
      </button>
    `).join("");
  }

  function setupEventListeners() {
    // Category Tabs click
    if (categoryTabsEl) {
      categoryTabsEl.addEventListener("click", (e) => {
        const btn = e.target.closest(".category-tab-btn");
        if (!btn) return;
        
        categoryTabsEl.querySelectorAll(".category-tab-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        activeCategory = btn.getAttribute("data-category");
        renderMenu();
      });
    }

    // Search Input with debounce
    if (searchInputEl) {
      let debounceTimer;
      searchInputEl.addEventListener("input", (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          searchQuery = e.target.value.trim().toLowerCase();
          renderMenu();
        }, 250);
      });
    }

    // Sort Select
    if (sortSelectEl) {
      sortSelectEl.addEventListener("change", (e) => {
        currentSort = e.target.value;
        renderMenu();
      });
    }

    // Dietary Chips
    if (dietaryChipsEl) {
      dietaryChipsEl.addEventListener("click", (e) => {
        const chip = e.target.closest(".dietary-chip");
        if (!chip) return;
        
        const filter = chip.getAttribute("data-dietary");
        if (activeDietary.has(filter)) {
          activeDietary.delete(filter);
          chip.classList.remove("active");
        } else {
          activeDietary.add(filter);
          chip.classList.add("active");
        }
        renderMenu();
      });
    }

    // Quick View & Add to Bag delegation on menuGrid
    if (menuGridEl) {
      menuGridEl.addEventListener("click", handleDishActionClick);
    }

    // Modal close bindings
    const dishModal = document.getElementById("dishModal");
    if (dishModal) {
      dishModal.addEventListener("click", (e) => {
        if (e.target.classList.contains("modal-backdrop") || e.target.closest(".modal-close-btn")) {
          dishModal.classList.remove("open");
        }
      });
    }
  }

  function filterAndSortDishes() {
    let dishes = window.SolsticeMenuData.getAll();

    // Filter by Category
    if (activeCategory === "specials") {
      dishes = dishes.filter(d => d.isChefSpecial);
    } else if (activeCategory !== "all") {
      dishes = dishes.filter(d => d.category === activeCategory);
    }

    // Filter by Dietary markers
    if (activeDietary.size > 0) {
      dishes = dishes.filter(dish => {
        for (const diet of activeDietary) {
          if (!dish.dietary.includes(diet)) return false;
        }
        return true;
      });
    }

    // Filter by Search
    if (searchQuery) {
      dishes = dishes.filter(dish => 
        dish.name.toLowerCase().includes(searchQuery) ||
        dish.description.toLowerCase().includes(searchQuery) ||
        dish.categoryLabel.toLowerCase().includes(searchQuery) ||
        dish.ingredients.some(ing => ing.toLowerCase().includes(searchQuery))
      );
    }

    // Sorting
    switch (currentSort) {
      case "price-asc":
        dishes.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        dishes.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        dishes.sort((a, b) => b.rating - a.rating);
        break;
      case "recommended":
      default:
        dishes.sort((a, b) => {
          if (a.isChefSpecial && !b.isChefSpecial) return -1;
          if (!a.isChefSpecial && b.isChefSpecial) return 1;
          return b.reviewsCount - a.reviewsCount;
        });
        break;
    }

    return dishes;
  }

  function renderMenu() {
    if (!menuGridEl) return;
    const dishes = filterAndSortDishes();

    if (dishes.length === 0) {
      menuGridEl.innerHTML = `
        <div class="menu-empty-state">
          <div class="empty-state-icon">🍽️</div>
          <h3 style="font-family: var(--font-serif); font-size: 1.5rem; margin-bottom: 0.5rem;">No matching culinary delights found</h3>
          <p style="color: var(--text-secondary); max-width: 440px; margin: 0 auto 1.5rem;">
            Try clearing your search query or dietary filters to view our full seasonal collection.
          </p>
          <button class="btn btn-secondary btn-sm" id="resetFiltersBtn">Reset All Filters</button>
        </div>
      `;
      const resetBtn = document.getElementById("resetFiltersBtn");
      if (resetBtn) {
        resetBtn.addEventListener("click", () => {
          activeCategory = "all";
          activeDietary.clear();
          searchQuery = "";
          currentSort = "recommended";
          if (searchInputEl) searchInputEl.value = "";
          if (sortSelectEl) sortSelectEl.value = "recommended";
          if (dietaryChipsEl) {
            dietaryChipsEl.querySelectorAll(".dietary-chip").forEach(c => c.classList.remove("active"));
          }
          renderCategoryTabs();
          renderMenu();
        });
      }
      return;
    }

    menuGridEl.innerHTML = dishes.map(dish => createDishCardHtml(dish)).join("");
  }

  function createDishCardHtml(dish) {
    const dietaryBadgesHtml = dish.dietary.map(d => {
      let icon = "🌱";
      let label = d.replace("-", " ");
      if (d === "gluten-free") icon = "🌾";
      if (d === "chef-recommended") icon = "⭐";
      if (d === "vegetarian") icon = "🌿";
      return `<span class="badge-dietary">${icon} ${label}</span>`;
    }).join("");

    return `
      <article class="menu-card" data-dish-id="${dish.id}">
        <div class="menu-card-top">
          <img src="${dish.image}" alt="${dish.name}" class="menu-card-img" loading="lazy" />
          <div class="menu-card-badges">
            ${dietaryBadgesHtml}
          </div>
          <div class="menu-card-price">$${dish.price}</div>
        </div>
        <div class="menu-card-body">
          <div class="menu-card-title-row">
            <h4 class="menu-card-title">${dish.name}</h4>
            <div class="menu-rating-badge">
              <span>★</span>
              <span>${dish.rating.toFixed(1)}</span>
            </div>
          </div>
          <p class="menu-card-desc">${dish.description}</p>
          <div class="menu-card-meta">
            <span>⏱️ ${dish.prepTime}</span>
            <span>🔥 ${dish.calories}</span>
            <span>🍷 Pairing Ready</span>
          </div>
          <div class="menu-card-actions">
            <button class="btn-card-add" data-action="add-to-cart" data-dish-id="${dish.id}">
              <span>+</span>
              <span>Add to Tasting Bag</span>
            </button>
            <button class="btn-card-view" data-action="quick-view" data-dish-id="${dish.id}" title="View Details">
              👁️
            </button>
          </div>
        </div>
      </article>
    `;
  }

  function renderSpecialsGrid() {
    const specialsGrid = document.getElementById("specialsGrid");
    if (!specialsGrid || !window.SolsticeMenuData) return;

    const specials = window.SolsticeMenuData.getSpecials().slice(0, 4);

    specialsGrid.innerHTML = specials.map(dish => `
      <article class="special-card">
        <div class="special-card-img-wrap">
          <img src="${dish.image}" alt="${dish.name}" class="special-card-img" loading="lazy" />
          <div class="special-badge-tag">Chef's Signature</div>
          <div class="special-price-tag">$${dish.price}</div>
        </div>
        <div class="special-card-body">
          <div class="special-meta-row">
            <span>⭐ ${dish.rating.toFixed(1)} (${dish.reviewsCount} reviews)</span>
            <span>⏱️ ${dish.prepTime}</span>
          </div>
          <h4 class="special-dish-title">${dish.name}</h4>
          <p class="special-dish-desc">${dish.description}</p>
          <div class="special-pairing-box">
            <span>Sommelier Pairing:</span> ${dish.pairing}
          </div>
          <div class="special-card-footer">
            <button class="btn-card-add" data-action="add-to-cart" data-dish-id="${dish.id}">
              <span>+</span>
              <span>Add to Tasting Bag</span>
            </button>
            <button class="btn-card-view" data-action="quick-view" data-dish-id="${dish.id}" title="View Details">
              👁️
            </button>
          </div>
        </div>
      </article>
    `).join("");

    specialsGrid.addEventListener("click", handleDishActionClick);
  }

  function handleDishActionClick(e) {
    const addBtn = e.target.closest('[data-action="add-to-cart"]');
    const viewBtn = e.target.closest('[data-action="quick-view"]');

    if (addBtn) {
      const dishId = addBtn.getAttribute("data-dish-id");
      if (window.SolsticeCart && dishId) {
        window.SolsticeCart.addItem(dishId);
      }
    } else if (viewBtn) {
      const dishId = viewBtn.getAttribute("data-dish-id");
      showDishDetailModal(dishId);
    }
  }

  function showDishDetailModal(dishId) {
    const dish = window.SolsticeMenuData.getById(dishId);
    if (!dish) return;

    const modal = document.getElementById("dishModal");
    const container = document.getElementById("dishModalContent");
    if (!modal || !container) return;

    const ingredientsHtml = dish.ingredients.map(ing => `
      <span style="display: inline-block; background: var(--bg-tertiary); border: 1px solid var(--border-subtle); padding: 0.35rem 0.75rem; border-radius: var(--radius-full); font-size: 0.8rem; margin: 0.2rem;">
        ${ing}
      </span>
    `).join("");

    const allergensHtml = dish.allergens.length > 0
      ? dish.allergens.map(a => `<span style="color: var(--accent-terracotta); font-weight: 600; margin-right: 0.5rem;">⚠️ ${a}</span>`).join("")
      : '<span style="color: var(--accent-sage);">None reported</span>';

    container.innerHTML = `
      <div style="position: relative; height: 260px; overflow: hidden; border-radius: var(--radius-lg) var(--radius-lg) 0 0;">
        <img src="${dish.image}" alt="${dish.name}" style="width: 100%; height: 100%; object-fit: cover;" />
        <div style="position: absolute; bottom: 1rem; right: 1rem; background: var(--accent-gold); color: #0b0f17; font-weight: 800; font-size: 1.35rem; padding: 0.4rem 1rem; border-radius: var(--radius-md);">
          $${dish.price}
        </div>
      </div>
      <div style="padding: 2rem;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem;">
          <span style="font-size: 0.82rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--accent-gold); font-weight: 700;">
            ${dish.categoryLabel}
          </span>
          <span style="color: #ffb703; font-weight: 700; font-size: 0.95rem;">★ ${dish.rating.toFixed(1)} (${dish.reviewsCount} verified diners)</span>
        </div>
        <h3 style="font-family: var(--font-serif); font-size: 1.8rem; margin-bottom: 0.75rem;">${dish.name}</h3>
        <p style="color: var(--text-secondary); line-height: 1.7; margin-bottom: 1.5rem;">${dish.description}</p>
        
        <div style="background: var(--bg-tertiary); padding: 1.25rem; border-radius: var(--radius-md); margin-bottom: 1.5rem;">
          <h5 style="font-size: 0.85rem; text-transform: uppercase; color: var(--text-muted); margin-bottom: 0.6rem;">Key Artisanal Ingredients</h5>
          <div style="display: flex; flex-wrap: wrap;">${ingredientsHtml}</div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem; font-size: 0.88rem;">
          <div style="background: var(--bg-card); padding: 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
            <strong style="display: block; font-size: 0.78rem; color: var(--text-muted);">ALLERGEN INFO</strong>
            ${allergensHtml}
          </div>
          <div style="background: var(--bg-card); padding: 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
            <strong style="display: block; font-size: 0.78rem; color: var(--text-muted);">ESTIMATED PREP & CALORIES</strong>
            <span>${dish.prepTime} • ${dish.calories}</span>
          </div>
        </div>

        <div style="background: rgba(229, 185, 95, 0.1); border-left: 3px solid var(--accent-gold); padding: 1rem; border-radius: 0 var(--radius-md) var(--radius-md) 0; margin-bottom: 2rem;">
          <strong style="color: var(--accent-gold); display: block; font-size: 0.85rem; margin-bottom: 0.25rem;">SOMMELIER VINTAGE PAIRING</strong>
          <span style="font-size: 0.95rem; color: var(--text-primary);">${dish.pairing}</span>
        </div>

        <div style="display: flex; gap: 1rem;">
          <button class="btn btn-primary" style="flex-grow: 1;" id="modalAddDishBtn" data-dish-id="${dish.id}">
            Add to Tasting Bag ($${dish.price})
          </button>
        </div>
      </div>
    `;

    const modalAddBtn = document.getElementById("modalAddDishBtn");
    if (modalAddBtn) {
      modalAddBtn.addEventListener("click", () => {
        if (window.SolsticeCart) {
          window.SolsticeCart.addItem(dish.id);
        }
        modal.classList.remove("open");
      });
    }

    modal.classList.add("open");
  }

  // Initialize once DOM is ready
  document.addEventListener("DOMContentLoaded", initMenu);

  window.SolsticeMenu = {
    render: renderMenu,
    showDetail: showDishDetailModal
  };
})();
