import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import './Orders.css';

const STATUS_COLORS = {
  Pending: 'badge-muted',
  Processing: 'badge-gold',
  Shipped: 'badge-teal',
  Delivered: 'badge-success',
  Cancelled: 'badge-danger',
};

export default function Orders() {
  const { user } = useSelector((s) => s.auth);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get('/api/orders/myorders', { headers: { Authorization: `Bearer ${user.token}` } })
      .then((res) => setOrders(res.data))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <div className="spinner" style={{ marginTop: '6rem' }} />;

  return (
    <div className="page-wrap">
      <div className="container">
        <h1 className="page-title">My Orders</h1>
        {orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--muted)' }}>
            <p>You haven't placed any orders yet.</p>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order._id} className="order-card">
                <div className="order-header">
                  <div>
                    <p className="order-id">Order #{order._id.slice(-8).toUpperCase()}</p>
                    <p className="order-date">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <span className={`badge ${STATUS_COLORS[order.status] || 'badge-muted'}`}>{order.status}</span>
                </div>

                <div className="order-items">
                  {order.items.map((item, i) => (
                    <div key={i} className="order-item-row">
                      {item.image && <img src={item.image} alt={item.name} />}
                      <span className="order-item-name">{item.name}</span>
                      <span className="order-item-qty">× {item.quantity}</span>
                      <span className="order-item-price">₹{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <div className="order-footer">
                  <div className="order-address">
                    📍 {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                  </div>
                  <div className="order-total">
                    <span>Total:</span>
                    <strong>₹{order.totalPrice.toLocaleString()}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
