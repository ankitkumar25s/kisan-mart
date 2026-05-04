const API_BASE = window.location.port === '5000'
  ? '/api'
  : 'http://localhost:5000/api';

let currentCategory = '';
let currentSort = '';
let searchTerm = '';
let user = JSON.parse(localStorage.getItem('km_user') || 'null');
let debounceTimer = null;
let toastTimer = null;
// Splash control: hide when window finishes loading (keeps at least 500ms)
function hideSplash(minShow = 500) {
  const splash = document.getElementById('splash');
  if (!splash) return;
  const shownAt = splash.dataset.shownAt ? Number(splash.dataset.shownAt) : Date.now();
  const wait = Math.max(0, minShow - (Date.now() - shownAt));
  setTimeout(() => {
    splash.classList.add('splash-hide');
    setTimeout(() => splash.remove(), 360);
  }, wait);
}

// mark shown time as soon as script runs (splash element exists in DOM)
document.addEventListener('DOMContentLoaded', () => {
  const splash = document.getElementById('splash');
  if (splash) splash.dataset.shownAt = Date.now();
});

window.addEventListener('load', () => hideSplash(600));

// Global error handlers to surface unexpected runtime errors
window.addEventListener('error', (evt) => {
  try {
    console.error('Unhandled error', evt.error || evt.message, evt);
    showToast('An unexpected error occurred. Check console.');
  } catch (e) {
    console.error(e);
  }
});

window.addEventListener('unhandledrejection', (evt) => {
  try {
    console.error('Unhandled promise rejection', evt.reason);
    showToast('Network or internal error occurred.');
  } catch (e) {
    console.error(e);
  }
});

function showToast(message, time = 2600) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), time);
}

function escapeHtml(value) {
  return String(value || '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[char]);
}

async function fetchJSON(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (!response.ok) {
    throw new Error(data.error || response.statusText || `HTTP ${response.status}`);
  }

  return data;
}

function setSession(nextUser) {
  user = nextUser;
  if (nextUser) {
    localStorage.setItem('km_user', JSON.stringify(nextUser));
  } else {
    localStorage.removeItem('km_user');
  }

  updateAuthUI();
  updateCartCount();
}

function updateAuthUI() {
  const greeting = document.getElementById('userGreeting');
  const loginButton = document.getElementById('loginNavBtn');
  const logoutButton = document.getElementById('logoutBtn');

  if (!greeting || !loginButton || !logoutButton) return;

  if (user) {
    greeting.textContent = `Namaste, ${user.name}`;
    greeting.classList.remove('hidden');
    loginButton.classList.add('hidden');
    logoutButton.classList.remove('hidden');
  } else {
    greeting.classList.add('hidden');
    loginButton.classList.remove('hidden');
    logoutButton.classList.add('hidden');
  }
}

function productInitial(product) {
  return (product.name || product.category || 'K').trim().charAt(0).toUpperCase();
}

function productImageMarkup(product, className = 'product-image') {
  if (!product?.imageUrl) {
    return `<div class="${className} image-fallback" aria-hidden="true">${escapeHtml(productInitial(product || {}))}</div>`;
  }

  return `<img class="${className}" src="${escapeHtml(product.imageUrl)}" alt="${escapeHtml(product.name)}" loading="lazy" onerror="this.replaceWith(createImageFallback('${escapeHtml(productInitial(product))}', '${className}'))">`;
}

function createImageFallback(text, className) {
  const fallback = document.createElement('div');
  fallback.className = `${className} image-fallback`;
  fallback.setAttribute('aria-hidden', 'true');
  fallback.textContent = text || 'K';
  return fallback;
}

async function loadProducts() {
  const grid = document.getElementById('productsGrid');
  const loading = document.getElementById('productsLoading');
  if (!grid) return;

  grid.innerHTML = '';
  if (loading) loading.style.display = 'block';

  const params = new URLSearchParams();
  if (searchTerm) params.set('search', searchTerm);
  if (currentCategory) params.set('category', currentCategory);
  if (currentSort) params.set('sort', currentSort);

  try {
    const data = await fetchJSON(`${API_BASE}/products?${params.toString()}`);
    renderProducts(data.products || []);
  } catch (error) {
    grid.innerHTML = `<div class="state-message" style="display:block">Product load failed: ${escapeHtml(error.message)}</div>`;
  } finally {
    if (loading) loading.style.display = 'none';
  }
}

function renderProducts(products) {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;

  if (!products.length) {
    grid.innerHTML = '<div class="state-message" style="display:block">No products found.</div>';
    return;
  }

  grid.innerHTML = products.map((product) => `
    <article class="product-card">
      <div class="product-visual">${productImageMarkup(product)}</div>
      <div class="product-body">
        <div class="product-title-row">
          <h3 class="product-title">${escapeHtml(product.name)}</h3>
          <span class="product-category">${escapeHtml(product.category)}</span>
        </div>
        <p class="product-desc">${escapeHtml(product.description)}</p>
        <div class="product-meta">
          <span class="price">Rs. ${Number(product.price || 0).toLocaleString('en-IN')}</span>
          <span class="rating">${escapeHtml(product.rating || '-')} rating</span>
        </div>
        <button class="primary-button full-width" type="button" onclick="addToCart(${product.id})">Add to Cart</button>
      </div>
    </article>
  `).join('');
}

function debounceSearch() {
  const input = document.getElementById('searchInput');
  searchTerm = input ? input.value.trim() : '';
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(loadProducts, 300);
}

function syncCategoryButtons(category, activeButton) {
  document.querySelectorAll('.category-tab').forEach((button) => {
    const isActive = activeButton ? button === activeButton : button.getAttribute('onclick')?.includes(`'${category}'`);
    button.classList.toggle('active', category === '' ? button.textContent.trim() === 'All' : isActive);
  });
}

function setCat(category = '', button) {
  currentCategory = category;
  const categoryFilter = document.getElementById('catFilter');
  if (categoryFilter) categoryFilter.value = category;
  syncCategoryButtons(category, button);
  loadProducts();
}

function setSort(value = '') {
  currentSort = value;
  loadProducts();
}

function openPanel(name) {
  try {
    console.log('openPanel()', name);
    const overlay = document.getElementById(`${name}Overlay`);
    if (!overlay) {
      console.warn('openPanel: overlay not found', name);
      return;
    }
    overlay.classList.add('show');
    document.body.style.overflow = 'hidden';
  } catch (e) {
    console.error('openPanel error', e);
    showToast('UI error occurred. Check console.');
  }
}

function closePanel(name) {
  try {
    console.log('closePanel()', name);
    const overlay = document.getElementById(`${name}Overlay`);
    if (!overlay) return;
    overlay.classList.remove('show');
    document.body.style.overflow = '';
  } catch (e) {
    console.error('closePanel error', e);
  }
}

function closeOnBg(event, name) {
  if (event.target.id === `${name}Overlay`) {
    closePanel(name);
  }
}

async function doLogin() {
  console.log('doLogin invoked');
  const mobile = document.getElementById('l_mobile').value.trim();
  const password = document.getElementById('l_password').value;
  const button = document.getElementById('loginBtn');

  if (!mobile || !password) {
    showToast('Mobile number and password are required.');
    return;
  }

  button.disabled = true;
  try {
    const data = await fetchJSON(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile, password })
    });
    setSession(data.user);
    closePanel('login');
    showToast('Login successful.');
  } catch (error) {
    showToast(error.message);
  } finally {
    button.disabled = false;
  }
}

