import mongoose from 'mongoose';
import slugify from 'slugify';
import blogSchema from '../models/blog/blogModel.js';
import blogCommentModel from '../models/blog/blogCommentModel.js';
import blogLikeModel from '../models/blog/blogLikeModel.js';
import commentLikeModel from '../models/blog/commentLikeModel.js';
import commentReplyModel from '../models/blog/commentReplyModel.js';
import categoryModel from '../models/blog/categoryModel.js';
import blogValidationSchema from '../validations/blog/blogValidation.js';
import commentValidationSchema from '../validations/blog/commentValidation.js';
import commentReplyValidationSchema from '../validations/blog/commentReplyValidation.js';
import categoryValidationSchema from '../validations/blog/categoryValidation.js';
import { HttpException } from '../exceptions/HttpException.js';
import { uploadSingle } from '../helpers/upload.js';

// Creating the post
const createPost = async (request, response) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(request.user?._id)) {
      return response.status(400).json({
        invalidId:
          'Something went wrong, refresh your page and try again!',
      });
    }
    //Validation
    const { error } = blogValidationSchema.validate(request.body);

    if (error)
      return response
        .status(400)
        .json({ validationError: error.details[0].message });

    const postImageResult = await uploadSingle(
      request.body.postImage,
    );

    const newPost = new blogSchema({
      title: request.body.title,
      postBody: request.body.postBody,
      category: request.body.category,
      postImage: postImageResult.secure_url,
      createdBy: request.user?._id,
      isPublic: request.body.isPublic,
      userModel:
        request.user.accountType === 'Google' ? 'googleUser' : 'User',
      slug: slugify(request.body.title, {
        lower: true,
        strict: true,
      }),
    });

    const blogPost = await newPost.save();
    const populatedPost = await (
      await blogPost.populate('createdBy')
    ).populate('category');

    response.status(200).json({
      successMessage: 'Post created successfully!',
      postContent: populatedPost,
    });
  } catch (error) {
    // console.log(error);;
    if (error.code === 11000 || error.code === 11001) {
      response.status(400).json({
        duplicationError: 'You already have a post with this title!',
      });
    } else {
      response.status(500).json({
        status: 'fail',
        message: error.message,
      });
    }
  }
};

