import React, { useState } from 'react';
import { SCHEDULE_DB, ScheduleItem } from '../data/schedules';
import { PHRASES } from '../data/phrases';
import { Sparkles, Copy, RotateCcw, Image as ImageIcon, List } from 'lucide-react';
import { polishText, generateNoteFromImages } from '../services/geminiService';
import ImageUploader from './ImageUploader';
import { UploadedImage } from '../types';

const ChangcheTab: React.FC = () => {
  // Common State
  const [mode, setMode] = useState<'list' | 'image'>('list');

  // List Mode State
  const [grade, setGrade] = useState("1");
  const [semester, setSemester] = useState("1");
  const [activity, setActivity] = useState<string>("");
  const [manualActivity, setManualActivity] = useState("");
  const [isManualMode, setIsManualMode] = useState(false);
  const [results, setResults] = useState<string[]>(Array(30).fill(""));
  const [loadingMap, setLoadingMap] = useState<Record<number, boolean>>({});

  // Image Mode State
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [imageInstruction, setImageInstruction] = useState("");
  const [imageResult, setImageResult] = useState("");
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const scheduleList = SCHEDULE_DB[`${grade}-${semester}`] || [];

  const getRandomItem = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

  // List Mode Logic
  const generateAll = () => {
    let selectedAct: ScheduleItem | null = null;

    if (isManualMode) {
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

  // Image Mode Logic
  const handleImageGenerate = async () => {
    if (images.length === 0) {
      alert("이미지를 1장 이상 업로드해주세요.");
      return;
    }
    setIsGeneratingImage(true);
    try {
      const result = await generateNoteFromImages(images, imageInstruction);
      setImageResult(result);
    } catch (e) {
      alert("이미지 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Mode Switcher */}
      <div className="flex justify-center bg-slate-100 p-1 rounded-lg w-fit mx-auto">
        <button
          onClick={() => setMode('list')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${
            mode === 'list' 
              ? 'bg-white text-indigo-600 shadow-sm' 
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <List className="w-4 h-4" />
          학급 전체 생성 (목록형)
        </button>
        <button
          onClick={() => setMode('image')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${
            mode === 'image' 
              ? 'bg-white text-indigo-600 shadow-sm' 
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          이미지 기반 생성 (증빙자료)
        </button>
      </div>

      {mode === 'list' ? (
        <>
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
        </>
      ) : (
        /* Image Mode UI */
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-indigo-600" />
                증빙 자료 업로드
              </h3>
              <ImageUploader images={images} onImagesChange={setImages} />
            </div>

            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
              <label className="block text-sm font-bold text-indigo-800 mb-2">
                ✍️ 추가 요청 사항 / 참고 스타일
              </label>
              <textarea 
                value={imageInstruction}
                onChange={(e) => setImageInstruction(e.target.value)}
                className="w-full p-3 rounded-lg border border-indigo-200 text-sm focus:ring-2 focus:ring-indigo-300 outline-none min-h-[100px]"
                placeholder="예: 1~5번 사진 내용을 바탕으로 작성하되, 6번 사진의 스타일을 참고해주세요."
              />
              <button 
                onClick={handleImageGenerate}
                disabled={isGeneratingImage || images.length === 0}
                className={`w-full mt-3 py-3 rounded-lg font-bold text-white shadow-md flex items-center justify-center gap-2 transition-all ${
                  images.length === 0 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {isGeneratingImage ? <RotateCcw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                {isGeneratingImage ? '이미지 분석 및 생성 중...' : '이미지 기반 특기사항 생성'}
              </button>
            </div>
          </div>

          <div className="space-y-4">
             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-full flex flex-col">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
                  <h3 className="text-lg font-bold text-gray-800">생성 결과</h3>
                  {imageResult && (
                    <button 
                      onClick={() => handleCopy(imageResult)}
                      className="text-xs flex items-center gap-1 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded text-gray-700 font-medium"
                    >
                      <Copy className="w-3 h-3" /> 복사
                    </button>
                  )}
                </div>
                
                {imageResult ? (
                  <div className="flex-1 bg-gray-50 p-4 rounded-lg border border-gray-100 text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {imageResult}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200 min-h-[300px]">
                    <Sparkles className="w-12 h-12 mb-2 opacity-20" />
                    <p>이미지를 업로드하고 생성 버튼을 눌러주세요.</p>
                  </div>
                )}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChangcheTab;