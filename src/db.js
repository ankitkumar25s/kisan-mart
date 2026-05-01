const products = [
  {
    id: 1,
    name: 'Urea Khaad',
    category: 'khaad',
    price: 380,
    rating: 4.7,
    popular: 120,
    stock: 45,
    description: 'Nitrogen rich fertilizer for high-yield crops.'
  },
  {
    id: 2,
    name: 'Gehu Beej Premium',
    category: 'beej',
    price: 340,
    rating: 4.6,
    popular: 98,
    stock: 30,
    description: 'High quality wheat seed for best germination.'
  },
  {
    id: 3,
    name: 'Herbal Pesticide',
    category: 'pesticide',
    price: 220,
    rating: 4.4,
    popular: 80,
    stock: 55,
    description: 'Safe pesticide for vegetables and fruits.'
  },
  {
    id: 4,
    name: 'Manual Sprayer',
    category: 'tools',
    price: 1250,
    rating: 4.8,
    popular: 70,
    stock: 22,
    description: 'Lightweight sprayer for ease of use in fields.'
  },
  {
    id: 5,
    name: 'Potash Khaad',
    category: 'khaad',
    price: 420,
    rating: 4.5,
    popular: 65,
    stock: 18,
    description: 'Potassium rich fertilizer for stronger stems.'
  },
  {
    id: 6,
    name: 'Seed Drill',
    category: 'tools',
    price: 4250,
    rating: 4.3,
    popular: 40,
    stock: 12,
    description: 'Easy-to-use seed drill for planting efficiency.'
  }
];

const users = [
  {
    id: 1,
    name: 'Demo Farmer',
    mobile: '9876543210',
    password: 'kisan123',
    village: 'Sehore',
    state: 'Madhya Pradesh',
    pincode: '466001',
    land: 5
  }
];

const carts = {};
const orders = [];

const nextCartItemId = () => `ci-${Date.now().toString().slice(-6)}-${Math.random().toString(36).slice(2,5)}`;
const nextOrderId = () => `KM-${Math.floor(10000000 + Math.random() * 90000000)}`;

module.exports = {
  products,
  users,
  carts,
  orders,
  nextCartItemId,
  nextOrderId
};