// Getting all the posts
const getPosts = async (request, response) => {
  try {
    // Populate post creator details
    let query = [
      {
        $lookup: {
          from: 'users',
          localField: 'createdBy',
          foreignField: '_id',
          as: 'normalPostCreator',
        },
      },
      {
        $lookup: {
          from: 'googleusers',
          localField: 'createdBy',
          foreignField: '_id',
          as: 'googlePostCreator',
        },
      },
      {
        $addFields: {
          postCreator: {
            $concatArrays: [
              '$normalPostCreator',
              '$googlePostCreator',
            ],
          },
        },
      },
      { $unwind: '$postCreator' },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'categoryDetails',
        },
      },
      { $unwind: '$categoryDetails' },
    ];

    // Search functionality
    if (request.query.keyword && request.query.keyword != '') {
      query.push({
        $match: {
          $or: [
            {
              title: { $regex: request.query.keyword, $options: 'i' },
            },
            {
              postBody: {
                $regex: request.query.keyword,
                $options: 'i',
              },
            },
            {
              'categoryDetails.name': {
                $regex: request.query.keyword,
                $options: 'i',
              },
            },
            {
              'postCreator.firstName': {
                $regex: request.query.keyword,
                $options: 'i',
              },
            },
            {
              'postCreator._id': {
                $regex: request.query.keyword,
                $options: 'i',
              },
            },
            {
              'postCreator.lastName': {
                $regex: request.query.keyword,
                $options: 'i',
              },
            },
          ],
        },
      });
    }

    // Get posts for each author
    if (request.query.userId) {
      query.push({
        $match: {
          createdBy: mongoose.Types.ObjectId(request.query.userId),
        },
      });
    }

    // Get posts for each category
    if (request.query.category) {
      query.push({
        $match: {
          'categoryDetails.slug': request.query.category,
        },
      });
    }
    // Get all posts
    if (request.query.all !== 'admin') {
      query.push({
        $match: {
          isPublic: true,
        },
      });
    }

    // Sort functionality
    if (request.query.sortBy && request.query.sortOrder) {
      var sort = {};
      sort[request.query.sortBy] =
        request.query.sortOrder == 'asc' ? 1 : -1;
      query.push({
        $sort: sort,
      });
    } else {
      query.push({
        $sort: { createdAt: -1 },
      });
    }

    // Pagination functionality
    let total = await blogSchema.countDocuments(query);
    let page = request.query.page ? parseInt(request.query.page) : 1;
    let perPage = request.query.perPage
      ? parseInt(request.query.perPage)
      : 5;
    let skip = (page - 1) * perPage;
    query.push({
      $skip: skip,
    });
    query.push({
      $limit: perPage,
    });

    // Only show needed fields
    query.push({
      $project: {
        _id: 1,
        createdAt: 1,
        title: 1,
        slug: 1,
        isPublic: 1,
        postImage: 1,
        'postCreator._id': 1,
        'postCreator.firstName': 1,
        'postCreator.lastName': 1,
        'postCreator.name': 1,
        'postCreator.picture': 1,
        'categoryDetails.name': 1,
        'categoryDetails.slug': 1,
        comments_count: {
          $size: { $ifNull: ['$blog_comments', []] },
        },
        likes_count: { $size: { $ifNull: ['$blog_likes', []] } },
      },
    });

    const allPosts = await blogSchema.aggregate(query);

    if (allPosts) {
      response.status(200).json({
        allAvailablePosts: allPosts.map(doc =>
          blogSchema.hydrate(doc),
        ),
        paginationDetails: {
          total: total,
          currentPage: page,
          perPage: perPage,
          totalPages: Math.ceil(total / perPage),
        },
      });
    } else {
      response
        .status(400)
        .json({ postError: 'The blog posts not found' });
    }
  } catch (error) {
    // console.log(error);;
    response.status(500).json({
      status: 'fail',
      message: error.message,
    });
  }
};

// Getting a single post
const getSinglePost = async (request, response) => {
  try {
    let slug = request.query.slug;
    let query = [
      {
        $lookup: {
          from: 'users',
          localField: 'createdBy',
          foreignField: '_id',
          as: 'normalPostCreator',
        },
      },
      {
        $lookup: {
          from: 'googleusers',
          localField: 'createdBy',
          foreignField: '_id',
          as: 'googlePostCreator',
        },
      },
      {
        $addFields: {
          postCreator: {
            $concatArrays: [
              '$normalPostCreator',
              '$googlePostCreator',
            ],
          },
        },
      },
      { $unwind: '$postCreator' },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'categoryDetails',
        },
      },
      { $unwind: '$categoryDetails' },
      {
        $match: {
          slug: slug,
        },
      },
    ];

    // Only show needed fields
    query.push({
      $project: {
        _id: 1,
        createdAt: 1,
        title: 1,
        slug: 1,
        postBody: 1,
        postImage: 1,
        blog_likes: 1,
        isPublic: 1,
        'postCreator._id': 1,
        'postCreator.firstName': 1,
        'postCreator.lastName': 1,
        'postCreator.name': 1,
        'postCreator.picture': 1,
        'categoryDetails._id': 1,
        'categoryDetails.name': 1,
        'categoryDetails.slug': 1,
        comments_count: {
          $size: { $ifNull: ['$blog_comments', []] },
        },
        likes_count: { $size: { $ifNull: ['$blog_likes', []] } },
      },
    });

    let total = await blogSchema.countDocuments(query);

    const post = await blogSchema.aggregate(query);

    if (!post || !post.length) {
      throw new HttpException(404, 'Post not found!');
    }

    let blog = post[0];
    let current_user = request.user;
    let liked_by_current_user = false;

    if (current_user) {
      let blog_like = await blogLikeModel.findOne({
        blog_id: blog._id,
        user_id: current_user._id,
      });
      if (blog_like) {
        liked_by_current_user = true;
      }
    }

    response.status(200).json({
      fetchedPost: blogSchema.hydrate(blog),
      fetchedPostDetails: {
        liked_by_current_user: liked_by_current_user,
        totalPosts: total,
      },
    });
  } catch (error) {
    //  // console.log(error);;
    response.status(500).json({
      status: 'fail',
      message: error.message,
    });
  }
};

