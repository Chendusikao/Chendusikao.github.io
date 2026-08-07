import { createDemoSeries } from "./demo-data.js";

const allCandles = createDemoSeries();
const canvas = document.querySelector("#chart");
const context = canvas.getContext("2d");
const rangeLabel = document.querySelector("#range-label");
const insightHost = document.querySelector("#insights");
const guideCopy = document.querySelector("#guide-copy");
const glossaryCopy = document.querySelector("#glossary-copy");
const presetCopy = document.querySelector("#preset-copy");
const tooltip = document.querySelector("#chart-tooltip");
const tooltipFields = {
  date: document.querySelector("#tooltip-date"),
  open: document.querySelector("#tooltip-open"),
  high: document.querySelector("#tooltip-high"),
  low: document.querySelector("#tooltip-low"),
  close: document.querySelector("#tooltip-close"),
  change: document.querySelector("#tooltip-change"),
  volume: document.querySelector("#tooltip-volume"),
  state: document.querySelector("#tooltip-state"),
};

const state = {
  range: "1y",
  indicators: new Set(["ma", "macd"]),
  hoveredIndex: null,
  selectedIndex: null,
  evidenceTarget: null,
};

let chartLayout = null;

const insights = [
  { tone: "bullish", label: "趋势 · 示例", summary: "价格位于示例均线附近，趋势项给出偏强分数。", evidence: "ma" },
  { tone: "neutral", label: "动量 · 示例", summary: "副图指标位于中性区间，展示结构化证据的呈现方式。", evidence: "macd" },
  { tone: "bullish", label: "风险质量 · 示例", summary: "波动幅度处于示例阈值内；这不是任何交易建议。", evidence: "volume" },
];

const glossary = {
  ma: "MA：观察一段时间内的平均价格，帮助识别趋势方向。",
  macd: "MACD：比较快慢均线差异，辅助观察趋势动量变化。",
  rsi: "RSI：用 0–100 的示例区间观察近期价格动能，不代表买卖建议。",
};

const presets = {
  trend: { range: "1y", indicators: ["ma", "macd"], copy: "趋势预设：近 1 年 + MA / MACD，适合先看整体方向。" },
  swing: { range: "6m", indicators: ["ma", "rsi"], copy: "波段预设：近 6 月 + MA / RSI，适合观察阶段性节奏。" },
  short: { range: "3m", indicators: ["rsi"], copy: "短线预设：近 3 月 + RSI，适合演示近期动能查看。" },
};

function visibleSeries(all, range) {
  return all.slice(range === "3m" ? -63 : range === "6m" ? -126 : -252);
}

function movingAverage(items, period = 20) {
  return items.map((item, index) => {
    if (index < period - 1) return null;
    const window = items.slice(index - period + 1, index + 1);
    return window.reduce((sum, candle) => sum + candle.close, 0) / period;
  });
}

function exponentialAverage(values, period) {
  const alpha = 2 / (period + 1);
  return values.reduce((series, value, index) => {
    series.push(index === 0 ? value : value * alpha + series[index - 1] * (1 - alpha));
    return series;
  }, []);
}

function macd(items) {
  const closes = items.map((item) => item.close);
  const dif = exponentialAverage(closes, 12).map((value, index) => value - exponentialAverage(closes, 26)[index]);
  const dea = exponentialAverage(dif, 9);
  return dif.map((value, index) => ({ dif: value, dea: dea[index], histogram: (value - dea[index]) * 2 }));
}

function rsi(items, period = 14) {
  return items.map((item, index) => {
    if (index < period) return null;
    const window = items.slice(index - period, index + 1);
    let gains = 0;
    let losses = 0;
    for (let cursor = 1; cursor < window.length; cursor += 1) {
      const change = window[cursor].close - window[cursor - 1].close;
      if (change >= 0) gains += change;
      else losses -= change;
    }
    const relativeStrength = gains / (losses || 0.001);
    return 100 - 100 / (1 + relativeStrength);
  });
}

function canvasSize() {
  const rect = canvas.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, Math.floor(rect.width * ratio));
  canvas.height = Math.max(1, Math.floor(rect.height * ratio));
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  return { width: rect.width, height: rect.height };
}

