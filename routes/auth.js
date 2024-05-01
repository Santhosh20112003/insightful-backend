const express = require("express");
const transporter = require("../config/nodemailer.js");
const { supabase } = require("../config/supabase.js");
const { SignupTemplte } = require("../emails/templates.js");

const router = express.Router();

router.post("/checkandcreate/", async (req, res) => {
  const { uid, name, email, provider, photourl } = req.body;
  let userObject;

  try {
    const { data: existingUser, error: queryError } = await supabase
      .from("users")
      .select("*")
      .eq("uid", uid);

    if (queryError) {
      throw new Error(queryError.message);
    }

    if (existingUser && existingUser.length > 0) {
      userObject = existingUser[0];
      userObject["isNew"] = false;
      res.status(200).json(userObject);
    } else {
      const { data: newUser, error: createError } = await supabase
        .from("users")
        .insert([{ uid, name, email, provider, photourl }])
        .select();

      if (createError) {
        throw new Error(createError.message);
      }

      userObject = newUser[0];
      userObject["isNew"] = true;

      transporter
        .sendMail({
          from: process.env.EMAIL_USER,
          to: userObject.email,
          subject: "Welcome to Our Insightful Blog App Community!",
          html: SignupTemplte(userObject.name),
        })
        .then((info) => {
          console.log("Email sent: " + info.response);
        })
        .catch((error) => {
          console.log(error);
        });

      res.status(201).json(userObject);
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while creating/checking user data." });
  }
});

router.get("/getpostbyuserid/:uid", async (req, res) => {
  const { uid } = req.params;

  try {
    const { data: BlogDetails, error: queryError } = await supabase
      .from("blogs")
      .select("blogid, content, creation_time, email, image, tag, title")
      .eq("uid", uid);

    if (queryError) {
      throw new Error(queryError.message);
    }

    res.status(200).json(BlogDetails);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching user data." });
  }
});

router.post("/getcomradebyid", async (req, res) => {
  const { comrades } = req.body;

  try {
    const comradeDetails = [];

    if (!comrades || comrades.length === 0) {
      return res.status(200).json([]);
    }

    for (const comradeUid of comrades) {
      const { data: comradeDetail, error: queryError } = await supabase
        .from("users")
        .select("uid, name, designation, photourl, comrades")
        .eq("uid", comradeUid)
        .single();

      console.log(comradeDetail)

      if (queryError) {
        throw new Error(queryError.message);
      }

      comradeDetails.push(comradeDetail);
    }

    res.status(200).json(comradeDetails);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        error: `An error occurred while fetching comrade data. ${error}`,
      });
  }
});

router.post("/setdesignation", async (req, res) => {
  const { uid, designation } = req.body;

  try {
    const { data: updatedUser, error: updateError } = await supabase
      .from("users")
      .update({ designation: designation })
      .eq("uid", uid)
      .single();

    if (updateError) {
      throw new Error(updateError.message);
    }

    res
      .status(200)
      .json({ message: "Designation updated successfully", updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/deleteblog", async (req, res) => {
  const { uid, blogid } = req.body;

  try {
    const { data: updatedUser, error: updateError } = await supabase
      .from("blogs")
      .delete()
      .eq("blogid", blogid)
      .eq("uid", uid)
      .select()
      .single();

    res.status(200).json({ message: "Blog deleted successfully", updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
