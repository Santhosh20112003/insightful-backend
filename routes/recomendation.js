import express from "express";
import supabase from "../config/supabase.js";

const router = express.Router();

router.post("/fetchBlogRecomendation", async (req, res) => {
  try {
    const { uid } = req.body;

    const {data,error} = await supabase
      .from("blogs")
      .select("*")
      .eq("uid", uid)
	  .limit(3);

    if (error) {
      throw new Error(error.message);
    }
    console.log(data)
    res.send(data);
  } catch (err) {
    console.log("Error on fetching Comrade Details", err);
  }
});

export default router;