import express from "express";
import jwt from "jsonwebtoken";
import supabase from "../config/supabase.js";
const router = express.Router();

router.post("/createToken", async (req, res) => {
  try {
    const { userid } = req.body;

    const { data: users, error } = await supabase
      .from("users")
      .select("*")
      .eq("uid", userid);

    if (error) {
      throw new Error(error.message);
    }

    if (!users || users.length < 1) {
      return res.status(404).json({ error: "User not found" });
    } else {
      const user = users[0];
      const token = jwt.sign({ userid: user.uid }, process.env.JWT_SECRET);
      res.status(200).json({ token });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
});
export default router;
