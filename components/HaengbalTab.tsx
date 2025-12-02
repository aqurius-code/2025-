import React, { useState } from 'react';
import { PHRASES } from '../data/phrases';
import { Sparkles, RotateCcw } from 'lucide-react';
import { polishText } from '../services/geminiService';

const HaengbalTab: React.FC = () => {
  const [students, setStudents] = useState(Array.from({ length: 30 }, (_, i) => ({
    id: i + 1,
    custom: "",
    selectedKeywords: [] as string[],
    result: "",
    loading: false
  })));

  const toggleKeyword = (studentId: number, keyword: string) => {
    setStudents(prev => prev.map(s => {
      if (s.id !== studentId) return s;
      const isSelected = s.selectedKeywords.includes(keyword);
      return {
        ...s,
        selectedKeywords: isSelected 
          ? s.selectedKeywords.filter(k => k !== keyword)
          : [...s.selectedKeywords, keyword]
      };
    }));
  };

  const updateCustom = (id: number, val: string) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, custom: val } : s));
  };

  const generateOne = (id: number) => {
    const student = students.find(s => s.id === id);
    if (!student) return;

    if (student.selectedKeywords.length === 0 && !student.custom) {
      alert("키워드를 선택하거나 특성을 입력하세요");
      return;
    }

    let parts: string[] = [];
    
    student.selectedKeywords.forEach(k => {
      const phrases = PHRASES.hb_phrases[k as keyof typeof PHRASES.hb_phrases];
      if (phrases) {
        parts.push(phrases[Math.floor(Math.random() * phrases.length)]);
      }
    });

    if (student.custom) {
      parts.push(`${student.custom}하는 모습이 돋보임.`);
    }

    if (parts.length > 0) {
        parts.push("앞으로의 성장이 기대됨.");
    }

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
      <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-xl mb-6">
        <p className="text-emerald-800 font-medium text-sm">
          💡 학생별 키워드를 선택하면 장점은 부각하고 단점은 순화하여 긍정적인 평가 문장을 생성합니다.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {students.map((s) => (
          <div key={s.id} className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="font-bold text-emerald-800 mb-2 flex items-center gap-2">
                <span className="bg-emerald-100 px-2 py-0.5 rounded text-sm">{s.id}번</span>
            </div>
            
            <div className="flex flex-wrap gap-1 mb-3">
              {PHRASES.hb_keywords.map(k => (
                <button
                  key={k}
                  onClick={() => toggleKeyword(s.id, k)}
                  className={`px-2 py-1 text-xs border rounded transition-colors ${
                    s.selectedKeywords.includes(k)
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>

            <input 
              type="text" 
              value={s.custom}
              onChange={(e) => updateCustom(s.id, e.target.value)}
              className="w-full text-xs border rounded p-2 mb-2 bg-slate-50 focus:bg-white transition-colors"
              placeholder="기타 특성 직접 입력 (예: 청소 시간에 솔선수범)"
            />

            <textarea 
              className="w-full text-sm border p-2 rounded bg-slate-50 mb-2 h-24 resize-none"
              value={s.result}
              onChange={(e) => setStudents(prev => prev.map(st => st.id === s.id ? { ...st, result: e.target.value } : st))}
              placeholder="키워드 선택 후 생성 버튼을 누르세요."
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
                className="bg-emerald-600 text-white text-xs px-4 py-1.5 rounded hover:bg-emerald-700 font-bold"
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

export default HaengbalTab;
