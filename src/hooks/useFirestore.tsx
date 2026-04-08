import { collection, onSnapshot, query, where, orderBy, addDoc, updateDoc, deleteDoc, doc, getDoc, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db, auth } from '../firebase';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export function useCollection<T>(collectionName: string, constraints: any[] = []) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const q = query(collection(db, collectionName), ...constraints);
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: T[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as T);
      });
      setData(items);
      setLoading(false);
    }, (err) => {
      console.error(`Error fetching ${collectionName}:`, err);
      setError(err);
      setLoading(false);
    });

    return unsubscribe;
  }, [collectionName, constraints.length]); // Use length as a simple heuristic to avoid circular JSON errors

  return { data, loading, error };
}

export function useDocument<T>(collectionName: string, docId: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!docId) return;
    const unsubscribe = onSnapshot(doc(db, collectionName, docId), (doc) => {
      if (doc.exists()) {
        setData({ id: doc.id, ...doc.data() } as T);
      } else {
        setData(null);
      }
      setLoading(false);
    }, (err) => {
      console.error(`Error fetching document ${collectionName}/${docId}:`, err);
      setError(err);
      setLoading(false);
    });

    return unsubscribe;
  }, [collectionName, docId]);

  return { data, loading, error };
}

export const firestoreService = {
  async add(collectionName: string, data: any) {
    try {
      return await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, collectionName);
    }
  },
  async update(collectionName: string, docId: string, data: any) {
    try {
      // Strip id from data to avoid updating the ID field itself
      const { id, ...updateData } = data;
      return await updateDoc(doc(db, collectionName, docId), updateData);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${collectionName}/${docId}`);
    }
  },
  async set(collectionName: string, docId: string, data: any) {
    try {
      const { id, ...setData } = data;
      const { setDoc } = await import('firebase/firestore');
      return await setDoc(doc(db, collectionName, docId), setData);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${collectionName}/${docId}`);
    }
  },
  async delete(collectionName: string, docId: string) {
    try {
      return await deleteDoc(doc(db, collectionName, docId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${collectionName}/${docId}`);
    }
  },
  async deleteMultiple(collectionName: string, docIds: string[]) {
    try {
      const promises = docIds.map(id => deleteDoc(doc(db, collectionName, id)));
      return await Promise.all(promises);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${collectionName} (multiple)`);
    }
  }
};
