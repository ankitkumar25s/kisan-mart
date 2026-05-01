const { carts, products, users, nextCartItemId } = require('../db');

function getCart(req, res) {
  const mobile = req.query.mobile;

  if (!mobile) {
    return res.status(400).json({ error: 'User mobile number is required' });
  }

  if (!users.find((user) => user.mobile === mobile)) {
    return res.status(404).json({ error: 'User not found' });
  }

  const cartItems = carts[mobile] || [];
  const items = cartItems.map((item) => {
    const product = products.find((product) => product.id === item.productId);
    return {
      cartItemId: item.cartItemId,
      productId: item.productId,
      quantity: item.quantity,
      product: product || null
    };
  });

  const total = items.reduce((sum, item) => {
    return sum + (item.product ? item.product.price * item.quantity : 0);
  }, 0);

  res.json({ items, total, count: items.length });
}

function addCartItem(req, res) {
  const { mobile, productId, quantity = 1 } = req.body;

  if (!mobile || !productId) {
    return res.status(400).json({ error: 'Mobile number and productId are required' });
  }

  const user = users.find((user) => user.mobile === mobile);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const product = products.find((item) => item.id === Number(productId));
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  carts[mobile] = carts[mobile] || [];
  const existingItem = carts[mobile].find((item) => item.productId === product.id);

  if (existingItem) {
    existingItem.quantity += Number(quantity);
  } else {
    carts[mobile].push({
      cartItemId: nextCartItemId(),
      productId: product.id,
      quantity: Number(quantity)
    });
  }

  res.status(201).json({ message: 'Product added to cart', cart: carts[mobile] });
}

function updateCartItem(req, res) {
  const { mobile, cartItemId, quantity } = req.body;

  if (!mobile || !cartItemId || quantity == null) {
    return res.status(400).json({ error: 'Mobile number, cartItemId, and quantity are required' });
  }

  const cartItems = carts[mobile] || [];
  const cartItem = cartItems.find((item) => item.cartItemId === cartItemId);

  if (!cartItem) {
    return res.status(404).json({ error: 'Cart item not found' });
  }

  cartItem.quantity = Number(quantity);
  if (cartItem.quantity <= 0) {
    carts[mobile] = cartItems.filter((item) => item.cartItemId !== cartItemId);
  }

  res.json({ message: 'Cart updated', cart: carts[mobile] });
}

function removeCartItem(req, res) {
  const mobile = req.query.mobile;
  const cartItemId = req.params.cartItemId;

  if (!mobile || !cartItemId) {
    return res.status(400).json({ error: 'Mobile number and cartItemId are required' });
  }

  const cartItems = carts[mobile] || [];
  const newItems = cartItems.filter((item) => item.cartItemId !== cartItemId);

  if (newItems.length === cartItems.length) {
    return res.status(404).json({ error: 'Cart item not found' });
  }

  carts[mobile] = newItems;
  res.json({ message: 'Cart item removed', cart: carts[mobile] });
}

function clearUserCart(mobile) {
  carts[mobile] = [];
}

module.exports = {
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearUserCart
};
