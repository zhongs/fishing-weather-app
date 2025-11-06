import { Star, Trash2, MapPin, TrendingUp, Calendar, Award } from 'lucide-react';

function UserCenter({ locations, onSelect, onRemove, onClose }) {
  // 计算统计数据
  const totalLocations = locations.length;
  const recentLocation = locations.length > 0 ? locations[locations.length - 1] : null;
  
  // 按添加时间排序（最新的在前）
  const sortedLocations = [...locations].sort((a, b) => 
    new Date(b.addedAt) - new Date(a.addedAt)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 pb-20">
      <div className="max-w-md mx-auto px-4 pt-4">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
              <Star className="w-8 h-8 text-white fill-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">个人中心</h1>
              <p className="text-sm text-gray-600">管理你的钓点收藏</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 text-center">
              <MapPin className="w-5 h-5 text-blue-600 mx-auto mb-1" />
              <div className="text-xl font-bold text-gray-800">{totalLocations}</div>
              <div className="text-xs text-gray-600">钓点数</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 text-center">
              <TrendingUp className="w-5 h-5 text-green-600 mx-auto mb-1" />
              <div className="text-xl font-bold text-gray-800">
                {totalLocations > 0 ? totalLocations * 3 : 0}
              </div>
              <div className="text-xs text-gray-600">查询次数</div>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-3 text-center">
              <Award className="w-5 h-5 text-yellow-600 mx-auto mb-1" />
              <div className="text-xl font-bold text-gray-800">
                {totalLocations >= 5 ? '金牌' : totalLocations >= 3 ? '银牌' : '新手'}
              </div>
              <div className="text-xs text-gray-600">等级</div>
            </div>
          </div>
        </div>

        {/* Saved Locations */}
        <div className="bg-white rounded-2xl shadow-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              我的钓点
            </h2>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {totalLocations} 个
            </span>
          </div>

          {totalLocations === 0 ? (
            <div className="text-center py-12">
              <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-2">还没有收藏的钓点</p>
              <p className="text-sm text-gray-400">
                在搜索或地图中添加常用钓点，方便快速查询天气
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {sortedLocations.map((location) => {
                const addedDate = new Date(location.addedAt);
                const dateStr = addedDate.toLocaleDateString('zh-CN', { 
                  month: 'numeric', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });

                return (
                  <div
                    key={location.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
                  >
                    <button
                      onClick={() => {
                        onSelect(location.name);
                        if (onClose) onClose();
                      }}
                      className="flex-1 text-left min-w-0"
                    >
                      <div className="font-medium text-gray-800 truncate">
                        {location.name}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                        <Calendar className="w-3 h-3" />
                        <span>{dateStr}</span>
                      </div>
                    </button>
                    <button
                      onClick={() => onRemove(location.id)}
                      className="ml-2 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      title="删除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {totalLocations > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                点击钓点名称可快速查看天气
              </p>
            </div>
          )}
        </div>

        {/* Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mt-4">
          <h3 className="text-sm font-bold text-blue-800 mb-2">💡 使用提示</h3>
          <ul className="space-y-1 text-xs text-blue-700">
            <li>• 在主页搜索城市后，点击"收藏当前钓点"添加</li>
            <li>• 使用地图标点功能，精确定位你的钓点位置</li>
            <li>• 收藏的钓点会自动保存，下次打开应用时依然存在</li>
            <li>• 悬停钓点卡片可显示删除按钮</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default UserCenter;
