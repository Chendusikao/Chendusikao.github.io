const modeButtons = document.querySelectorAll("[data-mode]");
const queryButtons = document.querySelectorAll("[data-query]");
const kbButtons = document.querySelectorAll("[data-kb]");
const citationHost = document.querySelector("#citations");
const queryInput = document.querySelector("#query-input");
const answerBody = document.querySelector("#answer-body");
const answerTitle = document.querySelector("#answer-title");
const answerTime = document.querySelector("#answer-time");
const modeLabel = document.querySelector("#mode-label");
const activeKb = document.querySelector("#active-kb");
const uploadHint = document.querySelector("#upload-hint");

const state = {
  mode: "balanced",
  knowledgeBase: "产品文档",
  selectedCitation: null,
};

const scenarios = {
  "这个项目的检索流程如何保证可追溯？": {
    answer: "系统把一次提问拆成 Query rewrite、Retrieve、Rerank 和 Answer 四个阶段，并为回答保留来源片段。这样既能展示检索路径，也方便用户回到原文核对依据。",
    bullets: ["持久化 JobRun 记录任务状态、租约和检查点", "BM25 + RRF 组合检索，引用卡片保留来源位置", "示例回答使用产品文档知识库，不代表真实模型输出"],
    citations: [
      { title: "检索编排说明", location: "docs/architecture.md · § Retrieval", text: "fast / balanced / deep 三档流程共享统一的证据编排。" },
      { title: "RRF 融合流程", location: "backend/services/retrieval/manager.py · L42", text: "多个召回结果经过融合后，再交给后续排序步骤。" },
      { title: "引用契约", location: "docs/data-contracts.md · § Citation", text: "引用对象保留文档、章节和片段定位信息。" },
    ],
  },
  "系统为什么不依赖 Redis？": {
    answer: "V1 使用 SQLite WAL 统一承载任务、聊天、缓存与评测数据。持久化任务通过 lease、checkpoint、retry 和重启续跑实现恢复能力，因此基础流程不依赖 Redis 或 Docker。",
    bullets: ["API 进程与独立 Worker 共享 SQLite", "失败任务可重试，重启后从检查点继续", "这是本地单用户作品集版本的取舍"],
    citations: [
      { title: "持久任务系统", location: "backend/services/task_system.py · § JobRun", text: "任务租约、检查点和重试状态落在持久表中。" },
      { title: "本地运行边界", location: "README.md · § V1 范围", text: "V1 面向本地单用户，不引入团队权限和云部署。" },
    ],
  },
  "V1 当前哪些能力还在留桩？": {
    answer: "当前 V1 已完成数据模型、持久任务、Provider 抽象和检索编排地基；Docling/OCR/VLM 解析、本地模型推理和完整评测面板仍是后续填充项。",
    bullets: ["MockProvider 默认可跑通无模型流程", "Dense、Rerank、Vision Provider 保留可插拔接口", "后续按 8–10 周计划逐步补齐真实能力"],
    citations: [
      { title: "V1 地基范围", location: "README.md · § V1 地基脚手架", text: "核心数据模型与编排已成形，解析和评测能力留待后续。" },
      { title: "Provider 接口", location: "backend/services/providers/base.py · § Provider", text: "LLM、Embedding、Vision 和 Agent 通过接口隔离。" },
    ],
  },
};

const fallbackScenario = {
  answer: "这是一个固定示例回答：系统会根据当前知识库和检索模式编排证据，再生成带引用的结果。完整应用在本地运行，本页不调用真实模型。",
  bullets: ["当前知识库：产品文档", "当前模式：Balanced", "可以继续选择下方示例问题"],
  citations: [{ title: "示例知识库", location: "README.md · § Overview", text: "本条引用仅用于展示可追溯回答的界面形态。" }],
};

function setActive(collection, activeItem, attribute, value) {
  collection.forEach((item) => {
    const isActive = item === activeItem;
    item.classList.toggle("is-active", isActive);
    item.setAttribute(attribute, String(isActive));
    if (isActive && value) value.textContent = item.dataset[attribute === "aria-selected" ? "kb" : "mode"] || value.textContent;
  });
}

function renderCitations(items) {
  citationHost.innerHTML = items.map((item, index) => `<button class="citation ${state.selectedCitation === index ? "is-selected" : ""}" data-citation="${index}" type="button"><header><strong>${item.title}</strong><span>[${index + 1}]</span></header><p>${item.location}</p><p>${item.text}</p></button>`).join("");
  citationHost.querySelectorAll("[data-citation]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedCitation = Number(button.dataset.citation);
      renderCitations(items);
    });
  });
  document.querySelector("#citation-count").textContent = String(items.length);
}

function runQuery(query) {
  const result = scenarios[query] || fallbackScenario;
  state.selectedCitation = null;
  answerTitle.textContent = "检索完成 · 示例回答";
  answerTime.textContent = `${state.mode} · MockProvider`;
  answerBody.innerHTML = `<p>${result.answer}</p><ul>${result.bullets.map((bullet) => `<li>${bullet}</li>`).join("")}</ul>`;
  renderCitations(result.citations);
}

function applyMode(mode) {
  state.mode = mode;
  modeButtons.forEach((button) => {
    const isActive = button.dataset.mode === mode;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
  modeLabel.textContent = mode.toUpperCase();
  runQuery(queryInput.value.trim());
}

modeButtons.forEach((button) => {
  button.addEventListener("click", () => applyMode(button.dataset.mode));
});

queryButtons.forEach((button) => {
  button.addEventListener("click", () => {
    queryInput.value = button.dataset.query;
    runQuery(button.dataset.query);
  });
});

kbButtons.forEach((button) => {
  button.addEventListener("click", () => {
    state.knowledgeBase = button.dataset.kb;
    kbButtons.forEach((item) => {
      const isActive = item === button;
      item.classList.toggle("is-active", isActive);
      item.setAttribute("aria-selected", String(isActive));
    });
    activeKb.textContent = state.knowledgeBase;
    answerTitle.textContent = "知识库已切换 · 等待提问";
  });
});

document.querySelector("#ask-button").addEventListener("click", () => runQuery(queryInput.value.trim()));
document.querySelector("[data-upload]").addEventListener("click", () => {
  uploadHint.textContent = "示例文档已加入队列 · 解析状态：MockProvider 演示";
  uploadHint.style.color = "var(--mint)";
});

runQuery(queryInput.value.trim());
