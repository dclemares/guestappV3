/*
 * <chekin-booking-card> - reusable booking ticket (Guest App V3)
 *
 *   <script src="<path>/components/chekin-booking-card.js" defer></script>
 *   <chekin-booking-card></chekin-booking-card>
 *
 * Attributes:
 *   checkin-day       left date day                 (default "10")
 *   checkin-month     left date month/year          (default "Jun 2026")
 *   checkin-time      left date supporting text     (default "Check-in 15:00")
 *   checkout-day      right date day                (default "12")
 *   checkout-month    right date month/year         (default "Jun 2026")
 *   checkout-time     right date supporting text    (default "Check-out 11:00")
 *   nights            middle stay length            (default "2 nights")
 *   booking-ref       booking reference             (default "8059.191.347")
 *   status-title      locked status title           (default "KEY LOCKED")
 *   status-subtitle   locked status subtitle        (default "FINISH CHECK-IN")
 *   location          optional location line        (default empty)
 *
 * Self-contained: injects its own CSS + the Montserrat font once.
 */
(function () {
  if (window.customElements && customElements.get('chekin-booking-card')) return;

  var FONT_HREF = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&family=Poppins:wght@400;500;600&display=swap';

  function ensureFonts() {
    if (document.getElementById('chekin-fonts')) return;
    var l = document.createElement('link');
    l.id = 'chekin-fonts'; l.rel = 'stylesheet'; l.href = FONT_HREF;
    document.head.appendChild(l);
  }

  var CSS = [
    "chekin-booking-card{display:block;width:min(100%,920px);box-sizing:border-box;container-type:inline-size;",
    "  --ticket-bg:#090f3b;--ticket-bg-soft:#171d5d;--ticket-ink:#fff;",
    "  --ticket-muted:rgba(255,255,255,.62);--ticket-faint:rgba(255,255,255,.24);",
    "  font-family:'Montserrat',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:var(--ticket-ink);",
    "  -webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;}",
    "chekin-booking-card *{box-sizing:border-box;}",
    "chekin-booking-card .booking-card{position:relative;isolation:isolate;display:grid;grid-template-columns:minmax(0,1fr) minmax(154px,24%);",
    "  min-height:252px;overflow:hidden;border-radius:30px;background:radial-gradient(circle at 42% 18%,var(--ticket-bg-soft),var(--ticket-bg) 68%);",
    "  box-shadow:0 30px 62px rgba(11,16,60,.22),inset 0 1px 0 rgba(255,255,255,.08);}",
    "chekin-booking-card .booking-main{position:relative;z-index:1;display:grid;gap:21px;",
    "  min-width:0;padding:27px 30px 27px 34px;}",
    "chekin-booking-card .booking-main.has-location{grid-template-rows:auto 1fr auto;}",
    "chekin-booking-card .booking-main.no-location{grid-template-rows:1fr auto;}",
    "chekin-booking-card .booking-location{display:inline-flex;align-items:center;gap:9px;min-height:22px;color:rgba(255,255,255,.66);",
    "  font-size:14px;font-weight:700;line-height:1;}",
    "chekin-booking-card .booking-location svg{width:17px;height:17px;flex:none;stroke-width:2;}",
    "chekin-booking-card .booking-dates{display:grid;grid-template-columns:minmax(96px,1fr) minmax(96px,.78fr) minmax(96px,1fr);",
    "  align-items:center;gap:14px;min-width:0;}",
    "chekin-booking-card .booking-date{min-width:0;}",
    "chekin-booking-card .booking-date-line{display:flex;align-items:flex-end;gap:10px;min-width:0;}",
    "chekin-booking-card .booking-day{font-size:56px;line-height:1;font-weight:900;letter-spacing:0;}",
    "chekin-booking-card .booking-month{font-size:21px;line-height:1.12;font-weight:800;letter-spacing:0;}",
    "chekin-booking-card .booking-time{display:block;margin-top:11px;color:var(--ticket-muted);font-size:14px;line-height:1.2;",
    "  font-weight:600;letter-spacing:0;white-space:nowrap;}",
    "chekin-booking-card .booking-nights{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:9px;color:var(--ticket-muted);",
    "  font-size:13px;font-weight:700;letter-spacing:0;white-space:nowrap;}",
    "chekin-booking-card .booking-nights::before,chekin-booking-card .booking-nights::after{content:\"\";height:2px;min-width:16px;",
    "  background:repeating-linear-gradient(90deg,rgba(255,255,255,.54) 0 7px,transparent 7px 14px);}",
    "chekin-booking-card .nights-core{display:inline-flex;align-items:center;gap:6px;}",
    "chekin-booking-card .nights-core svg{width:16px;height:16px;flex:none;stroke-width:2;}",
    "chekin-booking-card .booking-ref{display:flex;align-items:baseline;gap:20px;min-width:0;}",
    "chekin-booking-card .booking-ref-label{color:rgba(255,255,255,.68);font-size:12px;font-weight:900;letter-spacing:0;text-transform:uppercase;}",
    "chekin-booking-card .booking-ref-number{font-size:20px;font-weight:900;line-height:1;letter-spacing:0;white-space:nowrap;}",
    "chekin-booking-card .booking-status{position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;justify-content:center;",
    "  min-width:0;padding:24px 15px;text-align:center;background:radial-gradient(circle at 50% 20%,rgba(255,255,255,.06),rgba(255,255,255,0) 62%);",
    "  border-left:1px solid rgba(255,255,255,.16);}",
    "chekin-booking-card .booking-status::before{content:\"\";position:absolute;left:-4px;top:28px;bottom:28px;width:8px;opacity:.72;",
    "  background:radial-gradient(circle,rgba(255,255,255,.48) 0 2px,transparent 2.4px) center/8px 16px repeat-y;}",
    "chekin-booking-card .lock-ring{width:76px;height:76px;border:2px solid rgba(255,255,255,.42);border-radius:50%;",
    "  display:flex;align-items:center;justify-content:center;margin-bottom:28px;color:#fff;}",
    "chekin-booking-card .lock-ring svg{width:35px;height:35px;stroke-width:1.9;}",
    "chekin-booking-card .status-title{display:block;font-size:17px;font-weight:900;line-height:1.1;letter-spacing:0;}",
    "chekin-booking-card .status-subtitle{display:block;margin-top:12px;color:rgba(255,255,255,.82);font-size:10px;font-weight:700;",
    "  line-height:1.25;letter-spacing:0;text-transform:uppercase;}",
    "@container (max-width:620px){",
    "  chekin-booking-card{width:100%;}",
    "  chekin-booking-card .booking-card{grid-template-columns:1fr;min-height:0;border-radius:24px;}",
    "  chekin-booking-card .booking-main{padding:22px;gap:16px;}",
    "  chekin-booking-card .booking-dates{grid-template-columns:1fr;gap:13px;}",
    "  chekin-booking-card .booking-nights{grid-template-columns:34px auto 1fr;justify-content:start;}",
    "  chekin-booking-card .booking-day{font-size:44px;}",
    "  chekin-booking-card .booking-month{font-size:18px;}",
    "  chekin-booking-card .booking-time{font-size:13px;margin-top:7px;}",
    "  chekin-booking-card .booking-ref{flex-wrap:wrap;gap:9px 14px;}",
    "  chekin-booking-card .booking-status{min-height:148px;border-left:0;border-top:1px solid rgba(255,255,255,.16);}",
    "  chekin-booking-card .booking-status::before{left:24px;right:24px;top:-4px;bottom:auto;width:auto;height:8px;",
    "    background:radial-gradient(circle,rgba(255,255,255,.48) 0 2px,transparent 2.4px) center/16px 8px repeat-x;}",
    "  chekin-booking-card .lock-ring{width:64px;height:64px;margin-bottom:18px;}",
    "  chekin-booking-card .lock-ring svg{width:30px;height:30px;}",
    "}",
    "@media (max-width:767px){",
    "  chekin-booking-card{width:100%;}",
    "  chekin-booking-card .booking-card{grid-template-columns:1fr;min-height:0;border-radius:24px;}",
    "  chekin-booking-card .booking-main{padding:22px;gap:16px;}",
    "  chekin-booking-card .booking-dates{grid-template-columns:1fr;gap:13px;}",
    "  chekin-booking-card .booking-nights{grid-template-columns:34px auto 1fr;justify-content:start;}",
    "  chekin-booking-card .booking-day{font-size:44px;}",
    "  chekin-booking-card .booking-month{font-size:18px;}",
    "  chekin-booking-card .booking-time{font-size:13px;margin-top:7px;}",
    "  chekin-booking-card .booking-ref{flex-wrap:wrap;gap:9px 14px;}",
    "  chekin-booking-card .booking-status{min-height:148px;border-left:0;border-top:1px solid rgba(255,255,255,.16);}",
    "  chekin-booking-card .booking-status::before{left:24px;right:24px;top:-4px;bottom:auto;width:auto;height:8px;",
    "    background:radial-gradient(circle,rgba(255,255,255,.48) 0 2px,transparent 2.4px) center/16px 8px repeat-x;}",
    "  chekin-booking-card .lock-ring{width:64px;height:64px;margin-bottom:18px;}",
    "  chekin-booking-card .lock-ring svg{width:30px;height:30px;}",
    "}"
  ].join('\n');

  function ensureCSS() {
    if (document.getElementById('chekin-booking-card-css')) return;
    var s = document.createElement('style');
    s.id = 'chekin-booking-card-css'; s.textContent = CSS;
    document.head.appendChild(s);
  }

  var IC = {
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path d="M12 21s7-6.1 7-12a7 7 0 0 0-14 0c0 5.9 7 12 7 12Z"/><circle cx="12" cy="9" r="2.4"/></svg>',
    moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path d="M20 15.4A8.5 8.5 0 0 1 8.6 4a7 7 0 1 0 11.4 11.4Z"/></svg>',
    lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><rect x="5.5" y="10" width="13" height="10" rx="2.4"/><path d="M8.7 10V7a3.3 3.3 0 0 1 6.6 0v3"/><path d="M12 14.3v2.4"/></svg>'
  };

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function attr(el, name, fallback) {
    var value = el.getAttribute(name);
    return value == null ? fallback : value;
  }

  class ChekinBookingCard extends HTMLElement {
    static get observedAttributes() {
      return [
        'checkin-day', 'checkin-month', 'checkin-time',
        'checkout-day', 'checkout-month', 'checkout-time',
        'nights', 'booking-ref', 'status-title', 'status-subtitle', 'location'
      ];
    }

    connectedCallback() {
      ensureFonts();
      ensureCSS();
      this.render();
    }

    attributeChangedCallback() {
      if (this.isConnected) this.render();
    }

    render() {
      var checkinDay = attr(this, 'checkin-day', '10');
      var checkinMonth = attr(this, 'checkin-month', 'Jun 2026');
      var checkinTime = attr(this, 'checkin-time', 'Check-in 15:00');
      var checkoutDay = attr(this, 'checkout-day', '12');
      var checkoutMonth = attr(this, 'checkout-month', 'Jun 2026');
      var checkoutTime = attr(this, 'checkout-time', 'Check-out 11:00');
      var nights = attr(this, 'nights', '2 nights');
      var bookingRef = attr(this, 'booking-ref', '8059.191.347');
      var statusTitle = attr(this, 'status-title', 'KEY LOCKED');
      var statusSubtitle = attr(this, 'status-subtitle', 'FINISH CHECK-IN');
      var location = attr(this, 'location', '');
      var mainClass = location ? 'booking-main has-location' : 'booking-main no-location';
      var locationHtml = location ? '<div class="booking-location">' + IC.pin + '<span>' + esc(location) + '</span></div>' : '';
      var label = 'Booking ' + bookingRef + ', ' + checkinTime + ', ' + checkoutTime + ', ' + nights + ', ' + statusTitle;

      this.innerHTML =
        '<article class="booking-card" role="group" aria-label="' + esc(label) + '">' +
          '<section class="' + mainClass + '">' +
            locationHtml +
            '<div class="booking-dates">' +
              '<div class="booking-date">' +
                '<div class="booking-date-line"><span class="booking-day">' + esc(checkinDay) + '</span><span class="booking-month">' + esc(checkinMonth) + '</span></div>' +
                '<span class="booking-time">' + esc(checkinTime) + '</span>' +
              '</div>' +
              '<div class="booking-nights"><span class="nights-core">' + IC.moon + '<span>' + esc(nights) + '</span></span></div>' +
              '<div class="booking-date">' +
                '<div class="booking-date-line"><span class="booking-day">' + esc(checkoutDay) + '</span><span class="booking-month">' + esc(checkoutMonth) + '</span></div>' +
                '<span class="booking-time">' + esc(checkoutTime) + '</span>' +
              '</div>' +
            '</div>' +
            '<div class="booking-ref"><span class="booking-ref-label">BOOKING REF</span><span class="booking-ref-number">' + esc(bookingRef) + '</span></div>' +
          '</section>' +
          '<section class="booking-status" aria-label="' + esc(statusTitle + ', ' + statusSubtitle) + '">' +
            '<span class="lock-ring">' + IC.lock + '</span>' +
            '<span class="status-title">' + esc(statusTitle) + '</span>' +
            '<span class="status-subtitle">' + esc(statusSubtitle) + '</span>' +
          '</section>' +
        '</article>';
    }
  }

  customElements.define('chekin-booking-card', ChekinBookingCard);
})();
