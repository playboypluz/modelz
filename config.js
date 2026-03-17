// api/config.js
// Serves public-safe config to the frontend.
// SUPABASE_URL and SUPABASE_ANON_KEY are safe to expose to the browser
// (they are public keys — Supabase Row Level Security controls access).
// This just keeps them out of the source code / git history.

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=3600');

  const url  = process.env.SUPABASE_URL;
  const key  = process.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    res.status(500).json({ error: 'Supabase env vars not set' });
    return;
  }

  res.status(200).json({ url, key });
};
