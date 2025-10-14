import { addScroll, removeScroll } from './contact-modal';
const modalWindow = document.querySelector('.mobile-menu');
const openModalBtn = document.querySelector('.btn-burger');
const closeModalBtn = document.querySelector('.close-header-btn');
const navLinks = Array.from(document.querySelectorAll('.mobile-nav-link'));

const toggleModal = () => modalWindow.classList.toggle('is-open');

openModalBtn.addEventListener('click', () => {
  removeScroll();
  toggleModal();
});

closeModalBtn.addEventListener('click', () => {
  addScroll();
  toggleModal();
});

navLinks.forEach(link => {
  link.addEventListener('click', () => {
    addScroll();
    toggleModal();
  });
});
