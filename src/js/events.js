const slides = document.querySelectorAll('.section-events-list li');
const nextBtn = document.querySelector('.btn--arrow.next');
const prevBtn = document.querySelector('.btn--arrow.prev');
const pagination = document.querySelector('.pagination');

let slidesPerView;
let currentIndex = 0;

function setSlidesPerView() {
  if (window.innerWidth >= 1440) {
    slidesPerView = 3;
  } else if (window.innerWidth >= 768) {
    slidesPerView = 2;
  } else {
    slidesPerView = 1;
  }
}

function createPagination() {
  pagination.innerHTML = '';
  const pages = Math.ceil(slides.length / slidesPerView);
  for (let i = 0; i < pages; i++) {
    const li = document.createElement('li');
    if (i === Math.floor(currentIndex / slidesPerView))
      li.classList.add('active');
    li.addEventListener('click', () => {
      currentIndex = i * slidesPerView;
      updateSlider();
    });
    pagination.appendChild(li);
  }
}

function updateSlider() {
  slides.forEach((slide, i) => {
    slide.style.display =
      i >= currentIndex && i < currentIndex + slidesPerView ? 'block' : 'none';
  });

  const dots = pagination.querySelectorAll('li');
  dots.forEach((dot, i) =>
    dot.classList.toggle(
      'active',
      i === Math.floor(currentIndex / slidesPerView)
    )
  );

  prevBtn.style.display = currentIndex === 0 ? 'none' : 'block';
  nextBtn.style.display =
    currentIndex + slidesPerView >= slides.length ? 'none' : 'block';
}

nextBtn.addEventListener('click', () => {
  currentIndex += slidesPerView;
  if (currentIndex >= slides.length)
    currentIndex = slides.length - slidesPerView;
  updateSlider();
});

prevBtn.addEventListener('click', () => {
  currentIndex -= slidesPerView;
  if (currentIndex < 0) currentIndex = 0;
  updateSlider();
});

window.addEventListener('resize', () => {
  const prevSlidesPerView = slidesPerView;
  setSlidesPerView();
  if (slidesPerView !== prevSlidesPerView) {
    currentIndex = 0;
    createPagination();
    updateSlider();
  }
});

setSlidesPerView();
createPagination();
updateSlider();
