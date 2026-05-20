'use client'

import { useEffect, useRef } from 'react'
import EditorJS, { OutputData } from '@editorjs/editorjs'
import Header from '@editorjs/header'
import Paragraph from '@editorjs/paragraph'
import useScriptStore from '@/store/useScriptStore'

export default function EditorBlock() {
  const editorRef = useRef<EditorJS | null>(null)
  const { blocks, setBlocks, setPlainText } = useScriptStore()

  useEffect(() => {
    if (editorRef.current) return

    editorRef.current = new EditorJS({
      holder: 'editorjs',
      tools: {
        header: Header,
        paragraph: {
          class: Paragraph,
          inlineToolbar: true,
        },
      },
      data: blocks || undefined,
      placeholder: 'Write your text here...',
      onChange: async () => {
        const data: OutputData = await editorRef.current!.save()
        setBlocks(data)

        // Extrait le texte brut pour le prompteur
        const plain = data.blocks
            .map((block) => block.data?.text || '')
            .filter(Boolean)
            .map((text) => text.replace(/&nbsp;/g, ' ').replace(/<[^>]*>/g, ''))
            .join('\n\n')
        setPlainText(plain)
      },
    })

    return () => {
      if (editorRef.current && editorRef.current.destroy) {
        editorRef.current.destroy()
        editorRef.current = null
      }
    }
  }, [])

  return (
    <div
      id="editorjs"
      className="min-h-[400px] bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-100"
    />
  )
}