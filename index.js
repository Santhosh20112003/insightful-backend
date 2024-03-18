import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const supabase = createClient(process.env.DB_URL, process.env.DB_SECRET);

app.use(cors());
app.use(express.json());

app.get("/fetchall", async (req, res) => {
  const { data } = await supabase.from("countries").select();
  res.status(200).json(data);
});

app.post("/addentry", async (req, res) => {
  const { name, email } = req.body;
  const { data, error } = await supabase
    .from("countries")
    .insert({
      name: name,
      email: email,
    })
    .select();
  error
    ? res.status(400).json("Unable to Create Resource")
    : res.status(200).json(data);
});

app.post("/deleteentry", async (req, res) => {
  const { name, email } = req.body;
  const { error } = await supabase
    .from("countries")
    .delete()
    .eq("email", email);
  error
    ? res.status(400).json("Unable to Delete Resource")
    : res.status(200).json("Entry Deleted");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
