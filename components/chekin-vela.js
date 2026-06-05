/*
 * <chekin-vela> — reusable Vela AI assistant panel (Guest App V3)
 *
 *   <script src="<path>/components/chekin-vela.js" defer></script>
 *   <chekin-vela intro="…" reco-title="Vela recommends">
 *     <script type="application/json">
 *       [ { "strong":"…", "text":"…",
 *           "action":{ "icon":"book", "title":"…", "subtitle":"…", "price":"€25", "button":"Open" } },
 *         { "chip":"Tip", "reason":"Faster check-in", "strong":"…", "text":"…" },
 *         { "icon":"doc", "title":"…", "subtitle":"…", "button":"Ask" } ]
 *     </script>
 *   </chekin-vela>
 *
 * Attributes:
 *   intro          paragraph under the title
 *   reco-title     section header text     (default "Vela recommends")
 *   reco-subtitle  optional sub-line under the header
 *   reco-icon      header icon name        (default "sparkle"; e.g. "sun")
 *
 * Items (JSON array, also settable via the `.items` property):
 *   chip, reason          optional pill row at the top of an insight card
 *   strong, text          insight body (renders an insight card)
 *   action {icon,title,subtitle,price,button}   action card embedded in the insight
 *   — OR an item with only icon/title/subtitle/price/button renders a standalone action card.
 *
 * Layout: fixed 345px panel on the right (22px inset). Pages should reserve
 * room with `margin-right:380px` on their main content. Hidden below 1279px.
 * Self-contained: injects its own CSS + the Montserrat font once.
 */
