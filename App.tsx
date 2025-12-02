import React, { useState } from 'react';
import ChangcheTab from './components/ChangcheTab';
import SeteukTab from './components/SeteukTab';
import HaengbalTab from './components/HaengbalTab';
import { BookOpen } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'changche' | 'seteuk' | 'haengbal'>('changche');

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 p-4 md:p-8">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
               <div className="bg-indigo-600 p-2 rounded-lg shadow-lg shadow-indigo-200">
                  <BookOpen className="w-6 h-6 text-white" />
               </div>
               <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
                2025 생기부 작성 통합 마스터 <span className="text-indigo-600 bg-indigo-50 text-sm px-2 py-1 rounded ml-2 align-middle border border-indigo-100">교사용</span>
              </h1>
            </div>
            <p className="text-slate-500 mt-2 text-sm ml-1">
              업로드된 학사일정(자율/진로/창체) 반영 완료 & 문구 다양성 3배 강화
            </p>
          </div>
          <div className="text-xs text-slate-400 font-mono bg-slate-50 px-3 py-1 rounded-full">
            Powered by Gemini 2.5 Flash
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-slate-50 border-b border-slate-200 overflow-x-auto scrollbar-hide">
          <button 
            onClick={() => setActiveTab('changche')}
            className={`flex-1 py-4 text-center text-lg font-medium transition-all min-w-[150px]
              ${activeTab === 'changche' 
                ? 'bg-white text-indigo-600 border-b-4 border-indigo-600 font-bold' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}
          >
            📝 창의적 체험활동
          </button>
          <button 
            onClick={() => setActiveTab('seteuk')}
            className={`flex-1 py-4 text-center text-lg font-medium transition-all min-w-[150px]
              ${activeTab === 'seteuk' 
                ? 'bg-white text-violet-600 border-b-4 border-violet-600 font-bold' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}
          >
            📚 과목별 세특
          </button>
          <button 
            onClick={() => setActiveTab('haengbal')}
            className={`flex-1 py-4 text-center text-lg font-medium transition-all min-w-[150px]
              ${activeTab === 'haengbal' 
                ? 'bg-white text-emerald-600 border-b-4 border-emerald-600 font-bold' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}
          >
            🌱 행동특성 및 종합의견
          </button>
        </div>

        {/* Content Area */}
        <div className="p-4 md:p-8 min-h-[600px] bg-white">
          {activeTab === 'changche' && <ChangcheTab />}
          {activeTab === 'seteuk' && <SeteukTab />}
          {activeTab === 'haengbal' && <HaengbalTab />}
        </div>

      </div>
    </div>
  );
};

export default App;
