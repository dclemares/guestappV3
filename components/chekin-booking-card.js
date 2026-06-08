/*
 * <chekin-booking-card> - reusable booking ticket (Guest App V3)
 *
 *   <script src="<path>/components/chekin-booking-card.js" defer></script>
 *   <chekin-booking-card status="locked"></chekin-booking-card>
 *
 * Attributes:
 *   status            locked | separated | digital-key (also 0 | 1 | 2)
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
 *   digital-title     digital key status title       (default "DIGITAL KEY")
 *   digital-subtitle  digital key status subtitle    (default "TAP TO OPEN THE DOOR")
 *
 * Self-contained: injects its own CSS + the Montserrat font once.
 */
(function () {
  var customElementsRegistry = window.customElements;
  if (!customElementsRegistry || customElementsRegistry.get('chekin-booking-card')) return;

  var FONT_HREF = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&family=Poppins:wght@400;500;600&display=swap';
  var idCounter = 0;

  var BASE_VIEWBOX_WIDTH = 2128;
  var BASE_VIEWBOX_HEIGHT = 575;
  var BASE_SPLIT_X = 1638;
  var RIGHT_STUB_WIDTH = 440;
  var RIGHT_VIEWBOX_PAD = 66;
  var GREEN_STUB_WIDTH = 413;
  var GREEN_RIGHT_INSET = 4;
  var CONTENT_OFFSET_X = 25;
  var LEFT_CARD_EDGE_X = 71;
  var CHECKIN_DAY_X = 124;
  var CHECKOUT_DAY_X = 1019;
  var CHECKOUT_MONTH_X = 1133;
  var CHECKOUT_TIME_X = 1030;

  function fmt(n) {
    return String(Math.round(n * 100) / 100);
  }

  function layoutForSize(width, height) {
    var viewWidth = width && height ? width * BASE_VIEWBOX_HEIGHT / height : BASE_VIEWBOX_WIDTH;
    var rightEdge = 16 + viewWidth - RIGHT_VIEWBOX_PAD;
    var split = rightEdge - RIGHT_STUB_WIDTH;
    var dx = split - BASE_SPLIT_X;
    var contentDx = dx / 2;
    var greenEdge = rightEdge - GREEN_RIGHT_INSET;
    var greenSplit = greenEdge - GREEN_STUB_WIDTH;

    return {
      viewWidth: viewWidth,
      split: split,
      rightEdge: rightEdge,
      greenSplit: greenSplit,
      greenEdge: greenEdge,
      dx: dx,
      contentDx: contentDx,
      perfX: split - 3.2,
      greenPerfX: greenSplit - 3.2
    };
  }

  function leftCardPath(layout) {
    var split = layout.split;
    return 'M 135 93 H ' + fmt(split - 33) + ' A 33 33 0 0 0 ' + fmt(split) + ' 126 V 562 A 33 33 0 0 0 ' + fmt(split - 33) + ' 595 H 135 C 99.7 595 71 566.3 71 531 V 157 C 71 121.7 99.7 93 135 93 Z';
  }

  function rightCardPath(layout) {
    var split = layout.split;
    var edge = layout.rightEdge;
    return 'M ' + fmt(split + 33) + ' 93 H ' + fmt(edge - 64) + ' C ' + fmt(edge - 28.7) + ' 93 ' + fmt(edge) + ' 121.7 ' + fmt(edge) + ' 157 V 531 C ' + fmt(edge) + ' 566.3 ' + fmt(edge - 28.7) + ' 595 ' + fmt(edge - 64) + ' 595 H ' + fmt(split + 33) + ' A 33 33 0 0 0 ' + fmt(split) + ' 562 V 126 A 33 33 0 0 0 ' + fmt(split + 33) + ' 93 Z';
  }

  function greenCardPath(layout) {
    var split = layout.greenSplit;
    var edge = layout.greenEdge;
    return 'M ' + fmt(split + 33) + ' 103 H ' + fmt(edge - 58) + ' C ' + fmt(edge - 26) + ' 103 ' + fmt(edge) + ' 129 ' + fmt(edge) + ' 161 V 544 C ' + fmt(edge) + ' 576 ' + fmt(edge - 26) + ' 602 ' + fmt(edge - 58) + ' 602 H ' + fmt(split + 33) + ' A 33 33 0 0 0 ' + fmt(split) + ' 569 V 136 A 33 33 0 0 0 ' + fmt(split + 33) + ' 103 Z';
  }

  function ensureFonts() {
    if (document.getElementById('chekin-fonts')) return;
    var l = document.createElement('link');
    l.id = 'chekin-fonts';
    l.rel = 'stylesheet';
    l.href = FONT_HREF;
    document.head.appendChild(l);
  }

  var CSS = [
    "chekin-booking-card{display:block;width:min(100%,920px);height:var(--booking-card-fixed-height,auto);aspect-ratio:2128/575;box-sizing:border-box;overflow:visible;",
    "  font-family:'Montserrat',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;",
    "  -webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;}",
    "chekin-booking-card *{box-sizing:border-box;}",
    "chekin-booking-card .ticket-svg{display:block;width:100%;height:100%;overflow:visible;}",
    "chekin-booking-card .tk-lock{transform-box:fill-box;transform-origin:center;}",
    "chekin-booking-card .tk-halo{transform-box:fill-box;transform-origin:center;transform:scale(.45);opacity:0;",
    "  transition:transform .6s cubic-bezier(.22,.7,.25,1),opacity .5s ease;}",
    "chekin-booking-card .tk-gkey:hover .tk-halo{transform:scale(1);opacity:1;}",
    "chekin-booking-card .tk-gcard{pointer-events:auto;cursor:pointer;}",
    "chekin-booking-card .tk-lock-hotspot{pointer-events:all;cursor:pointer;}",
    "chekin-booking-card .tk-lock-content{pointer-events:all;cursor:pointer;}",
    "chekin-booking-card .tk-lock-hotspot:hover + .tk-lock-content .tk-lock,chekin-booking-card .tk-lock-content:hover .tk-lock{animation:booking-card-lock .45s ease-in-out;}",
    "@keyframes booking-card-lock{0%,100%{transform:rotate(0)}15%{transform:rotate(-8deg)}30%{transform:rotate(7deg)}45%{transform:rotate(-5deg)}60%{transform:rotate(3deg)}80%{transform:rotate(-1.5deg)}}"
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

  function normalizeStatus(status) {
    var value = String(status || '').toLowerCase().trim();
    if (value === '1' || value === 'separated' || value === 'split' || value === 'key-locked') return 'separated';
    if (value === '2' || value === 'digital' || value === 'digital-key' || value === 'complete') return 'digital-key';
    return 'locked';
  }

  function idsFor(id) {
    return {
      perf: 'perfDots_' + id,
      greenPerf: 'greenPerfDots_' + id,
      leftMask: 'leftCardMask_' + id,
      rightMask: 'rightCardMask_' + id,
      greenMask: 'greenCardMask_' + id,
      navySoft: 'navySoft_' + id,
      mainShadow: 'mainShadow_' + id,
      stubShadow: 'stubShadow_' + id,
      haloGrad: 'haloGrad_' + id
    };
  }

  function defs(status, ids, layout) {
    var separated = status === 'separated';
    var digital = status === 'digital-key';
    var perfY = '132.8';
    var perfH = '422.4';
    var greenPerfY = '141.3';
    var greenPerfH = '422.4';
    var leftPath = leftCardPath(layout);
    var rightPath = rightCardPath(layout);
    var greenPath = greenCardPath(layout);
    var navy = digital
      ? '<radialGradient id="' + ids.navySoft + '" cx="50%" cy="45%" r="80%"><stop offset="0%" stop-color="#141955"/><stop offset="100%" stop-color="#09103E"/></radialGradient>'
      : '<radialGradient id="' + ids.navySoft + '" cx="820" cy="320" r="760" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#141955"/><stop offset="100%" stop-color="#09103E"/></radialGradient>';
    var shadowBounds = 'x="-260" y="-180" width="7000" height="1080" filterUnits="userSpaceOnUse"';
    var stubFilter = separated
      ? '<filter id="' + ids.stubShadow + '" ' + shadowBounds + '><feDropShadow dx="0" dy="30" stdDeviation="22" flood-color="#12164C" flood-opacity="0.22"/></filter>'
      : digital
        ? '<filter id="' + ids.stubShadow + '" ' + shadowBounds + '><feDropShadow dx="0" dy="30" stdDeviation="22" flood-color="#12164C" flood-opacity="0.2"/></filter>'
        : '<filter id="' + ids.stubShadow + '" ' + shadowBounds + '><feDropShadow dx="0" dy="28" stdDeviation="22" flood-color="#12164C" flood-opacity="0.22"/></filter>';
    var greenDefs = digital
      ? '<pattern id="' + ids.greenPerf + '" x="' + fmt(layout.greenPerfX) + '" y="' + greenPerfY + '" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="3.2" cy="3.2" r="3.2" fill="black"/></pattern>' +
        '<mask id="' + ids.greenMask + '" maskUnits="userSpaceOnUse"><rect width="6000" height="724" fill="black"/><path d="' + greenPath + '" fill="white"/><rect x="' + fmt(layout.greenPerfX) + '" y="' + greenPerfY + '" width="6.4" height="' + greenPerfH + '" fill="url(#' + ids.greenPerf + ')"/></mask>' +
        '<radialGradient id="' + ids.haloGrad + '" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.16"/><stop offset="46%" stop-color="#FFFFFF" stop-opacity="0.22"/><stop offset="66%" stop-color="#FFFFFF" stop-opacity="0.52"/><stop offset="100%" stop-color="#FFFFFF" stop-opacity="0"/></radialGradient>'
      : '';

    return '<defs>' +
      navy +
      '<filter id="' + ids.mainShadow + '" ' + shadowBounds + '><feDropShadow dx="0" dy="34" stdDeviation="28" flood-color="#12164C" flood-opacity="0.24"/></filter>' +
      stubFilter +
      '<pattern id="' + ids.perf + '" x="' + fmt(layout.perfX) + '" y="' + perfY + '" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="3.2" cy="3.2" r="3.2" fill="black"/></pattern>' +
      '<mask id="' + ids.leftMask + '" maskUnits="userSpaceOnUse"><rect width="6000" height="724" fill="black"/><path d="' + leftPath + '" fill="white"/><rect x="' + fmt(layout.perfX) + '" y="' + perfY + '" width="6.4" height="' + perfH + '" fill="url(#' + ids.perf + ')"/></mask>' +
      '<mask id="' + ids.rightMask + '" maskUnits="userSpaceOnUse"><rect width="6000" height="724" fill="black"/><path d="' + rightPath + '" fill="white"/><rect x="' + fmt(layout.perfX) + '" y="' + perfY + '" width="6.4" height="' + perfH + '" fill="url(#' + ids.perf + ')"/></mask>' +
      greenDefs +
    '</defs>';
  }

  function estimateNightsWidth(value) {
    return Math.max(116, String(value || '').length * 13.5 + 22);
  }

  function estimateCheckoutWidth(data) {
    var dayWidth = Math.max(92, String(data.checkoutDay || '').length * 49);
    var monthWidth = String(data.checkoutMonth || '').length * 24 + 18;
    var timeWidth = String(data.checkoutTime || '').length * 17.5 + 18;

    return Math.max(
      CHECKOUT_DAY_X + dayWidth,
      CHECKOUT_MONTH_X + monthWidth,
      CHECKOUT_TIME_X + timeWidth
    );
  }

  function checkoutDxForContent(data, layout) {
    if (layout.dx >= 0) return layout.dx;

    var minRightGap = CONTENT_OFFSET_X + CHECKIN_DAY_X - LEFT_CARD_EDGE_X;
    var maxCheckoutDx = layout.split - CONTENT_OFFSET_X - minRightGap - estimateCheckoutWidth(data);

    return Math.max(layout.dx, Math.min(0, maxCheckoutDx));
  }

  function shouldHideNights(data, layout, checkoutDx) {
    var cx = checkoutDx / 2;
    var leftLineLength = 611 + cx - 500;
    var rightLineLength = 953 + checkoutDx - (842 + cx);
    var nightsTextRight = 689 + cx + estimateNightsWidth(data.nights);
    var checkoutDateLeft = CHECKOUT_DAY_X + checkoutDx;

    return leftLineLength < 20 || rightLineLength < 20 || nightsTextRight > checkoutDateLeft - 58;
  }

  function leftContent(data, layout) {
    var checkoutDx = checkoutDxForContent(data, layout);
    var cx = checkoutDx / 2;
    var nightsGroup = shouldHideNights(data, layout, checkoutDx)
      ? ''
      : '<g class="tk-nights">' +
        '<line x1="500" y1="306" x2="' + fmt(611 + cx) + '" y2="306" stroke="white" stroke-opacity="0.55" stroke-width="3" stroke-dasharray="9 9"/>' +
        '<g transform="translate(' + fmt(637 + cx) + ' 290)" opacity="0.62"><path d="M29 18.4C25.3 22 20.4 24.2 15 24.2C6.7 24.2 0 17.5 0 9.2C0 4.5 2.2 0.4 5.6 -2.3C5 0 4.9 2.5 5.6 5C7.5 12.3 14.9 16.7 22.2 14.8C24.8 14.1 27.1 12.8 29 11V18.4Z" fill="none" stroke="white" stroke-width="2.4" stroke-linejoin="round"/></g>' +
        '<text x="' + fmt(689 + cx) + '" y="317" fill="white" opacity="0.58" font-size="32" font-weight="580" letter-spacing="-0.7">' + esc(data.nights) + '</text>' +
        '<line x1="' + fmt(842 + cx) + '" y1="306" x2="' + fmt(953 + checkoutDx) + '" y2="306" stroke="white" stroke-opacity="0.55" stroke-width="3" stroke-dasharray="9 9"/>' +
      '</g>';

    return '<g transform="translate(25 25)" font-family="Montserrat, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif">' +
      '<g transform="translate(130 139)" opacity="0.72">' +
        '<path d="M20 42C20 42 36 27.8 36 15.8C36 7 28.8 0 20 0C11.2 0 4 7 4 15.8C4 27.8 20 42 20 42Z" fill="none" stroke="white" stroke-width="3.8" stroke-linecap="round" stroke-linejoin="round"/>' +
        '<circle cx="20" cy="15.8" r="5.1" fill="none" stroke="white" stroke-width="3.8"/>' +
      '</g>' +
      '<text x="184" y="171" fill="white" opacity="0.68" font-size="38" font-weight="730" letter-spacing="-0.8">' + esc(data.location) + '</text>' +
      '<text x="124" y="315" fill="white" font-size="92" font-weight="900" letter-spacing="-4">' + esc(data.checkinDay) + '</text>' +
      '<text x="238" y="315" fill="white" font-size="43" font-weight="780" letter-spacing="-1.2">' + esc(data.checkinMonth) + '</text>' +
      '<text x="126" y="372" fill="white" opacity="0.58" font-size="31" font-weight="560" letter-spacing="-0.7">' + esc(data.checkinTime) + '</text>' +
      nightsGroup +
      '<text x="' + fmt(CHECKOUT_DAY_X + checkoutDx) + '" y="315" fill="white" font-size="92" font-weight="900" letter-spacing="-4">' + esc(data.checkoutDay) + '</text>' +
      '<text x="' + fmt(CHECKOUT_MONTH_X + checkoutDx) + '" y="315" fill="white" font-size="43" font-weight="780" letter-spacing="-1.2">' + esc(data.checkoutMonth) + '</text>' +
      '<text x="' + fmt(CHECKOUT_TIME_X + checkoutDx) + '" y="372" fill="white" opacity="0.58" font-size="31" font-weight="560" letter-spacing="-0.7">' + esc(data.checkoutTime) + '</text>' +
      '<text x="126" y="490" fill="white" opacity="0.7" font-size="28" font-weight="860" letter-spacing="7">BOOKING REF</text>' +
      '<text x="468" y="490" fill="white" font-size="39" font-weight="860" letter-spacing="1">' + esc(data.bookingRef) + '</text>' +
    '</g>';
  }

  function lockContent(data, layout) {
    var dx = layout.dx;
    return '<g class="tk-lock-content" transform="translate(' + fmt(dx) + ' 0)"><circle cx="1858" cy="260" r="78" fill="none" stroke="white" stroke-opacity="0.44" stroke-width="4"/>' +
      '<g class="tk-lock"><g transform="translate(1818 220)">' +
        '<rect x="10" y="26" width="60" height="46" rx="11" fill="none" stroke="white" stroke-width="4"/>' +
        '<path d="M24 26V16C24 4 33 0 40 0C47 0 56 4 56 16V26" fill="none" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>' +
        '<circle cx="40" cy="48" r="5" fill="white"/>' +
        '<path d="M40 52V60" stroke="white" stroke-width="4" stroke-linecap="round"/>' +
      '</g></g>' +
      '<text x="1858" y="408" text-anchor="middle" fill="white" font-family="Montserrat, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="38" font-weight="900" letter-spacing="0.4">' + esc(data.statusTitle) + '</text>' +
      '<text x="1858" y="468" text-anchor="middle" fill="white" opacity="0.9" font-family="Montserrat, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="27" font-weight="560" letter-spacing="3.2">' + esc(data.statusSubtitle) + '</text></g>';
  }

  function lockedRightCard(data, ids, separated, layout) {
    var rightPath = rightCardPath(layout);
    var card = '<g filter="url(#' + ids.stubShadow + ')"><path d="' + rightPath + '" fill="url(#' + ids.navySoft + ')" mask="url(#' + ids.rightMask + ')"/></g>' +
      '<path class="tk-lock-hotspot" d="' + rightPath + '" fill="transparent"/>' + lockContent(data, layout);
    return separated ? '<g transform="rotate(1.35 ' + fmt(layout.split) + ' 562)">' + card + '</g>' : card;
  }

  function digitalRightCard(data, ids, layout) {
    var dx = layout.greenSplit - 1661;
    return '<g class="tk-gkey" transform="rotate(3.2 ' + fmt(layout.greenSplit) + ' 352.5)">' +
      '<g filter="url(#' + ids.stubShadow + ')"><path d="' + greenCardPath(layout) + '" class="tk-gcard" fill="#00C853" mask="url(#' + ids.greenMask + ')"/></g>' +
      '<g transform="translate(' + fmt(dx) + ' 0)">' +
      '<circle class="tk-halo" cx="1867" cy="273" r="122" fill="url(#' + ids.haloGrad + ')"/>' +
      '<circle cx="1867" cy="273" r="78" fill="none" stroke="white" stroke-opacity="0.44" stroke-width="4"/>' +
      '<g transform="translate(1835 241) scale(2.7)" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 4h3a2 2 0 0 1 2 2v14"/><path d="M2 20h3"/><path d="M13 20h9"/><path d="M10 12v.01"/><path d="M13 4.562v16.157a1 1 0 0 1-1.242.97L5 20V5.562a2 2 0 0 1 1.515-1.94l4-1A2 2 0 0 1 13 4.562Z"/></g>' +
      '<text x="1867" y="416" text-anchor="middle" fill="white" font-family="Montserrat, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="39" font-weight="900" letter-spacing="0.4">' + esc(data.digitalTitle) + '</text>' +
      '<text x="1867" y="476" text-anchor="middle" fill="white" opacity="0.94" font-family="Montserrat, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="22" font-weight="500" letter-spacing="2">' + esc(data.digitalSubtitle) + '</text></g>' +
    '</g>';
  }

  function ticketSvg(id, data, layout) {
    var status = normalizeStatus(data.status);
    var ids = idsFor(id);
    var leftPath = leftCardPath(layout);
    var right = status === 'digital-key' ? digitalRightCard(data, ids, layout) : lockedRightCard(data, ids, status === 'separated', layout);
    var labelStatus = status === 'digital-key' ? data.digitalTitle : data.statusTitle;
    var label = 'Booking ' + data.bookingRef + ', ' + data.checkinTime + ', ' + data.checkoutTime + ', ' + data.nights + ', ' + labelStatus;

    return '<svg class="ticket-svg" data-status="' + status + '" role="img" aria-label="' + esc(label) + '" viewBox="16 75 ' + fmt(layout.viewWidth) + ' 575" preserveAspectRatio="xMinYMid meet" xmlns="http://www.w3.org/2000/svg">' +
      defs(status, ids, layout) +
      '<g filter="url(#' + ids.mainShadow + ')"><path d="' + leftPath + '" fill="url(#' + ids.navySoft + ')" mask="url(#' + ids.leftMask + ')"/></g>' +
      leftContent(data, layout) +
      right +
    '</svg>';
  }

  class ChekinBookingCard extends HTMLElement {
    static get observedAttributes() {
      return [
        'status', 'location', 'checkin-day', 'checkin-month', 'checkin-time',
        'checkout-day', 'checkout-month', 'checkout-time',
        'nights', 'booking-ref', 'status-title', 'status-subtitle',
        'digital-title', 'digital-subtitle'
      ];
    }

    connectedCallback() {
      ensureFonts();
      ensureCSS();
      if (!this._ticketId) {
        idCounter += 1;
        this._ticketId = 'ticket' + idCounter;
      }
      this.freezeHeight();
      this.updateLayout(true);
      this.observeSize();
    }

    disconnectedCallback() {
      if (this._resizeObserver) {
        this._resizeObserver.disconnect();
        this._resizeObserver = null;
      }
    }

    attributeChangedCallback() {
      if (this.isConnected) this.render();
    }

    freezeHeight() {
      if (this._fixedHeight) return;
      var rect = this.getBoundingClientRect();
      var width = rect.width || 920;
      var height = rect.height || width * BASE_VIEWBOX_HEIGHT / BASE_VIEWBOX_WIDTH;
      this._fixedHeight = height;
      this.style.setProperty('--booking-card-fixed-height', fmt(height) + 'px');
    }

    observeSize() {
      if (this._resizeObserver || typeof ResizeObserver === 'undefined') return;
      var self = this;
      this._resizeObserver = new ResizeObserver(function () {
        self.updateLayout(false);
      });
      this._resizeObserver.observe(this);
    }

    updateLayout(force) {
      var rect = this.getBoundingClientRect();
      var width = rect.width || 920;
      var height = this._fixedHeight || rect.height || width * BASE_VIEWBOX_HEIGHT / BASE_VIEWBOX_WIDTH;
      var nextLayout = layoutForSize(width, height);
      var previousWidth = this._layout ? this._layout.viewWidth : null;
      this._layout = nextLayout;
      if (force || previousWidth == null || Math.abs(previousWidth - nextLayout.viewWidth) > 0.5) {
        this.render();
      }
    }

    render() {
      var data = {
        status: attr(this, 'status', 'locked'),
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
        statusSubtitle: attr(this, 'status-subtitle', 'FINISH CHECK-IN'),
        digitalTitle: attr(this, 'digital-title', 'DIGITAL KEY'),
        digitalSubtitle: attr(this, 'digital-subtitle', 'TAP TO OPEN THE DOOR')
      };

      this.innerHTML = ticketSvg(this._ticketId, data, this._layout || layoutForSize(920, 920 * BASE_VIEWBOX_HEIGHT / BASE_VIEWBOX_WIDTH));
    }
  }

  customElementsRegistry.define('chekin-booking-card', ChekinBookingCard);
})();
