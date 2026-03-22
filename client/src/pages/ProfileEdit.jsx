import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Camera, Check, X, ArrowLeft, MapPin, User, FileText,
  Heart, Sparkles, GraduationCap, Briefcase, Ruler, Banknote, BookOpen, Wine,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const INTERESTS_OPTIONS = [
  'Travel', 'Coffee', 'Dogs', 'Photography', 'Hiking', 'Music',
  'Cooking', 'Reading', 'Gaming', 'Fitness', 'Art', 'Movies',
  'Dancing', 'Yoga', 'Sports', 'Nature', 'Fashion', 'Tech',
];

const RELATIONSHIP_GOALS  = ['Casual Dating', 'Serious Relationship', 'Marriage', 'Friendship'];
const EDUCATION_OPTIONS   = ["High School", "Bachelor's", "Master's", "PhD", "Diploma", "Other"];
const PROFESSION_OPTIONS  = ['Engineer', 'Doctor', 'Teacher', 'Designer', 'Lawyer', 'Artist', 'Entrepreneur', 'Student', 'Other'];
const INCOME_OPTIONS      = ['< 3 LPA', '3–5 LPA', '5–10 LPA', '10–20 LPA', '20+ LPA'];
const RELIGION_OPTIONS    = ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Buddhist', 'Jain', 'Other'];
const LIFESTYLE_OPTIONS   = ['Never', 'Occasionally', 'Regularly'];

