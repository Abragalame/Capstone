/* ===== Edit this file only: your Appwrite IDs and the 7 stalls ===== */
const CONFIG = {
  endpoint: 'https://sgp.cloud.appwrite.io/v1', // region taken from your capstone.sgp.appwrite.run URL
  projectId: 'REPLACE_WITH_YOUR_PROJECT_ID',
  databaseId: 'canteen',
  tables: { menu: 'menu_items', orders: 'orders' },
  bucketId: 'menu_images',
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
