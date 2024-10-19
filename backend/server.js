const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const Product = require('./models/Product');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

app.get('/api/seed', async (req, res) => {
    try {
      const { data } = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
      await Product.insertMany(data);
      res.json({ message: "Database seeded successfully!" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/products', async (req, res) => {
    const { page = 1, perPage = 10, search = '', month } = req.query;
    const query = {
      dateOfSale: { $regex: `-${month.padStart(2, '0')}-` }
    };
    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        // { price: new RegExp(search, 'i') }
      ];
    }
    const products = await Product.find(query)
      .skip((page - 1) * perPage)
      .limit(Number(perPage));
    const total = await Product.countDocuments(query);
    res.json({ products, total });
  });

  app.get('/api/statistics', async (req, res) => {
    const { month } = req.query;
    const query = { dateOfSale: { $regex: `-${month.padStart(2, '0')}-` } };
    
    const totalSales = await Product.aggregate([{ $match: query }, { $group: { _id: null, total: { $sum: "$price" } } }]);
    const soldItems = await Product.countDocuments({ ...query, sold: true });
    const unsoldItems = await Product.countDocuments({ ...query, sold: false });
  
    res.json({
      totalSaleAmount: totalSales[0]?.total || 0,
      soldItems,
      unsoldItems
    });
  });

  app.get('/api/bar-chart', async (req, res) => {
    const { month } = req.query;
    const ranges = [
      { range: '0-100', min: 0, max: 100 },
      { range: '101-200', min: 101, max: 200 },
      // Add remaining ranges...
    ];
    
    const results = await Promise.all(
      ranges.map(async (range) => {
        const count = await Product.countDocuments({
          dateOfSale: { $regex: `-${month.padStart(2, '0')}-` },
          price: { $gte: range.min, $lte: range.max }
        });
        return { range: range.range, count };
      })
    );
  
    res.json(results);
  });
  
  app.get('/api/pie-chart', async (req, res) => {
    const { month } = req.query;
    const categories = await Product.aggregate([
      { $match: { dateOfSale: { $regex: `-${month.padStart(2, '0')}-` } } },
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);
  
    res.json(categories.map(c => ({ category: c._id, count: c.count })));
  });
  