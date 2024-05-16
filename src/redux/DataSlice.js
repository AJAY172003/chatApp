import { createSlice } from '@reduxjs/toolkit';
import { storeData } from '../utils/storage';

const initialState = {
  SearchKey: null,
  CountryFilter: null,
  GenderFilter: null,
  LanguageFilter: null,
  LastFIOffset: 0,
  NumUserOnline: 0,
  Reports: 0,
  isTabSwitched: false,
  InfoPopupSeen: false,
  RequiredFilters: {
    country: null,
    chatRoom: null,
    likes: []
  },
  isBlocked: false,
  IP: '',
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

    setNumUserOnline(state, { payload }) {
      state.NumUserOnline = payload;
    },
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
    },
    setRequiredFilters(state, { payload }) {
      state.RequiredFilters = { ...state.RequiredFilters, ...payload };
    },
    setIP(state, { payload }) {
      state.IP = payload;
    },
    setReports(state, { payload }) {
      state.Reports = payload;
    },
    setIsBlocked(state, { payload }) {  
      state.isBlocked = payload;
    },
    setInfoPopupSeen(state, { payload }) {
      state.InfoPopupSeen = payload;
      storeData('infoPopupSeen', payload);
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
  setNumUserOnline,
  setChatData,
  setCurrentChatTab,
  setLastFIOffset,
  setRequiredFilters,
  setIP,
  setReports,
  setIsBlocked,
  setInfoPopupSeen
} = DataSlice.actions;

export default DataSlice.reducer;
