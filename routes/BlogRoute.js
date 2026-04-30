import express from "express";
import multer from "multer";
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import {
    getBlogs,
    getBlogBySlug,
    createBlog,
    updateBlog,
    deleteBlog
} from "../controllers/Blogs.js";
import { verifyUser } from "../middleware/AuthUser.js";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

// KONFIGURASI CLOUDINARY
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'blog_images', // Folder di dashboard Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  },
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5000000 } // 5MB
});

// --- ROUTES ---
router.get('/blogs', getBlogs);
router.get('/blogs/:slug', getBlogBySlug);
router.get('/myblogs', verifyUser, getBlogs);

// Gunakan upload.single("file") seperti sebelumnya
router.post('/blogs', verifyUser, upload.single("file"), createBlog);
router.patch('/blogs/:id', verifyUser, upload.single("file"), updateBlog);
router.delete('/blogs/:id', verifyUser, deleteBlog);

export default router;