import { Home, Map as MapIcon, User } from 'lucide-react';

function BottomNav({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'home', label: '首页', icon: Home },
    { id: 'map', label: '地图', icon: MapIcon },
    { id: 'profile', label: '我的', icon: User }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-3 transition-all ${
                isActive 
                  ? 'text-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className={`w-6 h-6 mb-1 transition-transform ${
                isActive ? 'scale-110' : ''
              }`} />
              <span className={`text-xs font-medium ${
                isActive ? 'font-bold' : ''
              }`}>
                {tab.label}
              </span>
              {isActive && (
                <div className="absolute bottom-0 w-12 h-1 bg-blue-600 rounded-t-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default BottomNav;
