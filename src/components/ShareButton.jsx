import { Share2, Download, Loader2 } from 'lucide-react';

function ShareButton({ onClick, isGenerating }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-4">
      <button
        onClick={onClick}
        disabled={isGenerating}
        className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="font-semibold">生成中...</span>
          </>
        ) : (
          <>
            <Share2 className="w-5 h-5" />
            <span className="font-semibold">生成分享图片</span>
            <Download className="w-4 h-4" />
          </>
        )}
      </button>
      <p className="text-center text-xs text-gray-500 mt-2">
        点击生成图片，可分享到社交媒体
      </p>
    </div>
  );
}

export default ShareButton;
