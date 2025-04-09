// app/lib/services/receipt.jsx
import pb from '../pocketbase';
import authService from './auth';

export const placeOrder = async (selectedItems, totalAmount, courier, paymentOption) => {
  try {
    const currentUser = await authService.getCurrentUser();
    if (!currentUser) throw new Error('User not authenticated');

    // Step 1: Create the receipt
    const receiptData = {
      userID: currentUser.id,
      totalAmount: totalAmount,
      courier: courier,
      paymentOption: paymentOption,
    };
    const receipt = await pb.collection('receipt').create(receiptData);
    console.log('Receipt created:', receipt);

    // Step 2: Process cart items and update product quantities
    const receiptCartPromises = selectedItems.map(async (item) => {
      // Log the item structure
      console.log('Processing item:', {
        cartItemId: item.cartItemId,
        productId: item.product.id,
        quantity: item.quantity,
      });

      // Create receiptCart entry
      const receiptCartData = {
        cartID: item.cartItemId,
        receiptID: receipt.id,
      };
      const receiptCart = await pb.collection('receiptCart').create(receiptCartData);
      console.log('ReceiptCart created:', receiptCart);

      // Update cart status
      const updatedCart = await pb.collection('cart').update(item.cartItemId, {
        statusPayment: true,
      });
      console.log('Cart updated:', updatedCart);

      // Fetch the product to get current quantity
      const product = await pb.collection('products').getOne(item.product.id);
      console.log(`Product ${product.name} current quantity:`, product.quantity);

      // Calculate new quantity
      const newQuantity = product.quantity - item.quantity;
      if (newQuantity < 0) {
        throw new Error(`Insufficient stock for ${product.name}. Only ${product.quantity} left.`);
      }

      // Update product quantity
      const updatedProduct = await pb.collection('products').update(item.product.id, {
        quantity: newQuantity,
      });
      console.log(`Updated ${product.name} quantity to:`, newQuantity);
    });

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