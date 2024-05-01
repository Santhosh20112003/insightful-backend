const express = require("express");
const { supabase } = require("../config/supabase.js");

const router = express.Router();

router.get("/getcomradedetails/:uid", async (req, res) => {
  const { uid } = req.params;

  try {
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("uid, name, email, comrades, provider, photourl, designation")
      .eq("uid", uid)
      .single();
    if (userError) {
      throw new Error(userError.message);
    }

    const { data: blogs, error: blogsError } = await supabase
      .from("blogs")
      .select("*")
      .eq("uid", uid);

    if (blogsError) {
      throw new Error(blogsError.message);
    }

    const posts = blogs.map((blog) => ({
      blogid: blog.blogid,
      uid: blog.uid,
      title: blog.title,
      content: blog.content,
      creation_time: blog.creation_time,
      image: blog.image,
      likes: blog.likes,
      tag: blog.tag,
    }));

    const response = {
      uid: user.uid,
      name: user.name,
      email: user.email,
      comrades: user.comrades,
      provider: user.provider,
      photourl: user.photourl,
      designation: user.designation,
      posts: posts,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching user data." });
  }
});

router.post("/authenticated/getcomradedetails/:uid", async (req, res) => {
  const { uid } = req.params;
  const { userid } = req.body;

  try {
    const { data: ownerDetail, error: ownerError } = await supabase
      .from("users")
      .select("comrades")
      .eq("uid", userid)
      .single();

    const ComradeArray = ownerDetail.comrades || [];

    if (ownerError) {
      throw new Error(ownerError.message);
    }

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("uid, name, email, comrades, provider, photourl, designation")
      .eq("uid", uid)
      .single();

    if (userError) {
      throw new Error(userError.message);
    }

    const { data: blogs, error: blogsError } = await supabase
      .from("blogs")
      .select("*")
      .eq("uid", uid);

    if (blogsError) {
      throw new Error(blogsError.message);
    }

    const posts = blogs.map((blog) => ({
      blogid: blog.blogid,
      uid: blog.uid,
      title: blog.title,
      content: blog.content,
      creation_time: blog.creation_time,
      image: blog.image,
      likes: blog.likes,
      tag: blog.tag,
    }));

    const response = {
      uid: user.uid,
      name: user.name,
      email: user.email,
      comrades: user.comrades,
      provider: user.provider,
      photourl: user.photourl,
      designation: user.designation,
      iscomrade: ComradeArray.includes(uid),
      posts: posts,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching user data." });
  }
});

router.post("/addandremovecomrade", async (req, res) => {
  const { uid, comradeid } = req.body;

  try {
    const { data: existingUser, error: userError } = await supabase
      .from("users")
      .select("comrades")
      .eq("uid", uid)
      .single();

    if (userError) {
      throw new Error(userError.message);
    }

    let comradesArray = existingUser.comrades || [];

    let updatedComrades = [];
    if (comradesArray && comradesArray.includes(comradeid)) {
      updatedComrades = comradesArray.filter((id) => id !== comradeid);
    } else {
      updatedComrades = [...comradesArray, comradeid];
    }

    const { data: updatedUser, error: updateError } = await supabase
      .from("users")
      .update({ comrades: updatedComrades })
      .eq("uid", uid)
      .select()
      .single();

    if (updateError) {
      throw new Error(updateError.message);
    }

    res
      .status(200)
      .json({ message: "Comrade added/removed successfully", updatedUser });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;