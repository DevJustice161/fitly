const db = require("../config/db");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");

exports.findUser = async (req, res) => {
  try {
    const { id } = req.params;

    const [user] = await db.query("SELECT * FROM users where id = ?", [id]);
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch user" });
  }
};

exports.findVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const [vendor] = await db.query("SELECT * FROM vendors where user_id = ?", [
      id,
    ]);
    res.json(vendor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch vendor" });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address, city, state, country } = req.body;
    const avatar = req.file ? req.file.filename : null;

    const updateData = { name, email, phone, address, city, state, country };
    if (avatar) {
      updateData.avatar = avatar;
    }
    const [user] = await db.query("SELECT * FROM users where id = ?", [id]);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (req.file) {
      if (user.avatar) {
        const oldAvatarPath = path.join(
          __dirname,
          "../uploads/avatars",
          user.avatar,
        );
        if (fs.existsSync(oldAvatarPath)) {
          fs.unlinkSync(oldAvatarPath);
        }
      }
    }

    await db.query("UPDATE users SET ? WHERE id = ?", [updateData, id]);

    const [updatedUser] = await db.query("SELECT * FROM users where id = ?", [
      id,
    ]);
    res.json({
      message: "User updated successfully",
      user: updatedUser[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update user" });
  }
};

exports.updateUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required.",
      });
    }

    const [users] = await db.query("SELECT password FROM users WHERE id = ?", [
      id,
    ]);

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const user = users[0];

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect.",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.query("UPDATE users SET password = ? WHERE id = ?", [
      hashedPassword,
      id,
    ]);

    return res.status(200).json({
      success: true,
      message: "Password updated successfully.",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const [user] = await db.query("SELECT * FROM users where id = ?", [id]);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.avatar) {
      const avatarPath = path.join(
        __dirname,
        "../uploads/avatars",
        user.avatar,
      );
      if (fs.existsSync(avatarPath)) {
        fs.unlinkSync(avatarPath);
      } else {
        console.warn(`Avatar file not found: ${avatarPath}`);
      }
    }

    await db.query("DELETE FROM users WHERE id = ?", [id]);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete user" });
  }
};
