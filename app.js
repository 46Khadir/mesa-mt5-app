(function () {
  "use strict";

  var AGENTS = [
    { id: "AS", short: "SCOUT", name: "Alpha Scout", role: "ideias · sinais", q: 11, c: "#f5a31a", base: 96, real: "A pesquisar em SIMULAÇÃO; sem histórico da corretora até haver ligação.", lines: ["EURUSDm · 20 sinais / 1h", "reversão à média: candidato", "XAUUSDm breakout · score 74"] },
    { id: "TQ", short: "QUANT", name: "The Quant", role: "backtest", q: 12, c: "#a78bfa", base: 88, real: "Backtests na pilha de pesquisa da box; sem dados da corretora ainda.", lines: ["setups EURUSDm: 69% win", "walk-forward janela 4 de 8", "drawdown máx. 7,4%"] },
    { id: "TT", short: "TUNER", name: "The Tuner", role: "otimização", q: 13, c: "#4db8ff", base: 69, real: "Pronto para otimizar assim que houver estratégias especificadas.", lines: ["grelha 12×8 · bull 78%", "estabilidade ok ✓", "sobreajuste −12%"] },
    { id: "PH", short: "PAIRS", name: "Pair Hunter", role: "correlação", q: 14, c: "#ff7aa8", base: 91, real: "À espera das especificações reais da demo (segunda 16/11).", lines: ["EUR/GBP ρ 0,86", "cointegração · 3 pares", "spread do par · z 1,9"] },
    { id: "IN", short: "INCUBATOR", name: "The Incubator", role: "incubação", q: 15, c: "#ffd21f", base: 73, real: "Nenhuma estratégia em incubação.", lines: ["em incubação · dia 6", "desvio +0,4% vs teste", "a registar desvios"] },
    { id: "RO", short: "RISK", name: "Risk Officer MT5", role: "veto", q: 16, c: "#ff5a4d", base: 99, real: "RISK_PAUSE ativo até v0.2.2 e revalidação de segunda 16/11.", lines: ["teto 2% ✓ · margem ✓ · SL ✓", "veto em standby", "perda diária 5% · ok"] },
    { id: "TR", short: "TRADER", name: "The Trader", role: "execução", q: 17, c: "#2fd17a", base: 64, real: "Execução desativada (exec_service off). Sem ordens reais.", lines: ["a aguardar aprovação", "envio simulado · slip 0,8", "preenchimento simulado ✓"] },
    { id: "ME", short: "MECHANIC", name: "The Mechanic", role: "infra · código", q: 18, c: "#23d3f0", base: 91, real: "v0.2.2 em curso, entrega até 15/11 às 12:00.", lines: ["bridge · testes 179 ✓", "a rever código", "pacote v0.2.2 em curso"] },
    { id: "BR", short: "BRIDGE", name: "The Bridge", role: "ponte MT5 · HMAC", q: 19, c: "#ff8a3d", base: 82, real: "v0.2.1 instalado · verificação de leitura 0 FAIL · alertas Slack ativos.", lines: ["RECEBIDA → VALIDADA", "tick MT5 (sim.) · 38ms", "assinatura HMAC ✓"] }
  ];
  var LABELS = ["SCOUT", "QUANT", "TUNER", "PAIRS", "INCUB", "RISK", "TRADER", "MECH", "BRIDGE"];
  var STAGES = [
    ["IDEIA"], ["TRIAGEM"], ["ESPECIFICAÇÃO"], ["CODIFICAÇÃO"], ["BACKTEST"], ["WALK-FORWARD"], ["CROSS-CHECK"], ["INCUBAÇÃO"],
    ["APROVAÇÃO DE RISCO", "visto do Risk Officer"], ["PAPER", "apenas conta demo"],
    ["APROVAÇÃO FORMAL", "autorização explícita do Khadir"], ["EXECUÇÃO LIMITADA", "desligada por defeito"], ["MONITORIZAÇÃO"]
  ];
  var SYMS = [
    { s: "EURUSDm", p: 1.084, d: 5, c: "#4f7cff", lots: [0.01, 0.02, 0.03] },
    { s: "XAUUSDm", p: 2650.4, d: 2, c: "#e0a416", lots: [0.01, 0.02] },
    { s: "BTCUSDm", p: 94500, d: 2, c: "#f2822c", lots: [0.01, 0.02] },
    { s: "ETHUSDm", p: 3200, d: 2, c: "#7c6cf0", lots: [0.01, 0.05] },
    { s: "GBPUSDm", p: 1.264, d: 5, c: "#c0457d", lots: [0.01, 0.02] },
    { s: "USTECm", p: 20650, d: 1, c: "#1fa7b5", lots: [0.01, 0.02] }
  ];

  function fmt(n, d) {
    if (d === undefined) d = 2;
    var s = Math.abs(n).toFixed(d).split(".");
    var g = s[0].replace(/\B(?=(\d{3})+(?!\d))/g, "\u202f");
    return (n < 0 ? "\u2212" : "") + g + (s[1] ? "," + s[1] : "");
  }
  function p2(x) { return x < 10 ? "0" + x : "" + x; }
  function nowTime() { var d = new Date(); return p2(d.getHours()) + ":" + p2(d.getMinutes()); }
  function $(id) { return document.getElementById(id); }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function rnd(a, b) { return a + Math.random() * (b - a); }
  var SAMPLE = '<div class="sample"><span class="dot blink"></span>DADOS DE EXEMPLO · simulação visual</div>';

  /* ícone de bot (próprio): cabeça arredondada com olhos, anel com arco rotativo */
  function botIcon(c, size, status) {
    return '<svg viewBox="-20 -20 40 40" width="' + size + '" height="' + size + '" aria-hidden="true">' +
      '<circle r="17" fill="#0a0c10" stroke="' + c + '" stroke-opacity=".28" stroke-width="2.2"/>' +
      '<circle class="spin" r="17" fill="none" stroke="' + c + '" stroke-width="2.6" stroke-linecap="round" stroke-dasharray="34 73"/>' +
      '<rect x="-9.5" y="-7" width="19" height="14.5" rx="6" fill="#f1f3f6"/>' +
      '<rect x="-5.2" y="-2.6" width="3" height="5.4" rx="1.5" fill="' + c + '"/><rect x="2.2" y="-2.6" width="3" height="5.4" rx="1.5" fill="' + c + '"/>' +
      (status === false ? "" : '<circle cx="13.5" cy="-13" r="3" fill="#3fdc8a"/>') + "</svg>";
  }

  /* ---------- estado simulado ---------- */
  var E0 = 1859.52, E = 1876.92, profit = 108.92, wins = 40, losses = 13, trades = 53, signals = 470, secs = 4 * 60 + 12;
  var mult = 2.6, riskPct = 36, opsT = 9474, stage = 0, lineIdx = 0, feedId = 0, hot = 0;
  var chart = [], raw = [], v = 0, i;
  for (i = 0; i < 36; i++) { v += rnd(-0.8, 1.6) + (i > 24 ? 0.5 : 0); raw.push(v); }
  for (i = 0; i < 36; i++) chart.push(E0 + (raw[i] - raw[0]) * (17.4 / (raw[35] - raw[0])));
  E = chart[35];
  var pct = AGENTS.map(function (a) { return a.base; });
  var NCH = 100;

  /* ---------- tween de contadores ---------- */
  var tw = {}, twRun = false;
  function tween(key, target, render) {
    var t = tw[key];
    if (!t) { t = tw[key] = { cur: target, target: target, render: render }; render(target); return; }
    t.target = target; t.render = render;
    if (!twRun) { twRun = true; requestAnimationFrame(tick); }
  }
  function tick() {
    var go = false;
    for (var k in tw) {
      var t = tw[k], d = t.target - t.cur;
      if (Math.abs(d) > 0.004) { t.cur += d * 0.14; go = true; } else if (t.cur !== t.target) { t.cur = t.target; }
      else continue;
      t.render(t.cur);
    }
    if (go && !document.hidden) requestAnimationFrame(tick); else twRun = false;
  }

  /* ---------- Painel ---------- */
  var W = 360, H = 135;
  var xs = AGENTS.map(function (a, k) { return 20 + k * 40; });
  var CORE = { x: 180, y: 182 };
  var diagram = AGENTS.map(function (a, k) {
    var x = xs[k], d = "M" + x + " 58 C" + x + " 108 180 104 180 " + (CORE.y - 32);
    var o = '<path d="' + d + '" fill="none" stroke="' + a.c + '" stroke-opacity=".55" stroke-width="1.6"/>';
    for (var j = 0; j < 3; j++) {
      var dur = (2.6 + (k % 4) * 0.35).toFixed(2);
      o += '<circle r="2.6" fill="' + a.c + '" stroke="' + a.c + '" stroke-opacity=".3" stroke-width="4"><animateMotion dur="' + dur + 's" begin="' + (k * 0.23 + j * dur / 3).toFixed(2) + 's" repeatCount="indefinite" path="' + d + '"/></circle>';
    }
    return o;
  }).join("");
  var icons = AGENTS.map(function (a, k) {
    return '<text x="' + xs[k] + '" y="10" text-anchor="middle" font-size="8" font-weight="600" fill="' + a.c + '" style="font-family:var(--mono)">' + LABELS[k] + "</text>" +
      '<g transform="translate(' + (xs[k] - 15) + ',18)">' + botIcon(a.c, 30).replace("<svg ", "<svg x=\"0\" y=\"0\" ") + "</g>";
  }).join("");
  // ícones aninhados como <svg> dentro de <svg> mantêm o viewBox próprio

  function acard(a, k, full) {
    return '<div class="acard' + (k === AGENTS.length - 1 ? " span" : "") + '" id="ac' + (full ? "f" : "") + k + '" style="--c:' + a.c + '">' +
      '<div class="ah">' + botIcon(a.c, 22) + '<span class="an">' + a.short + '</span><span class="ar">' + a.role + " · q" + a.q + '</span><span class="ap" id="pc' + (full ? "f" : "") + k + '"></span></div>' +
      (full ? '<div class="afull">' + a.name + "</div>" : "") +
      '<div class="as" id="st' + (full ? "f" : "") + k + '"></div>' +
      '<div class="abar"><i id="pb' + (full ? "f" : "") + k + '" style="width:0"></i></div>' +
      (full ? '<div class="areal"><b>Estado real</b>' + a.real + "</div>" : "") + "</div>";
  }

  var gl = [0.3, 0.55, 0.8].map(function (g) { return ""; }).join("");
  $("v-Painel").innerHTML =
    SAMPLE +
    '<div class="l1" id="l1">MT5 · Desk Chief · 9 bots · 0h 04m</div>' +
    '<div class="eqrow"><div class="eq" id="eq"></div><div class="delta" id="delta">+17</div></div>' +
    '<div class="prow"><span class="pillA" id="pin">em risco 68 · 53 ordens</span><span class="pillW" id="mult">2,60×</span></div>' +
    '<div class="pl"><span id="pl">+108,92 · 40G 13P</span><span class="tm" id="ptm">01:04</span></div>' +
    '<div class="pb"><span class="ic">' + botIcon("#ffc233", 22, false) + '</span><span class="nm">Risco diário</span><span class="cost" id="rcost">−37,0</span>' +
      '<span class="tr"><i id="rbar" style="width:36%"></i></span><span class="pc" id="rpc">usado 36%</span></div>' +
    '<div class="chart"><svg viewBox="0 0 ' + W + " " + H + '" preserveAspectRatio="none" style="height:135px"><defs><linearGradient id="gf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3fdc8a" stop-opacity=".5"/><stop offset="1" stop-color="#3fdc8a" stop-opacity="0"/></linearGradient></defs>' +
      '<line id="base" x1="0" x2="' + W + '" stroke="#6b7280" stroke-width="1" stroke-dasharray="3 5" opacity=".7"/>' +
      '<path id="area" fill="url(#gf)"/><path id="line" fill="none" stroke="#3fdc8a" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round" style="filter:drop-shadow(0 0 5px rgba(63,220,138,.8))"/></svg>' +
      '<svg viewBox="0 0 ' + W + " " + H + '" preserveAspectRatio="none" style="height:135px;position:absolute;left:0;right:0;top:0;pointer-events:none;width:100%"><circle class="ring" id="ring" r="9" fill="#fff" opacity=".4"/><circle id="dotc" r="6.5" fill="#06070a" stroke="#fff" stroke-width="2.4" style="filter:drop-shadow(0 0 6px #fff)"/></svg></div>' +
    '<div class="axis"><span id="ax0">22:00</span><span class="mid">— valor &nbsp; -- investido</span><span id="ax1">08:00</span></div>' +

    '<div class="card feed glass"><div class="feedsample">' + SAMPLE + '</div><div class="fm" id="feed"></div></div>' +

    '<div class="card glass"><div class="hd2"><span class="h2">9 bots · live load</span><span class="run"><span class="dot blink"></span><span id="run">9 ativos · 9 474 ops/s</span></span></div>' +
      '<div class="agrid">' + AGENTS.map(function (a, k) { return acard(a, k, false); }).join("") + "</div></div>" +

    '<div class="card glass"><div class="hd2"><span class="h2">9 bots → desk core</span><span class="dsig" id="sig">470 sinais</span></div>' +
      '<svg class="diag" viewBox="0 0 360 226" aria-hidden="true">' + diagram + icons +
        '<text x="118" y="' + (CORE.y + 4) + '" text-anchor="end" font-size="11" fill="#5b616c" style="font-family:var(--mono)">9 → 1</text>' +
        '<circle class="ring" cx="180" cy="' + CORE.y + '" r="32" fill="none" stroke="#3fdc8a" stroke-width="2"/>' +
        '<circle cx="180" cy="' + CORE.y + '" r="46" fill="#3fdc8a" opacity=".07"/>' +
        '<g class="core"><circle cx="180" cy="' + CORE.y + '" r="32" fill="#06100b" stroke="#3fdc8a" stroke-width="3" style="filter:drop-shadow(0 0 8px rgba(63,220,138,.9))"/>' +
        '<rect x="161" y="' + (CORE.y - 12) + '" width="38" height="25" rx="11" fill="#f1f3f6"/>' +
        '<rect x="170" y="' + (CORE.y - 4) + '" width="5.5" height="10" rx="2.7" fill="#3fdc8a"/><rect x="184.5" y="' + (CORE.y - 4) + '" width="5.5" height="10" rx="2.7" fill="#3fdc8a"/></g>' +
        '<g transform="translate(222,' + (CORE.y - 9) + ')"><rect width="16" height="16" rx="5" fill="#0d1a12" stroke="#3fdc8a" stroke-opacity=".6"/><path d="M4 8.5l3 3 5-6" stroke="#3fdc8a" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>' +
        '<text x="244" y="' + (CORE.y + 4) + '" font-size="11" font-weight="600" fill="#3fdc8a" style="font-family:var(--mono)">EXECUTE</text>' +
        '<text x="180" y="222" text-anchor="middle" font-size="10" fill="#6b7280" style="font-family:var(--mono)">Desk Chief</text></svg></div>' +
    '<p class="foot">Valores reais (equity demo, 0 posições, RISK_PAUSE) no separador Risco. O resto desta página é animação de exemplo.</p>';

  /* ---------- Bots ---------- */
  $("v-Bots").innerHTML = SAMPLE +
    '<div class="agrid" style="margin-top:0">' + AGENTS.map(function (a, k) { return acard(a, k, true); }).join("") + "</div>";

  /* ---------- Pipeline ---------- */
  $("v-Pipeline").innerHTML = '<div class="card glass">' +
    '<div class="sec">Pipeline de estratégias</div>' +
    '<div class="sub">Nenhuma estratégia concluiu o pipeline. Cada transição é aprovada pelo Desk Chief; o risco tem veto.</div>' +
    '<div style="margin-top:10px">' + SAMPLE + "</div>" +
    '<div style="margin-top:14px">' + STAGES.map(function (s, k) {
      return '<div class="stage" id="sg' + k + '"><div class="ln"><div class="n">' + (k + 1) + "</div>" +
        (k < STAGES.length - 1 ? '<div class="seg"></div>' : "") + '</div><div class="bd"><div class="row" style="gap:6px"><span class="nm">' + s[0] +
        '</span><span class="here">estratégia de exemplo</span></div>' +
        (s[1] ? '<div class="gate">Porta: ' + s[1] + "</div>" : "") + "</div></div>";
    }).join("") + "</div></div>";

  /* ---------- Risco ---------- */
  var CEIL = [["Por ordem", "2%", "41,11 USD"], ["Perda diária", "5%", "102,77 USD"], ["Drawdown", "20%", "411,09 USD"]];
  var MODES = [["SIMULAÇÃO", 1], ["PAPER", 0], ["MANUAL", 0], ["REAL_LIMITADO", 0]];
  var CHECKS = [
    ["Equity da conta demo", "2 055,44 USD"], ["Corretora", "Exness · demo · 1:500"], ["The Bridge", "v0.2.1 instalado"],
    ["Verificação de leitura", "0 FAIL"], ["Alertas Slack", "ativos"], ["Execução (exec_service)", "desativada"], ["Posições abertas", "0"],
    ["Alavancagem", "segue a conta · 1:500"], ["Conta pequena", "perda de stress até 25% da equity por posição (autorizado)"]
  ];
  $("v-Risco").innerHTML =
    '<div class="card glass"><div class="row sb"><span class="sec">Tetos de risco</span><span class="chip">valores reais</span></div>' +
    CEIL.map(function (c) {
      return '<div style="margin-top:12px"><div class="row sb" style="margin-bottom:5px"><span style="font-size:13px">' + c[0] + ' <b class="mono">' + c[1] + '</b></span><span class="mono" style="font-size:13px;font-weight:600">' + c[2] + "</span></div>" +
        '<div class="bar"></div><div class="mini" style="margin-top:3px">0,00 USD em uso · 0 posições abertas</div></div>';
    }).join("") + "</div>" +
    '<div class="card glass" style="border-color:rgba(255,194,51,.4);box-shadow:0 0 18px rgba(255,194,51,.12)"><div class="row" style="gap:8px"><span class="dot blink" style="background:var(--yellow);box-shadow:0 0 8px var(--yellow)"></span><span class="sec">RISK_PAUSE ativo</span></div>' +
    '<div class="sub">Sem avaliação real de ordens até à v0.2.2 e à revalidação do Risk Officer, segunda 16/11. O Risk Officer tem veto.</div></div>' +
    '<div class="card glass"><div class="sec">Modos da mesa</div><div class="row" style="margin-top:10px">' +
    MODES.map(function (m) { return '<span class="mchip' + (m[1] ? " on" : "") + '">' + m[0] + "</span>"; }).join("") + "</div>" +
    '<div class="mini" style="margin-top:8px;font-size:11px">A mesa arranca sempre em SIMULAÇÃO. REAL_LIMITADO está desligado por defeito.</div></div>' +
    '<div class="card glass"><div class="sec" style="margin-bottom:4px">Estado real</div>' +
    CHECKS.map(function (c) { return '<div class="kv"><span>' + c[0] + "</span><b>" + c[1] + "</b></div>"; }).join("") + "</div>";

  /* ---------- feed ---------- */
  function makeRow(id) {
    var sy = pick(SYMS), buy = Math.random() < 0.5, mag = rnd(0.4, 8.6), win = Math.random() < 0.75;
    return { id: id, sym: sy, buy: buy, lots: pick(sy.lots), pnl: win ? mag : -mag, t: nowTime(), amt: rnd(1, 14) };
  }
  function rowEl(r, animate) {
    var e = document.createElement("div");
    e.className = "frow" + (animate ? " slide" : "");
    var note, am;
    if (r.buy) {
      note = '<span class="nt">guard ✓ · SL ok · ' + r.lots.toFixed(2).replace(".", ",") + " lote</span>";
      am = "$" + fmt(r.amt).replace("$", "");
    } else {
      note = '<span class="nt g">' + (r.pnl >= 0 ? "+" : "") + fmt(r.pnl) + " via Bridge</span>"; am = "";
    }
    e.innerHTML = '<span class="t">' + r.t + '</span><span class="sd ' + (r.buy ? "b" : "s") + '">' + (r.buy ? "BUY" : "SELL") + "</span>" +
      '<span class="coin" style="background:' + r.sym.c + ";--cc:" + r.sym.c + '">' + r.sym.s.charAt(0) + '</span><span class="sy">' + r.sym.s + "</span>" + note +
      (am ? '<span class="am">' + am.replace("$", "") + "</span>" : "");
    return e;
  }
  var feedEl = $("feed");
  var first = [makeRow(1), makeRow(2), makeRow(3), makeRow(4)];
  first[0].buy = true; first[1].buy = false; first[2].buy = false; first[3].buy = true;
  first.forEach(function (r) { feedEl.insertBefore(rowEl(r, false), feedEl.firstChild); });
  feedId = 4;

  /* ---------- atualizadores ---------- */
  function renderEq(x) {
    var s = fmt(x, 2), idx = s.lastIndexOf(",");
    $("eq").innerHTML = '<span class="cur">US$</span>' + s.slice(0, idx) + '<span class="dec">' + s.slice(idx) + "</span>";
  }
  function setTargets() {
    tween("eq", E, renderEq);
    tween("delta", E - E0, function (x) {
      var d = $("delta"); d.textContent = (x >= 0 ? "+" : "\u2212") + fmt(Math.abs(x), 0); d.className = "delta" + (x >= 0 ? "" : " neg");
    });
    tween("pl", profit, function (x) { $("pl").textContent = (x >= 0 ? "+" : "\u2212") + fmt(Math.abs(x)) + " · " + wins + "G " + losses + "P"; });
    tween("sig", signals, function (x) { $("sig").textContent = fmt(Math.round(x), 0) + " sinais"; });
    tween("ops", opsT, function (x) { $("run").textContent = "9 ativos · " + fmt(Math.round(x), 0) + " ops/s"; });
    tween("risk", riskPct, function (x) {
      $("rcost").textContent = "\u2212" + fmt((x / 100) * 102.77, 1);
      $("rbar").style.width = x + "%"; $("rpc").textContent = "usado " + fmt(x, 0) + "%";
    });
    tween("mult", mult, function (x) { $("mult").textContent = fmt(x, 2) + "×"; });
  }
  function drawIn() { $("pin").textContent = "em risco " + fmt(trades * 1.28, 0) + " · " + trades + " ordens"; }
  function drawChart() {
    var mn = Math.min.apply(null, chart), mx = Math.max.apply(null, chart), span = mx - mn || 1;
    var Y = function (y) { return 12 + (1 - (y - mn) / span) * (H - 36); };
    var n = chart.length;
    var pts = chart.map(function (y, k) { return [(k / (NCH - 1)) * W, Y(y)]; });
    var line = pts.map(function (p, k) { return (k ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1); }).join(" ");
    var e = pts[n - 1];
    $("line").setAttribute("d", line);
    $("area").setAttribute("d", line + " L" + e[0].toFixed(1) + " " + H + " L0 " + H + " Z");
    var by = Y(chart[0]); $("base").setAttribute("y1", by); $("base").setAttribute("y2", by);
    ["ring", "dotc"].forEach(function (id) { $(id).setAttribute("cx", e[0].toFixed(1)); $(id).setAttribute("cy", e[1].toFixed(1)); });
  }
  function drawAgents() {
    AGENTS.forEach(function (a, k) {
      ["", "f"].forEach(function (p) {
        $("pc" + p + k).textContent = fmt(pct[k], 0) + "%";
        $("pb" + p + k).style.width = pct[k] + "%";
      });
    });
  }
  function drawLine(k) {
    var a = AGENTS[k], txt = a.lines[(lineIdx + k) % a.lines.length];
    ["", "f"].forEach(function (p) {
      var el = $("st" + p + k);
      el.innerHTML = txt + '<span class="cu"></span>';
    });
    ["ac", "acf"].forEach(function (p) {
      var c = $(p + k); c.classList.add("hot");
      setTimeout(function () { c.classList.remove("hot"); }, 1200);
    });
  }
  function drawStage() {
    STAGES.forEach(function (s, k) { $("sg" + k).className = "stage" + (k < stage ? " done" : k === stage ? " cur" : ""); });
  }
  function drawClock() {
    var h = Math.floor(secs / 3600), m = Math.floor((secs % 3600) / 60);
    $("l1").textContent = "MT5 · Desk Chief · 9 bots · " + h + "h " + m + "m " + p2(secs % 60) + "s";
    $("ptm").textContent = p2(Math.floor(secs / 60) % 60) + ":" + p2(secs % 60);
  }

  renderEq(E); drawIn(); drawChart(); drawAgents(); drawStage(); drawClock(); setTargets();
  AGENTS.forEach(function (a, k) { drawLine(k); });

  /* ---------- relógios (pausam em segundo plano) ---------- */
  var timers = [];
  function every(ms, fn) { timers.push(setInterval(fn, ms)); }
  function start() {
    if (timers.length) return;
    every(1500, function () {
      var last = chart[chart.length - 1];
      chart.push(last + rnd(-1, 1.7));
      if (chart.length > NCH) chart.shift();
      if (chart.length > 60 && Math.random() < 0.02) chart = chart.slice(-30);
      E = chart[chart.length - 1];
      riskPct = Math.max(8, Math.min(92, riskPct + rnd(-2, 2.4)));
      drawChart(); setTargets();
    });
    every(3200, function () {
      var r = makeRow(++feedId);
      trades++;
      if (!r.buy) {
        profit += r.pnl; if (r.pnl >= 0) wins++; else losses++;
        mult = Math.max(1.2, mult + (r.pnl >= 0 ? 0.01 : -0.012));
        chart.push(chart[chart.length - 1] + r.pnl * 0.25); if (chart.length > NCH) chart.shift(); E = chart[chart.length - 1];
      }
      feedEl.insertBefore(rowEl(r, true), feedEl.firstChild);
      while (feedEl.children.length > 4) feedEl.removeChild(feedEl.lastChild);
      drawIn(); setTargets();
    });
    every(1600, function () {
      pct = pct.map(function (x, k) { return Math.max(18, Math.min(99, x + rnd(-6, 6) + (AGENTS[k].base - x) * 0.15)); });
      opsT = Math.max(7000, Math.min(12000, opsT + rnd(-400, 420)));
      drawAgents(); setTargets();
    });
    every(700, function () { hot = (hot + 1) % AGENTS.length; if (hot === 0) lineIdx++; drawLine(hot); });
    every(2500, function () { stage = (stage + 1) % STAGES.length; drawStage(); });
    every(1000, function () {
      secs++; signals += 1 + Math.floor(Math.random() * 4);
      drawClock(); setTargets();
    });
  }
  function stop() { timers.forEach(clearInterval); timers = []; }
  document.addEventListener("visibilitychange", function () { if (document.hidden) stop(); else start(); });
  start();

  /* ---------- separadores ---------- */
  var TABS = ["Painel", "Bots", "Pipeline", "Risco"];
  function show(t) {
    if (TABS.indexOf(t) < 0) t = "Painel";
    TABS.forEach(function (n) { $("v-" + n).hidden = n !== t; });
    Array.prototype.forEach.call(document.querySelectorAll("#tabbar button"), function (b) {
      b.classList.toggle("on", b.getAttribute("data-tab") === t);
    });
    try { history.replaceState(null, "", "#" + t); } catch (e) {}
    window.scrollTo(0, 0);
  }
  Array.prototype.forEach.call(document.querySelectorAll("#tabbar button"), function (b) {
    b.addEventListener("click", function () { show(b.getAttribute("data-tab")); });
  });
  show(location.hash.replace("#", ""));

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () { navigator.serviceWorker.register("service-worker.js").catch(function () {}); });
  }
})();
