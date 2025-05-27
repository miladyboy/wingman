require("dotenv").config();

// Provide a default secret to satisfy authService tests when the variable is
// not defined by the developer's local environment. Do **not** use this in
// production — it is only meant for unit tests.
if (!process.env.SUPABASE_JWT_SECRET) {
  process.env.SUPABASE_JWT_SECRET = "test-secret-key";
}