(function () {
  if (window.customElements && customElements.get('chekin-vela')) return;

  var FONT_HREF = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=Poppins:wght@400;500;600&display=swap';

  function ensureFonts() {
    if (document.getElementById('chekin-fonts')) return;
    var l = document.createElement('link');
    l.id = 'chekin-fonts'; l.rel = 'stylesheet'; l.href = FONT_HREF;
    document.head.appendChild(l);
  }

  var CSS = [
    "chekin-vela{position:fixed;top:22px;right:22px;bottom:0;width:345px;z-index:40;box-sizing:border-box;",
    "  border:1px solid rgba(255,255,255,.6);border-radius:26px 26px 0 0;",
    "  background:rgba(248,250,255,.80);-webkit-backdrop-filter:blur(26px) saturate(1.7);backdrop-filter:blur(26px) saturate(1.7);",
    "  box-shadow:0 30px 72px rgba(18,30,78,.22);overflow:hidden;display:flex;flex-direction:column;",
    "  font-family:'Montserrat',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#07154d;",
    "  -webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;}",
    "chekin-vela *{box-sizing:border-box;}",
    "chekin-vela .vela-inner{position:absolute;top:24px;bottom:24px;left:24px;right:22px;display:flex;flex-direction:column;min-height:0;}",
    "chekin-vela .vela-avatar{position:absolute;top:0;left:0;width:44px;height:44px;border-radius:50%;",
    "  background:linear-gradient(145deg,#1047ff,#5d7cff);display:flex;align-items:center;justify-content:center;",
    "  box-shadow:0 10px 24px rgba(18,75,255,.22);z-index:3;}",
    "chekin-vela .vela-avatar svg{width:27px;height:27px;color:#fff;}",
    "chekin-vela .online-dot{position:absolute;right:-1px;bottom:2px;width:13px;height:13px;border-radius:50%;background:#16c875;border:2px solid #fff;}",
    "chekin-vela .vela-title-row{display:flex;align-items:center;gap:10px;min-height:44px;padding-left:56px;margin-bottom:13px;}",
    "chekin-vela .vela-title{margin:0;font-size:21px;font-weight:700;letter-spacing:-.035em;}",
    "chekin-vela .vela-badge{height:23px;padding:0 9px;border-radius:999px;display:inline-flex;align-items:center;",
    "  background:rgba(18,75,255,.075);color:#1047ff;font-size:11px;font-weight:700;}",
    "chekin-vela .vela-intro{margin:0 0 16px;max-width:280px;font-size:12.6px;line-height:1.5;font-weight:500;color:#48547f;}",
    "chekin-vela .vela-divider{height:1px;width:100%;margin:0 0 16px;background:rgba(203,214,236,.82);}",
    "chekin-vela .vela-scroll{flex:1;min-height:0;overflow-y:auto;padding-right:4px;scrollbar-width:none;}",
    "chekin-vela .vela-scroll::-webkit-scrollbar{display:none;}",
    "chekin-vela .rec-title{display:flex;align-items:center;gap:9px;margin-bottom:6px;font-size:13.2px;font-weight:700;}",
    "chekin-vela .rec-title svg{width:14px;height:14px;color:#1047ff;flex:none;}",
    "chekin-vela .rec-sub{margin:0 0 14px;padding-left:23px;font-size:11.8px;line-height:1.42;font-weight:500;color:#65709a;}",
    "chekin-vela .insight-card{padding:11px;border:1px solid rgba(214,224,246,.74);border-radius:13px;background:rgba(255,255,255,.55);margin-bottom:10px;",
    "  box-shadow:inset 0 1px 0 rgba(255,255,255,.76),0 6px 16px rgba(23,42,96,.028);}",
    "chekin-vela .insight-top{display:flex;align-items:center;gap:7px;margin-bottom:8px;}",
    "chekin-vela .insight-chip{height:20px;padding:0 8px;border-radius:999px;display:inline-flex;align-items:center;background:rgba(18,75,255,.07);color:#1047ff;font-size:10px;font-weight:700;}",
    "chekin-vela .insight-reason{font-size:10.5px;font-weight:700;color:#7881aa;}",
    "chekin-vela .insight-text{margin:0;font-size:12.2px;line-height:1.44;font-weight:500;color:#303b68;}",
    "chekin-vela .insight-text strong{display:block;margin-bottom:3px;font-size:12.4px;font-weight:700;color:#07154d;}",
    "chekin-vela .action-card{width:100%;min-height:46px;border:1px solid rgba(216,226,245,.86);border-radius:10px;background:rgba(255,255,255,.66);",
    "  display:flex;align-items:center;padding:7px 9px;gap:9px;margin-bottom:9px;box-shadow:inset 0 1px 0 rgba(255,255,255,.76);}",
    "chekin-vela .insight-card .action-card{margin-bottom:0;margin-top:2px;}",
    "chekin-vela .ac-icon{width:25px;height:25px;border-radius:7px;flex:none;display:flex;align-items:center;justify-content:center;color:#14266f;background:rgba(56,91,248,.10);}",
    "chekin-vela .ac-icon svg{width:16px;height:16px;stroke-width:1.85;}",
    "chekin-vela .ac-copy{flex:1;min-width:0;}",
    "chekin-vela .ac-title{display:block;font-size:12.6px;font-weight:700;letter-spacing:-.012em;}",
    "chekin-vela .ac-sub{display:block;margin-top:2px;font-size:11px;font-weight:500;color:#5a6695;}",
    "chekin-vela .ac-price{margin-left:auto;padding-right:4px;font-size:12px;font-weight:700;color:#15225f;white-space:nowrap;}",
    "chekin-vela .ac-btn{height:29px;min-width:54px;border:1px solid #d3def4;border-radius:8px;background:rgba(255,255,255,.74);color:#1047ff;font-size:11.6px;font-weight:700;cursor:pointer;}",
    "chekin-vela .vela-chatbar{flex:none;height:50px;margin-top:10px;padding:7px 8px 7px 14px;border:1px solid #d4dff4;border-radius:11px;background:rgba(255,255,255,.82);",
    "  display:flex;align-items:center;gap:10px;box-shadow:inset 0 1px 0 rgba(255,255,255,.9),0 8px 20px rgba(23,42,96,.055);}",
    "chekin-vela .vela-chatbar input{flex:1;min-width:0;height:100%;border:0;outline:0;background:transparent;font:inherit;font-size:12px;font-weight:400;color:#17245d;}",
    "chekin-vela .vela-chatbar input::placeholder{color:#6b6b95;}",
    "chekin-vela .send-btn{width:36px;height:36px;flex:none;border:0;border-radius:9px;background:#1047ff;color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;}",
    "chekin-vela .send-btn svg{width:17px;height:17px;stroke-width:2;}",
    "@media (max-width:1279px){chekin-vela{display:none;}}"
  ].join('\n');

  function ensureCSS() {
    if (document.getElementById('chekin-vela-css')) return;
    var s = document.createElement('style');
    s.id = 'chekin-vela-css'; s.textContent = CSS;
    document.head.appendChild(s);
  }

  var SPARK = '<svg viewBox="0 0 32 32" fill="none"><path fill="currentColor" d="M16 2.8c1.18 7.05 5.7 11.6 12.76 12.76C21.7 16.74 17.18 21.27 16 28.32 14.82 21.27 10.3 16.74 3.24 15.56 10.3 14.4 14.82 9.85 16 2.8Z"/></svg>';
  var SEND = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

  var IC = {
    sparkle: '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M8.2 2.7c.48 2.88 2.33 4.73 5.2 5.2-2.87.49-4.72 2.33-5.2 5.22C7.72 10.23 5.87 8.38 3 7.9c2.87-.47 4.72-2.32 5.2-5.2Z" fill="currentColor"/><path d="M14.9 10.8c.25 1.52 1.22 2.49 2.74 2.74-1.52.26-2.49 1.23-2.74 2.75-.25-1.52-1.23-2.5-2.75-2.75 1.52-.25 2.5-1.22 2.75-2.74Z" fill="currentColor"/></svg>',
    sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v2M12 19v2M5 5l1.4 1.4M17.6 17.6 19 19M3 12h2M19 12h2M5 19l1.4-1.4M17.6 6.4 19 5"/><circle cx="12" cy="12" r="3.4"/></svg>',
    book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4.5 5.5c0-1.1.9-2 2-2H11v15H6.5a2 2 0 0 0-2 2v-15Z"/><path d="M19.5 5.5c0-1.1-.9-2-2-2H13v15h4.5a2 2 0 0 1 2 2v-15Z"/></svg>',
    lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="6" y="9" width="12" height="11" rx="2"/><path d="M9 9V6.7a3 3 0 0 1 6 0V9"/><path d="M12 13v3"/></svg>',
    car: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M5 16h14l-1.6-5.2A2.4 2.4 0 0 0 15.1 9H8.9a2.4 2.4 0 0 0-2.3 1.8L5 16Z"/><path d="M4 16v3M20 16v3M7 19h1.5M15.5 19H17"/><path d="M7.5 13h9"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="13" r="7"/><path d="M12 9v4l2.5 1.5"/><path d="M8 4.5 6.5 3M16 4.5 17.5 3"/></svg>',
    doc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>',
    'clock-alt': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    parking: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="4" y="4" width="16" height="16" rx="3"/><path d="M9.5 16V8h3.1a2.4 2.4 0 0 1 0 4.8H9.5"/></svg>',
    users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/></svg>',
    share: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 10.7 15.4 6.3M8.6 13.3l6.8 4.4"/></svg>'
  };

  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  function actionCard(a) {
    return '<div class="action-card">' +
      '<span class="ac-icon">' + (IC[a.icon] || '') + '</span>' +
      '<span class="ac-copy"><span class="ac-title">' + esc(a.title) + '</span>' +
      (a.subtitle ? '<span class="ac-sub">' + esc(a.subtitle) + '</span>' : '') + '</span>' +
      (a.price ? '<span class="ac-price">' + esc(a.price) + '</span>' : '') +
      (a.button ? '<button class="ac-btn">' + esc(a.button) + '</button>' : '') +
    '</div>';
  }

  function renderItem(it) {
    var isInsight = it.strong || it.text || it.chip || it.reason;
    if (!isInsight) return actionCard(it);
    var top = (it.chip || it.reason)
      ? '<div class="insight-top">' +
          (it.chip ? '<span class="insight-chip">' + esc(it.chip) + '</span>' : '') +
          (it.reason ? '<span class="insight-reason">' + esc(it.reason) + '</span>' : '') +
        '</div>'
      : '';
    var body = '<p class="insight-text">' + (it.strong ? '<strong>' + esc(it.strong) + '</strong>' : '') + esc(it.text || '') + '</p>';
    var action = it.action ? actionCard(it.action) : '';
    return '<article class="insight-card">' + top + body + action + '</article>';
  }

  function readItems(el) {
    if (Array.isArray(el._items)) return el._items;
    var tag = el.querySelector('script[type="application/json"]');
    if (!tag) return [];
    try { return JSON.parse(tag.textContent) || []; }
    catch (e) { console.error('[chekin-vela] invalid JSON items:', e); return []; }
  }

  class ChekinVela extends HTMLElement {
    static get observedAttributes() { return ['intro', 'reco-title', 'reco-subtitle', 'reco-icon']; }
    connectedCallback() { ensureFonts(); ensureCSS(); this.render(); }
    attributeChangedCallback() { if (this.isConnected) this.render(); }
    set items(v) { this._items = v; this._cache = v; if (this.isConnected) this.render(); }
    get items() { return this._cache || []; }

    render() {
      // Read JSON items the FIRST time we render — before innerHTML wipes the
      // <script> child. attributeChangedCallback can trigger render during the
      // element upgrade, ahead of connectedCallback, so cache here defensively.
      if (!Array.isArray(this._cache)) this._cache = readItems(this);

      var intro = this.getAttribute('intro') || 'I can help you with your stay — ask me anything.';
      var recoTitle = this.getAttribute('reco-title') || 'Vela recommends';
      var recoSub = this.getAttribute('reco-subtitle') || '';
      var recoIcon = this.getAttribute('reco-icon') || 'sparkle';
      var items = this._cache || [];

      var list = items.map(renderItem).join('');
      this.innerHTML =
        '<div class="vela-inner">' +
          '<div class="vela-avatar">' + SPARK + '<span class="online-dot"></span></div>' +
          '<div class="vela-title-row"><h2 class="vela-title">Vela</h2><span class="vela-badge">Your AI assistant</span></div>' +
          '<p class="vela-intro">' + esc(intro) + '</p>' +
          '<div class="vela-divider"></div>' +
          '<div class="vela-scroll">' +
            '<div class="rec-title">' + (IC[recoIcon] || IC.sparkle) + esc(recoTitle) + '</div>' +
            (recoSub ? '<p class="rec-sub">' + esc(recoSub) + '</p>' : '') +
            list +
          '</div>' +
          '<form class="vela-chatbar" onsubmit="return false">' +
            '<input type="text" placeholder="Ask Vela anything…">' +
            '<button class="send-btn" type="submit" aria-label="Send">' + SEND + '</button>' +
          '</form>' +
        '</div>';
    }
  }

  customElements.define('chekin-vela', ChekinVela);
})();
