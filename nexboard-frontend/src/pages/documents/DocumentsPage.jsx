import { useState, useEffect, useCallback } from 'react';
import {
  getAllDocuments,
  getDocumentsByEmployee,
  uploadDocument,
  verifyDocument,
  getDocumentFile
} from '../../api/documentApi';
import { getEmployees } from '../../api/employeeApi';
import { handleApiError } from '../../utils/errorHandler';
import Badge from '../../components/ui/Badge';
import SkeletonLoader from '../../components/ui/SkeletonLoader';
import EmptyState from '../../components/ui/EmptyState';
import PageHeader from '../../components/ui/PageHeader';
import EmployeeSelector from '../../components/shared/EmployeeSelector';
import { DOC_TYPES } from '../../utils/enumLabels';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import {
  Upload,
  FileText,
  UserSearch,
  Check,
  X,
  Eye,
  Download,
  RefreshCw,
  File,
  Loader2,
  AlertTriangle
} from 'lucide-react';

export default function DocumentsPage() {
  const { auth, selectedEmployeeId } = useAuth();
  const isEmployee = auth?.role === 'EMPLOYEE';
  const canVerify  = ['ADMIN', 'HR'].includes(auth?.role);
  const canUpload  = ['ADMIN', 'HR', 'EMPLOYEE'].includes(auth?.role);

  // Tabs for HR/Admin: 'queue' (Verification Queue) or 'browse' (Browse by Employee)
  const [activeTab, setActiveTab] = useState(isEmployee ? 'browse' : 'queue');

  const [employees, setEmployees]     = useState([]);
  const [selectedEmp, setSelectedEmp] = useState(isEmployee ? selectedEmployeeId : null);
  
  // Lists
  const [docs, setDocs]               = useState([]); // Individual employee docs
  const [allDocs, setAllDocs]         = useState([]); // Verification Queue (All docs)
  
  // Loading states
  const [loading, setLoading]         = useState(false);
  const [loadingAll, setLoadingAll]   = useState(false);
  const [uploading, setUploading]     = useState(false);
  
  // Upload form state
  const [docType, setDocType]         = useState('OFFER_LETTER');
  const [file, setFile]               = useState(null);

  // Document preview state
  const [previewDoc, setPreviewDoc]         = useState(null);
  const [previewUrl, setPreviewUrl]         = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  
  // View tracking: Map of { [docId]: boolean }
  const [viewedDocIds, setViewedDocIds]     = useState({});

  // Rejection modal state
  const [rejectingDocId, setRejectingDocId]     = useState(null);
  const [remarks, setRemarks]                   = useState('');
  const [submittingRejection, setSubmittingRejection] = useState(false);

  // Load employee list for HR/Admin
  useEffect(() => {
    if (!isEmployee) {
      getEmployees()
        .then(r => setEmployees(r.data))
        .catch(handleApiError);
    }
  }, [isEmployee]);

  // Load individual documents
  const loadDocs = useCallback(async () => {
    if (!selectedEmp) return;
    setLoading(true);
    try {
      const r = await getDocumentsByEmployee(selectedEmp);
      setDocs(r.data);
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  }, [selectedEmp]);

  // Load verification queue (all documents in the system)
  const loadAllDocs = useCallback(async () => {
    if (isEmployee) return;
    setLoadingAll(true);
    try {
      const r = await getAllDocuments();
      setAllDocs(r.data);
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoadingAll(false);
    }
  }, [isEmployee]);

  // Handle load triggers
  useEffect(() => {
    loadDocs();
  }, [loadDocs]);

  useEffect(() => {
    if (!isEmployee) {
      loadAllDocs();
    }
  }, [isEmployee, loadAllDocs]);

  // Upload handler
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !selectedEmp) return;
    setUploading(true);
    try {
      await uploadDocument(selectedEmp, docType, file);
      toast.success('Document uploaded successfully');
      setFile(null);
      // Reset input element
      const fileInput = document.getElementById('document-file-input');
      if (fileInput) fileInput.value = '';
      loadDocs();
      loadAllDocs();
    } catch (err) {
      handleApiError(err);
    } finally {
      setUploading(false);
    }
  };

  // Re-upload click helper for employees
  const handleReuploadClick = (type) => {
    setDocType(type);
    toast.success(`Selected ${type.replace(/_/g, ' ')} for upload. Please choose a file below.`);
    // Focus the file input helper
    setTimeout(() => {
      document.getElementById('document-file-input')?.click();
    }, 100);
  };

  // View binary content securely
  const handleView = async (doc) => {
    setPreviewLoading(true);
    setPreviewDoc(doc);
    setPreviewUrl(null);
    try {
      const response = await getDocumentFile(doc.id);
      const url = URL.createObjectURL(response.data);
      setPreviewUrl(url);
      // Mark as viewed for HR verification requirement
      setViewedDocIds(prev => ({ ...prev, [doc.id]: true }));
    } catch (err) {
      handleApiError(err);
      setPreviewDoc(null);
    } finally {
      setPreviewLoading(false);
    }
  };

  const closePreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewDoc(null);
    setPreviewUrl(null);
  };

  // Approval handler
  const handleApprove = async (docId) => {
    try {
      await verifyDocument(docId, {
        verificationStatus: 'VERIFIED',
        remarks: 'Document approved and verified successfully.'
      });
      toast.success('Document approved');
      loadDocs();
      loadAllDocs();
    } catch (err) {
      handleApiError(err);
    }
  };

  // Rejection modal controls
  const openRejectModal = (docId) => {
    setRejectingDocId(docId);
    setRemarks('');
  };

  const closeRejectModal = () => {
    setRejectingDocId(null);
    setRemarks('');
  };

  const submitRejection = async () => {
    if (!remarks.trim()) {
      toast.error('Rejection remarks are mandatory');
      return;
    }
    setSubmittingRejection(true);
    try {
      await verifyDocument(rejectingDocId, {
        verificationStatus: 'REJECTED',
        remarks: remarks.trim()
      });
      toast.success('Document rejected successfully');
      closeRejectModal();
      loadDocs();
      loadAllDocs();
    } catch (err) {
      handleApiError(err);
    } finally {
      setSubmittingRejection(false);
    }
  };

  return (
    <div>
      <PageHeader title="Documents" subtitle="Upload and verify employee onboarding documents" />

      {/* Tabs for HR/Admin */}
      {canVerify && (
        <div className="flex border-b border-slate-200 mb-6 gap-6">
          <button
            onClick={() => setActiveTab('queue')}
            className={`pb-3 text-sm font-semibold border-b-2 transition-all duration-150 cursor-pointer ${
              activeTab === 'queue'
                ? 'border-accent-600 text-accent-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Verification Queue ({allDocs.filter(d => d.verificationStatus === 'PENDING').length} Pending)
          </button>
          <button
            onClick={() => setActiveTab('browse')}
            className={`pb-3 text-sm font-semibold border-b-2 transition-all duration-150 cursor-pointer ${
              activeTab === 'browse'
                ? 'border-accent-600 text-accent-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Browse & Upload by Employee
          </button>
        </div>
      )}

      {/* RENDER TAB 1: Verification Queue (HR/Admin only) */}
      {canVerify && activeTab === 'queue' && (
        <div>
          {loadingAll ? (
            <SkeletonLoader variant="table" rows={6} cols={7} />
          ) : !allDocs.length ? (
            <div className="card">
              <EmptyState
                title="No documents uploaded yet"
                description="Documents uploaded by employees will appear here for HR verification."
                icon={<FileText size={24} />}
              />
            </div>
          ) : (
            <div className="card overflow-hidden">
              <div className="px-4 py-3.5 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-caption font-bold text-slate-700 uppercase tracking-wider">
                  Verification Pending Queue
                </h3>
                <button
                  onClick={loadAllDocs}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-650 hover:bg-slate-100 transition"
                  title="Refresh Queue"
                >
                  <RefreshCw size={14} />
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50/80 border-b border-slate-100">
                    <tr>
                      {['Employee ID', 'Employee Name', 'Document Type', 'File Name', 'Upload Date', 'Status', 'Actions'].map(h => (
                        <th key={h} className="px-4 py-3.5 text-left text-table-header">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {allDocs.map(d => {
                      const isViewed = viewedDocIds[d.id] === true;
                      return (
                        <tr key={d.id} className="transition-colors duration-150 hover:bg-primary-50/30">
                          <td className="px-4 py-3.5 text-caption font-medium text-slate-600 font-mono">#{d.employeeId}</td>
                          <td className="px-4 py-3.5 font-medium text-slate-800">{d.employeeName}</td>
                          <td className="px-4 py-3.5 font-semibold text-slate-700">
                            {d.documentType.replace(/_/g, ' ')}
                          </td>
                          <td className="px-4 py-3.5 text-caption max-w-xs truncate" title={d.fileName}>
                            {d.fileName}
                          </td>
                          <td className="px-4 py-3.5 text-caption">
                            {d.uploadedAt ? new Date(d.uploadedAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                          </td>
                          <td className="px-4 py-3.5">
                            <Badge value={d.verificationStatus} />
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleView(d)}
                                className="px-2.5 py-1.5 text-xs bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
                                title="View Document"
                              >
                                <Eye size={13} />
                                View
                              </button>

                              {d.verificationStatus === 'PENDING' && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleApprove(d.id)}
                                    disabled={!isViewed}
                                    className={`px-2.5 py-1.5 text-xs bg-emerald-600 text-white rounded-lg transition-colors flex items-center gap-1 cursor-pointer font-medium ${
                                      isViewed ? 'hover:bg-emerald-700' : 'opacity-40 cursor-not-allowed'
                                    }`}
                                    title={isViewed ? 'Approve document' : 'You must view the document first'}
                                  >
                                    <Check size={13} />
                                    Approve
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => openRejectModal(d.id)}
                                    disabled={!isViewed}
                                    className={`px-2.5 py-1.5 text-xs bg-rose-600 text-white rounded-lg transition-colors flex items-center gap-1 cursor-pointer font-medium ${
                                      isViewed ? 'hover:bg-rose-700' : 'opacity-40 cursor-not-allowed'
                                    }`}
                                    title={isViewed ? 'Reject document' : 'You must view the document first'}
                                  >
                                    <X size={13} />
                                    Reject
                                  </button>
                                </>
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
          )}
        </div>
      )}

      {/* RENDER TAB 2: Browse and Upload (Original logic) */}
      {(isEmployee || (canVerify && activeTab === 'browse')) && (
        <div>
          {/* Employee Selector for HR/Admin */}
          {!isEmployee && (
            <EmployeeSelector value={selectedEmp} onChange={setSelectedEmp} employees={employees} />
          )}

          {/* Document Upload Form */}
          {canUpload && selectedEmp && (
            <form onSubmit={handleUpload} className="card card-pad mb-6 flex flex-wrap gap-4 items-end panel-enter">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-caption font-semibold mb-1.5 text-slate-700">Document Type</label>
                <select
                  value={docType}
                  onChange={e => setDocType(e.target.value)}
                  className="input-field"
                >
                  {DOC_TYPES.map(t => (
                    <option key={t} value={t}>
                      {t.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-caption font-semibold mb-1.5 text-slate-700">Select File</label>
                <input
                  id="document-file-input"
                  type="file"
                  required
                  className="text-sm text-slate-605 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-705 hover:file:bg-slate-200 file:transition-colors"
                  aria-label="Choose file to upload"
                  onChange={e => setFile(e.target.files?.[0] ?? null)}
                />
              </div>
              <button
                type="submit"
                disabled={uploading}
                className="btn-primary flex items-center justify-center gap-2 cursor-pointer h-[38px] px-6 rounded-xl"
              >
                {uploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload size={16} />
                )}
                {uploading ? 'Uploading…' : 'Upload Document'}
              </button>
            </form>
          )}

          {/* Document Records View */}
          {!selectedEmp ? (
            <div className="card">
              <EmptyState
                title="Select an employee"
                description="Choose an employee to view and upload their onboarding documents."
                icon={<UserSearch size={24} />}
              />
            </div>
          ) : loading ? (
            <SkeletonLoader variant="table" rows={4} cols={7} />
          ) : !docs.length ? (
            <div className="card">
              <EmptyState
                title="No documents uploaded yet"
                description="Upload offer letters, ID proofs, and other required onboarding documents."
                icon={<FileText size={24} />}
                action={
                  canUpload && (
                    <p className="text-caption">Use the upload form above to add documents.</p>
                  )
                }
              />
            </div>
          ) : (
            <div className="card overflow-hidden">
              <div className="px-4 py-3.5 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-caption font-bold text-slate-700 uppercase tracking-wider">
                  Uploaded Documents
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50/80 border-b border-slate-100">
                    <tr>
                      {['Type', 'File Name', 'Size', 'Status', 'Remarks', 'Uploaded Date', 'Actions'].map(h => (
                        <th key={h} className="px-4 py-3.5 text-left text-table-header">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {docs.map(d => (
                      <tr key={d.id} className="transition-colors duration-150 hover:bg-primary-50/30">
                        <td className="px-4 py-3.5 font-medium text-slate-800">
                          {d.documentType.replace(/_/g, ' ')}
                        </td>
                        <td className="px-4 py-3.5 text-caption truncate max-w-xs" title={d.fileName}>
                          {d.fileName}
                        </td>
                        <td className="px-4 py-3.5 text-caption">
                          {d.fileSize ? `${(d.fileSize / 1024).toFixed(1)} KB` : '—'}
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge value={d.verificationStatus} />
                        </td>
                        <td className="px-4 py-3.5 text-caption italic text-slate-500 max-w-xs truncate" title={d.verificationRemarks}>
                          {d.verificationRemarks || '—'}
                        </td>
                        <td className="px-4 py-3.5 text-caption">
                          {d.uploadedAt ? new Date(d.uploadedAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleView(d)}
                              className="px-2.5 py-1.5 text-xs bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
                            >
                              <Eye size={13} />
                              View
                            </button>

                            {/* Re-upload option for employees if document is rejected */}
                            {isEmployee && d.verificationStatus === 'REJECTED' && (
                              <button
                                type="button"
                                onClick={() => handleReuploadClick(d.documentType)}
                                className="px-2.5 py-1.5 text-xs bg-accent-600 text-white hover:bg-accent-700 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
                              >
                                <Upload size={13} />
                                Re-upload
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* PREMIUM PREVIEW MODAL */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-[panel-enter_300ms_ease-out]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <FileText size={18} className="text-primary-600" />
                  {previewDoc.documentType.replace(/_/g, ' ')}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Uploaded by: <span className="font-semibold text-slate-700">{previewDoc.employeeName}</span> (ID: #{previewDoc.employeeId}) · {previewDoc.fileName}
                </p>
              </div>
              <button
                onClick={closePreview}
                className="text-slate-400 hover:text-slate-655 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-100/30 flex items-center justify-center min-h-[350px]">
              {previewLoading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="w-8 h-8 text-accent-600 animate-spin" />
                  <p className="text-xs text-slate-500 font-medium">Fetching file content...</p>
                </div>
              ) : previewUrl ? (
                previewDoc.contentType?.startsWith('image/') ? (
                  <div className="max-w-full max-h-[60vh] overflow-auto flex items-center justify-center p-2 rounded-xl bg-white border border-slate-200/60 shadow-sm">
                    <img
                      src={previewUrl}
                      alt={previewDoc.fileName}
                      className="max-w-full max-h-[58vh] object-contain rounded-lg"
                    />
                  </div>
                ) : previewDoc.contentType === 'application/pdf' ? (
                  <iframe
                    src={previewUrl}
                    title={previewDoc.fileName}
                    className="w-full h-[60vh] rounded-lg border border-slate-200 shadow-sm bg-white"
                  />
                ) : (
                  <div className="text-center p-8 bg-white border border-slate-100 rounded-xl shadow-sm max-w-md">
                    <AlertTriangle className="mx-auto text-amber-500 mb-3" size={32} />
                    <p className="font-semibold text-slate-800 mb-1">Preview not supported for this file type</p>
                    <p className="text-xs text-slate-500 mb-4">Content Type: {previewDoc.contentType} ({previewDoc.fileName})</p>
                    <a
                      href={previewUrl}
                      download={previewDoc.fileName}
                      className="btn-primary inline-flex items-center gap-1.5 px-4 py-2"
                    >
                      <Download size={14} /> Download File
                    </a>
                  </div>
                )
              ) : (
                <div className="text-center">
                  <AlertTriangle className="mx-auto text-red-500 mb-2" size={24} />
                  <p className="text-sm font-semibold text-slate-800">Failed to load preview</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                {previewUrl && (
                  <a
                    href={previewUrl}
                    download={previewDoc.fileName}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-250 rounded-xl hover:bg-slate-50 hover:text-slate-800 transition flex items-center gap-1.5 shadow-sm"
                  >
                    <Download size={14} /> Download Document
                  </a>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={closePreview}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-200/50 rounded-xl transition cursor-pointer"
                >
                  Close
                </button>
                {canVerify && previewDoc.verificationStatus === 'PENDING' && (
                  <>
                    <button
                      onClick={() => {
                        closePreview();
                        openRejectModal(previewDoc.id);
                      }}
                      className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition flex items-center gap-1 shadow-sm cursor-pointer"
                    >
                      <X size={14} /> Reject
                    </button>
                    <button
                      onClick={() => {
                        closePreview();
                        handleApprove(previewDoc.id);
                      }}
                      className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition flex items-center gap-1 shadow-sm cursor-pointer"
                    >
                      <Check size={14} /> Approve
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MANDATORY REJECTION REMARKS MODAL */}
      {rejectingDocId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-[panel-enter_300ms_ease-out]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <X className="text-rose-600 animate-pulse" size={18} />
                Rejection Remarks
              </h3>
              <button
                onClick={closeRejectModal}
                className="text-slate-400 hover:text-slate-655 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6">
              <label className="block text-caption font-semibold text-slate-700 mb-2">
                Please specify the reason for rejecting this document (Mandatory):
              </label>
              <textarea
                required
                rows={4}
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
                placeholder="e.g. The uploaded file is blurred, or the information does not match the employee record..."
                className="w-full border border-slate-205 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all placeholder:text-slate-400 bg-slate-50/30"
              />
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={closeRejectModal}
                className="px-4 py-2 text-xs font-semibold text-slate-505 hover:bg-slate-200/50 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={submitRejection}
                disabled={submittingRejection || !remarks.trim()}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:hover:bg-rose-600 rounded-xl transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                {submittingRejection && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
