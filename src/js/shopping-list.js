import s from 'accordion-js';
import { removeScroll, addScroll, showToast } from './contact-modal';

const shoppingListLink = document.querySelector('#shopping-list-link');
const mobileShoppingListLink = document.querySelector('#mobile-shopping-list-link');
const shoppingListModal = document.querySelector('#shopping-list-backdrop');
const shoppingListCloseBtn = document.querySelector('#shopping-list-close');

const shoppingList = document.querySelector('#shopping-list');

const pagination = document.querySelector('.pagination');

const countCart = document.querySelector('#cart-count');
const mobileCountCart = document.querySelector('#mobile-cart-count')

const STORAGE_KEY = 'shoppingList';
const ITEMS_PER_PAGE = 4;
let currentPage = 1;

export function addToShoppingList(book) {
  const currentShoppingList =
    JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  const bookIndex = currentShoppingList.findIndex(
    item => item._id === book._id
  );
  if (bookIndex !== -1) {
    currentShoppingList[bookIndex].quantity += book.quantity;
  } else {
    currentShoppingList.push(book);
  }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentShoppingList));
    updateCartCount();
}
export function getPaginatedBooks() {
  const allBooks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  const totalPages = Math.ceil(allBooks.length / ITEMS_PER_PAGE);

  // обмеження для безпечної навігації
  if (currentPage > totalPages) currentPage = totalPages || 1;

  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const booksToRender = allBooks.slice(start, end);

  renderBooks(booksToRender);
  renderPagination(totalPages);
}

function renderBooks(books) {
  if (!books.length) {
    shoppingList.innerHTML = '<p>Ваш кошик порожній</p>';
    return;
  }

  shoppingList.innerHTML = books
    .map(
      book => `
        <li class ="shopping-list-item">
            <img src="${book.book_image}" alt="${book.title}" width="50" />
            <h4 class="books-list-title">${book.title}</h4>
            <p class="books-list-author">Author: ${book.author}</p>
            <p class="books-list-price">Price: $${book.price}</p>
            <p class="books-list-price">Quantity: ${book.quantity}</p>
            <button class="btn remove-btn" data-id="${book._id}" aria-label="Remove ${book.title}">Remove</button>
        </li>
    `
    )
    .join('');
}
function renderPagination(totalPages) {
  if (totalPages <= 1) {
    pagination.innerHTML = '';
    return;
  }

  // Prev кнопка
  const prevBtn = `<button class="prev-btn" ${
    currentPage === 1 ? 'disabled' : ''
  }><svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M8.70694 12.293L4.41394 7.99997H13.9999V5.99997H4.41394L8.70694 1.70697L7.29294 0.292969L0.585938 6.99997L7.29294 13.707L8.70694 12.293Z" fill="currentColor" />
</svg></button>`;
  // Next кнопка
  const nextBtn = `<button class="next-btn" ${
    currentPage === totalPages ? 'disabled' : ''
  }><svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M5.293 12.293L6.707 13.707L13.414 6.99997L6.707 0.292969L5.293 1.70697L9.586 5.99997H0V7.99997H9.586L5.293 12.293Z" fill="currentColor" />
</svg></button>`;

  pagination.innerHTML = prevBtn + nextBtn;
}
function paginationClickHandler(event) {
  const totalPages = Math.ceil(
    (JSON.parse(localStorage.getItem(STORAGE_KEY)) || []).length /
      ITEMS_PER_PAGE
  );

  if (event.target.classList.contains('prev-btn') && currentPage > 1) {
    currentPage--;
    getPaginatedBooks();
  } else if (
    event.target.classList.contains('next-btn') &&
    currentPage < totalPages
  ) {
    currentPage++;
    getPaginatedBooks();
  }
}

function removeBookHandler(event) {
  if (!event.target.classList.contains('remove-btn')) return;

  const id = event.target.dataset.id;
  let books = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  books = books.filter(book => book._id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(books));

  getPaginatedBooks();
  updateCartCount();
}
function paginationButtonHandler(event) {
  if (event.target.classList.contains('page-btn')) {
    currentPage = Number(event.target.dataset.page);
    getPaginatedBooks();
  } else if (event.target.classList.contains('prev-btn') && currentPage > 1) {
    currentPage--;
    getPaginatedBooks();
  } else if (
    event.target.classList.contains('next-btn') &&
    currentPage < totalPages
  ) {
    currentPage++;
    getPaginatedBooks();
  }
}
function showShoppingList(event) {
  event.preventDefault();
  if (!shoppingListModal.classList.contains('is-open')) {
    shoppingListModal.classList.add('is-open');
    removeScroll();
  }
}
function closeShoppingList() {
  if (shoppingListModal.classList.contains('is-open')) {
    shoppingListModal.classList.remove('is-open');
    addScroll();
  }
}

export function updateCartCount() {
  const books = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  const total = books.reduce((sum, book) => sum + (book.quantity || 1), 0);

    if (countCart) countCart.textContent = total;
    if (mobileCountCart) mobileCountCart.textContent = total;
}

function shoppingListCountHandler(event) {
 const id = event.target.closest('.book-item')?.dataset.id;
  if (!id) return;

  let books = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

  if (event.target.classList.contains('increase-btn')) {
    const index = books.findIndex(b => b._id === id);
    books[index].quantity += 1;
  }

  if (event.target.classList.contains('decrease-btn')) {
    const index = books.findIndex(b => b._id === id);
    if (books[index].quantity > 1) {
      books[index].quantity -= 1;
    } else {
      books = books.filter(b => b._id !== id);
    }
  }

  if (event.target.classList.contains('remove-btn')) {
    books = books.filter(b => b._id !== id);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
  getPaginatedBooks();
  updateCartCount();
}

shoppingListLink.addEventListener('click', showShoppingList);
mobileShoppingListLink.addEventListener('click', showShoppingList);
shoppingListCloseBtn.addEventListener('click', closeShoppingList);
pagination.addEventListener('click', paginationClickHandler);
shoppingList.addEventListener('click', removeBookHandler);
pagination.addEventListener('click', paginationButtonHandler);
shoppingList.addEventListener('click', shoppingListCountHandler);
document.addEventListener('DOMContentLoaded', () => {
    getPaginatedBooks();
    updateCartCount();

});

