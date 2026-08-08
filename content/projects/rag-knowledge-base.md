+++
title = '多模态 RAG 知识库问答系统'
date = '2026-08-08T23:00:00+08:00'
draft = false
featured = true
weight = 3
status = '本地运行 + 静态演示'
summary = '面向求职作品集的本地单用户多模态 RAG 知识库：支持文档解析、检索编排、持久任务与可追溯引用。'
description = 'V1 地基脚手架，使用 Next.js、FastAPI 与可插拔 Provider 抽象搭建本地 RAG 知识库问答工作台，并提供固定示例数据的静态演示。'
role = '负责知识库工作流、Provider 抽象、持久任务、检索编排与全栈界面设计'
stack = ['Next.js', 'TypeScript', 'Tailwind', 'FastAPI', 'SQLAlchemy', 'SQLite', 'RAG']
github = 'https://github.com/Chendusikao/rag-knowledge-base'
demo = '/rag-knowledge-base-demo/'
+++

## 项目背景

这是一个面向求职作品集的本地单用户多模态 RAG 知识库问答系统，目标是把文档上传、解析、索引、检索、生成与引用串成一条可观测的工作流。

## 技术方案

前端使用 Next.js、TypeScript 与 Tailwind 构建知识库、文档、聊天、检索实验室、评测和设置界面；后端使用 FastAPI、SQLAlchemy、Alembic 与 SQLite WAL，统一承载业务、任务、聊天、缓存和评测数据。Provider 层抽象 LLM、Embedding、Vision 与 Agent，默认 MockProvider 让流程在无 GPU 和无云端 Key 时也能运行。

## 核心能力

- 支持 PDF、Markdown、Markdown 素材目录和 PNG/JPG 的多模态知识库工作流。
- 检索编排提供 `fast`、`balanced`、`deep` 三档流程，BM25 与 RRF 融合已实装，Dense、Rerank 和 VLM 保留可插拔接口。
- 持久任务系统使用 lease、checkpoint、retry 和重启续跑，API 与独立 Worker 共用 SQLite，不依赖 Redis 或 Docker。
- 规划了可点击引用、增量索引、分层缓存、链路追踪与 RAG 评测面板，方便继续扩展为完整作品集项目。

## 当前进度

当前版本是 V1 地基脚手架：核心数据模型、持久任务、Provider 抽象与检索编排已经成形；Docling/OCR/VLM、本地模型推理和完整评测面板仍按计划逐步填充。完整应用仅在本地运行，个人网站提供固定示例数据的静态交互演示，不连接真实模型或知识库。
