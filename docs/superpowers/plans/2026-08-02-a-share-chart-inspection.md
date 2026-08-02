# A 股 K 线查看交互 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让 A 股静态演示中的 K 线支持悬停查看和点击固定选中。

**Architecture:** Canvas 绘制时保留坐标元数据，指针位置映射到最近的固定示例 K 线。HTML 信息浮层承载可访问的明细文本，Canvas 负责十字线和选中高亮；它们由同一份交互状态驱动。

**Tech Stack:** Hugo 静态文件、原生 ES 模块、Canvas 2D、PowerShell 冒烟测试。

## Global Constraints

- 继续使用 `demo-data.js` 的固定示例数据；不得添加 `fetch()`、网络请求、后端或第三方图表库。
- 页面保留“示例数据，非实时行情，不构成投资建议”的免责声明。
- 周期或指标切换必须清除固定选中状态；Esc 必须取消固定选中。

---

### Task 1: 为 K 线查看交互补充回归测试

**Files:**
- Modify: `tests/portfolio-smoke.ps1`

**Interfaces:**
- Consumes: `static/a-share-kline-demo/app.js`。
- Produces: `pointermove`、`pointerdown`、`Escape`、`selectedIndex` 与提示字段的检查。

- [ ] **Step 1: 写出会失败的检查**

```powershell
$requiredInteractionTokens = @('pointermove', 'pointerdown', 'Escape', 'selectedIndex', 'tooltip-date', 'tooltip-open', 'tooltip-close')
foreach ($token in $requiredInteractionTokens) { if ($appScript -notmatch [regex]::Escape($token)) { throw "Missing K-line inspection behavior: $token" } }
```

- [ ] **Step 2: 运行检查，确认因功能缺失而失败**

Run: `powershell -ExecutionPolicy Bypass -File tests\portfolio-smoke.ps1`

Expected: FAIL，错误包含 `Missing K-line inspection behavior`。

- [ ] **Step 3: 提交测试变更**

```powershell
git add tests/portfolio-smoke.ps1; git commit -m "test: cover K-line inspection interaction"
```

### Task 2: 实现悬停、固定选中与可访问明细

**Files:**
- Modify: `static/a-share-kline-demo/index.html`
- Modify: `static/a-share-kline-demo/styles.css`
- Modify: `static/a-share-kline-demo/app.js`
- Test: `tests/portfolio-smoke.ps1`

**Interfaces:**
- Consumes: `createDemoSeries()` 返回的 `date`、`open`、`high`、`low`、`close`、`volume`。
- Produces: `state.hoveredIndex`、`state.selectedIndex`、`indexAtPointer(event)`、`updateInspection(index)` 与七个信息节点。

- [ ] **Step 1: 增加默认隐藏的信息浮层**

在 `#chart` 后添加：

```html
<section class="chart-tooltip" id="chart-tooltip" aria-live="polite" hidden><p id="tooltip-date"></p><dl><div><dt>开</dt><dd id="tooltip-open"></dd></div><div><dt>高</dt><dd id="tooltip-high"></dd></div><div><dt>低</dt><dd id="tooltip-low"></dd></div><div><dt>收</dt><dd id="tooltip-close"></dd></div><div><dt>涨跌</dt><dd id="tooltip-change"></dd></div><div><dt>成交量</dt><dd id="tooltip-volume"></dd></div></dl><small id="tooltip-state"></small></section>
```

- [ ] **Step 2: 写最小 Canvas 交互实现**

`drawChart()` 保存渲染用的 `candles`、`padding`、`step`、`priceTop`、`priceHeight` 与 `plotWidth`。`indexAtPointer(event)` 以 Canvas CSS 像素 x 坐标返回最近索引或 `null`；`updateInspection(index)` 更新浮层，涨跌幅以相对前一根收盘价计算，第一根显示 `--`。

```js
canvas.addEventListener("pointermove", (event) => { if (state.selectedIndex !== null) return; state.hoveredIndex = indexAtPointer(event); drawChart(); });
canvas.addEventListener("pointerdown", (event) => { const index = indexAtPointer(event); state.selectedIndex = index === state.selectedIndex ? null : index; state.hoveredIndex = state.selectedIndex; drawChart(); });
window.addEventListener("keydown", (event) => { if (event.key === "Escape") { state.selectedIndex = null; state.hoveredIndex = null; drawChart(); } });
```

在价格图区域内绘制十字线，并对 `selectedIndex` 绘制带文字的高亮边框；`pointerleave` 在未选中时清空悬停索引。

- [ ] **Step 3: 增加界面样式**

`.chart-card` 使用 `position: relative`；`.chart-tooltip` 使用深色高对比背景、右上角定位和等宽数值；`canvas` 使用 `cursor: crosshair`。窄屏时将浮层调整为底部横向卡片，避免遮挡主价格区。

- [ ] **Step 4: 在控制切换时清除选中状态**

```js
state.selectedIndex = null; state.hoveredIndex = null;
```

- [ ] **Step 5: 运行冒烟测试，确认变绿**

Run: `powershell -ExecutionPolicy Bypass -File tests\portfolio-smoke.ps1`

Expected: PASS，且不抛出 `Missing K-line inspection behavior`。

- [ ] **Step 6: 提交实现**

```powershell
git add static/a-share-kline-demo/index.html static/a-share-kline-demo/styles.css static/a-share-kline-demo/app.js tests/portfolio-smoke.ps1; git commit -m "feat: add K-line inspection interaction"
```

### Task 3: 构建与浏览器验收

**Files:**
- Verify: `static/a-share-kline-demo/index.html`
- Verify: `static/a-share-kline-demo/app.js`

**Interfaces:**
- Consumes: 完成后的静态演示和 `D:\xiazai\huguo\hugo.exe`。
- Produces: 本地构建、交互和窄屏布局的验收证据。

- [ ] **Step 1: 执行完整本地验证**

```powershell
$env:Path += ';D:\xiazai\huguo'; powershell -ExecutionPolicy Bypass -File tests\portfolio-smoke.ps1; hugo --gc --minify; git diff --check
```

Expected: 所有命令退出码均为 0。

- [ ] **Step 2: 用 Hugo 本地服务验收交互**

```powershell
hugo server --disableFastRender
```

打开 `http://localhost:1313/a-share-kline-demo/`，检查：悬停显示正确明细；单击后移动鼠标信息保持不变；Esc 取消固定；切换近 3 月后固定状态清除；窄屏不溢出；控制台无错误。

- [ ] **Step 3: 提交验收后的最终状态**

若 Task 2 后仅产生预期实现提交，保持工作树干净；不要提交 `public/`、`resources/`、`.hugo_build.lock` 或用户现有的 `archetypes/`。
