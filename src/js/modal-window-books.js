// public/app.js (fixed)
// Direct calls to https://books-backend.p.goit.global
// Fixes: modal hidden on load, scoped accordion, image mapping (book_image etc),
// delegation scoped to .books-list, remove/add scroll calls, single-binding handlers.

import { removeScroll, addScroll } from './contact-modal';

(() => {
  const API_BASE = 'https://books-backend.p.goit.global';

  const $ = (s, ctx = document) => ctx.querySelector(s);
  const $$ = (s, ctx = document) => Array.from((ctx || document).querySelectorAll(s));
  const escapeHtml = (s = '') =>
    String(s)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');

  async function fetchJson(url) {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) {
      const txt = await res.text().catch(() => null);
      throw new Error(txt || `${res.status} ${res.statusText}`);
    }
    return res.json();
  }

  function showToast(msg, ms = 1400) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    Object.assign(t.style, {
      position: 'fixed',
      left: '50%',
      transform: 'translateX(-50%)',
      bottom: '18px',
      background: '#222',
      color: '#fff',
      padding: '8px 12px',
      borderRadius: '8px',
      zIndex: 12000,
    });
    document.body.appendChild(t);
    setTimeout(() => t.remove(), ms);
  }

  // modal root elements
  const backdrop = document.getElementById('modal-backdrop');
  const modal = document.getElementById('modal');

  // state & refs (modal-local refs will be resolved when needed)
  let currentBook = null;
  let lastActive = null;
  let focusable = [];
  let focusTrapHandler = null;

  // one-time flags to avoid duplicate bindings
  let handlersAttached = false;

  // Ensure modal hidden on load
  if (backdrop) {
    backdrop.classList.add('hidden');
    backdrop.setAttribute('aria-hidden', 'true');
  }

  // delegation target - prefer .books-list to avoid interfering with other UI
  const booksListContainer = document.querySelector('.books-list');

  function delegationHandler(e) {
    const btn = e.target.closest('.learn-more, .learn-more-btn, button.learn-more-btn, button.learn-more');
    if (!btn) return;

    // accept only if button is inside books-list OR has explicit data-id/data-book-id
    const inBooksList = booksListContainer ? booksListContainer.contains(btn) : btn.closest('.books-item') !== null;
    const id =
      btn.dataset.bookId ||
      btn.dataset.id ||
      btn.getAttribute('data-book-id') ||
      btn.getAttribute('data-id') ||
      null;

    if (!inBooksList && !id) return; // do nothing for other parts of UI

    if (!id) {
      alert('ID книги не задано (data-book-id або data-id).');
      return;
    }

    openModal(id);
  }

  if (booksListContainer) {
    booksListContainer.addEventListener('click', delegationHandler);
  } else {
    // fallback (rare), but make it defensive
    document.body.addEventListener('click', delegationHandler);
  }

  // utility: get modal-local refs
  function getModalRefs() {
    if (!modal) return {};
    return {
      modalClose: $('#modal-close', modal),
      cover: $('#modal-cover', modal),
      titleEl: $('#modal-title', modal),
      authorEl: $('#modal-author', modal),
      priceEl: $('#modal-price', modal),
      qtyInput: $('#quantity', modal),
      btnInc: $('#increase', modal),
      btnDec: $('#decrease', modal),
      btnAddToCart: $('#add-to-cart', modal),
      form: $('#modal-form', modal),
      accordionContainer: $('.accordion-container', modal),
    };
  }

  // open modal: fetch & populate
  async function openModal(bookId) {
    if (!backdrop || !modal) {
      console.warn('Modal DOM not found');
      return;
    }

    // refresh refs
    const refs = getModalRefs();
    // block scroll via imported function
    if (typeof removeScroll === 'function') removeScroll();
    else {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
    }

    lastActive = document.activeElement;

    // show backdrop and modal (backdrop contains modal)
    backdrop.classList.remove('hidden');
    backdrop.setAttribute('aria-hidden', 'false');

    // set loading placeholders
    if (refs.titleEl) refs.titleEl.textContent = 'Завантаження...';
    if (refs.authorEl) refs.authorEl.textContent = '';
    if (refs.priceEl) refs.priceEl.textContent = '';
    if (refs.cover) refs.cover.src = '/assets/fallback.jpg';

    // clear modal-local panels
    if (refs.accordionContainer) {
      const panels = refs.accordionContainer.querySelectorAll('.ac-panel');
      panels.forEach(p => (p.innerHTML = ''));
    }

    try {
      const data = await fetchJson(`${API_BASE}/books/${encodeURIComponent(bookId)}`);
      currentBook = data;
      populateModal(data);
      // attach handlers once
      attachModalHandlersOnce();
      setInitialFocus();
      enableFocusTrap();
    } catch (err) {
      console.error('Error fetching book:', err);
      alert('Не вдалося завантажити інформацію про книгу.');
      closeModal();
    }
  }

