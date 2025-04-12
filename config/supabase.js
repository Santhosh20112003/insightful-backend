import { createClient } from "@supabase/supabase-js";

// const supabase = createClient(
//   "https://tuozwtvqglebbaueohaw.supabase.co",
//   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1b3p3dHZxZ2xlYmJhdWVvaGF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTA4NTY2MjQsImV4cCI6MjAyNjQzMjYyNH0.CfSijV94B0COBgoeiEyXUEvSDLA4txqjwAvR4-LT7u0"
// );

const supabase = createClient(
  "https://pdnuftqvlbwuatfxouaa.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkbnVmdHF2bGJ3dWF0ZnhvdWFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ0Njg3OTUsImV4cCI6MjA2MDA0NDc5NX0.zs0sy_pBuz0AdiHJWh0RKXvgV-6EhNbCJQP088JI9iM"
);

export default supabase;
