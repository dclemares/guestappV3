/*
 * <chekin-booking-card> - reusable booking ticket (Guest App V3)
 *
 *   <script src="<path>/components/chekin-booking-card.js" defer></script>
 *   <chekin-booking-card></chekin-booking-card>
 *
 * Attributes:
 *   location          location line                  (default "Seville, Spain")
 *   checkin-day       left date day                  (default "10")
 *   checkin-month     left date month/year           (default "Jun 2026")
 *   checkin-time      left date supporting text      (default "Check-in 15:00")
 *   checkout-day      right date day                 (default "12")
 *   checkout-month    right date month/year          (default "Jun 2026")
 *   checkout-time     right date supporting text     (default "Check-out 11:00")
 *   nights            middle stay length             (default "2 nights")
 *   booking-ref       booking reference              (default "8059.191.347")
 *   status-title      locked status title            (default "KEY LOCKED")
 *   status-subtitle   locked status subtitle         (default "FINISH CHECK-IN")
 *
 * Self-contained: injects its own CSS + the Montserrat font once.
 */
(function () {
  if (window.customElements && customElements.get('chekin-booking-card')) return;

  var FONT_HREF = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&family=Poppins:wght@400;500;600&display=swap';
  var idCounter = 0;

  function ensureFonts() {
    if (document.getElementById('chekin-fonts')) return;
    var l = document.createElement('link');
    l.id = 'chekin-fonts';
    l.rel = 'stylesheet';
    l.href = FONT_HREF;
    document.head.appendChild(l);
  }

  var CSS = [
    "chekin-booking-card{display:block;width:min(100%,920px);aspect-ratio:2128/575;box-sizing:border-box;",
    "  font-family:'Montserrat',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;",
    "  -webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;}",
    "chekin-booking-card *{box-sizing:border-box;}",
    "chekin-booking-card .ticket-svg{display:block;width:100%;height:100%;overflow:visible;}",
    "chekin-booking-card .tk-lock{transform-box:fill-box;transform-origin:center;}",
    "chekin-booking-card:hover .tk-lock{animation:booking-card-lock .45s ease-in-out;}",
    "@keyframes booking-card-lock{0%,100%{transform:translateX(0)}25%{transform:translateX(-3px)}55%{transform:translateX(3px)}80%{transform:translateX(-1px)}}"
  ].join('\n');

  function ensureCSS() {
    if (document.getElementById('chekin-booking-card-css')) return;
    var s = document.createElement('style');
    s.id = 'chekin-booking-card-css';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function attr(el, name, fallback) {
    var value = el.getAttribute(name);
    return value == null ? fallback : value;
  }

  function ticketSvg(id, data) {
    var perfDots = 'perfDots_' + id;
    var leftMask = 'leftCardMask_' + id;
    var rightMask = 'rightCardMask_' + id;
    var navySoft = 'navySoft_' + id;
    var mainShadow = 'mainShadow_' + id;
    var stubShadow = 'stubShadow_' + id;
    var label = 'Booking ' + data.bookingRef + ', ' + data.checkinTime + ', ' + data.checkoutTime + ', ' + data.nights + ', ' + data.statusTitle;

    return '<svg class="ticket-svg" role="img" aria-label="' + esc(label) + '" viewBox="16 75 2128 575" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">' +
      '<defs>' +
        '<radialGradient id="' + navySoft + '" cx="820" cy="320" r="760" gradientUnits="userSpaceOnUse">' +
          '<stop offset="0%" stop-color="#141955"/>' +
          '<stop offset="100%" stop-color="#09103E"/>' +
        '</radialGradient>' +
        '<filter id="' + mainShadow + '" x="0" y="0" width="1800" height="700" filterUnits="userSpaceOnUse">' +
          '<feDropShadow dx="0" dy="34" stdDeviation="28" flood-color="#12164C" flood-opacity="0.24"/>' +
        '</filter>' +
        '<filter id="' + stubShadow + '" x="1500" y="0" width="720" height="720" filterUnits="userSpaceOnUse">' +
          '<feDropShadow dx="0" dy="28" stdDeviation="22" flood-color="#12164C" flood-opacity="0.22"/>' +
        '</filter>' +
        '<pattern id="' + perfDots + '" x="1634.8" y="136.8" width="16" height="16" patternUnits="userSpaceOnUse">' +
          '<circle cx="3.2" cy="3.2" r="3.2" fill="black"/>' +
        '</pattern>' +
        '<mask id="' + leftMask + '" maskUnits="userSpaceOnUse">' +
          '<rect width="2172" height="724" fill="black"/>' +
          '<path d="M 135 93 H 1605 A 33 33 0 0 0 1638 126 V 562 A 33 33 0 0 0 1605 595 H 135 C 99.7 595 71 566.3 71 531 V 157 C 71 121.7 99.7 93 135 93 Z" fill="white"/>' +
          '<rect x="1634.8" y="136.8" width="6.4" height="423" fill="url(#' + perfDots + ')"/>' +
        '</mask>' +
        '<mask id="' + rightMask + '" maskUnits="userSpaceOnUse">' +
          '<rect width="2172" height="724" fill="black"/>' +
          '<path d="M 1671 93 H 2014 C 2049.3 93 2078 121.7 2078 157 V 531 C 2078 566.3 2049.3 595 2014 595 H 1671 A 33 33 0 0 0 1638 562 V 126 A 33 33 0 0 0 1671 93 Z" fill="white"/>' +
          '<rect x="1634.8" y="136.8" width="6.4" height="423" fill="url(#' + perfDots + ')"/>' +
        '</mask>' +
      '</defs>' +
      '<g filter="url(#' + mainShadow + ')">' +
        '<path d="M 135 93 H 1605 A 33 33 0 0 0 1638 126 V 562 A 33 33 0 0 0 1605 595 H 135 C 99.7 595 71 566.3 71 531 V 157 C 71 121.7 99.7 93 135 93 Z" fill="url(#' + navySoft + ')" mask="url(#' + leftMask + ')"/>' +
      '</g>' +
      '<g filter="url(#' + stubShadow + ')">' +
        '<path d="M 1671 93 H 2014 C 2049.3 93 2078 121.7 2078 157 V 531 C 2078 566.3 2049.3 595 2014 595 H 1671 A 33 33 0 0 0 1638 562 V 126 A 33 33 0 0 0 1671 93 Z" fill="url(#' + navySoft + ')" mask="url(#' + rightMask + ')"/>' +
      '</g>' +
      '<g transform="translate(25 25)" font-family="Montserrat, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif">' +
        '<g transform="translate(130 139)" opacity="0.72">' +
          '<path d="M20 42C20 42 36 27.8 36 15.8C36 7 28.8 0 20 0C11.2 0 4 7 4 15.8C4 27.8 20 42 20 42Z" fill="none" stroke="white" stroke-width="3.8" stroke-linecap="round" stroke-linejoin="round"/>' +
          '<circle cx="20" cy="15.8" r="5.1" fill="none" stroke="white" stroke-width="3.8"/>' +
        '</g>' +
        '<text x="184" y="171" fill="white" opacity="0.68" font-size="38" font-weight="730" letter-spacing="-0.8">' + esc(data.location) + '</text>' +
        '<text x="124" y="315" fill="white" font-size="92" font-weight="900" letter-spacing="-4">' + esc(data.checkinDay) + '</text>' +
        '<text x="238" y="315" fill="white" font-size="43" font-weight="780" letter-spacing="-1.2">' + esc(data.checkinMonth) + '</text>' +
        '<text x="126" y="372" fill="white" opacity="0.58" font-size="31" font-weight="560" letter-spacing="-0.7">' + esc(data.checkinTime) + '</text>' +
        '<line x1="456" y1="306" x2="601" y2="306" stroke="white" stroke-opacity="0.55" stroke-width="3" stroke-dasharray="9 9"/>' +
        '<g transform="translate(622 290)" opacity="0.62">' +
          '<path d="M29 18.4C25.3 22 20.4 24.2 15 24.2C6.7 24.2 0 17.5 0 9.2C0 4.5 2.2 0.4 5.6 -2.3C5 0 4.9 2.5 5.6 5C7.5 12.3 14.9 16.7 22.2 14.8C24.8 14.1 27.1 12.8 29 11V18.4Z" fill="none" stroke="white" stroke-width="2.4" stroke-linejoin="round"/>' +
        '</g>' +
        '<text x="660" y="317" fill="white" opacity="0.58" font-size="32" font-weight="580" letter-spacing="-0.7">' + esc(data.nights) + '</text>' +
        '<line x1="792" y1="306" x2="940" y2="306" stroke="white" stroke-opacity="0.55" stroke-width="3" stroke-dasharray="9 9"/>' +
        '<text x="1019" y="315" fill="white" font-size="92" font-weight="900" letter-spacing="-4">' + esc(data.checkoutDay) + '</text>' +
        '<text x="1133" y="315" fill="white" font-size="43" font-weight="780" letter-spacing="-1.2">' + esc(data.checkoutMonth) + '</text>' +
        '<text x="1030" y="372" fill="white" opacity="0.58" font-size="31" font-weight="560" letter-spacing="-0.7">' + esc(data.checkoutTime) + '</text>' +
        '<text x="126" y="490" fill="white" opacity="0.7" font-size="28" font-weight="860" letter-spacing="7">BOOKING REF</text>' +
        '<text x="410" y="490" fill="white" font-size="39" font-weight="860" letter-spacing="1">' + esc(data.bookingRef) + '</text>' +
      '</g>' +
      '<circle cx="1858" cy="260" r="78" fill="none" stroke="white" stroke-opacity="0.44" stroke-width="4"/>' +
      '<g class="tk-lock"><g transform="translate(1818 220)">' +
        '<rect x="10" y="26" width="60" height="46" rx="11" fill="none" stroke="white" stroke-width="4"/>' +
        '<path d="M24 26V16C24 4 33 0 40 0C47 0 56 4 56 16V26" fill="none" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>' +
        '<circle cx="40" cy="48" r="5" fill="white"/>' +
        '<path d="M40 52V60" stroke="white" stroke-width="4" stroke-linecap="round"/>' +
      '</g></g>' +
      '<text x="1858" y="408" text-anchor="middle" fill="white" font-family="Montserrat, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="38" font-weight="900" letter-spacing="0.4">' + esc(data.statusTitle) + '</text>' +
      '<text x="1858" y="468" text-anchor="middle" fill="white" opacity="0.9" font-family="Montserrat, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="27" font-weight="560" letter-spacing="3.2">' + esc(data.statusSubtitle) + '</text>' +
    '</svg>';
  }

  class ChekinBookingCard extends HTMLElement {
    static get observedAttributes() {
      return [
        'location', 'checkin-day', 'checkin-month', 'checkin-time',
        'checkout-day', 'checkout-month', 'checkout-time',
        'nights', 'booking-ref', 'status-title', 'status-subtitle'
      ];
    }

    connectedCallback() {
      ensureFonts();
      ensureCSS();
      if (!this._ticketId) {
        idCounter += 1;
        this._ticketId = 'ticket' + idCounter;
      }
      this.render();
    }

    attributeChangedCallback() {
      if (this.isConnected) this.render();
    }

    render() {
      var data = {
        location: attr(this, 'location', 'Seville, Spain'),
        checkinDay: attr(this, 'checkin-day', '10'),
        checkinMonth: attr(this, 'checkin-month', 'Jun 2026'),
        checkinTime: attr(this, 'checkin-time', 'Check-in 15:00'),
        checkoutDay: attr(this, 'checkout-day', '12'),
        checkoutMonth: attr(this, 'checkout-month', 'Jun 2026'),
        checkoutTime: attr(this, 'checkout-time', 'Check-out 11:00'),
        nights: attr(this, 'nights', '2 nights'),
        bookingRef: attr(this, 'booking-ref', '8059.191.347'),
        statusTitle: attr(this, 'status-title', 'KEY LOCKED'),
        statusSubtitle: attr(this, 'status-subtitle', 'FINISH CHECK-IN')
      };

      this.innerHTML = ticketSvg(this._ticketId, data);
    }
  }

  customElements.define('chekin-booking-card', ChekinBookingCard);
})();
