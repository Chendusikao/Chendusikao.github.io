# A 股 K 线终端静态演示设计

## 目标

在个人 Hugo 网站的 `/a-share-kline-demo/` 路径提供一个可互动的静态演示页，让招聘者快速理解 A 股 K 线终端的图表、指标、技术评分与结构化解读能力；页面不访问真实行情，也不运行 Python 后端。

## 部署边界与事实表述

- 当前完整项目是 Windows 本机应用，包含 React、FastAPI、AKShare 与 SQLite，默认仅监听 `127.0.0.1`。
- 静态演示使用项目内置的固定示例数据，不请求 AKShare、不保存 SQLite 数据、不提供真实股票搜索或批量扫描。
- 页面必须持续显示“示例数据，非实时行情，不构成投资建议”。
- 项目卡片与详情页状态改为 `本地运行 + 静态演示`；GitHub 链接保留，新增演示链接 `/a-share-kline-demo/`。
- 说明可展示的项目能力：前复权日线展示、MA/MACD/RSI 指标、透明技术评分和结构化解读；不展示未经后端支撑的实时行情、扫描结果或买卖建议。

## 演示体验

演示页采用深色专业终端视觉，内容固定为一个明确标注为示例的 A 股标的与虚构日期。页面包括：

1. 顶部标识、返回作品集链接和“静态演示”状态。
2. 示例数据提示与风险免责声明。
3. K 线主图、成交量和一个副图区域；图表由浏览器 Canvas/SVG 和固定数据绘制。
4. 周期切换（近 3 月、近 6 月、近 1 年）和 MA、MACD、RSI 开关。控件只改变本地展示，不发起网络请求。
5. 固定技术评分、分项得分、关键位置证据和结构化解读，解释它们均为示例输出。

演示页在窄屏下单列显示，图表可横向自适应。所有交互控件应使用原生按钮和标签，提供可见焦点状态。

## 文件与数据边界

- `static/a-share-kline-demo/index.html`：独立静态页面骨架与无脚本提示。
- `static/a-share-kline-demo/styles.css`：演示页私有样式，不影响 Hugo 站点样式。
- `static/a-share-kline-demo/app.js`：固定样例 K 线数据、Canvas/SVG 绘制与本地交互逻辑。
- 不新增 npm、Node、后端、数据库、环境变量或 GitHub Actions 依赖。
- 更新 `content/projects/a-share-kline-terminal.md` 的 front matter 和案例文本，使项目卡片准确链接到静态演示。
- 扩展 `tests/portfolio-smoke.ps1`，验证演示入口、项目链接和必要免责声明在 Hugo 构建产物中存在。

## 验证

- 本地 Hugo 构建后，`public/a-share-kline-demo/index.html`、CSS 与 JavaScript 资源均存在。
- 烟雾测试验证项目卡片和详情页包含演示链接，演示页包含“示例数据”“非实时行情”“不构成投资建议”及核心控制项。
- 在桌面与窄视口手动确认：周期和指标按钮可切换展示，页面无外部 API 请求。

## 非目标

- 不托管 FastAPI、AKShare、SQLite 或实时行情服务。
- 不实现真实股票搜索、自选股、批量扫描、设置持久化或买卖建议。
- 不更改 `a-share-kline-terminal` 源仓库的生产代码。
