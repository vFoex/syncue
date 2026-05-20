import Editor from '@/components/Editor/Editor'
import Footer from '@/components/Footer'
import { Metadata } from 'next'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Editor',
}

export default function EditorPage() {
  return (
    <div className='flex flex-col justify-between items-center min-h-screen bg-zinc-50 dark:bg-zinc-900'>
      <main className="w-full p-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <Image src="/icon.svg" alt="Syncue" width={28} height={28} />
              <span className="text-2xl font-semibold text-zinc-800 dark:text-zinc-100">Syncue</span>
            </div>
            
            <a href="/prompter" className="px-4 py-2 bg-zinc-800 text-white rounded-lg text-sm hover:bg-zinc-700 transition-colors">
              Run the prompter
            </a>
          </div>
          <Editor />
        </div>
      </main>
      <Footer />
    </div>
  )
  
}