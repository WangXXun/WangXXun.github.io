'use client'

import { Canvas, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import Earth from './Earth'
import * as THREE from 'three'

// 相机控制组件 - 优化动画性能
function CameraController({ scrollProgress }: { scrollProgress: number }) {
  const { camera } = useThree()
  const targetZ = useRef(5)
  const animationFrameRef = useRef<number>()

  useEffect(() => {
    // 根据滚动进度计算相机 Z 位置
    // scrollProgress 0 -> 1: 相机从 5 -> 1.2 (zoom in)
    const minZ = 1.2
    const maxZ = 5
    targetZ.current = maxZ - (maxZ - minZ) * scrollProgress
  }, [scrollProgress])

  useEffect(() => {
    const animate = () => {
      const currentZ = camera.position.z
      const diff = targetZ.current - currentZ
      
      // 平滑插值，使用更快的响应速度
      if (Math.abs(diff) > 0.001) {
        camera.position.z += diff * 0.18
        camera.updateProjectionMatrix()
        animationFrameRef.current = requestAnimationFrame(animate)
      }
    }
    
    animationFrameRef.current = requestAnimationFrame(animate)
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [camera, scrollProgress])

  return null
}

export default function Scene({ scrollProgress = 0 }: { scrollProgress?: number }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 50 }}
      style={{ width: '100%', height: '100%', background: 'transparent' }}
      gl={{ 
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
        stencil: false,
        depth: true,
      }}
      dpr={[1, 2]}
      performance={{ min: 0.5 }}
    >
      <CameraController scrollProgress={scrollProgress} />
      <Earth />
    </Canvas>
  )
}
