import { User } from '../types';

const USERS_KEY = 'sentron_users';

// Usuario por defecto si no existe ninguno
const DEFAULT_ADMIN: User = {
  id: 'admin-1',
  username: 'admin',
  password: '123', // Contraseña por defecto
  role: 'admin',
  name: 'Administrador Global'
};

export const initializeAuth = () => {
  const users = localStorage.getItem(USERS_KEY);
  if (!users) {
    localStorage.setItem(USERS_KEY, JSON.stringify([DEFAULT_ADMIN]));
  }
};

export const getUsers = (): User[] => {
  const users = localStorage.getItem(USERS_KEY);
  return users ? JSON.parse(users) : [DEFAULT_ADMIN];
};

export const addUser = (newUser: Omit<User, 'id'>) => {
  const users = getUsers();
  if (users.find(u => u.username === newUser.username)) {
    throw new Error('El nombre de usuario ya existe');
  }
  
  const user: User = {
    ...newUser,
    id: Date.now().toString()
  };
  
  users.push(user);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  return user;
};

export const removeUser = (id: string) => {
  const users = getUsers();
  // Evitar borrar el último admin
  const admins = users.filter(u => u.role === 'admin');
  const target = users.find(u => u.id === id);
  
  if (target?.role === 'admin' && admins.length <= 1) {
    throw new Error('No puedes borrar al último administrador');
  }

  const newUsers = users.filter(u => u.id !== id);
  localStorage.setItem(USERS_KEY, JSON.stringify(newUsers));
};

export const login = (username: string, password: string): User | null => {
  initializeAuth();
  const users = getUsers();
  const user = users.find(u => u.username === username && u.password === password);
  return user || null;
};
