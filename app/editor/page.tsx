'use client'

import Footer from '@/components/Footer'
import dynamic from 'next/dynamic'

const EditorBlock = dynamic(() => import('@/components/Editor/EditorBlock'), {
  ssr: false,
  loading: () => <p className="text-zinc-400">Loading of the editor...</p>,
})

export default function EditorPage() {
  return (
    <div className='flex flex-col justify-between items-center min-h-screen bg-zinc-50 dark:bg-zinc-900'>
      <main className="w-full p-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-semibold text-zinc-800 dark:text-zinc-100">
              Syncue
            </h1>
            
            <a href="/prompter" className="px-4 py-2 bg-zinc-800 text-white rounded-lg text-sm hover:bg-zinc-700 transition-colors">
              Run the prompter
            </a>
          </div>
          <EditorBlock />
        </div>
      </main>
      <Footer />
    </div>
  )
  
}