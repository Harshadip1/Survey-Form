/**
 * Form Validation Module
 */
const FormValidation = (() => {
  const rules = {
    required: (value) => value !== undefined && value !== null && String(value).trim() !== '',
    email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    number: (value) => !isNaN(parseFloat(value)) && isFinite(value),
    minLength: (value, min) => String(value).length >= min,
    maxLength: (value, max) => String(value).length <= max,
    phone: (value) => /^[\d\s\-+()]{7,}$/.test(value)
  };

  const messages = {
    required: 'This field is required',
    email: 'Please enter a valid email address',
    number: 'Please enter a valid number',
    minLength: (min) => `Minimum ${min} characters required`,
    maxLength: (max) => `Maximum ${max} characters allowed`,
    phone: 'Please enter a valid phone number'
  };

  function validateField(input, fieldRules = []) {
    const value = input.type === 'checkbox' ? input.checked : input.value;
    const errors = [];

    fieldRules.forEach(rule => {
      if (rule === 'required' && !rules.required(value)) {
        errors.push(messages.required);
      }
      if (rule === 'email' && value && !rules.email(value)) {
        errors.push(messages.email);
      }
      if (rule === 'number' && value && !rules.number(value)) {
        errors.push(messages.number);
      }
      if (typeof rule === 'object' && rule.minLength && !rules.minLength(value, rule.minLength)) {
        errors.push(messages.minLength(rule.minLength));
      }
    });

    return errors;
  }

  function showFieldError(input, errors) {
    const group = input.closest('.form-group') || input.parentElement;
    let errorEl = group.querySelector('.form-error');

    if (!errorEl) {
      errorEl = document.createElement('div');
      errorEl.className = 'form-error';
      group.appendChild(errorEl);
    }

    if (errors.length) {
      input.classList.add('error');
      input.classList.remove('success');
      errorEl.textContent = '⚠ ' + errors[0];
      errorEl.classList.add('visible');
    } else {
      input.classList.remove('error');
      if (input.value) input.classList.add('success');
      errorEl.classList.remove('visible');
    }
  }

  function validateForm(form, schema) {
    let isValid = true;
    const allErrors = [];

    Object.entries(schema).forEach(([name, fieldRules]) => {
      const input = form.querySelector(`[name="${name}"], #${name}`);
      if (!input) return;
      const errors = validateField(input, fieldRules);
      showFieldError(input, errors);
      if (errors.length) {
        isValid = false;
        allErrors.push({ field: name, message: errors[0] });
      }
    });

    updateValidationSummary(form, allErrors);
    return isValid;
  }

  function updateValidationSummary(form, errors) {
    let summary = form.querySelector('.validation-summary');
    if (!summary && errors.length) {
      summary = document.createElement('div');
      summary.className = 'validation-summary';
      form.insertBefore(summary, form.firstChild);
    }
    if (!summary) return;

    if (errors.length) {
      summary.classList.remove('hidden');
      summary.innerHTML = `<strong>Please fix the following errors:</strong><ul>${errors.map(e => `<li>${e.message}</li>`).join('')}</ul>`;
    } else {
      summary.classList.add('hidden');
    }
  }

  function initPasswordStrength(input) {
    const bar = input.parentElement.querySelector('.password-strength-bar');
    if (!bar) return;

    input.addEventListener('input', () => {
      const val = input.value;
      let strength = 0;
      if (val.length >= 8) strength++;
      if (/[A-Z]/.test(val)) strength++;
      if (/[0-9]/.test(val)) strength++;
      if (/[^A-Za-z0-9]/.test(val)) strength++;

      const widths = ['0%', '25%', '50%', '75%', '100%'];
      const colors = ['#EF4444', '#F59E0B', '#F59E0B', '#22C55E', '#22C55E'];
      bar.style.width = widths[strength];
      bar.style.background = colors[strength];
    });
  }

  function initRealtimeValidation(form, schema) {
    Object.keys(schema).forEach(name => {
      const input = form.querySelector(`[name="${name}"], #${name}`);
      if (!input) return;
      const validate = () => {
        const errors = validateField(input, schema[name]);
        showFieldError(input, errors);
      };
      input.addEventListener('blur', validate);
      input.addEventListener('input', () => {
        if (input.classList.contains('error')) validate();
      });
      if (input.type === 'password') initPasswordStrength(input);
    });
  }

  function initSurveyValidation(form, questions) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const schema = {};
      questions.forEach(q => {
        if (q.required) {
          schema[q.id] = ['required'];
          if (q.type === 'email') schema[q.id].push('email');
          if (q.type === 'number') schema[q.id].push('number');
        }
      });
      if (validateForm(form, schema)) {
        form.dispatchEvent(new CustomEvent('validated-submit', { bubbles: true }));
      }
    });
  }

  return {
    validateField,
    validateForm,
    showFieldError,
    initRealtimeValidation,
    initSurveyValidation,
    initPasswordStrength,
    rules
  };
})();

window.FormValidation = FormValidation;
