// Функція для анімації появи блоків .section
document.addEventListener("DOMContentLoaded", () => {
  const delayTimeMs = 200;
  // Створюємо екземпляр IntersectionObserver який визначатиме чи видно дану секцію
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          // Додаємо затримку показу для кожного блоку аби вони зʼявлялись один за одним
          setTimeout(() => entry.target.classList.add("visible"), index * delayTimeMs);

          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );
  // Додаємо усі секції до екземпляра IntersectionObserver створеного вище
  document.querySelectorAll(".section").forEach((section) => observer.observe(section));
});