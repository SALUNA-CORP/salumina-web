'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, User } from 'lucide-react';

interface NetworkSearchProps {
  users: Array<{
    id: string;
    full_name: string;
    email: string;
    referral_code: string;
    status: string;
  }>;
}

export function NetworkSearch({ users }: NetworkSearchProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [showResults, setShowResults] = useState(false);

  const filteredUsers = search.trim()
    ? users.filter(
        (user) =>
          user.full_name?.toLowerCase().includes(search.toLowerCase()) ||
          user.email?.toLowerCase().includes(search.toLowerCase()) ||
          user.referral_code?.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  const handleSelectUser = (userId: string) => {
    router.push(`/admin/network?userId=${userId}`);
    setSearch('');
    setShowResults(false);
  };

  const handleReset = () => {
    router.push('/admin/network');
    setSearch('');
    setShowResults(false);
  };

  return (
    <div className="relative">
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar por nombre, email o código..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => setShowResults(true)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" onClick={handleReset}>
          Ver Toda la Red
        </Button>
      </div>

      {/* Search Results Dropdown */}
      {showResults && search.trim() && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
          {filteredUsers.length > 0 ? (
            <div className="p-2">
              {filteredUsers.slice(0, 10).map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleSelectUser(user.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-lg text-left transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {user.full_name}
                    </p>
                    <p className="text-sm text-gray-500 truncate">{user.email}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs font-mono font-semibold text-gray-700">
                      {user.referral_code}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        user.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : user.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {user.status === 'approved'
                        ? 'Activo'
                        : user.status === 'pending'
                        ? 'Pendiente'
                        : 'Inactivo'}
                    </span>
                  </div>
                </button>
              ))}
              {filteredUsers.length > 10 && (
                <p className="text-sm text-gray-500 text-center py-2">
                  Mostrando 10 de {filteredUsers.length} resultados
                </p>
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No se encontraron usuarios</p>
            </div>
          )}
        </div>
      )}

      {/* Overlay to close dropdown */}
      {showResults && search.trim() && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowResults(false)}
        />
      )}
    </div>
  );
}
