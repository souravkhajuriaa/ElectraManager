import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole, NavigationTab } from '@/src/types';
import { SAMPLE_USER, SAMPLE_ADMIN, AVAILABLE_USERS } from '@/src/lib/data/sampleData';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  isAuthenticated: boolean;
  isAdmin: boolean;
  otpSent: boolean;
  pendingMobile: string;
  resendSeconds: number;
  usersList: UserProfile[];
  loginAsUser: (selectedUser: UserProfile) => void;
  sendOTP: (mobile: string) => Promise<{ success: boolean; message?: string }>;
  verifyOTP: (otp: string, name?: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  updateProfile: (details: Partial<UserProfile>) => void;
  demoLogin: (role?: UserRole) => void;
  resetAuthFlow: () => void;
  isUserLoginModalOpen: boolean;
  openUserLoginModal: () => void;
  closeUserLoginModal: () => void;
  isAdminLoginModalOpen: boolean;
  pendingAdminRedirectTab: NavigationTab | null;
  openAdminLoginModal: (redirectTab?: NavigationTab) => void;
  closeAdminLoginModal: () => void;
  verifyAdminLogin: (passcode: string, mobileOrEmail?: string) => Promise<{ success: boolean; message?: string }>;
  registerAdmin: (adminData: {
    name: string;
    mobile: string;
    email: string;
    passcode: string;
    businessName?: string;
  }) => Promise<{ success: boolean; message?: string }>;
  registerUser: (userData: {
    name: string;
    mobile: string;
    businessName?: string;
    email?: string;
    storeCategory?: string;
    gstNumber?: string;
    address?: string;
  }) => Promise<{ success: boolean; message?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Persistent user list for multiple users
  const [usersList, setUsersList] = useState<UserProfile[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('electra_users_list');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch { /* ignore */ }
      }
    }
    return AVAILABLE_USERS;
  });

  const [user, setUser] = useState<UserProfile | null>(() => {
    if (typeof window !== 'undefined') {
      // If user explicitly logged out, keep them logged out until they log in again
      const isLoggedOut = localStorage.getItem('electra_logged_out') === 'true';
      if (isLoggedOut) {
        return null;
      }
      const saved = localStorage.getItem('electra_user');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed.name === 'string' && /vikram\s*mehta/i.test(parsed.name)) {
            parsed.name = 'Sourav';
          }
          return parsed;
        } catch {
          return SAMPLE_USER;
        }
      }
    }
    return SAMPLE_USER; // Default logged in for smooth instant AI Studio preview!
  });

  const [otpSent, setOtpSent] = useState(false);
  const [pendingMobile, setPendingMobile] = useState('');
  const [resendSeconds, setResendSeconds] = useState(0);
  const [isUserLoginModalOpen, setIsUserLoginModalOpen] = useState(false);
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState(false);
  const [pendingAdminRedirectTab, setPendingAdminRedirectTab] = useState<NavigationTab | null>(null);

  const openUserLoginModal = () => setIsUserLoginModalOpen(true);
  const closeUserLoginModal = () => setIsUserLoginModalOpen(false);

  const openAdminLoginModal = (redirectTab: NavigationTab = 'admin-dashboard') => {
    setPendingAdminRedirectTab(redirectTab);
    setIsAdminLoginModalOpen(true);
  };

  const closeAdminLoginModal = () => {
    setIsAdminLoginModalOpen(false);
    setPendingAdminRedirectTab(null);
  };

  const loginAsUser = (selectedUser: UserProfile) => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('electra_logged_out');
      localStorage.setItem('electra_user', JSON.stringify(selectedUser));
      localStorage.setItem('electra_active_user_id', selectedUser.id);
    }
    setUser(selectedUser);
    setIsUserLoginModalOpen(false);
    setOtpSent(false);
    setPendingMobile('');

    // Ensure user is present in stored usersList
    setUsersList(prev => {
      const exists = prev.some(u => u.id === selectedUser.id || (u.mobile === selectedUser.mobile && u.role === selectedUser.role));
      const updated = exists ? prev.map(u => u.id === selectedUser.id ? selectedUser : u) : [selectedUser, ...prev];
      if (typeof window !== 'undefined') {
        localStorage.setItem('electra_users_list', JSON.stringify(updated));
      }
      return updated;
    });
  };

  const registerAdmin = async (adminData: {
    name: string;
    mobile: string;
    email: string;
    passcode: string;
    businessName?: string;
  }): Promise<{ success: boolean; message?: string }> => {
    await new Promise(resolve => setTimeout(resolve, 350));
    const cleanedMobile = adminData.mobile.replace(/\D/g, '');
    const existingAdminsStr = typeof window !== 'undefined' ? localStorage.getItem('electra_registered_admins') : null;
    let existingAdmins: any[] = [];
    if (existingAdminsStr) {
      try {
        existingAdmins = JSON.parse(existingAdminsStr);
      } catch {
        existingAdmins = [];
      }
    }

    const alreadyExists = existingAdmins.some(
      a => (a.mobile && a.mobile.replace(/\D/g, '') === cleanedMobile) ||
           (a.email && a.email.toLowerCase() === adminData.email.trim().toLowerCase())
    );

    if (alreadyExists) {
      return {
        success: false,
        message: 'An administrator with this mobile number or email already exists. Please log in instead.',
      };
    }

    const newAdminId = `adm-${Date.now()}`;
    const formattedMobile = adminData.mobile.startsWith('+91')
      ? adminData.mobile.trim()
      : `+91 ${adminData.mobile.trim()}`;

    const newAdminRecord = {
      id: newAdminId,
      name: adminData.name.trim(),
      mobile: formattedMobile,
      email: adminData.email.trim(),
      passcode: adminData.passcode.trim(),
      businessName: adminData.businessName?.trim() || 'Electra Retail HQ',
    };

    const updatedAdmins = [...existingAdmins, newAdminRecord];
    if (typeof window !== 'undefined') {
      localStorage.setItem('electra_registered_admins', JSON.stringify(updatedAdmins));
    }

    const newAdminProfile: UserProfile = {
      id: newAdminId,
      name: adminData.name.trim(),
      mobile: formattedMobile,
      role: 'admin',
      email: adminData.email.trim(),
      businessName: adminData.businessName?.trim() || 'Electra Retail HQ',
    };

    if (typeof window !== 'undefined') {
      localStorage.removeItem('electra_logged_out');
      localStorage.setItem('electra_user', JSON.stringify(newAdminProfile));
      localStorage.setItem('electra_active_user_id', newAdminProfile.id);
    }
    setUser(newAdminProfile);
    setIsAdminLoginModalOpen(false);
    return { success: true };
  };

  const registerUser = async (userData: {
    name: string;
    mobile: string;
    businessName?: string;
    email?: string;
    storeCategory?: string;
    gstNumber?: string;
    address?: string;
  }): Promise<{ success: boolean; message?: string }> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const formattedMobile = userData.mobile.startsWith('+91')
      ? userData.mobile.trim()
      : `+91 ${userData.mobile.trim()}`;

    const newUserId = `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const email = userData.email?.trim() || `${userData.name.trim().toLowerCase().replace(/\s+/g, '.')}@electraretail.in`;
    const businessName = userData.businessName?.trim() || `${userData.name.trim()}'s Electronics`;

    const newUserProfile: UserProfile = {
      id: newUserId,
      name: userData.name.trim(),
      mobile: formattedMobile,
      role: 'user',
      email,
      businessName,
    };

    if (typeof window !== 'undefined') {
      localStorage.removeItem('electra_logged_out');
      localStorage.setItem('electra_user', JSON.stringify(newUserProfile));
      localStorage.setItem('electra_active_user_id', newUserProfile.id);
    }

    setUsersList(prev => {
      const updated = [newUserProfile, ...prev.filter(u => u.id !== newUserId && u.mobile !== formattedMobile)];
      if (typeof window !== 'undefined') {
        localStorage.setItem('electra_users_list', JSON.stringify(updated));
      }
      return updated;
    });

    setUser(newUserProfile);
    setIsUserLoginModalOpen(false);
    setOtpSent(false);
    setPendingMobile('');
    return { success: true };
  };

  const verifyAdminLogin = async (
    passcode: string,
    mobileOrEmail?: string
  ): Promise<{ success: boolean; message?: string }> => {
    await new Promise(resolve => setTimeout(resolve, 350));
    const trimmed = passcode.trim();
    const trimmedIdentifier = mobileOrEmail?.trim().toLowerCase() || '';

    // Check custom registered admins
    const existingAdminsStr = typeof window !== 'undefined' ? localStorage.getItem('electra_registered_admins') : null;
    let existingAdmins: any[] = [];
    if (existingAdminsStr) {
      try {
        existingAdmins = JSON.parse(existingAdminsStr);
      } catch {
        existingAdmins = [];
      }
    }

    if (trimmedIdentifier && existingAdmins.length > 0) {
      const cleanedInputMobile = trimmedIdentifier.replace(/\D/g, '');
      const matchedAdmin = existingAdmins.find(a => {
        const adminMobileClean = a.mobile?.replace(/\D/g, '');
        const matchesMobile = cleanedInputMobile.length >= 10 && adminMobileClean?.includes(cleanedInputMobile);
        const matchesEmail = a.email?.toLowerCase() === trimmedIdentifier;
        return (matchesMobile || matchesEmail) && a.passcode === trimmed;
      });

      if (matchedAdmin) {
        const adminProfile: UserProfile = {
          id: matchedAdmin.id,
          name: matchedAdmin.name,
          mobile: matchedAdmin.mobile,
          role: 'admin',
          email: matchedAdmin.email,
          businessName: matchedAdmin.businessName || 'Electra Retail HQ',
        };
        if (typeof window !== 'undefined') {
          localStorage.removeItem('electra_logged_out');
          localStorage.setItem('electra_user', JSON.stringify(adminProfile));
          localStorage.setItem('electra_active_user_id', adminProfile.id);
        }
        setUser(adminProfile);
        setIsAdminLoginModalOpen(false);
        return { success: true };
      }
    }

    // Match registered admin purely by passcode if identifier not specified or matched
    const matchedByPasscode = existingAdmins.find(a => a.passcode === trimmed);
    if (matchedByPasscode) {
      const adminProfile: UserProfile = {
        id: matchedByPasscode.id,
        name: matchedByPasscode.name,
        mobile: matchedByPasscode.mobile,
        role: 'admin',
        email: matchedByPasscode.email,
        businessName: matchedByPasscode.businessName || 'Electra Retail HQ',
      };
      if (typeof window !== 'undefined') {
        localStorage.removeItem('electra_logged_out');
        localStorage.setItem('electra_user', JSON.stringify(adminProfile));
        localStorage.setItem('electra_active_user_id', adminProfile.id);
      }
      setUser(adminProfile);
      setIsAdminLoginModalOpen(false);
      return { success: true };
    }

    // Valid default passcodes for Sourav / Admin console
    const validPasscodes = ['admin123', '9999', '123456', 'admin', 'sourav', 'Sourav'];

    if (validPasscodes.includes(trimmed)) {
      const adminProfile: UserProfile = {
        id: 'adm-1',
        name: 'Sourav',
        mobile: mobileOrEmail && mobileOrEmail.includes('+91') ? mobileOrEmail : '+91 99999 88888',
        role: 'admin',
        email: 'admin@electramanager.com',
        businessName: 'ElectraManager System HQ',
      };
      if (typeof window !== 'undefined') {
        localStorage.removeItem('electra_logged_out');
        localStorage.setItem('electra_user', JSON.stringify(adminProfile));
        localStorage.setItem('electra_active_user_id', adminProfile.id);
      }
      setUser(adminProfile);
      setIsAdminLoginModalOpen(false);
      return { success: true };
    }

    return {
      success: false,
      message: 'Invalid administrator credentials or passcode. Access to Admin Console is denied.',
    };
  };

  useEffect(() => {
    if (user && typeof user.name === 'string' && /vikram\s*mehta/i.test(user.name)) {
      setUser(prev => (prev ? { ...prev, name: 'Sourav' } : null));
    }
  }, [user]);

  // Keep localStorage in sync with user state
  useEffect(() => {
    if (user) {
      localStorage.removeItem('electra_logged_out');
      localStorage.setItem('electra_user', JSON.stringify(user));
      localStorage.setItem('electra_active_user_id', user.id);
    } else {
      localStorage.removeItem('electra_user');
      localStorage.removeItem('electra_active_user_id');
    }
  }, [user]);

  // Save usersList
  useEffect(() => {
    if (typeof window !== 'undefined' && usersList.length > 0) {
      localStorage.setItem('electra_users_list', JSON.stringify(usersList));
    }
  }, [usersList]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendSeconds > 0) {
      timer = setTimeout(() => setResendSeconds(prev => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendSeconds]);

  const sendOTP = async (mobile: string): Promise<{ success: boolean; message?: string }> => {
    const cleaned = mobile.replace(/\D/g, '');
    if (cleaned.length < 10) {
      return { success: false, message: 'Please enter a valid 10-digit mobile number' };
    }

    setPendingMobile(mobile);
    setOtpSent(true);
    setResendSeconds(30);
    return { success: true };
  };

  const verifyOTP = async (otp: string, name?: string): Promise<{ success: boolean; message?: string }> => {
    // In demo/test mode: accept 123456 or any 6-digit number
    if (!otp || otp.trim().length !== 6) {
      return { success: false, message: 'Please enter the 6-digit OTP' };
    }

    const isAdminMobile = pendingMobile.includes('99999');
    const existing = usersList.find(u => u.mobile.replace(/\D/g, '').endsWith(pendingMobile.replace(/\D/g, '')));

    const newUser: UserProfile = {
      id: existing ? existing.id : (isAdminMobile ? 'adm-1' : `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`),
      name: name?.trim() || (existing ? existing.name : (isAdminMobile ? 'Sourav' : 'Retail Store Manager')),
      mobile: pendingMobile.startsWith('+91') ? pendingMobile : `+91 ${pendingMobile}`,
      role: isAdminMobile ? 'admin' : 'user',
      email: existing?.email || (isAdminMobile ? 'admin@electramanager.com' : `${(name || 'manager').toLowerCase().replace(/\s+/g, '.')}@electraretail.in`),
      businessName: existing?.businessName || (name ? `${name}'s Electronics Hub` : 'Electra Retail & Tech Hub'),
    };

    loginAsUser(newUser);
    return { success: true };
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('electra_logged_out', 'true');
      localStorage.removeItem('electra_user');
      localStorage.removeItem('electra_active_user_id');
    }
    setUser(null);
    setOtpSent(false);
    setPendingMobile('');
  };

  const switchRole = (role: UserRole) => {
    if (!user) {
      if (role === 'admin') {
        openAdminLoginModal();
        return;
      }
      loginAsUser(SAMPLE_USER);
      return;
    }

    // A user cannot switch to Admin console without login!
    if (role === 'admin' && user.role !== 'admin') {
      openAdminLoginModal();
      return;
    }

    const updatedUser: UserProfile = {
      ...user,
      role,
      name: user.name,
    };
    loginAsUser(updatedUser);
  };

  const updateProfile = (details: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...details };
    loginAsUser(updated);
  };

  const demoLogin = (role: UserRole = 'user') => {
    loginAsUser(role === 'admin' ? SAMPLE_ADMIN : SAMPLE_USER);
  };

  const resetAuthFlow = () => {
    setOtpSent(false);
    setPendingMobile('');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'user',
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        otpSent,
        pendingMobile,
        resendSeconds,
        usersList,
        loginAsUser,
        sendOTP,
        verifyOTP,
        logout,
        switchRole,
        updateProfile,
        demoLogin,
        resetAuthFlow,
        isUserLoginModalOpen,
        openUserLoginModal,
        closeUserLoginModal,
        isAdminLoginModalOpen,
        pendingAdminRedirectTab,
        openAdminLoginModal,
        closeAdminLoginModal,
        verifyAdminLogin,
        registerAdmin,
        registerUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
