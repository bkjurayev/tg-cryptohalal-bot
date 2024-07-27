const User = require("../../models/User");
// const Order = require("../models/Order");

class AuthMiddleware {
    async register(req, res, next) {
        try {
            const { name, chatId, action } = req.body;
            if (!name || !chatId || !action) {
                return res.json({
                    status: "bad",
                    msg: "Hamma qatorlarni to'ldiring (server)",
                });
            }

            // if (username === process.env.ADMIN_LOGIN) {
            //     return res.json({
            //         status: "bad",
            //         msg: "Bu usernamedan foydalanish mumkin emas!",
            //     });
            // }

            // if (password.length < 8) {
            //     return res.json({
            //         status: "bad",
            //         msg: "Parol kamida 8 ta belgidan tashkil topishi kerak!",
            //     });
            // }

            // const existUser = await User.findOne({ chatId });

            // if (existUser) {
            //     return res.json({
            //         status: "bad",
            //         msg: "Bu username allaqachon tizimda mavjud. Iltimos, boshqasini tanlang",
            //     });
            // }

            next();
        } catch (error) {
            console.log('Error while auth middleware', error.message);
        }
    }

    async login(req, res, next) {
        try {
            const { username, password } = req.body;
            if (!username || !password) {
                return res.json({
                    status: "bad",
                    msg: "Hamma qatorlarni to'ldiring",
                });
            }

            const existUser = await User.findOne({ username });

            if (!existUser) {
                return res.json({
                    status: "bad",
                    msg: "Siz kiritgan username bo'yicha hech qanday account topilmadi!",
                });
            }

            const comparedPass = await bcrypt.compare(password, existUser.password);

            if (!comparedPass) {
                return res.json({
                    status: "bad",
                    msg: "Parol noto'g'ri kiritildi!",
                });
            }

            next();
        } catch (error) {
            console.log(error.message);
        }
    }

    async admin(req, res, next) {
        try {
            const { username, password } = req.body

            if (!username || !password) {
                return res.json({ status: "bad", msg: "Hamma qatorlarni to'ldiring!" });
            }

            if (username !== process.env.ADMIN_LOGIN) {
                return res.json({ status: "bad", msg: "Username noto'g'ri terilgan" });
            }

            if (password !== process.env.ADMIN_PASS) {
                return res.json({ status: "bad", msg: "Parol noto'g'ri terilgan" });
            }

            next()
        } catch (error) {
            console.log(error.message);
        }
    }
}

module.exports = AuthMiddleware;