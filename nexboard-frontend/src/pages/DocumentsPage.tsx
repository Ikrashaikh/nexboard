import { useEffect, useState } from 'react';
import { documentService } from '../services/document.service';
import { employeeService } from '../services/employee.service';
import { handleApiError } from '../lib/errorHandler';
import Badge from '../components/Badge';
import type { EmployeeDocumentResponse, EmployeeResponse, DocumentType } from '../types';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Upload } from 'lucide-react';

const DOC_TYPES: DocumentType[] = ['OFFER_LETTER','AADHAR','PAN','PASSPORT','EDUCATION_DOCUMENT'];

export default function DocumentsPage() {
  const { auth, employeeId } = useAuth();
  const isEmployee = auth?.role === 'EMPLOYEE';
  const canVerify = ['ADMIN','HR'].includes(auth?.role ?? '');
  const canUpload = ['ADMIN','HR','EMPLOYEE'].includes(auth?.role ?? '');

  const [employees, setEmployees] = useState<EmployeeResponse[]>([]);
  const [selectedEmp, setSelectedEmp] = useState<number | null>(isEmployee ? employeeId : null);
  const [docs, setDocs] = useState<EmployeeDocumentResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [docType, setDocType] = useState<DocumentType>('OFFER_LETTER');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!isEmployee) {
      employeeService.getAll().then(r => setEmployees(r.data)).catch(handleApiError);
    }
  }, [isEmployee]);

  const loadDocs = (empId: number) => {
    setLoading(true);
    documentService.getByEmployee(empId)
      .then(r => setDocs(r.data))
      .catch(handleApiError)
      .finally(() => setLoading(false));
  };

  useEffect(() => { if (selectedEmp) loadDocs(selectedEmp); }, [selectedEmp]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !selectedEmp) return;
    setUploading(true);
    try {
      await documentService.upload(selectedEmp, docType, file);
      toast.success('Document uploaded');
      setFile(null);
      loadDocs(selectedEmp);
    } catch (err) { handleApiError(err); }
    finally { setUploading(false); }
  };

  const verify = async (docId: number, status: string) => {
    const remarks = window.prompt('Verification remarks:') ?? '';
    try {
      await documentService.verify(docId, { verificationStatus: status, remarks });
      toast.success('Document verified');
      if (selectedEmp) loadDocs(selectedEmp);
    } catch (err) { handleApiError(err); }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Documents</h2>

      {!isEmployee && (
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <select className="w-full sm:w-72 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            value={selectedEmp ?? ''} onChange={e => setSelectedEmp(Number(e.target.value))}>
            <option value="">— pick an employee —</option>
            {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
          </select>
        </div>
      )}

      {canUpload && selectedEmp && (
        <form onSubmit={handleUpload} className="bg-white rounded-xl shadow-sm p-5 mb-6 flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Document Type</label>
            <select className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              value={docType} onChange={e => setDocType(e.target.value as DocumentType)}>
              {DOC_TYPES.map(t => <option key={t}>{t.replace(/_/g,' ')}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">File</label>
            <input type="file" required
              className="text-sm text-slate-600"
              onChange={e => setFile(e.target.files?.[0] ?? null)} />
          </div>
          <button type="submit" disabled={uploading}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-60">
            <Upload size={16} /> {uploading ? 'Uploading…' : 'Upload'}
          </button>
        </form>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
            <tr>
              {['Type','File','Size','Status','Uploaded','Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {!selectedEmp ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">Select an employee</td></tr>
            ) : loading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">Loading…</td></tr>
            ) : docs.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">No documents uploaded</td></tr>
            ) : docs.map(d => (
              <tr key={d.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-800">{d.documentType.replace(/_/g,' ')}</td>
                <td className="px-4 py-3 text-slate-600 text-xs">{d.fileName}</td>
                <td className="px-4 py-3 text-slate-500 text-xs">{(d.fileSize / 1024).toFixed(1)} KB</td>
                <td className="px-4 py-3"><Badge value={d.verificationStatus} /></td>
                <td className="px-4 py-3 text-slate-500 text-xs">{new Date(d.uploadedAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  {canVerify && d.verificationStatus === 'PENDING' && (
                    <div className="flex gap-2">
                      <button onClick={() => verify(d.id, 'VERIFIED')}
                        className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700">Verify</button>
                      <button onClick={() => verify(d.id, 'REJECTED')}
                        className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700">Reject</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
