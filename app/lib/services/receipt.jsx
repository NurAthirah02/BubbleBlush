// app/lib/services/receipt.jsx
import pb from '../pocketbase';
import authService from './auth';

export const placeOrder = async (selectedItems, totalAmount, courier, paymentOption) => {
  try {
    const currentUser = await authService.getCurrentUser();
    if (!currentUser) throw new Error('User not authenticated');

    // Step 1: Create the receipt
    const receiptData = {
      userID: currentUser.id, // Assuming relation field, use ID
      totalAmount: totalAmount,
      courier: courier, // e.g., "ninjavan"
      paymentOption: paymentOption, // e.g., "Debit Card" (full label passed from Checkout)
    };
    const receipt = await pb.collection('receipt').create(receiptData);
    console.log('Receipt created:', receipt);

    // Step 2: Process cart items and update product quantities
    const receiptCartPromises = selectedItems.map(async (item) => {
      // Create receiptCart entry
      const receiptCartData = {
        cartID: item.cartItemId,
        receiptID: receipt.id,
      };
      await pb.collection('receiptCart').create(receiptCartData);

      // Update cart status
      await pb.collection('cart').update(item.cartItemId, {
        statusPayment: true,
      });

      // Fetch the product to get current quantity
      const product = await pb.collection('products').getOne(item.product.id);
      console.log(`Product ${product.name} current quantity:`, product.quantity);

      // Calculate new quantity
      const newQuantity = product.quantity - item.quantity;
      if (newQuantity < 0) {
        throw new Error(`Insufficient stock for ${product.name}. Only ${product.quantity} left.`);
      }

      // Update product quantity
      await pb.collection('products').update(item.product.id, {
        quantity: newQuantity,
      });
      console.log(`Updated ${product.name} quantity to:`, newQuantity);
    });

    // Wait for all cart and product updates to complete
    await Promise.all(receiptCartPromises);
    console.log('Cart items linked, updated, and product quantities reduced');

    return receipt;
  } catch (error) {
    console.error('Place order error:', {
      message: error.message,
      data: error.data,
      status: error.status,
    });
    throw new Error(`Failed to place order: ${error.message}`);
  }
};