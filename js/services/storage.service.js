/* Food photos. Images are shrunk in the browser before upload to keep the site fast. */
const StorageService = {
  async compress(file, max = 1000, quality = 0.82) {
    try {
      if (!file.type.startsWith('image/') || file.type === 'image/gif') return file;
      const bmp = await createImageBitmap(file);
      const k = Math.min(1, max / Math.max(bmp.width, bmp.height));
      const c = document.createElement('canvas');
      c.width = Math.round(bmp.width * k);
      c.height = Math.round(bmp.height * k);
      c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
      const blob = await new Promise((r) => c.toBlob(r, 'image/jpeg', quality));
      return new File([blob], file.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' });
    } catch (e) {
      return file;
    }
  },
  async upload(file) {
    const small = await this.compress(file);
    const res = await AW.storage.createFile({ bucketId: CONFIG.bucketId, fileId: AW.ID.unique(), file: small });
    return res.$id;
  },
  async remove(fileId) {
    if (!fileId) return;
    try { await AW.storage.deleteFile({ bucketId: CONFIG.bucketId, fileId }); } catch (e) { /* already gone */ }
  },
  url(fileId) {
    return `${CONFIG.endpoint}/storage/buckets/${CONFIG.bucketId}/files/${fileId}/view?project=${CONFIG.projectId}`;
  },
};
