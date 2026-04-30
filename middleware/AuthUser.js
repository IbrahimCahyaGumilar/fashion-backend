import User from "../models/UserModel.js";

export const verifyUser = async (req, res, next) => {
    // 1. Cek session
    if (!req.session.userId) {
        return res.status(401).json({ msg: "Mohon login ke akun Anda!" });
    }

    try {
        // 2. Cari user di database berdasarkan UUID yang ada di session
        const user = await User.findOne({
            where: {
                uuid: req.session.userId
            }
        });

        if (!user) return res.status(404).json({ msg: "User tidak ditemukan" });

        // 3. Simpan data user ke dalam objek request (req) 
        req.id = user.id;
        req.userId = user.uuid;
        req.role = user.role;

        next(); 
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}

export const adminOnly = async (req, res, next) => {
    try {
        if (req.role !== "admin") {
            return res.status(403).json({ msg: "Akses terlarang (Khusus Admin)" });
        }
        next();
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}