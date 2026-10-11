import React, { useState } from 'react';
import { ShieldAlert, PlusCircle, Upload, CheckCircle2, ArrowRight, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { itemService } from '../services/itemService';
import { useNotification } from '../context/NotificationContext';
import { MatchCard } from '../components/MatchCard';

const CATEGORIES = [
  'Electronics',
  'Wallets & Bags',
  'Keys & Badges',
  'Documents & IDs',
  'Clothing & Accessories',
  'Jewelry',
  'Books & Stationery',
  'Other'
];

export function ReportItemPage({ defaultType = 'lost', onSelectItem, onNavigate }) {
  const { showToast } = useNotification();
  const [itemType, setItemType] = useState(defaultType);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Electronics',
    description: '',
    location: '',
    date_occurred: new Date().toISOString().split('T')[0],
    contact_name: '',
    contact_email: '',
    contact_phone: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Success state holding newly created item and match recommendations
  const [createdResult, setCreatedResult] = useState(null);

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim() || formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters.';
    }
    if (!formData.category) {
      newErrors.category = 'Category is required.';
    }
    if (!formData.description.trim() || formData.description.trim().length < 5) {
      newErrors.description = 'Description must be at least 5 characters.';
    }
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required.';
    }
    if (!formData.date_occurred) {
      newErrors.date_occurred = 'Date is required.';
    }
    if (formData.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_email)) {
      newErrors.contact_email = 'Invalid email address.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image file size cannot exceed 5MB.', 'warning');
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      showToast('Please fix the highlighted errors before submitting.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append('type', itemType);
      data.append('title', formData.title.trim());
      data.append('category', formData.category);
      data.append('description', formData.description.trim());
      data.append('location', formData.location.trim());
      data.append('date_occurred', formData.date_occurred);

      if (formData.contact_name) data.append('contact_name', formData.contact_name.trim());
      if (formData.contact_email) data.append('contact_email', formData.contact_email.trim());
      if (formData.contact_phone) data.append('contact_phone', formData.contact_phone.trim());
      if (selectedFile) data.append('image', selectedFile);

      const res = await itemService.createItem(data);
      setCreatedResult(res);
      showToast(`${itemType === 'lost' ? 'Lost' : 'Found'} item reported successfully!`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to submit report', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCreatedResult(null);
    setSelectedFile(null);
    setFilePreview(null);
    setFormData({
      title: '',
      category: 'Electronics',
      description: '',
      location: '',
      date_occurred: new Date().toISOString().split('T')[0],
      contact_name: '',
      contact_email: '',
      contact_phone: ''
    });
    setErrors({});
  };

  if (createdResult) {
    const { item, potentialMatches } = createdResult;
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div className="card" style={{ padding: 'var(--space-8)', textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--color-success-bg)', color: 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-4)' }}>
            <CheckCircle2 size={36} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--neutral-900)', marginBottom: 'var(--space-2)' }}>
            {item.type === 'lost' ? 'Lost Item Report Submitted' : 'Found Item Report Submitted'}
          </h2>
          <p style={{ color: 'var(--neutral-600)', maxWidth: '520px', margin: '0 auto var(--space-6)', fontSize: '0.95rem' }}>
            Your item <strong>"{item.title}"</strong> has been successfully cataloged.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            <button className="btn btn-secondary" onClick={handleReset}>
              Report Another Item
            </button>
            <button className="btn btn-primary" onClick={() => onSelectItem(item.id)}>
              View Item Details <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Instant Rule-Based Matches */}
        {potentialMatches && potentialMatches.length > 0 && (
          <div className="card" style={{ padding: 'var(--space-6)' }}>
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span className="badge badge-category">Rule-Based Match Engine</span>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--neutral-900)' }}>
                Potential Matching Items Discovered
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--neutral-500)' }}>
                Deterministic score calculated from category, date proximity, location keywords, and description tokens.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
              {potentialMatches.map((match) => (
                <MatchCard key={match.item.id} match={match} onSelectMatch={onSelectItem} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto' }}>
      {/* Type Switcher Tabs */}
      <div className="tabs" style={{ justifyContent: 'center' }}>
        <button
          type="button"
          className={`tab-btn ${itemType === 'lost' ? 'active' : ''}`}
          onClick={() => setItemType('lost')}
          style={{ color: itemType === 'lost' ? 'var(--color-lost)' : undefined, borderBottomColor: itemType === 'lost' ? 'var(--color-lost)' : undefined }}
        >
          <ShieldAlert size={18} />
          Report Lost Item
        </button>
        <button
          type="button"
          className={`tab-btn ${itemType === 'found' ? 'active' : ''}`}
          onClick={() => setItemType('found')}
          style={{ color: itemType === 'found' ? 'var(--color-found)' : undefined, borderBottomColor: itemType === 'found' ? 'var(--color-found)' : undefined }}
        >
          <PlusCircle size={18} />
          Report Found Item
        </button>
      </div>

      <div className="card" style={{ padding: 'var(--space-8)' }}>
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--neutral-900)', marginBottom: '4px' }}>
            {itemType === 'lost' ? 'I Lost an Item' : 'I Found an Item'}
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--neutral-500)' }}>
            {itemType === 'lost'
              ? 'Provide clear details to help anyone who finds your item recognize it.'
              : 'Record details of the found item so the rightful owner can search and claim it.'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div className="form-group">
            <label className="form-label" htmlFor="title">
              Item Title / Name <span className="required">*</span>
            </label>
            <input
              id="title"
              type="text"
              className={`form-input ${errors.title ? 'error' : ''}`}
              placeholder={itemType === 'lost' ? 'e.g. Black Leather Bifold Wallet' : 'e.g. Hydro Flask Blue Water Bottle'}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            {errors.title && <span className="form-error-msg">{errors.title}</span>}
          </div>

          {/* Category & Date */}
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="category">
                Category <span className="required">*</span>
              </label>
              <select
                id="category"
                className={`form-select ${errors.category ? 'error' : ''}`}
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="date_occurred">
                Date {itemType === 'lost' ? 'Lost' : 'Found'} <span className="required">*</span>
              </label>
              <input
                id="date_occurred"
                type="date"
                className={`form-input ${errors.date_occurred ? 'error' : ''}`}
                value={formData.date_occurred}
                onChange={(e) => setFormData({ ...formData, date_occurred: e.target.value })}
              />
              {errors.date_occurred && <span className="form-error-msg">{errors.date_occurred}</span>}
            </div>
          </div>

          {/* Location */}
          <div className="form-group">
            <label className="form-label" htmlFor="location">
              {itemType === 'lost' ? 'Approximate Location Lost' : 'Location Found'} <span className="required">*</span>
            </label>
            <input
              id="location"
              type="text"
              className={`form-input ${errors.location ? 'error' : ''}`}
              placeholder="e.g. Central Library 2nd Floor Study Desk or Cafeteria Table 4"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
            {errors.location && <span className="form-error-msg">{errors.location}</span>}
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label" htmlFor="description">
              Item Description <span className="required">*</span>
            </label>
            <textarea
              id="description"
              rows="4"
              className={`form-textarea ${errors.description ? 'error' : ''}`}
              placeholder="Provide a general visual description (color, brand, approximate condition). Do not include secret verification identifiers here."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            {errors.description && <span className="form-error-msg">{errors.description}</span>}
          </div>

          {/* Optional Image Attachment */}
          <div className="form-group">
            <label className="form-label">Optional Photo / Image</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
              <label
                htmlFor="file-upload"
                className="btn btn-secondary btn-sm"
                style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Upload size={16} />
                {selectedFile ? 'Change Photo' : 'Upload Image (PNG, JPG, WebP max 5MB)'}
              </label>
              <input
                id="file-upload"
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />

              {filePreview && (
                <div style={{ position: 'relative', width: '60px', height: '60px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--neutral-300)' }}>
                  <img src={filePreview} alt="Upload preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div style={{ marginTop: 'var(--space-6)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--neutral-200)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--neutral-800)', marginBottom: 'var(--space-3)' }}>
              Contact Details (For Followup)
            </h3>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="contact_name">
                  Your Name (Optional)
                </label>
                <input
                  id="contact_name"
                  type="text"
                  className="form-input"
                  placeholder="e.g. John Doe"
                  value={formData.contact_name}
                  onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="contact_email">
                  Email Address
                </label>
                <input
                  id="contact_email"
                  type="email"
                  className={`form-input ${errors.contact_email ? 'error' : ''}`}
                  placeholder="name@example.com"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                />
                {errors.contact_email && <span className="form-error-msg">{errors.contact_email}</span>}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => onNavigate('search')}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`btn ${itemType === 'lost' ? 'btn-danger' : 'btn-success'}`}
              disabled={loading}
            >
              {loading ? 'Submitting Report...' : itemType === 'lost' ? 'Submit Lost Item' : 'Submit Found Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
