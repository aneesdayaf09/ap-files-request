import React, { useState, useEffect } from 'react';
import { Auth } from './components/Auth';
import { Layout } from './components/Layout';
import { StudentDashboard } from './components/StudentDashboard';
import { BuilderDashboard } from './components/BuilderDashboard';
import { User, RequestItem, Subject, UserRole, RequestType, MaterialCategory } from './types';
import { dataStore } from './services/dataStore';
import { db, isCloudEnabled } from './services/firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Initial Data Loading & Subscription
  useEffect(() => {
    let unsubscribeUsers: () => void;
    let unsubscribeRequests: () => void;

    if (isCloudEnabled && db) {
      // FIREBASE MODE: Real-time listeners
      const usersQuery = query(collection(db, "users"));
      unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
        const fetchedUsers: User[] = [];
        snapshot.forEach((doc) => fetchedUsers.push(doc.data() as User));
        setUsers(fetchedUsers);
      });

      const requestsQuery = query(collection(db, "requests"));
      unsubscribeRequests = onSnapshot(requestsQuery, (snapshot) => {
        const fetchedRequests: RequestItem[] = [];
        snapshot.forEach((doc) => fetchedRequests.push(doc.data() as RequestItem));
        setRequests(fetchedRequests);
        setLoading(false);
      });
    } else {
      // LOCAL STORAGE MODE: One-time load
      const savedUsers = localStorage.getItem('apfiles_users');
      const savedRequests = localStorage.getItem('apfiles_requests');
      
      if (savedUsers) setUsers(JSON.parse(savedUsers));
      if (savedRequests) setRequests(JSON.parse(savedRequests));
      setLoading(false);
    }

    return () => {
      if (unsubscribeUsers) unsubscribeUsers();
      if (unsubscribeRequests) unsubscribeRequests();
    };
  }, []);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const handleRegister = async (newUser: User) => {
    // Optimistic update for Local Mode
    if (!isCloudEnabled) {
      setUsers(prev => [...prev, newUser]);
    }
    await dataStore.saveUser(newUser);
  };

  const handleLogout = () => {
    setUser(null);
  };

  const handleStudentRequest = async (
    subject: Subject, 
    unit: string, 
    type: RequestType, 
    materialCategory?: MaterialCategory, 
    attachedFile?: File,
    description?: string
  ) => {
    if (!user) return;
    
    const newRequest: RequestItem = {
      id: generateId(),
      userId: user.id,
      userName: user.fullName,
      userPhone: user.phoneNumber,
      subject,
      unit,
      type,
      materialCategory,
      attachedFileName: attachedFile ? attachedFile.name : undefined,
      description: description || undefined,
      status: 'PENDING',
      createdAt: Date.now()
    };
    
    if (!isCloudEnabled) {
      setRequests(prev => [...prev, newRequest]);
    }
    await dataStore.addRequest(newRequest);
  };

  const handleBuilderUpdate = async (id: string, updates: Partial<RequestItem>) => {
    if (!isCloudEnabled) {
      setRequests(prev => prev.map(req => req.id === id ? { ...req, ...updates } : req));
    }
    await dataStore.updateRequest(id, updates);
  };

  const handleUserUpdate = async (userId: string, updates: Partial<User>) => {
    if (!isCloudEnabled) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u));
      // Sync denormalized data locally
      if (updates.fullName || updates.phoneNumber) {
        setRequests(prev => prev.map(req => {
          if (req.userId === userId) {
            return {
               ...req,
               userName: updates.fullName ?? req.userName,
               userPhone: updates.phoneNumber ?? req.userPhone
            };
          }
          return req;
        }));
      }
    }

    await dataStore.updateUserPartial(userId, updates);
    
    if (updates.fullName || updates.phoneNumber) {
       await dataStore.syncUserToRequests(
         userId, 
         updates.fullName || users.find(u => u.id === userId)?.fullName || '',
         updates.phoneNumber || users.find(u => u.id === userId)?.phoneNumber || ''
       );
    }
  };

  const handleUserDelete = async (userId: string) => {
    if (window.confirm("Are you sure? This will delete the user and ALL their request history.")) {
      if (!isCloudEnabled) {
        setUsers(prev => prev.filter(u => u.id !== userId));
        setRequests(prev => prev.filter(r => r.userId !== userId));
      }
      await dataStore.deleteUser(userId);
    }
  };

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );
  }

  return (
    <Layout user={user} onLogout={handleLogout}>
      {/* Cloud Status Indicator */}
      {!isCloudEnabled && (
        <div className="bg-amber-100 text-amber-800 text-xs text-center py-1 px-4 rounded-md mb-4 border border-amber-200">
          Running in Offline Mode. Data will not sync between devices. Ask Admin to configure Firebase keys.
        </div>
      )}
      
      {!user ? (
        <Auth 
          onLogin={handleLogin} 
          onRegister={handleRegister}
          users={users}
        />
      ) : user.role === UserRole.BUILDER ? (
        <BuilderDashboard 
          requests={requests} 
          onUpdateRequest={handleBuilderUpdate} 
          users={users}
          onUpdateUser={handleUserUpdate}
          onDeleteUser={handleUserDelete}
        />
      ) : (
        <StudentDashboard 
          user={user} 
          requests={requests} 
          onRequest={handleStudentRequest} 
        />
      )}
    </Layout>
  );
};

export default App;