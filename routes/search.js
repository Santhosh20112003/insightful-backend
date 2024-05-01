import express from "express";
import supabase from "../config/supabase.js";

const router = express.Router();

router.get("/bypost/:query", async (req, res) => {
  const { query } = req.params;
  const filter = req.query.filter === "false" ? false : true;
  try {
    const { data: TitleDetails, error: TitleError } = await supabase
      .from("blogs")
      .select("*")
      .ilike("title", `%${query}%`);

    if (TitleError) {
      throw new Error(TitleError.message);
    }

    const { data: ContentDetails, error: ContentError } = await supabase
      .from("blogs")
      .select("*")
      .ilike("content", `%${query}%`);

    if (ContentError) {
      throw new Error(ContentError.message);
    }

    const combinedData = [];
    const processedBlogIds = new Set();

    const processBlog = async (blog) => {
      if (!processedBlogIds.has(blog.blogid)) {
        const { data: user, error: userError } = await supabase
          .from("users")
          .select("name, email, photourl")
          .eq("uid", blog.uid)
          .single();

        if (userError) {
          throw new Error(userError.message);
        }

        combinedData.push({
          blogid: blog.blogid,
          uid: blog.uid,
          name: user.name,
          email: user.email,
          title: blog.title,
          content: blog.content,
          creation_time: blog.creation_time,
          image: blog.image,
          likes: blog.likes,
          tag: blog.tag,
          photourl: user.photourl,
        });

        processedBlogIds.add(blog.blogid);
      }
    };

    for (let i = 0; i < TitleDetails.length; i++) {
      await processBlog(TitleDetails[i]);
    }

    for (let i = 0; i < ContentDetails.length; i++) {
      await processBlog(ContentDetails[i]);
    }

    combinedData.sort((a, b) => {
      if (filter) {
        return new Date(b.creation_time) - new Date(a.creation_time);
      } else {
        return new Date(a.creation_time) - new Date(b.creation_time);
      }
    });

    res.status(200).json(combinedData.slice(0, 5));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/bypeople/:query", async (req, res) => {
  let { query } = req.params;
  let filter = req.query.filter === "false";
  try {
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .ilike("name", `%${query}%`);

    if (userError) {
      throw new Error(userError.message);
    }

    if (userData.length === 0) {
      res.status(200).json([]);
      return;
    }

    const { data: blogsData, error: blogsError } = await supabase
      .from("blogs")
      .select("*")
      .eq("uid", userData[0].uid)
      .order("creation_time", { asc: false })
      .limit(20);

    if (blogsError) {
      throw new Error(blogsError.message);
    }

    const combinedData = blogsData.map((blog) => {
      const user = userData.find((user) => user.uid === blog.uid);
      return {
        blogid: blog.blogid,
        uid: blog.uid,
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

    combinedData.sort((a, b) => {
      if (filter) {
        return new Date(b.creation_time) - new Date(a.creation_time);
      } else {
        return new Date(a.creation_time) - new Date(b.creation_time);
      }
    });

    res.status(200).json(combinedData.slice(0, 5));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/bytag/:query", async (req, res) => {
  let { query } = req.params;
  try {
    const { data: TitleDetails, error: TitleError } = await supabase
      .from("blogs")
      .select("*")
      .contains("tag", [query]);

    if (TitleError) {
      throw new Error(TitleError.message);
    }

    const enhancedDetails = [];

    for (let i = 0; i < TitleDetails.length; i++) {
      const blog = TitleDetails[i];

      const { data: user, error: userError } = await supabase
        .from("users")
        .select("name, email, photourl")
        .eq("uid", blog.uid)
        .single();

      if (userError) {
        throw new Error(userError.message);
      }

      enhancedDetails.push({
        blogid: blog.blogid,
        uid: blog.uid,
        name: user.name,
        email: user.email,
        title: blog.title,
        content: blog.content,
        creation_time: blog.creation_time,
        image: blog.image,
        likes: blog.likes,
        tag: blog.tag,
        photourl: user.photourl,
      });
    }

    res.status(200).json(enhancedDetails.slice(0, 5));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/authenticated/bypost/:query", async (req, res) => {
  const { query } = req.params;
  const { uid } = req.body;
  const filter = req.query.filter === "false" ? false : true;
  try {
    const { data: TitleDetails, error: TitleError } = await supabase
      .from("blogs")
      .select("*")
      .ilike("title", `%${query}%`);

    if (TitleError) {
      throw new Error(TitleError.message);
    }

    const { data: AuthDetails, error: AuthError } = await supabase
      .from("users")
      .select("*")
      .eq("uid", uid);

    if (AuthError) {
      throw new Error(AuthError.message);
    }

    const BookmarkArray = AuthDetails[0].bookmarks || [];

    const { data: ContentDetails, error: ContentError } = await supabase
      .from("blogs")
      .select("*")
      .ilike("content", `%${query}%`);

    if (ContentError) {
      throw new Error(ContentError.message);
    }

    const combinedData = [];
    const processedBlogIds = new Set();

    const processBlog = async (blog) => {
      if (!processedBlogIds.has(blog.id)) {
        const { data: user, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("uid", blog.uid)
          .single();

        if (userError) {
          throw new Error(userError.message);
        }

        combinedData.push({
          blogid: blog.blogid,
          uid: blog.uid,
          name: user.name,
          email: user.email,
          title: blog.title,
          content: blog.content,
          creation_time: blog.creation_time,
          image: blog.image,
          likes: blog.likes,
          tag: blog.tag,
          photourl: user.photourl,
          isBookmarked: BookmarkArray.includes(blog.blogid),
        });

        processedBlogIds.add(blog.id);
      }
    };

    for (let i = 0; i < TitleDetails.length; i++) {
      await processBlog(TitleDetails[i]);
    }

    for (let i = 0; i < ContentDetails.length; i++) {
      await processBlog(ContentDetails[i]);
    }

    combinedData.sort((a, b) => {
      if (filter) {
        return new Date(b.creation_time) - new Date(a.creation_time);
      } else {
        return new Date(a.creation_time) - new Date(b.creation_time);
      }
    });

    res.status(200).json(combinedData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/authenticated/bypeople/:query", async (req, res) => {
  let { query } = req.params;
  const { uid } = req.body;
  let filter = req.query.filter === "false";
  console.log(query)
  try {
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .ilike("name", `${query}%`);

    if (userError) {
      throw new Error(userError.message);
    }

    const { data: AuthDetails, error: AuthError } = await supabase.from("users")
      .select("*")
      .eq("uid", uid);

    if (AuthError) {
      throw new Error(AuthError.message);
    }

    const BookmarkArray = AuthDetails[0].bookmarks || [];

    if (userData.length === 0) {
      res.status(200).json([]);
      return;
    }

    const { data: blogsData, error: blogsError } = await supabase
      .from("blogs")
      .select("*")
      .eq("uid", userData[0].uid)
      .order("creation_time", { ascending: !filter })
      .limit(20);

    if (blogsError) {
      throw new Error(blogsError.message);
    }

    const combinedData = blogsData.map((blog) => {
      const user = userData.find((user) => user.uid === blog.uid);
      return {
        blogid: blog.blogid,
        uid: blog.uid,
        name: user.name,
        email: user.email,
        title: blog.title,
        content: blog.content,
        creation_time: blog.creation_time,
        image: blog.image,
        likes: blog.likes,
        tag: blog.tag,
        photourl: user.photourl,
        isBookmarked: BookmarkArray.includes(blog.blogid),
      };
    });

    combinedData.sort((a, b) => {
      if (filter) {
        return new Date(b.creation_time) - new Date(a.creation_time);
      } else {
        return new Date(a.creation_time) - new Date(b.creation_time);
      }
    });
    console.log(combinedData)

    res.status(200).json(combinedData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// router.post("/authenticated/bytag/:query", async (req, res) => {
//   let { query } = req.params;
//   const { uid } = req.body;
//   try {
//     const { data: TitleDetails, error: TitleError } = await supabase
//       .from("blogs")
//       .select("*")
//       .contains("tag", [query]);

//     if (TitleError) {
//       throw new Error(TitleError.message);
//     }

//     const { data: AuthDetails, error: AuthError } = await supabase
//       .from("users")
//       .select("*")
//       .eq("uid", uid);

//     if (AuthError) {
//       throw new Error(AuthError.message);
//     }

//     const BookmarkArray = AuthDetails[0].bookmarks || [];

//     const enhancedDetails = [];

//     for (let i = 0; i < TitleDetails.length; i++) {
//       const blog = TitleDetails[i];

//       const { data: user, error: userError } = await supabase
//         .from("users")
//         .select("name, email, photourl")
//         .eq("uid", blog.uid)
//         .single();

//       if (userError) {
//         throw new Error(userError.message);
//       }

//       enhancedDetails.push({
//         blogid: blog.blogid,
//         uid: blog.uid,
//         name: user.name,
//         email: user.email,
//         title: blog.title,
//         content: blog.content,
//         creation_time: blog.creation_time,
//         image: blog.image,
//         likes: blog.likes,
//         tag: blog.tag,
//         photourl: user.photourl,
//         isBookmarked: BookmarkArray.includes(blog.blogid),
//       });
//     }

//     res.status(200).json(enhancedDetails);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

export default router;