const Section = ({ icon: Icon, title, children, badge }) => (
  <motion.div
    variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
    className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200"
  >
    <div className="flex items-center gap-2 mb-5">
      <div className="p-2 bg-primary-50 rounded-xl">
        <Icon size={18} className="text-primary-600" />
      </div>
      <h2 className="text-base font-bold text-slate-900">{title}</h2>
      {badge && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 ml-auto">{badge}</span>}
    </div>
    {children}
  </motion.div>
);

// Single-select pill group
const PillSelect = ({ options, value, onChange }) => (
  <div className="flex flex-wrap gap-2">
    {options.map(opt => (
      <button key={opt} type="button" onClick={() => onChange(value === opt ? '' : opt)}
        className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
          value === opt ? 'bg-primary-600 text-white border-primary-600' : 'border-slate-200 text-slate-600 hover:border-primary-400 bg-white'
        }`}
      >
        {opt}
      </button>
    ))}
  </div>
);

const ProfileEdit = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name:              user?.name              || '',
    bio:               user?.bio               || '',
    location:          user?.location          || '',
    interests:         user?.interests         || [],
    relationshipGoals: user?.relationshipGoals || 'Casual Dating',
    // Extended fields
    education:         user?.education         || '',
    profession:        user?.profession        || '',
    height:            user?.height            || '',
    income:            user?.income            || '',
    religion:          user?.religion          || '',
    lifestyle: {
      smoking:  user?.lifestyle?.smoking  || '',
      drinking: user?.lifestyle?.drinking || '',
    },
  });

  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [error, setError] = useState('');
  const [photoPreview, setPhotoPreview] = useState(null);

  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const toggleInterest = (interest) => {
    set('interests', form.interests.includes(interest)
      ? form.interests.filter(i => i !== interest)
      : [...form.interests, interest]
    );
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoPreview(URL.createObjectURL(file));
    setUploadingPhoto(true);
    setError('');
    try {
      const data = new FormData();
      data.append('photo', file);
      const res = await api.post('/users/upload-photo', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        // Update preview with the actual saved URL
        setPhotoPreview(res.data.photoUrl);
        await updateProfile({});
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Photo upload failed. Please try again.');
      setPhotoPreview(null);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) return setError('Name is required.');
    setSaving(true);
    setError('');
    const result = await updateProfile(form);
    setSaving(false);
    if (result.success) {
      navigate('/profile');
    } else {
      setError(result.message || 'Failed to save. Please try again.');
    }
  };

  const avatarSrc = photoPreview
    || user?.profilePhoto
    || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&size=128&background=e879a0&color=fff`;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between py-4">
            <button
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors font-medium"
            >
              <ArrowLeft size={18} /> Back
            </button>
            <h1 className="text-lg font-bold text-slate-900">Edit Profile</h1>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 text-sm"
            >
              <Check size={15} /> {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {error && (
          <div className="mb-5 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium flex items-center gap-2">
            <X size={15} /> {error}
          </div>
        )}

        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } }}
          className="space-y-5"
        >
          {/* Photo */}
          <motion.div
            variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col items-center gap-4"
          >
            <div className="relative">
              <img
                src={avatarSrc}
                alt="Profile"
                className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg"
              />
              {uploadingPhoto && (
                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              <label className="absolute bottom-0 right-0 w-9 h-9 bg-primary-600 rounded-full border-4 border-white flex items-center justify-center cursor-pointer hover:bg-primary-700 transition-colors shadow">
                <Camera size={15} className="text-white" />
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} disabled={uploadingPhoto} />
              </label>
            </div>
            <p className="text-sm text-slate-500">Tap the camera icon to change your photo</p>
          </motion.div>

          {/* Basic Info */}
          <Section icon={User} title="Basic Info">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Display Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  maxLength={50}
                  placeholder="Your name"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition-all text-slate-900 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  <span className="flex items-center gap-1"><MapPin size={14} /> Location</span>
                </label>
                <input
                  type="text"
                  value={form.location}
                  onChange={e => set('location', e.target.value)}
                  maxLength={100}
                  placeholder="e.g. New York, NY"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition-all text-slate-900 text-sm"
                />
              </div>
            </div>
          </Section>

          {/* Bio */}
          <Section icon={FileText} title="About Me">
            <textarea
              value={form.bio}
              onChange={e => set('bio', e.target.value)}
              rows={4}
              maxLength={500}
              placeholder="Tell people a bit about yourself — your personality, what you enjoy, what you're looking for..."
              className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition-all text-slate-900 text-sm resize-none"
            />
            <p className="text-xs text-slate-400 mt-1.5 text-right">{form.bio.length}/500</p>
          </Section>

          {/* Relationship Goal */}
          <Section icon={Heart} title="Relationship Goal">
            <div className="flex flex-wrap gap-2">
              {RELATIONSHIP_GOALS.map(goal => (
                <button
                  key={goal}
                  type="button"
                  onClick={() => set('relationshipGoals', goal)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                    form.relationshipGoals === goal
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'border-slate-200 text-slate-600 hover:border-primary-400 bg-white'
                  }`}
                >
                  {goal}
                </button>
              ))}
            </div>
          </Section>

          {/* Interests */}
          <Section icon={Sparkles} title="Interests">
            <p className="text-xs text-slate-500 mb-3">Pick everything that applies to you</p>
            <div className="flex flex-wrap gap-2">
              {INTERESTS_OPTIONS.map(interest => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                    form.interests.includes(interest)
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'border-slate-200 text-slate-600 hover:border-primary-400 bg-white'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
            {form.interests.length > 0 && (
              <p className="text-xs text-primary-600 mt-3 font-medium">{form.interests.length} selected</p>
            )}
          </Section>

          {/* Education & Profession */}
          <Section icon={GraduationCap} title="Education & Career" badge="Premium Filter">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Education</label>
                <PillSelect options={EDUCATION_OPTIONS} value={form.education} onChange={v => set('education', v)} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Profession</label>
                <PillSelect options={PROFESSION_OPTIONS} value={form.profession} onChange={v => set('profession', v)} />
              </div>
            </div>
          </Section>

          {/* Lifestyle */}
          <Section icon={Wine} title="Lifestyle" badge="Premium Filter">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Smoking</label>
                <PillSelect options={LIFESTYLE_OPTIONS} value={form.lifestyle.smoking}
                  onChange={v => set('lifestyle', { ...form.lifestyle, smoking: v })} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Drinking</label>
                <PillSelect options={LIFESTYLE_OPTIONS} value={form.lifestyle.drinking}
                  onChange={v => set('lifestyle', { ...form.lifestyle, drinking: v })} />
              </div>
            </div>
          </Section>

          {/* Height, Income, Religion */}
          <Section icon={Ruler} title="More About You" badge="Pro Filter">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Height (cm)</label>
                <input
                  type="number" min={100} max={250} placeholder="e.g. 170"
                  value={form.height}
                  onChange={e => set('height', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition-all text-slate-900 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Income Range</label>
                <PillSelect options={INCOME_OPTIONS} value={form.income} onChange={v => set('income', v)} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Religion</label>
                <PillSelect options={RELIGION_OPTIONS} value={form.religion} onChange={v => set('religion', v)} />
              </div>
            </div>
          </Section>

          {/* Save / Cancel */}
          <div className="flex gap-3 pb-4">
            <button
              onClick={() => navigate('/profile')}
              className="flex-1 py-3 border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-3 bg-linear-to-r from-primary-600 to-pink-500 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-pink-500/25 transition-all disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfileEdit;
