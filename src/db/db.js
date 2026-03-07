/**
 * db.js — Firestore-based database wrapper
 *
 * Drop-in replacement for the old Dexie-based db.
 * Provides the same method signatures so all pages need minimal changes.
 *
 * Collections: sales, purchases, stock, transactions, customers,
 *              suppliers, settings, expenses, balances, dealers, dealerTransactions
 */

import { firestore } from '../firebase/config';
import {
  collection,
  doc,
  addDoc,
  setDoc,
  deleteDoc,
  updateDoc,
  getDocs,
  getDoc,
  query,
  where,
  writeBatch,
} from 'firebase/firestore';

function createCollection(collectionName) {
  const colRef = () => collection(firestore, collectionName);

  return {
    collectionName,

    /** Get all documents as an array */
    async toArray() {
      const snap = await getDocs(colRef());
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    },

    /** Add a new document, returns the new ID */
    async add(data) {
      const ref = await addDoc(colRef(), {
        ...data,
        _createdAt: data._createdAt || new Date().toISOString(),
      });
      return ref.id;
    },

    /**
     * Put (upsert) — for key-value stores like settings & balances.
     * Uses data.key as the document ID if present.
     */
    async put(data) {
      const id = data.key != null ? String(data.key) : data.id;
      if (id != null) {
        const ref = doc(firestore, collectionName, String(id));
        await setDoc(ref, data, { merge: true });
      } else {
        await addDoc(colRef(), data);
      }
    },

    /** Batch put — for settings.bulkPut([]) */
    async bulkPut(items) {
      const batch = writeBatch(firestore);
      items.forEach(item => {
        const id = item.key != null ? String(item.key) : item.id;
        if (id != null) {
          const ref = doc(firestore, collectionName, String(id));
          batch.set(ref, item, { merge: true });
        } else {
          const ref = doc(colRef());
          batch.set(ref, item);
        }
      });
      await batch.commit();
    },

    /** Batch add */
    async bulkAdd(items) {
      const batch = writeBatch(firestore);
      items.forEach(item => {
        const ref = doc(colRef());
        batch.set(ref, item);
      });
      await batch.commit();
    },

    /** Delete a document by ID */
    async delete(id) {
      const ref = doc(firestore, collectionName, String(id));
      await deleteDoc(ref);
    },

    /** Update specific fields of a document */
    async update(id, data) {
      const ref = doc(firestore, collectionName, String(id));
      await updateDoc(ref, data);
    },

    /** Get a single document by ID */
    async get(id) {
      const ref = doc(firestore, collectionName, String(id));
      const snap = await getDoc(ref);
      return snap.exists() ? { id: snap.id, ...snap.data() } : undefined;
    },

    /**
     * where(field).equals(value) — chainable filter
     * Supports: .toArray(), .first(), .delete()
     */
    where(field) {
      const self = this;
      return {
        equals(value) {
          const q = query(colRef(), where(field, '==', value));
          return {
            async toArray() {
              const snap = await getDocs(q);
              return snap.docs.map(d => ({ id: d.id, ...d.data() }));
            },
            async first() {
              const snap = await getDocs(q);
              if (snap.empty) return undefined;
              const d = snap.docs[0];
              return { id: d.id, ...d.data() };
            },
            async delete() {
              const snap = await getDocs(q);
              const batch = writeBatch(firestore);
              snap.docs.forEach(d => batch.delete(d.ref));
              await batch.commit();
            },
          };
        },
      };
    },

    /**
     * orderBy — returns { reverse, toArray }
     * Usage: db.sales.orderBy('date').reverse().toArray()
     */
    orderBy(field) {
      const self = this;
      let _reverse = false;
      const obj = {
        reverse() {
          _reverse = true;
          return obj;
        },
        async toArray() {
          const snap = await getDocs(colRef());
          let docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          docs.sort((a, b) => {
            const av = a[field] ?? '';
            const bv = b[field] ?? '';
            return av < bv ? -1 : av > bv ? 1 : 0;
          });
          if (_reverse) docs.reverse();
          return docs;
        },
      };
      return obj;
    },
  };
}

// Seed default settings into Firestore if none exist yet
export async function seedDefaultSettings() {
  try {
    const snap = await getDocs(collection(firestore, 'settings'));
    if (!snap.empty) return; // already seeded

    const defaults = [
      { key: 'shopName', value: 'Mayilon Jewellers' },
      { key: 'address', value: '123 Gold Street, Jewel City' },
      { key: 'gstNumber', value: '' },
      { key: 'goldRate24k', value: 7200 },
      { key: 'goldRate22k', value: 6800 },
      { key: 'silverRate', value: 85 },
      { key: 'taxRate', value: 3 },
      { key: 'phone', value: '' },
    ];

    const batch = writeBatch(firestore);
    defaults.forEach(item => {
      const ref = doc(firestore, 'settings', item.key);
      batch.set(ref, item);
    });
    await batch.commit();
    console.log('✅ Default settings seeded to Firestore');
  } catch (err) {
    console.error('Failed to seed settings:', err);
  }
}

export const db = {
  sales: createCollection('sales'),
  purchases: createCollection('purchases'),
  stock: createCollection('stock'),
  transactions: createCollection('transactions'),
  customers: createCollection('customers'),
  suppliers: createCollection('suppliers'),
  settings: createCollection('settings'),
  expenses: createCollection('expenses'),
  balances: createCollection('balances'),
  dealers: createCollection('dealers'),
  dealerTransactions: createCollection('dealerTransactions'),
};
