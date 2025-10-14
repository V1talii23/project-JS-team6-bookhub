const slides = document.querySelectorAll('.slide');
const prevBtn = document.querySelector('.hero-swiper-btn-prev');
const nextBtn = document.querySelector('.hero-swiper-btn-next');

let current = 0;

function showSlide(index) {
  console.log('Показываем слайд:', index);
  slides.forEach((slide, i) => {
    slide.classList.remove('active');
    slide.setAttribute('aria-hidden', 'true');
    if (i === index) {
      slide.classList.add('active');
      slide.setAttribute('aria-hidden', 'false');
      console.log('Активирован слайд:', i, slide.className);
    }
  });
}

function updateButtons() {
  if (!prevBtn || !nextBtn) return;

  prevBtn.disabled = current === 0;
  prevBtn.classList.toggle('arrow--disabled', current === 0);

  nextBtn.disabled = current === slides.length - 1;
  nextBtn.classList.toggle('arrow--disabled', current === slides.length - 1);
}

function flashButton(button) {
  if (button.disabled) return; 
  button.classList.add('is-active');
  button.blur();
  setTimeout(() => {
    button.classList.remove('is-active');
  }, 100);
}

if (slides.length > 0 && prevBtn && nextBtn) {
  showSlide(current);
  updateButtons();

  prevBtn.addEventListener('click', () => {
    if (current > 0) {
      current = current - 1;
      showSlide(current);
      updateButtons();
      flashButton(prevBtn);
    }
  });

  nextBtn.addEventListener('click', () => {
    if (current < slides.length - 1) {
      current = current + 1;
      showSlide(current);
      updateButtons();
      flashButton(nextBtn);
    }
  });
}