function line(context, points, color, width = 1.5) {
  context.beginPath();
  context.strokeStyle = color;
  context.lineWidth = width;
  points.forEach((point, index) => {
    if (point === null) return;
    if (index === 0 || points[index - 1] === null) context.moveTo(point.x, point.y);
    else context.lineTo(point.x, point.y);
  });
  context.stroke();
}

function drawGrid(width, top, height, left, right) {
  context.strokeStyle = "#1c364f";
  context.lineWidth = 1;
  for (let row = 0; row <= 4; row += 1) {
    const y = top + (height / 4) * row;
    context.beginPath();
    context.moveTo(left, y);
    context.lineTo(width - right, y);
    context.stroke();
  }
}

function formatVolume(value) {
  return `${(value / 10000).toFixed(1)} 万`;
}

function hideInspection() {
  tooltip.hidden = true;
}

function updateInspection(candles, index) {
  if (index === null || index === undefined || !candles[index]) {
    hideInspection();
    return;
  }

  const item = candles[index];
  const previousClose = candles[index - 1]?.close;
  const change = previousClose ? ((item.close - previousClose) / previousClose) * 100 : null;
  tooltipFields.date.textContent = `${item.date} · 示例日线`;
  tooltipFields.open.textContent = item.open.toFixed(2);
  tooltipFields.high.textContent = item.high.toFixed(2);
  tooltipFields.low.textContent = item.low.toFixed(2);
  tooltipFields.close.textContent = item.close.toFixed(2);
  tooltipFields.change.textContent = change === null ? "--" : `${change >= 0 ? "+" : ""}${change.toFixed(2)}%`;
  tooltipFields.volume.textContent = formatVolume(item.volume);
  tooltipFields.state.textContent = state.selectedIndex === index ? "已固定 · 点击图表空白处或按 Esc 取消" : "悬停查看 · 点击可固定";
  tooltip.hidden = false;
}

function indexAtPointer(event) {
  if (!chartLayout) return null;
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const { candles, padding, step, priceTop, priceHeight, plotWidth } = chartLayout;
  if (x < padding.left || x > padding.left + plotWidth || y < priceTop || y > priceTop + priceHeight) return null;
  const index = Math.round((x - padding.left - step / 2) / step);
  return Math.max(0, Math.min(candles.length - 1, index));
}

function clearInspection() {
  state.hoveredIndex = null;
  state.selectedIndex = null;
  hideInspection();
}

