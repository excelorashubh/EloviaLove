import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Edit, MapPin, Heart, Calendar, Camera, Check, X, BadgeCheck, ShieldCheck, Phone, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import BackButton from '../components/BackButton';

const INTERESTS_OPTIONS = [
  'Travel', 'Coffee', 'Dogs', 'Photography', 'Hiking', 'Music',
  'Cooking', 'Reading', 'Gaming', 'Fitness', 'Art', 'Movies',
  'Dancing', 'Yoga', 'Sports', 'Nature', 'Fashion', 'Tech'
];

const RELATIONSHIP_GOALS = ['Casual Dating', 'Serious Relationship', 'Marriage', 'Friendship'];

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [form, setForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    location: user?.location || '',
    interests: user?.interests || [],
    relationshipGoals: user?.relationshipGoals || 'Casual Dating',
  });

  const age = user?.dateOfBirth
    ? Math.floor((new Date() - new Date(user.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000))
    : null;

  const handleEdit = () => {
    setForm({
      name: user?.name || '',
      bio: user?.bio || '',
      location: user?.location || '',
      interests: user?.interests || [],
      relationshipGoals: user?.relationshipGoals || 'Casual Dating',
    });
    setEditing(true);
    setError('');
    setSuccess('');
  };

  const handleCancel = () => {
    setEditing(false);
    setError('');
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    const result = await updateProfile(form);
    setSaving(false);
    if (result.success) {
      setEditing(false);
      setSuccess('Profile updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(result.message);
    }
  };

  const toggleInterest = (interest) => {
    setForm(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingPhoto(true);
    setError('');
    try {
      const data = new FormData();
      data.append('photo', file);
      await api.post('/users/upload-photo', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      // Reload user from server to get new photo
      await updateProfile({});
      setSuccess('Photo updated');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Photo upload failed');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
  const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <BackButton to="/dashboard" />
              <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
            </div>
            {!editing ? (
              <div className="flex gap-2">
                <Link
                  to="/profile/edit"
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                >
                  <Edit size={16} /> Edit Profile
                </Link>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                >
                  <X size={16} /> Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50"
                >
                  <Check size={16} /> {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm font-medium">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm font-medium">
            {error}
          </div>
        )}

        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6">

          {/* Profile Header Card */}
          <motion.div variants={fadeIn} className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">

              {/* Avatar */}
              <div className="relative shrink-0">
                  <img
                  src={user?.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&size=128&background=e879a0&color=fff`}
                  alt={user?.name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                />
                {user?.isVerified && (
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-500 rounded-full border-4 border-white flex items-center justify-center" title="Verified">
                    <BadgeCheck size={14} className="text-white" />
                  </div>
                )}
                <label className="absolute bottom-0 left-0 w-8 h-8 bg-primary-600 rounded-full border-4 border-white flex items-center justify-center cursor-pointer hover:bg-primary-700 transition-colors">
                  <Camera size={14} className="text-white" />
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploadingPhoto} />
                </label>
              </div>

              {/* Info */}
              <div className="flex-1 w-full">
                {editing ? (
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    className="text-2xl font-bold text-slate-900 border-b-2 border-primary-400 focus:outline-none bg-transparent w-full mb-3"
                  />
                ) : (
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-3xl font-bold text-slate-900">{user?.name}</h2>
                    {age && <span className="text-xl text-slate-500">{age}</span>}
                    {user?.isVerified && (
                      <BadgeCheck size={22} className="text-blue-500" title="Verified" />
                    )}
                  </div>
                )}

                <div className="flex flex-wrap gap-4 mb-4 text-slate-500 text-sm">
                  {editing ? (
                    <div className="flex items-center gap-1">
                      <MapPin size={15} />
                      <input
                        type="text"
                        value={form.location}
                        onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                        placeholder="Your city"
                        className="border-b border-slate-300 focus:outline-none focus:border-primary-400 bg-transparent text-slate-700"
                      />
                    </div>
                  ) : (
                    user?.location && (
                      <div className="flex items-center gap-1">
                        <MapPin size={15} /> <span>{user.location}</span>
                      </div>
                    )
                  )}
                  {user?.dateOfBirth && (
                    <div className="flex items-center gap-1">
                      <Calendar size={15} />
                      <span>{new Date(user.dateOfBirth).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                  )}
                </div>

                {editing ? (
                  <textarea
                    value={form.bio}
                    onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                    rows={3}
                    maxLength={500}
                    placeholder="Write something about yourself..."
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none bg-slate-50"
                  />
                ) : (
                  <p className="text-slate-600 leading-relaxed mb-3">
                    {user?.bio || <span className="text-slate-400 italic">No bio yet — click Edit Profile to add one.</span>}
                  </p>
                )}

                {editing ? (
                  <div className="mt-3">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Relationship Goal</label>
                    <div className="flex flex-wrap gap-2">
                      {RELATIONSHIP_GOALS.map(goal => (
                        <button
                          key={goal}
                          type="button"
                          onClick={() => setForm(p => ({ ...p, relationshipGoals: goal }))}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                            form.relationshipGoals === goal
                              ? 'bg-primary-600 text-white border-primary-600'
                              : 'border-slate-200 text-slate-600 hover:border-primary-400'
                          }`}
                        >
                          {goal}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  user?.relationshipGoals && (
                    <div className="flex items-center gap-2 mt-2">
                      <Heart size={16} className="text-pink-500" />
                      <span className="text-slate-600 font-medium">{user.relationshipGoals}</span>
                    </div>
                  )
                )}
              </div>
            </div>
          </motion.div>

          {/* Interests */}
          <motion.div variants={fadeIn} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Interests</h2>
            {editing ? (
              <div className="flex flex-wrap gap-2">
                {INTERESTS_OPTIONS.map(interest => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                      form.interests.includes(interest)
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'border-slate-200 text-slate-600 hover:border-primary-400'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            ) : user?.interests?.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {user.interests.map((interest, i) => (
                  <span key={i} className="px-4 py-2 bg-primary-50 text-primary-700 rounded-full font-medium text-sm">
                    {interest}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 italic text-sm">No interests added yet.</p>
            )}
          </motion.div>

          {/* Extended Profile Info */}
          {(user?.education || user?.profession || user?.height || user?.income || user?.religion || user?.lifestyle?.smoking || user?.lifestyle?.drinking) && (
            <motion.div variants={fadeIn} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <h2 className="text-lg font-bold text-slate-900 mb-4">About Me</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {user?.education && (
                  <div className="bg-slate-50 rounded-xl p-3">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Education</p>
                    <p className="text-sm font-semibold text-slate-800">{user.education}</p>
                  </div>
                )}
                {user?.profession && (
                  <div className="bg-slate-50 rounded-xl p-3">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Profession</p>
                    <p className="text-sm font-semibold text-slate-800">{user.profession}</p>
                  </div>
                )}
                {user?.height && (
                  <div className="bg-slate-50 rounded-xl p-3">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Height</p>
                    <p className="text-sm font-semibold text-slate-800">{user.height} cm</p>
                  </div>
                )}
                {user?.income && (
                  <div className="bg-slate-50 rounded-xl p-3">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Income</p>
                    <p className="text-sm font-semibold text-slate-800">{user.income}</p>
                  </div>
                )}
                {user?.religion && (
                  <div className="bg-slate-50 rounded-xl p-3">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Religion</p>
                    <p className="text-sm font-semibold text-slate-800">{user.religion}</p>
                  </div>
                )}
                {user?.lifestyle?.smoking && (
                  <div className="bg-slate-50 rounded-xl p-3">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Smoking</p>
                    <p className="text-sm font-semibold text-slate-800">{user.lifestyle.smoking}</p>
                  </div>
                )}
                {user?.lifestyle?.drinking && (
                  <div className="bg-slate-50 rounded-xl p-3">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Drinking</p>
                    <p className="text-sm font-semibold text-slate-800">{user.lifestyle.drinking}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Account Info + Verification */}
          <motion.div variants={fadeIn} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">Account Information</h2>
              <Link to="/verify" className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 text-primary-700 rounded-xl text-xs font-semibold hover:bg-primary-100 transition-colors">
                <ShieldCheck size={13} /> Verify Account
              </Link>
            </div>
            <div className="space-y-0 divide-y divide-slate-100">
              {[
                { label: 'Email', value: user?.email },
                { label: 'Gender', value: user?.gender },
                { label: 'Profile Status', value: user?.profileCompleted ? 'Complete' : 'Incomplete', color: user?.profileCompleted ? 'text-green-600' : 'text-orange-500' },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex justify-between items-center py-3">
                  <span className="text-slate-500 text-sm">{label}</span>
                  <span className={`font-medium text-sm ${color || 'text-slate-900'}`}>{value}</span>
                </div>
              ))}

              {/* Phone verification row */}
              <div className="flex justify-between items-center py-3">
                <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                  <Phone size={13} /> Phone
                </div>
                {user?.phoneVerified
                  ? <span className="flex items-center gap-1 text-green-600 text-sm font-medium"><Check size={13} /> Verified</span>
                  : <Link to="/verify" className="text-xs text-primary-600 font-semibold hover:underline">Verify →</Link>
                }
              </div>

              {/* Email verification row */}
              <div className="flex justify-between items-center py-3">
                <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                  <Mail size={13} /> Email
                </div>
                {user?.emailVerified
                  ? <span className="flex items-center gap-1 text-green-600 text-sm font-medium"><Check size={13} /> Verified</span>
                  : <Link to="/verify?tab=email" className="text-xs text-primary-600 font-semibold hover:underline">Verify →</Link>
                }
              </div>

              {/* Blue tick row */}
              <div className="flex justify-between items-center py-3">
                <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                  <BadgeCheck size={13} /> Blue Tick
                </div>
                {user?.isVerified
                  ? <span className="flex items-center gap-1 text-blue-600 text-sm font-medium"><BadgeCheck size={13} /> Verified</span>
                  : user?.blueTickStatus === 'pending'
                    ? <span className="text-xs text-amber-600 font-semibold">Under Review</span>
                    : <Link to="/verify?tab=bluetick" className="text-xs text-primary-600 font-semibold hover:underline">Get Verified →</Link>
                }
              </div>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
