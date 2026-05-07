import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, fetchCategories } from '../../features/productSlice';
import { fetchCart } from '../../features/cartSlice';
import ProductCard from '../../components/ProductCard/ProductCard';
import './Home.css';

export default function Home() {
  const dispatch = useDispatch();
  const { items, categories, loading } = useSelector((s) => s.products);
  const { user } = useSelector((s) => s.auth);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('');

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(fetchProducts({ search, ...(activeCategory && { category: activeCategory }) }));
    }, 350);
    return () => clearTimeout(timer);
  }, [dispatch, search, activeCategory]);

  useEffect(() => {
    if (user) dispatch(fetchCart(user.token));
  }, [dispatch, user]);

  return (
    <div className="page-wrap">
      <div className="container">
        {/* Hero Banner */}
        <div className="home-hero">
          <div className="hero-text">
            <p className="hero-eyebrow">New arrivals every week</p>
            <h1>Everything you <br /><span>need, delivered.</span></h1>
            <p className="hero-sub">Browse our curated collection of electronics, clothing, sports gear and more — all at great prices.</p>
          </div>
          <div className="hero-badge">
            <span className="big-num">500+</span>
            <span>Products</span>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-bar">
          <input
            className="search-input"
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="category-tabs">
            <button
              className={`cat-tab ${activeCategory === '' ? 'active' : ''}`}
              onClick={() => setActiveCategory('')}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c}
                className={`cat-tab ${activeCategory === c ? 'active' : ''}`}
                onClick={() => setActiveCategory(c)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Products */}
        {loading ? (
          <div className="spinner" />
        ) : items.length === 0 ? (
          <div className="empty-state">
            <p>No products found.</p>
          </div>
        ) : (
          <div className="products-grid">
            {items.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
