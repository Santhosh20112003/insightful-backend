import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const supabase = createClient(process.env.DB_URL, process.env.DB_SECRET);

export default supabase;