// Updating the post
const updatePost = async (request, response) => {
  try {
    let slug = request.query.slug;

    const post = await blogSchema.findOne({ slug: slug });
    if (post) {
      let current_user = request.user;

      if (post.createdBy != current_user._id) {
        return response.status(400).json({
          unauthorizedError:
            'Access denied, you are not the creator of this post!',
        });
      }
      if (
        request.body.postImage &&
        request.body.postImage !== post.postImage
      ) {
        const postImageResult = await uploadSingle(
          request.body.postImage,
        );

        post.title = request.body.title || post.title;
        post.postBody = request.body.postBody || post.postBody;
        post.category = request.body.category || post.category;
        post.isPublic = request.body.isPublic || post.isPublic;
        post.postImage = postImageResult.secure_url || post.postImage;
      } else {
        post.title = request.body.title || post.title;
        post.postBody = request.body.postBody || post.postBody;
        post.category = request.body.category || post.category;
        post.isPublic = request.body.isPublic || post.isPublic;
      }

      await post.save();

      response.status(200).json({
        postUpdateSuccess: 'Post updated successfully!',
        // updatedPost: post,
      });
    } else {
      response.status(400).json({
        postUpdateError: 'Post not found!',
      });
    }
  } catch (error) {
    // console.log(error);;
    response.status(500).json({
      status: 'fail',
      message: error.message,
    });
  }
};

