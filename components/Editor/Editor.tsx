'use client'

import dynamic from 'next/dynamic'

const EditorBlock = dynamic(() => import('@/components/Editor/EditorBlock'), {
  ssr: false,
  loading: () => <p className="text-zinc-400">Loading of the editor...</p>,
})

export default function Editor(){
    return (
        <EditorBlock />
    )
}