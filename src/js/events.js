import Swiper from 'swiper';
import { Navigation, Pagination, Keyboard, A11y } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const eventsSwiper = new Swiper('.events-swiper', {
  modules: [Navigation, Pagination, Keyboard, A11y],

  slidesPerView: 1,
  spaceBetween: 16,
  loop: false,

  navigation: {
    nextEl: '.events-swiper-btn-next',
    prevEl: '.events-swiper-btn-prev',
    disabledClass: 'arrow--disabled',
  },

  pagination: {
    el: '.events-swiper-pagination',
    clickable: true,
  },

  keyboard: {
    enabled: true,
    onlyInViewport: true,
  },

  a11y: {
    enabled: true,
    prevSlideMessage: 'Попередні події',
    nextSlideMessage: 'Наступні події',
  },

  breakpoints: {
    768: { slidesPerView: 2 },
    1440: { slidesPerView: 3 },
  },
});


function updateButtons() {
  const prevBtn = document.querySelector('.events-swiper-btn-prev');
  const nextBtn = document.querySelector('.events-swiper-btn-next');

  if (!prevBtn || !nextBtn) return;

  prevBtn.disabled = eventsSwiper.isBeginning;
  nextBtn.disabled = eventsSwiper.isEnd;

  prevBtn.classList.toggle('arrow--disabled', eventsSwiper.isBeginning);
  nextBtn.classList.toggle('arrow--disabled', eventsSwiper.isEnd);
}


eventsSwiper.on('init', updateButtons);

eventsSwiper.on('slideChange', updateButtons);


updateButtons();
