import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { firestore } from '../firebase/config';

/**
 * useCollection — real-time Firestore collection hook.
 * Drop-in replacement for: useLiveQuery(() => db.table.toArray(), [])
 *
 * Usage:
 *   const expenses = useCollection('expenses');
 *   const sales = useCollection('sales', 'date', 'desc');
 */
export function useCollection(collectionName, orderByField = null, direction = 'asc') {
    const [data, setData] = useState(undefined);

    useEffect(() => {
        if (!collectionName) return;

        const colRef = collection(firestore, collectionName);
        const q = orderByField
            ? query(colRef, orderBy(orderByField, direction))
            : colRef;

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setData(docs);
            },
            (error) => {
                console.error(`Error listening to ${collectionName}:`, error);
                setData([]);
            }
        );

        return unsubscribe;
    }, [collectionName, orderByField, direction]);

    return data;
}
