# 🍽️ Solstice & Sage — Modern Responsive Restaurant Web Application

> An elegant, high-performance, and responsive restaurant website built with modern HTML5, CSS3 Custom Properties, and ES6+ JavaScript. Designed specifically as a **featured portfolio project for resumes and CVs**, demonstrating real-world frontend engineering, UX micro-interactions, responsive design, and stateful client-side architecture.

---

## 🌟 Highlights for Your Resume / CV

Copy & paste these bullet points directly into your software engineering or web development resume:

* **Interactive Culinary Menu Engine:** Architected a modular menu catalog featuring live category filtering, debounced instant search, dietary tags (Vegan, Gluten-Free, Chef's Pick), and multi-criteria sorting (Price, Rating, Recommended).
* **Table Reservation Wizard:** Developed an end-to-end interactive booking flow with party size steppers, date constraints, prime time slot selectors, seating ambiance preference cards, and instant confirmation ticket generation with printable passes.
* **Client-Side Cart & Order Drawer:** Built an interactive "Tasting Bag" ordering system with slide-out drawer, real-time quantity modifiers, 8% service tax calculations, promotional voucher discounts (`WELCOME10`), and persistent `localStorage` synchronization.
* **Modern Luxury Design System:** Implemented a dark/light theme switch, fluid typography (`clamp()`), glassmorphic overlays (`backdrop-filter`), CSS custom properties, and full mobile/tablet/desktop responsive breakpoints without external heavyweight frameworks.
* **Real-Time Restaurant Service Status:** Computed dynamic opening/closing badges based on actual client datetime and weekly service schedules (lunch/dinner services).

---

## 📸 Key Features

| Feature | Description |
| :--- | :--- |
| **Hero Experience** | Michelin-recommended badge, high-res visual showcase, trust metrics (15+ awards, 4.9★ rating), and floating culinary accolades. |
| **Chef's Signature Specials** | Curated dishes with sommelier vintage wine pairings, preparation times, and calorie breakdowns. |
| **Interactive Menu Filter** | Instant client-side search, category switcher (Starters, Mains, Desserts, Cocktails), and dietary checkboxes. |
| **Dish Detail Modal** | Rich modal dialog featuring high-res imagery, artisanal ingredient breakdowns, allergen warnings, and quick "Add to Bag". |
| **Table Booking Engine** | Party size stepper (1–14 guests), date constraints (disabled past dates), seating area picker (Dining Room, Greenhouse Solarium, Wine Vault), and client validation. |
| **Confirmation Ticket Pass** | Generates unique booking reference code (`SLS-RES-XXXXXX`), summary grid, and one-click print capability. |
| **Online Order / Tasting Bag** | Slide-out drawer with quantity steppers, discount promo code validator, order summary, and simulated checkout receipt. |
| **Live Opening Status** | Real-time calculation showing "Open Now" with pulsing indicator or next upcoming service opening time. |
| **Dark & Light Mode** | Fluid theme switching saved to `localStorage` for returning visitors. |

---

## 💻 Tech Stack & Architecture

- **Semantic HTML5:** Schema.org JSON-LD microdata for restaurant SEO, Open Graph tags, accessible ARIA roles.
- **Modern CSS3:** CSS Custom Properties (CSS variables), CSS Grid & Flexbox, Glassmorphism, smooth keyframe animations, mobile-first responsive media queries.
- **Vanilla JavaScript (ES6+):** Modular IIFE modules (`menu.js`, `cart.js`, `reservation.js`, `app.js`), Event Delegation, Debouncing, DOM manipulation, `localStorage` caching.
- **Zero Heavy Dependencies:** Runs natively in any browser with zero installation steps required—ideal for recruiters and hiring managers to review instantly.

---

## 📂 Project Structure

```plaintext
solstice-restaurant/
├── index.html            # Main semantic markup, SEO, and application layout
├── README.md             # Project documentation & CV portfolio highlights
├── css/
│   ├── style.css         # Design system, themes, layouts, responsive rules
│   └── animations.css    # Keyframe animations, pulse effects, transitions
├── js/
│   ├── menu-data.js      # Curated dataset of 18+ artisanal dishes & wine pairings
│   ├── menu.js           # Menu rendering, filter tabs, instant search, detail modal
│   ├── cart.js           # Tasting bag state, promo code logic, checkout simulation
│   ├── reservation.js    # Party stepper, seating selection, booking ticket generator
│   └── app.js            # Theme switcher, scroll spy, live hours status, toasts
└── assets/
    └── images/           # Local visual assets & icons
```

---

## 🚀 How to Run Locally

### Option 1: Direct Browser Launch (Easiest)
Simply double-click [`index.html`](file:///C:/Users/Admin/.gemini/antigravity/scratch/solstice-restaurant/index.html) to open the website directly in Chrome, Edge, Safari, or Firefox.

### Option 2: Using Built-in Python Server
Open terminal/PowerShell in the project directory:
```bash
python -m http.server 3000
```
Open your browser and navigate to: `http://localhost:3000`

---

## 🌐 Free 1-Minute Deployment Options for Your Portfolio

1. **GitHub Pages:**
   - Create a new GitHub repo (e.g. `solstice-restaurant`).
   - Push the files and enable **GitHub Pages** under repository **Settings > Pages**.
   - Your site is live at: `https://<your-username>.github.io/solstice-restaurant/`

2. **Vercel / Netlify:**
   - Drag and drop the `solstice-restaurant` folder onto [Netlify Drop](https://app.netlify.com/drop) or import from GitHub on [Vercel](https://vercel.com).
   - Get a free custom `.vercel.app` or `.netlify.app` production link to add to your CV!

---

## 🎁 Bonus Promo Codes to Test Online Ordering
- `WELCOME10` — 10% Welcome discount
- `CHEFSPECIAL` — 10% VIP culinary discount

---

© 2026 Developed for Portfolio & CV Presentation.
