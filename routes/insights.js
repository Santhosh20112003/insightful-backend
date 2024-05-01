const express = require("express");
const { supabase } = require("../config/supabase.js");

const router = express.Router();

router.get("/fetch/:count", async (req, res) => {
  const { count } = req.params;
  try {
    const { data, error } = await supabase.from("insights").select("*");

    if (error) {
      throw new Error(error.message);
    }

    res.status(200).json(data.slice(0, count));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
module.exports = router;
