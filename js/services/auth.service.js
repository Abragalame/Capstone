/* Accounts. Everyone who registers is a student; staff/admin come from Appwrite user labels
   (only the manage-users function or the Console can change labels). */
const AuthService = {
  /* Privileges come ONLY from labels (browsers can't change them). prefs only decide whether to show
     the "waiting for approval" page to someone with no role label yet. */
  roleFromLabels(labels, prefs) {
    labels = (labels || []).map((l) => String(l).toLowerCase());
    if (labels.includes('admin')) return 'admin';
    if (labels.includes('staff')) return 'staff';
    if (labels.includes('teacher')) return 'teacher';
    const st = prefs && prefs.reqStatus;
    return (st === 'pending' || st === 'declined') && prefs.req ? 'pending' : 'student';
  },
  async current() {
    try {
      const u = await AW.account.get();
      return { id: u.$id, name: u.name, email: u.email, role: this.roleFromLabels(u.labels, u.prefs), prefs: u.prefs || {},
        stalls: (u.labels || []).map((l) => /^stall([1-7])$/i.exec(String(l))).filter(Boolean).map((m) => +m[1]) };
    } catch (e) {
      return null;
    }
  },
  async login(email, password) {
    await AW.account.createEmailPasswordSession({ email, password });
  },
  async register({ name, email, password, prefs }) {
    await AW.account.create({ userId: AW.ID.unique(), email, password, name });
    await AW.account.createEmailPasswordSession({ email, password });
    await AW.account.updatePrefs({ prefs });
  },
  /* updatePrefs REPLACES all prefs, so merge with what is stored (keeps the approval request fields). */
  async savePrefs(prefs) {
    let cur = {};
    try { cur = (await AW.account.getPrefs()) || {}; } catch (e) { /* ignore */ }
    await AW.account.updatePrefs({ prefs: { ...cur, ...prefs } });
  },
  async logout() {
    await AW.account.deleteSession({ sessionId: 'current' });
  },
  friendly(e) {
    if (e && e.code === 401) return 'Wrong email or password.';
    if (e && e.code === 409) return 'That email is already registered. Try logging in.';
    if (e && e.code === 429) return 'Too many attempts. Please wait a minute and try again.';
    return (e && e.message) || 'Something went wrong. Please try again.';
  },
};
