import { Outlet, NavLink, useNavigate } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/anagrafiche', label: 'Anagrafiche', icon: '👥' },
  { to: '/fatture', label: 'Fatture', icon: '🧾' },
  { to: '/tickets', label: 'Tickets', icon: '🎫' },
  { to: '/agenti', label: 'Agenti AI', icon: '🤖' },
  { to: '/tracking', label: 'Tracking Navi', icon: '🛳️' },
]

export default function Layout() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  function logout() {
    localStorage.clear()
    navigate('/login')
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-56 bg-blue-900 text-white flex flex-col">
        <div className="px-6 py-5 border-b border-blue-800">
          <h1 className="text-lg font-bold tracking-wide">PFship</h1>
          <p className="text-xs text-blue-300 mt-0.5">Gestionale</p>
        </div>
        <nav className="flex-1 py-4">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-6 py-3 text-sm transition-colors ${
                  isActive ? 'bg-blue-700 font-semibold' : 'hover:bg-blue-800'
                }`
              }
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-6 py-4 border-t border-blue-800">
          <p className="text-xs text-blue-300">{user.nome} {user.cognome}</p>
          <button
            onClick={logout}
            className="text-xs text-blue-400 hover:text-white mt-1 transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto p-8">
        <Outlet />
      </main>
    </div>
  )
}
