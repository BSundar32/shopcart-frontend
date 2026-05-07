import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../features/cartSlice';
import toast from 'react-hot-toast';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (!user) {
      toast.error('Please login to add to cart');
      navigate('/login');
      return;
    }
    dispatch(addToCart({ productId: product._id, quantity: 1, token: user.token }));
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <div className="product-card" onClick={() => navigate(`/product/${product._id}`)}>
      <div className="product-img-wrap">
        <img src={product.image || 'https://via.placeholder.com/400x300?text=Product'} alt={product.name} />
        <span className="product-category badge badge-navy">{product.category}</span>
        {product.stock === 0 && <div className="out-of-stock-overlay">Out of Stock</div>}
      </div>
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-desc">{product.description}</p>
        <div className="product-footer">
          <span className="product-price">₹{product.price.toLocaleString()}</span>
          <button
            className="btn btn-gold btn-sm"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
          >
            {product.stock === 0 ? 'Out of Stock' : '+ Add'}
          </button>
        </div>
      </div>
    </div>
  );
}
