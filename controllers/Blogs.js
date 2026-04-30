import Blog from "../models/BlogModel.js";
import User from "../models/UserModel.js";
import { v2 as cloudinary } from 'cloudinary'; // Import cloudinary untuk hapus file

// 1. GET ALL BLOGS (Tetap Sama)

export const getBlogs = async (req, res) => {
    try {
        let response;
        if (req.userId) {
            if (req.role === "admin") {
                response = await Blog.findAll({
                    attributes: ['uuid', 'title', 'slug', 'image', 'description', 'content', 'createdAt'],
                    include: [{ model: User, as: 'author', attributes: ['name', 'email'] }],
                    order: [['createdAt', 'DESC']]
                });
            } else {
                response = await Blog.findAll({
                    where: { userId: req.userId },
                    attributes: ['uuid', 'title', 'slug', 'image', 'description', 'content', 'createdAt'],
                    include: [{ model: User, as: 'author', attributes: ['name', 'email'] }],
                    order: [['createdAt', 'DESC']]
                });
            }
        } else {
            response = await Blog.findAll({
                attributes: ['uuid', 'title', 'slug', 'image', 'description', 'content', 'createdAt'],
                include: [{ model: User, as: 'author', attributes: ['name'] }],
                order: [['createdAt', 'DESC']]
            });
        }
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}

// 2. GET BY SLUG (Tetap Sama)
export const getBlogBySlug = async (req, res) => {
    try {
        const response = await Blog.findOne({
            where: { slug: req.params.slug },
            attributes: ['uuid', 'title', 'slug', 'image', 'description', 'content', 'createdAt'],
            include: [{ model: User, as: 'author', attributes: ['name', 'email'] }]
        });
        if (!response) return res.status(404).json({ msg: "Artikel tidak ditemukan" });
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}

// 3. CREATE BLOG
export const createBlog = async (req, res) => {
    const { title, description, content } = req.body;

    if (!req.file) return res.status(400).json({ msg: "Mohon upload gambar cover" });

    // Cloudinary menyimpan URL di properti 'path'
    const imageUrl = req.file.path;

    const slug = title.toLowerCase()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');

    try {
        await Blog.create({
            title,
            slug,
            image: imageUrl, // Simpan URL Cloudinary ke DB
            description,
            content,
            userId: req.userId
        });
        res.status(201).json({ msg: "Blog Berhasil Dibuat" });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}

// 4. UPDATE BLOG
export const updateBlog = async (req, res) => {
    try {
        const blog = await Blog.findOne({ where: { uuid: req.params.id } });
        if (!blog) return res.status(404).json({ msg: "Data tidak ditemukan" });

        const { title, description, content } = req.body;

        if (req.role !== "admin" && req.userId !== blog.userId) {
            return res.status(403).json({ msg: "Akses terlarang" });
        }

        let imageUrl = blog.image;
        if (req.file) {
            imageUrl = req.file.path; // Ambil URL baru jika upload
        }

        let newSlug = blog.slug;
        if (title) {
            newSlug = title.toLowerCase().replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
        }

        await Blog.update({
            title, slug: newSlug, description, content, image: imageUrl
        }, {
            where: { uuid: blog.uuid }
        });

        res.status(200).json({ msg: "Blog Berhasil Diupdate" });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}

// 5. DELETE BLOG
export const deleteBlog = async (req, res) => {
    try {
        const blog = await Blog.findOne({ where: { uuid: req.params.id } });
        if (!blog) return res.status(404).json({ msg: "Data tidak ditemukan" });

        if (req.role !== "admin" && req.userId !== blog.userId) {
            return res.status(403).json({ msg: "Akses terlarang" });
        }

        await Blog.destroy({ where: { uuid: blog.uuid } });
        res.status(200).json({ msg: "Blog Berhasil Dihapus" });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}