const API_BASE = 'http://localhost:5000/api';
let currentCategory = '';
let currentSort = '';
let searchTerm = '';
let user = JSON.parse(localStorage.getItem('km_user') || 'null');

function showToast(msg, time = 2500) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), time);
}

function setSession(u) {
  console.log('setSession called with', u);
  user = u;
  if (u) localStorage.setItem('km_user', JSON.stringify(u));
  else localStorage.removeItem('km_user');
  updateAuthUI();
}

function updateAuthUI() {
  const ug = document.getElementById('userGreeting');
  const loginBtn = document.getElementById('loginNavBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  console.log('updateAuthUI called, user:', user);
  if (!ug || !loginBtn || !logoutBtn) return;
  if (user) {
    ug.textContent = `Namaste, ${user.name}`;
    ug.classList.remove('hidden');
    loginBtn.classList.add('hidden');
    logoutBtn.classList.remove('hidden');
    console.log('UI updated for logged in user');
  } else {
    ug.classList.add('hidden');
    loginBtn.classList.remove('hidden');
    logoutBtn.classList.add('hidden');
    console.log('UI updated for logged out user');
  }
}

function updateCartCount() {
  const el = document.getElementById('cartCount');
  if (!el) return;
  if (!user) {
    console.log('updateCartCount: no user, setting count to 0');
    el.textContent = '0';
    return;
  }
  console.log('updateCartCount: fetching cart for', user.mobile);
  fetchJSON(`${API_BASE}/cart?mobile=${encodeURIComponent(user.mobile)}`)
    .then(data => {
      const count = (data.count || (data.items||[]).length || 0);
      console.log('updateCartCount: got data', data, 'setting count to', count);
      el.textContent = count;
    })
    .catch(err => {
      console.error('updateCartCount: fetch failed', err);
      el.textContent = '0';
    });
}

async function fetchJSON(url, opts = {}) {
  try {
    const res = await fetch(url, opts);
    const txt = await res.text();
    let data = {};
    try {
      data = txt ? JSON.parse(txt) : {};
    } catch (parseErr) {
      console.error('fetchJSON parse error', { url, text: txt, parseErr });
    }
    if (!res.ok) {
      console.error('API error response', { url, status: res.status, statusText: res.statusText, body: txt, parsed: data });
      throw new Error((data && data.error) || res.statusText || `HTTP ${res.status}`);
    }
    console.log('API success response', { url, status: res.status, data });
    return data;
  } catch (err) {
    console.error('fetchJSON network/error', { url, err });
    throw err;
  }
}

async function loadProducts() {
  const grid = document.getElementById('productsGrid');
  const loading = document.getElementById('productsLoading');
  if (!grid) return;
  grid.innerHTML = '';
  loading && (loading.style.display = 'grid');

  const params = new URLSearchParams();
  if (searchTerm) params.set('search', searchTerm);
  if (currentCategory) params.set('category', currentCategory);
  if (currentSort) params.set('sort', currentSort);

  try {
    const data = await fetchJSON(`${API_BASE}/products?${params.toString()}`);
    renderProducts(data.products || []);
  } catch (err) {
    showToast('Product load failed: ' + err.message);
  } finally {
    loading && (loading.style.display = 'none');
  }
}

function renderProducts(products) {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;
  if (!products.length) {
    grid.innerHTML = '<div style="padding:20px">Koi product nahi mila.</div>';
    return;
  }
  grid.innerHTML = products.map(p => {
    return `
      <div class="product-card">
        <div class="p-img"></div>
        <h3 class="p-name">${escapeHtml(p.name)}</h3>
        <div class="p-desc">${escapeHtml(p.description || '')}</div>
        <div class="p-meta">₹${p.price} • ⭐ ${p.rating || '-'}</div>
        <div class="p-actions">
          <button onclick="addToCart(${p.id},1)">Add</button>
          <button onclick="openProduct(${p.id})">View</button>
        </div>
      </div>
    `;
  }).join('');
}

function escapeHtml(s) {
  return String(s || '').replace(/[&<>\"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":"&#39;"})[c]);
}

let debounceTimer = null;
function debounceSearch() {
  const input = document.getElementById('searchInput');
  searchTerm = input ? input.value.trim() : '';
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(loadProducts, 350);
}

function setCat(cat, btnEl) {
  currentCategory = cat || '';
  const all = document.querySelectorAll('.cat-btn');
  all.forEach(b => b.classList.remove('active'));
  btnEl && btnEl.classList.add('active');
  loadProducts();
}

function setSort(value) {
  currentSort = value || '';
  loadProducts();
}

