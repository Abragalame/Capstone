import { Client, Users, Query } from 'node-appwrite';

// Runs server-side with a dynamic API key (scopes: users.read, users.write).
// Only callers whose account has the "admin" label may use it.
const has = (labels, name) => labels.some((l) => l.toLowerCase() === name);

export default async ({ req, res, error }) => {
  try {
    const callerId = req.headers['x-appwrite-user-id'];
    if (!callerId) return res.json({ error: 'Please sign in.' }, 401);

    const client = new Client()
      .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
      .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
      .setKey(req.headers['x-appwrite-key']);
    const users = new Users(client);

    const caller = await users.get({ userId: callerId });
    if (!has(caller.labels, 'admin')) return res.json({ error: 'Admins only.' }, 403);

    const { action, userId, role } = req.bodyJson ?? {};

    if (action === 'list') {
      const list = await users.list({ queries: [Query.limit(100), Query.orderDesc('$createdAt')] });
      return res.json({
        users: list.users.map((u) => ({ id: u.$id, name: u.name, email: u.email, labels: u.labels })),
      });
    }

    if (action === 'setRole') {
      if (!userId || !['student', 'staff'].includes(role)) {
        return res.json({ error: 'Invalid request.' }, 400);
      }
      const target = await users.get({ userId });
      if (has(target.labels, 'admin')) return res.json({ error: 'Cannot change an admin.' }, 400);

      const labels = target.labels.filter((l) => l.toLowerCase() !== 'staff');
      if (role === 'staff') labels.push('staff');
      await users.updateLabels({ userId, labels });
      return res.json({ ok: true });
    }

    return res.json({ error: 'Unknown action.' }, 400);
  } catch (e) {
    error(String(e));
    return res.json({ error: 'Server error.' }, 500);
  }
};
