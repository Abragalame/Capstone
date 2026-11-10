/* Orders (table: orders). Students can read/update only their own rows; staff & admin see all. */
const OrdersService = {
  ref: () => ({ databaseId: CONFIG.databaseId, tableId: CONFIG.tables.orders }),
  newNumber: () => 'MCPI-' + String(Date.now()).slice(-6),
  fromRow(r) {
    return {
      id: r.$id, no: r.orderNo, uid: r.userId, name: r.name, grade: r.grade, mode: r.mode, room: r.room || '',
      items: JSON.parse(r.items || '[]'), total: Number(r.total), time: r.pickTime, notes: r.notes || '',
      st: r.st, acc: !!r.acc,
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
      },
      permissions: [Permission.read(Role.user(userId)), Permission.update(Role.user(userId))],
    });
    return this.fromRow(row);
  },
  async update(id, patch) {
    await AW.db.updateRow({ ...this.ref(), rowId: id, data: patch });
  },
};