function openPanel(name) {
  console.log('openPanel called with', name);
  const id = `${name}Overlay`;
  const el = document.getElementById(id);
  console.log('Element found:', el);
  if (el) {
    el.classList.add('show');
    console.log('Added show class to', id);
  } else {
    console.error('Element not found:', id);
  }
}

function closePanel(name) {
  const id = `${name}Overlay`;
  const el = document.getElementById(id);
  el && el.classList.remove('show');
}

function closeOnBg(e, name) {
  if (e.target.id === `${name}Overlay`) closePanel(name);
}

// Auth
async function doLogin() {
  const mobile = document.getElementById('l_mobile').value.trim();
  const password = document.getElementById('l_password').value;
  const loginBtn = document.getElementById('loginBtn');
  console.log('doLogin called', { mobile, password: password ? '***' : '' });
  if (!mobile || !password) {
    console.log('Missing mobile or password');
    return showToast('Mobile aur password chahiye');
  }
  if (loginBtn) loginBtn.disabled = true;
  try {
    console.log('Making login API call');
    const data = await fetchJSON(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ mobile, password })
    });
    console.log('Login API response:', data);
    setSession(data.user);
    updateCartCount(); // Update cart count after login
    showToast('Login successful');
    closePanel('login');
    // Clear form
    document.getElementById('l_mobile').value = '';
    document.getElementById('l_password').value = '';
  } catch (err) {
    console.error('Login failed:', err);
    showToast(err.message);
  } finally {
    if (loginBtn) loginBtn.disabled = false;
  }
}

async function doSignup() {
  const name = document.getElementById('s_name').value.trim();
  const mobile = document.getElementById('s_mobile').value.trim();
  const password = document.getElementById('s_password').value;
  const signupBtn = document.getElementById('signupBtn');
  console.log('doSignup called', { name, mobile, password: password ? '***' : '' });
  if (!name || !mobile || !password) {
    console.log('Missing required fields');
    return showToast('Name, mobile aur password chahiye');
  }
  if (signupBtn) signupBtn.disabled = true;
  try {
    console.log('Making signup API call');
    const data = await fetchJSON(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({
        name, mobile, password,
        village: document.getElementById('s_village').value,
        state: document.getElementById('s_state').value,
        pincode: document.getElementById('s_pincode').value,
        land: Number(document.getElementById('s_land').value || 0)
      })
    });
    console.log('Signup API response:', data);
    setSession(data.user);
    updateCartCount(); // Update cart count after signup
    showToast('Signup successful');
    closePanel('login');
    // Clear form
    document.getElementById('s_name').value = '';
    document.getElementById('s_mobile').value = '';
    document.getElementById('s_password').value = '';
    document.getElementById('s_village').value = '';
    document.getElementById('s_state').value = '';
    document.getElementById('s_pincode').value = '';
    document.getElementById('s_land').value = '';
  } catch (err) {
    console.error('Signup failed:', err);
    showToast(err.message);
  } finally {
    if (signupBtn) signupBtn.disabled = false;
  }
}

function logout() {
  setSession(null);
  showToast('Logged out');
}

// Cart
async function openCart() {
  if (!user) return openPanel('login');
  await loadCart(user.mobile);
  openPanel('cart');
}

async function loadCart(mobile) {
  const itemsEl = document.getElementById('cartItems');
  const foot = document.getElementById('cartFooter');
  itemsEl && (itemsEl.innerHTML = 'Loading...');
  try {
    const data = await fetchJSON(`${API_BASE}/cart?mobile=${encodeURIComponent(mobile)}`);
    const items = data.items || [];
    if (!items.length) itemsEl.innerHTML = '<div style="padding:12px">Cart khaali hai</div>';
    else {
      itemsEl.innerHTML = items.map(it => {
        return `<div class="cart-row">
          <div class="cart-name">${escapeHtml(it.product?.name || 'Unknown')}</div>
          <div class="cart-qty">
            <button onclick="updateCart('${it.cartItemId}', -1)">-</button>
            <span>${it.quantity}</span>
            <button onclick="updateCart('${it.cartItemId}', 1)">+</button>
          </div>
          <div class="cart-price">₹${(it.product?.price||0) * it.quantity}</div>
          <div><button onclick="removeCart('${it.cartItemId}')">Remove</button></div>
        </div>`;
      }).join('');
    }
    foot && (foot.innerHTML = `<div class="cart-total">Total: ₹${data.total || 0}</div>
      <div style="margin-top:8px"><button onclick="openPanel('checkout')">Checkout</button></div>`);
  } catch (err) {
    showToast('Cart load failed: ' + err.message);
    itemsEl && (itemsEl.innerHTML = '');
    foot && (foot.innerHTML = '');
  }
}

