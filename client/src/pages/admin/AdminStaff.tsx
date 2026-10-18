import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  Plus,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  X,
  FileText,
  KeyRound,
  RotateCcw,
} from 'lucide-react';

export const AdminStaff: React.FC = () => {
  const { token, isSuperAdmin } = useAuth();

  const [staff, setStaff] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'STAFF' | 'AUDIT'>('STAFF');
  const [isLoading, setIsLoading] = useState(true);

  // Add staff modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('BARISTA');
  const [phone, setPhone] = useState('');

  const fetchData = async () => {
    try {
      const [staffRes, logsRes] = await Promise.all([
        fetch('/api/staff', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/staff/audit-logs', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const staffData = await staffRes.json();
      const logsData = await logsRes.json();
      setStaff(staffData);
      setAuditLogs(logsData);
    } catch (err) {
      console.error('Fetch staff error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const toggleStaffStatus = async (id: string, currentActive: boolean) => {
    try {
      const res = await fetch(`/api/staff/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ active: !currentActive }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error('Toggle staff status error:', err);
    }
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password || password.length < 6) {
      alert('Name, email, and password (min 6 chars) are required.');
      return;
    }

    try {
      const res = await fetch('/api/staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          role,
          phone: phone.trim() || null,
        }),
      });

      if (res.ok) {
        setIsAddModalOpen(false);
        setName('');
        setEmail('');
        setPassword('');
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to create staff account');
      }
    } catch (err) {
      alert('Error adding staff account');
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="p-8 text-center text-stone-400">
        <Shield className="w-12 h-12 text-amber-500 mx-auto mb-2 opacity-50" />
        <h2 className="font-serif text-xl font-bold text-white">Super Admin Access Only</h2>
        <p className="text-xs">You do not have permission to manage staff roles or view audit trails.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-amber-100 flex items-center gap-2.5">
            <Users className="w-6 h-6 text-amber-500" />
            <span>Staff Roster & Security Audit Logs</span>
          </h1>
          <p className="text-xs text-stone-400">
            Manage cafe accounts, role permissions, and review tamper-evident administrative logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'STAFF' && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Staff Member</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveTab('STAFF')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'STAFF'
              ? 'bg-amber-600 text-stone-950 shadow-md'
              : 'bg-stone-950 text-stone-400 hover:text-white border border-stone-800'
          }`}
        >
          Active Staff Roster ({staff.length})
        </button>

        <button
          onClick={() => setActiveTab('AUDIT')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'AUDIT'
              ? 'bg-amber-600 text-stone-950 shadow-md'
              : 'bg-stone-950 text-stone-400 hover:text-white border border-stone-800'
          }`}
        >
          Security Audit Logs ({auditLogs.length})
        </button>
      </div>

      {/* Tab: Staff Roster */}
      {activeTab === 'STAFF' && (
        <div className="bg-stone-950 rounded-3xl border border-stone-800 overflow-hidden shadow-lg">
          <table className="w-full text-left text-xs text-stone-300">
            <thead className="bg-stone-900 text-stone-400 font-semibold border-b border-stone-800 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Staff Name</th>
                <th className="py-3.5 px-3">Email Address</th>
                <th className="py-3.5 px-3">Role</th>
                <th className="py-3.5 px-3">Phone</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/80">
              {staff.map((u) => (
                <tr key={u.id} className="hover:bg-stone-900/50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-amber-100 flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-black text-xs">
                      {u.name.charAt(0)}
                    </div>
                    <span>{u.name}</span>
                  </td>
                  <td className="py-3.5 px-3 text-stone-300">{u.email}</td>
                  <td className="py-3.5 px-3">
                    <span className="bg-stone-900 px-2 py-1 rounded-lg text-amber-300 border border-amber-900/40 text-[10px] font-mono font-bold">
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-stone-400">{u.phone || 'N/A'}</td>
                  <td className="py-3.5 px-3">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        u.active
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {u.active ? 'Active' : 'Deactivated'}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    {u.role !== 'SUPER_ADMIN' && (
                      <button
                        onClick={() => toggleStaffStatus(u.id, u.active)}
                        className={`px-3 py-1 rounded-xl text-[11px] font-bold cursor-pointer transition-colors ${
                          u.active
                            ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                        }`}
                      >
                        {u.active ? 'Deactivate' : 'Activate'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab: Security Audit Logs */}
      {activeTab === 'AUDIT' && (
        <div className="bg-stone-950 rounded-3xl border border-stone-800 overflow-hidden shadow-lg">
          <table className="w-full text-left text-xs text-stone-300">
            <thead className="bg-stone-900 text-stone-400 font-semibold border-b border-stone-800 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-3">Action</th>
                <th className="py-3.5 px-3">Details</th>
                <th className="py-3.5 px-3">Admin / User</th>
                <th className="py-3.5 px-3">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/80">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-stone-900/50 transition-colors font-mono text-[11px]">
                  <td className="py-3 px-4 text-stone-400">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-bold text-amber-400">{log.action}</span>
                  </td>
                  <td className="py-3 px-3 text-stone-300 font-sans">{log.details}</td>
                  <td className="py-3 px-3 text-stone-400">{log.userEmail || 'System'}</td>
                  <td className="py-3 px-3 text-stone-500">{log.ipAddress || '127.0.0.1'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Staff Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-stone-950 border border-stone-800 rounded-3xl max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-amber-100">Add Staff Account</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-stone-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStaff} className="space-y-3 text-xs">
              <div>
                <label className="text-stone-300 font-semibold block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-stone-300 font-semibold block mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="staff@theaftab.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-stone-300 font-semibold block mb-1">Password * (Min 6 chars)</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-stone-300 font-semibold block mb-1">Role / Department</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-white focus:outline-none"
                >
                  <option value="MANAGER">Manager (Menu, Reports, Staff)</option>
                  <option value="BARISTA">Head Barista / Kitchen Staff (Prep Queue, Stock)</option>
                  <option value="SERVICE_STAFF">Service Staff (Table Delivery, Served)</option>
                  <option value="CASHIER">Cashier (Billing, Settlement)</option>
                </select>
              </div>

              <div>
                <label className="text-stone-300 font-semibold block mb-1">Phone Number (Optional)</label>
                <input
                  type="tel"
                  placeholder="+91 98765 00000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-white focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-2 rounded-xl bg-stone-900 text-stone-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
