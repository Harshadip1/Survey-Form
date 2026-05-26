/**
 * Responses Management Module
 */
const ResponsesManager = (() => {
  let currentFilter = 'all';
  let currentSurveyId = null;

  function init(surveyId = null) {
    currentSurveyId = surveyId;
    bindEvents();
    renderTable();
  }

  function bindEvents() {
    document.getElementById('response-search')?.addEventListener('input', (e) => {
      filterResponses(e.target.value);
    });

    document.querySelectorAll('[data-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        currentFilter = btn.dataset.filter;
        document.querySelectorAll('[data-filter]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderTable();
      });
    });

    document.getElementById('btn-delete-selected')?.addEventListener('click', deleteSelected);
    document.getElementById('survey-filter')?.addEventListener('change', (e) => {
      currentSurveyId = e.target.value || null;
      renderTable();
    });
  }

  function getFilteredResponses() {
    let responses = SurveyApp.getResponses(currentSurveyId);
    const surveys = SurveyApp.getSurveys();

    return responses.map((r, i) => {
      const survey = surveys.find(s => s.id === r.surveyId);
      return {
        ...r,
        index: i + 1,
        surveyTitle: survey?.title || 'Unknown Survey',
        preview: Object.values(r.answers || {}).slice(0, 1).join(', ') || '—'
      };
    });
  }

  function renderTable() {
    const tbody = document.getElementById('responses-tbody');
    if (!tbody) return;

    const responses = getFilteredResponses();

    if (!responses.length) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted" style="padding:3rem">No responses yet</td></tr>`;
      return;
    }

    tbody.innerHTML = responses.map(r => `
      <tr data-response-id="${r.id}" data-searchable>
        <td><input type="checkbox" class="response-check" value="${r.id}"></td>
        <td>#${String(r.index).padStart(4, '0')}</td>
        <td class="truncate" style="max-width:200px">${escapeHtml(r.surveyTitle)}</td>
        <td class="truncate" style="max-width:240px">${escapeHtml(r.preview)}</td>
        <td>${formatDate(r.submittedAt)}</td>
        <td>
          <button class="btn btn-ghost btn-sm view-response" data-id="${r.id}">View</button>
          <button class="btn btn-ghost btn-sm delete-response" data-id="${r.id}">Delete</button>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('.view-response').forEach(btn => {
      btn.addEventListener('click', () => showDetailModal(btn.dataset.id));
    });

    tbody.querySelectorAll('.delete-response').forEach(btn => {
      btn.addEventListener('click', () => deleteResponse(btn.dataset.id));
    });
  }

  function filterResponses(query) {
    const q = query.toLowerCase();
    document.querySelectorAll('#responses-tbody tr').forEach(row => {
      row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  }

  function showDetailModal(id) {
    const responses = SurveyApp.getResponses();
    const response = responses.find(r => r.id === id);
    if (!response) return;

    const modal = document.getElementById('response-modal');
    const body = document.getElementById('response-modal-body');
    if (!modal || !body) return;

    body.innerHTML = `
      <p class="text-muted text-sm mb-2">Submitted: ${formatDate(response.submittedAt)}</p>
      ${Object.entries(response.answers || {}).map(([key, val]) => `
        <div class="form-group">
          <label class="form-label">${escapeHtml(key)}</label>
          <p>${escapeHtml(String(val))}</p>
        </div>
      `).join('')}
      <div class="emoji-reactions mt-2">
        ${['👍', '❤️', '🎉', '🤔'].map(e => `<button class="emoji-btn">${e}</button>`).join('')}
      </div>
    `;
    modal.classList.add('active');
  }

  function deleteResponse(id) {
    const responses = SurveyApp.getResponses().filter(r => r.id !== id);
    SurveyApp.set(SurveyApp.STORAGE_KEYS.responses, responses);
    renderTable();
    SurveyApp.showToast('Response deleted', 'success');
  }

  function deleteSelected() {
    const selected = [...document.querySelectorAll('.response-check:checked')].map(c => c.value);
    if (!selected.length) {
      SurveyApp.showToast('No responses selected', 'warning');
      return;
    }
    const responses = SurveyApp.getResponses().filter(r => !selected.includes(r.id));
    SurveyApp.set(SurveyApp.STORAGE_KEYS.responses, responses);
    renderTable();
    SurveyApp.showToast(`${selected.length} responses deleted`, 'success');
  }

  function formatDate(iso) {
    return new Date(iso).toLocaleString();
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  return { init, renderTable, getFilteredResponses };
})();

window.ResponsesManager = ResponsesManager;
