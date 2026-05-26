/**
 * Export & Share Module
 */
const ExportManager = (() => {
  function init() {
    bindCopyLink();
    bindExportButtons();
    generateQR();
    initEmbedCode();
  }

  function bindCopyLink() {
    document.querySelectorAll('[data-copy]').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = document.querySelector(btn.dataset.copy);
        if (!target) return;
        navigator.clipboard.writeText(target.value || target.textContent).then(() => {
          btn.textContent = 'Copied!';
          btn.classList.add('btn-success');
          SurveyApp.showToast('Link copied to clipboard', 'success');
          setTimeout(() => {
            btn.textContent = 'Copy';
            btn.classList.remove('btn-success');
          }, 2000);
        }).catch(() => {
          target.select?.();
          document.execCommand('copy');
          SurveyApp.showToast('Link copied', 'success');
        });
      });
    });
  }

  function bindExportButtons() {
    document.getElementById('export-pdf')?.addEventListener('click', () => simulateExport('PDF'));
    document.getElementById('export-csv')?.addEventListener('click', () => simulateExport('CSV'));
    document.getElementById('export-json')?.addEventListener('click', () => simulateExport('JSON'));
    document.getElementById('export-xlsx')?.addEventListener('click', () => simulateExport('Excel'));

    document.querySelectorAll('.social-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        SurveyApp.showToast(`Share via ${btn.dataset.platform || 'social'} — demo mode`, 'info');
      });
    });
  }

  function simulateExport(format) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay active';
    overlay.innerHTML = `
      <div class="modal" style="text-align:center;padding:2rem">
        <div style="font-size:2rem;margin-bottom:1rem;animation:spin 1s linear infinite;display:inline-block">⏳</div>
        <h3>Generating ${format}...</h3>
        <p class="text-muted mt-1">Please wait</p>
      </div>
    `;
    document.body.appendChild(overlay);

    setTimeout(() => {
      overlay.remove();
      SurveyApp.addNotification(`${format} export completed`, 'export');
      SurveyApp.showToast(`${format} report ready for download`, 'success');

      if (format === 'CSV') {
        downloadCSV();
      }
    }, 2000);
  }

  function downloadCSV() {
    const responses = SurveyApp.getResponses();
    if (!responses.length) return;
    const headers = ['ID', 'Survey', 'Submitted', 'Answers'];
    const rows = responses.map(r => [
      r.id,
      r.surveyId,
      r.submittedAt,
      JSON.stringify(r.answers)
    ]);
    const csv = [headers, ...rows].map(row => row.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `survey-responses-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function generateQR() {
    const container = document.getElementById('qr-code');
    if (!container) return;
    const pattern = Array.from({ length: 64 }, () => Math.random() > 0.45);
    container.innerHTML = pattern.map(filled =>
      `<div class="qr-cell ${filled ? '' : 'empty'}"></div>`
    ).join('');
  }

  function initEmbedCode() {
    const code = document.getElementById('embed-code');
    if (code) {
      const surveyId = new URLSearchParams(window.location.search).get('id') || 'demo1';
      code.textContent = `<iframe src="${window.location.origin}/survey.html?id=${surveyId}" width="100%" height="600" frameborder="0"></iframe>`;
    }
  }

  function getShareUrl(surveyId) {
    const base = window.location.href.replace(/[^/]*$/, '');
    return `${base}survey.html?id=${surveyId || 'demo1'}`;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      if (document.getElementById('export-pdf') || document.querySelector('[data-copy]')) init();
    });
  } else if (document.getElementById('export-pdf') || document.querySelector('[data-copy]')) {
    init();
  }

  return { init, simulateExport, getShareUrl, downloadCSV };
})();

window.ExportManager = ExportManager;

/**
 * Live Survey Module
 */
const LiveSurvey = (() => {
  let survey = null;
  let currentStep = 0;
  let answers = {};
  let timerInterval = null;
  let seconds = 0;

  function init() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id') || 'demo1';
    survey = SurveyApp.getSurvey(id);

    if (!survey || !survey.pages) {
      survey = getDefaultSurvey();
    }

    renderSurvey();
    startTimer();
    initAutosave();
    bindNavigation();
  }

  function getDefaultSurvey() {
    return {
      id: 'demo1',
      title: 'Customer Feedback Survey',
      description: 'We value your opinion. This survey takes about 3 minutes.',
      pages: [{
        id: 'p1',
        questions: [
          { id: 'q1', type: 'text', label: 'What is your name?', required: true },
          { id: 'q2', type: 'email', label: 'Email address', required: true },
          { id: 'q3', type: 'radio', label: 'How satisfied are you?', required: true, options: ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied'] },
          { id: 'q4', type: 'rating', label: 'Rate our service', required: false },
          { id: 'q5', type: 'textarea', label: 'Additional comments', required: false }
        ]
      }, {
        id: 'p2',
        questions: [
          { id: 'q6', type: 'checkbox', label: 'Which features do you use?', options: ['Analytics', 'Templates', 'Themes', 'Export'], required: false },
          { id: 'q7', type: 'dropdown', label: 'How did you hear about us?', options: ['Search', 'Social Media', 'Referral', 'Other'], required: false },
          { id: 'q8', type: 'number', label: 'Years of experience', required: false }
        ]
      }]
    };
  }

  function renderSurvey() {
    const container = document.getElementById('survey-form-container');
    if (!container) return;

    document.getElementById('survey-title-live').textContent = survey.title;
    document.getElementById('survey-desc-live').textContent = survey.description || '';

    const pages = survey.pages || [{ questions: [] }];
    container.innerHTML = pages.map((page, pi) => `
      <div class="survey-step ${pi === 0 ? 'active' : ''}" data-step="${pi}">
        ${page.questions.map(q => renderQuestionInput(q)).join('')}
      </div>
    `).join('');

    updateProgress();
    ThemeManager.applyToSurveyContainer?.(document.querySelector('.survey-container'));

    const draft = SurveyApp.get('sf_survey_draft_' + survey.id);
    if (draft) {
      answers = draft;
      Object.entries(answers).forEach(([id, val]) => {
        const input = container.querySelector(`[name="${id}"]`);
        if (input) {
          if (input.type === 'checkbox') input.checked = val;
          else input.value = val;
        }
      });
    }
  }

  function renderQuestionInput(q) {
    let input = '';
    switch (q.type) {
      case 'textarea':
        input = `<textarea name="${q.id}" class="form-textarea" placeholder="Your answer" ${q.required ? 'required' : ''}></textarea>`;
        break;
      case 'radio':
        input = q.options.map(opt => `
          <label class="flex items-center gap-1 mt-1" style="cursor:pointer">
            <input type="radio" name="${q.id}" value="${opt}" ${q.required ? 'required' : ''}> ${opt}
          </label>
        `).join('');
        break;
      case 'checkbox':
        input = q.options.map(opt => `
          <label class="flex items-center gap-1 mt-1" style="cursor:pointer">
            <input type="checkbox" name="${q.id}" value="${opt}"> ${opt}
          </label>
        `).join('');
        break;
      case 'dropdown':
        input = `<select name="${q.id}" class="form-select" ${q.required ? 'required' : ''}>
          <option value="">Select...</option>
          ${q.options.map(o => `<option value="${o}">${o}</option>`).join('')}
        </select>`;
        break;
      case 'rating':
        input = `<div class="rating-input" data-id="${q.id}">
          ${[1,2,3,4,5].map(n => `<button type="button" class="emoji-btn rating-star" data-val="${n}">★</button>`).join('')}
          <input type="hidden" name="${q.id}">
        </div>`;
        break;
      case 'email':
        input = `<input type="email" name="${q.id}" class="form-input" placeholder="email@example.com" ${q.required ? 'required' : ''}>`;
        break;
      case 'number':
        input = `<input type="number" name="${q.id}" class="form-input" ${q.required ? 'required' : ''}>`;
        break;
      case 'date':
        input = `<input type="date" name="${q.id}" class="form-input" ${q.required ? 'required' : ''}>`;
        break;
      case 'file':
        input = `<div class="file-upload-preview"><input type="file" name="${q.id}" style="display:none" id="file-${q.id}">
          <label for="file-${q.id}" style="cursor:pointer">📎 Click to upload file</label></div>`;
        break;
      default:
        input = `<input type="text" name="${q.id}" class="form-input" placeholder="Your answer" ${q.required ? 'required' : ''}>`;
    }

    return `
      <div class="form-group">
        <label class="form-label">${q.label}${q.required ? ' <span style="color:var(--danger)">*</span>' : ''}</label>
        ${input}
        <div class="form-error"></div>
      </div>
    `;
  }

  function bindNavigation() {
    document.getElementById('btn-prev')?.addEventListener('click', () => goStep(-1));
    document.getElementById('btn-next')?.addEventListener('click', () => goStep(1));
    document.getElementById('btn-submit')?.addEventListener('click', submitSurvey);

    document.querySelectorAll('.rating-star').forEach(star => {
      star.addEventListener('click', () => {
        const parent = star.closest('.rating-input');
        const val = star.dataset.val;
        parent.querySelector('input[type="hidden"]').value = val;
        parent.querySelectorAll('.rating-star').forEach((s, i) => {
          s.style.color = i < val ? 'var(--warning)' : 'var(--text-muted)';
        });
      });
    });
  }

  function goStep(dir) {
    collectAnswers();
    const pages = survey.pages || [];
    const next = currentStep + dir;

    if (dir > 0 && !validateCurrentStep()) return;

    if (next >= pages.length) {
      submitSurvey();
      return;
    }
    if (next < 0) return;

    document.querySelector(`.survey-step[data-step="${currentStep}"]`)?.classList.remove('active');
    currentStep = next;
    document.querySelector(`.survey-step[data-step="${currentStep}"]`)?.classList.add('active');
    updateProgress();
    updateNavButtons();
  }

  function validateCurrentStep() {
    const step = document.querySelector(`.survey-step[data-step="${currentStep}"]`);
    if (!step) return true;
    const schema = {};
    (survey.pages[currentStep]?.questions || []).forEach(q => {
      if (q.required) {
        schema[q.id] = ['required'];
        if (q.type === 'email') schema[q.id].push('email');
      }
    });
    return FormValidation.validateForm(step, schema);
  }

  function collectAnswers() {
    const form = document.getElementById('live-survey-form');
    if (!form) return;
    new FormData(form).forEach((val, key) => { answers[key] = val; });
    SurveyApp.set('sf_survey_draft_' + survey.id, answers);
  }

  function updateProgress() {
    const pages = survey.pages || [];
    const pct = pages.length ? ((currentStep + 1) / pages.length) * 100 : 100;
    document.querySelector('.progress-bar-fill')?.style.setProperty('width', pct + '%');
    document.getElementById('step-indicator')?.textContent = `Step ${currentStep + 1} of ${pages.length}`;
    updateNavButtons();
  }

  function updateNavButtons() {
    const pages = survey.pages || [];
    document.getElementById('btn-prev').style.display = currentStep === 0 ? 'none' : '';
    document.getElementById('btn-next').style.display = currentStep < pages.length - 1 ? '' : 'none';
    document.getElementById('btn-submit').style.display = currentStep >= pages.length - 1 ? '' : 'none';
  }

  function startTimer() {
    const el = document.getElementById('survey-timer');
    if (!el) return;
    timerInterval = setInterval(() => {
      seconds++;
      const m = Math.floor(seconds / 60).toString().padStart(2, '0');
      const s = (seconds % 60).toString().padStart(2, '0');
      el.textContent = `${m}:${s}`;
    }, 1000);
  }

  function initAutosave() {
    setInterval(() => {
      collectAnswers();
      const indicator = document.querySelector('.autosave-indicator');
      if (indicator) {
        indicator.classList.add('visible');
        setTimeout(() => indicator.classList.remove('visible'), 1500);
      }
    }, 10000);
  }

  function submitSurvey() {
    collectAnswers();
    if (!validateCurrentStep()) return;
    SurveyApp.saveResponse({ surveyId: survey.id, answers });
    clearInterval(timerInterval);
    document.getElementById('survey-form-wrap')?.classList.add('hidden');
    document.getElementById('survey-complete')?.classList.remove('hidden');
    SurveyApp.set('sf_survey_draft_' + survey.id, null);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      if (document.getElementById('live-survey-form')) init();
    });
  } else if (document.getElementById('live-survey-form')) {
    init();
  }

  return { init };
})();

window.LiveSurvey = LiveSurvey;
