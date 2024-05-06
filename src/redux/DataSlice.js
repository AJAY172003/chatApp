import { createSlice } from '@reduxjs/toolkit';
import { storeData } from '../utils/storage';

const initialState = {
    isPremium: false,
    isLoggedIn: false,
    SearchKey: null,
    CountryFilter: null,
    GenderFilter: null,
    LanguageFilter: null,
    UserGender: null,
    Preferences: {
        Country: '',
        Gender: '',
        Language: ''
    },
    User: {
        Gender: ''
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
        setUserGender(state, { payload }) {
            state.UserGender = payload;
        },
        setPreferences(state, { payload }) {
            state.Preferences = {...state.Preferences, ...payload};
            storeData('preferences', state.Preferences);
        },
        setUser(state, { payload }) {
            state.User = {...state.User, ...payload};
            storeData('user', state.User);
        },
        setChatData(state, { payload }) {
            state.ChatData = payload;
        },
        setCurrentChatTab(state, { payload }) {
            state.CurrentChatTab = payload;
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
    setUserGender,
    setPreferences,
    setUser,
    setChatData,
    setCurrentChatTab
} = DataSlice.actions;

export default DataSlice.reducer;