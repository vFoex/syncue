'use client'
 
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import useScriptStore from '@/store/useScriptStore'
 
type Block = {
  type: string
  data: { text?: string; level?: number }
}
 
export default function PrompterView() {
  const { blocks, speed, fontSize, setSpeed, setFontSize } = useScriptStore()
  const [running, setRunning] = useState(false)
  const offsetRef = useRef(0)
  const rafRef = useRef<number | null>(null)
  const lastTsRef = useRef<number | null>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
 
  const totalScrollable = () => {
    if (!contentRef.current || !viewportRef.current) return 0
    return Math.max(0, contentRef.current.scrollHeight - viewportRef.current.clientHeight)
  }
 
  const applyOffset = () => {
    if (!contentRef.current) return
    contentRef.current.style.transform = `translateY(${-offsetRef.current}px)`
  }
 
  const tick = (ts: number) => {
    if (!lastTsRef.current) lastTsRef.current = ts
    const dt = ts - lastTsRef.current
    lastTsRef.current = ts
    offsetRef.current = Math.min(offsetRef.current + speed * dt / 1000, totalScrollable())
    applyOffset()
    if (offsetRef.current < totalScrollable()) {
      rafRef.current = requestAnimationFrame(tick)
    } else {
      setRunning(false)
    }
  }
 
  useEffect(() => {
    if (running) {
      lastTsRef.current = null
      rafRef.current = requestAnimationFrame(tick)
    } else {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [running, speed])
 
  const handleReset = () => {
    setRunning(false)
    offsetRef.current = 0
    applyOffset()
  }
 
  const cleanText = (text: string) =>
    text.replace(/&nbsp;/g, ' ').replace(/<[^>]*>/g, '').trim()
 
  const renderBlock = (block: Block, i: number) => {
    const text = cleanText(block.data?.text || '')
    if (!text) return null
 
    if (block.type === 'header') {
      const level = block.data?.level || 2
      const sizeMultiplier: Record<number, number> = { 1: 1.8, 2: 1.5, 3: 1.25, 4: 1.1 }
      const multiplier = sizeMultiplier[level] || 1.5
      return (
        <p key={i}
          style={{ fontSize: `${Math.round(fontSize * multiplier)}px` }}
          className="text-center font-bold text-white mb-6 leading-tight">
          {text}
        </p>
      )
    }
 
    return (
      <p key={i}
        style={{ fontSize: `${fontSize}px` }}
        className="text-center leading-relaxed text-zinc-300 mb-8">
        {text}
      </p>
    )
  }
 
  const blockList: Block[] = blocks?.blocks || []
 
  return (
    <div className="flex flex-col h-screen bg-black text-white">
 
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 px-4 py-3 bg-zinc-900 border-b border-zinc-800">
 
        {/* Left: logo + back */}
        <div className="flex items-center gap-3 mr-auto">
          <Image src="/icon.svg" alt="Syncue" width={24} height={24} />
          <a href="/editor" className="text-zinc-400 hover:text-white text-sm transition-colors">
            ← Editor
          </a>
        </div>
 
        {/* Center: play + reset */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setRunning(r => !r)}
            className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-sm font-medium transition-colors cursor-pointer"
          >
            {running ? 'Pause' : 'Run'}
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-1.5 rounded-lg border border-zinc-700 hover:border-zinc-500 text-sm transition-colors cursor-pointer"
          >
            Reset
          </button>
        </div>
 
        {/* Right: sliders */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <label>Speed</label>
            <input type="range" min={10} max={200} step={5} value={speed}
              onChange={e => setSpeed(Number(e.target.value))}
              className="w-20 accent-amber-500" />
            <span className="text-amber-400 w-8 tabular-nums">{speed}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <label>Size</label>
            <input type="range" min={18} max={64} step={2} value={fontSize}
              onChange={e => setFontSize(Number(e.target.value))}
              className="w-20 accent-amber-500" />
            <span className="text-amber-400 w-12 tabular-nums">{fontSize}px</span>
          </div>
        </div>
 
      </div>
 
      {/* Viewport */}
      <div ref={viewportRef} className="flex-1 overflow-hidden relative">
        <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-amber-500/20 z-10 pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black to-transparent z-10 pointer-events-none" />
        <div ref={contentRef} className="px-6 md:px-16 py-32">
          {blockList.length > 0 ? blockList.map((block, i) => renderBlock(block, i)) : (
            <p className="text-center text-zinc-600 text-xl">
              No text — return to the editor to write one.
            </p>
          )}
        </div>
      </div>
 
    </div>
  )
}