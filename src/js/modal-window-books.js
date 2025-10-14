(() => {
  const API_BASE = 'https://books-backend.p.goit.global';

  // --- helpers ---
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));
  const escapeHtml = (s = '') =>
    String(s)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');

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

  async function fetchJson(url) {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) {
      const txt = await res.text().catch(() => null);
      throw new Error(txt || `${res.status} ${res.statusText}`);
    }
    return res.json();
  }

  // --- DOM refs (based on your HTML) ---
  const backdrop = $('#modal-backdrop');
  const modal = $('#modal');
  const modalClose = $('#modal-close');
  const cover = $('#modal-cover');
  const titleEl = $('#modal-title');
  const authorEl = $('#modal-author');
  const priceEl = $('#modal-price');
  const qtyInput = $('#quantity');
  const btnInc = $('#increase');
  const btnDec = $('#decrease');
  const btnAddToCart = $('#add-to-cart');
  const form = $('#modal-form');
  const accordionContainer = document.querySelector('.accordion-container');

  // state
  let currentBook = null;
  let lastActive = null;
  let focusable = [];
  let focusTrapHandler = null;

  // ensure backdrop initially hidden
//   if (backdrop) {
//     backdrop.classList.add('hidden');
//     backdrop.setAttribute('aria-hidden', 'true');
//   }

  // --- delegation for Learn More buttons (supports both .learn-more and .learn-more-btn) ---
  document.body.addEventListener('click', (e) => {
    const btn = e.target.closest('.learn-more, .learn-more-btn');
    if (!btn) return;
    const id =
      btn.dataset.bookId ||
      btn.dataset.id ||
      btn.getAttribute('data-book-id') ||
      btn.getAttribute('data-id');
    if (!id) {
      alert('ID книги не задано (data-book-id або data-id).');
      return;
    }
    openModal(id);
  });

  // --- open modal ---
  async function openModal(bookId) {
    if (!backdrop || !modal) {
      console.warn('Modal DOM elements not found.');
      return;
    }

    lastActive = document.activeElement;

    // show backdrop, block scroll
    backdrop.classList.remove('hidden');
    backdrop.setAttribute('aria-hidden', 'false');
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    // loading placeholders
    if (titleEl) titleEl.textContent = 'Завантаження...';
    if (authorEl) authorEl.textContent = '';
    if (priceEl) priceEl.textContent = '';
    if (cover) cover.src = '/assets/fallback.jpg';
    // clear panels
    if (accordionContainer) {
      const panels = accordionContainer.querySelectorAll('.ac-panel');
      panels.forEach((p) => (p.innerHTML = ''));
    }

    try {
      const data = await fetchJson(`${API_BASE}/books/${encodeURIComponent(bookId)}`);
      currentBook = data;
      populateModal(data);
      setInitialFocus();
      enableFocusTrap();
    } catch (err) {
      console.error('Error fetching book:', err);
      alert('Не вдалося завантажити інформацію про книгу.');
      closeModal();
    }
  }

  // --- populate modal with book data ---
  function populateModal(data) {
    const title = data.title || data.name || data.bookTitle || '';
    const authors =
      data.authors ||
      data.author ||
      (Array.isArray(data.authorsList) ? data.authorsList.join(', ') : '');
    const price =
      data.price !== undefined && data.price !== null
        ? data.price
        : data.list_price || data.priceText || '';
    const img =
      data.image ||
      data.cover ||
      (Array.isArray(data.images) ? data.images[0] : data.imageUrl) ||
      '/assets/fallback.jpg';

    if (cover) {
      cover.src = img;
      cover.alt = title || 'book cover';
    }
    if (titleEl) titleEl.textContent = title || 'Без назви';
    if (authorEl) authorEl.textContent = authors || '';
    if (priceEl) priceEl.textContent = typeof price === 'number' ? `$${price}` : price || '';

    if (qtyInput) qtyInput.value = 1;

    // fill accordion panels (Details / Shipping / Returns)
    const details = data.details || data.description || data.summary || data.about || '';
    const shipping = data.shipping || data.shipping_info || data.delivery || '';
    const returns = data.returns || data.returnPolicy || data.refundPolicy || '';

    if (accordionContainer) {
      const panels = accordionContainer.querySelectorAll('.ac-panel');
      if (panels.length >= 3) {
        panels[0].innerHTML = `<p class="ac-text">${escapeHtml(details)}</p>`;
        panels[1].innerHTML = `<p class="ac-text">${escapeHtml(shipping)}</p>`;
        panels[2].innerHTML = `<p class="ac-text">${escapeHtml(returns)}</p>`;
      } else {
        // fallback: recreate container with three panels
        accordionContainer.innerHTML = `
          <div class="ac"><div class="ac-panel"><p class="ac-text">${escapeHtml(details)}</p></div></div>
          <div class="ac"><div class="ac-panel"><p class="ac-text">${escapeHtml(shipping)}</p></div></div>
          <div class="ac"><div class="ac-panel"><p class="ac-text">${escapeHtml(returns)}</p></div></div>
        `;
      }
      // init accordion UI (multiple open allowed, panels closed by default)
      initAccordionUI_MultiOpen();
    }
  }

  // --- close modal ---
  function closeModal() {
    // release focus trap, restore scrolling, hide backdrop
    releaseFocusTrap();
    if (backdrop) {
      backdrop.classList.add('hidden');
      backdrop.setAttribute('aria-hidden', 'true');
    }
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
    currentBook = null;
    // restore focus
    try {
      if (lastActive && typeof lastActive.focus === 'function') lastActive.focus();
    } catch (e) {}
  }

  // backdrop click closes only when clicking backdrop itself
  if (backdrop) {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closeModal();
    });
  }
  if (modalClose) modalClose.addEventListener('click', closeModal);

  // escape key closes
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && backdrop && !backdrop.classList.contains('hidden')) {
      closeModal();
    }
    if (e.key === 'Tab' && focusTrapHandler) {
      focusTrapHandler(e);
    }
  });

  // --- quantity controls ---
  if (btnInc) btnInc.addEventListener('click', () => {
    if (!qtyInput) return;
    qtyInput.value = Math.max(1, Number(qtyInput.value || 1) + 1);
  });
  if (btnDec) btnDec.addEventListener('click', () => {
    if (!qtyInput) return;
    qtyInput.value = Math.max(1, Number(qtyInput.value || 1) - 1);
  });
  if (qtyInput) {
    qtyInput.addEventListener('input', () => {
      const v = Number(qtyInput.value || 0);
      if (!Number.isFinite(v) || v < 1) qtyInput.value = 1;
    });
  }

  // --- Add To Cart: console.log + toast ---
  if (btnAddToCart) {
    btnAddToCart.addEventListener('click', async () => {
      const qty = qtyInput ? Math.max(1, Number(qtyInput.value || 1)) : 1;
      const id = getCurrentBookId();
        console.log("Додано до кошика ", qty, { action: 'add_to_cart', bookId: id, quantity: qty });
      showToast('Додано до кошика');
    });
  }

  // --- Buy Now: submit form -> alert & close ---
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const qty = qtyInput ? Math.max(1, Number(qtyInput.value || 1)) : 1;
      alert('Дякуємо за покупку');
      closeModal();
    });
  }

  function getCurrentBookId() {
    if (!currentBook) return null;
    return currentBook._id || currentBook.id || currentBook.bookId || null;
  }

  // --- Accordion implementation: MULTI-OPEN allowed, panels closed by default, NO animation ---
  function initAccordionUI_MultiOpen() {
    const container = document.querySelector('.accordion-container');
    if (!container) return;

    const titles = ['Details', 'Shipping', 'Returns'];
    const nodes = Array.from(container.querySelectorAll('.ac'));

    nodes.forEach((node, idx) => {
      const panel = node.querySelector('.ac-panel');

      // create header button if it doesn't exist
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

      // ensure panel id
      if (panel && !panel.id) panel.id = `ac-panel-${idx}`;

      // hide panel by default
      if (panel) {
        panel.style.display = 'none';
      }

      // attach toggle: allow multiple open, so toggle only this panel
      header.onclick = () => {
        const isOpen = header.getAttribute('aria-expanded') === 'true';
        if (isOpen) {
          // close
          header.setAttribute('aria-expanded', 'false');
          header.querySelector('.ac-chevron').textContent = '▾';
          if (panel) panel.style.display = 'none';
        } else {
          // open (do not close others)
          header.setAttribute('aria-expanded', 'true');
          header.querySelector('.ac-chevron').textContent = '▴';
          if (panel) panel.style.display = 'block';
        }
      };

      // make header keyboard accessible (Enter/Space)
      header.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          header.click();
        }
      });
    });
  }

  // --- focus trap (basic) ---
  function enableFocusTrap() {
    if (!modal) return;
    focusable = Array.from(
      modal.querySelectorAll(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      )
    ).filter((el) => el.offsetParent !== null);
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    focusTrapHandler = function (e) {
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
    try {
      (modalClose || first).focus();
    } catch (e) {}
  }

  function releaseFocusTrap() {
    focusTrapHandler = null;
    focusable = [];
  }

  function setInitialFocus() {
    try {
      (modalClose || modal).focus();
    } catch (e) {}
  }

  // expose for debugging
  window._closeBookModal = closeModal;
})();
