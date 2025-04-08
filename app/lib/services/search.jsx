import pb from '../pocketbase';

// Search products by name or category
export const searchProducts = async (query) => {
  try {
    // Convert query to lowercase for case-insensitive search
    const searchQuery = query.toLowerCase();
    
    // Fetch products from PocketBase with filter
    const resultList = await pb.collection('products').getList(1, 50, {
      filter: `name ~ "${searchQuery}" || category ~ "${searchQuery}"`,
    });

    // Map the results to match your expected product format, including full image URL
    const products = resultList.items.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      imageUrl: pb.files.getURL(item, item.image), // Construct the full image URL
      description: item.description,
      category: item.category,
      productType: item.productType,
      quantity: item.quantity,
    }));

    return products;
  } catch (error) {
    throw new Error('Failed to search products: ' + error.message);
  }
};