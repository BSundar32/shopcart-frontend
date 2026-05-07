import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { updateCartItem, removeFromCart } from '../../features/cartSlice';
import axios from '../../utils/axiosConfig'; 
import toast from 'react-hot-toast';
import './CartPage.css';

export default function CartPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items } = useSelector((s) => s.cart);
  const { user } = useSelector((s) => s.auth);
  const [checkout, setCheckout] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [address, setAddress] = useState({ address: '', city: '', postalCode: '', country: 'India' });

  const subtotal = items.reduce((acc, i) => acc + i.product.price * i.quantity, 0);
  const tax = parseFloat((subtotal * 0.18).toFixed(2));
  const shipping = subtotal > 500 ? 0 : 50;
  const total = parseFloat((subtotal + tax + shipping).toFixed(2));

  const handleQty = (productId, qty) => {
    if (qty < 1) return;
    dispatch(updateCartItem({ productId, quantity: qty, token: user.token }));
  };

  const handleRemove = (productId) => {
    dispatch(removeFromCart({ productId, token: user.token }));
    toast.success('Item removed');
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!address.address || !address.city || !address.postalCode) {
      toast.error('Fill in all address fields');
      return;
    }
    try {
      setPlacing(true);
      await axios.post('/api/orders', { shippingAddress: address, paymentMethod: 'COD' }, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      toast.success('Order placed successfully! 🎉');
      navigate('/orders');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="page-wrap">
        <div className="container">
          <div className="empty-cart">
            <div className="empty-icon">🛒</div>
            <h2>Your cart is empty</h2>
            <p>Browse our store and add items you like.</p>
            <button className="btn btn-primary" onClick={() => navigate('/')}>Continue Shopping</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrap">
      <div className="container">
        <h1 className="page-title">Your Cart</h1>
        <div className="cart-layout">
          {/* Items */}
          <div className="cart-items">
            {items.map((item) => (
              <div key={item.product._id} className="cart-item">
                <img src={item.product.image} alt={item.product.name} className="cart-item-img" />
                <div className="cart-item-info">
                  <p className="cart-item-name">{item.product.name}</p>
                  <p className="cart-item-price">₹{item.product.price.toLocaleString()}</p>
                </div>
                <div className="qty-control">
                  <button onClick={() => handleQty(item.product._id, item.quantity - 1)}>−</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => handleQty(item.product._id, item.quantity + 1)}>+</button>
                </div>
                <p className="cart-item-total">₹{(item.product.price * item.quantity).toLocaleString()}</p>
                <button className="remove-btn" onClick={() => handleRemove(item.product._id)}>✕</button>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="cart-summary">
            <h3>Order Summary</h3>
            <div className="summary-row"><span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
            <div className="summary-row"><span>GST (18%)</span><span>₹{tax}</span></div>
            <div className="summary-row"><span>Shipping</span><span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span></div>
            <div className="summary-row total"><span>Total</span><span>₹{total.toLocaleString()}</span></div>

            {!checkout ? (
              <button className="btn btn-gold checkout-btn" onClick={() => setCheckout(true)}>
                Proceed to Checkout
              </button>
            ) : (
              <form className="checkout-form" onSubmit={handlePlaceOrder}>
                <p className="checkout-title">Shipping Address</p>
                <input placeholder="Street Address" value={address.address} onChange={(e) => setAddress({ ...address, address: e.target.value })} />
                <input placeholder="City" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} />
                <input placeholder="Postal Code" value={address.postalCode} onChange={(e) => setAddress({ ...address, postalCode: e.target.value })} />
                <input placeholder="Country" value={address.country} onChange={(e) => setAddress({ ...address, country: e.target.value })} />
                <button className="btn btn-primary checkout-btn" type="submit" disabled={placing}>
                  {placing ? 'Placing Order...' : '✓ Place Order (COD)'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
