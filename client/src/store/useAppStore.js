import { create } from "zustand";
import http, { getErrorMessage } from "../api/http.js";

const defaultDashboard = {
  counts: {
    students: 0,
    exams: 0,
    halls: 0,
    allocations: 0,
  },
  recentExams: [],
  latestAllocatedExam: null,
  hallUtilization: [],
};

const setLoadingState = (set, key, value) => {
  set((state) => ({
    loading: {
      ...state.loading,
      [key]: value,
    },
  }));
};

const useAppStore = create((set, get) => ({
  dashboard: defaultDashboard,
  students: [],
  exams: [],
  halls: [],
  allocations: [],
  hallSummaries: [],
  selectedExamId: "",
  error: "",
  loading: {},
  clearError: () => set({ error: "" }),
  setSelectedExamId: (selectedExamId) => set({ selectedExamId }),

  fetchDashboard: async () => {
    setLoadingState(set, "dashboard", true);

    try {
      const response = await http.get("/dashboard");
      set({ dashboard: response.data.data, error: "" });
      return response.data.data;
    } catch (error) {
      const message = getErrorMessage(error);
      set({ error: message });
      throw new Error(message);
    } finally {
      setLoadingState(set, "dashboard", false);
    }
  },

  fetchStudents: async () => {
    setLoadingState(set, "students", true);

    try {
      const response = await http.get("/students");
      set({ students: response.data.data, error: "" });
      return response.data.data;
    } catch (error) {
      const message = getErrorMessage(error);
      set({ error: message });
      throw new Error(message);
    } finally {
      setLoadingState(set, "students", false);
    }
  },

  fetchExams: async () => {
    setLoadingState(set, "exams", true);

    try {
      const response = await http.get("/exams");
      set((state) => ({
        exams: response.data.data,
        selectedExamId: state.selectedExamId || response.data.data[0]?._id || "",
        error: "",
      }));
      return response.data.data;
    } catch (error) {
      const message = getErrorMessage(error);
      set({ error: message });
      throw new Error(message);
    } finally {
      setLoadingState(set, "exams", false);
    }
  },

  fetchHalls: async () => {
    setLoadingState(set, "halls", true);

    try {
      const response = await http.get("/halls");
      set({ halls: response.data.data, error: "" });
      return response.data.data;
    } catch (error) {
      const message = getErrorMessage(error);
      set({ error: message });
      throw new Error(message);
    } finally {
      setLoadingState(set, "halls", false);
    }
  },

  fetchAllocations: async (examId) => {
    if (!examId) {
      set({ allocations: [], hallSummaries: [] });
      return [];
    }

    setLoadingState(set, "allocations", true);

    try {
      const response = await http.get("/allocations", { params: { examId } });
      set({
        allocations: response.data.data.allocations,
        hallSummaries: response.data.data.hallSummaries,
        selectedExamId: examId,
        error: "",
      });
      return response.data.data.allocations;
    } catch (error) {
      const message = getErrorMessage(error);
      set({ error: message });
      throw new Error(message);
    } finally {
      setLoadingState(set, "allocations", false);
    }
  },

  bootstrap: async () => {
    await Promise.all([get().fetchDashboard(), get().fetchStudents(), get().fetchExams(), get().fetchHalls()]);
    const examId = get().selectedExamId;

    if (examId) {
      await get().fetchAllocations(examId);
    }
  },

  createStudent: async (payload) => {
    setLoadingState(set, "studentForm", true);

    try {
      const response = await http.post("/students", payload);
      await Promise.all([get().fetchStudents(), get().fetchDashboard()]);
      return response.data;
    } catch (error) {
      const message = getErrorMessage(error);
      set({ error: message });
      throw new Error(message);
    } finally {
      setLoadingState(set, "studentForm", false);
    }
  },

  updateStudent: async (id, payload) => {
    setLoadingState(set, "studentForm", true);

    try {
      const response = await http.put(`/students/${id}`, payload);
      await get().fetchStudents();
      return response.data;
    } catch (error) {
      const message = getErrorMessage(error);
      set({ error: message });
      throw new Error(message);
    } finally {
      setLoadingState(set, "studentForm", false);
    }
  },

  deleteStudent: async (id) => {
    setLoadingState(set, "studentDelete", true);

    try {
      const response = await http.delete(`/students/${id}`);
      await Promise.all([get().fetchStudents(), get().fetchDashboard()]);
      return response.data;
    } catch (error) {
      const message = getErrorMessage(error);
      set({ error: message });
      throw new Error(message);
    } finally {
      setLoadingState(set, "studentDelete", false);
    }
  },

  uploadStudents: async (file) => {
    setLoadingState(set, "studentUpload", true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await http.post("/students/upload", formData);
      await Promise.all([get().fetchStudents(), get().fetchDashboard()]);
      return response.data;
    } catch (error) {
      const message = getErrorMessage(error);
      set({ error: message });
      throw new Error(message);
    } finally {
      setLoadingState(set, "studentUpload", false);
    }
  },

  createExam: async (payload) => {
    setLoadingState(set, "examForm", true);

    try {
      const response = await http.post("/exams", payload);
      await Promise.all([get().fetchExams(), get().fetchDashboard()]);
      return response.data;
    } catch (error) {
      const message = getErrorMessage(error);
      set({ error: message });
      throw new Error(message);
    } finally {
      setLoadingState(set, "examForm", false);
    }
  },

  updateExam: async (id, payload) => {
    setLoadingState(set, "examForm", true);

    try {
      const response = await http.put(`/exams/${id}`, payload);
      await Promise.all([get().fetchExams(), get().fetchDashboard()]);
      return response.data;
    } catch (error) {
      const message = getErrorMessage(error);
      set({ error: message });
      throw new Error(message);
    } finally {
      setLoadingState(set, "examForm", false);
    }
  },

  deleteExam: async (id) => {
    setLoadingState(set, "examDelete", true);

    try {
      const response = await http.delete(`/exams/${id}`);
      await Promise.all([get().fetchExams(), get().fetchDashboard()]);
      const currentExamId = get().selectedExamId;

      if (currentExamId === id) {
        const nextExamId = get().exams[0]?._id || "";
        set({ selectedExamId: nextExamId, allocations: [], hallSummaries: [] });
        if (nextExamId) {
          await get().fetchAllocations(nextExamId);
        }
      }

      return response.data;
    } catch (error) {
      const message = getErrorMessage(error);
      set({ error: message });
      throw new Error(message);
    } finally {
      setLoadingState(set, "examDelete", false);
    }
  },

  uploadExams: async (file) => {
    setLoadingState(set, "examUpload", true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await http.post("/exams/upload", formData);
      await Promise.all([get().fetchExams(), get().fetchDashboard()]);
      return response.data;
    } catch (error) {
      const message = getErrorMessage(error);
      set({ error: message });
      throw new Error(message);
    } finally {
      setLoadingState(set, "examUpload", false);
    }
  },

  createHall: async (payload) => {
    setLoadingState(set, "hallForm", true);

    try {
      const response = await http.post("/halls", payload);
      await Promise.all([get().fetchHalls(), get().fetchDashboard()]);
      return response.data;
    } catch (error) {
      const message = getErrorMessage(error);
      set({ error: message });
      throw new Error(message);
    } finally {
      setLoadingState(set, "hallForm", false);
    }
  },

  updateHall: async (id, payload) => {
    setLoadingState(set, "hallForm", true);

    try {
      const response = await http.put(`/halls/${id}`, payload);
      await Promise.all([get().fetchHalls(), get().fetchDashboard()]);
      return response.data;
    } catch (error) {
      const message = getErrorMessage(error);
      set({ error: message });
      throw new Error(message);
    } finally {
      setLoadingState(set, "hallForm", false);
    }
  },

  deleteHall: async (id) => {
    setLoadingState(set, "hallDelete", true);

    try {
      const response = await http.delete(`/halls/${id}`);
      await Promise.all([get().fetchHalls(), get().fetchDashboard()]);
      return response.data;
    } catch (error) {
      const message = getErrorMessage(error);
      set({ error: message });
      throw new Error(message);
    } finally {
      setLoadingState(set, "hallDelete", false);
    }
  },

  uploadHalls: async (file) => {
    setLoadingState(set, "hallUpload", true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await http.post("/halls/upload", formData);
      await Promise.all([get().fetchHalls(), get().fetchDashboard()]);
      return response.data;
    } catch (error) {
      const message = getErrorMessage(error);
      set({ error: message });
      throw new Error(message);
    } finally {
      setLoadingState(set, "hallUpload", false);
    }
  },

  generateAllocations: async (examId) => {
    setLoadingState(set, "generateAllocations", true);

    try {
      const response = await http.post("/allocations/generate", { examId });
      await Promise.all([get().fetchAllocations(examId), get().fetchExams(), get().fetchDashboard()]);
      return response.data;
    } catch (error) {
      const message = getErrorMessage(error);
      set({ error: message });
      throw new Error(message);
    } finally {
      setLoadingState(set, "generateAllocations", false);
    }
  },

  clearAllocations: async (examId) => {
    setLoadingState(set, "clearAllocations", true);

    try {
      const response = await http.post("/allocations/clear", { examId });
      await Promise.all([get().fetchAllocations(examId), get().fetchExams(), get().fetchDashboard()]);
      return response.data;
    } catch (error) {
      const message = getErrorMessage(error);
      set({ error: message });
      throw new Error(message);
    } finally {
      setLoadingState(set, "clearAllocations", false);
    }
  },

  downloadAllocationReport: async (examId) => {
    const response = await http.get("/allocations/download", {
      params: { examId },
      responseType: "blob",
    });

    return response.data;
  },
}));

export default useAppStore;

