// app/services/orderService.js
import pb from '../pocketbase';

const orderService = {
  async handlePlaceOrder(userId, cartItems, totalAmount, courier, paymentOption) {
    try {
      console.log('handlePlaceOrder - isLoggedIn:', !!userId);

      // Step 1: Create the receipt
      const receipt = await pb.collection('receipt').create({
        userID: userId,
        totalAmount,
        courier,
        paymentOption,
      });
      console.log('Receipt created:', receipt);

      // Step 2: Link cart items to receipt via receiptCart
      const receiptCartPromises = cartItems.map(async (cartItem) => {
        // Ensure cart item exists or create a new one
        let cartRecord = cartItem;
        if (!cartItem.id || typeof cartItem.id === 'undefined') {
          cartRecord = await pb.collection('cart').create({
            productID: cartItem.productID,
            userID: userId,
            quantity: cartItem.quantity,
            statusPayment: true,
          });
        } else {
          // Update existing cart item
          await pb.collection('cart').update(cartItem.id, { statusPayment: true });
        }

        // Create receiptCart entry
        return pb.collection('receiptCart').create({
          receiptID: receipt.id,
          cartID: cartRecord.id,
        });
      });

      await Promise.all(receiptCartPromises);
      console.log('Cart items linked via receiptCart');

      // Step 3: Update product quantities
      const productUpdatePromises = cartItems.map(async (cartItem) => {
        const product = await pb.collection('products').getOne(cartItem.productID);
        console.log(`Product ${product.name} current quantity: ${product.quantity}`);
        const newQuantity = product.quantity - cartItem.quantity;
        await pb.collection('products').update(cartItem.productID, {
          quantity: newQuantity,
        });
        console.log(`Updated ${product.name} quantity to: ${newQuantity}`);
      });

      await Promise.all(productUpdatePromises);
      console.log('Product quantities reduced');

      return receipt;
    } catch (error) {
      console.error('Error in handlePlaceOrder:', error);
      throw error;
    }
  },
};

export default orderService;