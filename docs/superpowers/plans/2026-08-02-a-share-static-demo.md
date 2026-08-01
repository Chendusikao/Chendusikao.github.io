# A 股 K 线终端静态演示 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 Hugo 个人站发布一个可互动但不请求实时行情的 A 股 K 线终端静态演示，并将其链接到项目案例。

**Architecture:** 演示作为 `static/a-share-kline-demo/` 下的独立静态应用，由浏览器原生 HTML、CSS 和 ES 模块 JavaScript 提供。`app.js` 只从本地 `demo-data.js` 导入确定性的示例 K 线数据，在 Canvas 上重绘蜡烛图、均线与副图；Hugo 负责原样发布资源，并由项目 front matter 暴露演示入口。

**Tech Stack:** Hugo、HTML、CSS、Canvas 2D、原生 ES modules、PowerShell。

## Global Constraints

- 每个演示视图必须显示：`示例数据，非实时行情，不构成投资建议`。
- 不使用 `fetch`、AKShare、FastAPI、SQLite、npm、Node、环境变量或 GitHub Actions 新依赖。
- 固定演示数据必须在浏览器本地生成或保存在本地模块中；不应被表述为真实市场数据。
- 项目卡状态使用 `本地运行 + 静态演示`，并保留 GitHub 链接。
- 不能改动未追踪的 `archetypes/` 目录、现有 Hugo 模板或全站样式文件。

---

### Task 1: 静态演示构建产物与页面级回归测试

**Files:**
- Modify: `tests/portfolio-smoke.ps1:39-118`
- Test: `tests/portfolio-smoke.ps1`

**Interfaces:**
- Consumes: Hugo 将 `static/a-share-kline-demo/` 原样发布到 `public/a-share-kline-demo/` 的约定。
- Produces: 对演示 HTML、CSS、JavaScript、项目详情页入口及免责声明的构建产物检查。

- [ ] **Step 1: 写入会失败的静态演示检查**

在现有 Hugo 构建之后新增 `$demoRoot = Join-Path $output 'a-share-kline-demo'`，并加入以下检查；此时目录还不存在，测试应失败：

```powershell
foreach ($relativePath in @('index.html', 'styles.css', 'demo-data.js', 'app.js')) {
  if (-not (Test-Path (Join-Path $demoRoot $relativePath))) {
    throw "Missing A-share static demo asset: $relativePath"
  }
}

$demoHtml = Get-Content -Raw -Encoding utf8 (Join-Path $demoRoot 'index.html')
foreach ($expected in @(
  'A 股 K 线终端 · 静态演示',
  '示例数据，非实时行情，不构成投资建议',
  '近 3 月',
  '近 6 月',
  '近 1 年',
  'MA',
  'MACD',
  'RSI',
  '技术面总分',
  '结构化解读'
)) {
  if ($demoHtml -notmatch [regex]::Escape($expected)) {
    throw "Missing '$expected' in A-share static demo"
  }
}

$demoScript = Get-Content -Raw -Encoding utf8 (Join-Path $demoRoot 'app.js')
if ($demoScript -match '\bfetch\s*\(') {
  throw 'A-share static demo must not request external APIs'
}
```

将 `projects/a-share-kline-terminal/index.html` 的预期状态改为 `本地运行 + 静态演示`，并验证页面包含 `/a-share-kline-demo/`。

- [ ] **Step 2: 运行测试并确认失败原因正确**

Run:

```powershell
$env:Path += ';D:\xiazai\huguo'
powershell -ExecutionPolicy Bypass -File tests\portfolio-smoke.ps1
```

Expected: FAIL，错误应为 `Missing A-share static demo asset: index.html`；不能是现有 Hugo 页面或 PowerShell 语法错误。

### Task 2: 生成固定数据并实现 Canvas 图表交互

**Files:**
- Create: `static/a-share-kline-demo/demo-data.js`
- Create: `static/a-share-kline-demo/app.js`
- Test: `tests/portfolio-smoke.ps1`