async function doSignup() {
  console.log('doSignup invoked');
  const payload = {
    name: document.getElementById('s_name').value.trim(),
    mobile: document.getElementById('s_mobile').value.trim(),
    village: document.getElementById('s_village').value.trim(),
    state: document.getElementById('s_state').value.trim(),
    pincode: document.getElementById('s_pincode').value.trim(),
    land: Number(document.getElementById('s_land').value || 0),
    password: document.getElementById('s_password').value
  };
  const button = document.getElementById('signupBtn');

  if (!payload.name || !payload.mobile || !payload.password) {
    showToast('Name, mobile number, and password are required.');
    return;
  }

  button.disabled = true;
  try {
    const data = await fetchJSON(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    setSession(data.user);
    closePanel('login');
    showToast('Account created.');
  } catch (error) {
    showToast(error.message);
  } finally {
    button.disabled = false;
  }
}

function logout() {
  setSession(null);
  showToast('Logged out.');
}

async function updateCartCount() {
  const count = document.getElementById('cartCount');
  if (!count) return;

  if (!user) {
    count.textContent = '0';
    return;
  }

  try {
    const data = await fetchJSON(`${API_BASE}/cart?mobile=${encodeURIComponent(user.mobile)}`);
    count.textContent = String(data.count || (data.items || []).length || 0);
  } catch {
    count.textContent = '0';
  }
}

async function openCart() {
  console.log('openCart invoked');
  if (!user) {
    openPanel('login');
    return;
  }

  await loadCart();
  openPanel('cart');
}

async function loadCart() {
  const itemsElement = document.getElementById('cartItems');
  const footer = document.getElementById('cartFooter');
  if (!itemsElement || !footer) return;

  itemsElement.innerHTML = '<div class="state-message" style="display:block">Loading cart...</div>';
  footer.innerHTML = '';

  try {
    const data = await fetchJSON(`${API_BASE}/cart?mobile=${encodeURIComponent(user.mobile)}`);
    const items = data.items || [];

    if (!items.length) {
      itemsElement.innerHTML = '<div class="state-message" style="display:block">Your cart is empty.</div>';
      return;
    }

    itemsElement.innerHTML = items.map((item) => `
      <div class="cart-row">
        <div class="cart-image-wrap">${productImageMarkup(item.product, 'cart-image')}</div>
        <div>
          <div class="cart-name">${escapeHtml(item.product?.name || 'Unknown product')}</div>
          <div class="cart-price">Rs. ${Number((item.product?.price || 0) * item.quantity).toLocaleString('en-IN')}</div>
        </div>
        <button class="danger-button" type="button" onclick="removeCart('${escapeHtml(item.cartItemId)}')">Remove</button>
        <div class="cart-qty">
          <button type="button" onclick="updateCart('${escapeHtml(item.cartItemId)}', -1)">-</button>
          <strong>${item.quantity}</strong>
          <button type="button" onclick="updateCart('${escapeHtml(item.cartItemId)}', 1)">+</button>
        </div>
      </div>
    `).join('');

    footer.innerHTML = `
      <div class="cart-total">Total: Rs. ${Number(data.total || 0).toLocaleString('en-IN')}</div>
      <button class="primary-button full-width" type="button" onclick="openPanel('checkout')">Checkout</button>
    `;
  } catch (error) {
    itemsElement.innerHTML = `<div class="state-message" style="display:block">Cart load failed: ${escapeHtml(error.message)}</div>`;
  }
}

async function addToCart(productId, quantity = 1) {
  console.log('addToCart invoked', productId, quantity);
  if (!user) {
    openPanel('login');
    return;
  }

  try {
    await fetchJSON(`${API_BASE}/cart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile: user.mobile, productId, quantity })
    });
    showToast('Added to cart.');
    updateCartCount();
  } catch (error) {
    showToast(`Add to cart failed: ${error.message}`);
  }
}

async function updateCart(cartItemId, delta) {
  if (!user) {
    openPanel('login');
    return;
  }

  try {
    const data = await fetchJSON(`${API_BASE}/cart?mobile=${encodeURIComponent(user.mobile)}`);
    const item = (data.items || []).find((cartItem) => cartItem.cartItemId === cartItemId);
    if (!item) return;

    await fetchJSON(`${API_BASE}/cart`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mobile: user.mobile,
        cartItemId,
        quantity: Math.max(0, item.quantity + delta)
      })
    });

    await loadCart();
    updateCartCount();
  } catch (error) {
    showToast(`Cart update failed: ${error.message}`);
  }
}

async function removeCart(cartItemId) {
  if (!user) {
    openPanel('login');
    return;
  }

  try {
    await fetchJSON(`${API_BASE}/cart/${encodeURIComponent(cartItemId)}?mobile=${encodeURIComponent(user.mobile)}`, {
      method: 'DELETE'
    });
    await loadCart();
    updateCartCount();
  } catch (error) {
    showToast(`Remove failed: ${error.message}`);
  }
}

function selectPay(element) {
  document.querySelectorAll('.payment-option').forEach((option) => option.classList.remove('selected'));
  element.classList.add('selected');
}

function switchTab(tab, element) {
  document.querySelectorAll('.auth-tab').forEach((button) => button.classList.remove('active'));
  element.classList.add('active');
  document.getElementById('loginForm').classList.toggle('hidden', tab !== 'login');
  document.getElementById('signupForm').classList.toggle('hidden', tab !== 'signup');
}

async function placeOrder() {
  console.log('placeOrder invoked');
  if (!user) {
    openPanel('login');
    return;
  }

  const address = {
    village: document.getElementById('co_village').value.trim(),
    city: document.getElementById('co_city').value.trim(),
    state: document.getElementById('co_state').value.trim(),
    pincode: document.getElementById('co_pincode').value.trim(),
    mobile: document.getElementById('co_mobile').value.trim()
  };
  const selectedPayment = document.querySelector('.payment-option.selected');
  const paymentMethod = selectedPayment?.dataset.pay || 'cod';

  if (!address.village || !address.city || !address.pincode || !address.mobile) {
    showToast('Please complete delivery details.');
    return;
  }

  try {
    const data = await fetchJSON(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile: user.mobile, address, paymentMethod })
    });
    closePanel('checkout');
    closePanel('cart');
    await updateCartCount();
    showToast(`Order placed: ${data.orderId}`);
  } catch (error) {
    showToast(`Order failed: ${error.message}`);
  }
}

async function trackOrder() {
  console.log('trackOrder invoked');
  const orderId = document.getElementById('trackInput').value.trim();
  const result = document.getElementById('trackResult');

  if (!orderId) {
    showToast('Please enter an order ID.');
    return;
  }

  try {
    const data = await fetchJSON(`${API_BASE}/track/${encodeURIComponent(orderId)}`);
    result.innerHTML = `
      <div class="track-card">
        <strong>${escapeHtml(data.orderId)}</strong>
        <p>Status: ${escapeHtml(data.status)}</p>
        <pre>${escapeHtml(JSON.stringify(data.timeline || [], null, 2))}</pre>
        <div style="margin-top:12px">
          <button class="primary-button full-width" type="button" onclick="closePanel('track')">Done</button>
        </div>
      </div>
    `;
  } catch (error) {
    result.innerHTML = '';
    showToast(`Track failed: ${error.message}`);
  }
}

// Run startup tasks with safety guards so one error doesn't block the rest
try { updateAuthUI(); } catch (e) { console.error('startup:updateAuthUI', e); }
try { loadProducts(); } catch (e) { console.error('startup:loadProducts', e); }
try { updateCartCount(); } catch (e) { console.error('startup:updateCartCount', e); }
