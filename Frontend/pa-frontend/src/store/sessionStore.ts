import { create } from "zustand";
import { persist } from "zustand/middleware";

type Session = {
  id: string;
  name: string;
  logo: React.ElementType;
  plan: string;
};

type Company = {
  id: string;
  name: string;
};

interface SessionState {
  token: string | null;
  email: string | null;
  otpSession: string | null;
  session: Session | null;
  notifications: number;
  specifier: string[] | null;
  sessionDeadline: string | null;
  company: Company | null;
  notificationNumber: string | null;
  userRole: string | null;
  userDetails: any;
  companyLogo: string | null;

  setCompanyLogo: (newCompanyLogo: string | null) => void;
  setToken: (newToken: string | null) => void;
  setEmail: (newEmail: string | null) => void;
  setotpSession: (newotpSession: string | null) => void;
  setsession: (newSession: Session | null) => void;
  setnotifications: (newNotifications: number) => void;
  setSpecifier: (newSpecifier: string[]) => void;
  setSessionDeadline: (newSessionDeadline: string | null) => void;
  setCompany: (newCompany: Company | null) => void;
  updateSessionName: (newName: string) => void;
  setNotificationNumber: (newNotificationNumber: string | null) => void;
  setUserRole: (newUserRole: string | null) => void;
  setUserDetails: (newUserDetails: any) => void;
  reset: () => void;
}

const useSessionStore = create(
  persist<SessionState>(
    (set) => ({
      token: null,
      email: null,
      otpSession: null,
      session: null,
      notifications: 0,
      specifier: [],
      sessionDeadline: null,
      company: null,
      notificationNumber: null,
      userRole: null,
      userDetails: null,
      companyLogo: null,

      setCompanyLogo: (newCompanyLogo) => set({ companyLogo: newCompanyLogo }),
      setToken: (newToken) => set({ token: newToken }),
      setEmail: (newEmail) => set({ email: newEmail }),
      setotpSession: (newotpSession) => set({ otpSession: newotpSession }),
      setsession: (newSession) => set({ session: newSession }),
      setnotifications: (newNotifications) =>
        set({ notifications: newNotifications }),
      setSpecifier: (newSpecifier: string[]) => set({ specifier: newSpecifier }),
      setSessionDeadline: (newSessionDeadline) => set({ sessionDeadline: newSessionDeadline }),
      setCompany: (newCompany) => set({ company: newCompany }),
      updateSessionName: (newName: string) =>
        set((state) => ({
          session: state.session
            ? { ...state.session, name: newName }
            : null,
        })),
      setNotificationNumber: (newNotificationNumber) => set({ notificationNumber: newNotificationNumber }),
      setUserRole: (newUserRole) => set({ userRole: newUserRole }),
      setUserDetails: (newUserDetails) => set({ userDetails: newUserDetails }),
      reset: () =>
        set({
          token: null,
          email: null,
          otpSession: null,
          session: null,
          notifications: 0,
          specifier: [],
          sessionDeadline: null,
          company: null,
          notificationNumber: null,
          userRole: null,
          userDetails: null,
          companyLogo: null,
        }),
    }),
    {
      name: "session-storage",
    }
  )
);

export default useSessionStore;