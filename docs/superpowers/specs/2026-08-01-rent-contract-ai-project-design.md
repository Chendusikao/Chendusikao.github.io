# 租房合同 AI 助手项目卡设计

## 目标

将 `Chendusikao/rent-contract-ai-assistant` 作为第二个作品集项目加入 Hugo 站点，面向 AI 应用开发岗位的招聘者清晰展示该项目的真实能力，同时不暗示存在线上演示或常驻服务器。

## 项目定位与事实边界

- 项目名称：租房合同 AI 智能分析助手。
- 面向首次租房的大学生；用户上传 PDF、Word 或图片合同后，获得风险评分、问题条款与谈判话术，并可继续追问。
- 当前状态：`可本地运行`。用户需要自行配置 DeepSeek API Key；没有线上演示链接。
- 可陈述的技术能力：LangChain、LangGraph、DeepSeek 兼容接口、本地 BGE 向量检索、sqlite-vec、中文 OCR、Web Speech API、Node.js、Express、TypeScript、React、Vite、SSE、PWA 与 SQLite。
- 不陈述未验证的生产部署、用户量、效果指标、法律结论准确率或永久在线能力。

## 内容与展示

新增 `content/projects/rent-contract-ai-assistant.md`，使用既有项目 front matter：

- `featured = true`，使首页自动展示该项目卡片；权重在现有 A 股项目之前。
- `status = '可本地运行'`。
- `github` 指向用户提供的仓库；`demo` 保持为空。
- 摘要突出“合同上传、结构化风险报告、基于合同与法规知识库的追问”。
- 技术标签控制在项目卡片可读范围内，优先展示 LangGraph、RAG、OCR、React、TypeScript、SSE 与 SQLite。

详情页正文按现有案例模板组织：项目背景、技术方案、技术栈、当前进度。当前进度明确本地启动方式和 DeepSeek API Key 前置条件，并明确“暂无线上演示”。不新增截图、视频、服务器或外部服务。

## 验证

- 扩展既有 `tests/portfolio-smoke.ps1`：验证首页、项目列表和新项目详情页包含项目名称、GitHub 链接、真实状态与关键案例标题。
- 将新详情页纳入已有 SEO 元数据检查。
- 使用本地 Hugo 构建运行烟雾测试；确认新增内容能够生成相应页面。

## 非目标

- 本次不部署租房合同助手。
- 不配置 Cloudflare Tunnel、Render、Oracle Cloud 或任何付费/免费云服务。
- 不修改项目站点的页面模板、视觉样式或既有项目内容。
