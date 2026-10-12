import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import http, { getErrorMessage } from "../api/http.js";

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      hasHydrated: false,
      loading: false,
      error: "",
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      clearError: () => set({ error: "" }),
      login: async (values) => {
        set({ loading: true, error: "" });

        try {
          const response = await http.post("/auth/login", values);
          set({
            user: response.data.data.user,
            token: response.data.data.token,
            loading: false,
          });
          return response.data;
        } catch (error) {
          const message = getErrorMessage(error);
          set({ loading: false, error: message });
          throw new Error(message);
        }
      },
      register: async (values) => {
        set({ loading: true, error: "" });

        try {
          const response = await http.post("/auth/register", values);
          set({
            user: response.data.data.user,
            token: response.data.data.token,
            loading: false,
          });
          return response.data;
        } catch (error) {
          const message = getErrorMessage(error);
          set({ loading: false, error: message });
          throw new Error(message);
        }
      },
      logout: () => set({ user: null, token: null, error: "" }),
    }),
    {
      name: "exam-seating-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

export default useAuthStore;
