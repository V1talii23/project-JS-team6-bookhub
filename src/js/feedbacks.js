import Swiper from 'swiper';
import { Navigation, Pagination, Keyboard, A11y } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const feedbacksSwiper = new Swiper('.feedbacks-slider', {
  modules: [Navigation, Pagination, Keyboard, A11y],

  slidesPerView: 1,
  spaceBetween: 24,
  loop: false,

  navigation: {
    nextEl: '.feedbacks-swiper-btn-next',
    prevEl: '.feedbacks-swiper-btn-prev',
    disabledClass: 'arrow--disabled',
  },

  pagination: {
    el: '.feedbacks-swiper-pagination',
    clickable: true,
  },

  keyboard: {
    enabled: true,
    onlyInViewport: true,
  },

  a11y: {
    enabled: true,
    prevSlideMessage: 'Попередній відгук',
    nextSlideMessage: 'Наступний відгук',
  },

  breakpoints: {
    768: { slidesPerView: 2 },
    1440: { slidesPerView: 3 },
  },
});

function updateButtons() {
  const prevBtn = document.querySelector('.feedbacks-swiper-btn-prev');
  const nextBtn = document.querySelector('.feedbacks-swiper-btn-next');

  prevBtn.disabled = feedbacksSwiper.isBeginning;
  nextBtn.disabled = feedbacksSwiper.isEnd;

  prevBtn.classList.toggle('arrow--disabled', feedbacksSwiper.isBeginning);
  nextBtn.classList.toggle('arrow--disabled', feedbacksSwiper.isEnd);
}

updateButtons();

feedbacksSwiper.on('slideChange', updateButtons);
