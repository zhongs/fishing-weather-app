import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import { Crosshair } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// 自定义标记图标
const customIcon = new Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// 地图点击事件组件
function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onLocationSelect({ lat, lng });
    }
  });
  return null;
}

// 地图中心控制组件
function MapCenterController({ center }) {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  
  return null;
}

function MapSelector({ onLocationSelect, selectedLocation, center, zoom, fullScreen = false }) {
  const [mapCenter, setMapCenter] = useState(center || [30.5928, 114.3055]); // 默认武汉
  const [mapZoom, setMapZoom] = useState(zoom || 11);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    if (center) {
      setMapCenter(center);
    }
  }, [center]);

  // 获取用户当前位置
  const handleGetCurrentLocation = () => {
    setIsLocating(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const location = { lat: latitude, lng: longitude };
          
          setMapCenter([latitude, longitude]);
          onLocationSelect(location);
          setIsLocating(false);
        },
        (error) => {
          console.error('定位失败:', error);
          alert('无法获取您的位置，请检查定位权限');
          setIsLocating(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      alert('您的浏览器不支持定位功能');
      setIsLocating(false);
    }
  };

  return (
    <div className={`relative w-full z-0 ${fullScreen ? 'h-full' : 'h-[400px] rounded-xl overflow-hidden shadow-lg'}`}>
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        className="w-full h-full z-0"
        zoomControl={true}
        attributionControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapCenterController center={mapCenter} />
        <MapClickHandler onLocationSelect={onLocationSelect} />
        
        {selectedLocation && (
          <Marker 
            position={[selectedLocation.lat, selectedLocation.lng]}
            icon={customIcon}
          >
            <Popup>
              <div className="text-center">
                <p className="font-semibold">选中位置</p>
                <p className="text-xs text-gray-600">
                  纬度: {selectedLocation.lat.toFixed(4)}
                </p>
                <p className="text-xs text-gray-600">
                  经度: {selectedLocation.lng.toFixed(4)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
      
      {/* 定位按钮 - 在缩放控制下方 */}
      <button
        onClick={handleGetCurrentLocation}
        disabled={isLocating}
        className="leaflet-bar absolute left-[12px] top-[90px] z-[1000] bg-white hover:bg-gray-50 border-2 border-gray-300 rounded-sm shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ width: '30px', height: '30px' }}
        title="定位到我的位置"
      >
        <div className="flex items-center justify-center w-full h-full">
          {isLocating ? (
            <svg className="w-4 h-4 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <Crosshair className="w-4 h-4 text-gray-700" strokeWidth={2.5} />
          )}
        </div>
      </button>
      
      {/* 地图说明 - 仅非全屏模式显示 */}
      {!fullScreen && (
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-3 py-2 rounded-lg shadow-md text-xs">
          <p className="text-gray-700 font-medium">💡 点击地图标记钓点</p>
        </div>
      )}
    </div>
  );
}

export default MapSelector;
