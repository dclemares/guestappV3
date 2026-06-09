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
    "chekin-vela .vela-inner::after{content:\"\";position:absolute;left:0;right:0;bottom:0;height:34px;pointer-events:none;",
    "  background:linear-gradient(180deg,rgba(248,250,255,0),rgba(248,250,255,.94));",
    "  box-shadow:0 18px 26px -24px rgba(18,30,78,.62);opacity:0;transform:translateY(4px);",
    "  transition:opacity .22s ease,transform .22s ease;z-index:4;}",
    "chekin-vela.has-scroll-below .vela-inner::after{opacity:1;transform:translateY(0);}",
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
    "chekin-vela .vela-heading{margin:2px 0 14px;}",
    "chekin-vela .vela-heading b{display:block;font-size:19px;font-weight:800;letter-spacing:-.025em;color:#07154d;line-height:1.18;}",
    "chekin-vela .vela-heading p{margin:6px 0 0;font-family:'Poppins',sans-serif;font-size:12.4px;line-height:1.5;font-weight:500;color:#48547f;}",
    "chekin-vela .vela-gb{margin-bottom:6px;}",
    "chekin-vela .vela-chap{position:relative;display:flex;align-items:center;gap:12px;padding:12px 12px;cursor:pointer;border-radius:12px;transition:background .2s ease,transform .2s cubic-bezier(.34,1.4,.5,1);}",
    "chekin-vela .vela-chap::after{content:\"\";position:absolute;left:12px;right:12px;bottom:0;height:1px;background:rgba(203,214,236,.82);transition:opacity .18s ease;}",
    "chekin-vela .vela-chap:last-child::after{display:none;}",
    "chekin-vela .vela-chap:hover{background:rgba(56,91,248,.06);}",
    "chekin-vela .vela-chap:hover::after{opacity:0;}",
    "chekin-vela .vela-chap:active{transform:scale(.99);}",
    "chekin-vela .vela-chap .gb-ic{width:34px;height:34px;flex:none;border-radius:10px;background:rgba(56,91,248,.10);color:#14266f;display:flex;align-items:center;justify-content:center;transition:transform .22s cubic-bezier(.34,1.56,.64,1),background .2s ease,color .2s ease;}",
    "chekin-vela .vela-chap .gb-ic svg{width:18px;height:18px;stroke-width:1.85;}",
    "chekin-vela .vela-chap:hover .gb-ic{background:rgba(56,91,248,.18);color:#1047ff;transform:scale(1.08) rotate(-3deg);}",
    "chekin-vela .vela-chap .gb-tx{flex:1;min-width:0;}",
    "chekin-vela .vela-chap .gb-tx b{display:block;font-size:12.9px;font-weight:700;transition:color .18s ease,transform .2s ease;}",
    "chekin-vela .vela-chap .gb-tx small{display:block;margin-top:1px;font-size:10.6px;color:#5a6695;}",
    "chekin-vela .vela-chap:hover .gb-tx b{color:#1047ff;transform:translateX(2px);}",
    "chekin-vela .vela-chap .gb-chev{width:18px;height:18px;flex:none;color:#8b95bd;opacity:.7;transition:transform .22s cubic-bezier(.34,1.56,.64,1),color .2s ease,opacity .2s ease;}",
    "chekin-vela .vela-chap .gb-chev svg{width:18px;height:18px;stroke-width:2.2;}",
    "chekin-vela .vela-chap:hover .gb-chev{transform:translateX(5px);color:#385bf8;opacity:1;}",
    "chekin-vela .vela-divider{height:1px;width:100%;margin:0 0 16px;background:rgba(203,214,236,.82);}",
    "chekin-vela .vela-scroll{position:relative;z-index:1;flex:1;min-height:0;overflow-y:auto;padding-right:4px;scrollbar-width:none;}",
    "chekin-vela .vela-scroll::-webkit-scrollbar{display:none;}",
    "chekin-vela[dock-bottom] .vela-scroll{display:flex;flex-direction:column;}",
    "chekin-vela[dock-bottom] .vela-scroll > :first-child{margin-top:auto;}",
    "chekin-vela .rec-title{display:flex;align-items:center;gap:9px;margin-bottom:6px;font-size:13.2px;font-weight:700;}",
    "chekin-vela .rec-title svg{width:14px;height:14px;color:#1047ff;flex:none;}",
    "chekin-vela .rec-sub{margin:0 0 14px;padding-left:23px;font-size:11.8px;line-height:1.42;font-weight:500;color:#65709a;}",
    "chekin-vela .vela-flat{margin:0 0 2px;}",
    "chekin-vela .vela-flat .insight-top{margin-bottom:6px;}",
    "chekin-vela .insight-card{padding:11px;border:1px solid rgba(214,224,246,.74);border-radius:13px;background:rgba(255,255,255,.55);margin-bottom:10px;",
    "  box-shadow:inset 0 1px 0 rgba(255,255,255,.76),0 6px 16px rgba(23,42,96,.028);}",
    "chekin-vela .insight-top{display:flex;align-items:center;gap:7px;margin-bottom:8px;}",
    "chekin-vela .insight-chip{height:20px;padding:0 8px;border-radius:999px;display:inline-flex;align-items:center;background:rgba(18,75,255,.07);color:#1047ff;font-size:10px;font-weight:700;}",
    "chekin-vela .insight-reason{font-size:10.5px;font-weight:700;color:#7881aa;}",
    "chekin-vela .insight-text{margin:0;font-size:12.2px;line-height:1.44;font-weight:500;color:#303b68;}",
    "chekin-vela .insight-text strong{display:block;margin-bottom:3px;font-size:12.4px;font-weight:700;color:#07154d;}",
    "chekin-vela .insight-row{display:flex;align-items:flex-start;gap:9px;}",
    "chekin-vela .insight-ico{width:24px;height:24px;border-radius:7px;flex:none;display:flex;align-items:center;justify-content:center;color:#1047ff;background:rgba(56,91,248,.10);margin-top:1px;}",
    "chekin-vela .insight-ico svg{width:15px;height:15px;stroke-width:1.9;}",
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
    "chekin-vela .vela-chatbar{position:relative;z-index:5;flex:none;height:50px;margin-top:10px;padding:7px 8px 7px 14px;border:1px solid #d4dff4;border-radius:11px;background:rgba(255,255,255,.82);",
    "  display:flex;align-items:center;gap:10px;box-shadow:inset 0 1px 0 rgba(255,255,255,.9),0 8px 20px rgba(23,42,96,.055);}",
    "chekin-vela .vela-chatbar input{flex:1;min-width:0;height:100%;border:0;outline:0;background:transparent;font:inherit;font-size:12px;font-weight:400;color:#17245d;}",
    "chekin-vela .vela-chatbar input::placeholder{color:#6b6b95;}",
    "chekin-vela .send-btn{width:36px;height:36px;flex:none;border:0;border-radius:9px;background:#1047ff;color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;}",
    "chekin-vela .send-btn svg{width:17px;height:17px;stroke-width:2;}",

    /* ===== Section header (Option 3) ===== */
    "chekin-vela .vela-sec{position:relative;display:block;padding-bottom:9px;margin:24px 0 12px;font-size:9.5px;font-weight:800;letter-spacing:.13em;text-transform:uppercase;color:#8b95bd;}",
    "chekin-vela .vela-sec:first-child{margin-top:2px;}",
    "chekin-vela .vela-sec::before{content:\"\";position:absolute;left:0;right:0;bottom:0;height:1px;background:rgba(203,214,236,.82);}",
    "chekin-vela .vela-sec::after{content:\"\";position:absolute;left:0;bottom:0;width:26px;height:2px;border-radius:2px;background:var(--tk,#385bf8);}",
    "chekin-vela .vela-sec.amber{--tk:#c98a16;}chekin-vela .vela-sec.green{--tk:#0f9f80;}chekin-vela .vela-sec.blue{--tk:#385bf8;}",
    "chekin-vela .vela-sec-sub{margin:-4px 0 13px;font-family:'Poppins',sans-serif;font-size:11.6px;line-height:1.45;font-weight:500;color:#65709a;}",
    "chekin-vela .vela-sec.has-see{display:flex;align-items:flex-end;justify-content:space-between;gap:10px;}",
    "chekin-vela .vela-sec-see{font-size:10.5px;font-weight:800;letter-spacing:0;text-transform:none;color:#1047ff;cursor:pointer;white-space:nowrap;}",

    /* ===== Quick action capsule (B4.4) ===== */
    "chekin-vela .vela-cap{display:flex;align-items:center;gap:11px;min-height:48px;padding:0 12px 0 14px;border-radius:999px;cursor:pointer;transition:.15s;border:1px solid transparent;background:linear-gradient(90deg,rgba(56,91,248,.12),rgba(56,91,248,.03));margin-bottom:9px;}",
    "chekin-vela .vela-cap:hover{background:linear-gradient(90deg,rgba(56,91,248,.18),rgba(56,91,248,.05));}",
    "chekin-vela .vela-cap .cap-ic{width:22px;height:22px;flex:none;color:#385bf8;}chekin-vela .vela-cap .cap-ic svg{width:19px;height:19px;stroke-width:1.9;}",
    "chekin-vela .vela-cap .cap-t{flex:1;font-size:12.6px;font-weight:700;color:#07154d;}",
    "chekin-vela .vela-cap .cap-chev{width:20px;height:20px;flex:none;color:#1047ff;margin-right:6px;}chekin-vela .vela-cap .cap-chev svg{width:20px;height:20px;stroke-width:2.2;}",

    /* ===== Deal coupon (V1) ===== */
    "chekin-vela .vela-coupon{position:relative;margin-bottom:12px;border-radius:13px;background:#fff;box-shadow:0 6px 16px rgba(23,42,96,.08);display:flex;align-items:stretch;overflow:hidden;}",
    "chekin-vela .vela-coupon .cp-stub{width:52px;flex:none;display:flex;align-items:center;justify-content:center;color:#fff;background:linear-gradient(160deg,#1047ff,#5d7cff);border-radius:13px 0 0 13px;}chekin-vela .vela-coupon .cp-stub svg{width:20px;height:20px;}",
    "chekin-vela .vela-coupon .cp-perf{position:relative;width:0;align-self:stretch;border-left:2px dashed rgba(203,214,236,.95);margin:7px 0;}",
    "chekin-vela .vela-coupon .cp-perf::before,chekin-vela .vela-coupon .cp-perf::after{content:\"\";position:absolute;left:-7px;width:14px;height:14px;border-radius:50%;background:#f1f3f8;}",
    "chekin-vela .vela-coupon .cp-perf::before{top:-14px;}chekin-vela .vela-coupon .cp-perf::after{bottom:-14px;}",
    "chekin-vela .vela-coupon .cp-body{flex:1;min-width:0;padding:11px 12px;}chekin-vela .vela-coupon .cp-body b{display:block;font-size:12.6px;font-weight:700;}chekin-vela .vela-coupon .cp-body small{display:block;margin-top:1px;font-size:10.5px;color:#5a6695;}",
    "chekin-vela .vela-coupon .cp-end{display:flex;flex-direction:column;align-items:flex-end;justify-content:center;padding:0 12px 0 4px;gap:6px;}",
    "chekin-vela .vela-coupon .cp-pr{font-size:14px;font-weight:800;color:#07154d;}chekin-vela .vela-coupon .cp-pr s{color:#8b95bd;font-weight:600;font-size:11px;margin-right:5px;}",
    "chekin-vela .vela-coupon .cp-add{height:25px;padding:0 12px;border:0;border-radius:8px;background:#385bf8;color:#fff;font:inherit;font-weight:700;font-size:10.6px;cursor:pointer;}chekin-vela .vela-coupon .cp-add:hover{background:#1047ff;}",
    "chekin-vela .vela-coupon .cp-ribbon{position:absolute;top:9px;right:-23px;transform:rotate(45deg);z-index:2;background:#c98a16;color:#fff;font-size:8px;font-weight:800;letter-spacing:.06em;padding:2px 24px;}",

    /* ===== Deals carousel (3b★2) ===== */
    "chekin-vela .vela-carwrap{position:relative;}",
    "chekin-vela .vela-carwrap::after{content:\"\";position:absolute;top:0;bottom:14px;right:0;width:28px;pointer-events:none;background:linear-gradient(90deg,rgba(248,250,255,0),rgba(248,250,255,.96));border-radius:0 16px 16px 0;transition:opacity .2s ease;}",
    "chekin-vela .vela-carwrap.atEnd::after{opacity:0;}",
    "chekin-vela .vela-car{display:flex;gap:12px;overflow-x:auto;overflow-y:visible;padding:8px 2px 20px;scroll-snap-type:x mandatory;scrollbar-width:none;}",
    "chekin-vela .vela-car::-webkit-scrollbar{display:none;}",
    "chekin-vela .vela-dc{position:relative;scroll-snap-align:start;flex:0 0 118px;border-radius:16px;overflow:visible;background:#fff;box-shadow:0 7px 16px rgba(23,42,96,.12);}",
    "chekin-vela .vela-dc .dc-img{position:relative;height:104px;border-radius:16px 16px 0 0;background-size:cover;background-position:center;overflow:hidden;}",
    "chekin-vela .vela-dc .dc-img::after{content:\"\";position:absolute;inset:0;background:linear-gradient(150deg,rgba(56,91,248,.42),rgba(16,71,255,.12));mix-blend-mode:multiply;}",
    "chekin-vela .vela-dc .dc-save{position:absolute;top:9px;left:9px;z-index:3;height:18px;display:inline-flex;align-items:center;padding:0 8px;border-radius:999px;background:#fff;color:#c98a16;font-size:9px;font-weight:800;letter-spacing:.04em;}",
    "chekin-vela .vela-dc .dc-info{position:relative;padding:22px 11px 12px;}chekin-vela .vela-dc .dc-info b{display:block;font-size:12.5px;font-weight:700;}chekin-vela .vela-dc .dc-info small{display:block;margin-top:1px;font-size:10.3px;color:#5a6695;}",
    "chekin-vela .vela-dc .dc-coin{position:absolute;right:9px;top:72px;z-index:4;width:46px;height:46px;border-radius:50%;background:#fff;box-shadow:0 6px 16px rgba(7,21,77,.34),0 2px 5px rgba(7,21,77,.16);display:flex;align-items:center;justify-content:center;cursor:pointer;overflow:hidden;transition:background .24s ease,transform .28s cubic-bezier(.34,1.56,.64,1),box-shadow .24s ease;}",
    "chekin-vela .vela-dc .dc-coin .p,chekin-vela .vela-dc .dc-coin .a{position:absolute;left:0;right:0;text-align:center;transition:opacity .2s ease,transform .26s cubic-bezier(.34,1.56,.64,1);}",
    "chekin-vela .vela-dc .dc-coin .p{font-size:12.5px;font-weight:800;color:#07154d;}",
    "chekin-vela .vela-dc .dc-coin .a{font-size:11.5px;font-weight:800;color:#fff;letter-spacing:.02em;opacity:0;transform:translateY(10px) scale(.8);}",
    "chekin-vela .vela-dc:hover .dc-coin{background:#385bf8;transform:scale(1.1);box-shadow:0 10px 22px rgba(56,91,248,.44);}",
    "chekin-vela .vela-dc:hover .dc-coin .p{opacity:0;transform:translateY(-10px) scale(.8);}",
    "chekin-vela .vela-dc:hover .dc-coin .a{opacity:1;transform:translateY(0) scale(1);}",
    "chekin-vela .vela-dots{display:flex;gap:6px;justify-content:center;margin:-8px 0 0;position:relative;z-index:1;}",
    "chekin-vela .vela-dots .dot{width:7px;height:7px;border-radius:50%;background:rgba(56,91,248,.25);transition:width .25s ease,background .25s ease;}",
    "chekin-vela .vela-dots .dot.on{width:20px;border-radius:4px;background:#385bf8;}",

    /* ===== Deals hero (4a★1·B, frosted glass) ===== */
    "chekin-vela .vela-hero{position:relative;height:166px;border-radius:18px;overflow:hidden;background-size:cover;background-position:center;box-shadow:0 10px 24px rgba(23,42,96,.16);margin-bottom:12px;}",
    "chekin-vela .vela-hero::after{content:\"\";position:absolute;inset:0;background:linear-gradient(180deg,rgba(7,21,77,.06) 38%,rgba(7,21,77,.42));}",
    "chekin-vela .vela-hero .h-save{position:absolute;top:11px;right:11px;z-index:3;height:19px;display:inline-flex;align-items:center;padding:0 8px;border-radius:999px;background:#c98a16;color:#fff;font-size:9px;font-weight:800;letter-spacing:.04em;}",
    "chekin-vela .vela-hero .h-glass{position:absolute;left:11px;right:11px;bottom:11px;z-index:3;display:flex;align-items:center;gap:10px;padding:11px 11px 11px 13px;border-radius:14px;-webkit-backdrop-filter:blur(11px);backdrop-filter:blur(11px);background:rgba(255,255,255,.66);border:1px solid rgba(255,255,255,.85);color:#07154d;box-shadow:0 6px 16px rgba(7,21,77,.14);}",
    "chekin-vela .vela-hero .h-tb{flex:1;min-width:0;}chekin-vela .vela-hero .h-tb b{display:block;font-size:13.5px;font-weight:800;}chekin-vela .vela-hero .h-tb small{display:block;font-size:10.4px;color:#5a6695;}",
    "chekin-vela .vela-hero .h-pr{font-size:14px;font-weight:800;margin-right:2px;}chekin-vela .vela-hero .h-pr s{color:#8b95bd;font-weight:600;font-size:11px;margin-right:5px;}",
    "chekin-vela .vela-hero .h-add{height:30px;padding:0 14px;border:0;border-radius:9px;background:#385bf8;color:#fff;font:inherit;font-size:11.4px;font-weight:800;cursor:pointer;}",

    /* ===== Contextual deal (V4 in bubble) ===== */
    "chekin-vela .vela-ctx{display:flex;gap:9px;align-items:flex-start;margin-bottom:12px;}",
    "chekin-vela .vela-ctx .ctx-mini{width:26px;height:26px;flex:none;border-radius:50%;background:linear-gradient(145deg,#1047ff,#5d7cff);display:flex;align-items:center;justify-content:center;margin-top:1px;}chekin-vela .vela-ctx .ctx-mini svg{width:15px;height:15px;color:#fff;}",
    "chekin-vela .vela-ctx .ctx-bubble{position:relative;flex:1;min-width:0;background:rgba(56,91,248,.06);border:1px solid rgba(56,91,248,.12);border-radius:4px 14px 14px 14px;padding:11px 12px;}",
    "chekin-vela .vela-ctx .ctx-bubble p{margin:0;font-family:'Poppins',sans-serif;font-size:12.4px;line-height:1.55;color:#303b68;}chekin-vela .vela-ctx .ctx-bubble p b{color:#07154d;font-weight:700;}",
    "chekin-vela .vela-ctx .ctx-cp{position:relative;margin-top:11px;display:flex;flex-direction:column;border-radius:14px;background:#fff;box-shadow:0 6px 16px rgba(23,42,96,.14);overflow:hidden;}",
    "chekin-vela .vela-ctx .ctx-top{display:flex;align-items:center;gap:11px;padding:11px 12px;}",
    "chekin-vela .vela-ctx .ctx-thumb{width:54px;height:46px;flex:none;border-radius:11px;background-size:cover;background-position:center;}",
    "chekin-vela .vela-ctx .ctx-tb{flex:1;min-width:0;}chekin-vela .vela-ctx .ctx-tb b{display:block;font-size:13px;font-weight:700;}chekin-vela .vela-ctx .ctx-tb small{display:block;margin-top:2px;font-size:10.8px;color:#5a6695;}",
    "chekin-vela .vela-ctx .ctx-tear{position:relative;height:0;border-top:2px dashed rgba(56,91,248,.3);margin:0 9px;}",
    "chekin-vela .vela-ctx .ctx-tear::before,chekin-vela .vela-ctx .ctx-tear::after{content:\"\";position:absolute;top:-9px;width:14px;height:14px;border-radius:50%;background:#eef0fa;}",
    "chekin-vela .vela-ctx .ctx-tear::before{left:-16px;}chekin-vela .vela-ctx .ctx-tear::after{right:-16px;}",
    "chekin-vela .vela-ctx .ctx-redeem{display:flex;align-items:center;justify-content:space-between;padding:11px 12px;background:rgba(56,91,248,.06);}",
    "chekin-vela .vela-ctx .ctx-pr{font-size:15px;font-weight:800;color:#07154d;}chekin-vela .vela-ctx .ctx-pr s{color:#8b95bd;font-weight:600;font-size:11px;margin-right:5px;}",
    "chekin-vela .vela-ctx .ctx-add{height:30px;padding:0 16px;border:0;border-radius:9px;background:#385bf8;color:#fff;font:inherit;font-weight:800;font-size:11.5px;cursor:pointer;}",
    "chekin-vela .vela-ctx .ctx-ribbon{position:absolute;top:8px;right:-22px;transform:rotate(45deg);z-index:3;background:#c98a16;color:#fff;font-size:8px;font-weight:800;letter-spacing:.06em;padding:2px 22px;}",
    "chekin-vela .vela-ctx .ctx-more{display:flex;align-items:center;gap:5px;margin-top:11px;padding:0;border:0;background:none;cursor:pointer;font:inherit;font-size:11.5px;font-weight:700;color:#1047ff;}chekin-vela .vela-ctx .ctx-more svg{width:14px;height:14px;stroke-width:2.4;}",

    /* ===== Sponsored banner (A, slim 75px, full-bleed, pinned bottom) ===== */
    "chekin-vela .vela-banner{position:relative;z-index:6;flex:none;margin:14px -22px -24px -24px;height:75px;background-size:cover;background-position:center;overflow:hidden;}",
    "chekin-vela .vela-banner::after{content:\"\";position:absolute;inset:0;background:linear-gradient(115deg,rgba(255,90,80,.85) 4%,rgba(236,63,134,.7) 44%,rgba(123,63,240,.5));}",
    "chekin-vela .vela-banner .bn-in{position:absolute;inset:0;z-index:3;padding:0 14px 0 24px;display:flex;align-items:center;gap:11px;}",
    "chekin-vela .vela-banner .bn-mark{position:relative;width:20px;height:24px;flex:none;}chekin-vela .vela-banner .bn-mark i{position:absolute;bottom:0;width:11px;border-radius:7px 7px 3px 3px;}",
    "chekin-vela .vela-banner .bn-mark i.a{left:0;height:17px;background:linear-gradient(180deg,#ff8a5b,#ff4f6d);}chekin-vela .vela-banner .bn-mark i.b{left:7px;height:24px;background:linear-gradient(180deg,#ec3f86,#7b3ff0);}",
    "chekin-vela .vela-banner .bn-copy{flex:1;min-width:0;color:#fff;}",
    "chekin-vela .vela-banner .bn-copy b{display:block;font-size:12.5px;font-weight:800;line-height:1.18;letter-spacing:-.01em;}",
    "chekin-vela .vela-banner .bn-copy small{display:block;margin-top:2px;font-size:10px;font-weight:600;opacity:.95;}",
    "chekin-vela .vela-banner .bn-right{flex:none;display:flex;flex-direction:column;align-items:flex-end;gap:7px;}",
    "chekin-vela .vela-banner .bn-tag{height:15px;display:inline-flex;align-items:center;padding:0 8px;border-radius:999px;font-size:7.5px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;background:rgba(255,255,255,.26);color:#fff;-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px);}",
    "chekin-vela .vela-banner .bn-cta{height:30px;padding:0 14px;border:0;border-radius:9px;background:#fff;color:#16183a;font:inherit;font-size:11px;font-weight:800;cursor:pointer;}",

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
  var CHEV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="m9 6 6 6-6 6"/></svg>';

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
    share: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 10.7 15.4 6.3M8.6 13.3l6.8 4.4"/></svg>',
    info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="9"/><path d="M12 11.4v4.6"/><circle cx="12" cy="7.9" r="1" fill="currentColor" stroke="none"/></svg>',
    wifi: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4.5 11a11 11 0 0 1 15 0M7.5 14.5a6.5 6.5 0 0 1 9 0"/><circle cx="12" cy="18.5" r="1.3" fill="currentColor" stroke="none"/></svg>',
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 11 12 4l8 7"/><path d="M6 10v9h12v-9"/></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z"/><circle cx="12" cy="10" r="2.4"/></svg>'
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

  // An item "carries a CTA" when it has its own button or an embedded action card.
  function hasCTA(it) { return !!(it.button || it.action); }

  // Flat / header style (like the reco header): inline icon + bold title + grey
  // subtitle, no card box. Used by the `flat-text` mode for CTA-less items.
  function flatItem(it) {
    var title = it.strong || it.title || '';
    var sub = it.text || it.subtitle || '';
    if (typeof sub === 'string') sub = sub.trim();
    var top = (it.chip || it.reason)
      ? '<div class="insight-top">' +
          (it.chip ? '<span class="insight-chip">' + esc(it.chip) + '</span>' : '') +
          (it.reason ? '<span class="insight-reason">' + esc(it.reason) + '</span>' : '') +
        '</div>'
      : '';
    var icon = (it.icon && IC[it.icon]) ? IC[it.icon] : IC.sparkle;
    return '<div class="vela-flat">' + top +
      '<div class="rec-title">' + icon + esc(title) + '</div>' +
      (sub ? '<p class="rec-sub">' + esc(sub) + '</p>' : '') +
    '</div>';
  }

  // --- typed components (data-driven via it.type) ---
  function icon(name) { return (name && IC[name]) ? IC[name] : IC.sparkle; }
  function url(u) { return String(u == null ? '' : u).replace(/["'()<>]/g, ''); }       // sanitize for CSS url()
  function price(it, cls) { return '<span class="' + cls + '">' + (it.old ? '<s>' + esc(it.old) + '</s>' : '') + esc(it.price || '') + '</span>'; }

  function sectionItem(it) {
    var tone = it.tone === 'amber' ? ' amber' : it.tone === 'green' ? ' green' : ' blue';
    var see = it.see ? '<a class="vela-sec-see">' + esc(it.see) + '</a>' : '';
    return '<div class="vela-sec' + tone + (it.see ? ' has-see' : '') + '"><span>' + esc(it.label || '') + '</span>' + see + '</div>' +
      (it.sub ? '<p class="vela-sec-sub">' + esc(it.sub) + '</p>' : '');
  }
  function capsuleItem(it) {
    return '<div class="vela-cap"><span class="cap-ic">' + icon(it.icon) + '</span>' +
      '<span class="cap-t">' + esc(it.title || '') + '</span><span class="cap-chev">' + CHEV + '</span></div>';
  }
  function couponItem(it) {
    return '<div class="vela-coupon"><span class="cp-stub">' + icon(it.icon) + '</span><span class="cp-perf"></span>' +
      '<span class="cp-body"><b>' + esc(it.title || '') + '</b><small>' + esc(it.sub || '') + '</small></span>' +
      '<span class="cp-end">' + price(it, 'cp-pr') + '<button class="cp-add">' + esc(it.cta || 'Add') + '</button></span>' +
      (it.save ? '<span class="cp-ribbon">' + esc(it.save) + '</span>' : '') + '</div>';
  }
  function dealCard(d) {
    return '<div class="vela-dc"><div class="dc-img" style="background-image:url(' + url(d.img) + ')">' +
      (d.save ? '<span class="dc-save">' + esc(d.save) + '</span>' : '') + '</div>' +
      '<span class="dc-coin"><span class="p">' + esc(d.price || '') + '</span><span class="a">' + esc(d.cta || 'Add') + '</span></span>' +
      '<div class="dc-info"><b>' + esc(d.title || '') + '</b><small>' + esc(d.sub || '') + '</small></div></div>';
  }
  function carouselItem(it) {
    var deals = it.deals || [];
    var dots = deals.map(function (_, i) { return '<span class="dot' + (i === 0 ? ' on' : '') + '"></span>'; }).join('');
    return '<div class="vela-carwrap"><div class="vela-car">' + deals.map(dealCard).join('') + '</div></div>' +
      '<div class="vela-dots">' + dots + '</div>';
  }
  function heroItem(it) {
    return '<div class="vela-hero" style="background-image:url(' + url(it.img) + ')">' +
      (it.save ? '<span class="h-save">' + esc(it.save) + '</span>' : '') +
      '<div class="h-glass"><span class="h-tb"><b>' + esc(it.title || '') + '</b><small>' + esc(it.sub || '') + '</small></span>' +
      price(it, 'h-pr') + '<button class="h-add">' + esc(it.cta || 'Add') + '</button></div></div>';
  }
  function contextualItem(it) {
    var d = it.deal || {};
    return '<div class="vela-ctx"><span class="ctx-mini">' + SPARK + '</span><div class="ctx-bubble">' +
      '<p>' + (it.msg || '') + '</p>' +
      '<div class="ctx-cp"><div class="ctx-top"><span class="ctx-thumb" style="background-image:url(' + url(d.img) + ')"></span>' +
        '<span class="ctx-tb"><b>' + esc(d.title || '') + '</b><small>' + esc(d.sub || '') + '</small></span></div>' +
        '<div class="ctx-tear"></div><div class="ctx-redeem">' + price(d, 'ctx-pr') +
        '<button class="ctx-add">' + esc(d.cta || 'Add to stay') + '</button></div>' +
        (d.save ? '<span class="ctx-ribbon">' + esc(d.save) + '</span>' : '') + '</div>' +
      (it.more ? '<button class="ctx-more">' + esc(it.more) + ' ' + CHEV + '</button>' : '') +
      '</div></div>';
  }
  function bannerItem(it) {
    var sub = (it.logo || 'airalo') + (it.price ? ' · ' + (it.priceLabel ? esc(it.priceLabel) + ' ' : '') + esc(it.price) : '');
    return '<div class="vela-banner" style="background-image:url(' + url(it.img) + ')">' +
      '<div class="bn-in"><span class="bn-mark"><i class="a"></i><i class="b"></i></span>' +
      '<span class="bn-copy"><b>' + esc(it.headline || '') + '</b><small>' + sub + '</small></span>' +
      '<span class="bn-right"><span class="bn-tag">' + esc(it.tag || 'Patrocinado') + '</span>' +
      '<button class="bn-cta">' + esc(it.cta || 'Ver planes') + '</button></span></div></div>';
  }
  function guidebookItem(it) {
    return '<div class="vela-gb">' + (it.chapters || []).map(function (c) {
      return '<div class="vela-chap"><span class="gb-ic">' + icon(c.icon) + '</span>' +
        '<span class="gb-tx"><b>' + esc(c.title || '') + '</b>' + (c.sub ? '<small>' + esc(c.sub) + '</small>' : '') + '</span>' +
        '<span class="gb-chev">' + CHEV + '</span></div>';
    }).join('') + '</div>';
  }
  var TYPES = { section: sectionItem, capsule: capsuleItem, deal: couponItem, 'deals-carousel': carouselItem, 'deal-hero': heroItem, 'deal-contextual': contextualItem, banner: bannerItem, guidebook: guidebookItem };

  function renderItem(it, flat) {
    if (it && it.type && TYPES[it.type]) return TYPES[it.type](it);
    if (flat && !hasCTA(it)) return flatItem(it);
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
    if (it.icon) {
      var ico = '<span class="insight-ico">' + (IC[it.icon] || '') + '</span>';
      return '<article class="insight-card has-ico">' + top + '<div class="insight-row">' + ico + body + '</div>' + action + '</article>';
    }
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
    static get observedAttributes() { return ['intro', 'reco-title', 'reco-subtitle', 'reco-icon', 'flat-text', 'hide-header', 'heading', 'heading-sub']; }
    connectedCallback() { ensureFonts(); ensureCSS(); this.render(); }
    disconnectedCallback() { this._teardownScrollHint(); }
    attributeChangedCallback() { if (this.isConnected) this.render(); }
    set items(v) { this._items = v; this._cache = v; if (this.isConnected) this.render(); }
    get items() { return this._cache || []; }

    _teardownScrollHint() {
      if (this._scrollEl && this._scrollHintUpdate) this._scrollEl.removeEventListener('scroll', this._scrollHintUpdate);
      if (this._scrollHintObserver) this._scrollHintObserver.disconnect();
      if (this._scrollHintResize) this._scrollHintResize.disconnect();
      this._scrollEl = null;
      this._scrollHintObserver = null;
      this._scrollHintResize = null;
      this._scrollHintUpdate = null;
      this.classList.remove('has-scroll-below');
    }

    _setupScrollHint() {
      var scroll = this.querySelector('.vela-scroll');
      if (!scroll) return;
      var host = this;
      var update = function () {
        var below = scroll.scrollHeight - scroll.clientHeight - scroll.scrollTop > 2;
        host.classList.toggle('has-scroll-below', below);
      };
      this._scrollEl = scroll;
      this._scrollHintUpdate = update;
      scroll.addEventListener('scroll', update, { passive: true });
      this._scrollHintObserver = new MutationObserver(update);
      this._scrollHintObserver.observe(scroll, { childList: true, subtree: true, characterData: true });
      if (window.ResizeObserver) {
        this._scrollHintResize = new ResizeObserver(update);
        this._scrollHintResize.observe(scroll);
      }
      requestAnimationFrame(update);
      setTimeout(update, 80);
    }

    _setupCarousels() {
      var wraps = this.querySelectorAll('.vela-carwrap');
      Array.prototype.forEach.call(wraps, function (wrap) {
        var rail = wrap.querySelector('.vela-car');
        var dotsEl = wrap.nextElementSibling && wrap.nextElementSibling.classList.contains('vela-dots') ? wrap.nextElementSibling : null;
        var dots = dotsEl ? [].slice.call(dotsEl.children) : [];
        if (!rail) return;
        function step() { var c = rail.querySelector('.vela-dc'); return c ? c.offsetWidth + 12 : 146; }
        rail.addEventListener('scroll', function () {
          var i = Math.max(0, Math.min(dots.length - 1, Math.round(rail.scrollLeft / step())));
          dots.forEach(function (d, k) { d.classList.toggle('on', k === i); });
          wrap.classList.toggle('atEnd', rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 4);
        }, { passive: true });
      });
    }

    render() {
      this._teardownScrollHint();
      // Read JSON items the FIRST time we render — before innerHTML wipes the
      // <script> child. attributeChangedCallback can trigger render during the
      // element upgrade, ahead of connectedCallback, so cache here defensively.
      if (!Array.isArray(this._cache)) this._cache = readItems(this);

      var intro = this.getAttribute('intro') || 'I can help you with your stay — ask me anything.';
      // reco-title absent → default header; reco-title="" (explicit empty) → hide the reco header entirely.
      var recoAttr = this.getAttribute('reco-title');
      var recoTitle = recoAttr === null ? 'Vela recommends' : recoAttr;
      var showReco = recoTitle !== '';
      var recoSub = this.getAttribute('reco-subtitle') || '';
      var recoIcon = this.getAttribute('reco-icon') || 'sparkle';
      var flat = this.hasAttribute('flat-text');
      var hideHeader = this.hasAttribute('hide-header');
      var heading = this.getAttribute('heading') || '';
      var headingSub = this.getAttribute('heading-sub') || '';
      var items = this._cache || [];
      // Sponsored banners render full-bleed OUTSIDE the scroll (pinned above the
      // chatbar) so they can reach the panel edges without the scroll clipping them.
      var banners = [], rest = [];
      items.forEach(function (it) { (it && it.type === 'banner' ? banners : rest).push(it); });
      // Avoid a double rule: when the content opens with a section header (and
      // there is no reco header), the section's own hairline replaces the divider.
      var firstIsSection = rest[0] && rest[0].type === 'section';
      var showDivider = showReco || !firstIsSection;

      var list = rest.map(function (it) { return renderItem(it, flat); }).join('');
      var bannerHTML = banners.map(bannerItem).join('');
      this.innerHTML =
        '<div class="vela-inner">' +
          (hideHeader
            ? (heading ? '<div class="vela-heading"><b>' + esc(heading) + '</b>' + (headingSub ? '<p>' + esc(headingSub) + '</p>' : '') + '</div>' : '')
            : '<div class="vela-avatar">' + SPARK + '<span class="online-dot"></span></div>' +
              '<div class="vela-title-row"><h2 class="vela-title">Vela</h2><span class="vela-badge">Your AI assistant</span></div>' +
              '<p class="vela-intro">' + esc(intro) + '</p>') +
          (showDivider ? '<div class="vela-divider"></div>' : '') +
          '<div class="vela-scroll">' +
            (showReco
              ? '<div class="rec-title">' + (IC[recoIcon] || IC.sparkle) + esc(recoTitle) + '</div>' +
                (recoSub ? '<p class="rec-sub">' + esc(recoSub) + '</p>' : '')
              : '') +
            list +
          '</div>' +
          bannerHTML +
        '</div>';
      this._setupScrollHint();
      this._setupCarousels();
    }
  }

  customElements.define('chekin-vela', ChekinVela);
})();
