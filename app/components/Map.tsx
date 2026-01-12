'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, useMap, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'

// 修复 Leaflet 默认图标问题
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  })
}

// 创建自定义图标（黑白风格）
const createCustomIcon = (color: string = '#ffffff') => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: 12px;
      height: 12px;
      background: ${color};
      border: 2px solid rgba(255, 255, 255, 0.8);
      border-radius: 50%;
      box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
    "></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  })
}

// POI 数据 - 项目信息和旅行记录
const pois = [
  {
    id: 1,
    position: [39.9042, 116.4074] as [number, number], // 北京
    title: '北京项目',
    description: '在这里完成的重要项目',
    type: 'project',
  },
  {
    id: 2,
    position: [31.2304, 121.4737] as [number, number], // 上海
    title: '上海旅行',
    description: '2023年的上海之旅',
    type: 'travel',
  },
  {
    id: 3,
    position: [30.5728, 104.0668] as [number, number], // 成都
    title: '成都项目',
    description: '在成都的工作经历',
    type: 'project',
  },
  {
    id: 4,
    position: [23.1291, 113.2644] as [number, number], // 广州
    title: '广州旅行',
    description: '探索广州的文化',
    type: 'travel',
  },
  {
    id: 5,
    position: [28.2278, 112.9388] as [number, number], // 长沙
    title: '长沙',
    description: '我的家乡',
    type: 'home',
  },
]

// 地图控制器组件
function MapController({ scrollProgress }: { scrollProgress: number }) {
  const map = useMap()

  useEffect(() => {
    // 根据滚动进度调整地图初始视图
    // 当地图首次显示时，定位到中国
    if (scrollProgress > 0.5 && scrollProgress < 0.55) {
      map.setView([35, 105], 4, { animate: true })
    }
  }, [scrollProgress, map])

  return null
}

export default function Map({ scrollProgress }: { scrollProgress: number }) {
  const [selectedPoi, setSelectedPoi] = useState<number | null>(null)
  const [isInteracting, setIsInteracting] = useState(false)

  // 当地图完全显示时启用所有交互
  const isMapFullyVisible = scrollProgress > 0.6

  // 处理地图交互开始/结束，防止与页面滚动冲突
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // 如果在地图上且地图完全可见，允许地图缩放
      if (isMapFullyVisible && isInteracting) {
        // 地图可以处理滚轮事件
        return
      }
    }

    window.addEventListener('wheel', handleWheel, { passive: true })
    return () => window.removeEventListener('wheel', handleWheel)
  }, [isMapFullyVisible, isInteracting])

  return (
    <div 
      style={{ width: '100%', height: '100%' }}
      onMouseEnter={() => setIsInteracting(true)}
      onMouseLeave={() => setIsInteracting(false)}
    >
      <MapContainer
        center={[35, 105]} // 中国中心
        zoom={4}
        minZoom={2}
        maxZoom={18}
        style={{ width: '100%', height: '100%' }}
        zoomControl={isMapFullyVisible}
        scrollWheelZoom={isMapFullyVisible && isInteracting}
        dragging={isMapFullyVisible}
        className="map-container"
        worldCopyJump={false}
      >
        {/* 使用黑白地图瓦片 */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          noWrap={false}
        />
        
        <MapController scrollProgress={scrollProgress} />
        
        {/* 显示 POI 标记 */}
        {pois.map((poi) => (
          <Marker
            key={poi.id}
            position={poi.position}
            icon={createCustomIcon(
              poi.type === 'project' ? '#88ccff' :
              poi.type === 'travel' ? '#ffaa88' :
              '#ffffff'
            )}
            eventHandlers={{
              click: () => {
                setSelectedPoi(poi.id)
              },
            }}
          >
            <Popup>
              <div style={{ 
                color: '#000', 
                padding: '8px',
                minWidth: '200px'
              }}>
                <h3 style={{ 
                  margin: '0 0 8px 0', 
                  fontSize: '16px',
                  fontWeight: '600'
                }}>
                  {poi.title}
                </h3>
                <p style={{ 
                  margin: 0, 
                  fontSize: '14px',
                  color: '#666'
                }}>
                  {poi.description}
                </p>
                <div style={{
                  marginTop: '8px',
                  padding: '4px 8px',
                  background: poi.type === 'project' ? '#e3f2fd' :
                              poi.type === 'travel' ? '#fff3e0' :
                              '#f5f5f5',
                  borderRadius: '4px',
                  fontSize: '12px',
                  color: '#666'
                }}>
                  {poi.type === 'project' ? '项目' :
                   poi.type === 'travel' ? '旅行' :
                   '家乡'}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
