const { orders } = require('../db');

function trackOrder(req, res) {
  const orderId = req.params.orderId;

  if (!orderId) {
    return res.status(400).json({ error: 'Order ID is required' });
  }

  const order = orders.find((item) => item.orderId === orderId);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const timeline = [
    { step: 'Order Received', completed: true },
    { step: 'Packing', completed: true },
    { step: 'Dispatched', completed: false },
    { step: 'Out for Delivery', completed: false },
    { step: 'Delivered', completed: false }
  ];

  res.json({
    orderId: order.orderId,
    status: order.status,
    estimatedDelivery: '2 days',
    total: order.total,
    items: order.items,
    timeline
  });
}

module.exports = { trackOrder };
