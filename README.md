# KisanMart — Backend + Simple Frontend

This repository contains a simple Express backend and a minimal static frontend for the KisanMart demo app.

## Requirements
- Node.js 18+ (or Node 16+)
- npm (or yarn)

## Install
1. Open a terminal in the project root (where `package.json` is located).

```bash
npm install
```

This will install dependencies listed in `package.json`.

## Run (development)

Start the server with nodemon (auto-restart on changes):

```bash
npm run dev
```

Or run the production start script:

```bash
npm start
```

By default the server listens on port `5000`. API base path: `http://localhost:5000/api`.

## Frontend
- The static frontend files are in the `public/` folder. You can open `public/index.html` in the browser while the backend runs, or serve the `public/` directory through the Express server (already configured in `src/index.js`).

## Environment
- If you need environment variables, create a `.env` file in the project root. Common example:

```
PORT=5000
# other keys
```

This project already ignores `.env` in `.gitignore`.

## Useful commands
- `npm install` — install deps
- `npm run dev` — run with nodemon
- `npm start` — run production server

## Notes
- `node_modules/` is gitignored. Commit only source files.
- If you want me to also add setup for Docker, CI, or a more detailed developer guide, tell me which you'd prefer.
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
