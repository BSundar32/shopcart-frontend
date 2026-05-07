import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../features/authSlice';
import { clearCart } from '../../features/cartSlice';
import toast from 'react-hot-toast';
import './Navbar.css';

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const { items } = useSelector((s) => s.cart);

  const totalQty = items.reduce((acc, i) => acc + i.quantity, 0);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearCart());
    toast.success('Logged out');
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="container nav-inner">
        <Link to="/" className="nav-logo">
          SK Shop<span>Cart</span>
        </Link>

        <div className="nav-links">
          <Link to="/">Store</Link>
          {user?.isAdmin && <Link to="/admin">Admin</Link>}
        </div>

        <div className="nav-actions">
          {user ? (
            <>
              <Link to="/orders" className="nav-link-subtle">My Orders</Link>
              <Link to="/cart" className="cart-btn">
                🛒
                {totalQty > 0 && <span className="cart-count">{totalQty}</span>}
              </Link>
              <button className="btn btn-outline btn-sm" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
