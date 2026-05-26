/**
 * Survey Builder Module
 */
const SurveyBuilder = (() => {
  const QUESTION_TYPES = {
    text: { label: 'Short Text', icon: '✏️', input: 'text' },
    textarea: { label: 'Long Text', icon: '📝', input: 'textarea' },
    radio: { label: 'Multiple Choice', icon: '◉', input: 'radio', hasOptions: true },
    checkbox: { label: 'Checkboxes', icon: '☑', input: 'checkbox', hasOptions: true },
    dropdown: { label: 'Dropdown', icon: '▼', input: 'select', hasOptions: true },
    rating: { label: 'Rating Scale', icon: '★', input: 'rating' },
    date: { label: 'Date Picker', icon: '📅', input: 'date' },
    file: { label: 'File Upload', icon: '📎', input: 'file' },
    email: { label: 'Email', icon: '✉', input: 'email' },
    number: { label: 'Number', icon: '#', input: 'number' },
    password: { label: 'Password', icon: '🔒', input: 'password' }
  };

  let survey = {
    id: null,
    title: 'Untitled Survey',
    description: '',
    pages: [{ id: 'page_1', title: 'Page 1', questions: [] }],
    currentPage: 0,
    settings: { multiStep: true, timer: false, autosave: true }
  };

  let selectedQuestionId = null;

  function init(surveyId = null) {
    if (surveyId) {
      const saved = SurveyApp.getSurvey(surveyId);
      if (saved) survey = { ...survey, ...saved };
    } else {
      survey.id = SurveyApp.generateId();
    }

    bindEvents();
    render();
    DragDrop.init(document.querySelector('.builder-layout'));
  }

  function bindEvents() {
    const titleInput = document.getElementById('survey-title');
    const descInput = document.getElementById('survey-description');
    if (titleInput) {
      titleInput.value = survey.title;
      titleInput.addEventListener('input', () => { survey.title = titleInput.value; autoSave(); });
    }
    if (descInput) {
      descInput.value = survey.description;
      descInput.addEventListener('input', () => { survey.description = descInput.value; autoSave(); });
    }

    document.getElementById('btn-save-survey')?.addEventListener('click', saveSurvey);
    document.getElementById('btn-preview')?.addEventListener('click', () => {
      localStorage.setItem('sf_preview_survey', JSON.stringify(survey));
      window.open('preview.html', '_blank');
    });
    document.getElementById('btn-add-page')?.addEventListener('click', addPage);
    document.getElementById('btn-ai-suggest')?.addEventListener('click', showAISuggestions);

    document.querySelectorAll('.question-type-btn').forEach(btn => {
      btn.addEventListener('click', () => addQuestion(btn.dataset.type));
    });

    document.querySelectorAll('.ai-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        addQuestion('textarea');
        const page = getCurrentPage();
        const q = page.questions[page.questions.length - 1];
        if (q) q.label = chip.textContent;
        renderQuestions();
        autoSave();
      });
    });
  }

  function getCurrentPage() {
    return survey.pages[survey.currentPage];
  }

  function addQuestion(type) {
    const q = {
      id: 'q_' + Date.now(),
      type,
      label: QUESTION_TYPES[type]?.label || 'Question',
      required: false,
      options: ['Option 1', 'Option 2'],
      placeholder: '',
      logic: []
    };
    getCurrentPage().questions.push(q);
    renderQuestions();
    selectQuestion(q.id);
    autoSave();
    SurveyApp.showToast('Question added', 'success');
  }

  function duplicateQuestion(id) {
    const page = getCurrentPage();
    const idx = page.questions.findIndex(q => q.id === id);
    if (idx < 0) return;
    const copy = JSON.parse(JSON.stringify(page.questions[idx]));
    copy.id = 'q_' + Date.now();
    page.questions.splice(idx + 1, 0, copy);
    renderQuestions();
    autoSave();
  }

  function deleteQuestion(id) {
    const page = getCurrentPage();
    page.questions = page.questions.filter(q => q.id !== id);
    if (selectedQuestionId === id) selectedQuestionId = null;
    renderQuestions();
    renderProperties();
    autoSave();
  }

  function reorderQuestion(dragId, targetId) {
    const page = getCurrentPage();
    const fromIdx = page.questions.findIndex(q => q.id === dragId);
    if (fromIdx < 0) return;
    const [item] = page.questions.splice(fromIdx, 1);
    const toIdx = targetId ? page.questions.findIndex(q => q.id === targetId) : page.questions.length;
    page.questions.splice(toIdx >= 0 ? toIdx : page.questions.length, 0, item);
    renderQuestions();
    autoSave();
  }

  function selectQuestion(id) {
    selectedQuestionId = id;
    document.querySelectorAll('.question-block').forEach(b => {
      b.classList.toggle('selected', b.dataset.questionId === id);
    });
    renderProperties();
  }

  function addPage() {
    survey.pages.push({
      id: 'page_' + Date.now(),
      title: `Page ${survey.pages.length + 1}`,
      questions: []
    });
    survey.currentPage = survey.pages.length - 1;
    render();
    autoSave();
  }

  function render() {
    renderPageTabs();
    renderQuestions();
    renderProperties();
  }

  function renderPageTabs() {
    const container = document.getElementById('page-tabs');
    if (!container) return;
    container.innerHTML = survey.pages.map((page, i) => `
      <button class="page-tab ${i === survey.currentPage ? 'active' : ''}" data-page="${i}">
        ${page.title}
      </button>
    `).join('');
    container.querySelectorAll('.page-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        survey.currentPage = parseInt(tab.dataset.page, 10);
        render();
      });
    });
  }

  function renderQuestions() {
    const container = document.getElementById('questions-container');
    if (!container) return;
    const questions = getCurrentPage().questions;

    if (!questions.length) {
      container.innerHTML = `<div class="drop-zone" id="drop-zone-empty">
        <p>Drag question types here or click to add</p>
      </div>`;
      return;
    }

    container.innerHTML = questions.map(q => renderQuestionBlock(q)).join('');
    container.querySelectorAll('.question-block').forEach(block => {
      DragDrop.enableQuestionReorder(block);
      block.addEventListener('click', () => selectQuestion(block.dataset.questionId));
      block.querySelector('.btn-duplicate')?.addEventListener('click', (e) => {
        e.stopPropagation();
        duplicateQuestion(block.dataset.questionId);
      });
      block.querySelector('.btn-delete')?.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteQuestion(block.dataset.questionId);
      });
      block.querySelector('.required-toggle')?.addEventListener('click', (e) => {
        e.stopPropagation();
        const question = questions.find(q => q.id === block.dataset.questionId);
        if (question) {
          question.required = !question.required;
          e.target.classList.toggle('active', question.required);
          autoSave();
        }
      });
      const labelInput = block.querySelector('.question-label-input');
      labelInput?.addEventListener('input', () => {
        const question = questions.find(q => q.id === block.dataset.questionId);
        if (question) { question.label = labelInput.value; autoSave(); }
      });
    });
  }

  function renderQuestionBlock(q) {
    const type = QUESTION_TYPES[q.type] || QUESTION_TYPES.text;
    let preview = '';

    if (type.hasOptions) {
      preview = `<div class="question-options">${q.options.map((opt, i) => `
        <div class="option-row">
          <input type="${q.type === 'checkbox' ? 'checkbox' : 'radio'}" disabled>
          <span>${opt}</span>
        </div>
      `).join('')}</div>`;
    } else if (q.type === 'rating') {
      preview = `<div class="rating-preview">${[1,2,3,4,5].map(n => `<span class="${n<=3?'active':''}">★</span>`).join('')}</div>`;
    } else if (q.type === 'file') {
      preview = `<div class="file-upload-preview">📎 Drop files here or click to upload</div>`;
    } else {
      preview = `<input type="${type.input}" class="form-input" placeholder="${q.placeholder || 'Your answer'}" disabled>`;
    }

    if (q.type === 'password') {
      preview += `<div class="password-strength"><div class="password-strength-bar"></div></div>`;
    }

    return `
      <div class="question-block ${selectedQuestionId === q.id ? 'selected' : ''}" data-question-id="${q.id}" draggable="true">
        <span class="question-drag-handle">⠿</span>
        <div class="question-actions">
          <button class="question-action-btn btn-duplicate" title="Duplicate">⧉</button>
          <button class="question-action-btn delete btn-delete" title="Delete">🗑</button>
        </div>
        <input type="text" class="question-label-input" value="${escapeHtml(q.label)}" placeholder="Question">
        ${preview}
        <div class="question-settings">
          <div class="setting-item">
            <span>Required</span>
            <div class="toggle required-toggle ${q.required ? 'active' : ''}"></div>
          </div>
          <span class="badge">${type.label}</span>
        </div>
      </div>
    `;
  }

  function renderProperties() {
    const panel = document.getElementById('properties-panel');
    if (!panel) return;
    const q = getCurrentPage().questions.find(q => q.id === selectedQuestionId);

    if (!q) {
      panel.innerHTML = `<p class="text-muted text-sm">Select a question to edit properties</p>`;
      return;
    }

    const type = QUESTION_TYPES[q.type];
    let optionsHtml = '';
    if (type?.hasOptions) {
      optionsHtml = `
        <div class="form-group mt-2">
          <label class="form-label">Options</label>
          ${q.options.map((opt, i) => `
            <div class="option-row">
              <input type="text" class="form-input option-input" data-index="${i}" value="${escapeHtml(opt)}">
              <button class="btn btn-ghost btn-sm remove-option" data-index="${i}">✕</button>
            </div>
          `).join('')}
          <button class="option-add-btn" id="add-option">+ Add option</button>
        </div>
      `;
    }

    panel.innerHTML = `
      <h3>Question Properties</h3>
      <div class="form-group mt-2">
        <label class="form-label">Placeholder</label>
        <input type="text" class="form-input" id="prop-placeholder" value="${escapeHtml(q.placeholder || '')}">
      </div>
      ${optionsHtml}
      <div class="conditional-logic-panel mt-2">
        <h4>⚡ Conditional Logic</h4>
        <div class="logic-rule">
          <select><option>If answer is</option></select>
          <select><option>equals</option><option>contains</option></select>
          <input type="text" class="form-input" placeholder="Value" style="width:80px">
          <select><option>Show question</option><option>Hide question</option><option>Skip to page</option></select>
        </div>
        <button class="btn btn-ghost btn-sm mt-1">+ Add rule</button>
      </div>
    `;

    panel.querySelector('#prop-placeholder')?.addEventListener('input', (e) => {
      q.placeholder = e.target.value;
      autoSave();
    });

    panel.querySelectorAll('.option-input').forEach(input => {
      input.addEventListener('input', () => {
        q.options[parseInt(input.dataset.index, 10)] = input.value;
        renderQuestions();
        autoSave();
      });
    });

    panel.querySelector('#add-option')?.addEventListener('click', () => {
      q.options.push(`Option ${q.options.length + 1}`);
      renderProperties();
      renderQuestions();
      autoSave();
    });

    panel.querySelectorAll('.remove-option').forEach(btn => {
      btn.addEventListener('click', () => {
        q.options.splice(parseInt(btn.dataset.index, 10), 1);
        renderProperties();
        renderQuestions();
        autoSave();
      });
    });
  }

  function showAISuggestions() {
    const suggestions = [
      'How satisfied are you with our service?',
      'What feature would you like to see next?',
      'How likely are you to recommend us?',
      'Rate your overall experience'
    ];
    SurveyApp.showToast('AI suggestions loaded', 'info');
    document.querySelectorAll('.ai-chip').forEach((chip, i) => {
      if (suggestions[i]) chip.textContent = suggestions[i];
    });
  }

  function autoSave() {
    SurveyApp.set('sf_draft_' + survey.id, survey);
    const indicator = document.querySelector('.autosave-indicator');
    if (indicator) {
      indicator.classList.add('visible');
      indicator.textContent = '✓ Draft saved';
      setTimeout(() => indicator.classList.remove('visible'), 2000);
    }
  }

  function saveSurvey() {
    survey.updatedAt = new Date().toISOString();
    survey.status = survey.status || 'draft';
    SurveyApp.saveSurvey(survey);
    SurveyApp.showToast('Survey saved successfully', 'success');
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function getSurvey() { return survey; }

  function loadFromTemplate(template) {
    survey = { ...survey, ...template, id: SurveyApp.generateId() };
    render();
  }

  return {
    init, addQuestion, duplicateQuestion, deleteQuestion,
    reorderQuestion, getSurvey, loadFromTemplate, QUESTION_TYPES
  };
})();

window.SurveyBuilder = SurveyBuilder;
