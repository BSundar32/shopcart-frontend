import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../utils/axiosConfig'; 

export const fetchProducts = createAsyncThunk('products/fetchAll', async (params = {}, { rejectWithValue }) => {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await axios.get(`/api/products?${query}`);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch products');
  }
});

export const fetchProductById = createAsyncThunk('products/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const res = await axios.get(`/api/products/${id}`);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Product not found');
  }
});

export const fetchCategories = createAsyncThunk('products/categories', async (_, { rejectWithValue }) => {
  try {
    const res = await axios.get('/api/products/categories');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const createProduct = createAsyncThunk('products/create', async ({ data, token }, { rejectWithValue }) => {
  try {
    const res = await axios.post('/api/products', data, { headers: { Authorization: `Bearer ${token}` } });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const updateProduct = createAsyncThunk('products/update', async ({ id, data, token }, { rejectWithValue }) => {
  try {
    const res = await axios.put(`/api/products/${id}`, data, { headers: { Authorization: `Bearer ${token}` } });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const deleteProduct = createAsyncThunk('products/delete', async ({ id, token }, { rejectWithValue }) => {
  try {
    await axios.delete(`/api/products/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

const productSlice = createSlice({
  name: 'products',
  initialState: { items: [], selected: null, categories: [], loading: false, error: null },
  reducers: {
    clearSelected: (s) => { s.selected = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (s) => { s.loading = true; })
      .addCase(fetchProducts.fulfilled, (s, a) => { s.loading = false; s.items = a.payload; })
      .addCase(fetchProducts.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(fetchProductById.pending, (s) => { s.loading = true; s.selected = null; })
      .addCase(fetchProductById.fulfilled, (s, a) => { s.loading = false; s.selected = a.payload; })
      .addCase(fetchProductById.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(fetchCategories.fulfilled, (s, a) => { s.categories = a.payload; })
      .addCase(createProduct.fulfilled, (s, a) => { s.items.unshift(a.payload); })
      .addCase(updateProduct.fulfilled, (s, a) => {
        const idx = s.items.findIndex((p) => p._id === a.payload._id);
        if (idx !== -1) s.items[idx] = a.payload;
        if (s.selected?._id === a.payload._id) s.selected = a.payload;
      })
      .addCase(deleteProduct.fulfilled, (s, a) => {
        s.items = s.items.filter((p) => p._id !== a.payload);
      });
  },
});

export const { clearSelected } = productSlice.actions;
export default productSlice.reducer;
