import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { Users, Mail, Phone, MapPin, Award, UserPlus, Edit2, Trash2, Briefcase } from 'lucide-react';
import TeamMemberModal, { TeamMember as ModalMember } from '../components/TeamMemberModal';

interface TeamMember {
  id: string;                  // user_id
  name: string;                // first_name + last_name
  role: string;                // role
  team: string;                // nome da equipe
  email: string;               // email
  phone: string;               // cellphone
  location: string;            // address (street, city/state/country)
  status: 'active' | 'inactive';
  tasksCompleted: number;      // completed_tasks
}

const Team: React.FC = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamName, setTeamName] = useState<string>('');
  const [ongoingProjects, setOngoingProjects] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('/api/team/info', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        });
        if (!res.ok) throw new Error('Falha ao carregar informações da equipe');
        const json = await res.json();
        const employees = Array.isArray(json?.employees) ? json.employees : [];

        const tName: string = employees?.[0]?.team_name || '';
        const ongo: number = Number(employees?.[0]?.ongoing_projects || 0);
        setTeamName(tName);
        setOngoingProjects(ongo);

        const mapped: TeamMember[] = employees.map((e: any) => {
          const first = (e?.first_name || '').trim();
          const last = (e?.last_name || '').trim();
          const street = e?.address?.street || '';
          const city = e?.address?.city || '';
          const state = e?.address?.state || '';
          const country = e?.address?.country || '';
          const location = [street, city, state, country].filter(Boolean).join(', ') || country || '';

          const activeRaw = e?.active;
          const isActive =
            activeRaw === true ||
            activeRaw === 1 ||
            activeRaw === '1' ||
            String(activeRaw).toLowerCase() === 'true';

          return {
            id: String(e?.user_id || ''),
            name: `${first} ${last}`.trim() || (e?.email || ''),
            role: String(e?.role || ''),
            team: tName || 'Equipe',
            email: String(e?.email || ''),
            phone: String(e?.cellphone || ''),
            location,
            status: isActive ? 'active' : 'inactive',
            tasksCompleted: Number(e?.completed_tasks || 0),
          };
        });

        setTeamMembers(mapped);
      } catch {
        setError('Não foi possível carregar os dados da equipe.');
        setTeamMembers([]);
        setOngoingProjects(0);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const getStatusColor = (status: TeamMember['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: TeamMember['status']) => {
    switch (status) {
      case 'active':
        return 'Ativo';
      case 'inactive':
      default:
        return 'Inativo';
    }
  };

  const getInitials = (name: string) => {
    const initials = name
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .join('')
      .toUpperCase();
    return initials.slice(0, 3);
  };

  const handleAddMember = () => {
    setEditingMember(null);
    setShowAddModal(true);
  };

  const handleEditMember = (member: TeamMember) => {
    setEditingMember(member);
    setShowAddModal(true);
  };

  const handleSaveMember = (memberData: Omit<ModalMember, 'id' | 'tasksCompleted'>) => {
    if (editingMember) {
      // editar existente
      setTeamMembers(prev =>
        prev.map(m =>
          m.id === editingMember.id
            ? {
                ...m,
                ...memberData,
              }
            : m
        )
      );
    } else {
      // adicionar novo
      const newMember: TeamMember = {
        id: `member-${Date.now()}`,
        tasksCompleted: 0,
        ...memberData,
      };
      setTeamMembers(prev => [...prev, newMember]);
    }
    setShowAddModal(false);
    setEditingMember(null);
  };

  const handleDeleteMember = (memberId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este membro da equipe?')) {
      setTeamMembers(prev => prev.filter(m => m.id !== memberId));
    }
  };

  return (
    <Layout title="Equipe">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">Gerenciamento de Equipe</h2>
            <p className="text-gray-600 dark:text-gray-400">
              {teamName ? `Equipe: ${teamName}` : 'Gerencie membros da equipe e suas atribuições'}
            </p>
          </div>
          <button
            onClick={handleAddMember}
            className="btn btn-primary flex items-center"
          >
            <UserPlus size={16} className="mr-2" />
            Adicionar Membro
          </button>
        </div>

        {/* Loading / Error */}
        {loading && (
          <div className="text-gray-600 dark:text-gray-300">Carregando informações da equipe...</div>
        )}
        {error && (
          <div className="text-red-600 dark:text-red-400">{error}</div>
        )}

        {/* Team Statistics */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-full mr-4">
                  <Users className="text-blue-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total de Membros</p>
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">{teamMembers.length}</h3>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-full mr-4">
                  <Award className="text-green-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Membros Ativos</p>
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {teamMembers.filter((m) => m.status === 'active').length}
                  </h3>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="bg-primary bg-opacity-10 p-3 rounded-full mr-4">
                  <Briefcase className="text-red-200" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Projetos Ativos</p>
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {ongoingProjects}
                  </h3>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="bg-yellow-100 p-3 rounded-full mr-4">
                  <Award className="text-yellow-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Tarefas Concluídas</p>
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {teamMembers.reduce((sum, m) => sum + (m.tasksCompleted || 0), 0)}
                  </h3>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Team Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-primary bg-opacity-10 rounded-full flex items-center justify-center font-semibold mr-3 text-white">
                      {getInitials(member.name)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{member.name}</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">{member.role}</p>
                      <p className="text-gray-500 dark:text-gray-500 text-xs">{member.team}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${member.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {member.status === 'active' ? 'Ativo' : 'Inativo'}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Mail size={14} className="mr-2" />
                    {member.email || '—'}
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Phone size={14} className="mr-2" />
                    {member.phone || '—'}
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <MapPin size={14} className="mr-2" />
                    {member.location || '—'}
                  </div>
                </div>

                {/* Apenas "Tarefas Concluídas" centralizado */}
                <div className="grid grid-cols-1 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-primary">{member.tasksCompleted}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Tarefas Concluídas</div>
                  </div>
                </div>

                {/* Rodapé com botões antigos (ícones) */}
                <div className="flex justify-end items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditMember(member)}
                      className="text-primary hover:text-primary-light transition-colors"
                      title="Editar membro"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteMember(member.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                      title="Excluir membro"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Membro da Equipe */}
      <TeamMemberModal
        isOpen={showAddModal}
        onClose={() => { setShowAddModal(false); setEditingMember(null); }}
        onSave={handleSaveMember}
        member={editingMember as unknown as ModalMember | null}
      />
    </Layout>
  );
};

export default Team;