function populateModal(data) {
  const refs = getModalRefs ? getModalRefs() : {
    cover: document.querySelector('#modal-cover'),
    titleEl: document.querySelector('#modal-title'),
    authorEl: document.querySelector('#modal-author'),
    priceEl: document.querySelector('#modal-price'),
    qtyInput: document.querySelector('#quantity'),
    accordionContainer: document.querySelector('.accordion-container'),
  };

  const img = data.book_image || data.image || data.cover ||
              (Array.isArray(data.images) && data.images[0]) ||
              data.imageUrl || '/assets/fallback.jpg';

  const title = data.title || data.Title || data.bookTitle || 'Без назви';
  const author = data.author || data.contributor || data.authors || '';
  const price = data.price !== undefined && data.price !== null ? data.price : (data.list_price || data.priceText || '');
  const description = data.description || data.details || data.summary || '';

  if (refs.cover) {
    refs.cover.src = img;
    refs.cover.alt = title;
  }
  if (refs.titleEl) refs.titleEl.textContent = title;
  if (refs.authorEl) refs.authorEl.textContent = author;
  if (refs.priceEl) refs.priceEl.textContent = price ? `$${price}` : '';

  if (refs.qtyInput) refs.qtyInput.value = 1;

  const detailsText = description || 'Опис недоступний.';
  const shippingText = data.shipping || 'We ship across the United States within 2–5 business days. All orders are processed through USPS or a reliable courier service. Enjoy free standard shipping on orders over $50.';
  const returnsText = data.returns || 'You can return an item within 14 days of receiving your order, provided it hasn’t been used and is in its original condition. To start a return, please contact our support team — we’ll guide you through the process quickly and hassle-free.';

  if (refs.accordionContainer) {
    const panels = refs.accordionContainer.querySelectorAll('.ac-panel');
    if (panels.length >= 3) {
      panels[0].innerHTML = `<p class="ac-text">${escapeHtml(detailsText)}</p>`;
      panels[1].innerHTML = `<p class="ac-text">${escapeHtml(shippingText)}</p>`;
      panels[2].innerHTML = `<p class="ac-text">${escapeHtml(returnsText)}</p>`;
    } else {
      refs.accordionContainer.innerHTML = `
        <div class="ac"><div class="ac-panel"><p class="ac-text">${escapeHtml(detailsText)}</p></div></div>
        <div class="ac"><div class="ac-panel"><p class="ac-text">${escapeHtml(shippingText)}</p></div></div>
        <div class="ac"><div class="ac-panel"><p class="ac-text">${escapeHtml(returnsText)}</p></div></div>
      `;
    }

    if (typeof initAccordionUI_MultiOpen === 'function') {
      try { initAccordionUI_MultiOpen(modal); } catch (e) { console.warn('Accordion init failed', e); }
    } else {
      try { initAccordionUI_MultiOpen(modal); } catch (e) {}
    }
  }
}


  function closeModal() {
    releaseFocusTrap();
    if (backdrop) {
      backdrop.classList.add('hidden');
      backdrop.setAttribute('aria-hidden', 'true');
    }
    // restore scroll
    if (typeof addScroll === 'function') addScroll();
    else {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    }
    currentBook = null;
    try { if (lastActive && typeof lastActive.focus === 'function') lastActive.focus(); } catch (e) {}
  }

  // attach backdrop/modal close handlers (scoped)
  if (backdrop) {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closeModal();
    });
  }
  // close button via delegation (modal scoped)
  document.addEventListener('click', (e) => {
    if (e.target.closest && e.target.closest('#modal-close')) closeModal();
  });

  // escape + focus trap
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && backdrop && !backdrop.classList.contains('hidden')) closeModal();
    if (e.key === 'Tab' && focusTrapHandler) focusTrapHandler(e);
  });

  // --- attach modal handlers only once ---
  function attachModalHandlersOnce() {
    if (handlersAttached) return;
    handlersAttached = true;

    // resolve refs now
    const refs = getModalRefs();

    // quantity handlers
    if (refs.btnInc) refs.btnInc.addEventListener('click', () => {
      if (!refs.qtyInput) return;
      refs.qtyInput.value = Math.max(1, Number(refs.qtyInput.value || 1) + 1);
    });
    if (refs.btnDec) refs.btnDec.addEventListener('click', () => {
      if (!refs.qtyInput) return;
      refs.qtyInput.value = Math.max(1, Number(refs.qtyInput.value || 1) - 1);
    });
    if (refs.qtyInput) refs.qtyInput.addEventListener('input', () => {
      const v = Number(refs.qtyInput.value || 0);
      if (!Number.isFinite(v) || v < 1) refs.qtyInput.value = 1;
    });

    // add to cart
    if (refs.btnAddToCart) refs.btnAddToCart.addEventListener('click', () => {
      const refsNow = getModalRefs();
      const qty = refsNow.qtyInput ? Math.max(1, Number(refsNow.qtyInput.value || 1)) : 1;
      const id = getCurrentBookId();
      console.log('Додано до кошика', { action: 'add_to_cart', bookId: id, quantity: qty });
      showToast('Додано до кошика');
    });

    // buy now
    if (refs.form) refs.form.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Дякуємо за покупку');
      closeModal();
    });
  }

  // --- accordion: multi-open, scoped to modal -->
  function initAccordionUI_MultiOpen(scopeModal = modal) {
    if (!scopeModal) return;
    const container = scopeModal.querySelector('.accordion-container');
    if (!container) return;

    const titles = ['Details', 'Shipping', 'Returns'];
    const nodes = Array.from(container.querySelectorAll('.ac'));

    nodes.forEach((node, idx) => {
      const panel = node.querySelector('.ac-panel');

      // create header only inside this node and only if not exists
      let header = node.querySelector('.ac-header');
      if (!header) {
        header = document.createElement('button');
        header.type = 'button';
        header.className = 'ac-header';
        header.setAttribute('aria-expanded', 'false');
        header.setAttribute('aria-controls', `ac-panel-${idx}`);
        header.innerHTML = `<span class="ac-title">${titles[idx] || 'Info'}</span><span class="ac-chevron">▾</span>`;
        if (panel) node.insertBefore(header, panel);
        else node.appendChild(header);
      }

      if (panel && !panel.id) panel.id = `ac-panel-${idx}`;

      // hide panel by default
      if (panel) panel.style.display = 'none';

      // ensure no duplicate handlers
      header.onclick = () => {
        const isOpen = header.getAttribute('aria-expanded') === 'true';
        if (isOpen) {
          header.setAttribute('aria-expanded', 'false');
          const chev = header.querySelector('.ac-chevron');
          if (chev) chev.textContent = '▾';
          if (panel) panel.style.display = 'none';
        } else {
          header.setAttribute('aria-expanded', 'true');
          const chev = header.querySelector('.ac-chevron');
          if (chev) chev.textContent = '▴';
          if (panel) panel.style.display = 'block';
        }
      };

      header.onkeydown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          header.click();
        }
      };
    });
  }

  // focus trap basic
  function enableFocusTrap() {
    if (!modal) return;
    focusable = Array.from(modal.querySelectorAll('a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'))
      .filter(el => el.offsetParent !== null);
    if (focusable.length === 0) return;
    const first = focusable[0], last = focusable[focusable.length - 1];
    focusTrapHandler = function(e) {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    try { (modal.querySelector('#modal-close') || first).focus(); } catch(e) {}
  }

  function releaseFocusTrap() {
    focusTrapHandler = null;
    focusable = [];
  }

  function setInitialFocus() {
    try { (modal.querySelector('#modal-close') || modal).focus(); } catch(e) {}
  }

  function getCurrentBookId() {
    if (!currentBook) return null;
    return currentBook._id || currentBook.id || currentBook.bookId || null;
  }

  // expose for debug
  window._closeBookModal = closeModal;
})();
