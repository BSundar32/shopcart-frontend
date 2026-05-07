import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, createProduct, updateProduct, deleteProduct } from '../../features/productSlice';
import axios from '../../utils/axiosConfig'; 
import toast from 'react-hot-toast';
import './AdminDashboard.css';

const BLANK = { name: '', description: '', price: '', category: '', image: '', stock: '' };

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((s) => s.products);
  const { user } = useSelector((s) => s.auth);
  const [tab, setTab] = useState('products');
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState(BLANK);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { dispatch(fetchProducts()); }, [dispatch]);

  useEffect(() => {
    if (tab === 'orders') {
      axios.get('/api/orders', { headers: { Authorization: `Bearer ${user.token}` } })
        .then((r) => setOrders(r.data));
    }
  }, [tab, user]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.category) { toast.error('Fill required fields'); return; }
    const data = { ...form, price: Number(form.price), stock: Number(form.stock) };
    if (editId) {
      dispatch(updateProduct({ id: editId, data, token: user.token }));
      toast.success('Product updated');
    } else {
      dispatch(createProduct({ data, token: user.token }));
      toast.success('Product created');
    }
    setForm(BLANK); setEditId(null); setShowForm(false);
  };

  const handleEdit = (p) => {
    setForm({ name: p.name, description: p.description, price: p.price, category: p.category, image: p.image, stock: p.stock });
    setEditId(p._id); setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this product?')) {
      dispatch(deleteProduct({ id, token: user.token }));
      toast.success('Product deleted');
    }
  };

  const updateStatus = (orderId, status) => {
    axios.put(`/api/orders/${orderId}/status`, { status }, { headers: { Authorization: `Bearer ${user.token}` } })
      .then(() => {
        setOrders((prev) => prev.map((o) => o._id === orderId ? { ...o, status } : o));
        toast.success('Status updated');
      });
  };

  return (
    <div className="page-wrap">
      <div className="container">
        <h1 className="page-title">Admin Dashboard</h1>

        <div className="admin-tabs">
          <button className={`admin-tab ${tab === 'products' ? 'active' : ''}`} onClick={() => setTab('products')}>
            Products ({items.length})
          </button>
          <button className={`admin-tab ${tab === 'orders' ? 'active' : ''}`} onClick={() => setTab('orders')}>
            Orders ({orders.length})
          </button>
        </div>

        {/* Products Tab */}
        {tab === 'products' && (
          <div>
            <div className="admin-toolbar">
              <button className="btn btn-primary" onClick={() => { setForm(BLANK); setEditId(null); setShowForm(!showForm); }}>
                {showForm ? 'Cancel' : '+ Add Product'}
              </button>
            </div>

            {showForm && (
              <form className="product-form" onSubmit={handleSubmit}>
                <h3>{editId ? 'Edit Product' : 'New Product'}</h3>
                <div className="form-row">
                  <div className="form-group"><label>Name *</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                  <div className="form-group"><label>Category *</label><input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Price (₹) *</label><input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
                  <div className="form-group"><label>Stock</label><input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} /></div>
                </div>
                <div className="form-group"><label>Image URL</label><input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} /></div>
                <div className="form-group"><label>Description</label><textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
                <button className="btn btn-gold" type="submit">{editId ? 'Update Product' : 'Create Product'}</button>
              </form>
            )}

            {loading ? <div className="spinner" /> : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr><th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {items.map((p) => (
                      <tr key={p._id}>
                        <td><img src={p.image} alt="" className="admin-thumb" /></td>
                        <td className="td-name">{p.name}</td>
                        <td><span className="badge badge-muted">{p.category}</span></td>
                        <td>₹{p.price.toLocaleString()}</td>
                        <td><span className={p.stock > 0 ? 'badge badge-success' : 'badge badge-danger'}>{p.stock}</span></td>
                        <td>
                          <div className="action-btns">
                            <button className="btn btn-outline btn-sm" onClick={() => handleEdit(p)}>Edit</button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p._id)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Orders Tab */}
        {tab === 'orders' && (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr><th>Order ID</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th><th>Update</th></tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o._id}>
                    <td className="mono">#{o._id.slice(-8).toUpperCase()}</td>
                    <td>{o.user?.name}<br /><small style={{ color: 'var(--muted)' }}>{o.user?.email}</small></td>
                    <td>₹{o.totalPrice.toLocaleString()}</td>
                    <td><span className="badge badge-navy">{o.status}</span></td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                    <td>
                      <select
                        className="status-select"
                        value={o.status}
                        onChange={(e) => updateStatus(o._id, e.target.value)}
                      >
                        {['Pending','Processing','Shipped','Delivered','Cancelled'].map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
