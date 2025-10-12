const modalWindow = document.querySelector('.mobile-menu');
const openModalBtn = document.querySelector('.btn-burger');
const closeModalBtn = document.querySelector('.close-btn');
const navLinks = Array.from(document.querySelectorAll('.mobile-nav-link'));
const scroll = document.body.style;

const toggleModal = () => modalWindow.classList.toggle('is-open');

openModalBtn.addEventListener('click', () => {
  scroll.overflow = 'hidden';
  toggleModal();
});

closeModalBtn.addEventListener('click', () => {
  scroll.overflow = 'auto';
  toggleModal();
});

navLinks.forEach(link => {
  link.addEventListener('click', () => {
    scroll.overflow = 'auto';
    toggleModal();
  });
});
