/* Accounts. Everyone who registers is a student; staff/admin come from Appwrite user labels
   (only the manage-users function or the Console can change labels). */
const AuthService = {
  roleFromLabels(labels) {
    labels = (labels || []).map((l) => String(l).toLowerCase());
    return labels.includes('admin') ? 'admin' : labels.includes('staff') ? 'staff' : 'student';
  },
  async current() {
    try {
      const u = await AW.account.get();
      return { id: u.$id, name: u.name, email: u.email, role: this.roleFromLabels(u.labels), prefs: u.prefs || {} };
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
  async savePrefs(prefs) {
    await AW.account.updatePrefs({ prefs });
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
