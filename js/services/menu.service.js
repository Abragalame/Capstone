/* Menu items (table: menu_items). The UI uses short field names (n, p, c ...) from the original demo.
   Text from staff is HTML-escaped here once, so every existing template can print it safely.
   The unescaped copy lives in item._raw for the edit form.
   Row IDs are numeric strings so the original inline onclick="add(123)" handlers keep working. */
const MenuService = {
  ref: () => ({ databaseId: CONFIG.databaseId, tableId: CONFIG.tables.menu }),
  fromRow(r) {
    return {
      id: r.$id, stall: Number(r.stall), img: r.imageId || '', f: r.legacyPhoto || '',
      n: esc(r.name), d: esc(r.description || ''), e: esc(r.emoji || '🍽️'), c: r.category || 'Meals',
      p: Number(r.price), s: r.status || 'ok', pop: r.popular ? 1 : 0, t: r.prepMin || 5,
      _raw: { name: r.name, description: r.description || '', emoji: r.emoji || '' },
    };
  },
  toData(m) {
    return {
      name: m.name, description: m.description, price: m.price, stall: m.stall, category: m.category,
      emoji: m.emoji, status: m.status, popular: m.popular, prepMin: m.prepMin,
      imageId: m.imageId || '', legacyPhoto: m.legacyPhoto || '',
    };
  },
  async list() {
    const res = await AW.db.listRows({ ...this.ref(), queries: [AW.Query.limit(100)] });
    return res.rows.map((r) => this.fromRow(r)).sort((a, b) => a.stall - b.stall || a.id - b.id);
  },
  async create(m, userId, rowId) {
    await AW.db.createRow({ ...this.ref(), rowId: rowId || String(Date.now()), data: { ...this.toData(m), createdBy: userId } });
  },
  async update(id, m) {
    await AW.db.updateRow({ ...this.ref(), rowId: String(id), data: this.toData(m) });
  },
  async remove(id) {
    await AW.db.deleteRow({ ...this.ref(), rowId: String(id) });
  },
};
