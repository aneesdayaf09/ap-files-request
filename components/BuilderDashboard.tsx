import React, { useState } from 'react';
import { RequestItem, User } from '../types';
import { generateStudyMaterial } from '../services/geminiService';
import { Loader2, UploadCloud, MessageSquare, CheckCircle2, Paperclip, FileText, Key, Layers, Users, LayoutDashboard, AlignLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { MATERIAL_OPTIONS } from '../constants';

interface BuilderDashboardProps {
  requests: RequestItem[];
  onUpdateRequest: (id: string, updates: Partial<RequestItem>) => void;
  users: User[];
}

export const BuilderDashboard: React.FC<BuilderDashboardProps> = ({ requests, onUpdateRequest, users }) => {
  const [activeTab, setActiveTab] = useState<'REQUESTS' | 'STUDENTS'>('REQUESTS');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const pendingRequests = requests.filter(r => r.status !== 'COMPLETED');
  const completedRequests = requests.filter(r => r.status === 'COMPLETED');

  const handleProcess = async (req: RequestItem) => {
    setProcessingId(req.id);
    onUpdateRequest(req.id, { status: 'PROCESSING' });

    // Generate content using Gemini
    const content = await generateStudyMaterial(req.subject, req.unit, req.type, req.materialCategory, req.attachedFileName, req.description);

    // Simulate WhatsApp API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    onUpdateRequest(req.id, {
      status: 'COMPLETED',
      content: content
    });
    setProcessingId(null);
  };

  const getCategoryLabel = (cat?: string) => {
      return MATERIAL_OPTIONS.find(o => o.value === cat)?.label || cat;
  };

  return (
    <div className="space-y-8">
      <div className="bg-indigo-900 text-white p-6 rounded-xl shadow-lg flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold mb-1">Builder Control Center</h2>
          <p className="text-indigo-200 text-sm">Manage incoming requests and registered students.</p>
        </div>
        <div className="flex bg-indigo-800 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('REQUESTS')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
              activeTab === 'REQUESTS' ? 'bg-white text-indigo-900 font-bold shadow' : 'text-indigo-200 hover:bg-indigo-700'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Requests</span>
          </button>
          <button
            onClick={() => setActiveTab('STUDENTS')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
              activeTab === 'STUDENTS' ? 'bg-white text-indigo-900 font-bold shadow' : 'text-indigo-200 hover:bg-indigo-700'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Students ({users.filter(u => u.role !== 'BUILDER').length})</span>
          </button>
        </div>
      </div>

      {activeTab === 'STUDENTS' ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 flex items-center">
              <Users className="w-5 h-5 mr-2 text-indigo-600" />
              Registered Student Database
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-700 uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">Full Name</th>
                  <th className="px-6 py-4">Phone Number</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Total Requests</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.filter(u => u.role !== 'BUILDER').length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-400 italic">No students registered yet.</td>
                  </tr>
                ) : (
                  users.filter(u => u.role !== 'BUILDER').map(student => (
                    <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{student.fullName}</td>
                      <td className="px-6 py-4">{student.phoneNumber}</td>
                      <td className="px-6 py-4"><span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-bold">STUDENT</span></td>
                      <td className="px-6 py-4">
                        {requests.filter(r => r.userId === student.id).length}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pending Requests Queue */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <span className="bg-red-100 text-red-600 py-1 px-3 rounded-full text-xs mr-2">{pendingRequests.length}</span>
              Pending Requests Queue
            </h3>
            <div className="space-y-4">
              {pendingRequests.length === 0 ? (
                <div className="text-gray-400 italic">No pending requests.</div>
              ) : (
                pendingRequests.map(req => (
                  <div key={req.id} className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-lg ${req.type === 'ANSWER_KEY' ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-100 text-indigo-600'}`}>
                              {req.type === 'ANSWER_KEY' ? <Key className="w-5 h-5"/> : <FileText className="w-5 h-5"/>}
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 flex items-center">
                                {req.subject} 
                                <span className="ml-2 text-sm font-normal text-gray-500">Unit {req.unit}</span>
                            </h4>
                            <div className="flex items-center space-x-2 mt-1">
                               <p className="text-xs font-semibold uppercase text-gray-400 tracking-wider">{req.type.replace('_', ' ')}</p>
                               {req.materialCategory && (
                                  <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded border border-indigo-100 flex items-center">
                                      <Layers className="w-3 h-3 mr-1"/>
                                      {getCategoryLabel(req.materialCategory)}
                                  </span>
                               )}
                            </div>
                          </div>
                      </div>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {new Date(req.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-4 space-y-1">
                      <p><strong>Student:</strong> {req.userName}</p>
                      <p><strong>Phone:</strong> {req.userPhone}</p>
                      {req.attachedFileName && (
                          <div className="flex items-center text-indigo-600 bg-indigo-50 p-2 rounded mt-2">
                              <Paperclip className="w-4 h-4 mr-2" />
                              File: {req.attachedFileName}
                          </div>
                      )}
                      {req.description && (
                          <div className="flex items-start text-gray-700 bg-gray-50 p-2 rounded mt-2 border border-gray-100 italic">
                              <AlignLeft className="w-4 h-4 mr-2 mt-1 flex-shrink-0 text-gray-400" />
                              <span className="break-words">"{req.description}"</span>
                          </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleProcess(req)}
                      disabled={!!processingId}
                      className={`w-full py-2 rounded-lg flex items-center justify-center space-x-2 transition-all ${
                        processingId === req.id 
                          ? 'bg-indigo-100 text-indigo-700 cursor-wait'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      }`}
                    >
                      {processingId === req.id ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Generating & Sending...</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="w-4 h-4" />
                          <span>Upload & Send to WhatsApp</span>
                        </>
                      )}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recently Completed Log */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <CheckCircle2 className="w-5 h-5 mr-2 text-green-600" />
              Recent Activity Log
            </h3>
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 max-h-[600px] overflow-y-auto space-y-3">
               {completedRequests.slice().reverse().map(req => (
                 <div key={req.id} className="bg-white p-3 rounded-lg border border-gray-100 text-sm">
                   <div className="flex items-center justify-between mb-1">
                     <span className="font-semibold text-gray-800 flex items-center">
                         {req.type === 'ANSWER_KEY' ? <Key className="w-3 h-3 mr-1 text-emerald-500"/> : <FileText className="w-3 h-3 mr-1 text-indigo-500"/>}
                         {req.subject}: Unit {req.unit}
                     </span>
                     <span className="text-xs text-gray-400">{new Date(req.createdAt).toLocaleDateString()}</span>
                   </div>
                   <div className="flex items-center text-green-600 text-xs mt-2">
                     <MessageSquare className="w-3 h-3 mr-1" />
                     Sent to {req.userPhone}
                   </div>
                   <details className="mt-2 text-xs text-gray-500 cursor-pointer">
                      <summary>View Generated Content Preview</summary>
                      <div className="mt-2 p-2 bg-gray-50 rounded border border-gray-200 max-h-32 overflow-hidden relative">
                          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-50 pointer-events-none"></div>
                          <ReactMarkdown>{req.content || ''}</ReactMarkdown>
                      </div>
                   </details>
                 </div>
               ))}
               {completedRequests.length === 0 && (
                 <div className="text-center text-gray-400 py-4">No completed requests yet.</div>
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};