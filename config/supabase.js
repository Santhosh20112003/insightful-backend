const { createClient } = require("@supabase/supabase-js");
const dotenv = require("dotenv");
dotenv.config();

const supabase = createClient(process.env.DB_URL, process.env.DB_SECRET);

module.exports = supabase;
