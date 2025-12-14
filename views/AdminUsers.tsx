import React, { useState, useEffect } from 'react';
import { getUsers, addUser, removeUser } from '../services/authService';
import { User, UserRole } from '../types';
import { Plus, Trash2, Shield, User as UserIcon, AlertTriangle } from 'lucide-react';

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    role: 'operator' as UserRole
  });
  const [error, setError] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    setUsers(getUsers());
  };

  const handleDelete = (id: string) => {
    try {
      removeUser(id);
      loadUsers();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!formData.username || !formData.password || !formData.name) {
      setError('Todos los campos son obligatorios');
      return;
    }

    try {
      addUser(formData);
      setFormData({ name: '', username: '', password: '', role: 'operator' }); // Reset
      loadUsers();
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Administración de Usuarios</h2>
          <p className="text-slate-500">Crea y gestiona los accesos a la plataforma.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Formulario de Creación */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit">
           <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
             <Plus size={20} className="text-blue-500" /> Nuevo Usuario
           </h3>
           
           {error && (
             <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100 flex items-center gap-2">
               <AlertTriangle size={16}/> {error}
             </div>
           )}

           <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase">Nombre Completo</label>
                <input 
                  type="text" 
                  className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="Ej. Juan Pérez"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase">Usuario</label>
                <input 
                  type="text" 
                  className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.username}
                  onChange={e => setFormData({...formData, username: e.target.value})}
                  placeholder="Ej. jperez"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase">Contraseña</label>
                <input 
                  type="password" 
                  className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  placeholder="••••••"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase">Rol / Permisos</label>
                <select 
                   className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                   value={formData.role}
                   onChange={e => setFormData({...formData, role: e.target.value as UserRole})}
                >
                   <option value="operator">Operador (Ver Dashboard)</option>
                   <option value="admin">Administrador (Control Total)</option>
                </select>
              </div>

              <button 
                type="submit"
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors mt-2"
              >
                Crear Usuario
              </button>
           </form>
        </div>

        {/* Lista de Usuarios */}
        <div className="lg:col-span-2 space-y-4">
           {users.map(user => (
             <div key={user.id} className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center space-x-4">
                   <div className={`p-3 rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-500'}`}>
                      {user.role === 'admin' ? <Shield size={24} /> : <UserIcon size={24} />}
                   </div>
                   <div>
                      <h4 className="font-bold text-slate-800">{user.name}</h4>
                      <div className="flex items-center space-x-2 text-sm text-slate-500">
                         <span>@{user.username}</span>
                         <span className="text-slate-300">•</span>
                         <span className={`uppercase text-xs font-bold ${user.role === 'admin' ? 'text-purple-600' : 'text-slate-500'}`}>
                            {user.role}
                         </span>
                      </div>
                   </div>
                </div>
                
                <button 
                  onClick={() => handleDelete(user.id)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Eliminar usuario"
                >
                   <Trash2 size={20} />
                </button>
             </div>
           ))}
        </div>

      </div>
    </div>
  );
};
