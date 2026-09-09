import React, { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { recordService } from '../services/recordService';
import {
  FolderHeart,
  Search,
  FlaskConical,
  Pill,
  Stethoscope,
  FileText,
  Eye,
  Download,
  Building2,
  User,
  Calendar,
  UploadCloud,
  Link,
  Plus,
  CheckCircle2,
} from 'lucide-react';

const categoryIcons = {
  'Lab Reports': FlaskConical,
  Prescriptions: Pill,
  Consultations: Stethoscope,
  Scans: FileText,
};

export const RecordsPage = () => {
  const [activeTab, setActiveTab] = useState('received'); // 'received' | 'uploaded' | 'linked'
  const [receivedRecords, setReceivedRecords] = useState([]);
  const [uploadedRecords, setUploadedRecords] = useState([]);
  const [linkedRecords, setLinkedRecords] = useState([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadType, setUploadType] = useState('Lab Reports');
  const [uploadHospital, setUploadHospital] = useState('');
  const [uploadDate, setUploadDate] = useState(new Date().toISOString().split('T')[0]);
  const [uploadDesc, setUploadDesc] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState('');

  // Link Modal State
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [primaryRecordTitle, setPrimaryRecordTitle] = useState('');
  const [linkedRecordTitle, setLinkedRecordTitle] = useState('');
  const [linkNotes, setLinkNotes] = useState('');
  const [linking, setLinking] = useState(false);
  const [linkSuccess, setLinkSuccess] = useState('');

  const loadAllRecords = async () => {
    setLoading(true);
    try {
      const [received, uploaded, linked] = await Promise.all([
        recordService.getRecords('All'),
        recordService.getUploadedRecords(),
        recordService.getLinkedRecords(),
      ]);
      setReceivedRecords(received);
      setUploadedRecords(uploaded);
      setLinkedRecords(linked);
    } catch (err) {
      console.error('Failed to load records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllRecords();
  }, []);

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadTitle.trim()) return;
    setUploading(true);
    setUploadSuccess('');
    try {
      await recordService.uploadRecord({
        title: uploadTitle,
        type: uploadType,
        hospital: uploadHospital || 'Self Upload',
        date: uploadDate,
        description: uploadDesc,
        fileName: uploadFile ? uploadFile.name : 'Document.pdf',
      });
      setUploadSuccess('Record uploaded successfully.');
      setTimeout(() => {
        setUploadSuccess('');
        setShowUploadModal(false);
        setUploadTitle('');
        setUploadDesc('');
        setUploadFile(null);
        loadAllRecords();
        setActiveTab('uploaded');
      }, 800);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleLinkSubmit = async (e) => {
    e.preventDefault();
    if (!primaryRecordTitle || !linkedRecordTitle) return;
    setLinking(true);
    setLinkSuccess('');
    try {
      await recordService.linkRecords(primaryRecordTitle, linkedRecordTitle, linkNotes);
      setLinkSuccess('Records linked successfully.');
      setTimeout(() => {
        setLinkSuccess('');
        setShowLinkModal(false);
        setPrimaryRecordTitle('');
        setLinkedRecordTitle('');
        setLinkNotes('');
        loadAllRecords();
        setActiveTab('linked');
      }, 800);
    } catch (err) {
      console.error(err);
    } finally {
      setLinking(false);
    }
  };

  // Filter lists based on search
  const filteredReceived = receivedRecords.filter((r) => {
    const q = searchQuery.toLowerCase();
    return r.title.toLowerCase().includes(q) || r.hospital.toLowerCase().includes(q);
  });

  const filteredUploaded = uploadedRecords.filter((r) => {
    const q = searchQuery.toLowerCase();
    return r.title.toLowerCase().includes(q) || r.hospital.toLowerCase().includes(q);
  });

  const filteredLinked = linkedRecords.filter((r) => {
    const q = searchQuery.toLowerCase();
    return r.title.toLowerCase().includes(q) || r.notes.toLowerCase().includes(q);
  });

  const inputClass =
    'w-full px-3.5 py-2 bg-[#F4EFE6] border border-[#DED2C0] rounded-lg text-xs text-[#2F2D29] focus:outline-none focus:ring-2 focus:ring-[#A7AA91]/40 focus:border-[#5D6454] transition-colors';

  return (
    <div className="space-y-7">
      {/* Page Header */}
      <div className="border-b border-[#E5DDD0] pb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-block w-2 h-2 rounded-full bg-[#5D6454]" />
              <p className="text-[11px] uppercase tracking-widest text-[#787469] font-mono font-medium">
                Health Archive
              </p>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-normal text-[#2F2D29] tracking-tight">My Health Records</h1>
            <p className="text-xs text-[#686358] mt-1 font-light">
              View records retrieved from hospitals, upload personal records, and link related records together.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setPrimaryRecordTitle(receivedRecords[0]?.title || '');
                setLinkedRecordTitle(uploadedRecords[0]?.title || '');
                setShowLinkModal(true);
              }}
              icon={Link}
            >
              Link Record
            </Button>

            <Button
              size="sm"
              variant="primary"
              onClick={() => setShowUploadModal(true)}
              icon={UploadCloud}
            >
              Upload Record
            </Button>
          </div>
        </div>
      </div>

      {/* Main Section Navigation Tabs */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between border-b border-[#E5DDD0] pb-3">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('received')}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-2 ${
              activeTab === 'received'
                ? 'bg-[#2F2D29] text-[#F7F3EA] shadow-xs'
                : 'bg-[#FAF7F2] text-[#686358] border border-[#E5DDD0] hover:bg-[#F4EFE6]'
            }`}
          >
            <span>Received Records</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${activeTab === 'received' ? 'bg-white/20 text-white' : 'bg-[#EFEAE0] text-[#787469]'}`}>
              {receivedRecords.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('uploaded')}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-2 ${
              activeTab === 'uploaded'
                ? 'bg-[#2F2D29] text-[#F7F3EA] shadow-xs'
                : 'bg-[#FAF7F2] text-[#686358] border border-[#E5DDD0] hover:bg-[#F4EFE6]'
            }`}
          >
            <span>My Uploaded Records</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${activeTab === 'uploaded' ? 'bg-white/20 text-white' : 'bg-[#EFEAE0] text-[#787469]'}`}>
              {uploadedRecords.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('linked')}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-2 ${
              activeTab === 'linked'
                ? 'bg-[#2F2D29] text-[#F7F3EA] shadow-xs'
                : 'bg-[#FAF7F2] text-[#686358] border border-[#E5DDD0] hover:bg-[#F4EFE6]'
            }`}
          >
            <span>Linked Records</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${activeTab === 'linked' ? 'bg-white/20 text-white' : 'bg-[#EFEAE0] text-[#787469]'}`}>
              {linkedRecords.length}
            </span>
          </button>
        </div>

        {/* Search */}
        <div className="relative min-w-[220px] w-full sm:w-auto">
          <Search size={14} className="absolute left-3 top-2.5 text-[#A7AA91]" strokeWidth={1.75} />
          <input
            type="text"
            placeholder="Search records…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-4 py-1.5 bg-[#FAF7F2] border border-[#DED2C0] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#A7AA91]/40 focus:border-[#5D6454] text-[#2F2D29] placeholder-[#A7AA91]"
          />
        </div>
      </div>

      {/* TAB 1: RECEIVED RECORDS */}
      {activeTab === 'received' && (
        <div className="space-y-4">
          <div className="text-xs text-[#787469] font-light">
            Medical records retrieved directly from hospitals and diagnostic providers with your consent.
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-[#8C877C]">Loading received records…</div>
          ) : filteredReceived.length === 0 ? (
            <Card className="py-12 text-center">
              <FolderHeart size={32} className="mx-auto text-[#DED2C0] mb-2" />
              <p className="text-xs font-semibold text-[#686358]">No received records found</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredReceived.map((record) => {
                const CategoryIcon = categoryIcons[record.type] || FileText;
                return (
                  <Card key={record.id} hover className="flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="p-2 bg-[#EFEAE2] text-[#5D6454] rounded-lg">
                          <CategoryIcon size={16} strokeWidth={1.75} />
                        </div>
                        <StatusBadge status={record.status} />
                      </div>

                      <div>
                        <p className="text-[10px] font-mono font-medium text-[#787469] uppercase tracking-wider">{record.type}</p>
                        <h3 className="font-semibold text-[#2F2D29] text-sm mt-0.5 leading-snug line-clamp-2">
                          {record.title}
                        </h3>
                      </div>

                      <div className="space-y-1.5 text-xs text-[#787469] border-t border-[#EFEAE0] pt-3">
                        <div className="flex items-center gap-2">
                          <Building2 size={12} className="text-[#A7AA91] shrink-0" />
                          <span className="truncate">{record.hospital}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User size={12} className="text-[#A7AA91] shrink-0" />
                          <span className="truncate">{record.doctor}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar size={12} className="text-[#A7AA91] shrink-0" />
                          <span className="font-mono text-[11px]">{record.date}</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-[#EFEAE0] pt-3 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-[#8C877C]">{record.fileFormat}</span>
                      <Button size="sm" variant="secondary" onClick={() => setSelectedRecord(record)} icon={Eye}>
                        View Details
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MY UPLOADED RECORDS */}
      {activeTab === 'uploaded' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-[#787469] font-light">
            <span>Records uploaded directly by you.</span>
            <button
              onClick={() => setShowUploadModal(true)}
              className="text-[#2F2D29] font-medium hover:text-[#5D6454] underline underline-offset-4 decoration-[#DED2C0] flex items-center gap-1 transition-colors"
            >
              <Plus size={14} /> Upload New Document
            </button>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-[#8C877C]">Loading uploaded records…</div>
          ) : filteredUploaded.length === 0 ? (
            <Card className="py-12 text-center space-y-3">
              <UploadCloud size={32} className="mx-auto text-[#DED2C0]" />
              <p className="text-xs font-semibold text-[#686358]">No uploaded records yet</p>
              <Button size="sm" variant="primary" onClick={() => setShowUploadModal(true)} icon={UploadCloud}>
                Upload Your First Record
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUploaded.map((record) => (
                <Card key={record.id} hover className="flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="p-2 bg-[#EFEAE2] text-[#5D6454] rounded-lg">
                        <UploadCloud size={16} strokeWidth={1.75} />
                      </div>
                      <StatusBadge status={record.status} />
                    </div>

                    <div>
                      <p className="text-[10px] font-mono font-medium text-[#787469] uppercase tracking-wider">{record.type}</p>
                      <h3 className="font-semibold text-[#2F2D29] text-sm mt-0.5 leading-snug">
                        {record.title}
                      </h3>
                      <p className="text-xs text-[#686358] mt-1 line-clamp-2">{record.description}</p>
                    </div>

                    <div className="space-y-1.5 text-xs text-[#787469] border-t border-[#EFEAE0] pt-3">
                      <div className="flex items-center gap-2">
                        <Building2 size={12} className="text-[#A7AA91] shrink-0" />
                        <span className="truncate">{record.hospital}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={12} className="text-[#A7AA91] shrink-0" />
                        <span className="font-mono text-[11px]">Date: {record.date}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-[#EFEAE0] pt-3 flex items-center justify-between text-xs">
                    <span className="text-[10px] font-mono text-[#8C877C]">{record.fileFormat}</span>
                    <button
                      onClick={() => {
                        setPrimaryRecordTitle(receivedRecords[0]?.title || '');
                        setLinkedRecordTitle(record.title);
                        setShowLinkModal(true);
                      }}
                      className="text-[#2F2D29] font-medium hover:text-[#5D6454] underline underline-offset-4 decoration-[#DED2C0] flex items-center gap-1 text-xs transition-colors"
                    >
                      <Link size={12} /> Link Record
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: LINKED RECORDS */}
      {activeTab === 'linked' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-[#787469] font-light">
            <span>Related records linked together to build your unified health history.</span>
            <button
              onClick={() => {
                setPrimaryRecordTitle(receivedRecords[0]?.title || '');
                setLinkedRecordTitle(uploadedRecords[0]?.title || '');
                setShowLinkModal(true);
              }}
              className="text-[#2F2D29] font-medium hover:text-[#5D6454] underline underline-offset-4 decoration-[#DED2C0] flex items-center gap-1 transition-colors"
            >
              <Plus size={14} /> Link New Bundle
            </button>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-[#8C877C]">Loading linked records…</div>
          ) : filteredLinked.length === 0 ? (
            <Card className="py-12 text-center space-y-3">
              <Link size={32} className="mx-auto text-[#DED2C0]" />
              <p className="text-xs font-semibold text-[#686358]">No linked record bundles</p>
              <Button
                size="sm"
                variant="primary"
                onClick={() => {
                  setPrimaryRecordTitle(receivedRecords[0]?.title || '');
                  setLinkedRecordTitle(uploadedRecords[0]?.title || '');
                  setShowLinkModal(true);
                }}
                icon={Link}
              >
                Link Records Together
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredLinked.map((item) => (
                <Card key={item.id} className="p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-[10px] font-mono font-medium text-[#5D6454] uppercase tracking-wider">LINKED HEALTH BUNDLE</div>
                      <h3 className="font-serif font-semibold text-[#2F2D29] text-base">{item.title}</h3>
                    </div>
                    <StatusBadge status={item.status} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-[#F4EFE6] p-3.5 rounded-xl border border-[#E8E1D4]">
                    <div>
                      <div className="text-[10px] text-[#8C877C] font-mono uppercase font-semibold">Primary Record</div>
                      <div className="font-medium text-[#2F2D29] mt-0.5">{item.primaryRecord}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-[#8C877C] font-mono uppercase font-semibold">Linked Record</div>
                      <div className="font-medium text-[#2F2D29] mt-0.5">{item.linkedRecord}</div>
                    </div>
                  </div>

                  {item.notes && (
                    <div className="text-xs text-[#787469] font-light">
                      Note: <span className="text-[#2F2D29] font-normal">{item.notes}</span>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Record Detail Modal */}
      {selectedRecord && (
        <Modal
          isOpen={!!selectedRecord}
          onClose={() => setSelectedRecord(null)}
          title={selectedRecord.title}
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-mono text-[#8C877C]">{selectedRecord.fileFormat} · {selectedRecord.fileSize}</span>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => setSelectedRecord(null)}>Close</Button>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => alert(`Simulated download: ${selectedRecord.title}`)}
                  icon={Download}
                >
                  Download
                </Button>
              </div>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Hospital', selectedRecord.hospital],
                ['Doctor', selectedRecord.doctor || 'Self Upload'],
                ['Type', selectedRecord.type],
                ['Date', selectedRecord.date],
              ].map(([label, value]) => (
                <div key={label} className="p-3.5 bg-[#F4EFE6] rounded-xl border border-[#E8E1D4]">
                  <div className="text-[10px] text-[#8C877C] font-mono uppercase font-semibold mb-1">{label}</div>
                  <div className="font-semibold text-[#2F2D29] text-[13px]">{value}</div>
                </div>
              ))}
            </div>

            <div>
              <h4 className="text-xs font-semibold text-[#2F2D29] mb-1.5 font-mono uppercase tracking-wider">Clinical Summary</h4>
              <p className="p-3.5 bg-[#F4EFE6] border border-[#E8E1D4] rounded-xl text-[#4B4A3F] leading-relaxed">
                {selectedRecord.summary || selectedRecord.description}
              </p>
            </div>
          </div>
        </Modal>
      )}

      {/* UPLOAD RECORD MODAL */}
      {showUploadModal && (
        <Modal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          title="Upload Medical Record"
          footer={
            <div className="flex justify-end gap-2 w-full">
              <Button variant="secondary" size="sm" onClick={() => setShowUploadModal(false)}>
                Cancel
              </Button>
              <Button size="sm" variant="primary" onClick={handleUploadSubmit} disabled={uploading || !uploadTitle} icon={UploadCloud}>
                {uploading ? 'Uploading…' : 'Upload Record'}
              </Button>
            </div>
          }
        >
          <form onSubmit={handleUploadSubmit} className="space-y-3.5 text-xs">
            {uploadSuccess && (
              <div className="p-3 bg-[#EBF0E6] border border-[#CFDCB8] text-[#425938] text-xs rounded-lg flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#425938]" />
                <span>{uploadSuccess}</span>
              </div>
            )}

            <div>
              <label className="block text-[#4B4A3F] font-semibold mb-1">Record Title / Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Annual Blood Test 2026"
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[#4B4A3F] font-semibold mb-1">Record Type</label>
                <select
                  value={uploadType}
                  onChange={(e) => setUploadType(e.target.value)}
                  className={inputClass}
                >
                  <option value="Lab Reports">Lab Reports</option>
                  <option value="Prescriptions">Prescriptions</option>
                  <option value="Consultations">Consultations</option>
                  <option value="Scans">Scans</option>
                </select>
              </div>

              <div>
                <label className="block text-[#4B4A3F] font-semibold mb-1">Date</label>
                <input
                  type="date"
                  value={uploadDate}
                  onChange={(e) => setUploadDate(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className="block text-[#4B4A3F] font-semibold mb-1">Hospital / Source</label>
              <input
                type="text"
                placeholder="e.g. PSG Hospital or Home Test"
                value={uploadHospital}
                onChange={(e) => setUploadHospital(e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-[#4B4A3F] font-semibold mb-1">Description / Notes</label>
              <textarea
                rows={2}
                placeholder="Add optional notes about this record…"
                value={uploadDesc}
                onChange={(e) => setUploadDesc(e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-[#4B4A3F] font-semibold mb-1">Select File (PDF/Image)</label>
              <input
                type="file"
                accept=".pdf,.jpg,.png"
                onChange={(e) => setUploadFile(e.target.files[0])}
                className="w-full text-xs text-[#787469] file:mr-3 file:py-1.5 file:px-3.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#2F2D29] file:text-[#F7F3EA] hover:file:bg-[#1E1D1A] cursor-pointer"
              />
            </div>
          </form>
        </Modal>
      )}

      {/* LINK RECORD MODAL */}
      {showLinkModal && (
        <Modal
          isOpen={showLinkModal}
          onClose={() => setShowLinkModal(false)}
          title="Link Related Health Records"
          footer={
            <div className="flex justify-end gap-2 w-full">
              <Button variant="secondary" size="sm" onClick={() => setShowLinkModal(false)}>
                Cancel
              </Button>
              <Button size="sm" variant="primary" onClick={handleLinkSubmit} disabled={linking} icon={Link}>
                {linking ? 'Linking…' : 'Link Records'}
              </Button>
            </div>
          }
        >
          <form onSubmit={handleLinkSubmit} className="space-y-3 text-xs">
            {linkSuccess && (
              <div className="p-3 bg-[#EBF0E6] border border-[#CFDCB8] text-[#425938] text-xs rounded-lg flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#425938]" />
                <span>{linkSuccess}</span>
              </div>
            )}

            <div>
              <label className="block text-[#4B4A3F] font-semibold mb-1">Primary Received Record</label>
              <select
                value={primaryRecordTitle}
                onChange={(e) => setPrimaryRecordTitle(e.target.value)}
                className={inputClass}
              >
                {receivedRecords.map((r) => (
                  <option key={r.id} value={r.title}>
                    {r.title} ({r.hospital})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[#4B4A3F] font-semibold mb-1">Record to Link With</label>
              <select
                value={linkedRecordTitle}
                onChange={(e) => setLinkedRecordTitle(e.target.value)}
                className={inputClass}
              >
                {uploadedRecords.map((r) => (
                  <option key={r.id} value={r.title}>
                    [Uploaded] {r.title}
                  </option>
                ))}
                {receivedRecords.map((r) => (
                  <option key={`rec-${r.id}`} value={r.title}>
                    [Received] {r.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[#4B4A3F] font-semibold mb-1">Linking Purpose / Notes</label>
              <input
                type="text"
                placeholder="e.g. Combined for upcoming consultation"
                value={linkNotes}
                onChange={(e) => setLinkNotes(e.target.value)}
                className={inputClass}
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
