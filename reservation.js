/**
 * Solstice & Sage Restaurant - Table Reservation Controller
 * Handles party size stepper, date selection, time slot picking, seating preference,
 * client-side validation, and instant confirmation ticket generation.
 */

(function () {
  let guestCount = 2;
  let selectedTimeSlot = "7:30 PM";
  let selectedSeating = "Main Dining Room";

  // Elements
  let formEl = null;
  let stepperValueEl = null;
  let stepperMinusBtn = null;
  let stepperPlusBtn = null;
  let dateInputEl = null;
  let timeSlotsContainerEl = null;
  let seatingOptionsContainerEl = null;

  function initReservation() {
    formEl = document.getElementById("reservationForm");
    stepperValueEl = document.getElementById("guestCountValue");
    stepperMinusBtn = document.getElementById("guestCountMinus");
    stepperPlusBtn = document.getElementById("guestCountPlus");
    dateInputEl = document.getElementById("resDate");
    timeSlotsContainerEl = document.getElementById("timeSlotsContainer");
    seatingOptionsContainerEl = document.getElementById("seatingOptions");

    if (!formEl) return;

    setupDateConstraints();
    setupStepper();
    setupTimeSlots();
    setupSeatingOptions();
    setupFormSubmission();
  }

  function setupDateConstraints() {
    if (!dateInputEl) return;

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const formatDate = (d) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    dateInputEl.min = formatDate(today);
    dateInputEl.value = formatDate(tomorrow);
  }

  function setupStepper() {
    if (!stepperValueEl || !stepperMinusBtn || !stepperPlusBtn) return;

    const updateDisplay = () => {
      stepperValueEl.textContent = `${guestCount} ${guestCount === 1 ? "Guest" : "Guests"}`;
      stepperMinusBtn.disabled = guestCount <= 1;
      stepperPlusBtn.disabled = guestCount >= 14;
    };

    stepperMinusBtn.addEventListener("click", () => {
      if (guestCount > 1) {
        guestCount--;
        updateDisplay();
      }
    });

    stepperPlusBtn.addEventListener("click", () => {
      if (guestCount < 14) {
        guestCount++;
        updateDisplay();
      }
    });

    updateDisplay();
  }

  function setupTimeSlots() {
    if (!timeSlotsContainerEl) return;

    timeSlotsContainerEl.addEventListener("click", (e) => {
      const btn = e.target.closest(".time-slot-btn");
      if (!btn || btn.classList.contains("disabled")) return;

      timeSlotsContainerEl.querySelectorAll(".time-slot-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      selectedTimeSlot = btn.getAttribute("data-time") || btn.textContent.trim();
    });
  }

  function setupSeatingOptions() {
    if (!seatingOptionsContainerEl) return;

    seatingOptionsContainerEl.addEventListener("click", (e) => {
      const card = e.target.closest(".seating-radio-card");
      if (!card) return;

      seatingOptionsContainerEl.querySelectorAll(".seating-radio-card").forEach(c => c.classList.remove("active"));
      card.classList.add("active");
      selectedSeating = card.getAttribute("data-seating") || "Main Dining Room";
    });
  }

  function setupFormSubmission() {
    formEl.addEventListener("submit", (e) => {
      e.preventDefault();

      const nameInput = document.getElementById("resName");
      const emailInput = document.getElementById("resEmail");
      const phoneInput = document.getElementById("resPhone");
      const occasionInput = document.getElementById("resOccasion");
      const notesInput = document.getElementById("resNotes");

      const name = nameInput ? nameInput.value.trim() : "";
      const email = emailInput ? emailInput.value.trim() : "";
      const phone = phoneInput ? phoneInput.value.trim() : "";
      const date = dateInputEl ? dateInputEl.value : "";
      const occasion = occasionInput ? occasionInput.value : "Casual Dining";
      const notes = notesInput ? notesInput.value.trim() : "None";

      if (!name || !email || !phone || !date) {
        alert("Please fill out all required fields before confirming your reservation.");
        return;
      }

      const bookingReference = "SLS-RES-" + Math.floor(100000 + Math.random() * 900000);

      // Show Ticket Confirmation Modal
      showConfirmationTicket({
        bookingReference,
        name,
        email,
        phone,
        date,
        time: selectedTimeSlot,
        guests: guestCount,
        seating: selectedSeating,
        occasion,
        notes
      });

      // Reset form fields
      formEl.reset();
      setupDateConstraints();
      guestCount = 2;
      document.getElementById("guestCountValue").textContent = "2 Guests";
    });
  }

  function showConfirmationTicket(data) {
    const modal = document.getElementById("ticketModal");
    const container = document.getElementById("ticketModalContent");
    if (!modal || !container) return;

    const formattedDate = new Date(data.date + "T00:00:00").toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });

    container.innerHTML = `
      <div class="ticket-wrapper">
        <div class="ticket-header-icon">✦</div>
        <span style="font-size: 0.82rem; text-transform: uppercase; letter-spacing: 0.15em; color: var(--accent-gold); font-weight: 700;">
          Reservation Confirmed
        </span>
        <h3 style="font-family: var(--font-serif); font-size: 1.8rem; margin: 0.4rem 0;">We Look Forward to Hosting You</h3>
        <p style="color: var(--text-secondary); font-size: 0.95rem; max-width: 440px; margin: 0 auto;">
          A calendar invitation and SMS confirmation have been generated for your party.
        </p>

        <div class="ticket-code-badge">
          REF: ${data.bookingReference}
        </div>

        <div class="ticket-details-grid">
          <div class="ticket-item">
            <strong>PRIMARY GUEST</strong>
            <span>${data.name}</span>
          </div>
          <div class="ticket-item">
            <strong>PARTY SIZE</strong>
            <span>${data.guests} ${data.guests === 1 ? 'Guest' : 'Guests'}</span>
          </div>
          <div class="ticket-item">
            <strong>DATE & TIME</strong>
            <span>${formattedDate} at ${data.time}</span>
          </div>
          <div class="ticket-item">
            <strong>SEATING AREA</strong>
            <span>${data.seating}</span>
          </div>
          <div class="ticket-item">
            <strong>OCCASION</strong>
            <span>${data.occasion}</span>
          </div>
          <div class="ticket-item">
            <strong>CONTACT</strong>
            <span>${data.phone}</span>
          </div>
        </div>

        <div style="background: rgba(229, 185, 95, 0.08); border-radius: var(--radius-md); padding: 1rem; margin-bottom: 2rem; font-size: 0.85rem; color: var(--text-secondary); text-align: left;">
          <strong style="color: var(--accent-gold); display: block; margin-bottom: 0.2rem;">DRESS CODE & POLICIES</strong>
          Elegant casual / smart evening attire. Tables are held for 15 minutes past reservation time. Valet parking complimentary at main entrance.
        </div>

        <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
          <button class="btn btn-secondary btn-sm" onclick="window.print()">
            🖨️ Print Reservation Pass
          </button>
          <button class="btn btn-primary btn-sm" id="closeTicketModalBtn">
            Done
          </button>
        </div>
      </div>
    `;

    modal.classList.add("open");

    const closeBtn = document.getElementById("closeTicketModalBtn");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        modal.classList.remove("open");
      });
    }

    if (window.SolsticeApp && window.SolsticeApp.showToast) {
      window.SolsticeApp.showToast(`🍷 Table reserved for ${data.name}! Booking Ref: ${data.bookingReference}`);
    }
  }

  // Initialize once DOM is ready
  document.addEventListener("DOMContentLoaded", initReservation);

  window.SolsticeReservation = {
    setGuests: (n) => { guestCount = n; },
    setTime: (t) => { selectedTimeSlot = t; }
  };
})();
