// app/lib/services/cart.jsx
import pb from '../pocketbase';
import authService from './auth';

let cart = [];

const getProductStock = async (productId) => {
  try {
    const product = await pb.collection('products').getOne(productId);
    return product.quantity;
  } catch (error) {
    console.error(`Failed to fetch stock for product ${productId}:`, error);
    throw new Error('Unable to verify product stock');
  }
};

export const addToCart = async (product, quantity) => {
  try {
    const currentUser = await authService.getCurrentUser();
    if (!currentUser) throw new Error('User not authenticated');
    console.log('Current user:', currentUser);

    const stock = await getProductStock(product.id);
    console.log('Product stock:', stock);
    if (quantity > stock) throw new Error(`Only ${stock} items available in stock`);

    console.log('Checking existing cart items...');
    const existingItems = await pb.collection('cart').getList(1, 1, {
      filter: `productID = "${product.id}" && userID = "${currentUser.id}" && statusPayment = false`
    });
    console.log('Existing items:', existingItems.items);

    if (existingItems.items.length > 0) {
      const existingItem = existingItems.items[0];
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > stock) throw new Error(`Only ${stock} items available in stock`);
      console.log('Updating existing item:', existingItem.id, 'New quantity:', newQuantity);
      await pb.collection('cart').update(existingItem.id, { quantity: newQuantity });
    } else {
      console.log('Creating new cart item:', { 
        productID: product.id, 
        userID: currentUser.id, 
        quantity, 
        statusPayment: false 
      });
      const newRecord = await pb.collection('cart').create({
        productID: product.id,
        userID: currentUser.id, // Use ID instead of email
        quantity: quantity,
        statusPayment: false
      });
      console.log('New record created:', newRecord);
    }

    return await getCart();
  } catch (error) {
    console.error('Add to cart detailed error:', { message: error.message, data: error.data, status: error.status });
    throw new Error(`Failed to add to cart: ${error.message}`);
  }
};

export const getCart = async () => {
  const currentUser = await authService.getCurrentUser();
  console.log('Current user in getCart:', currentUser);
  if (!currentUser) {
    console.log('No current user, returning empty cart');
    return [];
  }

  try {
    const filter = `userID = "${currentUser.id}" && statusPayment = false`;
    console.log('Cart filter:', filter);
    const cartItems = await pb.collection('cart').getList(1, 50, {
      filter: filter,
      expand: 'productID'
    });
    console.log('Raw cart items from PocketBase:', cartItems);

    cart = cartItems.items.map(item => {
      const product = item.expand.productID;
      const imageUrl = product.image ? pb.files.getURL(product, product.image) : null;
      return {
        product: {
          id: product.id,
          name: product.name,
          price: product.price,
          imageUrl: imageUrl
        },
        quantity: item.quantity,
        cartItemId: item.id
      };
    });
    
    console.log('Mapped cart items with image URLs:', cart);
    return cart;
  } catch (error) {
    console.error('Failed to fetch cart:', error);
    return [];
  }
};

export const clearCart = async () => {
  const currentUser = await authService.getCurrentUser();
  if (!currentUser) return [];

  try {
    const cartItems = await pb.collection('cart').getList(1, 50, {
      filter: `userID = "${currentUser.id}" && statusPayment = false`
    });
    
    await Promise.all(cartItems.items.map(item => pb.collection('cart').delete(item.id)));
    cart = [];
    return cart;
  } catch (error) {
    console.error('Failed to clear cart:', error);
    return cart;
  }
};

export const removeFromCart = async (cartItemId) => {
  try {
    await pb.collection('cart').delete(cartItemId);
    return await getCart();
  } catch (error) {
    console.error('Failed to remove from cart:', error);
    throw error;
  }
};

export const updateCartItemQuantity = async (cartItemId, newQuantity) => {
  try {
    const cartItem = await pb.collection('cart').getOne(cartItemId);
    const stock = await getProductStock(cartItem.productID);
    
    if (newQuantity > stock) throw new Error(`Only ${stock} items available in stock`);
    
    if (newQuantity > 0) {
      await pb.collection('cart').update(cartItemId, { quantity: newQuantity });
    }
    return await getCart();
  } catch (error) {
    console.error('Failed to update cart quantity:', error);
    throw error;
  }
};