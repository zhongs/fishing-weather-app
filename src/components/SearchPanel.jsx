import { Search, MapPin, Loader2, AlertCircle, Star } from 'lucide-react';

function SearchPanel({ 
  city, 
  setCity, 
  loading, 
  error, 
  successMessage,
  onSubmit, 
  onUseLocation,
  onAddToSaved,
  showAddButton 
}) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-4">
      <form onSubmit={onSubmit} className="space-y-3">
        <div className="relative">
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="输入城市名称..."
            className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors text-base"
          />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
          </button>
        </div>
      </form>

      <button
        onClick={onUseLocation}
        disabled={loading}
        className="w-full mt-3 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200 transition-colors disabled:bg-gray-300 active:scale-95"
      >
        <MapPin className="w-5 h-5" />
        <span className="font-medium">使用当前位置</span>
      </button>

      {error && (
        <div className="mt-3 bg-red-50 border border-red-200 text-red-700 px-3 py-2.5 rounded-xl flex items-start gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="mt-3 bg-green-50 border border-green-200 text-green-700 px-3 py-2.5 rounded-xl flex items-start gap-2">
          <Star className="w-5 h-5 flex-shrink-0 mt-0.5 fill-green-500" />
          <span className="text-sm">{successMessage}</span>
        </div>
      )}

      {showAddButton && (
        <button
          onClick={onAddToSaved}
          className="w-full mt-3 flex items-center justify-center gap-2 bg-yellow-50 text-yellow-700 py-3 rounded-xl hover:bg-yellow-100 transition-colors border border-yellow-200 active:scale-95"
        >
          <Star className="w-5 h-5" />
          <span className="font-medium">收藏当前钓点</span>
        </button>
      )}
    </div>
  );
}

export default SearchPanel;
