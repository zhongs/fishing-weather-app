import { MapIcon, Loader2, AlertCircle, Star } from 'lucide-react';
import MapSelector from '../MapSelector';

function MapPanel({ 
  onLocationSelect, 
  selectedLocation, 
  center, 
  zoom,
  loading,
  error,
  weather,
  onAddToSaved
}) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-4">
      <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
        <MapIcon className="w-5 h-5 text-blue-500" />
        在地图上标记钓点
      </h3>
      <p className="text-xs text-gray-600 mb-3">
        点击地图上的任意位置，查看该地点的钓鱼指数
      </p>
      
      <MapSelector
        onLocationSelect={onLocationSelect}
        selectedLocation={selectedLocation}
        center={center}
        zoom={zoom}
      />

      {selectedLocation && (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-xl">
          <p className="text-xs text-blue-700">
            <span className="font-semibold">已选位置：</span>
            纬度 {selectedLocation.lat.toFixed(4)}°, 
            经度 {selectedLocation.lng.toFixed(4)}°
          </p>
        </div>
      )}

      {loading && (
        <div className="mt-3 flex items-center justify-center gap-2 text-gray-600 py-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">正在获取天气数据...</span>
        </div>
      )}

      {error && (
        <div className="mt-3 bg-red-50 border border-red-200 text-red-700 px-3 py-2.5 rounded-xl flex items-start gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {weather && (
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

export default MapPanel;
