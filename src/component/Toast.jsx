import { useApp } from "../AppContext";

export default function ToastHost(){
    const {toasts} = useApp()

    if(toasts.length === 0) return null

    return (
        <div className="toast-host">
            {toasts.map((t) => (
                <div key={t.id} className="{`toast toast-${t.type}">
                    <span className="toast-icon">{t.type === 'error' ? '✕' : '✓'}</span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  )
}