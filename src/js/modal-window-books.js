//New version of js
// import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
// import axios from 'axios';
import Accordion from 'accordion-js';
import 'accordion-js/dist/accordion.min.css';
import { getBooksById } from './books';
import { removeScroll, addScroll, showToast } from './contact-modal';
import { addToShoppingList } from './shopping-list';
import s from 'accordion-js';

new Accordion('.accordion-container', {
  showMultiple: true,
});

const booksList = document.querySelector('.books-list');

const modalForm = document.querySelector('#modal-form');
const modalBackdrop = document.querySelector('#modal-backdrop');
const modal = document.querySelector('.backdrop');
const modalContainer = document.querySelector('.modal-books-container');
const modalCloseBtn = document.querySelector('#modal-close');

const modalCover = document.querySelector('#modal-cover');

const modalTitle = document.querySelector('#modal-title');
const modalAuthor = document.querySelector('#modal-author');
const modalPrice = document.querySelector('#modal-price');

const acTextDescription = document.querySelector('.ac-text-description');
const acTextShipping = document.querySelector('.ac-text-shipping');
const acTextReturns = document.querySelector('.ac-text-returns');

const btnIncrease = document.querySelector('#increase');
const btnDecrease = document.querySelector('#decrease');
const inputQuantity = document.querySelector('#quantity');
const btnAddToCart = document.querySelector('#add-to-cart');
const btnBuyNow = document.querySelector('#buy-now');

const modalLoader = document.querySelector('#modal-books-loader');

let currentBookId = null;
let currentBookImg = null;
let currentBookTitle = null;
let currentBookAuthor = null;
let currentBookPrice = null;

async function learnMoreBtnHandler(event) {
  const bookId = event.target.dataset.id;
  if (!bookId) {
    return;
  }
  // console.log(bookId);
  try {
    showModal();
    showModalLoader();
    const bookData = await getBooksById(bookId);
    // console.log(bookData);
    renderBookMarkup(bookData);
    currentBookId = bookId;
    currentBookImg = bookData.book_image;
    currentBookTitle = bookData.title;
    currentBookAuthor = bookData.author;
    currentBookPrice = bookData.price;
  } catch (error) {
  } finally {
    hideModalLoader();
  }
}

function renderBookMarkup({ book_image, title, author, price, description }) {
  // modalLeft.innerHTML = `<img id="modal-cover" src="${book_image}" alt="${title}" />`;
  modalCover.src = book_image;
  modalCover.alt = title;
  modalTitle.innerHTML = title;
  modalAuthor.innerHTML = author;
  modalPrice.innerHTML = `$${price}`;
  acTextDescription.innerHTML = description;
}

function hideModal() {
  if (modal.classList.contains('is-open')) {
    modal.classList.remove('is-open');
    addScroll();
    currentBookId = null;
  }
}

function showModal() {
  if (!modal.classList.contains('is-open')) {
    modal.classList.add('is-open');
    removeScroll();
  }
}

function keyDownHandler(event) {
  if (event.key === 'Escape') {
    hideModal();
  }
}
function btnIncreaseHandler() {
  const currentValue = Number(inputQuantity.value);
  inputQuantity.value = currentValue + 1;
  if (Number(inputQuantity.value) > 1) {
    btnDecrease.disabled = false;
  }
}

function btnDecreaseHandler() {
  const currentValue = Number(inputQuantity.value);
  if (currentValue <= 1) return;
  inputQuantity.value = currentValue - 1;
  if (Number(inputQuantity.value) <= 1) {
    btnDecrease.disabled = true;
  }
}
function addToCartHandler() {
  const quantity = Number(inputQuantity.value);
  const book = { _id: currentBookId, quantity: quantity, book_image: currentBookImg, title: currentBookTitle, author: currentBookAuthor, price: currentBookPrice };
  addToShoppingList(book);
  console.log('Додано до кошика ', book);
  showToast('info', 'Додано до кошика');
}

function buyNowHandler(event) {
  event.preventDefault();
  const quantity = Number(inputQuantity.value);
  console.log('Дякуємо за покупку ', {
    bookId: currentBookId,
    quantity: quantity,
  });
  showToast('success', 'Дякуємо за покупку');
  hideModal();
  addScroll();
  modalForm.reset();
}

function hideModalLoader() {
  if (!modalLoader.classList.contains('visually-hidden')) {
    modalLoader.classList.add('visually-hidden');
  }
}

function showModalLoader() {
  if (modalLoader.classList.contains('visually-hidden')) {
    modalLoader.classList.remove('visually-hidden');
  }
}

booksList.addEventListener('click', learnMoreBtnHandler);
modalCloseBtn.addEventListener('click', hideModal);
document.addEventListener('keydown', keyDownHandler);
modalBackdrop.addEventListener('click', hideModal);
modalContainer.addEventListener('click', event => event.stopPropagation());

btnIncrease.addEventListener('click', btnIncreaseHandler);
btnDecrease.addEventListener('click', btnDecreaseHandler);

btnAddToCart.addEventListener('click', addToCartHandler);
modalForm.addEventListener('submit', buyNowHandler);
