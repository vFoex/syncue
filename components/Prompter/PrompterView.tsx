'use client'
 
import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import useScriptStore from '@/store/useScriptStore'
import { useSpeechSync, SpeechState } from '@/hooks/useSpeechSync'
 
type Block = {
  type: string
  data: { text?: string; level?: number }
}
 
export default function PrompterView() {
  const { blocks, speed, fontSize, setSpeed, setFontSize, voiceLang, setVoiceLang } = useScriptStore()
  const [running, setRunning] = useState(false)
  const offsetRef = useRef(0)
  const rafRef = useRef<number | null>(null)
  const lastTsRef = useRef<number | null>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const [autoMode, setAutoMode] = useState(false)
  const maxRatioRef = useRef(0)
  const [showVoiceDialog, setShowVoiceDialog] = useState(false)

 
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
    maxRatioRef.current = 0
    targetRatioRef.current = null
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


  const targetRatioRef = useRef<number | null>(null)

  const handlePositionChange = useCallback((ratio: number) => {
    targetRatioRef.current = ratio
  }, [])

  const { state: speechState, start: startSpeech, stop: stopSpeech } = useSpeechSync({
    blocks: blockList,
    onPositionChange: handlePositionChange,
    getCurrentRatio: () => {
      const total = totalScrollable()
      return total > 0 ? offsetRef.current / total : 0
    },
    lang: voiceLang,
  })

  
  useEffect(() => {
    // Wait for DOM to re-render with new font size
    requestAnimationFrame(() => {
      const total = totalScrollable()
      if (total === 0) return
      const currentRatio = targetRatioRef.current ?? (offsetRef.current / total)
      offsetRef.current = currentRatio * total
      applyOffset()
    })
  }, [fontSize])

  useEffect(() => {
    if (!autoMode) return

    let rafId: number

    const loop = () => {
      if (
        targetRatioRef.current !== null &&
        contentRef.current &&
        viewportRef.current &&
        speechState === 'speaking'
      ) {
        const total = totalScrollable()
        const target = targetRatioRef.current * total

        // Never scroll backwards
        if (target > offsetRef.current) {
          const diff = target - offsetRef.current
          if (Math.abs(diff) > 1) {
            offsetRef.current += diff * 0.05
            applyOffset()
          }
        }
      }

      rafId = requestAnimationFrame(loop)
    }

    rafId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafId)
  }, [autoMode, speechState])

  const toggleAutoMode = () => {
    if (autoMode) {
      stopSpeech()
      setRunning(false)
    } else {
      setRunning(false)
      startSpeech()
    }
    setAutoMode(m => !m)
  }
 
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
 
        <button
          onClick={() => autoMode ? toggleAutoMode() : setShowVoiceDialog(true)}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer border ${
            autoMode
              ? 'bg-emerald-500 hover:bg-emerald-400 text-black border-transparent'
              : 'bg-amber-500 hover:bg-amber-400 text-black'
          }`}
        >
          {autoMode ? 'Voice Auto ON' : 'Voice Auto'}
        </button>

        {autoMode && (
          <span className={`text-xs px-2 py-1 rounded-full ${
            speechState === 'speaking' ? 'bg-emerald-500/20 text-emerald-400' :
            speechState === 'paused'   ? 'bg-amber-500/20 text-amber-400' :
            speechState === 'unsupported' ? 'bg-red-500/20 text-red-400' :
            'bg-zinc-800 text-zinc-500'
          }`}>
            {speechState === 'speaking'     ? '● Listening'   :
            speechState === 'paused'       ? '⏸ Paused'      :
            speechState === 'unsupported'  ? '✕ Unsupported' :
            '○ Starting...'}
          </span>
        )}

        |

        {/* Center: play + reset */}
        <div className="flex items-center gap-2">
          {!autoMode && (
            <button
              onClick={() => setRunning(r => !r)}
              className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-sm font-medium transition-colors cursor-pointer"
            >
              {running ? 'Pause' : 'Run'}
            </button>
          )}
          <button
            onClick={handleReset}
            className="px-4 py-1.5 rounded-lg border border-zinc-700 hover:border-zinc-500 text-sm transition-colors cursor-pointer"
          >
            Reset
          </button>
        </div>

        |
 
        {/* Right: sliders */}
        <div className="flex flex-wrap items-center gap-4">
          <div className={`flex items-center gap-2 text-sm text-zinc-400 ${autoMode ? 'hidden' : ''}`}>
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
      {showVoiceDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
      
            {/* Header */}
            <div className="px-6 pt-6 pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <span className="text-emerald-400 text-base">🎙️</span>
                </div>
                <h2 className="text-white text-base font-semibold">Voice Auto-Scroll</h2>
              </div>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Your teleprompter scrolls automatically as you speak — no manual speed control needed.
              </p>
            </div>
      
            {/* Body */}
            <div className="px-6 py-4 space-y-4">
      
              {/* Requirements */}
              <div className="space-y-2">
                <p className="text-zinc-500 text-xs uppercase tracking-wider font-medium">Requirements</p>
                <div className="space-y-2">
                  {[
                    { icon: '🌐', text: <><span className="text-white">Google Chrome</span> or <span className="text-white">Microsoft Edge</span> only — other browsers are not supported</> },
                    { icon: '🎙️', text: <>Microphone permission required</> },
                    { icon: '🔒', text: <><span className="text-white">No data leaves your device</span> — voice is processed entirely on your browser</> },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3 bg-zinc-800/50 rounded-xl px-3 py-2.5">
                      <span className="text-sm mt-0.5">{item.icon}</span>
                      <p className="text-zinc-400 text-sm leading-snug">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
      
              {/* Language selector */}
              <div className="space-y-2">
                <label className="text-zinc-500 text-xs uppercase tracking-wider font-medium block">
                  Script language
                </label>
                <select
                  value={voiceLang}
                  onChange={e => setVoiceLang(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 hover:border-zinc-600 text-white text-sm rounded-xl px-3 py-2.5 cursor-pointer focus:outline-none focus:border-emerald-500 transition-colors"
                >
                  <option value="en-US">🇺🇸 English (US)</option>
                  <option value="en-GB">🇬🇧 English (UK)</option>
                  <option value="fr-FR">🇫🇷 French</option>
                  <option value="es-ES">🇪🇸 Spanish</option>
                  <option value="de-DE">🇩🇪 German</option>
                  <option value="it-IT">🇮🇹 Italian</option>
                  <option value="pt-BR">🇧🇷 Portuguese (BR)</option>
                </select>
              </div>
      
            </div>
      
            {/* Footer */}
            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={() => setShowVoiceDialog(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white text-sm transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowVoiceDialog(false)
                  toggleAutoMode()
                }}
                className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-semibold transition-colors cursor-pointer"
              >
                Enable
              </button>
            </div>
      
          </div>
        </div>
      )}
    </div>
  )
}