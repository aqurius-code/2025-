import React, { useState } from 'react';
import { Copy, Check, RefreshCw, FileText } from 'lucide-react';

interface ResultDisplayProps {
  result: string;
  onReset: () => void;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, onReset }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-700 font-semibold">
          <FileText className="w-5 h-5 text-green-600" />
          <span>생성 결과 (특기사항)</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onReset}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-md transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            다시 하기
          </button>
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
              copied
                ? 'bg-green-100 text-green-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? '복사 완료' : '전체 복사'}
          </button>
        </div>
      </div>
      <div className="p-6">
        <div className="whitespace-pre-wrap leading-relaxed text-gray-800 font-medium bg-gray-50 p-4 rounded-lg border border-gray-200 min-h-[200px]">
          {result}
        </div>
        <p className="mt-4 text-xs text-gray-400 text-center">
          * AI가 생성한 문구는 반드시 검토 후 사용하시기 바랍니다.
        </p>
      </div>
    </div>
  );
};

export default ResultDisplay;
