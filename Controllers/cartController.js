const mongoose = require('mongoose');
const Cart = require('../Models/cartSchema');
const Product = require('../Models/productSchema');


exports.addToCart = async (req, res) => {

    try {
        const { userId, productId, quantity } = req.body;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            console.error('Invalid user ID');
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID'
            });
        }

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            console.error('Invalid product ID');
            return res.status(400).json({
                success: false,
                message: 'Invalid product ID'
            });
        }

        // console.log(`User ID: ${userId}, Product ID: ${productId}, Quantity: ${quantity}`);

        const product = await Product.findById(productId);
        if (!product) {
            console.error('Product not found');
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        if (product.countInStock < quantity) {
            return res.status(400).json({
                success: false,
                message: 'Not enough stock available'
            });
        }

        let cart = await Cart.findOne({ user: userId }).populate('items.product');
        if (!cart) {
            cart = new Cart({ user: userId, items: [] });
        }

        const itemIndex = cart.items.findIndex(item => item.product._id.toString() === productId);

        if (itemIndex > -1) {
            cart.items[itemIndex].quantity += quantity;
        } else {
            cart.items.push({ product: productId, quantity });
        }

        // Save the updated cart
        await cart.save().then(() => {
        }).catch(err => {
            console.error('Error saving cart:', err.message);
            return res.status(500).json({
                success: false,
                message: 'An error occurred while updating the cart',
                error: err.message
            });
        });

        product.countInStock -= quantity;
        await product.save().then(() => {
        }).catch(err => {
            console.error('Error updating product stock:', err.message);
            return res.status(500).json({
                success: false,
                message: 'An error occurred while updating product stock',
                error: err.message
            });
        });

        const totalCartValue = cart.items.reduce((total, item) => {
            return total + (item.product.price * item.quantity);
        }, 0);

        console.log('Total Cart Value:', totalCartValue);

        res.status(200).json({
            success: true,
            message: 'Product added to cart successfully',
            cart: cart,
            totalCartValue: totalCartValue
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'An error occurred while adding the product to the cart',
            error: error.message
        });
    }
};


exports.removeFromCart = async (req, res) => {
    console.log('Remove from cart request received:', req.body);

    try {
        const { userId, productId } = req.body;

        // Validate ObjectId for userId and productId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            console.error('Invalid user ID');
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID'
            });
        }

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            console.error('Invalid product ID');
            return res.status(400).json({
                success: false,
                message: 'Invalid product ID'
            });
        }

        console.log(`User ID: ${userId}, Product ID: ${productId}`);


        const product = await Product.findById(productId);
        if (!product) {
            console.error('Product not found');
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            console.error('Cart not found for user');
            return res.status(404).json({
                success: false,
                message: 'Cart not found for user'
            });
        }

        const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
        if (itemIndex === -1) {
            console.error('Product not found in cart');
            return res.status(404).json({
                success: false,
                message: 'Product not found in cart'
            });
        }

        const { quantity } = cart.items[itemIndex];
        const quantityToRemove = quantity || cartItem.quantity;

        cart.items.splice(itemIndex, 1);

        // Update cart
        await cart.save().then(() => {
        }).catch(err => {
            console.error('Error saving cart after removal:', err.message);
            return res.status(500).json({
                success: false,
                message: 'An error occurred while updating the cart',
                error: err.message
            });
        });

        product.countInStock += quantity;
        await product.save().then(() => {
        }).catch(err => {
            console.error('Error updating product stock after removal:', err.message);
            return res.status(500).json({
                success: false,
                message: 'An error occurred while updating the product stock',
                error: err.message
            });
        });

        res.status(200).json({
            success: true,
            message: 'Product removed from cart successfully',
            data: cart
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'An error occurred while removing the product from the cart',
            error: error.message
        });
    }
};

exports.getCartItems = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            console.error('Invalid user ID');
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID'
            });
        }

        console.log(`Retrieving cart for User ID: ${userId}`);

        const cart = await Cart.findOne({ user: userId }).populate('items.product');
        if (!cart) {
            console.error('Cart not found for user');
            return res.status(404).json({
                success: false,
                message: 'Cart not found for user'
            });
        }

        const totalCartValue = cart.items.reduce((total, item) => {
            return total + (item.product.price * item.quantity);
        }, 0);

        res.status(200).json({
            success: true,
            cartItems: cart.items,
            totalCartValue: totalCartValue
        });
    } catch (error) {
        console.error('Error while retrieving cart:', error.message);
        res.status(500).json({
            success: false,
            message: 'An error occurred while retrieving the cart',
            error: error.message
        });
    }
};
