/* Admin-only actions run in the manage-users Appwrite Function (it holds the server key). */
const AdminService = {
  async call(body) {
    const exec = await AW.functions.createExecution({
      functionId: CONFIG.functionId,
      body: JSON.stringify(body),
      async: false,
      method: AW.ExecutionMethod.POST,
      headers: { 'content-type': 'application/json' },
    });
    let data = {};
    try { data = JSON.parse(exec.responseBody || '{}'); } catch (e) { /* ignore */ }
    if (exec.responseStatusCode >= 400) throw new Error(data.error || 'Request failed');
    return data;
  },
  async listUsers() {
    return (await this.call({ action: 'list' })).users;
  },
  async setStall(userId, stall) {
    await this.call({ action: 'setStall', userId, stall: Number(stall) });
  },
  async setRole(userId, role) {
    await this.call({ action: 'setRole', userId, role });
  },
};
