/**
 * Analytics & Charts Module
 */
const Analytics = (() => {
  const colors = ['#7C3AED', '#06B6D4', '#22C55E', '#F59E0B', '#EF4444', '#A78BFA', '#22D3EE'];

  function init() {
    renderAllCharts();
    initHeatmap();
    animateProgressRings();
  }

  function renderAllCharts() {
    renderPieChart('chart-pie', [35, 28, 22, 15], ['Excellent', 'Good', 'Fair', 'Poor']);
    renderBarChart('chart-bar', [120, 190, 85, 160, 220, 180], ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
    renderLineChart('chart-line');
    renderHorizontalBars('chart-questions');
  }

  function renderPieChart(canvasId, data, labels) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const total = data.reduce((a, b) => a + b, 0);
    let startAngle = -Math.PI / 2;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const radius = Math.min(cx, cy) - 10;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    data.forEach((value, i) => {
      const slice = (value / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, startAngle, startAngle + slice);
      ctx.closePath();
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();
      startAngle += slice;
    });

    renderLegend(canvasId + '-legend', labels, data, colors);
  }

  function renderBarChart(canvasId, data, labels) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const padding = 40;
    const w = canvas.width - padding * 2;
    const h = canvas.height - padding * 2;
    const max = Math.max(...data);
    const barW = w / data.length - 8;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    data.forEach((val, i) => {
      const barH = (val / max) * h;
      const x = padding + i * (barW + 8);
      const y = canvas.height - padding - barH;
      const gradient = ctx.createLinearGradient(0, y, 0, y + barH);
      gradient.addColorStop(0, '#7C3AED');
      gradient.addColorStop(1, '#06B6D4');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.roundRect(x, y, barW, barH, 4);
      ctx.fill();
      ctx.fillStyle = '#94A3B8';
      ctx.font = '11px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(labels[i], x + barW / 2, canvas.height - 12);
    });
  }

  function renderLineChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const data = [30, 45, 38, 62, 55, 78, 85, 72, 90, 95, 88, 102];
    const padding = 40;
    const w = canvas.width - padding * 2;
    const h = canvas.height - padding * 2;
    const max = Math.max(...data);
    const step = w / (data.length - 1);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const gradient = ctx.createLinearGradient(0, padding, 0, canvas.height - padding);
    gradient.addColorStop(0, 'rgba(124, 58, 237, 0.3)');
    gradient.addColorStop(1, 'rgba(124, 58, 237, 0)');

    ctx.beginPath();
    data.forEach((val, i) => {
      const x = padding + i * step;
      const y = canvas.height - padding - (val / max) * h;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.lineTo(padding + (data.length - 1) * step, canvas.height - padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.beginPath();
    ctx.strokeStyle = '#7C3AED';
    ctx.lineWidth = 2;
    data.forEach((val, i) => {
      const x = padding + i * step;
      const y = canvas.height - padding - (val / max) * h;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();

    data.forEach((val, i) => {
      const x = padding + i * step;
      const y = canvas.height - padding - (val / max) * h;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#7C3AED';
      ctx.fill();
    });
  }

  function renderHorizontalBars(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const questions = [
      { label: 'Overall satisfaction', value: 92 },
      { label: 'Product quality', value: 87 },
      { label: 'Customer support', value: 78 },
      { label: 'Value for money', value: 85 },
      { label: 'Likelihood to recommend', value: 91 }
    ];
    container.innerHTML = questions.map(q => `
      <div class="engagement-meter">
        <label>${q.label}</label>
        <div class="progress-bar"><div class="progress-bar-fill" style="width:0" data-width="${q.value}%"></div></div>
        <span class="text-sm">${q.value}%</span>
      </div>
    `).join('');

    setTimeout(() => {
      container.querySelectorAll('.progress-bar-fill').forEach(bar => {
        bar.style.width = bar.dataset.width;
      });
    }, 300);
  }

  function renderLegend(containerId, labels, data, colors) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const total = data.reduce((a, b) => a + b, 0);
    container.innerHTML = labels.map((label, i) => `
      <div class="flex items-center gap-1" style="margin-bottom:0.5rem;font-size:0.8125rem">
        <span style="width:12px;height:12px;border-radius:3px;background:${colors[i]};display:inline-block"></span>
        <span>${label}</span>
        <span class="text-muted" style="margin-left:auto">${Math.round(data[i]/total*100)}%</span>
      </div>
    `).join('');
  }

  function initHeatmap() {
    document.querySelectorAll('.heatmap-cell').forEach(cell => {
      const level = Math.floor(Math.random() * 5) + 1;
      cell.classList.add(`level-${level}`);
    });
  }

  function animateProgressRings() {
    document.querySelectorAll('.progress-ring .fill').forEach(circle => {
      const value = parseInt(circle.dataset.value, 10) || 0;
      const radius = circle.r.baseVal.value;
      const circumference = 2 * Math.PI * radius;
      circle.style.strokeDasharray = circumference;
      circle.style.strokeDashoffset = circumference - (value / 100) * circumference;
    });
  }

  function getStats() {
    const surveys = SurveyApp.getSurveys();
    const responses = SurveyApp.getResponses();
    return {
      totalSurveys: surveys.length,
      totalResponses: responses.length,
      activeSurveys: surveys.filter(s => s.status === 'active').length,
      completionRate: responses.length ? Math.round(responses.length / (surveys.length * 50) * 100) : 0
    };
  }

  function updateDashboardStats() {
    const stats = getStats();
    const els = {
      'stat-surveys': stats.totalSurveys || 12,
      'stat-responses': stats.totalResponses || 1247,
      'stat-active': stats.activeSurveys || 8,
      'stat-completion': stats.completionRate || 78
    };
    Object.entries(els).forEach(([id, val]) => {
      const el = document.getElementById(id);
      if (el) el.dataset.counter = val;
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      if (document.getElementById('chart-pie')) {
        init();
        updateDashboardStats();
      }
    });
  } else if (document.getElementById('chart-pie')) {
    init();
    updateDashboardStats();
  }

  return { init, renderPieChart, renderBarChart, renderLineChart, getStats };
})();

window.Analytics = Analytics;
