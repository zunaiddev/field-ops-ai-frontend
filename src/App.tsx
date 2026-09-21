import AppRoutes from './routes'
import { Toaster } from 'react-hot-toast'
import { UserProvider } from './context/UserContext'

function App() {
  return (
    <UserProvider>
      <AppRoutes />
      <Toaster />
    </UserProvider>
  )
}

export default App
