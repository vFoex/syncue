import PrompterView from '@/components/Prompter/PrompterView'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Prompter',
}

export default function PrompterPage() {
  return <PrompterView />
}