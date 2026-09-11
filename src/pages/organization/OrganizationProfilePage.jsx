import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { organizationService } from '../../services/organizationService';
import {
  Building2,
  CheckCircle2,
  Save,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Award,
  Hash,
} from 'lucide-react';

export const OrganizationProfilePage = () => {
  const { user } = useAuth();
  const orgId = user?.orgId || 'HOSP-PSG-01';

  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    address: '',
    contactPhone: '',
    contactEmail: '',
    nodalOfficer: '',
    nodalDesignation: '',
    bedCapacity: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const data = await organizationService.getOrganizationProfile(orgId);
        setProfile(data);
        setFormData({
          name: data.name || '',
          type: data.type || '',
          address: data.address || '',
          contactPhone: data.contactPhone || '',
          contactEmail: data.contactEmail || '',
          nodalOfficer: data.nodalOfficer || '',
          nodalDesignation: data.nodalDesignation || '',
          bedCapacity: data.bedCapacity || '',
        });
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [orgId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);
    try {
      const updated = await organizationService.updateOrganizationProfile(orgId, formData);
      setProfile(updated);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      alert('Failed to save profile: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-[#787469]">Loading facility profile...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#2F2D29]">
          Healthcare Facility Profile
        </h1>
        <p className="text-xs text-[#787469] mt-0.5">
          Official ABDM Facility Node attributes, registered medical superintendents, and contact details.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
          <CheckCircle2 size={15} className="text-emerald-600" />
          <span>Facility profile details updated successfully.</span>
        </div>
      )}

      {/* Facility Overview Card */}
      <div className="bg-[#FAF7F2] border border-[#E5DDD0] rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5DDD0] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#2F2D29] text-[#F7F3EA] flex items-center justify-center">
              <Building2 size={22} />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#2F2D29]">{profile?.name}</h2>
              <div className="flex items-center gap-2 text-xs text-[#787469]">
                <span>{profile?.type}</span>
                <span>•</span>
                <span className="font-mono text-[11px] text-[#4E7737] font-semibold">{profile?.orgId}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3 py-1 bg-[#EFF4EA] border border-[#C5D9B4] text-[#345124] rounded-full text-xs font-semibold flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-[#4E7737]" />
              <span>Verified ABDM Node</span>
            </div>
          </div>
        </div>

        {/* ABDM Registry Identifiers */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3 bg-[#F4EFE6] rounded-lg border border-[#E5DDD0] text-xs">
            <span className="text-[10px] text-[#8C877C] uppercase font-semibold">ABDM Facility ID</span>
            <p className="font-mono font-semibold text-[#2F2D29] mt-0.5">{profile?.abdmFacilityId}</p>
          </div>
          <div className="p-3 bg-[#F4EFE6] rounded-lg border border-[#E5DDD0] text-xs">
            <span className="text-[10px] text-[#8C877C] uppercase font-semibold">State License Number</span>
            <p className="font-mono font-semibold text-[#2F2D29] mt-0.5">{profile?.licenseNumber}</p>
          </div>
          <div className="p-3 bg-[#F4EFE6] rounded-lg border border-[#E5DDD0] text-xs">
            <span className="text-[10px] text-[#8C877C] uppercase font-semibold">Established Year</span>
            <p className="font-semibold text-[#2F2D29] mt-0.5">{profile?.establishedYear}</p>
          </div>
        </div>
      </div>

      {/* Editable Form */}
      <form onSubmit={handleSubmit} className="bg-[#FAF7F2] border border-[#E5DDD0] rounded-xl p-6 shadow-xs space-y-5">
        <h3 className="text-xs font-semibold text-[#2F2D29] uppercase tracking-wider">
          Facility Details & Governance Contacts
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-[#555147] mb-1">Facility Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-[#D5CDBD] rounded-lg"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#555147] mb-1">Facility Type</label>
            <input
              type="text"
              required
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-[#D5CDBD] rounded-lg"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-semibold text-[#555147] mb-1">Registered Physical Address</label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-[#D5CDBD] rounded-lg"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#555147] mb-1">Contact Phone</label>
            <input
              type="text"
              required
              value={formData.contactPhone}
              onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-[#D5CDBD] rounded-lg"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#555147] mb-1">Contact Email</label>
            <input
              type="email"
              required
              value={formData.contactEmail}
              onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-[#D5CDBD] rounded-lg"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#555147] mb-1">Nodal Officer Name</label>
            <input
              type="text"
              required
              value={formData.nodalOfficer}
              onChange={(e) => setFormData({ ...formData, nodalOfficer: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-[#D5CDBD] rounded-lg"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#555147] mb-1">Nodal Officer Designation</label>
            <input
              type="text"
              required
              value={formData.nodalDesignation}
              onChange={(e) => setFormData({ ...formData, nodalDesignation: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-[#D5CDBD] rounded-lg"
            />
          </div>
        </div>

        <div className="flex items-center justify-end pt-3 border-t border-[#E5DDD0]">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-[#2F2D29] text-[#F7F3EA] hover:bg-[#433F38] transition-colors text-xs font-medium flex items-center gap-1.5 shadow-xs"
          >
            <Save size={14} />
            <span>{saving ? 'Saving changes...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
