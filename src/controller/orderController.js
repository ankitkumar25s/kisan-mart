const { carts, orders, users, nextOrderId } = require('../db');
const { clearUserCart } = require('./cartController');

function placeOrder(req, res) {
  const { mobile, address, paymentMethod } = req.body;

  if (!mobile || !address || !paymentMethod) {
    return res.status(400).json({ error: 'Mobile, address, and payment method are required' });
  }

  const user = users.find((user) => user.mobile === mobile);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const cartItems = carts[mobile] || [];
  if (!cartItems.length) {
    return res.status(400).json({ error: 'Cart is empty' });
  }

  const orderTotal = cartItems.reduce((sum, item) => {
    const product = require('../db').products.find((prod) => prod.id === item.productId);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);

  const order = {
    orderId: nextOrderId(),
    userMobile: mobile,
    address,
    paymentMethod,
    items: cartItems,
    total: orderTotal,
    status: 'Order Received',
    createdAt: new Date().toISOString()
  };

  orders.push(order);
  clearUserCart(mobile);

  res.status(201).json({ message: 'Order placed successfully', orderId: order.orderId, status: order.status });
}

function getOrders(req, res) {
  const mobile = req.query.mobile;

  if (!mobile) {
    return res.status(400).json({ error: 'Mobile number is required' });
  }

  if (!users.find((user) => user.mobile === mobile)) {
    return res.status(404).json({ error: 'User not found' });
  }

  const userOrders = orders.filter((order) => order.userMobile === mobile);
  res.json({ orders: userOrders });
}

module.exports = { placeOrder, getOrders };
