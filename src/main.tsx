
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import './index.css'
import './i18n'
import { DatabaseProvider } from './context/DatabaseContext'
import { AuthProvider } from './context/AuthContext'
import { registerSW } from 'virtual:pwa-register'

registerSW({ immediate: true })

ReactDOM.createRoot(document.getElementById('root')!).render(
  <DatabaseProvider>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </DatabaseProvider>,
)
