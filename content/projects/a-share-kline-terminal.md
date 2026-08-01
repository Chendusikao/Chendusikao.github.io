+++
title = 'A 股 K 线终端'
date = '2026-07-30T18:00:00+08:00'
draft = false
featured = true
weight = 10
status = '本地运行 + 静态演示'
summary = 'A 股前复权日线技术分析终端：提供 K 线、内置指标、透明技术评分与自选股批量扫描。'
description = '基于 React、FastAPI 与 AKShare 的 A 股前复权日线技术分析终端；完整应用本地运行，并提供不含实时行情的静态演示。'
role = '独立完成前后端、技术指标、数据缓存与本地运行体验实现'
stack = ['React', 'TypeScript', 'FastAPI', 'AKShare', 'ECharts', 'SQLite']
github = 'https://github.com/Chendusikao/a-share-kline-terminal'
demo = '/a-share-kline-demo/'
+++

## 项目背景

这是一个面向 A 股前复权日线技术分析的本机终端项目，帮助用户查看 K 线、内置指标与透明的技术面评分。

## 技术方案

前端使用 React、TypeScript、Vite 与 Apache ECharts 呈现深色终端界面；后端使用 FastAPI、AKShare、pandas 与 SQLite，提供行情读取、指标计算、缓存与重启恢复。内置 MA、MACD、RSI、KDJ、BOLL、ATR 与均量指标，并将趋势、动量、量价、关键位置和风险质量拆分为可见证据。

## 技术栈

- 前端：React、TypeScript、Vite、ECharts
- 后端：Python、FastAPI、Pydantic、Uvicorn
- 行情与分析：AKShare、pandas、MA、MACD、RSI、KDJ、BOLL、ATR
- 数据与质量：SQLite、SQLAlchemy、pytest、Ruff、mypy、Vitest、Playwright

## 当前进度

完整应用当前在 Windows 本机运行，默认仅监听本机地址，并可使用自选股批量扫描与本地缓存。个人网站提供静态演示，用固定示例数据展示 K 线、指标与评分交互；静态演示不连接实时行情或扫描服务，不构成投资建议。
