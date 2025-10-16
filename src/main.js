import './js/animation';
import './js/header';
import './js/hero';
import './js/books';
import './js/feedbacks';
import './js/events';
import './js/contact-modal';
import './js/modal-window-books';

const scrollTopBtn = document.getElementById('scrollTopBtn');

window.addEventListener('scroll', () => {
  if (window.scrollY > 300) {
    scrollTopBtn.classList.add('show');
  } else {
    scrollTopBtn.classList.remove('show');
  }
});

scrollTopBtn.addEventListener('click', () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
});