async function addToCart(productId, qty = 1) {
  console.log('addToCart called', { productId, qty, user: user ? user.mobile : 'not logged in' });
  if (!user) {
    console.log('User not logged in, opening login panel');
    return openPanel('login');
  }
  try {
    console.log('Making API call to add to cart');
    const result = await fetchJSON(`${API_BASE}/cart`, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ mobile: user.mobile, productId, quantity: qty })
    });
    console.log('Add to cart API response:', result);
    showToast('Cart updated');
    updateCartCount();
    // Open cart panel to show the added item
    openCart();
  } catch (err) {
    console.error('Add to cart failed:', err);
    showToast('Add to cart failed: ' + err.message);
  }
}

async function updateCart(cartItemId, delta) {
  if (!user) return openPanel('login');
  try {
    const data = await fetchJSON(`${API_BASE}/cart?mobile=${encodeURIComponent(user.mobile)}`);
    const item = (data.items || []).find(i => i.cartItemId === cartItemId);
    if (!item) return showToast('Item not found in cart');
    const newQty = Math.max(0, item.quantity + delta);
    await fetchJSON(`${API_BASE}/cart`, {
      method: 'PUT',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ mobile: user.mobile, cartItemId, quantity: newQty })
    });
    await loadCart(user.mobile);
    updateCartCount();
  } catch (err) {
    showToast('Update failed: ' + err.message);
  }
}

async function removeCart(cartItemId) {
  if (!user) return openPanel('login');
  try {
    await fetchJSON(`${API_BASE}/cart/${encodeURIComponent(cartItemId)}?mobile=${encodeURIComponent(user.mobile)}`, { method: 'DELETE' });
    await loadCart(user.mobile);
    updateCartCount();
  } catch (err) {
    showToast('Remove failed: ' + err.message);
  }
}

// UI helpers referenced in HTML
function selectPay(el, method) {
  document.querySelectorAll('.pay-opt').forEach(p => p.classList.remove('selected'));
  if (el) el.classList.add('selected');
  if (el) el.setAttribute('data-pay', method || el.getAttribute('data-pay') || 'cod');
}

function switchTab(tab, el) {
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const tabs = document.querySelectorAll('.auth-tab');
  tabs.forEach(t => t.classList.remove('active'));
  if (el) el.classList.add('active');
  if (tab === 'signup') {
    loginForm && (loginForm.style.display = 'none');
    signupForm && (signupForm.style.display = 'block');
  } else {
    loginForm && (loginForm.style.display = 'block');
    signupForm && (signupForm.style.display = 'none');
  }
}

// Checkout / Orders
async function placeOrder() {
  if (!user) return openPanel('login');
  const address = {
    village: document.getElementById('co_village').value,
    city: document.getElementById('co_city').value,
    state: document.getElementById('co_state').value,
    pincode: document.getElementById('co_pincode').value,
    mobile: document.getElementById('co_mobile').value
  };
  const paymentMethod = document.querySelector('.pay-opt.selected')?.getAttribute('data-pay') || 'cod';
  if (!address.village || !address.city || !address.pincode || !address.mobile) return showToast('Delivery details complete karo');
  try {
    const data = await fetchJSON(`${API_BASE}/orders`, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ mobile: user.mobile, address, paymentMethod })
    });
    showToast('Order placed: ' + data.orderId);
    closePanel('checkout');
  } catch (err) {
    showToast('Order failed: ' + err.message);
  }
}

// Tracking
async function trackOrder() {
  const id = document.getElementById('trackInput').value.trim();
  console.log('Tracking ID:', id);
  if (!id) return showToast('Order ID daalo');
  try {
    const data = await fetchJSON(`${API_BASE}/track/${encodeURIComponent(id)}`);
    const out = document.getElementById('trackResult');
    if (out) out.innerHTML = `<div>Order ${data.orderId} — ${data.status}</div><pre>${JSON.stringify(data.timeline, null, 2)}</pre>`;
  } catch (err) {
    showToast('Track failed: ' + err.message);
  }
}

document.addEventListener('click', (e) => {
  if (e.target.closest('.pay-opt')) {
    document.querySelectorAll('.pay-opt').forEach(p => p.classList.remove('selected'));
    const el = e.target.closest('.pay-opt');
    el.classList.add('selected');
    el.setAttribute('data-pay', el.getAttribute('data-pay') || 'cod');
  }
});

function openProduct(id) {
  showToast('Open product ' + id);
}

updateAuthUI();
loadProducts();
updateCartCount();
