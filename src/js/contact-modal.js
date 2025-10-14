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

    modal.classList.remove('hidden');
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
  if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
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
    alert('Please fill in all fields');
    return;
  }
  console.log('Form data:', { name, email, message: message || '' });

  alert('Your message has been sent!');

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
  modal.classList.add('hidden');
  addScroll();
}

export { removeScroll, addScroll };
