/*
 * <chekin-navbar> — reusable left sidebar (Guest App V3)
 *
 *   <script src="<path>/components/chekin-navbar.js" defer></script>
 *   <chekin-navbar active="registration"></chekin-navbar>
 *
 * Attributes:
 *   active      home | registration | payments | virtual-keys | luggage | guidebooks | recommendations | checkout
 *   brand       brand name shown next to the logo   (default "Casa del Mar")
 *   user-name   user card name                       (default "Carmen Specimen")
 *   user-email  user card email                      (default "carmen@email.com")
 *
 * Layout: fixed 288px sidebar on the left. Pages should reserve room with
 * `margin-left:288px` on their main content. Hidden below 767px.
 * Self-contained: injects its own CSS + the Montserrat font once.
 */
(function () {
  if (window.customElements && customElements.get('chekin-navbar')) return;

  var FONT_HREF = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=Poppins:wght@400;500;600&display=swap';

  function ensureFonts() {
    if (document.getElementById('chekin-fonts')) return;
    var l = document.createElement('link');
    l.id = 'chekin-fonts'; l.rel = 'stylesheet'; l.href = FONT_HREF;
    document.head.appendChild(l);
  }

  var CSS = [
    "chekin-navbar{position:fixed;top:0;left:0;bottom:0;width:288px;z-index:40;box-sizing:border-box;",
    "  display:flex;flex-direction:column;padding:20px 16px;",
    "  background:rgba(20,20,58,.85);-webkit-backdrop-filter:blur(18px) saturate(1.3);backdrop-filter:blur(18px) saturate(1.3);",
    "  box-shadow:inset -1px 0 0 rgba(255,255,255,.08);color:#fff;",
    "  font-family:'Montserrat',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;}",
    "chekin-navbar *{box-sizing:border-box;}",
    "chekin-navbar .brand{display:flex;align-items:center;gap:13px;padding:2px 6px 0;margin-bottom:26px;}",
    "chekin-navbar .brand-logo{width:46px;height:46px;border-radius:13px;flex:none;background:#fff;",
    "  display:flex;align-items:center;justify-content:center;box-shadow:0 6px 16px rgba(56,91,248,.3);}",
    "chekin-navbar .brand-logo svg{width:26px;height:26px;color:#385bf8;}",
    "chekin-navbar .brand-name{font-weight:700;font-size:16px;letter-spacing:-.17px;color:#fff;}",
    "chekin-navbar .nav-menu{display:flex;flex-direction:column;gap:4px;}",
    "chekin-navbar .nav-group{margin-top:18px;display:flex;flex-direction:column;gap:4px;}",
    "chekin-navbar .nav-label{padding:0 14px;margin-bottom:6px;font-size:10px;font-weight:600;",
    "  letter-spacing:.126em;text-transform:uppercase;color:rgba(255,255,255,.38);}",
    "chekin-navbar .nav-item{position:relative;display:flex;align-items:center;gap:13px;",
    "  padding:11px 14px;border-radius:12px;color:rgba(255,255,255,.8);font-weight:600;",
    "  font-size:14.5px;letter-spacing:-.145px;text-decoration:none;cursor:pointer;",
    "  transition:background .15s ease,color .15s ease;}",
    "chekin-navbar .nav-item svg{width:20px;height:20px;flex:none;stroke-width:1.9;color:rgba(255,255,255,.72);}",
    "chekin-navbar .nav-item:hover{background:rgba(255,255,255,.06);color:#fff;}",
    "chekin-navbar .nav-item:hover svg{color:#fff;}",
    "chekin-navbar .nav-item.active{background:linear-gradient(90deg,rgba(56,91,248,.5),rgba(56,91,248,.3));",
    "  color:#fff;font-weight:700;box-shadow:0 8px 18px rgba(56,91,248,.3);}",
    "chekin-navbar .nav-item.active svg{color:#fff;}",
    "chekin-navbar .nav-badge{margin-left:auto;height:23px;padding:0 9px;border-radius:999px;",
    "  display:inline-flex;align-items:center;font-size:11.5px;font-weight:700;",
    "  background:rgba(120,140,255,.16);color:#c5ccfb;}",
    "chekin-navbar .nav-badge.teal{background:rgba(53,229,188,.16);color:#35e5bc;}",
    "chekin-navbar .nav-user{margin-top:auto;display:flex;align-items:center;gap:11px;",
    "  padding:16px 10px 4px;border-top:1px solid rgba(255,255,255,.08);}",
    "chekin-navbar .nav-ava{width:40px;height:40px;flex:none;border-radius:50%;background:rgba(255,255,255,.1);",
    "  display:flex;align-items:center;justify-content:center;font-size:12.5px;font-weight:600;color:#fff;}",
    "chekin-navbar .nav-user-info{min-width:0;}",
    "chekin-navbar .nav-user-name{font-size:13.5px;font-weight:600;color:#fff;}",
    "chekin-navbar .nav-user-mail{font-size:11.5px;font-weight:400;color:rgba(255,255,255,.5);",
    "  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}",
    "@media (max-width:767px){chekin-navbar{display:none;}}"
  ].join('\n');

  function ensureCSS() {
    if (document.getElementById('chekin-navbar-css')) return;
    var s = document.createElement('style');
    s.id = 'chekin-navbar-css'; s.textContent = CSS;
    document.head.appendChild(s);
  }

  var IC = {
    logo: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="5.4" stroke-linecap="round" stroke-linejoin="round"><path d="M7.5 16.8 13.2 22.5 24.5 9.8"/></svg>',
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>',
    registration: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6"/></svg>',
    payments: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M3 10h18"/></svg>',
    keys: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="8" cy="15" r="4"/><path d="m11 12 9-9M17 6l2 2M14 9l2 2"/></svg>',
    luggage: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="4" y="7" width="16" height="13" rx="2"/><path d="M9 7V5a3 3 0 0 1 6 0v2M9 12h6"/></svg>',
    guidebooks: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5Z"/><path d="M4 19a2 2 0 0 0 2 2h13"/></svg>',
    star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="m12 3 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.8 6.8 19.2l1-5.8L3.5 9.2l5.9-.9L12 3Z"/></svg>',
    checkout: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l5-5-5-5M15 12H3"/></svg>'
  };

  // Single source of truth for the menu. Groups with a null label render flat.
  var GROUPS = [
    { label: null, items: [
      { key: 'home', label: 'Home', icon: 'home' }
    ] },
    { label: 'Before your stay', items: [
      { key: 'registration', label: 'Registration', icon: 'registration', badge: '2 left' },
      { key: 'payments', label: 'Payments', icon: 'payments', badge: '€340' }
    ] },
    { label: 'Your stay', items: [
      { key: 'virtual-keys', label: 'Virtual keys', icon: 'keys' },
      { key: 'luggage', label: 'Luggage drop-off', icon: 'luggage', badge: 'NEW', badgeClass: 'teal' },
      { key: 'guidebooks', label: 'Guidebooks', icon: 'guidebooks' },
      { key: 'recommendations', label: 'Recommendations', icon: 'star' }
    ] },
    { label: 'Check-out', items: [
      { key: 'checkout', label: 'Check-out instructions', icon: 'checkout' }
    ] }
  ];

  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  function navItem(it, active) {
    var cls = 'nav-item' + (it.key === active ? ' active' : '');
    var badge = it.badge ? '<span class="nav-badge' + (it.badgeClass ? ' ' + it.badgeClass : '') + '">' + esc(it.badge) + '</span>' : '';
    return '<a class="' + cls + '">' + (IC[it.icon] || '') + esc(it.label) + badge + '</a>';
  }

  class ChekinNavbar extends HTMLElement {
    static get observedAttributes() { return ['active', 'brand', 'user-name', 'user-email']; }
    connectedCallback() { ensureFonts(); ensureCSS(); this.render(); }
    attributeChangedCallback() { if (this.isConnected) this.render(); }

    render() {
    var active = this.getAttribute('active') || '';
    var brand = this.getAttribute('brand') || 'Casa del Mar';
    var userName = this.getAttribute('user-name') || 'Carmen Specimen';
    var userMail = this.getAttribute('user-email') || 'carmen@email.com';
    var initials = userName.trim().split(/\s+/).map(function (w) { return w[0]; }).slice(0, 2).join('').toUpperCase();

    var menu = '';
    GROUPS.forEach(function (g) {
      var items = g.items.map(function (it) { return navItem(it, active); }).join('');
      if (g.label) {
        menu += '<div class="nav-group"><div class="nav-label">' + esc(g.label) + '</div>' + items + '</div>';
      } else {
        menu += items;
      }
    });

    this.innerHTML =
      '<div class="brand"><div class="brand-logo">' + IC.logo + '</div><div class="brand-name">' + esc(brand) + '</div></div>' +
      '<nav class="nav-menu">' + menu + '</nav>' +
      '<div class="nav-user"><div class="nav-ava">' + esc(initials) + '</div>' +
        '<div class="nav-user-info"><div class="nav-user-name">' + esc(userName) + '</div>' +
        '<div class="nav-user-mail">' + esc(userMail) + '</div></div></div>';
    }
  }

  customElements.define('chekin-navbar', ChekinNavbar);
})();
