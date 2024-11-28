import { create } from "zustand";
import * as SecureStore from "expo-secure-store";

const useAuthStore = create((set) => ({
  accessToken: null,
  refreshToken: null,
  id: null,
  firstName: null,
  email: null,
  picture: null,
  loginToken: null,
  searching: false,
  expiredToken: false,
  Day: null,
  Time: null,
  // Carregar os tokens do SecureStore
  loadAuthData: async () => {
    try {
      const accessToken = await SecureStore.getItemAsync("accessToken");
      const refreshToken = await SecureStore.getItemAsync("refreshToken");

      if (accessToken && refreshToken) {
        console.log("Tokens carregados do SecureStore");
        set({
          accessToken,
          refreshToken,
        });
      }
    } catch (error) {
      console.error("Erro ao carregar os dados de autenticação", error);
    }
  },

  // Função para salvar o accessToken
  setAccessToken: async (accessToken) => {
    try {
      if (accessToken) {
        console.log("Salvando accessToken no SecureStore...");
        await SecureStore.setItemAsync("accessToken", accessToken);
        console.log("accessToken salvo com sucesso");

        set((state) => {
          if (state.accessToken !== accessToken) {
            return { accessToken };
          }
          return state;
        });
      } else {
        console.warn("AccessToken inválido fornecido para setAccessToken");
      }
    } catch (error) {
      console.error("Erro ao salvar accessToken no SecureStore", error);
    }
  },

  // Função para salvar o refreshToken
  setRefreshToken: async (refreshToken) => {
    try {
      if (refreshToken) {
        console.log("Salvando refreshToken no SecureStore...");
        await SecureStore.setItemAsync("refreshToken", refreshToken);
        console.log("refreshToken salvo com sucesso");

        set((state) => {
          if (state.refreshToken !== refreshToken) {
            return { refreshToken };
          }
          return state;
        });
      } else {
        console.warn("RefreshToken inválido fornecido para setRefreshToken");
      }
    } catch (error) {
      console.error("Erro ao salvar refreshToken no SecureStore", error);
    }
  },

  // Funções para atualizar dados adicionais de autenticação
  setExpiredToken: (expiredToken) => set({ expiredToken }),
  setId: (id) => set({ id }),
  setFirstName: (firstName) => set({ firstName }),
  setEmail: (email) => set({ email }),
  setPicture: (picture) => set({ picture }),
  setLoginToken: (loginToken) => set({ loginToken }),
  setSearching: (searching) => set({ searching }),
  setDay: (Day) => set({ Day }),
  setTime: (Time) => set({ Time }),
  // Função para limpar os dados de autenticação
  clearAuthData: async () => {
    try {
      console.log("Limpando dados de autenticação...");
      await SecureStore.deleteItemAsync("accessToken");
      await SecureStore.deleteItemAsync("refreshToken");

      set({
        accessToken: null,
        refreshToken: null,
        id: null,
        firstName: null,
        email: null,
        picture: null,
        loginToken: null,
      });

      console.log("Dados de autenticação limpos com sucesso");
    } catch (error) {
      console.error("Erro ao limpar os dados de autenticação", error);
    }
  },

  appointmentsTypeList: [],
  setAppointmentsTypeList: (appointments) =>
    set({ appointmentsTypeList: appointments }),
  // Adicionando as listas de agendamentos
  userAppointmentDates: [],
  scheduledDates: [],
  setUserAppointmentDates: (userAppointmentDates) =>
    set({ userAppointmentDates }),
  setScheduledDates: (scheduledDates) => set({ scheduledDates }),
}));

export default useAuthStore;
