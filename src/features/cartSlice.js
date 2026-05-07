import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../utils/axiosConfig'; 

const authHeader = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

export const fetchCart = createAsyncThunk('cart/fetch', async (token, { rejectWithValue }) => {
  try {
    const res = await axios.get('/api/cart', authHeader(token));
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const addToCart = createAsyncThunk('cart/add', async ({ productId, quantity = 1, token }, { rejectWithValue }) => {
  try {
    const res = await axios.post('/api/cart', { productId, quantity }, authHeader(token));
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const updateCartItem = createAsyncThunk('cart/update', async ({ productId, quantity, token }, { rejectWithValue }) => {
  try {
    const res = await axios.put(`/api/cart/${productId}`, { quantity }, authHeader(token));
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const removeFromCart = createAsyncThunk('cart/remove', async ({ productId, token }, { rejectWithValue }) => {
  try {
    const res = await axios.delete(`/api/cart/${productId}`, authHeader(token));
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const clearCart = createAsyncThunk('cart/clear', async (token, { rejectWithValue }) => {
  try {
    await axios.delete('/api/cart', authHeader(token));
    return [];
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    const setItems = (s, a) => { s.loading = false; s.items = a.payload?.items || []; };
    builder
      .addCase(fetchCart.pending, (s) => { s.loading = true; })
      .addCase(fetchCart.fulfilled, setItems)
      .addCase(fetchCart.rejected, (s) => { s.loading = false; })
      .addCase(addToCart.fulfilled, setItems)
      .addCase(updateCartItem.fulfilled, setItems)
      .addCase(removeFromCart.fulfilled, setItems)
      .addCase(clearCart.fulfilled, (s) => { s.items = []; });
  },
});

export default cartSlice.reducer;