**Interfaces:**
- Consumes: `demo-data.js` 导出的 `createDemoSeries(total)`，返回 `{ date, open, high, low, close, volume }[]`；`index.html` 中的 `#chart` Canvas、`[data-range]` 按钮、`[data-indicator]` 复选框及 `#score-total`、`#insights` 容器。
- Produces: 不依赖网络的固定蜡烛序列；根据周期和指标选择重绘图表的 `render()`；局部 UI 状态 `{ range: '3m' | '6m' | '1y', indicators: Set<'ma' | 'macd' | 'rsi'> }`。

- [ ] **Step 1: 创建最小固定数据模块**

创建 `demo-data.js`，导出确定性数据函数，不包含 `fetch` 或日期 API。以固定种子和下列价格轨迹生成 252 条序列：

```js
export function createDemoSeries(total = 252) {
  return Array.from({ length: total }, (_, index) => {
    const wave = Math.sin(index / 8) * 2.4 + Math.cos(index / 17) * 1.6;
    const trend = index * 0.055;
    const close = Number((24 + trend + wave).toFixed(2));
    const open = Number((close - Math.sin(index * 1.7) * 0.9).toFixed(2));
    const high = Number((Math.max(open, close) + 0.45 + (index % 4) * 0.12).toFixed(2));
    const low = Number((Math.min(open, close) - 0.4 - (index % 3) * 0.11).toFixed(2));
    return { date: `示例日 ${String(index + 1).padStart(3, '0')}`, open, high, low, close, volume: 1200000 + (index % 11) * 95000 };
  });
}
```

- [ ] **Step 2: 创建最小交互脚本**

创建 `app.js`：从 `./demo-data.js` 导入 `createDemoSeries`；默认范围为 `1y`、默认开启 `ma` 和 `macd`。实现以下纯函数，并在 `render()` 中调用：

```js
function visibleSeries(all, range) {
  return all.slice(range === '3m' ? -63 : range === '6m' ? -126 : -252);
}

function movingAverage(items, period = 20) {
  return items.map((item, index) => {
    if (index < period - 1) return null;
    const window = items.slice(index - period + 1, index + 1);
    return window.reduce((sum, candle) => sum + candle.close, 0) / period;
  });
}
```

`render()` 必须清空 Canvas、按红涨绿跌绘制蜡烛图、按启用状态绘制 MA 线以及 MACD 或 RSI 副图，并更新被选按钮的 `aria-pressed`。所有 `[data-range]`、`[data-indicator]` 控件监听 `click` 或 `change` 后仅更新本地 `state` 并调用 `render()`。

- [ ] **Step 3: 手动验证互动行为**

Run:

```powershell
$env:Path += ';D:\xiazai\huguo'
hugo server --disableFastRender
```

Open: `http://localhost:1313/a-share-kline-demo/`

Expected: 默认显示 K 线、MA 与 MACD；切换“近 3 月”缩短 K 线数量；关闭 MA 隐藏均线；选中 RSI 后副图变为 RSI；浏览器开发者工具 Network 中不出现 Fetch/XHR 请求。

### Task 3: 演示页面结构、样式和项目入口

**Files:**
- Create: `static/a-share-kline-demo/index.html`
- Create: `static/a-share-kline-demo/styles.css`
- Modify: `content/projects/a-share-kline-terminal.md:1-29`
- Test: `tests/portfolio-smoke.ps1`

**Interfaces:**
- Consumes: Task 2 的 `#chart`、`[data-range]`、`[data-indicator]` 选择器与 `app.js` 模块入口；既有 `project-card.html` 对 `status`、`summary`、`stack`、`github`、`demo` 的渲染。
- Produces: 可访问的静态终端页面，以及带准确状态、技术标签、GitHub 和静态演示链接的 A 股项目卡片与详情页。

- [ ] **Step 1: 创建演示 HTML 骨架**

