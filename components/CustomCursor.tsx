'use client'

import { useEffect, useState } from 'react'

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isVisible, setIsVisible] = useState(false)
  const [isClicking, setIsClicking] = useState(false)

  useEffect(() => {
    const updatePosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY })
      setIsVisible(true)
    }

    const handleMouseLeave = () => setIsVisible(false)
    const handleMouseEnter = () => setIsVisible(true)
    const handleMouseDown = () => setIsClicking(true)
    const handleMouseUp = () => setIsClicking(false)

    window.addEventListener('mousemove', updatePosition)
    document.addEventListener('mouseleave', handleMouseLeave)
    document.addEventListener('mouseenter', handleMouseEnter)
    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', updatePosition)
      document.removeEventListener('mouseleave', handleMouseLeave)
      document.removeEventListener('mouseenter', handleMouseEnter)
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  // Only show on desktop
  if (typeof window !== 'undefined' && window.innerWidth < 768) {
    return null
  }

  return (
    <>
      {/* Outer glow */}
      <div
        className={`fixed pointer-events-none z-50 mix-blend-difference transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          left: position.x,
          top: position.y,
          width: isClicking ? '40px' : '30px',
          height: isClicking ? '40px' : '30px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124, 58, 237, 0.3) 0%, transparent 70%)',
          transform: 'translate(-50%, -50%)',
          transition: 'width 0.2s, height 0.2s',
        }}
      />
      
      {/* Inner dot */}
      <div
        className={`fixed pointer-events-none z-50 transition-all duration-150 ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
        }`}
        style={{
          left: position.x,
          top: position.y,
          width: isClicking ? '8px' : '6px',
          height: isClicking ? '8px' : '6px',
          borderRadius: '50%',
          background: '#7c3aed',
          transform: 'translate(-50%, -50%)',
          transition: 'width 0.2s, height 0.2s, opacity 0.2s, scale 0.2s',
          boxShadow: '0 0 10px rgba(124, 58, 237, 0.8), 0 0 20px rgba(124, 58, 237, 0.4)',
        }}
      />
    </>
  )
}