function drawChart() {
  const { width, height } = canvasSize();
  const candles = visibleSeries(allCandles, state.range);
  const padding = { left: 12, right: 52, top: 20, bottom: 22 };
  const oscillatorHeight = Math.max(80, height * 0.2);
  const volumeHeight = Math.max(60, height * 0.14);
  const priceHeight = height - padding.top - padding.bottom - oscillatorHeight - volumeHeight - 20;
  const priceTop = padding.top;
  const volumeTop = priceTop + priceHeight + 10;
  const oscillatorTop = volumeTop + volumeHeight + 10;
  const plotWidth = width - padding.left - padding.right;
  const min = Math.min(...candles.map((item) => item.low));
  const max = Math.max(...candles.map((item) => item.high));
  const priceSpan = Math.max(max - min, 0.01);
  const step = plotWidth / candles.length;
  const candleWidth = Math.max(1, step * 0.62);
  const scaleY = (value) => priceTop + ((max - value) / priceSpan) * priceHeight;
  chartLayout = { candles, padding, step, priceTop, priceHeight, plotWidth };

  context.clearRect(0, 0, width, height);
  context.fillStyle = "#081523";
  context.fillRect(0, 0, width, height);
  drawGrid(width, priceTop, priceHeight, padding.left, padding.right);

  candles.forEach((item, index) => {
    const x = padding.left + step * index + step / 2;
    const rising = item.close >= item.open;
    const color = rising ? "#ff6b6b" : "#54d69a";
    context.strokeStyle = color;
    context.fillStyle = color;
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(x, scaleY(item.high));
    context.lineTo(x, scaleY(item.low));
    context.stroke();
    const bodyTop = Math.min(scaleY(item.open), scaleY(item.close));
    const bodyHeight = Math.max(1, Math.abs(scaleY(item.open) - scaleY(item.close)));
    context.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
  });

  if (state.indicators.has("ma")) {
    line(context, movingAverage(candles).map((value, index) => value === null ? null : ({ x: padding.left + step * index + step / 2, y: scaleY(value) })), "#f0bb5c", 1.7);
  }

  const maxVolume = Math.max(...candles.map((item) => item.volume));
  candles.forEach((item, index) => {
    const barHeight = (item.volume / maxVolume) * volumeHeight;
    context.fillStyle = item.close >= item.open ? "#d7525b88" : "#3ebf8588";
    context.fillRect(padding.left + step * index + step * 0.2, volumeTop + volumeHeight - barHeight, Math.max(1, step * 0.6), barHeight);
  });

  context.font = "12px system-ui";
  context.fillStyle = "#94a9bd";
  [max, min, (max + min) / 2].forEach((value) => context.fillText(value.toFixed(2), width - padding.right + 8, scaleY(value) + 4));

  if (state.indicators.has("macd")) {
    const values = macd(candles);
    const absoluteMax = Math.max(0.01, ...values.flatMap((item) => [Math.abs(item.dif), Math.abs(item.dea), Math.abs(item.histogram)]));
    const middle = oscillatorTop + oscillatorHeight / 2;
    context.strokeStyle = "#1c364f";
    context.beginPath();
    context.moveTo(padding.left, middle);
    context.lineTo(width - padding.right, middle);
    context.stroke();
    values.forEach((item, index) => {
      const x = padding.left + step * index + step / 2;
      const barHeight = (item.histogram / absoluteMax) * (oscillatorHeight * 0.43);
      context.fillStyle = item.histogram >= 0 ? "#ff6b6baa" : "#54d69aaa";
      context.fillRect(x - Math.max(1, step * 0.25), middle - Math.max(0, barHeight), Math.max(1, step * 0.5), Math.abs(barHeight));
    });
    line(context, values.map((item, index) => ({ x: padding.left + step * index + step / 2, y: middle - (item.dif / absoluteMax) * (oscillatorHeight * 0.43) })), "#58a6ff");
    line(context, values.map((item, index) => ({ x: padding.left + step * index + step / 2, y: middle - (item.dea / absoluteMax) * (oscillatorHeight * 0.43) })), "#f0bb5c");
    context.fillStyle = "#94a9bd";
    context.fillText("MACD（示例）", padding.left, oscillatorTop + 14);
  } else if (state.indicators.has("rsi")) {
    const values = rsi(candles);
    [30, 70].forEach((value) => {
      const y = oscillatorTop + ((100 - value) / 100) * oscillatorHeight;
      context.setLineDash([4, 4]);
      context.strokeStyle = "#39546d";
      context.beginPath();
      context.moveTo(padding.left, y);
      context.lineTo(width - padding.right, y);
      context.stroke();
      context.setLineDash([]);
    });
    line(context, values.map((value, index) => value === null ? null : ({ x: padding.left + step * index + step / 2, y: oscillatorTop + ((100 - value) / 100) * oscillatorHeight })), "#b98cff", 1.7);
    context.fillStyle = "#94a9bd";
    context.fillText("RSI（示例）", padding.left, oscillatorTop + 14);
  } else {
    context.fillStyle = "#647a91";
    context.fillText("选择 MACD 或 RSI 以显示副图", padding.left, oscillatorTop + oscillatorHeight / 2);
  }

  const activeIndex = state.selectedIndex ?? state.hoveredIndex;
  if (activeIndex !== null && candles[activeIndex]) {
    const active = candles[activeIndex];
    const x = padding.left + step * activeIndex + step / 2;
    const y = scaleY(active.close);
    context.save();
    context.setLineDash([4, 4]);
    context.strokeStyle = "#8ab4f8";
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(x, priceTop);
    context.lineTo(x, priceTop + priceHeight);
    context.moveTo(padding.left, y);
    context.lineTo(width - padding.right, y);
    context.stroke();
    context.setLineDash([]);
    if (state.selectedIndex === activeIndex) {
      context.strokeStyle = "#f0bb5c";
      context.lineWidth = 2;
      context.strokeRect(x - candleWidth / 2 - 3, Math.min(scaleY(active.open), scaleY(active.close)) - 3, candleWidth + 6, Math.max(8, Math.abs(scaleY(active.open) - scaleY(active.close)) + 6));
      context.fillStyle = "#f0bb5c";
      context.fillText("已固定", Math.min(width - padding.right - 38, x + 6), priceTop + 14);
    }
    context.restore();
    updateInspection(candles, activeIndex);
  } else {
    hideInspection();
  }

  rangeLabel.textContent = `${state.range === "3m" ? "近 3 月" : state.range === "6m" ? "近 6 月" : "近 1 年"} · ${candles.length} 根示例日线`;
}

