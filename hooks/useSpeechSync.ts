'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Fuse from 'fuse.js'

export type SpeechState = 'idle' | 'speaking' | 'paused' | 'unsupported'

interface UseSpeechSyncOptions {
  blocks: { type: string; data: { text?: string; level?: number } }[]
  onPositionChange: (ratio: number) => void
  silenceDelay?: number
  getCurrentRatio: () => number 
  lang: string
}

export function useSpeechSync({
  blocks,
  onPositionChange,
  silenceDelay = 5000,
  getCurrentRatio,
  lang,
}: UseSpeechSyncOptions) {
  const [state, setState] = useState<SpeechState>('idle')
  const recognitionRef = useRef<any>(null)
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const activeRef = useRef(false)

  // Build a flat list of { text, ratio } from blocks
  const segments = blocks
    .map((b, i) => ({
      text: (b.data?.text || '')
        .replace(/&nbsp;/g, ' ')
        .replace(/<[^>]*>/g, '')
        .trim()
        .toLowerCase(),
      ratio: i / Math.max(blocks.length - 1, 1),
    }))
    .filter(s => s.text.length > 0)

  const fuse = new Fuse(segments, {
    keys: ['text'],
    threshold: 0.45,
    includeScore: true,
  })

  const findPosition = useCallback((transcript: string, currentRatio: number): number | null => {
    if (!transcript.trim()) return null
    const results = fuse.search(transcript.trim().toLowerCase())
    if (results.length === 0) return null

    // Filter results that are ahead of current position
    const ahead = results.filter(r => r.item.ratio >= currentRatio - 0.05)
    const pool = ahead.length > 0 ? ahead : results

    // Among candidates, pick the closest to current position
    pool.sort((a, b) =>
      Math.abs(a.item.ratio - currentRatio) - Math.abs(b.item.ratio - currentRatio)
    )

    return pool[0].item.ratio
  }, [segments])

  const clearSilenceTimer = () => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)
  }

  const startSilenceTimer = () => {
    clearSilenceTimer()
    silenceTimerRef.current = setTimeout(() => {
      if (activeRef.current) setState('paused')
    }, silenceDelay)
  }

  const start = useCallback(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition: any }).webkitSpeechRecognition

    if (!SpeechRecognition) {
      setState('unsupported')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = lang

    recognition.onstart = () => {
      activeRef.current = true
      setState('speaking')
    }

    recognition.onresult = (event: any) => {
      setState('speaking')
      startSilenceTimer()

      let transcript = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript
      }

      const position = findPosition(transcript, getCurrentRatio())
      if (position !== null) onPositionChange(position)
    }

    recognition.onspeechend = () => {
    }

    recognition.onerror = (e: any) => {
      if (e.error !== 'no-speech') {
        setState('idle')
        activeRef.current = false
      }
    }

    recognition.onend = () => {
      if (activeRef.current) recognition.start()
    }

    recognitionRef.current = recognition
    recognition.start()
  }, [findPosition, onPositionChange, silenceDelay])

  const stop = useCallback(() => {
    activeRef.current = false
    clearSilenceTimer()
    recognitionRef.current?.stop()
    recognitionRef.current = null
    setState('idle')
  }, [])

  useEffect(() => {
    return () => {
      activeRef.current = false
      clearSilenceTimer()
      recognitionRef.current?.abort()
    }
  }, [])

  return { state, start, stop }
}