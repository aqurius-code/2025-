import React, { useState } from 'react';
import { PHRASES } from '../data/phrases';
import { Sparkles, RotateCcw } from 'lucide-react';
import { polishText } from '../services/geminiService';

const SeteukTab: React.FC = () => {
  const [commonTopic, setCommonTopic] = useState("");
  const [standard, setStandard] = useState("");
  const [includeStandard, setIncludeStandard] = useState(false);
  const [students, setStudents] = useState(Array.from({ length: 30 }, (_, i) => ({
    id: i + 1,
    topic: "",
    selectedCompetencies: [] as string[],
    result: "",
    loading: false
  })));

  const toggleCompetency = (studentId: number, comp: string) => {
    setStudents(prev => prev.map(s => {
      if (s.id !== studentId) return s;
      const isSelected = s.selectedCompetencies.includes(comp);
      return {
        ...s,
        selectedCompetencies: isSelected 
          ? s.selectedCompetencies.filter(c => c !== comp)
          : [...s.selectedCompetencies, comp]
      };
    }));
  };

  const updateStudentTopic = (id: number, val: string) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, topic: val } : s));
  };

  const generateOne = (id: number) => {
    const student = students.find(s => s.id === id);
    if (!student) return;

    const topic = student.topic || commonTopic;
    if (!topic) {
      alert("주제를 입력해주세요 (공통 주제 또는 개별 주제)");
      return;
    }
    if (student.selectedCompetencies.length === 0) {
      alert("역량을 하나 이상 선택해주세요");
      return;
    }

    let parts: string[] = [];
    if (includeStandard && standard) parts.push(`성취기준 '${standard}'와 관련하여`);
    parts.push(`'${topic}'을(를) 주제로 학습하며`);

    student.selectedCompetencies.forEach(comp => {
      const phrases = PHRASES.st_phrases[comp as keyof typeof PHRASES.st_phrases];
      if (phrases) {
        parts.push(phrases[Math.floor(Math.random() * phrases.length)]);
      }
    });
    
    parts.push("교과 역량이 우수함.");

    setStudents(prev => prev.map(s => s.id === id ? { ...s, result: parts.join(" ") } : s));
  };

  const enrichWithAI = async (id: number) => {
    const student = students.find(s => s.id === id);
    if (!student || !student.result) return;

    setStudents(prev => prev.map(s => s.id === id ? { ...s, loading: true } : s));
    try {
      const polished = await polishText(student.result, 'enrich');
      setStudents(prev => prev.map(s => s.id === id ? { ...s, result: polished } : s));
    } catch (e) {
      alert("AI 생성 실패");
    } finally {
      setStudents(prev => prev.map(s => s.id === id ? { ...s, loading: false } : s));
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="bg-violet-50 border border-violet-100 p-5 rounded-xl mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-3">
          <div className="flex-1">
            <label className="block text-xs font-bold text-violet-800 mb-1">📌 핵심 주제/단원명 (공통)</label>
            <input 
              type="text" 
              value={commonTopic}
              onChange={(e) => setCommonTopic(e.target.value)}
              className="w-full p-2 border rounded bg-white"
              placeholder="예: 미적분의 실생활 활용"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-bold text-violet-800 mb-1">🎯 성취기준 (선택)</label>
            <input 
              type="text" 
              value={standard}
              onChange={(e) => setStandard(e.target.value)}
              className="w-full p-2 border rounded bg-white"
              placeholder="예: [12화학Ⅰ03-05] 산화 환원 반응..."
            />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-violet-800 font-medium cursor-pointer">
          <input 
            type="checkbox" 
            checked={includeStandard}
            onChange={(e) => setIncludeStandard(e.target.checked)}
            className="w-4 h-4 text-violet-600 rounded" 
          /> 
          성취기준 내용을 문구 앞에 포함하기
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {students.map((s) => (
          <div key={s.id} className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-violet-800 bg-violet-100 px-2 py-0.5 rounded text-sm">{s.id}번</span>
              <input 
                type="text" 
                value={s.topic}
                onChange={(e) => updateStudentTopic(s.id, e.target.value)}
                className="text-xs border rounded p-1 w-40" 
                placeholder="개별 주제 (선택)"
              />
            </div>
            
            <div className="flex flex-wrap gap-1 mb-3">
              {PHRASES.st_comps.map(comp => (
                <button
                  key={comp}
                  onClick={() => toggleCompetency(s.id, comp)}
                  className={`px-2 py-1 text-xs border rounded transition-colors ${
                    s.selectedCompetencies.includes(comp)
                      ? 'bg-violet-600 text-white border-violet-600'
                      : 'bg-white text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {comp}
                </button>
              ))}
            </div>

            <textarea 
              className="w-full text-sm border p-2 rounded bg-slate-50 mb-2 h-24 resize-none"
              value={s.result}
              onChange={(e) => setStudents(prev => prev.map(st => st.id === s.id ? { ...st, result: e.target.value } : st))}
              placeholder="역량을 선택하고 생성 버튼을 누르세요."
            />

            <div className="flex justify-end gap-2">
               {s.result && (
                <button 
                  onClick={() => enrichWithAI(s.id)}
                  disabled={s.loading}
                  className="bg-indigo-100 text-indigo-700 text-xs px-3 py-1.5 rounded hover:bg-indigo-200 flex items-center gap-1 font-bold"
                >
                   {s.loading ? <RotateCcw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} AI 윤문
                </button>
              )}
              <button 
                onClick={() => generateOne(s.id)}
                className="bg-violet-600 text-white text-xs px-4 py-1.5 rounded hover:bg-violet-700 font-bold"
              >
                생성
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SeteukTab;
