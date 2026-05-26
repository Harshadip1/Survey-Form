/**
 * SurveyForge — Core Application Module
 */
const SurveyApp = (() => {
  const STORAGE_KEYS = {
    surveys: 'sf_surveys',
    responses: 'sf_responses',
    settings: 'sf_settings',
    theme: 'sf_theme',
    drafts: 'sf_drafts',
    notifications: 'sf_notifications'
  };

  const defaultSettings = {
    theme: 'dark',
    surveyTheme: 'gradient',
    primaryColor: '#7C3AED',
    accentColor: '#06B6D4',
    font: 'inter',
    layout: 'centered',
    accessibility: { highContrast: false, largeText: false, reducedMotion: false },
    language: 'en'
  };

  function get(key, fallback = null) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  }

  function set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function getSettings() {
    return { ...defaultSettings, ...get(STORAGE_KEYS.settings, {}) };
  }

  function saveSettings(updates) {
    const settings = { ...getSettings(), ...updates };
    set(STORAGE_KEYS.settings, settings);
    applySettings(settings);
    return settings;
  }

  function getSurveys() {
    return get(STORAGE_KEYS.surveys, []);
  }

  function saveSurvey(survey) {
    const surveys = getSurveys();
    const idx = surveys.findIndex(s => s.id === survey.id);
    if (idx >= 0) surveys[idx] = survey;
    else surveys.push(survey);
    set(STORAGE_KEYS.surveys, surveys);
    return survey;
  }

  function getSurvey(id) {
    return getSurveys().find(s => s.id === id) || null;
  }

  function deleteSurvey(id) {
    set(STORAGE_KEYS.surveys, getSurveys().filter(s => s.id !== id));
  }

  function getResponses(surveyId = null) {
    const all = get(STORAGE_KEYS.responses, []);
    return surveyId ? all.filter(r => r.surveyId === surveyId) : all;
  }

  function saveResponse(response) {
    const responses = getResponses();
    responses.push({ ...response, id: 'resp_' + Date.now(), submittedAt: new Date().toISOString() });
    set(STORAGE_KEYS.responses, responses);
    addNotification('New response received', 'survey');
    return response;
  }

  function getNotifications() {
    return get(STORAGE_KEYS.notifications, generateDefaultNotifications());
  }

  function addNotification(message, type = 'info') {
    const notifs = getNotifications();
    notifs.unshift({
      id: 'notif_' + Date.now(),
      message,
      type,
      read: false,
      time: new Date().toISOString()
    });
    set(STORAGE_KEYS.notifications, notifs.slice(0, 50));
    showToast(message, type);
    updateNotifBadge();
  }

  function generateDefaultNotifications() {
    return [
      { id: 'n1', message: '12 new responses on Customer Feedback', type: 'survey', read: false, time: new Date(Date.now() - 3600000).toISOString() },
      { id: 'n2', message: 'Survey "Event Registration" completed by 50 users', type: 'success', read: false, time: new Date(Date.now() - 7200000).toISOString() },
      { id: 'n3', message: 'Team member updated shared survey', type: 'team', read: true, time: new Date(Date.now() - 86400000).toISOString() },
      { id: 'n4', message: 'CSV export ready for download', type: 'export', read: true, time: new Date(Date.now() - 172800000).toISOString() }
    ];
  }

  function generateId() {
    return 'srv_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function applySettings(settings) {
    document.documentElement.setAttribute('data-theme', settings.theme === 'light' ? 'light' : 'dark');
    document.body.classList.toggle('high-contrast', settings.accessibility?.highContrast);
    document.body.classList.toggle('large-text', settings.accessibility?.largeText);
    document.body.classList.toggle('reduced-motion', settings.accessibility?.reducedMotion);
    if (settings.primaryColor) {
      document.documentElement.style.setProperty('--primary', settings.primaryColor);
    }
  }

  function initParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 2 + 0.5,
        dx: (Math.random() - 0.5) * 0.3,
        dy: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.5 + 0.2
      });
    }

    function animate() {
      if (document.body.classList.contains('reduced-motion')) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(124, 58, 237, ${p.opacity})`;
        ctx.fill();
      });
      requestAnimationFrame(animate);
    }
    animate();
  }

  function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');
    if (!reveals.length) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    reveals.forEach(el => observer.observe(el));
  }

  function initCounters() {
    document.querySelectorAll('[data-counter]').forEach(el => {
      const target = parseInt(el.dataset.counter, 10);
      const duration = 1500;
      const start = performance.now();
      const update = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(target * eased).toLocaleString();
        if (progress < 1) requestAnimationFrame(update);
      };
      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          requestAnimationFrame(update);
          observer.disconnect();
        }
      });
      observer.observe(el);
    });
  }

  function showToast(message, type = 'info', duration = 4000) {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    const icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ', survey: '📋', team: '👥', export: '📥' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${icons[type] || icons.info}</span><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  function updateNotifBadge() {
    const badge = document.querySelector('.notif-badge');
    if (!badge) return;
    const unread = getNotifications().filter(n => !n.read).length;
    badge.textContent = unread;
    badge.style.display = unread ? 'flex' : 'none';
  }

  function initSidebar() {
    const toggle = document.querySelector('.sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    if (toggle && sidebar) {
      toggle.addEventListener('click', () => sidebar.classList.toggle('open'));
    }
    document.querySelectorAll('.sidebar-link').forEach(link => {
      if (link.getAttribute('href') === window.location.pathname.split('/').pop()) {
        link.classList.add('active');
      }
    });
  }

  function initMobileNav() {
    const btn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('.nav-links');
    if (btn && nav) {
      btn.addEventListener('click', () => nav.classList.toggle('mobile-open'));
    }
  }

  function initDropdowns() {
    document.querySelectorAll('.dropdown').forEach(dropdown => {
      const trigger = dropdown.querySelector('[data-dropdown-trigger]');
      if (!trigger) return;
      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        document.querySelectorAll('.dropdown.open').forEach(d => {
          if (d !== dropdown) d.classList.remove('open');
        });
        dropdown.classList.toggle('open');
      });
    });
    document.addEventListener('click', () => {
      document.querySelectorAll('.dropdown.open').forEach(d => d.classList.remove('open'));
    });
  }

  function initTabs() {
    document.querySelectorAll('.tabs').forEach(tabGroup => {
      const buttons = tabGroup.querySelectorAll('.tab-btn');
      const container = tabGroup.closest('.tab-container') || tabGroup.parentElement;
      buttons.forEach(btn => {
        btn.addEventListener('click', () => {
          const target = btn.dataset.tab;
          buttons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          container.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.toggle('active', panel.id === target);
          });
        });
      });
    });
  }

  function initModals() {
    document.querySelectorAll('[data-modal-open]').forEach(trigger => {
      trigger.addEventListener('click', () => {
        const modal = document.getElementById(trigger.dataset.modalOpen);
        if (modal) modal.classList.add('active');
      });
    });
    document.querySelectorAll('[data-modal-close]').forEach(btn => {
      btn.addEventListener('click', () => {
        btn.closest('.modal-overlay')?.classList.remove('active');
      });
    });
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.classList.remove('active');
      });
    });
  }

  function initThemeToggle() {
    const toggle = document.querySelector('[data-theme-toggle]');
    if (!toggle) return;
    toggle.addEventListener('click', () => {
      const settings = getSettings();
      const newTheme = settings.theme === 'light' ? 'dark' : 'light';
      saveSettings({ theme: newTheme });
      showToast(`Switched to ${newTheme} mode`, 'success');
    });
  }

  function initSearch() {
    document.querySelectorAll('[data-search]').forEach(input => {
      const target = document.querySelector(input.dataset.search);
      if (!target) return;
      input.addEventListener('input', () => {
        const query = input.value.toLowerCase();
        target.querySelectorAll('[data-searchable]').forEach(item => {
          const text = item.textContent.toLowerCase();
          item.style.display = text.includes(query) ? '' : 'none';
        });
      });
    });
  }

  function initOfflineDetection() {
    const banner = document.querySelector('.offline-banner');
    if (!banner) return;
    const update = () => banner.classList.toggle('visible', !navigator.onLine);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    update();
  }

  function formatRelativeTime(isoString) {
    const diff = Date.now() - new Date(isoString).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }

  function seedDemoData() {
    if (getSurveys().length > 0) return;
    const demoSurveys = [
      { id: 'demo1', title: 'Customer Satisfaction Survey', description: 'Measure customer experience', status: 'active', responses: 248, pages: 2, createdAt: '2025-05-01', questions: [] },
      { id: 'demo2', title: 'Employee Engagement', description: 'Annual team feedback', status: 'active', responses: 89, pages: 3, createdAt: '2025-05-10', questions: [] },
      { id: 'demo3', title: 'Product Feedback Form', description: 'Beta tester insights', status: 'draft', responses: 0, pages: 1, createdAt: '2025-05-20', questions: [] }
    ];
    set(STORAGE_KEYS.surveys, demoSurveys);

    const demoResponses = [];
    for (let i = 0; i < 30; i++) {
      demoResponses.push({
        id: 'resp_demo_' + i,
        surveyId: 'demo1',
        answers: { q1: 'Great service', q2: '5' },
        submittedAt: new Date(Date.now() - i * 3600000 * 4).toISOString()
      });
    }
    set(STORAGE_KEYS.responses, demoResponses);
  }

  function init() {
    applySettings(getSettings());
    seedDemoData();
    initParticles();
    initScrollReveal();
    initCounters();
    initSidebar();
    initMobileNav();
    initDropdowns();
    initTabs();
    initModals();
    initThemeToggle();
    initSearch();
    initOfflineDetection();
    updateNotifBadge();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return {
    STORAGE_KEYS,
    get, set,
    getSettings, saveSettings,
    getSurveys, saveSurvey, getSurvey, deleteSurvey,
    getResponses, saveResponse,
    getNotifications, addNotification,
    generateId, showToast, formatRelativeTime
  };
})();

window.SurveyApp = SurveyApp;
