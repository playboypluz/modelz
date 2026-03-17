// api/cloudinary.js
// Vercel / Netlify serverless function
// Proxies Cloudinary Admin API so CLOUDINARY_API_SECRET never touches the browser.
//
// Endpoints (query param: action=...):
//   GET  ?action=list_models          — list all model profile assets
//   GET  ?action=list_photos&folder=  — list gallery photos for a model
//   POST ?action=update_context       — update metadata on an asset
//   POST ?action=delete_asset         — delete a single asset
//   POST ?action=delete_folder        — delete all assets in a folder + folder

const https = require('https');

const CLOUD  = process.env.CLOUDINARY_CLOUD_NAME;
const KEY    = process.env.CLOUDINARY_API_KEY;
const SECRET = process.env.CLOUDINARY_API_SECRET;

function cloudinaryRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const auth = Buffer.from(`${KEY}:${SECRET}`).toString('base64');
    const bodyStr = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'api.cloudinary.com',
      path: `/v1_1/${CLOUD}${path}`,
      method,
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        ...(bodyStr ? { 'Content-Length': Buffer.byteLength(bodyStr) } : {}),
      },
    };
    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

// Cloudinary Search API — find all assets tagged as profile cards
async function listModels() {
  const result = await cloudinaryRequest(
    'POST', '/resources/search',
    { expression: 'tags=modelz_profile', max_results: 500, with_field: ['context', 'tags'] }
  );
  return result;
}

// List all photos in a model's folder (excludes the profile asset itself)
async function listPhotos(folder) {
  const result = await cloudinaryRequest(
    'GET',
    `/resources/image?type=upload&prefix=${encodeURIComponent(folder + '/')}&max_results=500`,
    null
  );
  return result;
}

// Update context (metadata) on an asset — used for saving profile edits
async function updateContext(public_id, context) {
  const ctxString = Object.entries(context)
    .map(([k, v]) => `${k}=${String(v).replace(/[|=]/g, '')}`)
    .join('|');
  const result = await cloudinaryRequest(
    'POST', '/resources/image/context',
    { public_ids: [public_id], context: ctxString }
  );
  return result;
}

// Delete a single asset
async function deleteAsset(public_id) {
  const result = await cloudinaryRequest(
    'DELETE',
    `/resources/image/upload?public_ids=${encodeURIComponent(public_id)}`,
    null
  );
  return result;
}

// Delete all resources in a folder
async function deleteFolder(folder) {
  // Delete all resources first
  await cloudinaryRequest('DELETE', `/resources/image/upload?prefix=${encodeURIComponent(folder)}&all=true`, null);
  // Then delete the folder itself
  const result = await cloudinaryRequest('DELETE', `/folders/${encodeURIComponent(folder)}`, null);
  return result;
}

module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  if (!CLOUD || !KEY || !SECRET) {
    res.status(500).json({ error: 'Cloudinary env vars not configured' });
    return;
  }

  const action = req.query.action;

  try {
    if (req.method === 'GET' && action === 'list_models') {
      const r = await listModels();
      res.status(r.status).json(r.body);

    } else if (req.method === 'GET' && action === 'list_photos') {
      const folder = req.query.folder;
      if (!folder) { res.status(400).json({ error: 'folder required' }); return; }
      const r = await listPhotos(folder);
      res.status(r.status).json(r.body);

    } else if (req.method === 'POST' && action === 'update_context') {
      const { public_id, context } = req.body;
      if (!public_id || !context) { res.status(400).json({ error: 'public_id and context required' }); return; }
      const r = await updateContext(public_id, context);
      res.status(r.status).json(r.body);

    } else if (req.method === 'POST' && action === 'delete_asset') {
      const { public_id } = req.body;
      if (!public_id) { res.status(400).json({ error: 'public_id required' }); return; }
      const r = await deleteAsset(public_id);
      res.status(r.status).json(r.body);

    } else if (req.method === 'POST' && action === 'delete_folder') {
      const { folder } = req.body;
      if (!folder) { res.status(400).json({ error: 'folder required' }); return; }
      const r = await deleteFolder(folder);
      res.status(r.status).json(r.body);

    } else {
      res.status(400).json({ error: 'Unknown action' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
