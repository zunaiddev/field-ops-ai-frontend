import AppRoutes from './routes'
import { Toaster } from 'react-hot-toast'
import { UserProvider } from './context/UserContext'
import { AlertModalProvider } from './context/AlertModalContext'

function App() {
  return (
    <UserProvider>
      <AlertModalProvider>
        <AppRoutes />
        <Toaster />
      </AlertModalProvider>
    </UserProvider>
  )
}

export default App
