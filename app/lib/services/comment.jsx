// app/lib/services/comment.jsx
import pb from '../pocketbase';

export const fetchComment = async (productId) => {
  try {
    const reviews = await pb.collection('review').getList(1, 50, {
      filter: `productID = "${productId}"`,
      expand: 'userID',
    });

    const comments = reviews.items.map(review => ({
      userName: review.expand?.userID?.name || 'Unknown User',
      comment: review.comment,
    }));

    return comments;
  } catch (error) {
    console.error('Failed to fetch comments:', error);
    throw new Error('Unable to load comments');
  }
};

export const insertComment = async (userId, productId, receiptId, comment) => {
  try {
    const reviewData = {
      userID: userId,
      productID: productId,
      receiptID: receiptId, // Add receiptID
      comment: comment,
    };
    const newReview = await pb.collection('review').create(reviewData);
    return newReview;
  } catch (error) {
    console.error('Failed to insert comment:', error);
    throw new Error('Unable to submit review');
  }
};