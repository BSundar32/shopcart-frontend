import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductById, clearSelected } from '../../features/productSlice';
import { addToCart } from '../../features/cartSlice';
import toast from 'react-hot-toast';
import './ProductDetail.css';

export default function ProductDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selected: product, loading } = useSelector((s) => s.products);
  const { user } = useSelector((s) => s.auth);

  useEffect(() => {
    dispatch(fetchProductById(id));
    return () => dispatch(clearSelected());
  }, [dispatch, id]);

  const handleAddToCart = () => {
    if (!user) { toast.error('Please login first'); navigate('/login'); return; }
    dispatch(addToCart({ productId: product._id, quantity: 1, token: user.token }));
    toast.success('Added to cart!');
  };

  if (loading) return <div className="spinner" style={{ marginTop: '6rem' }} />;
  if (!product) return <div className="page-wrap"><div className="container"><p style={{color:'var(--muted)', marginTop:'3rem'}}>Product not found.</p></div></div>;

  return (
    <div className="page-wrap">
      <div className="container">
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
        <div className="detail-grid">
          <div className="detail-img-wrap">
            <img src={product.image || 'https://via.placeholder.com/600x500?text=Product'} alt={product.name} />
          </div>
          <div className="detail-info">
            <span className="badge badge-navy">{product.category}</span>
            <h1 className="detail-name">{product.name}</h1>
            <p className="detail-price">₹{product.price.toLocaleString()}</p>
            <p className="detail-desc">{product.description}</p>

            <div className="detail-meta">
              <div className="meta-item">
                <span className="meta-label">Availability</span>
                <span className={product.stock > 0 ? 'badge badge-success' : 'badge badge-danger'}>
                  {product.stock > 0 ? `In Stock (${product.stock} left)` : 'Out of Stock'}
                </span>
              </div>
            </div>

            <div className="detail-actions">
              <button
                className="btn btn-gold"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                style={{ fontSize: '0.95rem', padding: '0.75rem 2rem' }}
              >
                {product.stock === 0 ? 'Out of Stock' : '🛒 Add to Cart'}
              </button>
              {user && (
                <button
                  className="btn btn-outline"
                  onClick={() => { handleAddToCart(); navigate('/cart'); }}
                  disabled={product.stock === 0}
                  style={{ fontSize: '0.95rem', padding: '0.75rem 2rem' }}
                >
                  Buy Now
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
