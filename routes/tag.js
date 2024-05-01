const express = require("express");
const { supabase } = require("../config/supabase.js");

const router = express.Router();

router.get("/fetchPostsbyTag/:topic", async (req, res) => {
  const { topic } = req.params;
  let filter = req.query.filter === "false";
  try {
    const { data: blogsData, error: blogsError } = await supabase
      .from("blogs")
      .select("*")
      .contains("tag", [topic]);

    if (blogsError) {
      throw new Error(blogsError.message);
    }

    const userIds = blogsData.map((blog) => blog.uid);

    const { data: usersData, error: usersError } = await supabase
      .from("users")
      .select("*")
      .in("uid", userIds);

    if (usersError) {
      throw new Error(usersError.message);
    }

    const combinedData = blogsData.map((blog) => {
      const user = usersData.find((user) => user.uid === blog.uid);
      return {
        blogid: blog.blogid,
        uid: user.uid,
        name: user.name,
        email: user.email,
        photourl: user.photourl,
        designation: user.designation,
        title: blog.title,
        content: blog.content,
        creation_time: blog.creation_time,
        image: blog.image,
        likes: blog.likes,
        tag: blog.tag,
      };
    });
    combinedData.sort((a, b) => {
      if (filter) {
        return new Date(b.creation_time) - new Date(a.creation_time);
      } else {
        return new Date(a.creation_time) - new Date(b.creation_time);
      }
    });
    res.status(200).json(combinedData);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/fetchUniqueTags/:tag", async (req, res) => {
  const { tag: topic } = req.params;
  const limit = Number(req.query.limit) || 20;

  try {
    const { data, error } = await supabase
      .from("blogs")
      .select("tag")
      .order("creation_time");

    if (error) {
      throw new Error(error.message);
    }

    const uniqueTagsSet = new Set(data.flatMap((item) => item.tag));
    const uniqueTagsArray = Array.from(uniqueTagsSet)
      .filter((tag) => tag.toLowerCase() !== topic.toLowerCase())
      .slice(0, limit - 1);

    if (!uniqueTagsArray.includes(topic)) {
      uniqueTagsArray.unshift(topic);
    }

    res.status(200).json(uniqueTagsArray);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/fetchUniqueTags", async (req, res) => {
  const limit = Number(req.query.limit) || 20;

  try {
    const { data, error } = await supabase
      .from("blogs")
      .select("tag")
      .order("creation_time");

    if (error) {
      throw new Error(error.message);
    }

    const uniqueTagsSet = new Set(data.flatMap((item) => item.tag));
    const uniqueTagsArray = Array.from(uniqueTagsSet).slice(0, limit);

    res.status(200).json(uniqueTagsArray);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});


router.get("/fetchUniqueMoreTags", async (req, res) => {
  const limit = 50;

  try {
    const { data, error } = await supabase
      .from("blogs")
      .select("tag")
      .order("creation_time");

    if (error) {
      throw new Error(error.message);
    }
    
    const uniqueTagsSet = new Set(data.flatMap((item) => item.tag));
    const uniqueTagsArray = Array.from(uniqueTagsSet).slice(0, limit);

    res.status(200).json(uniqueTagsArray);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
