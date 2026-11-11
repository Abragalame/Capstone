/* Orders (table: orders). Students can read/update only their own rows; staff & admin see all. */
const OrdersService = {
  ref: () => ({ databaseId: CONFIG.databaseId, tableId: CONFIG.tables.orders }),
  newNumber: () => 'MCPI-' + String(Date.now()).slice(-6),
  /* overall status from the per-stall statuses */
  deriveSt(parts) {
    const v = Object.values(parts);
    if (!v.length) return 0;
    if (v.every((x) => x >= 3)) return 3;
    if (v.every((x) => x >= 2)) return 2;
    return v.some((x) => x >= 1) ? 1 : 0;
  },
  fromRow(r) {
    const items = JSON.parse(r.items || '[]'), parts = {};
    for (let i = 1; i <= 7; i++) if (typeof r['s' + i] === 'number' && r['s' + i] >= 0) parts[i] = r['s' + i];
    if (!Object.keys(parts).length) { /* order made before per-stall tracking */
      const ids = [...new Set(items.map((x) => x.stall).filter(Boolean))];
      (ids.length ? ids : [1]).forEach((i) => { parts[i] = r.st; });
    }
    return {
      id: r.$id, no: r.orderNo, uid: r.userId, name: r.name, grade: r.grade, mode: r.mode, room: r.room || '',
      items, parts, total: Number(r.total), time: r.pickTime, notes: r.notes || '',
      st: this.deriveSt(parts), acc: !!r.acc,
    };
  },
  async listMine(userId) {
    const res = await AW.db.listRows({
      ...this.ref(),
      queries: [AW.Query.equal('userId', userId), AW.Query.orderAsc('$createdAt'), AW.Query.limit(100)],
    });
    return res.rows.map((r) => this.fromRow(r));
  },
  async listAll() {
    const res = await AW.db.listRows({ ...this.ref(), queries: [AW.Query.orderAsc('$createdAt'), AW.Query.limit(100)] });
    return res.rows.map((r) => this.fromRow(r));
  },
  async create(o, userId) {
    const { Permission, Role } = AW;
    const row = await AW.db.createRow({
      ...this.ref(),
      rowId: AW.ID.unique(),
      data: {
        orderNo: o.no, userId, name: o.name, grade: o.grade, mode: o.mode, room: o.room,
        items: JSON.stringify(o.items), total: o.total, pickTime: o.time, notes: o.notes, st: 0, acc: false,
        ...Object.fromEntries([1, 2, 3, 4, 5, 6, 7].map((i) => ['s' + i, o.items.some((x) => x.stall == i) ? 0 : -1])),
      },
      permissions: [Permission.read(Role.user(userId)), Permission.update(Role.user(userId))],
    });
    return this.fromRow(row);
  },
  /* One stall changes only ITS column, so two stalls working at once never overwrite each other. */
  async setPart(o, stallId, value) {
    const row = await AW.db.updateRow({ ...this.ref(), rowId: o.id, data: { ['s' + stallId]: value, acc: true } });
    const fresh = this.fromRow(row);
    if (row.st !== fresh.st) await AW.db.updateRow({ ...this.ref(), rowId: o.id, data: { st: fresh.st } });
    return fresh;
  },
  async finishAll(o) {
    const data = { st: 3, ...Object.fromEntries(Object.keys(o.parts).map((i) => ['s' + i, 3])) };
    return this.fromRow(await AW.db.updateRow({ ...this.ref(), rowId: o.id, data }));
  },
  async update(id, patch) {
    await AW.db.updateRow({ ...this.ref(), rowId: id, data: patch });
  },
};
