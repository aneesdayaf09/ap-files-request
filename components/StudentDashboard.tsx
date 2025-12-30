import React, { useState } from 'react';
import { RequestItem, Subject, User, RequestType, MaterialCategory } from '../types';
import { UNITS_STANDARD, UNITS_WITH_ALL, MATERIAL_OPTIONS } from '../constants';
import { Send, FileText, Clock, CheckCircle, BookOpen, Key, ArrowLeft, Upload, Layers } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface StudentDashboardProps {
  user: User;
  requests: RequestItem[];
  onRequest: (subject: Subject, unit: string, type: RequestType, materialCategory?: MaterialCategory, attachedFile?: File, description?: string) => void;
}

type ViewState = 'MENU' | 'REQUEST_FILES' | 'REQUEST_KEY';

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ user, requests, onRequest }) => {
  const [view, setView] = useState<ViewState>('MENU');
  
  const [selectedSubject, setSelectedSubject] = useState<Subject | ''>('');
  const [selectedUnit, setSelectedUnit] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialCategory | ''>('');
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');

  // Determine which unit list to use based on the view
  const currentUnitList = view === 'REQUEST_FILES' ? UNITS_STANDARD : UNITS_WITH_ALL;

  const handleRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSubject && selectedUnit) {
      const type: RequestType = view === 'REQUEST_FILES' ? 'STUDY_GUIDE' : 'ANSWER_KEY';
      
      // Validation for Study Guide
      if (type === 'STUDY_GUIDE' && !selectedMaterial) return;
      
      // Validation for Answer Key (File is now mandatory)
      if (type === 'ANSWER_KEY' && !attachedFile) return;

      onRequest(
        selectedSubject, 
        selectedUnit, 
        type,
        type === 'STUDY_GUIDE' ? (selectedMaterial as MaterialCategory) : undefined,
        attachedFile || undefined,
        description || undefined
      );
      
      // Reset form
      setSelectedUnit('');
      setSelectedSubject('');
      setSelectedMaterial('');
      setAttachedFile(null);
      setDescription('');
    }
  };

  const handleBack = () => {
    setView('MENU');
    setSelectedUnit('');
    setSelectedSubject('');
    setSelectedMaterial('');
    setAttachedFile(null);
    setDescription('');
  };

  const myRequests = requests.filter(r => r.userId === user.id);

  const isSubmitDisabled = () => {
    if (!selectedSubject || !selectedUnit) return true;
    if (view === 'REQUEST_FILES' && !selectedMaterial) return true;
    if (view === 'REQUEST_KEY' && !attachedFile) return true;
    return false;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Request Form / Menu Section */}
      <div className="lg:col-span-1 space-y-6">
        
        {view === 'MENU' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4">What do you need today?</h2>
            
            <button
              onClick={() => setView('REQUEST_FILES')}
              className="w-full p-4 rounded-xl border-2 border-indigo-100 hover:border-indigo-500 hover:bg-indigo-50 transition-all flex items-center space-x-4 group text-left"
            >
              <div className="bg-indigo-100 p-3 rounded-full text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Request Unit Files</h3>
                <p className="text-sm text-gray-500">Get exams, assignments, or notes</p>
              </div>
            </button>

            <button
              onClick={() => setView('REQUEST_KEY')}
              className="w-full p-4 rounded-xl border-2 border-emerald-100 hover:border-emerald-500 hover:bg-emerald-50 transition-all flex items-center space-x-4 group text-left"
            >
              <div className="bg-emerald-100 p-3 rounded-full text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Key className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Request Answer Key</h3>
                <p className="text-sm text-gray-500">Upload worksheets for answers</p>
              </div>
            </button>
          </div>
        )}

        {(view === 'REQUEST_FILES' || view === 'REQUEST_KEY') && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative">
            <button 
              onClick={handleBack}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              title="Back to Menu"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              {view === 'REQUEST_FILES' ? (
                <><BookOpen className="w-5 h-5 mr-2 text-indigo-600" /> Request Study Material</>
              ) : (
                <><Key className="w-5 h-5 mr-2 text-emerald-600" /> Request Answer Key</>
              )}
            </h2>

            <form onSubmit={handleRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => {
                      setSelectedSubject(e.target.value as Subject);
                      setSelectedUnit('');
                  }}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border p-2"
                  required
                >
                  <option value="">Select a Subject</option>
                  {Object.values(Subject).map((sub) => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                <select
                  value={selectedUnit}
                  onChange={(e) => setSelectedUnit(e.target.value)}
                  disabled={!selectedSubject}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border p-2 disabled:bg-gray-100 disabled:text-gray-400"
                  required
                >
                  <option value="">Select a Unit</option>
                  {currentUnitList.map((unit) => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>

              {view === 'REQUEST_FILES' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Material Type</label>
                  <select
                    value={selectedMaterial}
                    onChange={(e) => setSelectedMaterial(e.target.value as MaterialCategory)}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border p-2"
                    required
                  >
                    <option value="">Select Content Type</option>
                    {MATERIAL_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              )}

              {view === 'REQUEST_KEY' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Upload Worksheet (Required)</label>
                  <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md relative transition-colors ${attachedFile ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300 hover:border-indigo-500'}`}>
                    <div className="space-y-1 text-center">
                      {attachedFile ? (
                        <CheckCircle className="mx-auto h-12 w-12 text-emerald-500" />
                      ) : (
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      )}
                      <div className="flex text-sm text-gray-600 justify-center">
                        <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                          <span>{attachedFile ? 'Change file' : 'Upload a file'}</span>
                          <input 
                            id="file-upload" 
                            name="file-upload" 
                            type="file" 
                            className="sr-only" 
                            onChange={(e) => setAttachedFile(e.target.files?.[0] || null)}
                            required
                          />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500">
                        {attachedFile ? attachedFile.name : "PNG, JPG, PDF up to 10MB"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Details (Optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border p-2"
                  placeholder="Describe specific topics, questions, or details about what you need..."
                  rows={3}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitDisabled()}
                className={`w-full text-white font-semibold py-2 px-4 rounded-lg transition-colors shadow-sm ${
                    view === 'REQUEST_KEY' 
                    ? 'bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300' 
                    : 'bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300'
                }`}
              >
                Send Request
              </button>
            </form>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <h4 className="font-semibold text-blue-800 mb-2">How it works</h4>
          <p className="text-sm text-blue-600">
            1. Choose to request study notes or an answer key.<br/>
            2. Select your subject, unit, and material type.<br/>
            3. The Builder receives your request.<br/>
            4. The result is sent to your <strong>WhatsApp</strong> and appears here.
          </p>
        </div>
      </div>

      {/* Requests Feed Section */}
      <div className="lg:col-span-2 space-y-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center">
          <FileText className="w-5 h-5 mr-2 text-indigo-600" />
          My Requests
        </h2>

        {myRequests.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500">You haven't made any requests yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {myRequests.map((req) => (
              <div key={req.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    {req.type === 'ANSWER_KEY' ? (
                       <span className="p-1 bg-emerald-100 text-emerald-700 rounded text-xs font-bold px-2">KEY</span>
                    ) : (
                       <span className="p-1 bg-indigo-100 text-indigo-700 rounded text-xs font-bold px-2">STUDY</span>
                    )}
                    <div>
                      <span className="font-semibold text-gray-800">{req.subject}</span>
                      <span className="text-gray-400 mx-2">|</span>
                      <span className="text-gray-600">Unit {req.unit}</span>
                      {req.materialCategory && (
                        <span className="ml-2 text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded border border-indigo-100">
                           {MATERIAL_OPTIONS.find(o => o.value === req.materialCategory)?.label}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={`flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    req.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                    req.status === 'PROCESSING' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {req.status === 'COMPLETED' ? <CheckCircle className="w-3 h-3 mr-1"/> : <Clock className="w-3 h-3 mr-1"/>}
                    {req.status}
                  </div>
                </div>
                
                <div className="p-6">
                   {req.attachedFileName && (
                       <div className="mb-4 text-sm text-gray-500 flex items-center bg-gray-50 p-2 rounded">
                           <Upload className="w-4 h-4 mr-2" />
                           Attached: {req.attachedFileName}
                       </div>
                   )}
                   
                   {req.description && (
                     <div className="mb-4 text-sm text-gray-600 bg-gray-50 p-3 rounded border border-gray-100 italic">
                        "{req.description}"
                     </div>
                   )}

                  {req.status === 'COMPLETED' && req.content ? (
                    <div className="prose prose-sm max-w-none text-gray-700">
                      <ReactMarkdown>{req.content}</ReactMarkdown>
                      <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-green-600 flex items-center">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Sent to WhatsApp: {user.phoneNumber}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500 italic text-sm">
                      Request sent. Waiting for Builder...
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};