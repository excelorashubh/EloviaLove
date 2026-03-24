import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Pencil, Trash2, Check, X, Star, Zap, Sparkles, Crown,
  GripVertical, ToggleLeft, ToggleRight, AlertCircle, Loader2, Tag,
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../services/api';

const ICON_MAP = { free: Star, basic: Zap, premium: Sparkles, pro: Crown };
const GRADIENT_OPTIONS = [
  { label: 'Slate',   value: 'from-slate-400 to-slate-500' },
  { label: 'Blue',    value: 'from-blue-500 to-cyan-500' },
  { label: 'Pink',    value: 'from-primary-600 to-pink-500' },
  { label: 'Amber',   value: 'from-amber-500 to-orange-500' },
  { label: 'Green',   value: 'from-green-500 to-emerald-500' },
  { label: 'Purple',  value: 'from-purple-500 to-violet-500' },
];

// ── Feature row editor ────────────────────────────────────────────────────────
const FeatureRow = ({ feat, idx, onChange, onRemove }) => (
  <div className="flex items-center gap-2 py-1.5 border-b border-slate-100 last:border-0">
    <GripVertical size={14} className="text-slate-300 shrink-0" />
    <input
      value={feat.label}
      onChange={e => onChange(idx, 'label', e.target.value)}
      placeholder="Feature label"
      className="flex-1 text-sm border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-400"
    />
    {/* Value: true / false / custom string */}
    <select
      value={feat.value === true ? '__true' : feat.value === false ? '__false' : '__custom'}
      onChange={e => {
        const v = e.target.value;
        onChange(idx, 'value', v === '__true' ? true : v === '__false' ? false : feat._customVal || '');
      }}
      className="text-xs border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-400"
    >
      <option value="__true">✓ Yes</option>
      <option value="__false">✗ No</option>
      <option value="__custom">Custom</option>
    </select>
    {feat.value !== true && feat.value !== false && (
      <input
        value={feat.value}
        onChange={e => onChange(idx, 'value', e.target.value)}
        placeholder="e.g. 10/day"
        className="w-24 text-xs border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-400"
      />
    )}
    <label className="flex items-center gap-1 text-xs text-slate-500 shrink-0">
      <input
        type="checkbox"
        checked={!!feat.highlight}
        onChange={e => onChange(idx, 'highlight', e.target.checked)}
        className="accent-primary-600"
      />
      ★
    </label>
    <button onClick={() => onRemove(idx)} className="p-1 text-slate-300 hover:text-red-500 transition-colors">
      <X size={13} />
    </button>
  </div>
);

