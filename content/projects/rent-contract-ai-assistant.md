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

## 项目背景

面向首次租房的大学生，帮助用户从租房合同中定位风险条款并形成沟通参考。

## 技术方案

支持上传 PDF、Word 和图片合同，图片可进行中文 OCR 识别。LangGraph 编排合同分析与追问流程，输出风险评分、风险等级、问题条款和谈判话术；追问结合本地 BGE 向量检索、sqlite-vec 与租房相关法规知识库定位合同内容和依据。

## 技术栈

- AI 编排：LangChain、LangGraph、DeepSeek 兼容接口
- 检索与数据：本地 BGE 向量模型、sqlite-vec、SQLite
- 应用能力：React、Vite、Node.js、Express、TypeScript、SSE、tesseract.js、Web Speech API、PWA

## 当前进度

项目当前可在本地运行。启动前需要准备 DeepSeek API Key；首次运行会下载向量模型和 OCR 中文语言包。目前暂无线上演示，分析结果仅供参考，重大租赁决定应咨询专业人士。