function renderInsights() {
  insightHost.innerHTML = insights.map((item) => `<article class="insight ${item.tone}"><div><span>${item.label}</span><span>固定数据</span></div><p>${item.summary}</p><button class="evidence-link" data-evidence="${item.evidence}" type="button">定位图表 →</button></article>`).join("");
}

function syncPresetButtons(activePreset) {
  document.querySelectorAll("[data-preset]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.preset === activePreset));
  });
}

function applyPreset(name) {
  const preset = presets[name];
  if (!preset) return;
  clearInspection();
  state.range = preset.range;
  state.indicators = new Set(preset.indicators);
  presetCopy.textContent = preset.copy;
  guideCopy.textContent = `${preset.copy} 点击图表中的 K 线可查看对应示例证据。`;
  syncPresetButtons(name);
  syncControls();
  drawChart();
}

function focusEvidence(target) {
  state.evidenceTarget = target;
  if (target === "ma") {
    state.indicators.add("ma");
    state.indicators.delete("rsi");
  }
  if (target === "macd") {
    state.indicators.add("macd");
    state.indicators.delete("rsi");
  }
  syncControls();
  document.querySelector("#chart").scrollIntoView({ behavior: "smooth", block: "center" });
  canvas.classList.remove("evidence-focus");
  requestAnimationFrame(() => canvas.classList.add("evidence-focus"));
  drawChart();
}

function syncControls() {
  document.querySelectorAll("[data-range]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.range === state.range));
  });
  document.querySelectorAll("[data-indicator]").forEach((input) => {
    input.checked = state.indicators.has(input.dataset.indicator);
  });
}

document.querySelectorAll("[data-range]").forEach((button) => {
  button.addEventListener("click", () => {
    clearInspection();
    state.range = button.dataset.range;
    syncControls();
    drawChart();
  });
});

document.querySelectorAll("[data-indicator]").forEach((input) => {
  input.addEventListener("change", () => {
    clearInspection();
    const name = input.dataset.indicator;
    if (name === "macd" || name === "rsi") {
      state.indicators.delete(name === "macd" ? "rsi" : "macd");
    }
    if (input.checked) state.indicators.add(name);
    else state.indicators.delete(name);
    syncControls();
    drawChart();
  });
});

document.querySelectorAll("[data-glossary]").forEach((button) => {
  button.addEventListener("click", () => {
    glossaryCopy.textContent = glossary[button.dataset.glossary];
    document.querySelectorAll("[data-glossary]").forEach((item) => item.classList.toggle("is-active", item === button));
  });
});

document.querySelectorAll("[data-preset]").forEach((button) => {
  button.addEventListener("click", () => applyPreset(button.dataset.preset));
});

renderInsights();
document.querySelectorAll("[data-evidence]").forEach((button) => {
  button.addEventListener("click", () => focusEvidence(button.dataset.evidence));
});

canvas.addEventListener("pointermove", (event) => {
  if (state.selectedIndex !== null) return;
  state.hoveredIndex = indexAtPointer(event);
  drawChart();
});

canvas.addEventListener("pointerdown", (event) => {
  const index = indexAtPointer(event);
  state.selectedIndex = index === state.selectedIndex ? null : index;
  state.hoveredIndex = state.selectedIndex;
  drawChart();
});

canvas.addEventListener("pointerleave", () => {
  if (state.selectedIndex !== null) return;
  state.hoveredIndex = null;
  drawChart();
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    clearInspection();
    drawChart();
  }
});

new ResizeObserver(drawChart).observe(canvas);
syncControls();
syncPresetButtons("trend");
drawChart();
