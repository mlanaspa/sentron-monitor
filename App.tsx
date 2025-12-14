import React, { useState, useEffect } from 'react';
import { Dashboard } from './views/Dashboard';
import { HistoryExport } from './views/HistoryExport';
import { AiAnalyst } from './views/AiAnalyst';
import { Settings } from './views/Settings';
import { Login } from './views/Login';
import { AdminUsers } from './views/AdminUsers';
import { AppView, User } from './types';
import { initializeAuth } from './services/authService';
import { LayoutDashboard, FileClock, Bot, Settings as SettingsIcon, Zap, LogOut, Users, ShieldCheck } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Inicializar auth (crear admin default) al arrancar
  useEffect(() => {
    initializeAuth();
    // Comprobar si hay sesión guardada (opcional, por seguridad aquí pedimos login al refrescar)
    // Para persistir login entre F5, podríamos guardar el usuario en localStorage o sessionStorage.
    // Por ahora, pedimos login cada vez que se abre la app para más seguridad.
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentView(AppView.DASHBOARD);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView(AppView.LOGIN);
  };

  // Si no hay usuario, mostrar Login
  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  const renderView = () => {
    switch (currentView) {
      case AppView.DASHBOARD:
        return <Dashboard />;
      case AppView.HISTORY:
        return <HistoryExport />;
      case AppView.AI_ANALYST:
        return <AiAnalyst />;
      case AppView.SETTINGS:
        return <Settings />;
      case AppView.ADMIN_USERS:
        return currentUser.role === 'admin' ? <AdminUsers /> : <Dashboard />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white hidden md:flex flex-col shadow-xl">
        <div className="p-6 border-b border-slate-800 flex items-center space-x-3">
          <div className="bg-blue-600 p-2 rounded-lg">
             <Zap size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Sentron Pi</h1>
            <p className="text-xs text-slate-400">Siemens PAC 3200 Monitor</p>
          </div>
        </div>

        {/* User Info Mini Card */}
        <div className="px-6 py-4 bg-slate-800/50 flex items-center space-x-3 border-b border-slate-800">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${currentUser.role === 'admin' ? 'bg-purple-600' : 'bg-slate-600'}`}>
                {currentUser.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
                <p className="text-sm font-medium truncate">{currentUser.name}</p>
                <p className="text-xs text-slate-400 capitalize">{currentUser.role}</p>
            </div>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          <button
            onClick={() => setCurrentView(AppView.DASHBOARD)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              currentView === AppView.DASHBOARD ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <LayoutDashboard size={20} />
            <span className="font-medium">Dashboard</span>
          </button>

          <button
            onClick={() => setCurrentView(AppView.HISTORY)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              currentView === AppView.HISTORY ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <FileClock size={20} />
            <span className="font-medium">Histórico / CSV</span>
          </button>

          <button
            onClick={() => setCurrentView(AppView.AI_ANALYST)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              currentView === AppView.AI_ANALYST ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Bot size={20} />
            <span className="font-medium">Asistente AI</span>
          </button>

          <div className="pt-4 mt-4 border-t border-slate-800">
             <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Administración</p>
             
             <button
                onClick={() => setCurrentView(AppView.SETTINGS)}
                className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
                  currentView === AppView.SETTINGS ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <SettingsIcon size={18} />
                <span className="text-sm font-medium">Conexiones</span>
              </button>

             {currentUser.role === 'admin' && (
               <button
                  onClick={() => setCurrentView(AppView.ADMIN_USERS)}
                  className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
                    currentView === AppView.ADMIN_USERS ? 'bg-purple-900/50 text-purple-200' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Users size={18} />
                  <span className="text-sm font-medium">Usuarios</span>
                </button>
             )}
          </div>
        </nav>

        <div className="p-4 border-t border-slate-800">
           <button 
             onClick={handleLogout}
             className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg bg-red-900/20 text-red-400 hover:bg-red-900/40 transition-colors"
           >
              <LogOut size={18} />
              <span className="text-sm font-medium">Cerrar Sesión</span>
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center shadow-md z-10">
           <div className="flex items-center space-x-2">
             <Zap size={20} className="text-blue-500" />
             <span className="font-bold">Sentron Pi</span>
           </div>
           <div className="flex items-center gap-3">
              <span className="text-xs bg-slate-800 px-2 py-1 rounded">{currentUser.username}</span>
              <button onClick={handleLogout} className="text-red-400"><LogOut size={20}/></button>
           </div>
        </header>
        
        {/* Mobile Nav (Simplificado para móvil) */}
        <div className="md:hidden bg-slate-800 flex justify-around p-2">
            <button onClick={() => setCurrentView(AppView.DASHBOARD)} className={`p-2 ${currentView === AppView.DASHBOARD ? 'text-blue-400' : 'text-slate-400'}`}><LayoutDashboard size={24}/></button>
            <button onClick={() => setCurrentView(AppView.HISTORY)} className={`p-2 ${currentView === AppView.HISTORY ? 'text-blue-400' : 'text-slate-400'}`}><FileClock size={24}/></button>
            {currentUser.role === 'admin' && (
                <button onClick={() => setCurrentView(AppView.ADMIN_USERS)} className={`p-2 ${currentView === AppView.ADMIN_USERS ? 'text-purple-400' : 'text-slate-400'}`}><Users size={24}/></button>
            )}
             <button onClick={() => setCurrentView(AppView.SETTINGS)} className={`p-2 ${currentView === AppView.SETTINGS ? 'text-blue-400' : 'text-slate-400'}`}><SettingsIcon size={24}/></button>
        </div>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50 relative">
          {renderView()}
        </main>
      </div>
    </div>
  );
};

export default App;
