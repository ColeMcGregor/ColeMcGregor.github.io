import { questionnaireConfig } from "./questionnaireConfig.js";

const state = {
  currentIndex: 0,
  answers: {},
  selectedCapabilities: new Set(),
  selectedComponents: new Set(),
  businessId: null,
  viewMode: questionnaireConfig.fallback.viewMode,
};

const els = {
  progress: document.querySelector("#question-progress"),
  host: document.querySelector("#question-host"),
  summary: document.querySelector("#question-summary"),
  back: document.querySelector("#back-question"),
  next: document.querySelector("#next-question"),
};

function getCurrentQuestion() {
  return questionnaireConfig.questions[state.currentIndex];
}

function getSelectedOptionIds(questionId) {
  return state.answers[questionId] ?? [];
}

function setSelectedOptionIds(questionId, optionIds) {
  state.answers[questionId] = optionIds;
  rebuildDerivedState();
}

function rebuildDerivedState() {
  state.selectedCapabilities = new Set();
  state.selectedComponents = new Set();
  state.businessId = null;
  state.viewMode = questionnaireConfig.fallback.viewMode;

  for (const question of questionnaireConfig.questions) {
    const selectedIds = getSelectedOptionIds(question.id);

    for (const option of question.options) {
      if (!selectedIds.includes(option.id)) continue;

      option.addsCapabilities?.forEach((capability) => {
        state.selectedCapabilities.add(capability);
      });

      option.addsComponents?.forEach((component) => {
        state.selectedComponents.add(component);
      });

      if (option.businessId) {
        state.businessId = option.businessId;
      }

      if (option.viewMode) {
        state.viewMode = option.viewMode;
      }
    }
  }
}

function renderQuestion() {
  const question = getCurrentQuestion();
  const selectedIds = getSelectedOptionIds(question.id);

  els.progress.textContent = `Question ${state.currentIndex + 1} of ${questionnaireConfig.questions.length}`;

  els.host.innerHTML = `
    <article class="question-block">
      <h2>${question.prompt}</h2>
      ${question.helper ? `<p class="question-helper">${question.helper}</p>` : ""}

      <div class="bubble-list" data-question-type="${question.type}">
        ${question.options
          .map((option) => {
            const isSelected = selectedIds.includes(option.id);

            return `
              <button
                class="question-bubble ${isSelected ? "is-selected" : ""}"
                type="button"
                data-option-id="${option.id}"
                aria-pressed="${isSelected ? "true" : "false"}"
              >
                ${option.label}
              </button>
            `;
          })
          .join("")}
      </div>
    </article>
  `;

  els.host.querySelectorAll("[data-option-id]").forEach((button) => {
    button.addEventListener("click", () => {
      handleOptionClick(question, button.dataset.optionId);
    });
  });

  els.back.disabled = state.currentIndex === 0;
  els.next.textContent = isLastQuestion() ? "Review" : "Next";

  renderSummary();
}

function handleOptionClick(question, optionId) {
  const selectedIds = getSelectedOptionIds(question.id);

  if (question.type === "single") {
    setSelectedOptionIds(question.id, [optionId]);
    renderQuestion();
    return;
  }

  const nextSelectedIds = selectedIds.includes(optionId)
    ? selectedIds.filter((id) => id !== optionId)
    : [...selectedIds, optionId];

  setSelectedOptionIds(question.id, nextSelectedIds);
  renderQuestion();
}

function isLastQuestion() {
  return state.currentIndex === questionnaireConfig.questions.length - 1;
}

function goNext() {
  if (!isLastQuestion()) {
    state.currentIndex += 1;
    renderQuestion();
    return;
  }

  renderFinalReview();
}

function goBack() {
  if (state.currentIndex === 0) return;

  state.currentIndex -= 1;
  renderQuestion();
}

function buildDemoUrl() {
  const params = new URLSearchParams();

  const businessId = state.businessId ?? questionnaireConfig.fallback.businessId;
  const viewMode = state.viewMode ?? questionnaireConfig.fallback.viewMode;

  const components = Array.from(state.selectedComponents);
  const finalComponents =
    components.length > 0 ? components : questionnaireConfig.fallback.components;

  params.set("business", businessId);
  params.set("view", viewMode);
  params.set("modules", finalComponents.join(","));

  return `${questionnaireConfig.demoTarget}?${params.toString()}`;
}

function renderSummary() {
  const businessId = state.businessId ?? questionnaireConfig.fallback.businessId;
  const components = Array.from(state.selectedComponents);

  els.summary.innerHTML = `
    <h3>Current setup</h3>
    <dl class="summary-list">
      <div>
        <dt>Business data</dt>
        <dd>${businessId}</dd>
      </div>
      <div>
        <dt>View</dt>
        <dd>${state.viewMode}</dd>
      </div>
      <div>
        <dt>Components</dt>
        <dd>${components.length ? components.join(", ") : "Fallback only"}</dd>
      </div>
    </dl>
  `;
}

function renderFinalReview() {
  rebuildDerivedState();

  const demoUrl = buildDemoUrl();

  els.progress.textContent = "Ready";
  els.host.innerHTML = `
    <article class="question-block">
      <h2>Your demo setup is ready.</h2>
      <p class="question-helper">
        This will load the demo using the selected business data, view mode, and components.
      </p>

      <div class="final-url-preview">
        <strong>Generated URL</strong>
        <code>${demoUrl}</code>
      </div>

      <div class="final-actions">
        <a class="primary-demo-button" href="${demoUrl}">
          View Demo
        </a>
      </div>
    </article>
  `;

  els.next.textContent = "View Demo";
  els.next.onclick = () => {
    window.location.href = demoUrl;
  };

  renderSummary();
}

function init() {
  els.back.addEventListener("click", goBack);
  els.next.addEventListener("click", goNext);

  renderQuestion();
}

init();