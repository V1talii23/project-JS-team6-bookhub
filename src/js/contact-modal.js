const modal = document.querySelector('.modal');
const openBtn = document.querySelector('.open-modal');

const closeBtn = document.createElement('button');
closeBtn.textContent = '×';
closeBtn.classList.add('close-modal');
modal.querySelector('.contact-container').prepend(closeBtn);

openBtn.addEventListener('click', () => {
  modal.classList.remove('hidden');
});

closeBtn.addEventListener('click', () => {
  modal.classList.add('hidden');
});


modal.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.classList.add('hidden');
  }
});
