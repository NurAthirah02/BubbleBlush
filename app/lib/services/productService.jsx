import pb from '../pocketbase';



export const fetchProductByType = async (productType) => {
    try {
      // Fetch records from the 'products' collection filtered by productType
      const records = await pb.collection('products').getFullList({
        filter: `productType = "${productType}"`, // Filter by productType
        sort: '-created',
      });
  
      // Map the records to include the full image URL and description
      const productsWithImages = records.map((product) => ({
        ...product,
        imageUrl: pb.files.getURL(product, product.image), // Use the correct method name
        description: product.description, // Include the description field
      }));
  
      return productsWithImages;
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  };


  
  export const fetchProductByCategory = async (category) => {
    try {
      console.log('Starting fetchProductByCategory with category:', category);
      const records = await pb.collection('products').getFullList({
        filter: `category = "${category}"`,
        sort: '-created',
      });
      console.log('Fetched records from PocketBase:', records);
  
      const productsWithImages = records.map((product) => {
        console.log('Processing product:', product.id);
        if (!product.image) {
          console.warn('Product has no image:', product.id);
        }
        const imageUrl = product.image ? pb.files.getUrl(product, product.image) : null;
        console.log('Generated imageUrl for product', product.id, ':', imageUrl);
        return {
          ...product,
          imageUrl,
          description: product.description,
        };
      });
      console.log('Final products with images:', productsWithImages);
      return productsWithImages;
    } catch (error) {
      console.error('fetchProductByCategory failed:', error.message, error.stack);
      throw error;
    }
  };
  
  export const fetchProductByTypeCategory = async (productType, category) => {
    try {
      console.log('Starting fetchProductByTypeCategory with:', { productType, category });
      const filter = `productType = "${productType}" && category = "${category}"`;
      console.log('Filter being used:', filter);
      const records = await pb.collection('products').getFullList({
        filter,
        sort: '-created',
      });
      console.log('Fetched records from PocketBase:', records);
  
      const productsWithImages = records.map((product) => {
        console.log('Processing product:', product.id);
        if (!product.image) {
          console.warn('Product has no image:', product.id);
        }
        const imageUrl = product.image ? pb.files.getUrl(product, product.image) : null;
        console.log('Generated imageUrl for product', product.id, ':', imageUrl);
        return {
          ...product,
          imageUrl,
          description: product.description,
        };
      });
      console.log('Final products with images:', productsWithImages);
      return productsWithImages;
    } catch (error) {
      console.error('fetchProductByTypeCategory failed:', error.message, error.stack);
      throw error;
    }
  };