/* ===== Edit this file only: your Appwrite IDs and the 7 stalls ===== */
const CONFIG = {
  endpoint: 'https://sgp.cloud.appwrite.io/v1', // region taken from your capstone.sgp.appwrite.run URL
  projectId: '6af37ffe0007eaf736fa',
  databaseId: 'canteen',
  tables: { menu: '6af37ffe0007eaf736fa', orders: '6af3a698001454e4aa62' },
  bucketId: '6af3a7630023562ad767',
  functionId: 'manage-users',
};

const STALLS = [
  { id: 1, name: 'Stall 1' },
  { id: 2, name: 'Stall 2' },
  { id: 3, name: 'Stall 3' },
  { id: 4, name: 'Stall 4' },
  { id: 5, name: 'Stall 5' },
  { id: 6, name: 'Stall 6' },
  { id: 7, name: 'Stall 7' },
];
const stallName = (id) => (STALLS.find((s) => s.id == id) || { name: 'Stall ' + id }).name;
