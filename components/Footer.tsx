export default function Footer() {
  return (
    <footer className="w-full py-4 px-8 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
      <p className="text-center text-sm text-zinc-400">
        © {new Date().getFullYear()} Syncue - <a href="https://github.com/vFoex" target="_blank">VFoex</a> — All rights reserved
      </p>
    </footer>
  )
}