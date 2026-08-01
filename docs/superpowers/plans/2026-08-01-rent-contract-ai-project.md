# 租房合同 AI 助手项目卡 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将“租房合同 AI 智能分析助手”作为真实、可本地运行的第二个项目加入作品集并部署到 GitHub Pages。

**Architecture:** 新项目只通过 Hugo 内容文件接入；既有首页和项目列表会根据 `featured`、`weight` 与 front matter 自动生成卡片和详情页。PowerShell 烟雾测试先描述新页面必须生成的可见内容，再新增 Markdown 使构建通过。

**Tech Stack:** Hugo、Markdown/TOML front matter、PowerShell、GitHub Pages、GitHub Actions。

## Global Constraints

- 状态固定写为 `可本地运行`，不写“已上线”“生产可用”或等价表述。
- `github` 固定为 `https://github.com/Chendusikao/rent-contract-ai-assistant`；`demo` 保持空字符串。
- 只陈述 README 已确认的能力；不添加指标、用户量、准确率或未经确认的部署信息。
- 不修改现有模板、视觉样式、A 股项目内容或未追踪的 `archetypes/` 目录。

---

### Task 1: 新项目内容与构建回归检查

**Files:**
- Create: `content/projects/rent-contract-ai-assistant.md`
- Modify: `tests/portfolio-smoke.ps1:39-73`
- Test: `tests/portfolio-smoke.ps1`

**Interfaces:**
- Consumes: `layouts/index.html` 中按 `featured = true` 选择卡片的逻辑，以及 `layouts/projects/single.html` 对 `status`、`summary`、`stack`、`github` 和正文的渲染。
- Produces: `/projects/rent-contract-ai-assistant/` 页面；首页和 `/projects/` 中的项目卡片；由烟雾测试覆盖的页面路径与文本。

- [ ] **Step 1: 写入会失败的页面内容检查**

在 `$checks` 中加入以下内容；此时项目文件尚不存在，因此构建后的新页面不存在：

```powershell
'index.html' = @(
  '租房合同 AI 智能分析助手',
  'github.com/Chendusikao/rent-contract-ai-assistant'
)
'projects/index.html' = @(
  '租房合同 AI 智能分析助手',
  '可本地运行'
)
'projects/rent-contract-ai-assistant/index.html' = @(
  '租房合同 AI 智能分析助手',
  '项目背景',
  '技术方案',
  '技术栈',
  '当前进度',
  '可本地运行',
  '暂无线上演示',
  'GitHub 仓库'
)
```

将 `projects/rent-contract-ai-assistant/index.html` 加入 `$metadataPages`，以便验证其 description、canonical、Open Graph 与 favicon。

- [ ] **Step 2: 运行测试并确认失败原因正确**

Run:

```powershell
$env:Path += ';D:\xiazai\huguo'
powershell -ExecutionPolicy Bypass -File tests\portfolio-smoke.ps1
```

Expected: FAIL，报错应为新页面缺失或缺少“租房合同 AI 智能分析助手”；不能是 Hugo 可执行文件、现有页面或测试脚本语法错误。

- [ ] **Step 3: 新增最小、事实准确的项目 Markdown**

创建 `content/projects/rent-contract-ai-assistant.md`：

```toml
+++
title = '租房合同 AI 智能分析助手'
date = '2026-08-01T18:00:00+08:00'
draft = false
featured = true
weight = 5
status = '可本地运行'
summary = '上传租房合同后生成结构化风险报告，并支持基于合同内容与法规知识库继续追问。'
description = '面向首次租房场景的 AI 合同风险分析助手，当前可在本地运行。'
role = '独立完成 AI 工作流、前后端与本地运行体验实现'
stack = ['LangGraph', 'RAG', 'OCR', 'React', 'TypeScript', 'SSE', 'SQLite']
github = 'https://github.com/Chendusikao/rent-contract-ai-assistant'
demo = ''
+++
```

在 front matter 后加入以下 Markdown 结构和事实：

```markdown
## 项目背景

面向首次租房的大学生，帮助用户从租房合同中定位风险条款并形成沟通参考。

## 技术方案

支持上传 PDF、Word 和图片合同，图片可进行中文 OCR 识别。LangGraph 编排合同分析与追问流程，输出风险评分、风险等级、问题条款和谈判话术；追问结合本地 BGE 向量检索、sqlite-vec 与租房相关法规知识库定位合同内容和依据。

## 技术栈

- AI 编排：LangChain、LangGraph、DeepSeek 兼容接口
- 检索与数据：本地 BGE 向量模型、sqlite-vec、SQLite
- 应用能力：React、Vite、Node.js、Express、TypeScript、SSE、tesseract.js、Web Speech API、PWA

## 当前进度

项目当前可在本地运行。启动前需要准备 DeepSeek API Key；首次运行会下载向量模型和 OCR 中文语言包。暂未提供线上演示，分析结果仅供参考，重大租赁决定应咨询专业人士。
```

- [ ] **Step 4: 运行完整烟雾测试并确认通过**

Run:

```powershell
$env:Path += ';D:\xiazai\huguo'
powershell -ExecutionPolicy Bypass -File tests\portfolio-smoke.ps1
```

Expected: exit code 0，Hugo 构建成功，新详情页存在，首页、项目列表与详情页的文本和 SEO 检查均通过。

- [ ] **Step 5: 复核生成页面与变更范围**

Run:

```powershell
$env:Path += ';D:\xiazai\huguo'
hugo --gc --minify
rg -n '租房合同 AI 智能分析助手|可本地运行|暂无线上演示' public\index.html public\projects\index.html public\projects\rent-contract-ai-assistant\index.html
git diff --check
git status --short
```

Expected: 三个 HTML 页面均包含目标项目；无 diff whitespace 错误；待提交文件只有新项目 Markdown 与测试脚本，`archetypes/` 仍保持未追踪且未纳入提交。

- [ ] **Step 6: 提交并推送**

```powershell
git add content/projects/rent-contract-ai-assistant.md tests/portfolio-smoke.ps1
git commit -m "feat: add rent contract AI project"
git push origin main
```

Expected: 新提交推送到 `main`，GitHub Pages 工作流会使用现有部署配置发布新项目。
