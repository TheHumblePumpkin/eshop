const mongoose = require('mongoose');
const Cart = require('../Models/cartSchema');
const Order = require('../Models/orderSchema');
const Product = require('../Models/productSchema');

const generateOrderId = () => {
    return 'ORDER-' + Math.random().toString(36).substr(2, 9).toUpperCase();
};

exports.placeOrder = async (req, res) => {

    try {
        const { userId } = req.body;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            console.error('Invalid user ID');
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID'
            });
        }

        console.log(`Placing order for User ID: ${userId}`);

        const cart = await Cart.findOne({ user: userId }).populate('items.product');
        if (!cart || cart.items.length === 0) {
            console.error('Cart is empty or not found');
            return res.status(400).json({
                success: false,
                message: 'Cart is empty or not found'
            });
        }

        let totalAmount = 0;
        const orderItems = cart.items.map(item => {
            totalAmount += item.product.price * item.quantity;
            return {
                product: item.product._id,
                quantity: item.quantity
            };
        });

        const orderId = generateOrderId();
        const newOrder = new Order({
            user: userId,
            orderItems,
            orderId,
            totalAmount
        });

        await newOrder.save().then(() => {
        }).catch(err => {
            console.error('Error saving order:', err.message);
            return res.status(500).json({
                success: false,
                message: 'An error occurred while creating the order',
                error: err.message
            });
        });


        for (const item of cart.items) {
            const product = await Product.findById(item.product._id);
            if (product) {
                product.countInStock -= item.quantity;
                await product.save().catch(err => {
                    console.error('Error updating product stock:', err.message);
                    return res.status(500).json({
                        success: false,
                        message: 'An error occurred while updating product stock',
                        error: err.message
                    });
                });
            }
        }

        cart.items = [];
        await cart.save().then(() => {
        }).catch(err => {
            console.error('Error clearing cart:', err.message);
            return res.status(500).json({
                success: false,
                message: 'An error occurred while clearing the cart',
                error: err.message
            });
        });

        res.status(201).json({
            success: true,
            message: 'Order placed successfully',
            orderId: newOrder.orderId,
            totalAmount: totalAmount,
            orderDetails: newOrder
        });
    } catch (error) {
        console.error('Error while placing order:', error.message);
        res.status(500).json({
            success: false,
            message: 'An error occurred while placing the order',
            error: error.message
        });
    }
};
