 
const modal = document.querySelector('.modal');
const openBtns = document.querySelectorAll('.open-modal');
const closeBtns = document.createElement('button');
const closeBtn = document.querySelector('.modal .close-modal');
 openBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const category = btn.closest('.category')?.dataset.category || "Default";
    const categoryTitle = modal.querySelector('.title');
    categoryTitle.textContent = category;

    modal.classList.remove('hidden');
  });
});

closeBtn.addEventListener('click', () => {
  modal.classList.add('hidden');
});

modal.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.classList.add('hidden');
  }
});
const form = modal.querySelector('form'); 
form.addEventListener('submit', (e) => {
  e.preventDefault();

  const name = form.elements.name.value.trim();
  const email = form.elements.email.value.trim();
  const message = form.elements.message.value.trim();

  if (!name || !email || !message) {
    alert('Please fill in all fields');
    return;
  }
  console.log('Form data:', { name, email, message });

  alert('Your message has been sent!');

  form.reset();
  modal.classList.add('hidden'); 
});