import React, { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { ShieldCheck, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { doctorConsentService } from '../services/doctorConsentService';

export const RequestConsentModal = ({
  isOpen,
  onClose,
  patient,
  onConsentRequested,
}) => {
  const { user } = useAuth();

  const doctorName = user?.name || 'Dr. Ananya Kumar';
  const doctorRegNo = user?.registrationNumber || 'TN-MED-00123';
  const hospitalName = user?.hospital || 'PSG Institute of Medical Sciences';

  const [requestedRecords, setRequestedRecords] = useState([
    'Consultations',
    'Prescriptions',
    'Lab Reports',
  ]);
  const [duration, setDuration] = useState('30 Days');
  const [purpose, setPurpose] = useState('Clinical evaluation & care review');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen || !patient) return null;

  const recordOptions = [
    'Consultations',
    'Prescriptions',
    'Lab Reports',
    'Scans',
  ];

  const durationOptions = ['24 Hours', '7 Days', '14 Days', '30 Days', '90 Days'];

  const toggleRecord = (type) => {
    if (requestedRecords.includes(type)) {
      if (requestedRecords.length === 1) return; // Keep at least one
      setRequestedRecords(requestedRecords.filter((r) => r !== type));
    } else {
      setRequestedRecords([...requestedRecords, type]);
    }
  };

  const handleSendRequest = async (e) => {
    e.preventDefault();
    setError('');
    if (!purpose.trim()) {
      setError('Please provide a medical reason for this request.');
      return;
    }
    setLoading(true);

    try {
      await doctorConsentService.requestConsent({
        patientId: patient.id,
        patientName: patient.name,
        doctorName,
        doctorRegNo,
        hospitalName,
        requestedRecords,
        duration,
        purpose,
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        if (onConsentRequested) {
          onConsentRequested(patient.id);
        }
      }, 1200);
    } catch (err) {
      setError(err.message || 'Failed to submit consent request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Request Patient Record Access"
      subtitle="The patient must explicitly approve this request before records become accessible."
    >
      {success ? (
        <div className="py-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#EFF4EA] border border-[#C5D9B4] flex items-center justify-center mx-auto text-[#4E7737]">
            <CheckCircle2 size={24} strokeWidth={2} />
          </div>
          <h3 className="font-serif text-lg font-semibold text-[#2F2D29]">Request Sent Successfully</h3>
          <p className="text-xs text-[#686358] max-w-xs mx-auto">
            Status is now <strong className="text-[#865F1D] font-mono">Pending Patient Approval</strong>. The patient has been notified in their portal.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSendRequest} className="space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-[#FDF2F0] border border-[#F3C4BE] text-[#9A2D23] rounded-md flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0 text-[#C94F45]" />
              <span>{error}</span>
            </div>
          )}

          {/* Patient Overview */}
          <div className="p-3 bg-[#F4EFE6] border border-[#E5DDD0] rounded-lg">
            <span className="text-[10px] font-mono uppercase text-[#7D786D] tracking-wider font-semibold block mb-1">
              Target Patient
            </span>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm text-[#2F2D29]">{patient.name}</p>
                <p className="text-[#787469] font-mono text-[11px]">ID: {patient.id} • ABHA: {patient.abhaId || '—'}</p>
              </div>
              <span className="px-2 py-0.5 bg-[#EEE8DC] border border-[#DED2C0] rounded text-[10px] font-mono text-[#5D6454]">
                Consent Required
              </span>
            </div>
          </div>

          {/* Doctor Identity */}
          <div className="p-3 bg-[#F4EFE6] border border-[#E5DDD0] rounded-lg">
            <span className="text-[10px] font-mono uppercase text-[#7D786D] tracking-wider font-semibold block mb-1">
              Requesting Practitioner
            </span>
            <p className="font-semibold text-[#2F2D29]">{doctorName}</p>
            <p className="text-[#787469] font-mono text-[11px]">
              Reg: {doctorRegNo} • {hospitalName}
            </p>
          </div>

          {/* Requested Record Types */}
          <div>
            <label className="block font-semibold text-[#2F2D29] mb-1.5">
              Requested Records
            </label>
            <div className="grid grid-cols-2 gap-2">
              {recordOptions.map((type) => {
                const isChecked = requestedRecords.includes(type);
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => toggleRecord(type)}
                    className={`py-2 px-3 rounded-md border text-left flex items-center justify-between transition-colors ${
                      isChecked
                        ? 'bg-[#EBF0E6] border-[#B9CDB0] text-[#345124] font-medium'
                        : 'bg-white border-[#DED2C0] text-[#787469]'
                    }`}
                  >
                    <span>{type}</span>
                    {isChecked && <CheckCircle2 size={13} className="text-[#4E7737]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block font-semibold text-[#2F2D29] mb-1.5">
              Access Duration
            </label>
            <div className="flex gap-2 flex-wrap">
              {durationOptions.map((dur) => (
                <button
                  key={dur}
                  type="button"
                  onClick={() => setDuration(dur)}
                  className={`px-3 py-1.5 rounded-md border text-xs transition-colors ${
                    duration === dur
                      ? 'bg-[#2F2D29] text-[#F7F3EA] border-[#2F2D29]'
                      : 'bg-white border-[#DED2C0] text-[#686358] hover:bg-[#F4EFE6]'
                  }`}
                >
                  {dur}
                </button>
              ))}
            </div>
          </div>

          {/* Reason / Purpose */}
          <div>
            <label className="block font-semibold text-[#2F2D29] mb-1.5">
              Reason for Request (Clinical Justification)
            </label>
            <textarea
              rows={2}
              required
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g. Clinical evaluation, pre-procedure review..."
              className="w-full px-3 py-2 bg-white border border-[#DED2C0] rounded-md text-xs text-[#2F2D29] focus:outline-none focus:ring-2 focus:ring-[#5D6454]/25 focus:border-[#5D6454]"
            />
          </div>

          {/* Notice */}
          <div className="p-2.5 bg-[#FAF7F2] border border-[#E5DDD0] rounded-md text-[11px] text-[#787469] flex items-start gap-2">
            <ShieldCheck size={14} className="text-[#5D6454] shrink-0 mt-0.5" />
            <span>
              In accordance with patient privacy architecture, no clinical documents will be shown until the patient accepts this request in their portal.
            </span>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2 border-t border-[#E5DDD0]">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={loading}
              icon={Send}
            >
              {loading ? 'Sending Request…' : 'Send Request'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
