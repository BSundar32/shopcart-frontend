import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../utils/axiosConfig'; 

const userFromStorage = localStorage.getItem('user')
  ? JSON.parse(localStorage.getItem('user'))
  : null;

export const registerUser = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
  try {
    const res = await axios.post('/api/auth/register', data);
    localStorage.setItem('user', JSON.stringify(res.data));
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Registration failed');
  }
});

export const loginUser = createAsyncThunk('auth/login', async (data, { rejectWithValue }) => {
  try {
    const res = await axios.post('/api/auth/login', data);
    localStorage.setItem('user', JSON.stringify(res.data));
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: userFromStorage, loading: false, error: null },
  reducers: {
    logout: (state) => {
      localStorage.removeItem('user');
      state.user = null;
    },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(registerUser.fulfilled, (s, a) => { s.loading = false; s.user = a.payload; })
      .addCase(registerUser.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(loginUser.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(loginUser.fulfilled, (s, a) => { s.loading = false; s.user = a.payload; })
      .addCase(loginUser.rejected, (s, a) => { s.loading = false; s.error = a.payload; });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
