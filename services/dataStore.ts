import { db, isCloudEnabled } from './firebase';
import { 
  collection, doc, setDoc, updateDoc, deleteDoc, 
  query, onSnapshot, writeBatch, where, getDocs
} from "firebase/firestore";
import { User, RequestItem } from '../types';

// LOCAL STORAGE KEYS
const LS_USERS = 'apfiles_users';
const LS_REQUESTS = 'apfiles_requests';

// --- HELPERS FOR LOCAL STORAGE ---
const getLS = (key: string) => {
  const s = localStorage.getItem(key);
  return s ? JSON.parse(s) : [];
};
const setLS = (key: string, data: any) => localStorage.setItem(key, JSON.stringify(data));

// --- DATA OPERATIONS ---

export const dataStore = {
  // --- USERS ---
  
  // Create or Update User
  saveUser: async (user: User) => {
    if (isCloudEnabled && db) {
      await setDoc(doc(db, "users", user.id), user);
    } else {
      const users = getLS(LS_USERS);
      const index = users.findIndex((u: User) => u.id === user.id);
      if (index >= 0) {
        users[index] = { ...users[index], ...user };
      } else {
        users.push(user);
      }
      setLS(LS_USERS, users);
    }
  },

  updateUserPartial: async (id: string, updates: Partial<User>) => {
    if (isCloudEnabled && db) {
      await updateDoc(doc(db, "users", id), updates);
    } else {
      const users = getLS(LS_USERS);
      const updated = users.map((u: User) => u.id === id ? { ...u, ...updates } : u);
      setLS(LS_USERS, updated);
    }
  },

  deleteUser: async (id: string) => {
    if (isCloudEnabled && db) {
        // Delete user
        await deleteDoc(doc(db, "users", id));
        
        // Delete associated requests (Firestore requires manual query & delete)
        const q = query(collection(db, "requests"), where("userId", "==", id));
        const snapshot = await getDocs(q);
        const batch = writeBatch(db);
        snapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });
        await batch.commit();

    } else {
      const users = getLS(LS_USERS).filter((u: User) => u.id !== id);
      const requests = getLS(LS_REQUESTS).filter((r: RequestItem) => r.userId !== id);
      setLS(LS_USERS, users);
      setLS(LS_REQUESTS, requests);
    }
  },

  // --- REQUESTS ---

  addRequest: async (request: RequestItem) => {
    if (isCloudEnabled && db) {
      await setDoc(doc(db, "requests", request.id), request);
    } else {
      const reqs = getLS(LS_REQUESTS);
      reqs.push(request);
      setLS(LS_REQUESTS, reqs);
    }
  },

  updateRequest: async (id: string, updates: Partial<RequestItem>) => {
    if (isCloudEnabled && db) {
      await updateDoc(doc(db, "requests", id), updates);
    } else {
      const reqs = getLS(LS_REQUESTS);
      const updated = reqs.map((r: RequestItem) => r.id === id ? { ...r, ...updates } : r);
      setLS(LS_REQUESTS, updated);
    }
  },

  // Update denormalized user data in all their requests
  syncUserToRequests: async (userId: string, name: string, phone: string) => {
    if (isCloudEnabled && db) {
        const q = query(collection(db, "requests"), where("userId", "==", userId));
        const snapshot = await getDocs(q);
        const batch = writeBatch(db);
        snapshot.docs.forEach((d) => {
            batch.update(d.ref, { userName: name, userPhone: phone });
        });
        await batch.commit();
    } else {
        const reqs = getLS(LS_REQUESTS);
        const updated = reqs.map((r: RequestItem) => {
            if (r.userId === userId) {
                return { ...r, userName: name, userPhone: phone };
            }
            return r;
        });
        setLS(LS_REQUESTS, updated);
    }
  }
};