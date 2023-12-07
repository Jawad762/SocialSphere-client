import { createSlice } from '@reduxjs/toolkit'

export const userSlice = createSlice({
    name: 'user',
    initialState: {
        currentUser: null,
        isLoading: false,
        error: false,
        isLogoutLoading: false
    },
    reducers: {
        loginStart: (state) => {
            state.isLoading = true
        },
        loginComplete: (state, action) => {
            state.isLoading = false
            state.currentUser = action.payload
            state.error = false
        },
        loginFail: (state) => {
            state.isLoading = false
            state.error = true
        },
        logoutStart: (state) => {
            state.isLogoutLoading = true
        },
        logoutComplete: (state) => {
            state.currentUser = null
            state.isLogoutLoading = false
            state.error = false
        },
        updateUser: (state, action) => {
            state.currentUser = action.payload
        }
    }
})

export const { loginStart, loginComplete, loginFail, logoutStart, logoutComplete, updateUser } = userSlice.actions

export default userSlice.reducer