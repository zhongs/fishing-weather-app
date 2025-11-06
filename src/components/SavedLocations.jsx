import { Star, Trash2 } from 'lucide-react';

function SavedLocations({ locations, onSelect, onRemove }) {
  if (locations.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          常用钓点
        </h3>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          {locations.length} 个
        </span>
      </div>
      
      <div className="space-y-2">
        {locations.map((location) => (
          <div
            key={location.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors active:scale-[0.98]"
          >
            <button
              onClick={() => onSelect(location.name)}
              className="flex-1 text-left text-gray-700 hover:text-blue-600 transition-colors font-medium text-sm truncate"
            >
              {location.name}
            </button>
            <button
              onClick={() => onRemove(location.id)}
              className="ml-2 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
              title="删除"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          点击钓点名称快速查看天气
        </p>
      </div>
    </div>
  );
}

export default SavedLocations;
