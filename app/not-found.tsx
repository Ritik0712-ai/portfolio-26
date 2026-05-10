'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, RotateCcw, Zap } from 'lucide-react'

export default function NotFound() {
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [ballPos, setBallPos] = useState({ x: 50, y: 50 })
  const [ballVel, setBallVel] = useState({ x: 2, y: 2 })
  const [paddlePos, setPaddlePos] = useState(50)
  const [gameStarted, setGameStarted] = useState(false)

  useEffect(() => {
    if (!gameStarted || gameOver) return

    const interval = setInterval(() => {
      setBallPos(prev => {
        let newX = prev.x + ballVel.x
        let newY = prev.y + ballVel.y
        let newVelX = ballVel.x
        let newVelY = ballVel.y

        // Wall collision
        if (newX <= 0 || newX >= 100) {
          newVelX = -newVelX
          newX = Math.max(0, Math.min(100, newX))
        }

        // Top collision (bounce)
        if (newY <= 0) {
          newVelY = -newVelY
          newY = 0
        }

        // Paddle collision
        if (newY >= 90 && newY <= 100) {
          if (newX >= paddlePos - 15 && newX <= paddlePos + 15) {
            newVelY = -newVelY
            newY = 90
            setScore(s => s + 10)
          }
        }

        // Bottom - game over
        if (newY >= 100) {
          setGameOver(true)
          return prev
        }

        return { x: newX, y: newY }
      })
      setBallVel(prev => {
        let newX = prev.x
        let newY = prev.y
        
        if (ballPos.x <= 0 || ballPos.x >= 100) newX = -newX
        if (ballPos.y <= 0) newY = -newY
        
        return { x: newX, y: newY }
      })
    }, 50)

    return () => clearInterval(interval)
  }, [gameStarted, gameOver, ballVel, paddlePos, ballPos])

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') setPaddlePos(p => Math.max(5, p - 5))
    if (e.key === 'ArrowRight') setPaddlePos(p => Math.min(95, p + 5))
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const resetGame = () => {
    setScore(0)
    setBallPos({ x: 50, y: 50 })
    setBallVel({ x: (Math.random() > 0.5 ? 1 : -1) * 2, y: -2 })
    setGameOver(false)
    setGameStarted(true)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="text-center mb-8">
        <h1 className="text-9xl font-bold gradient-text mb-4">404</h1>
        <p className="text-2xl text-text-muted mb-2">Oops! Page not found</p>
        <p className="text-text-muted mb-8">But while you're here, play a quick game!</p>
      </div>

      {/* Mini Game */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-accent" />
            <span className="font-bold text-xl">Score: {score}</span>
          </div>
          {!gameStarted && (
            <button
              onClick={() => { setGameStarted(true); resetGame(); }}
              className="px-4 py-2 bg-primary rounded-lg text-white font-medium hover:bg-primary/80 transition-colors"
            >
              Start Game
            </button>
          )}
          {gameOver && (
            <button
              onClick={resetGame}
              className="flex items-center gap-2 px-4 py-2 bg-accent rounded-lg text-white font-medium hover:bg-accent/80 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Retry
            </button>
          )}
        </div>
        
        <div className="relative w-80 h-48 bg-card rounded-xl border border-primary/20 overflow-hidden">
          {/* Game canvas */}
          {gameStarted && !gameOver && (
            <>
              {/* Ball */}
              <div
                className="absolute w-4 h-4 bg-primary rounded-full shadow-lg shadow-primary/50"
                style={{
                  left: `${ballPos.x}%`,
                  top: `${ballPos.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              />
              
              {/* Paddle */}
              <div
                className="absolute bottom-2 w-20 h-2 bg-accent rounded-full"
                style={{ left: `${paddlePos}%`, transform: 'translateX(-50%)' }}
              />
            </>
          )}
          
          {/* Instructions */}
          {!gameStarted && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-text-muted text-center px-4">
                Use <span className="text-primary">←</span> <span className="text-primary">→</span> arrow keys to move the paddle
              </p>
            </div>
          )}
          
          {/* Game Over */}
          {gameOver && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80">
              <p className="text-2xl font-bold gradient-text">Game Over!</p>
            </div>
          )}
        </div>
      </div>

      <Link
        href="/"
        className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent rounded-full text-white font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Home
      </Link>
    </div>
  )
}
