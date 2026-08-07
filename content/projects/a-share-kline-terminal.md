+++
title = 'A 股 K 线终端'
date = '2026-07-30T18:00:00+08:00'
draft = false
featured = true
weight = 10
status = '本地运行 + 静态演示'
summary = 'A 股前复权日线技术分析终端：提供 K 线、指标分析、透明评分、自选扫描与新手引导。'
description = '基于 React 19、FastAPI 与 AKShare 的 A 股前复权日线技术分析终端；完整应用仅在 Windows 本机运行，并提供不含实时行情的静态演示。'
role = '负责产品界面、指标分析、透明评分、本地缓存与可验证的交互体验设计'
stack = ['React 19', 'TypeScript 7', 'Vite 8', 'FastAPI', 'AKShare', 'ECharts', 'SQLite']
github = 'https://github.com/Chendusikao/a-share-kline-terminal'
demo = '/a-share-kline-demo/'
+++

## 项目背景

这是一个面向 A 股前复权日线技术分析的本机终端项目，帮助用户查看 K 线、内置指标与透明的技术面评分。当前版本继续保持 Windows 本地运行定位，默认网关只监听 `127.0.0.1`。

## 技术方案

前端使用 React 19、TypeScript 7、Vite 8、React Router、TanStack Query 与 Apache ECharts 呈现深色终端界面；后端使用 Python 3.14、FastAPI、Pydantic、Uvicorn、AKShare、pandas 与 SQLite，提供行情读取、指标计算、缓存与重启恢复。内置 MA、MACD、RSI、KDJ、BOLL、ATR 与均量指标，并将趋势、动量、量价、关键位置和风险质量拆分为可见证据。

## 技术栈

- 前端：React 19、TypeScript 7、Vite 8、React Router、TanStack Query、ECharts
- 后端：Python 3.14、FastAPI、Pydantic、Uvicorn
- 行情与分析：AKShare、pandas、MA、MACD、RSI、KDJ、BOLL、ATR
- 数据与质量：SQLite、SQLAlchemy、pytest、Ruff、mypy、Vitest、Testing Library、Playwright

## 最新更新

- 新增新手引导和指标小词典，帮助第一次使用终端的用户理解分析指标。
- 新增趋势、波段、短线参数预设，减少初次配置成本。
- 新增“定位图表”证据导航，可从结构化分析直接定位到对应图表区域。
- 自选股批量扫描支持失败重试、进度轮询与重启恢复；缓存和可见数据状态更清晰。

## 本地运行

完整应用要求 Node.js 24、Python 3.14 和 PowerShell 5.1 或更高版本。首次运行 `scripts/setup.ps1`，之后运行 `scripts/start.ps1`；应用仅监听 `http://127.0.0.1:8000`。需要严格离线运行时，可将 `A_SHARE_ALLOW_AKSHARE_NETWORK` 设为 `0`。

## 当前进度

完整应用当前在 Windows 本机运行，默认仅监听本机地址，并可使用自选股批量扫描与本地缓存。个人网站提供静态演示，用固定示例数据展示 K 线、指标、评分与点击查看交互；静态演示不连接实时行情或扫描服务，不构成投资建议。
