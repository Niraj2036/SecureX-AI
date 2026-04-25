import { create } from "zustand";
import { persist } from "zustand/middleware";

type Session = {
  id: string;
  name: string;
  logo: React.ElementType;
  plan: string;
};
type Company ={
  id: string;
  name: string;
}

type SessionList ={
  id:string;
  title:string;
  endDate:Date;
  startDate:Date;
  cadence:string;
  description:string
}

type CurrObjective ={
  id:string
  title:string
  description:string;
  scope:string;
  status:string;
  deadlineLevel:string
  startDate:string;
  endDate:string;
  deadline:string;
  session:string;
  frequencyUpdate:string
  owners:string[];
}
type selectedTaskType = {
  type : string;
  id : string;
  name :string
}

interface SessionState {
  token: string | null;
  email: string | null;
  otpSession: string | null;
  session: Session | null;
  okrno: number;
  notifications: number;
  specifier: string[] | null; 
  sessionDeadline: string | null;
  company: Company | null;
  SessionList: SessionList[] | null;
  currObjective: CurrObjective | null;
  notificationNumber:string | null;
  refreshBadgeList: number;
  userRole : string | null;
  userDetails : any;
  selectedTask :selectedTaskType | null;
  companyLogo: string | null;
  setCompanyLogo: (newCompanyLogo: string | null) => void;
  setToken: (newToken: string | null) => void;
  setEmail: (newEmail: string | null) => void;
  setotpSession: (newotpSession: string | null) => void;
  setsession: (newSession: Session | null) => void;
  setOkrno: (newOkrno: number) => void;
  setnotifications: (newNotifications: number) => void;
  setSpecifier: (newSpecifier: string[]) => void; 
  setSessionDeadline: (newSessionDeadline: string | null) => void;
  setCompany: (newCompany: Company | null) => void;
  updateSessionName: (newName: string) => void;
  setSessionList: (newSessionList: SessionList[]) => void;
  setCurrObjective: (newCurrObjective: CurrObjective) => void;
  setNotificationNumber: (newNotificationNumber: string | null) => void;
  setRefreshBadgeList: (newRefreshBadgeList: number) => void;
  setUserRole: (newUserRole: string | null) => void;
  setUserDetails: (newUserDetails: any) => void;
  setSelectedTask: (newSelectedTask: selectedTaskType | null) => void;
  reset: () => void; // Add this line to the interface
}

const useSessionStore = create(
  persist<SessionState>(
    (set) => ({
      token: null,
      email: null,
      otpSession: null,
      session: null,
      okrno: 0,
      notifications: 0,
      specifier: [],
      sessionDeadline: null,
      company: null,
      SessionList: null,
      currObjective: null,
      notificationNumber:null,
      refreshBadgeList: 0,
      userRole: null,
      userDetails: null,
      selectedTask: null,
      companyLogo: null,
      setCompanyLogo: (newCompanyLogo) => set({ companyLogo: newCompanyLogo }),
      setToken: (newToken) => set({ token: newToken }),
      setEmail: (newEmail) => set({ email: newEmail }),
      setotpSession: (newotpSession) => set({ otpSession: newotpSession }),
      setsession: (newSession) => set({ session: newSession }),
      setOkrno: (newOkrno) => set({ okrno: newOkrno }),
      setnotifications: (newNotifications) =>
        set({ notifications: newNotifications }),
      setSpecifier: (newSpecifier: string[]) => set({ specifier: newSpecifier }), 
      setSessionDeadline: (newSessionDeadline) => set({ sessionDeadline: newSessionDeadline }),
      setCompany : (newCompany) => set({ company: newCompany }),
      updateSessionName: (newName: string) =>
        set((state) => ({
          session: state.session
            ? { ...state.session, name: newName }
            : null,
        })),
      setSessionList: (newSessionList) => set({ SessionList: newSessionList }),
      setCurrObjective: (newCurrObjective:CurrObjective) => set({ currObjective: newCurrObjective }),
      setNotificationNumber: (newNotificationNumber) => set({ notificationNumber: newNotificationNumber }),
      setRefreshBadgeList: (newRefreshBadgeList) => set({ refreshBadgeList: newRefreshBadgeList }),
      setUserRole: (newUserRole) => set({ userRole: newUserRole}),
      setUserDetails: (newUserDetails) => set({ userDetails: newUserDetails}),
      setSelectedTask: (newSelectedTask) => set({ selectedTask: newSelectedTask}),
      reset: () =>
        set({
          token: null,
          email: null,
          otpSession: null,
          session: null,
          okrno: 0,
          notifications: 0,
          specifier: [],
          sessionDeadline: null,
          company: null,
          SessionList: null,
          currObjective: null,
          notificationNumber: null,
          refreshBadgeList: 0,
          userRole: null,
          userDetails: null,
          selectedTask: null,
          companyLogo: null,
        }),
    }),
    {
      name: "session-storage",
    }
  )
);

export default useSessionStore;