//Publish
const publishPost = async (req, res) => {
  try {
    const { id: postId } = req.params;
    const { isPublic } = req.body;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      throw new HttpException(400, 'Invalid post id!');
    }
    if (typeof isPublic !== 'boolean') {
      throw new HttpException(400, 'Invalid publication value!');
    }
    const blog = await blogSchema.findByIdAndUpdate(
      postId,
      { isPublic },
      { new: true },
    );
    if (!blog) {
      throw new HttpException(404, 'Post not found!');
    }
    return res.status(200).json({
      message: `Post "${blog.title}" has ${
        blog.isPublic ? 'published to' : 'unpublished from'
      }  the public!`,
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};
//Get featured blog
const getFeaturedBlog = async (req, res) => {
  try {
    blogSchema
      .findOne({ isPublic: true })
      .sort({ updatedAt: -1 })
      .populate({ path: 'category', select: 'name' })
      .select('title postImage slug category createdAt updatedAt')
      .exec(function (err, doc) {
        if (err) {
          throw new Error('Unable to retrieve featured blog');
        }
        return res
          .status(200)
          .json({ message: 'Blog retrieved!', blog: doc });
      });
  } catch (error) {
    res.status(500).json({
      status: 'fail',
      message: error.message,
    });
  }
};
// Deleting a post
const deletePost = async (request, response) => {
  try {
    let blog_id = request.params.blog_id;
    if (!mongoose.Types.ObjectId.isValid(blog_id)) {
      return response.status(400).json({
        invalidId:
          'Something went wrong, refresh your page and try again! Invalid blog ID',
      });
    }

    const post = await blogSchema.findOne({ _id: blog_id });

    if (post) {
      let current_user = request.user;

      if (post.createdBy != current_user._id) {
        return response.status(400).json({
          unauthorizedError:
            'Access denied, you are not the creator of this post!',
        });
      } else {
        await post.deleteOne();

        response.status(200).json({
          deletedPost: `Post deleted successfully!`,
        });
      }
    } else {
      response.status(400).json({
        postDeleteError: 'Post not found!',
      });
    }
  } catch (error) {
    // console.log(error);;
    response.status(500).json({
      status: 'fail',
      message: error.message,
    });
  }
};

// Add a category
const addCategory = async (request, response) => {
  try {
    //Validation
    const { error } = categoryValidationSchema.validate(request.body);

    if (error)
      return response
        .status(400)
        .json({ validationError: error.details[0].message });

    const newCategory = new categoryModel({
      name: request.body.name,
      slug: slugify(request.body.name, { lower: true, strict: true }),
    });

    const blogCategory = await newCategory.save();

    response.status(200).json({
      successMessage: 'Category created successfully!',
      categoryContent: blogCategory,
    });
  } catch (error) {
    // console.log(error);;
    if (error.code === 11000 || error.code === 11001) {
      response.status(400).json({
        duplicationError:
          'You already have a category with this name!',
      });
    } else {
      response.status(500).json({
        status: 'fail',
        message: error.message,
      });
    }
  }
};

// Get all categories
const getAllCategories = async (request, response) => {
  try {
    const allCategories = await categoryModel.find();

    response.status(200).json({
      successMessage: 'Successfully retrieved all Categories!',
      allCategories: allCategories,
    });
  } catch (error) {
    // console.log(error);;
    response.status(500).json({
      status: 'fail',
      message: error.message,
    });
  }
};

const updateCategory = async (request, response) => {
  try {
    //Validation
    const { error } = categoryValidationSchema.validate(request.body);

    if (error)
      return response
        .status(400)
        .json({ validationError: error.details[0].message });
    const updated = await categoryModel.findByIdAndUpdate(
      request.params.categoryId,
      {
        name: request.body.name,
      },
      { new: true },
    );
    if (!updated) {
      throw new Error('Category not found');
    }
    response.status(200).json({
      successMessage: 'Category name updated successfully!',
      categoryContent: updated,
    });
  } catch (error) {
    // console.log(error);;
    response.status(500).json({
      status: 'fail',
      message: error.message,
    });
  }
};

const deleteCategory = async (request, response) => {
  try {
    await categoryModel.deleteOne({ _id: request.params.categoryId });

    response.status(200).json({
      successMessage: 'Category deleted successfully!',
    });
  } catch (error) {
    // console.log(error);;
    response.status(500).json({
      status: 'fail',
      message: error.message,
    });
  }
};

// Create a comment
const createComment = async (request, response) => {
  try {
    //Validation
    const { error } = commentValidationSchema.validate(request.body);

    if (error)
      return response
        .status(400)
        .json({ validationError: error.details[0].message });

    let blog_id = request.params.blog_id;

    if (!mongoose.Types.ObjectId.isValid(blog_id)) {
      return response.status(400).json({
        invalidId:
          'Something went wrong, refresh your page and try again!',
      });
    }

    const post = await blogSchema.findOne({ _id: blog_id });
    if (!post.isPublic) {
      throw new HttpException(
        403,
        'Sorry, you can not comment on private post!',
      );
    }

    if (post) {
      const newComment = new blogCommentModel({
        comment: request.body.comment,
        blog_id: blog_id,
        user_id: request.user._id,
        userModel:
          request.user.accountType === 'Google'
            ? 'googleUser'
            : 'User',
      });

      const commentData = await newComment.save();

      const updated = await blogSchema.updateOne(
        { _id: blog_id },
        {
          $push: { blog_comments: commentData._id },
        },
      );

      const populatedComment = await commentData.populate('user_id');

      populatedComment.save();
      response.status(200).json({
        successMessage: 'Comment created successfully!',
        commentContent: populatedComment,
      });
    } else {
      response.status(400).json({
        postUpdateError: 'Post not found!',
      });
    }
  } catch (error) {
    //  // console.log(error);;
    response.status(500).json({
      status: 'fail',
      message: error.message,
    });
  }
};

// Get all comments
const getAllComments = async (request, response) => {
  try {
    let blog_id = request.params.blog_id;

    if (!mongoose.Types.ObjectId.isValid(blog_id)) {
      return response.status(400).json({
        message:
          'Something went wrong, refresh your page and try again!',
      });
    }

    const post = await blogSchema.findOne({ _id: blog_id });

    if (post) {
      let query = [
        {
          $lookup: {
            from: 'users',
            localField: 'user_id',
            foreignField: '_id',
            as: 'normalCommentCreator',
          },
        },
        {
          $lookup: {
            from: 'googleusers',
            localField: 'user_id',
            foreignField: '_id',
            as: 'googleCommentCreator',
          },
        },
        {
          $addFields: {
            commentCreator: {
              $concatArrays: [
                '$normalCommentCreator',
                '$googleCommentCreator',
              ],
            },
          },
        },
        { $unwind: '$commentCreator' },
        {
          $lookup: {
            from: 'commentlikes',
            localField: 'comment_likes',
            foreignField: '_id',
            as: 'commentLikes',
          },
        },
        {
          $match: {
            blog_id: mongoose.Types.ObjectId(blog_id),
          },
        },
        {
          $sort: {
            createdAt: -1,
          },
        },
      ];

      // Only show needed fields
      query.push({
        $project: {
          _id: 1,
          createdAt: 1,
          comment: 1,
          'commentLikes.user_id': 1,
          'postCreator._id': 1,
          'commentCreator._id': 1,
          'commentCreator.firstName': 1,
          'commentCreator.lastName': 1,
          'commentCreator.name': 1,
          'commentCreator.picture': 1,
          comment_likes_count: {
            $size: { $ifNull: ['$comment_likes', []] },
          },
        },
      });

      let allComments = await blogCommentModel.aggregate(query);
      const mapped = allComments.map(doc =>
        blogCommentModel.hydrate(doc),
      );
      // console.log(mapped);
      response.status(200).json({
        allAvailableComments: mapped,
      });
    } else {
      response.status(400).json({
        status: 'fail',
        message: 'Post not found!',
      });
    }
  } catch (error) {
    // console.log(error);;
    response.status(500).json({
      status: 'fail',
      message: error.message,
    });
  }
};

// Update a comment
const updateComment = async (request, response) => {
  try {
    //Validation
    const { error } = commentValidationSchema.validate(request.body);

    if (error)
      return response
        .status(400)
        .json({ validationError: error.details[0].message });

    let comment_id = request.params.comment_id;

    if (!mongoose.Types.ObjectId.isValid(comment_id)) {
      return response.status(400).json({
        invalidId:
          'Something went wrong, refresh your page and try again!',
      });
    }

    const comment = await blogCommentModel.findOne({
      _id: comment_id,
    });

    if (comment) {
      let current_user = request.user;

      if (comment.user_id != current_user._id) {
        return response.status(400).json({
          unauthorizedError:
            'Access denied, you are not the creator of this comment!',
        });
      } else {
        await blogCommentModel.updateOne(
          { _id: comment_id },
          {
            comment: request.body.comment || comment.comment,
          },
        );

        let query = [
          {
            $lookup: {
              from: 'users',
              localField: 'user_id',
              foreignField: '_id',
              as: 'normalCommentCreator',
            },
          },
          {
            $lookup: {
              from: 'googleusers',
              localField: 'user_id',
              foreignField: '_id',
              as: 'googleCommentCreator',
            },
          },
          {
            $addFields: {
              commentCreator: {
                $concatArrays: [
                  '$normalCommentCreator',
                  '$googleCommentCreator',
                ],
              },
            },
          },
          { $unwind: '$commentCreator' },
          {
            $match: {
              _id: mongoose.Types.ObjectId(comment_id),
            },
          },
        ];

        let updatedComment = await blogCommentModel.aggregate(query);

        response.status(200).json({
          commentUpdateSuccess: 'Comment updated successfully!',
          updatedComment: updatedComment[0],
        });
      }
    } else {
      response.status(400).json({
        commentUpdateError: 'Comment not found!',
      });
    }
  } catch (error) {
    // console.log(error);;
    response.status(500).json({
      status: 'fail',
      message: error.message,
    });
  }
};

// Delete a comment
const deleteComment = async (request, response) => {
  try {
    //Validation

    let comment_id = request.params.comment_id;

    if (!mongoose.Types.ObjectId.isValid(comment_id)) {
      return response.status(400).json({
        invalidId:
          'Something went wrong, refresh your page and try again!',
      });
    }

    const comment = await blogCommentModel.findOne({
      _id: comment_id,
    });

    if (comment) {
      let current_user = request.user;

      if (comment.user_id != current_user._id) {
        return response.status(400).json({
          unauthorizedError:
            'Access denied, you are not the creator of this comment!',
        });
      } else {
        await blogCommentModel.deleteOne({ _id: comment_id });
        await blogSchema.updateOne(
          { _id: comment.blog_id },
          {
            $pull: { blog_comments: comment_id },
          },
        );

        response.status(200).json({
          commentDeleteSuccess: 'Comment deleted successfully!',
        });
      }
    } else {
      response.status(400).json({
        commentDeleteError: 'Comment not found!',
      });
    }
  } catch (error) {
    // console.log(error);;
    response.status(500).json({
      status: 'fail',
      message: error.message,
    });
  }
};

// Like a post
const likePost = async (request, response) => {
  try {
    let blog_id = request.params.blog_id;

    if (!mongoose.Types.ObjectId.isValid(blog_id)) {
      return response.status(400).json({
        invalidId:
          'Something went wrong, refresh your page and try again!',
      });
    }

    const blog = await blogSchema.findOne({ _id: blog_id });

    if (!blog) {
      return response.status(400).json({
        messageNoBlog: 'No blog found!',
      });
    } else {
      let current_user = request.user;

      const blog_like = await blogLikeModel.findOne({
        blog_id: blog_id,
        user_id: current_user._id,
      });

      if (!blog_like) {
        const blogLikeDoc = new blogLikeModel({
          blog_id: blog_id,
          user_id: current_user._id,
        });
        let likeData = await blogLikeDoc.save();

        await blogSchema.updateOne(
          { _id: blog_id },
          {
            $push: { blog_likes: likeData._id },
          },
        );

        return response.status(200).json({
          messageLikeAdded: 'Like successfully added!',
        });
      } else {
        await blogLikeModel.deleteOne({
          _id: blog_like._id,
        });

        await blogSchema.updateOne(
          { _id: blog_like.blog_id },
          {
            $pull: { blog_likes: blog_like._id },
          },
        );

        return response.status(200).json({
          messageLikeRemoved: 'Like successfully removed!',
        });
      }
    }
  } catch (error) {
    // console.log(error);;
    response.status(500).json({
      status: 'fail',
      message: error.message,
    });
  }
};

// Like a comment
const likeComment = async (request, response) => {
  try {
    let comment_id = request.params.comment_id;

    if (!mongoose.Types.ObjectId.isValid(comment_id)) {
      return response.status(400).json({
        invalidId:
          'Something went wrong, refresh your page and try again!',
      });
    }

    const comment = await blogCommentModel.findOne({
      _id: comment_id,
    });

    if (!comment) {
      return response.status(400).json({
        messageNoComment: 'No comment found!',
      });
    } else {
      let current_user = request.user;

      const comment_like = await commentLikeModel.findOne({
        comment_id: comment_id,
        user_id: current_user._id,
      });

      if (!comment_like) {
        const commentLikeDoc = new commentLikeModel({
          comment_id: comment_id,
          user_id: current_user._id,
        });
        let likeData = await commentLikeDoc.save();

        await blogCommentModel.updateOne(
          { _id: comment_id },
          {
            $push: { comment_likes: likeData._id },
          },
        );

        return response.status(200).json({
          messageLikeAdded: 'Like successfully added!',
        });
      } else {
        await commentLikeModel.deleteOne({
          _id: comment_like._id,
        });

        await blogCommentModel.updateOne(
          { _id: comment_like.comment_id },
          {
            $pull: { comment_likes: comment_like._id },
          },
        );

        return response.status(200).json({
          messageLikeRemoved: 'Like successfully removed!',
        });
      }
    }
  } catch (error) {
    // console.log(error);;
    response.status(500).json({
      status: 'fail',
      message: error.message,
    });
  }
};

// Comment reply
const commentReply = async (request, response) => {
  try {
    //Validation
    const { error } = commentReplyValidationSchema.validate(
      request.body,
    );

    if (error)
      return response
        .status(400)
        .json({ validationError: error.details[0].message });

    let comment_id = request.params.comment_id;

    if (!mongoose.Types.ObjectId.isValid(comment_id)) {
      return response.status(400).json({
        invalidId:
          'Something went wrong, refresh your page and try again!',
      });
    }

    const comment = await blogCommentModel.findOne({
      _id: comment_id,
    });

    if (comment) {
      const newReply = new commentReplyModel({
        reply: request.body.reply,
        comment_id: comment_id,
        user_id: request.user._id,
        userModel:
          request.user.accountType === 'Google'
            ? 'googleUser'
            : 'User',
      });

      const commentData = await newReply.save();

      await blogCommentModel.updateOne(
        { _id: comment_id },
        {
          $push: { comment_replies: commentData._id },
        },
      );

      const populatedReply = await commentData.populate('user_id');

      response.status(200).json({
        successMessage: 'Reply added successfully!',
        replyContent: populatedReply,
      });
    } else {
      response.status(400).json({
        postUpdateError: 'Post not found!',
      });
    }
  } catch (error) {
    // console.log(error);;
    response.status(500).json({
      status: 'fail',
      message: error.message,
    });
  }
};

// Get all comment replies
const getAllCommentReplies = async (request, response) => {
  try {
    let comment_id = request.params.comment_id;

    if (!mongoose.Types.ObjectId.isValid(comment_id)) {
      return response.status(400).json({
        invalidId:
          'Something went wrong, refresh your page and try again!',
      });
    }

    const comment = await blogCommentModel.findOne({
      _id: comment_id,
    });

    if (comment) {
      let query = [
        {
          $lookup: {
            from: 'users',
            localField: 'user_id',
            foreignField: '_id',
            as: 'normalReplyCreator',
          },
        },
        {
          $lookup: {
            from: 'googleusers',
            localField: 'user_id',
            foreignField: '_id',
            as: 'googleReplyCreator',
          },
        },
        {
          $addFields: {
            replyCreator: {
              $concatArrays: [
                '$normalReplyCreator',
                '$googleReplyCreator',
              ],
            },
          },
        },
        { $unwind: '$replyCreator' },
        {
          $match: {
            comment_id: mongoose.Types.ObjectId(comment_id),
          },
        },
        {
          $sort: {
            createdAt: 1,
          },
        },
      ];

      // Only show needed fields
      query.push({
        $project: {
          _id: 1,
          createdAt: 1,
          reply: 1,
          comment_replies: 1,
          comment_likes: 1,
          'postCreator._id': 1,
          'replyCreator.firstName': 1,
          'replyCreator.lastName': 1,
          'replyCreator.name': 1,
          'replyCreator.picture': 1,
        },
      });

      let allReplies = await commentReplyModel.aggregate(query);

      response.status(200).json({
        allAvailableReplies: allReplies.map(doc =>
          commentReplyModel.hydrate(doc),
        ),
      });
    } else {
      response.status(400).json({
        repliesFoundError: 'Replies not found!',
      });
    }
  } catch (error) {
    // console.log(error);;
    response.status(500).json({
      status: 'fail',
      message: error.message,
    });
  }
};

export default {
  createPost,
  addCategory,
  getAllCategories,
  deleteCategory,
  updateCategory,
  getPosts,
  getSinglePost,
  updatePost,
  getFeaturedBlog,
  deletePost,
  publishPost,
  createComment,
  getAllComments,
  likePost,
  likeComment,
  commentReply,
  updateComment,
  deleteComment,
  getAllCommentReplies,
};
