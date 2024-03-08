const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const app = express();
const port = 3000;

// Configure app to use bodyParser for POST data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'product',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test MySQL connection
pool
  .query('SELECT 1 + 1 as result')
  .then(([results]) => {
    console.log('Connection has been established successfully.');
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
  });

const createCategoryTable = `
  CREATE TABLE IF NOT EXISTS Category (
    CategoryId INT PRIMARY KEY AUTO_INCREMENT,
    CategoryName VARCHAR(255) NOT NULL
  )
`;

const createProductTable = `
  CREATE TABLE IF NOT EXISTS Product (
    ProductId INT PRIMARY KEY AUTO_INCREMENT,
    ProductName VARCHAR(255) NOT NULL,
    CategoryId INT NOT NULL,
    FOREIGN KEY (CategoryId) REFERENCES Category(CategoryId)
  )
`;

pool
  .query(createCategoryTable)
  .then(() => pool.query(createProductTable))
  .then(() => {
    console.log('Tables created successfully.');
  })
  .catch((err) => {
    console.error('Error creating tables:', err);
  });

//  this is categories api create for the CRUD opertions

app.get('/all/category', async (req, res) => {
    try {
        const [categories] = await pool.query('SELECT * FROM Category');
        res.json(categories);
      } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).send('Internal Server Error');
      }
  });


  app.post('/create/category', async (req, res) => {
    const { categoryName } = req.body;
    try {
      await pool.query('INSERT INTO Category (CategoryName) VALUES (?)', [categoryName]);
      res.status(201).send('Category created successfully');
    } catch (error) {
      console.error('Error creating category:', error);
      res.status(500).send('Internal Server Error');
    }
  });

  app.put('/categoryU/:id', async (req, res) => {
    const categoryId = req.params.id;
    const { categoryName } = req.body;
    try {
      await pool.query('UPDATE Category SET CategoryName = ? WHERE CategoryId = ?', [categoryName, categoryId]);
      res.send('Category updated successfully');
    } catch (error) {
      console.error('Error updating category:', error);
      res.status(500).send('Internal Server Error');
    }
  });

  app.delete('/categoryD/:id', async (req, res) => {
    const categoryId = req.params.id;

    try {
      await pool.query('DELETE FROM Category WHERE CategoryId = ?', [categoryId]);
      res.send('Category deleted successfully');
    } catch (error) {
      console.error('Error deleting category:', error);
      res.status(500).send('Internal Server Error');
    }
  });

//  this is products api create for the CRUD opertions

  app.get('/all/products', async (req, res) => {
    try {
        const [products] = await pool.query('SELECT * FROM Product');
        res.json(products);
      } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).send('Internal Server Error');
      }
  });

  app.post('/product/add', async (req, res) => {
    const { productName, categoryId } = req.body;

    try {
      await pool.query('INSERT INTO Product (ProductName, CategoryId) VALUES (?, ?)', [productName, categoryId]);
      res.status(201).send('Product created successfully');
    } catch (error) {
      console.error('Error creating product:', error);
      res.status(500).send('Internal Server Error');
    }
  });


  app.put('/productU/:id', async (req, res) => {
    const productId = req.params.id;
    const { productName, categoryId } = req.body;

    try {
      await pool.query('UPDATE Product SET ProductName = ?, CategoryId = ? WHERE ProductId = ?', [productName, categoryId, productId]);
      res.send('Product updated successfully');
    } catch (error) {
      console.error('Error updating product:', error);
      res.status(500).send('Internal Server Error');
    }
  });

  app.delete('/productD/:id', async (req, res) => {
    const productId = req.params.id;

    try {
      await pool.query('DELETE FROM Product WHERE ProductId = ?', [productId]);
      res.send('Product deleted successfully');
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).send('Internal Server Error');
    }
  });


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
