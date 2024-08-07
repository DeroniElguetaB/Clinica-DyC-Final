import Post from '../models/post.model.js';
import { errorHandler } from '../utils/error.js';

export const create = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, 'Permiso de creación denegado.'));
  }
  // Campos requeridos, sin los campos que queremos hacer opcionales
  const requiredFields = ['title', 'contenido', 'edad', 'sanguineo'];
  for (const field of requiredFields) {
    if (!req.body[field]) {
      return next(errorHandler(400, `Por favor completar todos los campos requeridos: completar ${field} `));
    }
  }
  const slug = req.body.title
    .split(' ')
    .join('-')
    .toLowerCase()
    .replace(/[^a-zA-Z0-9-]/g, '');
  const newPost = new Post({
    ...req.body,
    slug,
    userId: req.user.id,
  });
  try {
    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (error) {
    next(error);
  }
};

export const getposts = async (req, res, next) => {
  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sortDirection = req.query.order === 'asc' ? 1 : -1;
    const posts = await Post.find({
      ...(req.query.userId && { userId: req.query.userId }),
      ...(req.query.category && { category: req.query.category }),
      ...(req.query.slug && { slug: req.query.slug }),
      ...(req.query.postId && { _id: req.query.postId }),
      ...(req.query.searchTerm && {
        $or: [
          { title: { $regex: req.query.searchTerm, $options: 'i' } },
          { content: { $regex: req.query.searchTerm, $options: 'i' } },
          { contenido: { $regex: req.query.searchTerm, $options: 'i' } },
        ],
      }),
    })
      .sort({ updatedAt: sortDirection })
      .skip(startIndex)
      .limit(limit);
    const totalPosts = await Post.countDocuments();
    const now = new Date();
    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );
    const lastMonthPosts = await Post.countDocuments({
      createdAt: { $gte: oneMonthAgo },
    });
    res.status(200).json({
      posts,
      totalPosts,
      lastMonthPosts,
    });
  } catch (error) {
    next(error);
  }
};

export const deletepost = async (req, res, next) => {
  if (!req.user.isAdmin || req.user.id !== req.params.userId) {
    return next(errorHandler(403, 'Permiso de eliminación denegado.'));
  }
  try {
    await Post.findByIdAndDelete(req.params.postId);
    res.status(200).json('Este paciente fue eliminado');
  } catch (error) {
    next(error);
  }
};

export const updatepost = async (req, res, next) => {
  if (!req.user.isAdmin || req.user.id !== req.params.userId) {
    return next(errorHandler(403, 'Permiso de actualizacion denegado.'));
  }
  try {
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.postId,
      {
        $set: {
          title: req.body.title,
          content: req.body.content, // opcional
          contenido: req.body.contenido,
          celular: req.body.celular, // opcional
          celularemergencia: req.body.celularemergencia, // opcional
          email: req.body.email, // opcional
          edad: req.body.edad,
          category: req.body.category,
          sanguineo: req.body.sanguineo,
          direccion: req.body.direccion, // opcional
        },
      },
      { new: true }
    );
    res.status(200).json(updatedPost);
  } catch (error) {
    next(error);
  }
};



// import Post from '../models/post.model.js';
// import { errorHandler } from '../utils/error.js';

// export const create = async (req, res, next) => {
//   if (!req.user.isAdmin) {
//     return next(errorHandler(403, 'You are not allowed to create a post'));
//   }
//   const requiredFields = ['title', 'content', 'contenido', 'celular', 'celularemergencia', 'email', 'edad', 'direccion', 'sanguineo'];
//   for (const field of requiredFields) {
//     if (!req.body[field]) {
//       return next(errorHandler(400, `Por favor completar todos los campos: completar ${field} `));
//     }
//   }
//   const slug = req.body.title
//     .split(' ')
//     .join('-')
//     .toLowerCase()
//     .replace(/[^a-zA-Z0-9-]/g, '');
//   const newPost = new Post({
//     ...req.body,
//     slug,
//     userId: req.user.id,
//   });
//   try {
//     const savedPost = await newPost.save();
//     res.status(201).json(savedPost);
//   } catch (error) {
//     next(error);
//   }
// };


// export const getposts = async (req, res, next) => {
//   try {
//     const startIndex = parseInt(req.query.startIndex) || 0;
//     const limit = parseInt(req.query.limit) || 9;
//     const sortDirection = req.query.order === 'asc' ? 1 : -1;
//     const posts = await Post.find({
//       ...(req.query.userId && { userId: req.query.userId }),
//       ...(req.query.category && { category: req.query.category }),
//       ...(req.query.slug && { slug: req.query.slug }),
//       ...(req.query.postId && { _id: req.query.postId }),
//       ...(req.query.searchTerm && {
//         $or: [
//           { title: { $regex: req.query.searchTerm, $options: 'i' } },
//           { content: { $regex: req.query.searchTerm, $options: 'i' } },
//           { contenido: { $regex: req.query.searchTerm, $options: 'i' } },
//         ],
//       }),
//     })
//       .sort({ updatedAt: sortDirection })
//       .skip(startIndex)
//       .limit(limit);
//     const totalPosts = await Post.countDocuments();
//     const now = new Date();
//     const oneMonthAgo = new Date(
//       now.getFullYear(),
//       now.getMonth() - 1,
//       now.getDate()
//     );
//     const lastMonthPosts = await Post.countDocuments({
//       createdAt: { $gte: oneMonthAgo },
//     });
//     res.status(200).json({
//       posts,
//       totalPosts,
//       lastMonthPosts,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// export const deletepost = async (req, res, next) => {
//   if (!req.user.isAdmin || req.user.id !== req.params.userId) {
//     return next(errorHandler(403, 'You are not allowed to delete this post'));
//   }
//   try {
//     await Post.findByIdAndDelete(req.params.postId);
//     res.status(200).json('The post has been deleted');
//   } catch (error) {
//     next(error);
//   }
// };

// export const updatepost = async (req, res, next) => {
//   if (!req.user.isAdmin || req.user.id !== req.params.userId) {
//     return next(errorHandler(403, 'You are not allowed to update this post'));
//   }
//   try {
//     const updatedPost = await Post.findByIdAndUpdate(
//       req.params.postId,
//       {
//         $set: {
//           title: req.body.title,
//           content: req.body.content,
//           contenido: req.body.contenido,
//           celular: req.body.celular,
//           celularemergencia: req.body.celularemergencia,
//           email: req.body.email,
//           edad: req.body.edad,
//           category: req.body.category,
//           sanguineo:req.body.sanguineo,
//           direccion:req.body.direccion,
//         },
//       },
//       { new: true }
//     );
//     res.status(200).json(updatedPost);
//   } catch (error) {
//     next(error);
//   }
// };