import iziToast from 'izitoast';
const modal = document.querySelector('.contact-modal');
const openBtns = document.querySelectorAll('.open-modal');
const closeBtn = modal.querySelector('.close-modal');
const scrollBody = document.body.style;
const scrollHtml = document.documentElement.style;

openBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const category = btn.closest('.category')?.dataset.category || 'Default';
    const categoryTitle = modal.querySelector('.title');
    categoryTitle.textContent = category;

    modal.classList.add('is-open');
    removeScroll();
  });
});

closeBtn.addEventListener('click', () => {
  closeModal();
  addScroll();
});

modal.addEventListener('click', e => {
  if (!e.target.closest('.register-contact-modal')) {
    closeModal();
  }
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && modal.classList.contains('is-open')) {
    closeModal();
    addScroll();
  }
});

const form = modal.querySelector('form');
form.addEventListener('submit', e => {
  e.preventDefault();

  const name = form.elements.name.value.trim();
  const email = form.elements.email.value.trim();
  const message = form.elements.message.value.trim();

  if (!name || !email) {
    return showToast('info', 'Please fill in all required fields.');
  }
  console.log('Form data:', { name, email, message: message || '' });

  showToast('success', 'Your message has been sent!');

  closeModal();
  addScroll();
  form.reset();
});

function removeScroll() {
  scrollBody.overflow = 'hidden';
  scrollHtml.overflow = 'hidden';
}

function addScroll() {
  scrollBody.overflow = 'auto';
  scrollHtml.overflow = 'auto';
}

function closeModal() {
  modal.classList.remove('is-open');
  addScroll();
}

function showToast(type = 'success', message = '') {
  iziToast[type]({
    icon: '',
    message: message,
    close: false,
    backgroundColor: type === 'info' ? '#0b0500' : '#e15d05',
    messageColor: '#ffffff',
    timeout: 3000,
    zindex: 9999,
    progressBar: 'false',
    position: type === 'success' ? 'topRight' : 'bottomCenter',
    width: 400,
    transitionIn: 'fadeInDown',
    transitionOut: 'fadeOutUp',
  });
}

export { removeScroll, addScroll, showToast };
