'use client'

import dynamic from 'next/dynamic'
import { useState, useEffect, useRef, useCallback } from 'react'
import styles from './page.module.css'

// 动态导入组件以避免 SSR 问题
const Scene = dynamic(() => import('./components/Scene'), {
  ssr: false,
  loading: () => null
})

const Map = dynamic(() => import('./components/Map'), {
  ssr: false,
  loading: () => null
})

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const mainRef = useRef<HTMLElement>(null)
  const rafRef = useRef<number>()

  useEffect(() => {
    setMounted(true)
  }, [])

  // 使用 useCallback 优化滚动处理函数
  const handleScroll = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
    }

    rafRef.current = requestAnimationFrame(() => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrolled = window.scrollY
      const progress = scrollHeight > 0 
        ? Math.min(Math.max(scrolled / scrollHeight, 0), 1)
        : 0
      
      setScrollProgress(progress)
    })
  }, [])

  useEffect(() => {
    if (!mounted) return

    // 初始计算
    const initScroll = () => {
      handleScroll()
    }
    
    // 延迟初始化确保DOM已渲染
    setTimeout(initScroll, 100)
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll, { passive: true })

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [mounted, handleScroll])

  // 使用缓动函数优化过渡效果
  const easeInOutCubic = (t: number): number => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
  }

  // 计算地球和地图的显示状态
  // 前50%滚动：地球显示，地图隐藏
  // 后50%滚动：地球隐藏，地图显示
  const easedProgress = easeInOutCubic(scrollProgress)
  const earthOpacity = scrollProgress < 0.5 
    ? 1 - (scrollProgress / 0.5) * 0.3
    : Math.max(0, 1 - ((scrollProgress - 0.5) / 0.5) * 1)
  const mapOpacity = scrollProgress > 0.5 
    ? Math.min(1, ((scrollProgress - 0.5) / 0.5))
    : 0

  return (
    <main ref={mainRef} className={styles.main}>
      {/* 地球场景 - 首页展示全球视野 */}
      {mounted && (
        <div 
          className={styles.sceneContainer}
          style={{ opacity: earthOpacity }}
        >
          <Scene scrollProgress={scrollProgress} />
        </div>
      )}

      {/* 地图组件 - 滚动后显示，展示项目信息和旅行记录 */}
      {mounted && scrollProgress > 0.4 && (
        <div 
          className={styles.mapContainer}
          style={{ opacity: mapOpacity }}
        >
          <Map scrollProgress={scrollProgress} />
        </div>
      )}

      {/* 主标题区域 - 根据滚动进度变化 */}
      <div 
        className={styles.content}
        style={{
          '--scroll-progress': scrollProgress,
        } as React.CSSProperties}
      >
        <h1 className={styles.title}>WANG XUN</h1>
      </div>

      {/* 占位内容，用于产生滚动 */}
      <div className={styles.scrollContent}>
        <div className={styles.scrollSpacer}></div>
        {/* 未来可以在这里添加更多内容 */}
        <div className={styles.futureContent}>
          {/* 预留空间用于未来页面内容 */}
        </div>
      </div>
    </main>
  )
}
