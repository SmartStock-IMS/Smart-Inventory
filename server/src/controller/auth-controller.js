const jwt = require("jsonwebtoken");
const db = require("../models");

exports.validateToken = (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    res.status(401).json({ message: "Unauthorized" });
  }

  try {
    // decode JWT token into token, secret_key, user_data & exp_time
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.status(200).json({ valid: true, user: decoded });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      res.status(401).json({ message: "Token expired" });
    }
    res.status(401).json({ message: "Invalid token" });
  }
};

exports.validateUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email & Password is required" });
    }

    // const users = await db.User.findAll();
    const user = await db.User.findOne({
      where: { email: email, password: password },
    });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        type: user.user_type_id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES },
    );

    const userData = {
      user_code: user.user_code,
      user_type: user.user_type_id,
    }

    res
      .status(200)
      .json({ message: "User found.", auth: token, data: userData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
