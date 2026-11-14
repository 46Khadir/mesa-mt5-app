(function () {
  "use strict";

  var COLS = ["var(--blue)", "var(--yellow)", "var(--cyan)"];
  var AGENTS = [
    { id: "AS", name: "Alpha Scout", role: "Ideias e sinais", real: "A pesquisar em SIMULAÇÃO; sem histórico da corretora até haver ligação.", lines: ["a analisar sinal em EURUSDm H1", "a triar ideia: reversão à média", "novo candidato: breakout em XAUUSDm"], base: 72 },
    { id: "TQ", name: "The Quant", role: "Backtest", real: "Backtests na pilha de pesquisa da box; sem dados da corretora ainda.", lines: ["a correr backtest em EURUSDm", "walk-forward janela 4 de 8", "a calcular drawdown máximo"], base: 64 },
    { id: "TT", name: "The Tuner", role: "Otimização", real: "Pronto para otimizar assim que houver estratégias especificadas.", lines: ["a otimizar parâmetros (grelha 12×8)", "a validar estabilidade", "a reduzir sobreajuste"], base: 58 },
    { id: "PH", name: "Pair Hunter", role: "Pares e correlação", real: "À espera das especificações reais da demo (segunda 16/11).", lines: ["correlação EURUSDm / GBPUSDm", "a procurar cointegração", "a medir spread do par"], base: 49 },
    { id: "IN", name: "The Incubator", role: "Incubação", real: "Nenhuma estratégia em incubação.", lines: ["estratégia de exemplo em incubação", "a comparar com o backtest", "a registar desvios"], base: 41 },
    { id: "RO", name: "Risk Officer MT5", role: "Risco e veto", real: "RISK_PAUSE ativo até v0.2.2 e revalidação de segunda 16/11.", lines: ["a verificar teto de 2% por ordem", "a validar margem e stop", "veto em standby"], base: 83 },
    { id: "TR", name: "The Trader", role: "Execução", real: "Execução desativada (exec_service off). Sem ordens reais.", lines: ["à espera de aprovação formal", "a simular envio de ordem", "a confirmar preenchimento (simulado)"], base: 36 },
    { id: "ME", name: "The Mechanic", role: "Infra e código", real: "v0.2.2 em curso, entrega até 15/11 às 12:00.", lines: ["a rever código do bridge", "a correr testes", "a preparar pacote v0.2.2"], base: 77 },
    { id: "BR", name: "The Bridge", role: "Ponte MT5", real: "v0.2.1 instalado · verificação de leitura 0 FAIL · alertas Slack ativos.", lines: ["a ler cotações MT5 (simulado)", "a validar assinatura HMAC", "estado: RECEBIDA → VALIDADA"], base: 68 }
  ];
  var STAGES = [
    ["IDEIA"], ["TRIAGEM"], ["ESPECIFICAÇÃO"], ["CODIFICAÇÃO"], ["BACKTEST"], ["WALK-FORWARD"], ["CROSS-CHECK"], ["INCUBAÇÃO"],
    ["APROVAÇÃO DE RISCO", "visto do Risk Officer"], ["PAPER", "apenas conta demo"],
    ["APROVAÇÃO FORMAL", "autorização explícita do Khadir"], ["EXECUÇÃO LIMITADA", "desligada por defeito"], ["MONITORIZAÇÃO"]
  ];
  var SYMS = [
    { s: "EURUSDm", p: 1.084, d: 5, lots: [0.01, 0.02, 0.03] },
    { s: "XAUUSDm", p: 2650.4, d: 2, lots: [0.01, 0.02] },
    { s: "BTCUSDm", p: 94500, d: 2, lots: [0.01, 0.02] },
    { s: "ETHUSDm", p: 3200, d: 2, lots: [0.01, 0.05] }
  ];

  function fmt(n, d) {
    if (d === undefined) d = 2;
    var s = Math.abs(n).toFixed(d).split(".");
    var g = s[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    return (n < 0 ? "\u2212" : "") + g + (s[1] ? "," + s[1] : "");
  }
  function p2(x) { return x < 10 ? "0" + x : "" + x; }
  function nowTime() { var d = new Date(); return p2(d.getHours()) + ":" + p2(d.getMinutes()) + ":" + p2(d.getSeconds()); }
  function $(id) { return document.getElementById(id); }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function badge(text) {
    return '<div class="sample"><span class="dot warn blink"></span><span>' + text + "</span></div>";
  }

  /* ---------- estado simulado ---------- */
  var chart = [], v = 0, i;
  for (i = 0; i < 40; i++) { v += (Math.random() - 0.42) * 4; chart.push(v); }
  var feedId = 3, wl = [14, 6], signals = 1284, secs = 0, stage = 0, lineIdx = 0;
  var pct = AGENTS.map(function (a) { return a.base; });

  /* ---------- Painel ---------- */
  var W = 360, H = 110;
  var gridLines = [0.25, 0.5, 0.75].map(function (g) {
    return '<line x1="0" x2="' + W + '" y1="' + H * g + '" y2="' + H * g + '" stroke="var(--bds)" stroke-width="1"/>';
  }).join("");

  var nodes = AGENTS.map(function (a, k) {
    var ang = ((8 + k * 20) * Math.PI) / 180;
    var x = 180 - 150 * Math.cos(ang), y = 225 - 170 * Math.sin(ang);
    var d = "M" + x.toFixed(1) + " " + y.toFixed(1) + " Q" + x.toFixed(1) + " 225 180 225";
    var c = COLS[k % 3], dur = (2.2 + (k % 3) * 0.5).toFixed(1) + "s";
    return '<g><path d="' + d + '" fill="none" stroke="var(--bd)" stroke-width="1.2" stroke-dasharray="3 4"/>' +
      '<circle r="3.2" fill="' + c + '"><animateMotion dur="' + dur + '" begin="' + (k * 0.37).toFixed(2) + 's" repeatCount="indefinite" path="' + d + '"/></circle>' +
      '<circle r="2.4" fill="' + c + '" opacity=".6"><animateMotion dur="' + dur + '" begin="' + (k * 0.37 + 1.2).toFixed(2) + 's" repeatCount="indefinite" path="' + d + '"/></circle>' +
      '<circle class="nodeA" style="animation-delay:' + (k * 0.25) + 's" cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="16" fill="var(--elev)" stroke="' + c + '" stroke-width="2"/>' +
      '<text x="' + x.toFixed(1) + '" y="' + (y + 3.5).toFixed(1) + '" text-anchor="middle" font-size="10" font-weight="600" fill="var(--t1)" style="font-family:var(--mono)">' + a.id + "</text></g>";
  }).join("");

  var legend = AGENTS.map(function (a) { return "<span><b>" + a.id + "</b> " + a.name + "</span>"; }).join("");

  $("v-Painel").innerHTML =
    '<div class="card">' +
      '<div class="label">Equity · conta demo (valor real)</div>' +
      '<div class="big mono" style="margin-top:6px">' + fmt(2055.44) + " <small>USD</small></div>" +
      '<div class="row" style="margin-top:8px"><span class="pill">0 posições abertas</span><span class="pill">RISK_PAUSE ativo</span><span class="pill">modo SIMULAÇÃO</span></div>' +
      '<div class="row" style="margin-top:14px;align-items:stretch">' +
        [["2% por ordem", "41,11 USD"], ["5% diário", "102,77 USD"], ["20% drawdown", "411,09 USD"]].map(function (x) {
          return '<div class="ceil"><div class="k">' + x[0] + '</div><div class="v mono">' + x[1] + "</div></div>";
        }).join("") +
      "</div></div>" +

    '<div class="card">' +
      '<div class="row sb"><div class="label">Curva de exemplo</div><span class="pill ex">exemplo</span></div>' +
      '<div class="row sb" style="margin-top:6px"><div class="mono" style="font-size:24px;font-weight:600"><span id="pnl">+0,00</span> <small style="font-size:12px;color:var(--t2);font-weight:500">USD simulados</small></div>' +
      '<span class="pill up" id="pnlpill">P&amp;L simulado ▲</span></div>' +
      '<svg viewBox="0 0 ' + W + " " + H + '" width="100%" style="margin-top:10px">' + gridLines +
        '<path id="area" fill="rgba(76,141,255,.18)"/><path id="line" fill="none" stroke="var(--blue)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>' +
        '<circle class="ring" id="ring" r="5" fill="var(--blue)"/><circle id="dotc" r="4" fill="var(--blue)"/></svg>' +
      '<div class="row sb" style="margin-top:10px;font-size:12px;color:var(--t2)"><span>Ganhos <b class="mono" style="color:var(--t1)" id="wins">14</b> · Perdas <b class="mono" style="color:var(--t1)" id="loss">6</b></span><span>taxa <b class="mono" style="color:var(--t1)" id="rate">70%</b></span></div>' +
      '<div style="margin-top:10px"><div class="row sb" style="margin-bottom:5px"><span class="mini" style="font-size:11px">Orçamento diário de risco usado (exemplo)</span><span class="mono" style="font-size:11px" id="ddtxt"></span></div>' +
      '<div class="bar" style="height:8px"><i id="ddbar" style="background:var(--cyan);width:0"></i></div></div>' +
    "</div>" +

    '<div class="card">' +
      '<div class="row sb"><div class="row" style="gap:6px"><span class="dot ok blink"></span><span style="font-size:14px;font-weight:600">Feed de ordens</span></div><span class="pill ex">exemplo</span></div>' +
      '<div style="margin-top:8px">' + badge("DADOS DE EXEMPLO · ordens fictícias, nenhuma ordem real") + "</div>" +
      '<div id="feed" style="margin-top:6px"></div></div>' +

    '<div class="card">' +
      '<div class="row sb"><span style="font-size:14px;font-weight:600">Bots → Desk Chief</span><span class="pill ex">sinais de exemplo</span></div>' +
      '<svg viewBox="0 0 360 285" width="100%" style="margin-top:6px">' + nodes +
        '<circle class="ring" cx="180" cy="225" r="26" fill="var(--blue)"/>' +
        '<circle cx="180" cy="225" r="26" fill="var(--elev)" stroke="var(--blue)" stroke-width="2.5"/>' +
        '<text x="180" y="229" text-anchor="middle" font-size="12" font-weight="700" fill="var(--t1)" style="font-family:var(--mono)">DC</text>' +
        '<text x="180" y="268" text-anchor="middle" font-size="11" font-weight="600" fill="var(--t2)">Desk Chief</text></svg>' +
      '<div class="row" style="justify-content:space-around;margin-top:4px">' +
        '<div style="text-align:center"><div class="mono" style="font-size:20px;font-weight:600" id="sig">1 284</div><div class="mini">sinais processados (exemplo)</div></div>' +
        '<div style="text-align:center"><div class="mono" style="font-size:20px;font-weight:600" id="ops">6,4</div><div class="mini">ops/s (exemplo)</div></div></div>' +
      '<div class="legend">' + legend + "</div></div>";

  /* ---------- Bots ---------- */
  $("v-Bots").innerHTML = badge("DADOS DE EXEMPLO · carga e atividade são simuladas; o estado real está sob cada cartão") +
    '<div class="grid">' + AGENTS.map(function (a, k) {
      var c = COLS[k % 3];
      return '<div class="card agent"><div class="hd"><div class="tile mono" style="border-color:' + c + '">' + a.id + "</div>" +
        '<div style="min-width:0"><div class="nm">' + a.name + '</div><div class="rl">' + a.role + "</div></div></div>" +
        '<div class="st" id="st' + k + '"></div>' +
        '<div class="row sb"><span class="mini">carga (exemplo)</span><span class="mono" style="font-size:13px;font-weight:600" id="pc' + k + '"></span></div>' +
        '<div class="bar" style="height:6px"><i id="pb' + k + '" style="background:' + c + ';width:0"></i></div>' +
        '<div class="re"><b>Estado real</b>' + a.real + "</div></div>";
    }).join("") + "</div>";

  /* ---------- Pipeline ---------- */
  $("v-Pipeline").innerHTML = '<div class="card">' +
    '<div style="font-size:14px;font-weight:600">Pipeline de estratégias</div>' +
    '<div style="font-size:12px;color:var(--t2);margin-top:4px">Nenhuma estratégia concluiu o pipeline. Cada transição é aprovada pelo Desk Chief; o risco tem veto.</div>' +
    '<div style="margin-top:10px">' + badge("DADOS DE EXEMPLO · a estratégia que avança é fictícia") + "</div>" +
    '<div style="margin-top:12px">' + STAGES.map(function (s, k) {
      return '<div class="stage" id="sg' + k + '"><div class="ln"><div class="n mono">' + (k + 1) + "</div>" +
        (k < STAGES.length - 1 ? '<div class="seg"></div>' : "") + '</div><div class="bd"><div class="row" style="gap:6px"><span class="nm">' + s[0] +
        '</span><span class="pill here">estratégia de exemplo aqui</span></div>' +
        (s[1] ? '<div class="gate">Porta: ' + s[1] + "</div>" : "") + "</div></div>";
    }).join("") + "</div></div>";

  /* ---------- Risco ---------- */
  var CEIL = [["Por ordem", "2%", "41,11 USD"], ["Perda diária", "5%", "102,77 USD"], ["Drawdown", "20%", "411,09 USD"]];
  var MODES = [["SIMULAÇÃO", 1], ["PAPER", 0], ["MANUAL", 0], ["REAL_LIMITADO", 0]];
  var CHECKS = [
    ["The Bridge", "v0.2.1 instalado"], ["Verificação de leitura", "0 FAIL"], ["Alertas Slack", "ativos"],
    ["Execução (exec_service)", "desativada"], ["Posições abertas", "0"], ["Alavancagem", "segue a conta · 1:500"],
    ["Conta pequena", "perda de stress até 25% da equity por posição (autorizado)"]
  ];
  $("v-Risco").innerHTML =
    '<div class="card"><div class="row sb"><span style="font-size:14px;font-weight:600">Tetos de risco</span><span class="pill">valores reais</span></div>' +
    CEIL.map(function (c) {
      return '<div style="margin-top:12px"><div class="row sb" style="margin-bottom:5px"><span style="font-size:13px">' + c[0] + " <b class=\"mono\">" + c[1] + '</b></span><span class="mono" style="font-size:13px;font-weight:600">' + c[2] + "</span></div>" +
        '<div class="bar" style="height:8px"></div><div class="mini" style="margin-top:3px">0,00 USD em uso · 0 posições abertas</div></div>';
    }).join("") + "</div>" +
    '<div class="card"><div class="row" style="gap:8px"><span class="dot warn blink" style="width:9px;height:9px"></span><span style="font-size:14px;font-weight:600">RISK_PAUSE ativo</span></div>' +
    '<div style="font-size:12px;color:var(--t2);margin-top:6px">Sem avaliação real de ordens até à v0.2.2 e à revalidação do Risk Officer, segunda 16/11. O Risk Officer tem veto.</div></div>' +
    '<div class="card"><div style="font-size:14px;font-weight:600">Modos da mesa</div><div class="row" style="margin-top:10px">' +
    MODES.map(function (m) { return '<span class="chip' + (m[1] ? " on" : "") + '">' + m[0] + "</span>"; }).join("") + "</div>" +
    '<div class="mini" style="margin-top:8px;font-size:11px">A mesa arranca sempre em SIMULAÇÃO. REAL_LIMITADO está desligado por defeito.</div></div>' +
    '<div class="card"><div style="font-size:14px;font-weight:600;margin-bottom:4px">Estado de segurança</div>' +
    CHECKS.map(function (c) { return '<div class="kv"><span>' + c[0] + "</span><b>" + c[1] + "</b></div>"; }).join("") + "</div>";

  /* ---------- feed ---------- */
  function makeRow(id) {
    var sy = pick(SYMS), win = Math.random() < 0.58, mag = 0.4 + Math.random() * 8.6;
    return { id: id, sym: sy.s, buy: Math.random() < 0.5, lots: pick(sy.lots), price: fmt(sy.p * (1 + (Math.random() - 0.5) * 0.002), sy.d), pnl: win ? mag : -mag, t: nowTime() };
  }
  function rowEl(r, animate) {
    var e = document.createElement("div");
    e.className = "frow" + (animate ? " slide" : "");
    e.innerHTML = '<div class="row" style="gap:8px"><span class="side ' + (r.buy ? "b" : "s") + '">' + (r.buy ? "COMPRA" : "VENDA") + "</span>" +
      '<span style="font-size:13px;font-weight:600">' + r.sym + '</span><span class="mono mini" style="font-size:11px">' + r.lots.toFixed(2).replace(".", ",") + " lote</span></div>" +
      '<div class="row" style="gap:10px"><span class="mono" style="font-size:12px;color:var(--t2)">' + r.price + "</span>" +
      '<span class="mono" style="font-size:12px;font-weight:600;color:' + (r.pnl >= 0 ? "var(--ok)" : "var(--bad)") + '">' + (r.pnl >= 0 ? "+" : "") + fmt(r.pnl) + "</span>" +
      '<span class="mono mini">' + r.t + "</span></div>";
    return e;
  }
  var feedEl = $("feed");
  [makeRow(1), makeRow(2), makeRow(3)].forEach(function (r) { feedEl.insertBefore(rowEl(r, false), feedEl.firstChild); });

  /* ---------- atualizadores ---------- */
  function drawChart() {
    var mn = Math.min.apply(null, chart), mx = Math.max.apply(null, chart), span = mx - mn || 1;
    var pts = chart.map(function (y, k) { return [(k / (chart.length - 1)) * W, 8 + (1 - (y - mn) / span) * (H - 16)]; });
    var line = pts.map(function (p, k) { return (k ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1); }).join(" ");
    $("line").setAttribute("d", line);
    $("area").setAttribute("d", line + " L" + W + " " + H + " L0 " + H + " Z");
    var e = pts[pts.length - 1];
    ["ring", "dotc"].forEach(function (id) { $(id).setAttribute("cx", e[0] - 4); $(id).setAttribute("cy", e[1]); });
    var last = chart[chart.length - 1], up = last >= 0, dd = Math.max.apply(null, chart) - last;
    $("pnl").textContent = (up ? "+" : "") + fmt(last);
    var pp = $("pnlpill"); pp.className = "pill " + (up ? "up" : "dn"); pp.innerHTML = "P&amp;L simulado " + (up ? "▲" : "▼");
    $("ddtxt").textContent = fmt(dd) + " / 102,77 USD";
    $("ddbar").style.width = Math.min(100, (dd / 102.77) * 100) + "%";
  }
  function drawWL() {
    $("wins").textContent = wl[0]; $("loss").textContent = wl[1];
    $("rate").textContent = fmt((wl[0] / (wl[0] + wl[1])) * 100, 0) + "%";
  }
  function drawAgents() {
    AGENTS.forEach(function (a, k) {
      $("pc" + k).textContent = fmt(pct[k], 0) + "%";
      $("pb" + k).style.width = pct[k] + "%";
    });
  }
  function drawLines() {
    AGENTS.forEach(function (a, k) {
      var el = $("st" + k);
      el.className = "st fade";
      el.innerHTML = '<i class="blink" style="background:' + COLS[k % 3] + '"></i>' + a.lines[(lineIdx + k) % a.lines.length];
    });
  }
  function drawStage() {
    STAGES.forEach(function (s, k) {
      $("sg" + k).className = "stage" + (k < stage ? " done" : k === stage ? " cur" : "");
    });
  }

  drawChart(); drawWL(); drawAgents(); drawLines(); drawStage();

  /* ---------- relógios (pausam com a app em segundo plano) ---------- */
  var timers = [];
  function every(ms, fn) { timers.push(setInterval(fn, ms)); }
  function start() {
    if (timers.length) return;
    every(1500, function () { chart.shift(); chart.push(chart[chart.length - 1] + (Math.random() - 0.42) * 4); drawChart(); });
    every(3000, function () {
      var r = makeRow(++feedId);
      if (r.pnl >= 0) wl[0]++; else wl[1]++;
      feedEl.insertBefore(rowEl(r, true), feedEl.firstChild);
      while (feedEl.children.length > 6) feedEl.removeChild(feedEl.lastChild);
      drawWL();
    });
    every(1600, function () {
      pct = pct.map(function (x, k) { return Math.max(12, Math.min(98, x + (Math.random() - 0.5) * 8 + (AGENTS[k].base - x) * 0.1)); });
      drawAgents();
    });
    every(2600, function () { lineIdx++; drawLines(); });
    every(2500, function () { stage = (stage + 1) % STAGES.length; drawStage(); });
    every(1000, function () {
      signals += 1 + Math.floor(Math.random() * 4); secs++;
      $("sig").textContent = fmt(signals, 0);
      $("ops").textContent = fmt(3 + Math.random() * 6.9, 1);
      $("clock").textContent = "animação ativa · " + p2(Math.floor(secs / 60)) + ":" + p2(secs % 60);
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
