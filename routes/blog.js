import express from "express";
import supabase from "../config/supabase.js";

const router = express.Router();

router.get("/recentblog", async (req, res) => {
  try {
    const { data: allBlogs, error: blogError } = await supabase
      .from("blogs")
      .select("*");

    if (blogError) {
      throw new Error(blogError.message);
    }

    const { data: profiles, error: profileError } = await supabase
      .from("users")
      .select("*");

    if (profileError) {
      throw new Error(profileError.message);
    }

    const combinedData = allBlogs.map((blog) => {
      const user = profiles.find((profile) => profile.uid === blog.uid);
      return {
        blogid: blog.blogid,
        uid: user.uid,
        name: user.name,
        email: user.email,
        title: blog.title,
        content: blog.content,
        creation_time: blog.creation_time,
        image: blog.image,
        likes: blog.likes,
        tag: blog.tag,
        photourl: user.photourl,
      };
    });

    combinedData.sort(
      (a, b) => new Date(b.creation_time) - new Date(a.creation_time)
    );

    const uniqueUserBlogs = combinedData.reduce((acc, curr) => {
      if (!acc.find((item) => item.uid === curr.uid)) {
        acc.push(curr);
      }
      return acc;
    }, []);

    res.status(200).json(uniqueUserBlogs.slice(0, 5));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/trendingblogs/:count", async (req, res) => {
  const { count } = req.params;
  try {
    const { data: allBlogs, error: blogError } = await supabase
      .from("blogs")
      .select("*");
    if (blogError) {
      throw new Error(blogError.message);
    }

    const { data: profiles, error: profileError } = await supabase
      .from("users")
      .select("*");
    if (profileError) {
      throw new Error(profileError.message);
    }

    const combinedData = allBlogs.map((blog) => {
      const user = profiles.find((profile) => profile.uid === blog.uid);
      return {
        blogid: blog.blogid,
        uid: user.uid,
        name: user.name,
        email: user.email,
        title: blog.title,
        content: blog.content,
        creation_time: blog.creation_time,
        image: blog.image,
        likes: blog.likes,
        tag: blog.tag,
        photourl: user.photourl,
      };
    });

    res.status(200).json(combinedData.slice(0, count));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/highComradesUsers/:count", async (req, res) => {
  const { count } = req.params;
  try {
    const { data: users, error } = await supabase.from("users").select("*");

    if (error) {
      throw new Error(error.message);
    }

    const filteredUsers = users.filter(
      (user) => user.comrades && user.comrades.length > 0
    );

    filteredUsers.sort((a, b) => b.comrades.length - a.comrades.length);

    res.status(200).json(filteredUsers.slice(0, count));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/PopularTags/:count", async (req, res) => {
  try {
    const count = parseInt(req.params.count);
    const tagsList = [];
    const { data: tags, error } = await supabase.from("blogs").select("tag");

    if (error) {
      throw new Error(error.message);
    }

    tags.forEach((tagObject) => {
      if (tagObject.tag) {
        tagsList.push(tagObject.tag);
      }
    });

    const combinedArray = [...new Set([].concat(...tagsList))]
      .slice(0, count)
      .sort();

    res.status(200).json(combinedArray);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/createblog", async (req, res) => {
  const { uid, image, title, email, content, tag } = req.body;

  try {
    const { data, error } = await supabase
      .from("blogs")
      .insert({
        uid: uid,
        email: email,
        title: title,
        content: content,
        creation_time: new Date(),
        image: image,
        tag: tag,
      })
      .select();

    if (error) {
      throw new Error(error.message);
    }
    res.status(201).json({ message: "Blog created successfully", data: data });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/updateblog", async (req, res) => {
  const { uid, image, title, content, tag, blogid } = req.body;

  try {
    const { data, error } = await supabase
      .from("blogs")
      .update({ title: title, content: content, image: image, tag: tag })
      .eq("blogid", blogid)
      .eq("uid", uid)
      .select()
      .single();
    console.log(data);

    if (error) {
      throw new Error(error.message);
    }

    return res.status(200).json({ message: "Blog updated successfully", data });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to update blog post" });
  }
});

router.post("/checkandreturn", async (req, res) => {
  const { uid, blogid } = req.body;

  if (!blogid) {
    res.status(400).json({ message: "Blog ID is required" });
    return;
  }

  try {
    const { data, error } = await supabase
      .from("blogs")
      .select("*")
      .match({ blogid: blogid, uid: uid });

    if (error) {
      throw new Error(error.message);
    }

    if (data.length < 1) {
      res.status(401).json({ message: "Blog not found" });
      return;
    }

    res.status(200).json(data[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/getblogsbyid", async (req, res) => {
  const { blogs } = req.body;

  try {
    const BlogsDetails = [];

    if (!blogs || blogs.length === 0) {
      return res.status(200).json([]);
    }

    for (const blogid of blogs) {
      const { data: BlogsDetail, error: queryError } = await supabase
        .from("blogs")
        .select("*")
        .eq("blogid", blogid)
        .single();

      if (queryError) {
        throw new Error(queryError.message);
      }

      BlogsDetails.push(BlogsDetail);
    }

    res.status(200).json(BlogsDetails);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching comrade data." });
  }
});

router.post("/fetchblogs", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 4;
  const { uid } = req.body;

  try {
    const offset = (page - 1) * limit;

    const { data: userComrades, error: comradesError } = await supabase
      .from("users")
      .select("comrades, bookmarks ,designation")
      .eq("uid", uid)
      .single();

    if (comradesError) {
      throw new Error(comradesError.message);
    }

    let comradeIds = userComrades.comrades || [];
    const bookmarksArray = userComrades.bookmarks || [];

    if (comradeIds.length === 0) {
      const { data: allBlogs } = await supabase
        .from("blogs")
        .select("*")
        .neq("uid", uid)
        .range(offset, offset + limit - 1);

      const randomBlogs = allBlogs.map(async (blog) => {
        const likesArray = blog.likes || [];

        const { data: user, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("uid", blog.uid)
          .single();

        if (userError) {
          throw new Error(userError.message);
        }

        const isPresent = false;
        const isLiked = likesArray.includes(uid);

        return {
          blogid: blog.blogid,
          uid: blog.uid,
          name: user.name,
          designation: user.designation,
          email: user.email,
          comrades: user.comrades,
          title: blog.title,
          content: blog.content,
          creation_time: blog.creation_time,
          image: blog.image,
          likes: blog.likes,
          tag: blog.tag,
          photourl: user.photourl,
          isBookmarked: isPresent,
          isLiked: isLiked,
        };
      });

      const resolvedRandomBlogs = await Promise.all(randomBlogs);

      res.status(200).json({
        total: resolvedRandomBlogs.length,
        page: page,
        limit: limit,
        blogs: resolvedRandomBlogs,
      });
      return;
    }

    const { data: blogs, error } = await supabase
      .from("blogs")
      .select("*")
      .in("uid", comradeIds)
      .neq("uid", uid)
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(error.message);
    }

    const enhancedBlogs = [];

    for (let i = 0; i < blogs.length; i++) {
      const blog = blogs[i];
      const likesArray = blog.likes || [];

      const { data: user, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("uid", blog.uid)
        .single();

      if (userError) {
        throw new Error(userError.message);
      }

      let isPresent = bookmarksArray.includes(blog.blogid);
      let isLiked = likesArray.includes(uid);

      enhancedBlogs.push({
        blogid: blog.blogid,
        uid: blog.uid,
        name: user.name,
        designation: user.designation,
        comrades:user.comrades,
        email: user.email,
        title: blog.title,
        content: blog.content,
        creation_time: blog.creation_time,
        image: blog.image,
        likes: blog.likes,
        tag: blog.tag,
        photourl: user.photourl,
        isBookmarked: isPresent,
        isLiked: isLiked,
      });
    }

    enhancedBlogs.sort((a, b) => {
      return new Date(b.creation_time) - new Date(a.creation_time);
    });

    res.status(200).json({
      total: enhancedBlogs.length,
      page: page,
      limit: limit,
      blogs: enhancedBlogs,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/handpicked", async (req, res) => {
  const { uid } = req.body;

  try {
    const { data: uniqueUsers, error: userError } = await supabase
      .from("users")
      .select("uid")
      .neq("uid", uid);
    console.log(uniqueUsers);

    if (userError) {
      throw new Error(userError.message);
    }

    const uniqueUserIds = uniqueUsers.map((user) => user.uid);

    const existingBlogIds = [];

    const enhancedBlogs = [];

    for (let i = 0; i < uniqueUserIds.length; i++) {
      const userId = uniqueUserIds[i];

      const { data: userBlogs, error: blogsError } = await supabase
        .from("blogs")
        .select("*")
        .eq("uid", userId)
        .order("creation_time", { ascending: false })
        .range(0, 20);

      if (blogsError) {
        throw new Error(blogsError.message);
      }

      for (let j = 0; j < userBlogs.length; j++) {
        const blog = userBlogs[j];

        if (!existingBlogIds.includes(blog.blogid)) {
          existingBlogIds.push(blog.blogid);

          const { data: user, error: userError } = await supabase
            .from("users")
            .select("*")
            .eq("uid", blog.uid)
            .single();

          if (userError) {
            throw new Error(userError.message);
          }

          if (blog.uid !== uid) {
            enhancedBlogs.push({
              blogid: blog.blogid,
              uid: blog.uid,
              name: user.name,
              email: user.email,
              comrades: user.comrades,
              designation: user.designation,
              title: blog.title,
              content: blog.content,
              creation_time: blog.creation_time,
              image: blog.image,
              likes: blog.likes,
              tag: blog.tag,
              photourl: user.photourl,
            });
          }
        }
      }
    }

    enhancedBlogs.sort((a, b) => {
      return b.likes - a.likes;
    });

    res.status(200).json(enhancedBlogs.slice(0, 5));
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/addandremovelike", async (req, res) => {
  const { uid, blogid } = req.body;

  try {
    const { data: existingBlog, error: blogError } = await supabase
      .from("blogs")
      .select("likes")
      .eq("blogid", blogid)
      .single();

    if (blogError) {
      throw new Error(blogError.message);
    }

    let likesArray = existingBlog.likes || [];

    let updatedLikes = [];
    if (likesArray && likesArray.includes(uid)) {
      updatedLikes = likesArray.filter((id) => id !== uid);
    } else {
      updatedLikes = [...likesArray, uid];
    }

    const { data: updatedBlog, error: updateError } = await supabase
      .from("blogs")
      .update({ likes: updatedLikes })
      .eq("blogid", blogid)
      .select()
      .single();

    if (updateError) {
      throw new Error(updateError.message);
    }

    res
      .status(200)
      .json({ message: "Likes updated successfully", updatedBlog });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/addandremovebookmark", async (req, res) => {
  const { uid, blogid } = req.body;

  try {
    const { data: existingUser, error: userError } = await supabase
      .from("users")
      .select("bookmarks")
      .eq("uid", uid)
      .single();

    if (userError) {
      throw new Error(userError.message);
    }

    const { data: BlogDetails, error: BlogError } = await supabase
      .from("blogs")
      .select("*")
      .eq("blogid", blogid)
      .single();

    if (BlogError) {
      throw new Error(BlogError.message);
    }

    let bookmarksArray = existingUser.bookmarks || [];

    let updatedBookmarks = [];
    if (bookmarksArray && bookmarksArray.includes(blogid)) {
      updatedBookmarks = bookmarksArray.filter((id) => id !== blogid);
    } else {
      updatedBookmarks = [...bookmarksArray, blogid];
    }

    const { data: updatedUser, error: updateError } = await supabase
      .from("users")
      .update({ bookmarks: updatedBookmarks })
      .eq("uid", uid)
      .select()
      .single();

    if (updateError) {
      throw new Error(updateError.message);
    }

    res.status(200).json({
      message: "Bookmarks updated successfully",
      updatedUser,
      BlogDetails,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/fetchComradesArray", async (req, res) => {
  try {
    const { uid } = req.body;

    const {data,error} = await supabase
      .from("users")
      .select("*")
      .contains("comrades", [uid]);

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
