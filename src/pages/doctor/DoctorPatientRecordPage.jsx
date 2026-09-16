import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { doctorRecordService } from '../../services/doctorRecordService';
import { doctorConsentService } from '../../services/doctorConsentService';
import { Button } from '../../components/Button';
import {
  ShieldCheck,
  ShieldAlert,
  FileText,
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  Stethoscope,
  Pill,
  FlaskConical,
  Eye,
  Lock,
  Printer,
  AlertCircle,
} from 'lucide-react';

export const DoctorPatientRecordPage = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const regNumber = user?.registrationNumber || 'TN-MED-00123';
  const doctorName = user?.name || 'Dr. Ananya Kumar';

  const [loading, setLoading] = useState(true);
  const [patientData, setPatientData] = useState(null);
  const [error, setError] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [filterType, setFilterType] = useState('All');

  useEffect(() => {
    const fetchRecords = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await doctorRecordService.getPatientRecords(
          patientId,
          regNumber,
          doctorName
        );
        setPatientData(data);
        if (data.records && data.records.length > 0) {
          setSelectedRecord(data.records[0]);
        }
      } catch (err) {
        setError(err.message || 'Access denied. Patient consent is not granted.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, [patientId, regNumber, doctorName]);

  const categories = ['All', 'Lab Reports', 'Prescriptions', 'Consultations', 'Scans'];

  const filteredRecords = patientData?.records?.filter((r) => {
    if (filterType === 'All') return true;
    return r.type.toLowerCase() === filterType.toLowerCase();
  }) || [];

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-[#5D6454] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-[#787469]">Verifying patient consent &amp; decrypting records…</p>
      </div>
    );
  }

  // Access Denied / Consent Not Granted
  if (error || !patientData) {
    return (
      <div className="max-w-xl mx-auto py-12 space-y-6">
        <button
          onClick={() => navigate('/doctor/patients')}
          className="flex items-center gap-2 text-xs text-[#5D6454] hover:underline font-medium"
        >
          <ArrowLeft size={14} />
          Back to Patient Directory
        </button>

        <div className="bg-[#FAF7F2] border border-[#F3C4BE] rounded-2xl p-8 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-[#FDF2F0] border border-[#F3C4BE] flex items-center justify-center mx-auto text-[#C94F45]">
            <ShieldAlert size={28} strokeWidth={1.75} />
          </div>

          <div className="space-y-1.5">
            <h1 className="text-2xl font-serif text-[#2F2D29] font-medium tracking-tight">
              Clinical Records Locked
            </h1>
            <p className="text-xs text-[#9A2D23] max-w-sm mx-auto leading-relaxed">
              {error}
            </p>
          </div>

          <div className="p-4 bg-[#F4EFE6] rounded-xl border border-[#E5DDD0] text-left text-xs text-[#686358] space-y-2">
            <span className="font-semibold text-[#2F2D29] block">Consent Enforcement Policy:</span>
            <p className="text-[11px] leading-relaxed">
              Patient health documents cannot be exposed when consent status is Pending, Rejected, or Revoked. You must request access and obtain explicit patient approval before medical records can be rendered.
            </p>
          </div>

          <div className="pt-2">
            <Button
              size="md"
              variant="primary"
              onClick={() => navigate('/doctor/patients')}
              icon={ArrowLeft}
            >
              Return to Patient Directory
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const { patient, consent } = patientData;

  return (
    <div className="space-y-6">
      {/* Back button & top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5DDD0] pb-5">
        <div className="space-y-1">
          <button
            onClick={() => navigate('/doctor/patients')}
            className="flex items-center gap-1.5 text-xs text-[#5D6454] hover:underline font-medium mb-2"
          >
            <ArrowLeft size={14} />
            Patient Directory
          </button>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-serif font-normal text-[#2F2D29] tracking-tight">
              {patient.name}
            </h1>
            <span className="px-2.5 py-0.5 bg-[#EFF4EA] border border-[#C5D9B4] text-[#345124] rounded-full text-xs font-semibold flex items-center gap-1">
              <CheckCircle2 size={12} className="text-[#4E7737]" />
              Active Consent Verified
            </span>
          </div>
          <p className="text-xs text-[#686358]">
            Patient ID: <span className="font-mono text-[#2F2D29] font-medium">{patient.id}</span> • ABHA: <span className="font-mono text-[#2F2D29] font-medium">{patient.abhaId}</span> • {patient.gender}, {patient.age} yrs • Blood Group: {patient.bloodGroup}
          </p>
        </div>

        {/* Consent Meta Badge */}
        <div className="p-3 bg-[#FAF7F2] border border-[#E5DDD0] rounded-xl text-xs space-y-1 self-start sm:self-auto">
          <div className="flex items-center gap-1.5 text-[#5D6454] font-medium">
            <ShieldCheck size={14} />
            <span>Consent Ref: {consent?.id || 'CONS-01'}</span>
          </div>
          <p className="text-[11px] text-[#787469]">
            Purpose: {consent?.purpose || 'Clinical care review'}
          </p>
          <p className="text-[10px] text-[#8C877C] font-mono">
            Valid till: {consent?.expiryDate || '30 Days'}
          </p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 flex-wrap border-b border-[#E5DDD0] pb-3 text-xs">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterType(cat)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors border ${
              filterType === cat
                ? 'bg-[#2F2D29] text-[#F7F3EA] border-[#2F2D29]'
                : 'bg-[#FAF7F2] text-[#686358] border-[#E5DDD0] hover:bg-[#F4EFE6]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main Split View: Record List & Medical Document Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Record List (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <span className="text-xs font-semibold text-[#7D786D] uppercase font-mono tracking-wider px-1 block">
            Clinical Records ({filteredRecords.length})
          </span>

          <div className="space-y-2.5">
            {filteredRecords.map((rec) => {
              const isSelected = selectedRecord?.id === rec.id;
              return (
                <div
                  key={rec.id}
                  onClick={() => setSelectedRecord(rec)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#EEE8DC] border-[#DED2C0] shadow-xs'
                      : 'bg-[#FAF7F2] border-[#E5DDD0] hover:bg-[#F4EFE6]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-[#F4EFE6] border border-[#E5DDD0] text-[#5D6454] rounded font-medium">
                      {rec.type}
                    </span>
                    <span className="text-[10px] text-[#8C877C] font-mono">{rec.date}</span>
                  </div>
                  <h3 className="font-serif font-semibold text-sm text-[#2F2D29] mt-1.5 leading-snug">
                    {rec.title}
                  </h3>
                  <p className="text-[11px] text-[#787469] mt-1 flex items-center gap-1">
                    <Building2 size={12} className="text-[#8C877C]" />
                    <span>{rec.hospital}</span>
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Document Viewer (8 cols) */}
        <div className="lg:col-span-8">
          {selectedRecord ? (
            <div className="bg-[#FAF7F2] border border-[#E5DDD0] rounded-2xl p-6 sm:p-7 shadow-xs space-y-6">
              {/* Document Header */}
              <div className="border-b border-[#E5DDD0] pb-5 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#7D786D] tracking-wider font-semibold">
                      {selectedRecord.type} • ID: {selectedRecord.id}
                    </span>
                    <h2 className="text-xl font-serif font-semibold text-[#2F2D29] mt-0.5">
                      {selectedRecord.title}
                    </h2>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#EFF4EA] border border-[#C5D9B4] text-[#345124] rounded-full text-xs font-semibold shrink-0">
                    <CheckCircle2 size={12} className="text-[#4E7737]" />
                    <span>{selectedRecord.verificationStatus}</span>
                  </div>
                </div>

                {/* Meta details grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-[#F4EFE6] p-3.5 rounded-xl border border-[#E5DDD0]">
                  <div>
                    <span className="text-[#8C877C] block text-[10px]">Issuing Hospital</span>
                    <span className="font-medium text-[#2F2D29]">{selectedRecord.hospital}</span>
                  </div>
                  <div>
                    <span className="text-[#8C877C] block text-[10px]">Hospital Patient ID</span>
                    <span className="font-mono text-[#2F2D29]">{selectedRecord.hospitalPatientId || '—'}</span>
                  </div>
                  <div>
                    <span className="text-[#8C877C] block text-[10px]">Record Date</span>
                    <span className="font-medium text-[#2F2D29]">{selectedRecord.date}</span>
                  </div>
                  <div>
                    <span className="text-[#8C877C] block text-[10px]">Attending Doctor</span>
                    <span className="font-medium text-[#2F2D29]">{selectedRecord.doctor}</span>
                  </div>
                </div>
              </div>

              {/* Clinical Document Content */}
              <div className="space-y-4 text-xs">
                {/* 1. Diagnosis */}
                <div className="p-4 bg-white border border-[#E5DDD0] rounded-xl space-y-1">
                  <span className="text-[10px] font-mono uppercase text-[#7D786D] tracking-wider font-semibold block">
                    Diagnosis / Clinical Impression
                  </span>
                  <p className="text-sm font-medium text-[#2F2D29]">
                    {selectedRecord.diagnosis || 'Clinical evaluation notes recorded.'}
                  </p>
                </div>

                {/* 2. Symptoms */}
                <div className="p-4 bg-white border border-[#E5DDD0] rounded-xl space-y-1">
                  <span className="text-[10px] font-mono uppercase text-[#7D786D] tracking-wider font-semibold block">
                    Presented Symptoms
                  </span>
                  <p className="text-xs text-[#2F2D29]">
                    {selectedRecord.symptoms || 'None reported.'}
                  </p>
                </div>

                {/* 3. Treatment & Prescriptions */}
                <div className="p-4 bg-white border border-[#E5DDD0] rounded-xl space-y-1">
                  <span className="text-[10px] font-mono uppercase text-[#7D786D] tracking-wider font-semibold block">
                    Treatment &amp; Pharmacotherapy
                  </span>
                  <p className="text-xs text-[#2F2D29]">
                    {selectedRecord.treatment || 'No active medical treatment administered.'}
                  </p>
                </div>

                {/* 4. Lab Results */}
                <div className="p-4 bg-white border border-[#E5DDD0] rounded-xl space-y-1">
                  <span className="text-[10px] font-mono uppercase text-[#7D786D] tracking-wider font-semibold block">
                    Laboratory Findings &amp; Reference Values
                  </span>
                  <p className="text-xs text-[#2F2D29] font-mono leading-relaxed">
                    {selectedRecord.labResults || 'Standard laboratory panel recorded in EHR.'}
                  </p>
                </div>

                {/* 5. Imaging */}
                <div className="p-4 bg-white border border-[#E5DDD0] rounded-xl space-y-1">
                  <span className="text-[10px] font-mono uppercase text-[#7D786D] tracking-wider font-semibold block">
                    Diagnostic Imaging / Scans Summary
                  </span>
                  <p className="text-xs text-[#2F2D29]">
                    {selectedRecord.imaging || 'No radiographic findings recorded.'}
                  </p>
                </div>
              </div>

              {/* Source & Cryptographic Verification Footer */}
              <div className="pt-4 border-t border-[#E5DDD0] flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-[#787469] gap-2">
                <div className="flex items-center gap-2">
                  <Building2 size={13} className="text-[#5D6454]" />
                  <span>Source: {selectedRecord.recordSource}</span>
                </div>
                <div className="flex items-center gap-2 font-mono text-[10px]">
                  <Lock size={12} className="text-[#4E7737]" />
                  <span>EHR FHIR Document Verified</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[300px] flex items-center justify-center p-8 bg-[#FAF7F2] border border-[#E5DDD0] rounded-2xl text-xs text-[#787469]">
              Select a medical record from the left column to view clinical details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