在 `index.html` 中创建以下语义结构并加载 `styles.css` 与 `app.js`：

```html
<main class="terminal-shell">
  <a class="back-link" href="/projects/a-share-kline-terminal/">← 返回项目案例</a>
  <header class="terminal-header">
    <p class="eyebrow">STATIC PRODUCT DEMO</p>
    <h1>A 股 K 线终端 · 静态演示</h1>
    <p class="notice">示例数据，非实时行情，不构成投资建议</p>
  </header>
  <section class="controls" aria-label="图表控制">
    <div role="group" aria-label="查看区间">
      <button data-range="3m" type="button">近 3 月</button>
      <button data-range="6m" type="button">近 6 月</button>
      <button data-range="1y" type="button" aria-pressed="true">近 1 年</button>
    </div>
    <label><input data-indicator="ma" type="checkbox" checked> MA</label>
    <label><input data-indicator="macd" type="checkbox" checked> MACD</label>
    <label><input data-indicator="rsi" type="checkbox"> RSI</label>
  </section>
  <section class="demo-grid">
    <section class="chart-card"><canvas id="chart" aria-label="示例 K 线图"></canvas></section>
    <aside class="analysis-rail">
      <p>技术面总分</p><strong id="score-total">72</strong><span>/ 100 · 偏强（示例）</span>
      <h2>结构化解读</h2><div id="insights"></div>
    </aside>
  </section>
</main>
```

在 `#insights` 中由 `app.js` 插入三条固定示例说明；文本需包含“趋势”“动量”“风险质量”，并在每条旁边标注“示例”。

- [ ] **Step 2: 编写演示私有样式**

在 `styles.css` 定义 `.terminal-shell` 的深海色背景、浅色正文、红涨绿跌蜡烛色、可见焦点环和最大内容宽度 `1200px`。`.demo-grid` 在宽度大于 `900px` 时使用 `minmax(0, 2fr) minmax(260px, 1fr)`，小于 `900px` 时改为单列；`#chart` 最小高度 `480px`，窄屏最小高度 `360px`。为 `button:focus-visible` 与 `input:focus-visible` 添加至少 `2px solid #7ee787` 的轮廓。

- [ ] **Step 3: 更新项目案例内容**

把 `a-share-kline-terminal.md` 的 front matter 更新为：

```toml
status = '本地运行 + 静态演示'
summary = 'A 股前复权日线技术分析终端：提供 K 线、内置指标、透明技术评分与自选股批量扫描。'
description = '基于 React、FastAPI 与 AKShare 的 A 股前复权日线技术分析终端；完整应用本地运行，并提供不含实时行情的静态演示。'
role = '独立完成前后端、技术指标、数据缓存与本地运行体验实现'
stack = ['React', 'TypeScript', 'FastAPI', 'AKShare', 'ECharts', 'SQLite']
demo = '/a-share-kline-demo/'
```

将正文替换为“项目背景”“技术方案”“技术栈”“当前进度”四节，说明完整应用仍只在 Windows 本机运行；静态演示使用示例数据，仅用于展示界面与分析流程，不含实时行情与买卖建议。

- [ ] **Step 4: 运行完整构建与烟雾测试**

Run:

```powershell
$env:Path += ';D:\xiazai\huguo'
powershell -ExecutionPolicy Bypass -File tests\portfolio-smoke.ps1
hugo --gc --minify
```

Expected: 两个命令均以 exit code 0 完成；`public/a-share-kline-demo/` 包含 `index.html`、`styles.css`、`demo-data.js` 和 `app.js`；项目详情页含静态演示链接。

- [ ] **Step 5: 提交**

```powershell
git add static/a-share-kline-demo/index.html static/a-share-kline-demo/styles.css static/a-share-kline-demo/demo-data.js static/a-share-kline-demo/app.js content/projects/a-share-kline-terminal.md tests/portfolio-smoke.ps1
git commit -m "feat: add A-share static demo"
```
