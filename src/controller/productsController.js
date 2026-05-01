const { products } = require('../db');

function getProducts(req, res) {
  const search = (req.query.search || '').trim().toLowerCase();
  const category = (req.query.category || '').trim().toLowerCase();
  const sort = req.query.sort || '';

  let results = products.slice();

  if (search) {
    results = results.filter((product) => {
      return (
        product.name.toLowerCase().includes(search) ||
        product.description.toLowerCase().includes(search)
      );
    });
  }

  if (category) {
    results = results.filter((product) => product.category === category);
  }

  if (sort === 'price_asc') {
    results.sort((a, b) => a.price - b.price);
  } else if (sort === 'price_desc') {
    results.sort((a, b) => b.price - a.price);
  } else if (sort === 'rating') {
    results.sort((a, b) => b.rating - a.rating);
  } else if (sort === 'popular') {
    results.sort((a, b) => b.popular - a.popular);
  }

  res.json({ products: results, total: results.length });
}

function getProductById(req, res) {
  const productId = Number(req.params.id);
  const product = products.find((item) => item.id === productId);

  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  res.json(product);
}

module.exports = { getProducts, getProductById };
