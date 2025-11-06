import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { Icon } from 'leaflet';
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

function MapSelector({ onLocationSelect, selectedLocation, center, zoom, fullScreen = false }) {
  const [mapCenter, setMapCenter] = useState(center || [30.5928, 114.3055]); // 默认武汉
  const [mapZoom, setMapZoom] = useState(zoom || 11);

  useEffect(() => {
    if (center) {
      setMapCenter(center);
    }
  }, [center]);

  return (
    <div className={`relative w-full z-0 ${fullScreen ? 'h-full' : 'h-[400px] rounded-xl overflow-hidden shadow-lg'}`}>
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        className="w-full h-full z-0"
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
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
