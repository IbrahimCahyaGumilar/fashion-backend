import User from "../models/UserModel.js";
import argon2 from "argon2";

export const Login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Cek input kosong
        if (!email || !password) {
            return res.status(400).json({ msg: "Email dan password wajib diisi" });
        }

        // 2. Cari user berdasarkan email
        const user = await User.findOne({
            where: { email: email }
        });

        // 3. Jika user tidak ditemukan, gunakan pesan generic demi keamanan
        if (!user) return res.status(404).json({ msg: "User tidak ditemukan" });

        // 4. Verifikasi password
        const match = await argon2.verify(user.password, password);
        if (!match) return res.status(400).json({ msg: "Password salah" });

        // 5. Simpan session menggunakan UUID
        req.session.userId = user.uuid;

        // 6. Kirim respon sukses
        const { uuid, name, role } = user;
        res.status(200).json({ uuid, name, email: user.email, role });

    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}

export const Me = async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ msg: "Mohon login ke akun Anda!" });
        }

        const user = await User.findOne({
            attributes: ['uuid', 'name', 'email', 'role'],
            where: {
                uuid: req.session.userId
            }
        });

        if (!user) return res.status(404).json({ msg: "User tidak ditemukan" });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}

export const logOut = (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.status(400).json({ msg: "Tidak dapat logout" });

        // untuk menghapus cookie di browser
        // Nama cookie default express-session adalah 'connect.sid'
        res.clearCookie('connect.sid');
        
        res.status(200).json({ msg: "Anda telah logout" });
    });
}