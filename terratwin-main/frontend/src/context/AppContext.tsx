"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Farm, Notification, MOCK_FARMS, MOCK_NOTIFICATIONS } from '@/utils/mockData';
import { app } from '@/utils/firebase';
import { 
  getAuth, 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import axios from 'axios';

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  farms: Farm[];
  setFarms: React.Dispatch<React.SetStateAction<Farm[]>>;
  selectedFarmId: string;
  setSelectedFarmId: (id: string) => void;
  selectedFarm: Farm | undefined;
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  addFarm: (farmData: Partial<Farm>) => void;
  markNotificationRead: (id: string) => void;
  apiConnected: boolean;
  authLoading: boolean;
  
  // Firebase Authentication operations
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  sendRecoveryEmail: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [farms, setFarms] = useState<Farm[]>(MOCK_FARMS);
  const [selectedFarmId, setSelectedFarmId] = useState<string>(MOCK_FARMS[0]?.id || "");
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [apiConnected, setApiConnected] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  // Check backend health
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const res = await axios.get('http://localhost:8000/api/health', { timeout: 2000 });
        if (res.status === 200) {
          setApiConnected(true);
          console.log("Connected to FastAPI Backend!");
        }
      } catch (err) {
        setApiConnected(false);
        console.log("FastAPI backend offline, running in mock mode.");
      }
    };
    checkBackend();
  }, []);

  // Listen to Firebase Auth state updates
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      try {
        if (firebaseUser) {
          const token = await firebaseUser.getIdToken();
          localStorage.setItem('token', token);
          
          const mappedUser: User = {
            id: firebaseUser.uid,
            email: firebaseUser.email || "",
            fullName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || "User Profile",
            role: "Agricultural Enterprise Client",
            avatarUrl: firebaseUser.photoURL || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150"
          };
          
          setUser(mappedUser);
          localStorage.setItem('user', JSON.stringify(mappedUser));
        } else {
          setUser(null);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } catch (err) {
        console.error("Error setting up Firebase user: ", err);
      } finally {
        setAuthLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Sync user data from backend if connected
  useEffect(() => {
    if (apiConnected && user) {
      const fetchUserData = async () => {
        try {
          const token = localStorage.getItem('token');
          const headers = { Authorization: `Bearer ${token}` };
          const farmsRes = await axios.get('http://localhost:8000/api/farms', { headers });
          if (farmsRes.data && farmsRes.data.length > 0) {
            setFarms(farmsRes.data);
            setSelectedFarmId(farmsRes.data[0].id);
          } else if (farmsRes.data && farmsRes.data.length === 0) {
            setFarms([]);
            setSelectedFarmId("");
          }
          const notifRes = await axios.get('http://localhost:8000/api/notifications', { headers });
          if (notifRes.data) {
            setNotifications(notifRes.data);
          }
        } catch (error) {
          console.error("Error syncing user data from backend", error);
        }
      };
      fetchUserData();
    }
  }, [apiConnected, user]);

  const selectedFarm = farms.find(f => f.id === selectedFarmId);

  // Authentication operations
  const loginWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const loginWithEmail = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const registerWithEmail = async (email: string, pass: string, name: string) => {
    const creds = await createUserWithEmailAndPassword(auth, email, pass);
    if (creds.user) {
      await updateProfile(creds.user, { displayName: name });
    }
  };

  const sendRecoveryEmail = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const logout = async () => {
    await firebaseSignOut(auth);
  };

  const addFarm = async (farmData: Partial<Farm>) => {
    const newFarm: Farm = {
      id: `farm-${Date.now()}`,
      name: farmData.name || "Unnamed Farm",
      location: farmData.location || "Unknown Location",
      coordinates: farmData.coordinates || [37.7749, -122.4194],
      polygon: farmData.polygon || [],
      cropType: farmData.cropType || "Wheat",
      sizeHectares: farmData.sizeHectares || 10,
      healthScore: 85,
      soilHealth: {
        status: "Optimal",
        n: 35,
        p: 15,
        k: 20,
        ph: 6.5,
        organicMatter: 2.5
      },
      moistureStress: 15,
      growthStage: {
        current: "Germination",
        progress: 10,
        daysToHarvest: 120
      },
      yieldProjection: {
        value: 2.1,
        confidence: 80
      },
      risks: {
        disease: "Low",
        diseaseDetail: "No threats active",
        pest: "Low",
        pestDetail: "No threats active"
      },
      irrigation: {
        status: "Inactive",
        cycleRemaining: "00:00:00",
        progress: 0,
        waterRequirementLiters: 15000,
        advisory: "No irrigation advised at this time."
      },
      ...farmData
    };

    // If backend is active, save it in the database
    if (apiConnected && user) {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        const response = await axios.post('http://localhost:8000/api/farms', {
          name: newFarm.name,
          location: newFarm.location,
          polygon: newFarm.polygon,
          coordinates: newFarm.coordinates,
          crop_type: newFarm.cropType,
          size_hectares: newFarm.sizeHectares
        }, { headers });
        if (response.data) {
          // Sync with generated backend database ID
          newFarm.id = String(response.data.id);
        }
      } catch (err) {
        console.error("Error creating farm on backend:", err);
      }
    }

    setFarms(prev => [...prev, newFarm]);
    setSelectedFarmId(newFarm.id);
  };

  const markNotificationRead = async (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );

    if (apiConnected && user) {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        await axios.put(`http://localhost:8000/api/notifications/${id}/read`, {}, { headers });
      } catch (err) {
        console.error("Error updating notification status:", err);
      }
    }
  };

  // Safe localStorage read on client
  useEffect(() => {
    const localDark = localStorage.getItem('darkMode') === 'true';
    setDarkMode(localDark);
  }, []);

  const handleSetUser = (u: User | null) => {
    setUser(u);
  };

  const handleSetDarkMode = (dark: boolean) => {
    setDarkMode(dark);
    localStorage.setItem('darkMode', dark ? 'true' : 'false');
    const root = window.document.documentElement;
    if (dark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  return (
    <AppContext.Provider value={{
      user,
      setUser: handleSetUser,
      farms,
      setFarms,
      selectedFarmId,
      setSelectedFarmId,
      selectedFarm,
      notifications,
      setNotifications,
      activeTab,
      setActiveTab,
      darkMode,
      setDarkMode: handleSetDarkMode,
      addFarm,
      markNotificationRead,
      apiConnected,
      authLoading,
      loginWithGoogle,
      loginWithEmail,
      registerWithEmail,
      sendRecoveryEmail,
      logout
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
