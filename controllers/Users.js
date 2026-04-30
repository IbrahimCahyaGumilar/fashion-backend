import User from "../models/UserModel.js";
import argon2 from "argon2";

export const getUsers = async (req, res) => {
    try {
        const response = await User.findAll({
            attributes: ['uuid', 'name', 'email', 'role'],
            order: [['createdAt', 'ASC']] // ASC = Terlama ke Terbaru
        });
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}

export const getUserById = async (req, res) => {
    try {
        const response = await User.findOne({
            attributes: ['uuid', 'name', 'email', 'role'],
            where: {
                uuid: req.params.id
            }
        });
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}

export const createUser = async (req, res) => {

    const { name, email, password, confPassword, role } = req.body;


    if (!name || !email || !password || !confPassword || !role) {
        return res.status(400).json({ msg: "Semua field wajib diisi" });
    }

    if (password !== confPassword) {
        return res.status(400).json({ msg: "Password dan konfirmasi tidak cocok" });
    }

    const strongPasswordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/;
    if (!strongPasswordRegex.test(password)) {
        return res.status(400).json({
            msg: "Password harus minimal 6 karakter, mengandung huruf besar, angka, dan simbol.",
        });
    }

    try {
        const hashPassword = await argon2.hash(password);

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ msg: "Email sudah terdaftar." });
        }

  
        await User.create({
            name,
            email,
            password: hashPassword,
            role: role,
        });

        return res.status(201).json({ msg: "Pendaftaran berhasil" });

    } catch (error) {
        console.error("Error saat register:", error);
        return res.status(500).json({ msg: "Terjadi kesalahan pada server" });
    }
};



export const updateUser = async (req, res) => {
    try {
        const user = await User.findOne({
            where: { uuid: req.params.id }
        });
        if (!user) return res.status(404).json({ msg: "User tidak ditemukan" });

        const { name, email, password, confPassword, role } = req.body;

        let hashPassword;
        
        if (!password || password === "") {
            hashPassword = user.password;
        } else {
     
            if (password !== confPassword) return res.status(400).json({ msg: "Password dan Confirm Password tidak cocok" });
            hashPassword = await argon2.hash(password);
        }

        await User.update({
            name: name || user.name,
            email: email || user.email,
            password: hashPassword,
            role: role || user.role
        }, {
            where: {
                uuid: user.uuid 
            }
        });
        res.status(200).json({ msg: "User Updated" });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}

export const deleteUser = async (req, res) => {
    try {
        const user = await User.findOne({
            where: { uuid: req.params.id }
        });
        if (!user) return res.status(404).json({ msg: "User tidak ditemukan" });

        await User.destroy({
            where: {
                uuid: user.uuid
            }
        });
        res.status(200).json({ msg: "User Deleted" });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}