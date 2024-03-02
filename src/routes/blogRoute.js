import express from 'express';
import blogController from '../controllers/blogController.js';
import authentication from '../middlewares/authentication.js';

const router = express.Router();

router.post(
  '/createPost',
  authentication.authLogin,
  blogController.createPost,
);
router.get('/getAllPosts', blogController.getPosts);
router.get('/getSinglePost', blogController.getSinglePost);
router.get('/featured', blogController.getFeaturedBlog);
router.put(
  '/updatePost',
  authentication.authLogin,
  blogController.updatePost,
);
router.delete(
  '/deletePost/:blog_id',
  authentication.authLogin,
  blogController.deletePost,
);
router.post(
  '/createComment/:blog_id',
  authentication.authLogin,
  blogController.createComment,
);
router.get('/getAllComments/:blog_id', blogController.getAllComments);
router.put(
  '/updateComment/:comment_id',
  authentication.authLogin,
  blogController.updateComment,
);
router.delete(
  '/deleteComment/:comment_id',
  authentication.authLogin,
  blogController.deleteComment,
);
router.post(
  '/likePost/:blog_id',
  authentication.authLogin,
  blogController.likePost,
);
router.post(
  '/likeComment/:comment_id',
  authentication.authLogin,
  blogController.likeComment,
);
router.post(
  '/commentReply/:comment_id',
  authentication.authLogin,
  blogController.commentReply,
);
router.post(
  '/publish/:id',
  authentication.isAdmin,
  blogController.publishPost,
);
router.get(
  '/getAllCommentReplies/:comment_id',
  blogController.getAllCommentReplies,
);
router.post('/addCategory', blogController.addCategory);
router.get('/getAllCategories', blogController.getAllCategories);
router.put(
  '/editCategory/:categoryId',
  blogController.updateCategory,
);
router.delete(
  '/deleteCategory/:categoryId',
  blogController.deleteCategory,
);

export default router;
