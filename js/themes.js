/**
 * Theme Customization Module
 */
const ThemeManager = (() => {
  const themes = ['minimal', 'neon', 'glass', 'professional', 'gradient'];

  function init() {
    loadCurrentTheme();
    bindEvents();
  }

  function loadCurrentTheme() {
    const settings = SurveyApp.getSettings();
    document.querySelectorAll('.theme-card').forEach(card => {
      card.classList.toggle('selected', card.dataset.theme === settings.surveyTheme);
    });
    const primaryInput = document.getElementById('color-primary');
    const accentInput = document.getElementById('color-accent');
    if (primaryInput) primaryInput.value = settings.primaryColor || '#7C3AED';
    if (accentInput) accentInput.value = settings.accentColor || '#06B6D4';
  }

  function bindEvents() {
    document.querySelectorAll('.theme-card').forEach(card => {
      card.addEventListener('click', () => applySurveyTheme(card.dataset.theme));
    });

    document.getElementById('color-primary')?.addEventListener('input', (e) => {
      document.documentElement.style.setProperty('--primary', e.target.value);
      SurveyApp.saveSettings({ primaryColor: e.target.value });
    });

    document.getElementById('color-accent')?.addEventListener('input', (e) => {
      document.documentElement.style.setProperty('--accent', e.target.value);
      SurveyApp.saveSettings({ accentColor: e.target.value });
    });

    document.querySelectorAll('.font-option').forEach(opt => {
      opt.addEventListener('click', () => {
        document.querySelectorAll('.font-option').forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        const fonts = { inter: "'Inter', sans-serif", space: "'Space Grotesk', sans-serif", serif: 'Georgia, serif', mono: "'Courier New', monospace" };
        document.body.style.fontFamily = fonts[opt.dataset.font] || fonts.inter;
        SurveyApp.saveSettings({ font: opt.dataset.font });
      });
    });

    document.querySelectorAll('.layout-option').forEach(opt => {
      opt.addEventListener('click', () => {
        document.querySelectorAll('.layout-option').forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        SurveyApp.saveSettings({ layout: opt.dataset.layout });
      });
    });

    document.querySelectorAll('.bg-style-item').forEach(item => {
      item.addEventListener('click', () => {
        document.querySelectorAll('.bg-style-item').forEach(i => i.classList.remove('selected'));
        item.classList.add('selected');
        SurveyApp.saveSettings({ backgroundStyle: item.dataset.bg });
      });
    });

    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        SurveyApp.saveSettings({ language: btn.dataset.lang });
        SurveyApp.showToast(`Language set to ${btn.textContent}`, 'info');
      });
    });

    document.querySelectorAll('[data-a11y]').forEach(toggle => {
      toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        const key = toggle.dataset.a11y;
        const settings = SurveyApp.getSettings();
        const accessibility = { ...settings.accessibility, [key]: toggle.classList.contains('active') };
        SurveyApp.saveSettings({ accessibility });
      });
    });
  }

  function applySurveyTheme(theme) {
    document.querySelectorAll('.theme-card').forEach(c => c.classList.remove('selected'));
    document.querySelector(`.theme-card[data-theme="${theme}"]`)?.classList.add('selected');
    document.body.className = document.body.className.replace(/theme-\w+/g, '');
    document.body.classList.add(`theme-${theme}`);
    SurveyApp.saveSettings({ surveyTheme: theme });
    SurveyApp.showToast(`Theme "${theme}" applied`, 'success');
  }

  function applyToSurveyContainer(container) {
    const settings = SurveyApp.getSettings();
    container.className = `survey-container survey-theme-${settings.surveyTheme || 'gradient'}`;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      if (document.querySelector('.theme-grid')) init();
    });
  } else if (document.querySelector('.theme-grid')) {
    init();
  }

  return { init, applySurveyTheme, applyToSurveyContainer };
})();

window.ThemeManager = ThemeManager;
