import { useEffect, useRef, useState } from 'react'

export default function InstallPrompt() {
  const [show, setShow] = useState(false)
  const deferredEvt = useRef<any>(null)

  useEffect(() => {
    const done = localStorage.getItem('a2hs_done') === '1'
    if (done) return
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone
    if (isStandalone) {
      localStorage.setItem('a2hs_done', '1')
      return
    }
    const onBeforeInstall = (e: any) => {
      e.preventDefault()
      deferredEvt.current = e
      setShow(true)
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall)
  }, [])

  if (!show) return null

  const install = async () => {
    if (!deferredEvt.current) return
    deferredEvt.current.prompt()
    const { outcome } = await deferredEvt.current.userChoice
    if (outcome === 'accepted') localStorage.setItem('a2hs_done', '1')
    deferredEvt.current = null
    setShow(false)
  }

  const dismiss = () => {
    localStorage.setItem('a2hs_done', '1')
    setShow(false)
  }

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 max-w-sm w-[90%] rounded-2xl shadow-lg bg-white dark:bg-zinc-900 p-4 flex items-start gap-3 border">
      <div className="grow">
        <div className="font-semibold">Add to Home Screen</div>
        <div className="text-sm opacity-80">Instaliraj aplikaciju na telefon za brži pristup.</div>
      </div>
      <button onClick={install} className="px-3 py-1 rounded-xl bg-black text-white text-sm">Install</button>
      <button onClick={dismiss} className="px-2 py-1 text-sm">Later</button>
    </div>
  )
}