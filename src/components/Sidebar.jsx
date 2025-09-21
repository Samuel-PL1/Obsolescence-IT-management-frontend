import { Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Monitor, 
  AlertTriangle, 
  Users, 
  Menu,
  X,
  Settings,
  LogOut
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Sidebar({ open, setOpen, currentUser }) {
  const location = useLocation()

  const navigation = [
    { name: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Équipements', href: '/equipment', icon: Monitor },
    { name: 'Obsolescence', href: '/obsolescence', icon: AlertTriangle },
    { name: 'Utilisateurs', href: '/users', icon: Users },
  ]

  const isActive = (href) => location.pathname === href

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 bg-white shadow-lg transition-all duration-300 ${
        open ? 'w-64' : 'w-16'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className={`flex items-center space-x-3 ${open ? '' : 'justify-center'}`}>
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Monitor className="w-5 h-5 text-white" />
              </div>
              {open && (
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">IT Manager</h1>
                  <p className="text-xs text-gray-500">Obsolescence</p>
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setOpen(!open)}
              className="p-1"
            >
              {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive(item.href)
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  } ${open ? '' : 'justify-center'}`}
                  title={!open ? item.name : ''}
                >
                  <Icon className="w-5 h-5" />
                  {open && <span className="font-medium">{item.name}</span>}
                </Link>
              )
            })}
          </nav>

          {/* User section */}
          <div className="border-t p-4">
            <div className={`flex items-center space-x-3 ${open ? '' : 'justify-center'}`}>
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-700">
                  {currentUser.username.charAt(0).toUpperCase()}
                </span>
              </div>
              {open && (
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{currentUser.username}</p>
                  <p className="text-xs text-gray-500 capitalize">{currentUser.role}</p>
                </div>
              )}
            </div>
            
            {open && (
              <div className="mt-3 space-y-1">
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  <Settings className="w-4 h-4 mr-2" />
                  Paramètres
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50">
                  <LogOut className="w-4 h-4 mr-2" />
                  Déconnexion
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

