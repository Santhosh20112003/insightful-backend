import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://tuozwtvqglebbaueohaw.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1b3p3dHZxZ2xlYmJhdWVvaGF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTA4NTY2MjQsImV4cCI6MjAyNjQzMjYyNH0.CfSijV94B0COBgoeiEyXUEvSDLA4txqjwAvR4-LT7u0"
);

export default supabase;
