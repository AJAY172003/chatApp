import {createSlice} from '@reduxjs/toolkit';
import {storeData} from '../utils/storage';

const initialState = {
  SearchKey: null,
  CountryFilter: null,
  GenderFilter: null,
  LanguageFilter: null,
  User: {
    Name: '',
    Country: '',
    Gender: '',
    Language: '',
    isPremium: false,
    isLoggedIn: false,
    isUserInfoFilled: false,
    Email: '',
    premiumSettings:{
        autoReconnect: false,
        autoMessage:""
    }
  },
};

const DataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    setIsPremium(state, {payload}) {
      state.isPremium = payload;
    },
    setIsLoggedIn(state, {payload}) {
      state.isLoggedIn = payload;
    },
    setSearchKey(state, {payload}) {
      state.SearchKey = payload;
    },
    setCountryFilter(state, {payload}) {
      state.CountryFilter = payload;
    },
    setGenderFilter(state, {payload}) {
      state.GenderFilter = payload;
    },
    setLanguageFilter(state, {payload}) {
      state.LanguageFilter = payload;
    },
    setUser(state, {payload}) {
      state.User = {...state.User, ...payload};
      storeData('user', state.User);
    },
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
} = DataSlice.actions;

export default DataSlice.reducer;
