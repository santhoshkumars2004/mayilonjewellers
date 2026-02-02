import Dexie from 'dexie';

export const db = new Dexie('JewelryShopDB');

db.version(1).stores({
  sales: '++id, invoiceNo, date, customerName, paymentStatus',
  purchases: '++id, purchaseId, type, date, supplierName', // type: 'gold' | 'silver'
  stock: '++id, [metalType+purity+category], metalType, purity, category', // Compound index for fast lookup
  transactions: '++id, date, type, category', // type: 'income' | 'expense'
  customers: '++id, phone, name',
  suppliers: '++id, phone, name',
  settings: 'key' // key-value store for app settings
});

// Seed initial settings if needed
db.on('populate', () => {
  db.settings.bulkAdd([
    { key: 'shopName', value: 'Mayilon Jewellers' },
    { key: 'address', value: '123 Gold Street, Jewel City' },
    { key: 'gstNumber', value: '' },
    { key: 'goldRate24k', value: 7200 },
    { key: 'goldRate22k', value: 6800 },
    { key: 'silverRate', value: 85 },
    { key: 'taxRate', value: 3 }, // 3% GST
  ]);
  
  // Initialize some stock categories to avoid empty dashboard
  const initialStock = [
    { metalType: 'Gold', purity: '22K', category: 'Ring', weight: 0, quantity: 0 },
    { metalType: 'Gold', purity: '22K', category: 'Chain', weight: 0, quantity: 0 },
    { metalType: 'Gold', purity: '22K', category: 'Necklace', weight: 0, quantity: 0 },
    { metalType: 'Gold', purity: '22K', category: 'Bangle', weight: 0, quantity: 0 },
    { metalType: 'Silver', purity: '925', category: 'Anklet', weight: 0, quantity: 0 },
    { metalType: 'Silver', purity: '925', category: 'Ring', weight: 0, quantity: 0 },
  ];
  db.stock.bulkAdd(initialStock);
});
