const slides = Array.from(document.querySelectorAll('.hero-item'));
const textEl = document.getElementById('hero-text');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');

let index = slides.findIndex(el => el.classList.contains('active'));
if (index === -1) index = 0;

function updateNavState() {
  const atStart = index === 0;
  const atEnd = index === slides.length - 1;

  prevBtn.toggleAttribute('disabled', atStart);
  prevBtn.setAttribute('aria-disabled', String(atStart));

  nextBtn.toggleAttribute('disabled', atEnd);
  nextBtn.setAttribute('aria-disabled', String(atEnd));
}

function showSlide(i) {
  if (i < 0 || i >= slides.length) return;
  slides[index].classList.remove('active');
  slides[i].classList.add('active');
  index = i;
  textEl.textContent = slides[i].dataset.text || '';
  updateNavState();
}

prevBtn.addEventListener('click', () => {
  if (index > 0) showSlide(index - 1);
});
nextBtn.addEventListener('click', () => {
  if (index < slides.length - 1) showSlide(index + 1);
});

// клавиатура (Enter / Space)
function clickOnKey(e, el) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    el.click();
  }
}
prevBtn.addEventListener('keydown', (e) => clickOnKey(e, prevBtn));
nextBtn.addEventListener('keydown', (e) => clickOnKey(e, nextBtn));

showSlide(index);
