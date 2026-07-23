// =========================================================
// StyleSlot — Client Logic
// Validation, API submission, success modal, toast notifications
// =========================================================

document.getElementById('year').textContent = new Date().getFullYear();

const form = document.getElementById('appointmentForm');
const submitBtn = document.getElementById('submitBtn');
const toast = document.getElementById('toast');
const successOverlay = document.getElementById('successOverlay');
const modalBookingId = document.getElementById('modalBookingId');
const modalSummary = document.getElementById('modalSummary');
const bookAnotherBtn = document.getElementById('bookAnotherBtn');
const closeModalBtn = document.getElementById('closeModalBtn');

// Prevent selecting a past date in the date picker itself
const dateInput = document.getElementById('appointmentDate');
const todayISO = new Date().toISOString().split('T')[0];
dateInput.setAttribute('min', todayISO);

// ---------------------------------------------------------
// Validation rules (mirrors server-side validation)
// ---------------------------------------------------------
function validateForm(data) {
  const errors = {};

  if (!data.fullName.trim()) {
    errors.fullName = 'Full name is required.';
  } else if (data.fullName.trim().length < 2) {
    errors.fullName = 'Full name must be at least 2 characters.';
  }

  if (!/^[0-9]{10}$/.test(data.mobile)) {
    errors.mobile = 'Enter a valid 10-digit mobile number.';
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Enter a valid email address.';
  }

  if (!data.gender) {
    errors.gender = 'Please select a gender.';
  }

  const ageNum = Number(data.age);
  if (!data.age || Number.isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
    errors.age = 'Enter a valid age.';
  }

  if (!data.service) {
    errors.service = 'Please select a service.';
  }

  if (!data.stylist) {
    errors.stylist = 'Please select a preferred stylist.';
  }

  if (!data.appointmentDate) {
    errors.appointmentDate = 'Appointment date is required.';
  } else {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(data.appointmentDate);
    if (selected < today) {
      errors.appointmentDate = 'Appointment date cannot be in the past.';
    }
  }

  if (!data.appointmentTime) {
    errors.appointmentTime = 'Preferred time is required.';
  }

  if (!data.branch) {
    errors.branch = 'Please select a branch / location.';
  }

  if (!data.paymentMethod) {
    errors.paymentMethod = 'Please select a payment method.';
  }

  if (!data.termsAccepted) {
    errors.termsAccepted = 'You must agree to the Terms & Conditions and Cancellation Policy.';
  }

  return errors;
}

function clearErrors() {
  document.querySelectorAll('.field').forEach((field) => field.classList.remove('has-error'));
  document.querySelectorAll('.error-msg').forEach((el) => (el.textContent = ''));
}

function showErrors(errors) {
  clearErrors();
  Object.entries(errors).forEach(([fieldName, message]) => {
    const errorEl = document.getElementById(`err-${fieldName}`);
    if (!errorEl) return;
    errorEl.textContent = message;

    // Walk up to the nearest `.field` wrapper to apply the error style.
    // For paymentMethod / termsAccepted the wrapper is `.field--full`.
    const wrapper = errorEl.closest('.field');
    if (wrapper) wrapper.classList.add('has-error');
  });

  // Scroll to first error for better UX
  const firstErrorField = document.querySelector('.field.has-error');
  if (firstErrorField) {
    firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

function showToast(message, type = 'success') {
  toast.innerHTML = `<i class="fa-solid ${type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}"></i><span>${message}</span>`;
  toast.className = `toast toast--${type} is-visible`;
  setTimeout(() => toast.classList.remove('is-visible'), 3800);
}

function getFormData() {
  const formData = new FormData(form);
  return {
    fullName: (formData.get('fullName') || '').toString(),
    mobile: (formData.get('mobile') || '').toString(),
    email: (formData.get('email') || '').toString(),
    gender: (formData.get('gender') || '').toString(),
    age: (formData.get('age') || '').toString(),
    service: (formData.get('service') || '').toString(),
    stylist: (formData.get('stylist') || '').toString(),
    appointmentDate: (formData.get('appointmentDate') || '').toString(),
    appointmentTime: (formData.get('appointmentTime') || '').toString(),
    branch: (formData.get('branch') || '').toString(),
    specialRequest: (formData.get('specialRequest') || '').toString(),
    paymentMethod: (formData.get('paymentMethod') || '').toString(),
    termsAccepted: document.getElementById('termsAccepted').checked
  };
}

function formatDisplayDate(isoDate) {
  const d = new Date(isoDate);
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatDisplayTime(time24) {
  const [h, m] = time24.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

function setLoading(isLoading) {
  submitBtn.disabled = isLoading;
  submitBtn.classList.toggle('is-loading', isLoading);
}

function openModal(bookingId, data) {
  modalBookingId.textContent = bookingId;
  modalSummary.innerHTML = `
    <div><span>Service</span><span>${data.service}</span></div>
    <div><span>Stylist</span><span>${data.stylist}</span></div>
    <div><span>Date</span><span>${formatDisplayDate(data.appointmentDate)}</span></div>
    <div><span>Time</span><span>${formatDisplayTime(data.appointmentTime)}</span></div>
    <div><span>Branch</span><span>${data.branch}</span></div>
    <div><span>Payment</span><span>${data.paymentMethod}</span></div>
  `;
  successOverlay.classList.add('is-visible');
}

function closeModal() {
  successOverlay.classList.remove('is-visible');
}

// ---------------------------------------------------------
// Live-clear a field's error state as the user corrects it
// ---------------------------------------------------------
form.querySelectorAll('input, select, textarea').forEach((el) => {
  el.addEventListener('input', () => {
    const wrapper = el.closest('.field');
    if (wrapper && wrapper.classList.contains('has-error')) {
      wrapper.classList.remove('has-error');
      const errorEl = wrapper.querySelector('.error-msg');
      if (errorEl) errorEl.textContent = '';
    }
  });
});

// ---------------------------------------------------------
// Restrict mobile number input to digits only, 10 max
// ---------------------------------------------------------
document.getElementById('mobile').addEventListener('input', (e) => {
  e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
});

// ---------------------------------------------------------
// Form submission
// ---------------------------------------------------------
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const data = getFormData();
  const errors = validateForm(data);

  if (Object.keys(errors).length > 0) {
    showErrors(errors);
    showToast('Please correct the highlighted fields.', 'error');
    return;
  }

  clearErrors();
  setLoading(true);

  try {
    const response = await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      if (result.errors) {
        showErrors(result.errors);
      }
      showToast(result.message || 'Unable to book appointment. Please try again.', 'error');
      return;
    }

    showToast('Appointment booked successfully!', 'success');
    openModal(result.bookingId, data);
  } catch (err) {
    console.error('Network/API error:', err);
    showToast('Network error. Please check your connection and try again.', 'error');
  } finally {
    setLoading(false);
  }
});

// ---------------------------------------------------------
// Modal actions
// ---------------------------------------------------------
bookAnotherBtn.addEventListener('click', () => {
  closeModal();
  form.reset();
  clearErrors();
  window.scrollTo({ top: form.offsetTop - 40, behavior: 'smooth' });
});

closeModalBtn.addEventListener('click', () => {
  closeModal();
  form.reset();
  clearErrors();
});

successOverlay.addEventListener('click', (e) => {
  if (e.target === successOverlay) {
    closeModal();
  }
});

// Terms link — placeholder informational toast (no external page in this demo)
document.getElementById('termsLink').addEventListener('click', (e) => {
  e.preventDefault();
  showToast('Terms & Cancellation Policy: appointments can be rescheduled up to 4 hours in advance.', 'success');
});
