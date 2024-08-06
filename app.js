const express = require('express');
const app = express();
const morgan = require('morgan');
const cors = require('cors');


const productRouter = require('./Routes/productRouter');
const categoryRouter = require('./Routes/categoryRouter');
const userRouter = require('./Routes/userRouter');
const cartRouter = require('./Routes/cartRouter'); 
const orderRouter = require('./Routes/orderRouter'); 

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(cors());



app.use('/api/v1/products', productRouter);
app.use('/api/v1/categories', categoryRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/cart', cartRouter);
app.use('/api/v1/orders', orderRouter); 


app.use((req, res) => {
    console.error(`[404 Error] Route not found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ success: false, message: 'Route not found' });
});


app.use((err, req, res, next) => {
    console.error('[Error Handling Middleware]', err);
    res.status(500).json({ success: false, message: 'An internal server error occurred', error: err.message });
});

module.exports = app;
