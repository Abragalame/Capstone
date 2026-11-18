import { Client, Users, Query } from 'node-appwrite';

// Runs server-side with a dynamic API key (scopes: users.read, users.write).
// Only callers whose account has the "admin" label may use it.
const has = (labels, name) => labels.some((l) => l.toLowerCase() === name);
const ROLE_LABELS = ['staff', 'teacher', 'admin'];

/* Rebuild a label list for a role. Keeps unrelated labels, drops old role/stall labels. */
const withRole = (labels, role, stall) => {
  const out = labels.filter((l) => !ROLE_LABELS.includes(l.toLowerCase()) && !/^stall[1-7]$/i.test(l));
  if (role !== 'student') out.push(role);
  if (role === 'staff' && stall > 0) out.push('stall' + stall);
  return out;
};

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

    const { action, userId, role, stall } = req.bodyJson ?? {};

    if (action === 'list') {
      const list = await users.list({ queries: [Query.limit(100), Query.orderDesc('$createdAt')] });
      return res.json({
        users: list.users.map((u) => ({ id: u.$id, name: u.name, email: u.email, labels: u.labels, prefs: u.prefs ?? {} })),
      });
    }

    /* everything below changes one other (non-admin) user */
    if (!userId) return res.json({ error: 'Invalid request.' }, 400);
    const n = Number(stall ?? 0);
    if (!Number.isInteger(n) || n < 0 || n > 7) return res.json({ error: 'Invalid request.' }, 400);
    const target = await users.get({ userId });
    if (has(target.labels, 'admin')) return res.json({ error: 'Cannot change an admin.' }, 400);

    const setApproval = (status) => users.updatePrefs({ userId, prefs: { ...(target.prefs ?? {}), reqStatus: status } });

    if (action === 'setRole') {
      if (!['student', 'teacher', 'staff', 'admin'].includes(role)) return res.json({ error: 'Invalid request.' }, 400);
      await users.updateLabels({ userId, labels: withRole(target.labels, role, 0) });
      await setApproval('approved'); /* also clears a pending / declined request */
      return res.json({ ok: true });
    }

    /* approve a Teacher / Staff request: the admin decides the final role (staff, teacher or admin) */
    if (action === 'approve') {
      if (!['teacher', 'staff', 'admin'].includes(role)) return res.json({ error: 'Invalid request.' }, 400);
      await users.updateLabels({ userId, labels: withRole(target.labels, role, role === 'staff' ? n : 0) });
      await setApproval('approved');
      return res.json({ ok: true });
    }

    if (action === 'decline') {
      await setApproval('declined');
      return res.json({ ok: true });
    }

    if (action === 'setStall') {
      if (!has(target.labels, 'staff')) return res.json({ error: 'Make this user staff first.' }, 400);
      await users.updateLabels({ userId, labels: withRole(target.labels, 'staff', n) });
      return res.json({ ok: true });
    }

    return res.json({ error: 'Unknown action.' }, 400);
  } catch (e) {
    error(String(e));
    return res.json({ error: 'Server error.' }, 500);
  }
};
