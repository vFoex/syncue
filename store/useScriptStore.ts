import { OutputData } from '@editorjs/editorjs'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ScriptStore {
  blocks: OutputData | null
  plainText: string
  speed: number
  fontSize: number
  setBlocks: (data: OutputData) => void
  setPlainText: (text: string) => void
  setSpeed: (speed: number) => void
  setFontSize: (fontSize: number) => void
}

const useScriptStore = create<ScriptStore>()(
  persist(
    (set) => ({
      blocks: null,
      plainText: '',
      speed: 40,
      fontSize: 32,
      setBlocks: (data) => set({ blocks: data }),
      setPlainText: (text) => set({ plainText: text }),
      setSpeed: (speed) => set({ speed }),
      setFontSize: (fontSize) => set({ fontSize }),
    }),
    { name: 'syncue-script' }
  )
)

export default useScriptStore