// ── Plan form modal ───────────────────────────────────────────────────────────
const PlanModal = ({ plan, onClose, onSave }) => {
  const isNew = !plan?._id;
  const [form, setForm] = useState(
    plan
      ? { ...plan, features: plan.features?.map(f => ({ ...f })) || [], discount: { isActive: false, offerPrice: '', label: '', expiresAt: '', ...(plan.discount || {}) } }
      : {
          key: '', name: '', price: '', durationDays: 30, description: '',
          color: 'from-slate-400 to-slate-500', isActive: true, isPopular: false,
          sortOrder: 0, features: [],
          discount: { isActive: false, offerPrice: '', label: '', expiresAt: '' },
        }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const setDiscount = (k, v) => setForm(p => ({ ...p, discount: { ...p.discount, [k]: v } }));

  const addFeature = () =>
    setForm(p => ({ ...p, features: [...p.features, { label: '', value: true, highlight: false }] }));

  const updateFeature = (idx, key, val) =>
    setForm(p => {
      const feats = [...p.features];
      feats[idx] = { ...feats[idx], [key]: val };
      return { ...p, features: feats };
    });

  const removeFeature = (idx) =>
    setForm(p => ({ ...p, features: p.features.filter((_, i) => i !== idx) }));

  const submit = async () => {
    if (!form.key || !form.name || form.price === '') {
      setError('Key, name and price are required'); return;
    }
    setSaving(true); setError('');
    try {
      const discount = {
        isActive:   !!form.discount.isActive,
        offerPrice: form.discount.offerPrice !== '' ? Number(form.discount.offerPrice) : undefined,
        label:      form.discount.label || '',
        expiresAt:  form.discount.expiresAt || null,
      };
      const payload = { ...form, price: Number(form.price), sortOrder: Number(form.sortOrder), discount };
      if (isNew) {
        await api.post('/admin/plans', payload);
      } else {
        await api.put(`/admin/plans/${plan._id}`, payload);
      }
      onSave();
    } catch (e) {
      setError(e.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 16 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
          <h2 className="font-bold text-slate-900">{isNew ? 'New Plan' : `Edit — ${plan.name}`}</h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600"><X size={18} /></button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          {/* Key + Name */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Plan Key *</label>
              <input
                value={form.key}
                onChange={e => set('key', e.target.value.toLowerCase().replace(/\s/g, ''))}
                disabled={!isNew}
                placeholder="e.g. premium"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 disabled:bg-slate-50 disabled:text-slate-400"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Display Name *</label>
              <input
                value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder="e.g. Premium"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
            </div>
          </div>

          {/* Price + Duration */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Price (₹) *</label>
              <input
                type="number" min={0}
                value={form.price}
                onChange={e => set('price', e.target.value)}
                placeholder="399"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Duration (days)</label>
              <input
                type="number" min={0}
                value={form.durationDays}
                onChange={e => set('durationDays', e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Description</label>
            <input
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Short tagline shown on pricing page"
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
            />
          </div>

          {/* Color + Sort */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Card Gradient</label>
              <select
                value={form.color}
                onChange={e => set('color', e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
              >
                {GRADIENT_OPTIONS.map(g => (
                  <option key={g.value} value={g.value}>{g.label}</option>
                ))}
              </select>
              {/* Preview */}
              <div className={`mt-1.5 h-5 rounded-lg bg-gradient-to-r ${form.color}`} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Sort Order</label>
              <input
                type="number" min={0}
                value={form.sortOrder}
                onChange={e => set('sortOrder', e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
            </div>
          </div>

          {/* Toggles */}
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <div
                onClick={() => set('isActive', !form.isActive)}
                className={`w-10 h-5 rounded-full relative transition-colors ${form.isActive ? 'bg-green-500' : 'bg-slate-200'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isActive ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </div>
              <span className="text-sm text-slate-700">Active</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <div
                onClick={() => set('isPopular', !form.isPopular)}
                className={`w-10 h-5 rounded-full relative transition-colors ${form.isPopular ? 'bg-amber-400' : 'bg-slate-200'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isPopular ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </div>
              <span className="text-sm text-slate-700">Most Popular badge</span>
            </label>
          </div>

          {/* Discount / Offer Price */}
          <div className="border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag size={14} className="text-primary-500" />
                <span className="text-xs font-semibold text-slate-700">Discount / Offer Price</span>
              </div>
              <div
                onClick={() => setDiscount('isActive', !form.discount.isActive)}
                className={`w-10 h-5 rounded-full relative transition-colors cursor-pointer ${form.discount.isActive ? 'bg-primary-500' : 'bg-slate-200'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.discount.isActive ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </div>
            </div>

            {form.discount.isActive && (
              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 mb-1 block">Offer Price (₹)</label>
                    <input
                      type="number" min={0}
                      value={form.discount.offerPrice}
                      onChange={e => setDiscount('offerPrice', e.target.value)}
                      placeholder="e.g. 199"
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                    />
                    {form.discount.offerPrice !== '' && form.price !== '' && Number(form.discount.offerPrice) < Number(form.price) && (
                      <p className="text-xs text-green-600 mt-1 font-semibold">
                        {Math.round((1 - Number(form.discount.offerPrice) / Number(form.price)) * 100)}% OFF
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 mb-1 block">Badge Label</label>
                    <input
                      value={form.discount.label}
                      onChange={e => setDiscount('label', e.target.value)}
                      placeholder="e.g. 50% OFF"
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">Offer Expires At (optional)</label>
                  <input
                    type="datetime-local"
                    value={form.discount.expiresAt ? new Date(form.discount.expiresAt).toISOString().slice(0, 16) : ''}
                    onChange={e => setDiscount('expiresAt', e.target.value || null)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                  />
                  <p className="text-xs text-slate-400 mt-1">Leave empty for a permanent offer</p>
                </div>
              </div>
            )}
          </div>

          {/* Features */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-500">Features</label>
              <button
                onClick={addFeature}
                className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium"
              >
                <Plus size={12} /> Add feature
              </button>
            </div>
            <div className="border border-slate-200 rounded-xl px-3 py-1 min-h-[60px]">
              {form.features.length === 0 && (
                <p className="text-xs text-slate-400 py-3 text-center">No features yet — click "Add feature"</p>
              )}
              {form.features.map((feat, idx) => (
                <FeatureRow key={idx} feat={feat} idx={idx} onChange={updateFeature} onRemove={removeFeature} />
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex gap-3 sticky bottom-0 bg-white">
          <button onClick={onClose} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={saving}
            className="flex-1 py-2.5 bg-gradient-to-r from-primary-600 to-pink-500 text-white rounded-xl text-sm font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
            {isNew ? 'Create Plan' : 'Save Changes'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ── Plan card ─────────────────────────────────────────────────────────────────
const PlanCard = ({ plan, onEdit, onDelete, onToggle }) => {
  const Icon = ICON_MAP[plan.key] || Star;
  const d = plan.discount;
  const hasDiscount = d?.isActive && d?.offerPrice != null && (!d.expiresAt || new Date(d.expiresAt) > new Date());
  const effectivePrice = hasDiscount ? d.offerPrice : plan.price;

  return (
    <div className={`bg-white rounded-2xl border-2 shadow-sm transition-all ${plan.isActive ? 'border-slate-200' : 'border-dashed border-slate-200 opacity-60'}`}>
      {/* Gradient header */}
      <div className={`bg-gradient-to-r ${plan.color} rounded-t-2xl p-4 text-white relative`}>
        {plan.isPopular && (
          <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-bold px-2.5 py-0.5 bg-amber-400 text-amber-900 rounded-full whitespace-nowrap">
            Most Popular
          </span>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <Icon size={18} />
            </div>
            <div>
              <p className="font-extrabold text-base leading-tight">{plan.name}</p>
              <p className="text-white/70 text-xs">{plan.description}</p>
            </div>
          </div>
          <div className="text-right">
            {hasDiscount ? (
              <>
                <p className="text-white/50 text-xs line-through">₹{plan.price}</p>
                <p className="text-2xl font-extrabold">₹{effectivePrice}</p>
                <p className="text-white/60 text-[10px]">/month</p>
              </>
            ) : (
              <>
                <p className="text-2xl font-extrabold">{plan.price === 0 ? 'Free' : `₹${plan.price}`}</p>
                {plan.price > 0 && <p className="text-white/60 text-[10px]">/month</p>}
              </>
            )}
          </div>
        </div>
        {hasDiscount && d.label && (
          <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 bg-yellow-400 text-yellow-900 rounded-full">
            🔥 {d.label}
          </span>
        )}
      </div>

      {/* Features */}
      <div className="px-4 py-3 space-y-1.5 min-h-[120px]">
        {plan.features.slice(0, 5).map((f, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            {f.value === false ? (
              <X size={12} className="text-slate-300 shrink-0" />
            ) : (
              <Check size={12} className="text-green-500 shrink-0" strokeWidth={3} />
            )}
            <span className={`${f.value === false ? 'text-slate-300 line-through' : 'text-slate-600'} ${f.highlight ? 'font-semibold text-slate-800' : ''}`}>
              {f.label}{typeof f.value === 'string' ? `: ${f.value}` : ''}
            </span>
          </div>
        ))}
        {plan.features.length > 5 && (
          <p className="text-xs text-slate-400">+{plan.features.length - 5} more features</p>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 flex items-center gap-2">
        <button
          onClick={() => onToggle(plan)}
          className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
            plan.isActive
              ? 'bg-green-50 text-green-700 hover:bg-green-100'
              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
          }`}
        >
          {plan.isActive ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
          {plan.isActive ? 'Active' : 'Inactive'}
        </button>
        <button
          onClick={() => onEdit(plan)}
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors ml-auto"
        >
          <Pencil size={13} /> Edit
        </button>
        {plan.key !== 'free' && (
          <button
            onClick={() => onDelete(plan)}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
          >
            <Trash2 size={13} /> Delete
          </button>
        )}
      </div>
    </div>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────
const AdminPlans = () => {
  const [plans, setPlans]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]   = useState(null); // null | 'new' | plan object
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/plans');
      setPlans(res.data.plans);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleToggle = async (plan) => {
    try {
      await api.put(`/admin/plans/${plan._id}`, { isActive: !plan.isActive });
      load();
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (plan) => {
    if (!window.confirm(`Delete "${plan.name}" plan? This cannot be undone.`)) return;
    setDeleting(plan._id);
    try {
      await api.delete(`/admin/plans/${plan._id}`);
      load();
    } catch (e) {
      alert(e.response?.data?.message || 'Delete failed');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Subscription Plans</h1>
            <p className="text-slate-500 text-sm mt-1">Manage pricing, features, and plan visibility</p>
          </div>
          <button
            onClick={() => setModal('new')}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-pink-500 text-white rounded-xl text-sm font-bold shadow-lg hover:shadow-pink-500/30 transition-all"
          >
            <Plus size={16} /> New Plan
          </button>
        </div>

        {/* Info banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800 flex items-start gap-2">
          <AlertCircle size={16} className="shrink-0 mt-0.5 text-amber-500" />
          <span>
            Changes to plan prices take effect for <strong>new subscriptions only</strong>.
            Existing active subscribers keep their current rate until renewal.
            Razorpay plan IDs are cached — if you change a price, clear the server cache or restart to force a new Razorpay plan creation.
          </span>
        </div>

        {/* Plan cards grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 h-64 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {plans.map(plan => (
              <PlanCard
                key={plan._id}
                plan={plan}
                onEdit={setModal}
                onDelete={handleDelete}
                onToggle={handleToggle}
              />
            ))}
          </div>
        )}

        {/* Table view */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800">All Plans</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {['Plan', 'Key', 'Price', 'Duration', 'Features', 'Popular', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {plans.map(plan => {
                  const Icon = ICON_MAP[plan.key] || Star;
                  return (
                    <tr key={plan._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center`}>
                            <Icon size={14} className="text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{plan.name}</p>
                            <p className="text-xs text-slate-400 truncate max-w-[140px]">{plan.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <code className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{plan.key}</code>
                      </td>
                      <td className="px-5 py-3 font-bold text-slate-900">
                        {(() => {
                          const d = plan.discount;
                          const hasD = d?.isActive && d?.offerPrice != null && (!d.expiresAt || new Date(d.expiresAt) > new Date());
                          return hasD ? (
                            <span className="flex items-center gap-1.5">
                              <span className="line-through text-slate-300 font-normal text-xs">₹{plan.price}</span>
                              <span className="text-primary-600">₹{d.offerPrice}</span>
                              {d.label && <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full font-bold">{d.label}</span>}
                            </span>
                          ) : plan.price === 0 ? 'Free' : `₹${plan.price}`;
                        })()}
                      </td>
                      <td className="px-5 py-3 text-slate-500">
                        {plan.durationDays > 0 ? `${plan.durationDays} days` : '—'}
                      </td>
                      <td className="px-5 py-3 text-slate-500">{plan.features?.length || 0}</td>
                      <td className="px-5 py-3">
                        {plan.isPopular
                          ? <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Yes</span>
                          : <span className="text-xs text-slate-300">—</span>}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${plan.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'}`}>
                          {plan.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => setModal(plan)} className="p-1.5 text-slate-400 hover:text-primary-600 transition-colors">
                            <Pencil size={14} />
                          </button>
                          {plan.key !== 'free' && (
                            <button
                              onClick={() => handleDelete(plan)}
                              disabled={deleting === plan._id}
                              className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                            >
                              {deleting === plan._id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Modal */}
      <AnimatePresence>
        {modal && (
          <PlanModal
            plan={modal === 'new' ? null : modal}
            onClose={() => setModal(null)}
            onSave={() => { setModal(null); load(); }}
          />
        )}
      </AnimatePresence>
    </AdminLayout>
  );
};

export default AdminPlans;
