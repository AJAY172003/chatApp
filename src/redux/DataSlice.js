import { createSlice } from '@reduxjs/toolkit';
import { storeData } from '../utils/storage';

const initialState = {
  SearchKey: null,
  CountryFilter: null,
  GenderFilter: null,
  LanguageFilter: null,
  LastFIOffset: 0,
  User: {
    Name: '',
    Country: '',
    Gender: '',
    Language: '',
    Email: '',
    isPremium: false,
    isLoggedIn: false,
    isUserInfoFilled: false,
    Email: '',
    premiumSettings:{
        autoReconnect: false,
        autoMessage:""
    }
  },
  ChatData: {},
  CurrentChatTab: null
};

const DataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    setIsPremium(state, { payload }) {
      state.isPremium = payload;
    },
    setIsLoggedIn(state, { payload }) {
      state.isLoggedIn = payload;
    },
    setSearchKey(state, { payload }) {
      state.SearchKey = payload;
    },
    setCountryFilter(state, { payload }) {
      state.CountryFilter = payload;
    },
    setGenderFilter(state, { payload }) {
      state.GenderFilter = payload;
    },
    setLanguageFilter(state, { payload }) {
      state.LanguageFilter = payload;
    },
    setUser(state, { payload }) {
      state.User = { ...state.User, ...payload };
      storeData('user', state.User);
    },
    setChatData(state, { payload }) {
      state.ChatData = payload;
    },
    setCurrentChatTab(state, { payload }) {
      state.CurrentChatTab = payload;
    },
    setLastFIOffset(state, { payload }) {
      state.LastFIOffset = payload;
    }
  },
});

export const {
  setIsLoggedIn,
  setIsPremium,
  setSearchKey,
  setCountryFilter,
  setGenderFilter,
  setLanguageFilter,
  setUser,
  setChatData,
  setCurrentChatTab,
  setLastFIOffset
} = DataSlice.actions;

export default DataSlice.reducer;
