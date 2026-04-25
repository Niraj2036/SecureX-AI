import { create } from "zustand";

interface SessionState {
  name: string | null;
  email: string | null;
  companyName: string | null;
  website: string | null;
  designation: string | null;
  industry: string | null;
  employeeSize: string | null;
  password: string | null;
  firstName: string | null;

  setName: (newName: string | null) => void;
  setEmail: (newEmail: string | null) => void;
  setCompanyName: (newCompanyName: string | null) => void;
  setWebsite: (newWebsite: string | null) => void;
  setDesignation: (newDesignation: string | null) => void;
  setIndustry: (newIndustry: string | null) => void;
  setEmployeeSize: (newEmployeeSize: string | null) => void;
  setPassword: (newPassword: string | null) => void;
  setFirstName: (newFirstName: string | null) => void;
  reset: () => void; // Add this line
}

const useSessionStore = create<SessionState>((set) => ({
  name: null,
  email: null,
  companyName: null,
  website: null,
  designation: null,
  industry: null,
  employeeSize: null,
  password: null,
  firstName: null,

  setName: (newName) => set((state) => newName !== state.name ? { name: newName } : state),
  setEmail: (newEmail) => set((state) => newEmail !== state.email ? { email: newEmail } : state),
  setCompanyName: (newCompanyName) => set((state) => newCompanyName !== state.companyName ? { companyName: newCompanyName } : state),
  setWebsite: (newWebsite) => set((state) => newWebsite !== state.website ? { website: newWebsite } : state),
  setDesignation: (newDesignation) => set((state) => newDesignation !== state.designation ? { designation: newDesignation } : state),
  setIndustry: (newIndustry) => set((state) => newIndustry !== state.industry ? { industry: newIndustry } : state),
  setEmployeeSize: (newEmployeeSize) => set((state) => newEmployeeSize !== state.employeeSize ? { employeeSize: newEmployeeSize } : state),
  setPassword: (newPassword) => set((state) => newPassword !== state.password ? { password: newPassword } : state),
  setFirstName: (newFirstName) => set((state) => newFirstName !== state.firstName ? { firstName: newFirstName } : state),
  reset: () =>
    set({
      name: null,
      email: null,
      companyName: null,
      website: null,
      designation: null,
      industry: null,
      employeeSize: null,
      password: null,
      firstName: null,
    }),
}));

export default useSessionStore;
