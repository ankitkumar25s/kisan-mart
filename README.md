# KisanMart Backend

A simple Node.js Express backend scaffold for KisanMart.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Start the server:

```bash
npm run dev
```

3. API endpoints:

- `GET http://localhost:4000/api/health`
- `GET http://localhost:4000/api/products`
- `GET http://localhost:4000/api/products/1`
- `POST http://localhost:4000/api/auth/login`
- `POST http://localhost:4000/api/auth/signup`
- `GET http://localhost:4000/api/cart?mobile=9876543210`
- `POST http://localhost:4000/api/cart`
- `PUT http://localhost:4000/api/cart`
- `DELETE http://localhost:4000/api/cart/:cartItemId?mobile=9876543210`
- `POST http://localhost:4000/api/orders`
- `GET http://localhost:4000/api/orders?mobile=9876543210`
- `GET http://localhost:4000/api/track/:orderId`
