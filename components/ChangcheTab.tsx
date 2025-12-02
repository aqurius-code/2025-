import React, { useState, useEffect } from 'react';
import { SCHEDULE_DB, ScheduleItem } from '../data/schedules';
import { PHRASES } from '../data/phrases';
import { Sparkles, Copy, Check, RotateCcw } from 'lucide-react';
import { polishText } from '../services/geminiService';

const ChangcheTab: React.FC = () => {
  const [grade, setGrade] = useState("1");
  const [semester, setSemester] = useState("1");
  const [activity, setActivity] = useState<string>("");
  const [manualActivity, setManualActivity] = useState("");
  const [isManualMode, setIsManualMode] = useState(false);
  const [results, setResults] = useState<string[]>(Array(30).fill(""));
  const [loadingMap, setLoadingMap] = useState<Record<number, boolean>>({});

  const scheduleList = SCHEDULE_DB[`${grade}-${semester}`] || [];

  const getRandomItem = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

  const generateAll = () => {
    let selectedAct: ScheduleItem | null = null;

    if (isManualMode) {
      // Parse manual input: e.g., "2025.05.05. Sports Day" or "Sports Day"
      const dateMatch = manualActivity.match(/(\d{4}\.\d{2}\.\d{2}\.?)/);
      const date = dateMatch ? dateMatch[0] : "";
      const name = manualActivity.replace(date, "").trim();
      if (!name) {
        alert("활동 내용을 입력해주세요.");
        return;
      }
      selectedAct = { date, name };
    } else {
      if (!activity) {
        alert("활동을 선택해주세요.");
        return;
      }
      selectedAct = JSON.parse(activity);
    }

    if (!selectedAct) return;

    const newResults = Array(30).fill("").map(() => {
        const intro = getRandomItem(PHRASES.cc_intros);
        const actPhrase = getRandomItem(PHRASES.cc_acts);
        const feeling = getRandomItem(PHRASES.cc_feelings);
        const end = getRandomItem(PHRASES.cc_ends);
        
        // Clean up date if it ends with a dot
        const cleanDate = selectedAct?.date.endsWith('.') ? selectedAct.date : selectedAct?.date + '.';
        
        return `${selectedAct?.name}(${cleanDate}) ${intro} ${actPhrase} ${feeling} ${end}`;
    });

    setResults(newResults);
  };

  const handlePolish = async (index: number) => {
    if (!results[index]) return;
    setLoadingMap(prev => ({ ...prev, [index]: true }));
    try {
      const polished = await polishText(results[index], 'enrich');
      const newResults = [...results];
      newResults[index] = polished;
      setResults(newResults);
    } catch (e) {
      alert("AI 생성 중 오류가 발생했습니다.");
    } finally {
      setLoadingMap(prev => ({ ...prev, [index]: false }));
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="animate-fade-in">
      <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-xl mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex gap-2">
            <div>
              <label className="block text-xs font-bold text-indigo-800 mb-1">학년</label>
              <select value={grade} onChange={(e) => setGrade(e.target.value)} className="p-2 border rounded w-24 bg-white">
                <option value="1">1학년</option>
                <option value="2">2학년</option>
                <option value="3">3학년</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-indigo-800 mb-1">학기</label>
              <select value={semester} onChange={(e) => setSemester(e.target.value)} className="p-2 border rounded w-24 bg-white">
                <option value="1">1학기</option>
                <option value="2">2학기</option>
              </select>
            </div>
          </div>
          
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-indigo-800 mb-1">
              활동 선택 {isManualMode ? "(직접 입력)" : "(학사일정 자동 반영)"}
            </label>
            {!isManualMode ? (
              <select 
                value={activity} 
                onChange={(e) => setActivity(e.target.value)} 
                className="w-full p-2 border rounded font-medium bg-white"
              >
                <option value="">활동을 선택하세요</option>
                {scheduleList.map((item, idx) => (
                  <option key={idx} value={JSON.stringify(item)}>
                    [{item.date}] {item.name}
                  </option>
                ))}
              </select>
            ) : (
              <input 
                type="text" 
                value={manualActivity} 
                onChange={(e) => setManualActivity(e.target.value)}
                placeholder="예: 2025.05.05. 체육대회"
                className="w-full p-2 border rounded font-medium bg-white"
              />
            )}
          </div>

          <button 
            onClick={() => setIsManualMode(!isManualMode)} 
            className="bg-white border border-indigo-300 text-indigo-700 px-4 py-2 rounded hover:bg-indigo-50 text-sm font-bold whitespace-nowrap"
          >
            {isManualMode ? "목록에서 선택" : "📋 직접 추가"}
          </button>
          
          <button 
            onClick={generateAll} 
            className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 font-bold whitespace-nowrap shadow-md flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            30명 전체 생성
          </button>
        </div>
      </div>

      <div className="grid gap-3">
        {results[0] === "" ? (
          <div className="text-center py-10 text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
            활동을 선택하고 '30명 전체 생성' 버튼을 눌러주세요.<br/>
            학생별로 서로 다른 풍성한 문구가 자동 생성됩니다.
          </div>
        ) : (
          results.map((text, idx) => (
            <div key={idx} className="flex flex-col sm:flex-row gap-3 p-4 bg-white border border-slate-200 rounded-lg shadow-sm hover:border-indigo-300 transition-colors">
              <div className="flex items-center gap-2 sm:w-16 shrink-0">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                  {idx + 1}
                </div>
                <span className="sm:hidden font-bold text-slate-600">번 학생</span>
              </div>
              
              <div className="flex-1">
                <textarea 
                  className="w-full text-sm p-2 rounded bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-200 resize-none h-20"
                  value={text}
                  onChange={(e) => {
                    const newRes = [...results];
                    newRes[idx] = e.target.value;
                    setResults(newRes);
                  }}
                />
              </div>

              <div className="flex sm:flex-col gap-2 justify-center">
                <button 
                  onClick={() => handlePolish(idx)}
                  disabled={loadingMap[idx]}
                  className="p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded flex items-center justify-center gap-1 text-xs font-bold transition-colors w-full sm:w-auto"
                  title="AI 윤문 (더 풍성하게)"
                >
                  {loadingMap[idx] ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  <span className="sm:hidden">AI 윤문</span>
                </button>
                <button 
                  onClick={() => handleCopy(text)}
                  className="p-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded flex items-center justify-center gap-1 text-xs font-bold transition-colors w-full sm:w-auto"
                  title="복사"
                >
                  <Copy className="w-4 h-4" />
                  <span className="sm:hidden">복사</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChangcheTab;
