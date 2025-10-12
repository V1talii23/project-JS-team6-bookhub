import axios from 'axios';

axios.defaults.baseURL = 'https://books-backend.p.goit.global';

const booksListContainer = document.querySelector('.books-list');
const booksShowCounter = document.querySelector('.books-show-counter');
const categoriesContainer = document.querySelector('#categories-container');
const showMoreBtn = document.querySelector('#page-next');
const mobileBooksLimit = 10;
const desktopBooksLimit = 24;
const booksPerPage = 4;

let page = 0;
let books = [];
let categories = [];
let currentDevice = getDeviceType();

async function getBooksCategoryList() {
  try {
    const response = await axios.get('/books/category-list');
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.log(error.message);
  }
}

async function getTopBooks() {
  try {
    const response = await axios.get('/books/top-books');
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.log(error.message);
  }
}

async function getBooksByCategory(category) {
  try {
    const response = await axios.get(
      `/books/category/?category=${encodeURIComponent(category)}`
    );
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.log(error.response.data.message || error.message);
  }
}

// Test id: '65fc3c9da957e5c1ae05b741'
async function getBooksById(id) {
  try {
    const response = await axios.get(`/books/${id}`);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.log(error.message);
  }
}

function getDeviceType() {
  const width = window.innerWidth;

  if (width < 768) {
    return 'mobile';
  } else if (width >= 768 && width < 1440) {
    return 'tablet';
  } else {
    return 'desktop';
  }
}

function renderSelectCategoriesMarkup(arr) {
  const defaultOption = `<option value="" disabled selected>Categories</option>`;
  const allOption = `<option value="All categories">All categories</option>`;
  const markup = arr
    .map(({ list_name }) => {
      if (list_name !== '') {
        return `<option value="${list_name}">${list_name}</option>`;
      } else {
        return '';
      }
    })
    .join('');
  categoriesContainer.innerHTML = `<select name="categories" id="categories-select">${
    defaultOption + allOption + markup
  }</select>`;
}

function renderListCategoriesMarkup(arr) {
  const markup = arr
    .map(({ list_name }) => {
      if (list_name !== '') {
        return `<li class="categories-item" ><a class="category-link" data-category-name="${list_name}">${list_name}</a></li>`;
      } else {
        return '';
      }
    })
    .join('');
  categoriesContainer.innerHTML = `<ul class="categories-list">${markup}</ul>`;
}

function renderBooksListMarkup(books) {
  booksListContainer.innerHTML = books
    .map(
      ({ _id, book_image, title, author, price }) => `
        <li class="books-item" data-id=${_id}>
          <img class="books-image" src="${book_image}" alt="${title}" />
          <p class="books-title">${title}</p>
          <p class="books-author">${author}</p>
          <p class="books-price">$${price}</p>
          <button class="books-btn" data-id=${_id} type="button">Learn More</button>
        </li>
      `
    )
    .join('');
}

function renderView() {
  displayBookPage();
  displayCategoriesByDevice();
}

function reRenderView() {
  const newDevice = getDeviceType();
  if (newDevice !== currentDevice) {
    currentDevice = newDevice;
    renderView(currentDevice);
  }
}

function renderShowCounter(current, total) {
  booksShowCounter.innerHTML = `Showing ${current} of ${total}`;
}

async function displayCategories() {
  try {
    categories = await getBooksCategoryList();
    displayCategoriesByDevice();
  } catch (error) {
    console.log(error.message);
  }
}

function displayCategoriesByDevice() {
  getDeviceType() === 'desktop'
    ? renderListCategoriesMarkup(categories)
    : renderSelectCategoriesMarkup(categories);
}

async function displayBooksByCategory(category) {
  try {
    books = await getBooksByCategory(category);
    page = 0;
    displayBookPage();
  } catch (error) {}
}

async function displayTopBooks() {
  try {
    const response = await getTopBooks();
    books = response.flatMap(element => {
      if (element.list_name !== '') {
        return element.books;
      } else {
        return [];
      }
    });
    page = 0;

    displayBookPage();
  } catch (error) {}
}

function displayBookPage() {
  const startCount =
    getDeviceType() === 'mobile' ? mobileBooksLimit : desktopBooksLimit;
  const booksOnPage = books.slice(0, startCount + page * booksPerPage);
  renderShowCounter(booksOnPage.length, books.length);
  renderBooksListMarkup(booksOnPage);
  updateButtonView(booksOnPage.length, books.length);
}

async function handleCategory(category) {
  if (category === 'All categories') {
    displayTopBooks();
  } else {
    displayBooksByCategory(category);
  }
}

async function handleCategoryChange(event) {
  if (event.target.id === 'categories-select') {
    handleCategory(event.target.value);
  }
}

function handleCategoryClick(event) {
  if (event.target.classList.contains('category-link')) {
    const category = event.target.dataset.categoryName;
    handleCategory(category);
  }
}

function handleShowMore() {
  page++;
  displayBookPage();
}

function updateButtonView(current, total) {
  if (current < total) {
    showMoreBtn.classList.remove('visually-hidden');
  } else {
    showMoreBtn.classList.add('visually-hidden');
  }
}

function loadPage() {
  displayCategories();
  displayTopBooks();
}

loadPage();

categoriesContainer.addEventListener('change', handleCategoryChange);
showMoreBtn.addEventListener('click', handleShowMore);
categoriesContainer.addEventListener('click', handleCategoryClick);
window.addEventListener('resize', reRenderView);
