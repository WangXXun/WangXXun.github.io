'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import * as THREE from 'three'

function Earth() {
  const meshRef = useRef<THREE.Mesh>(null)

  // 使用真实地球纹理
  const earthTexture = useMemo(() => {
    const loader = new THREE.TextureLoader()
    const texture = loader.load(
      'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg',
      undefined,
      undefined,
      (error) => {
        console.warn('地球纹理加载失败', error)
      }
    )
    texture.colorSpace = THREE.SRGBColorSpace
    return texture
  }, [])

  // 地球法线贴图
  const normalTexture = useMemo(() => {
    const loader = new THREE.TextureLoader()
    const texture = loader.load(
      'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_normal_2048.jpg',
      undefined,
      undefined,
      (error) => {
        console.warn('法线贴图加载失败', error)
      }
    )
    return texture
  }, [])

  // 地球自动旋转
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.05
    }
  })

  return (
    <>
      {/* 星空背景 */}
      <Stars 
        radius={400} 
        depth={50} 
        count={3000} 
        factor={4} 
        fade 
        speed={0.5} 
      />

      {/* 环境光和太阳光 */}
      <ambientLight intensity={0.4} />
      <directionalLight 
        position={[5, 3, 5]} 
        intensity={1.5} 
        castShadow
      />

      {/* 地球主体 */}
      <mesh ref={meshRef} castShadow receiveShadow>
        <sphereGeometry args={[2, 128, 64]} />
        <meshPhongMaterial
          map={earthTexture}
          normalMap={normalTexture}
          normalScale={new THREE.Vector2(0.8, 0.8)}
          shininess={10}
        />
      </mesh>

      {/* 轨道控制器 - 禁用缩放，让滚轮用于页面滚动 */}
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableRotate={true}
        zoomSpeed={0.8}
        panSpeed={0.5}
        rotateSpeed={0.5}
        minDistance={2.5}
        maxDistance={10}
        minPolarAngle={0}
        maxPolarAngle={Math.PI}
        enableDamping={true}
        dampingFactor={0.05}
        autoRotate={false}
      />
    </>
  )
}

export default Earth
