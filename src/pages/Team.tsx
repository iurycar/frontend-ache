import React, { useState } from 'react';
import Layout from '../components/Layout';
import { Users, Mail, Phone, MapPin, Plus, Edit2, Trash2, UserPlus, Award, Clock } from 'lucide-react';
import TeamMemberModal from '../components/TeamMemberModal';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  location: string;
  avatar?: string;
  status: 'active' | 'inactive' | 'vacation';
  joinDate: Date;
  tasksCompleted: number;
  currentProjects: number;
  skills: string[];
}

const Team: React.FC = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'Ana Silva',
      role: 'Gerente de Projetos',
      department: 'Desenvolvimento',
      email: 'ana.silva@empresa.com.br',
      phone: '(11) 99999-1234',
      location: 'São Paulo, SP',
      status: 'active',
      joinDate: new Date(2022, 0, 15),
      tasksCompleted: 127,
      currentProjects: 3,
      skills: ['Gestão de Projetos', 'Scrum', 'Liderança']
    },
    {
      id: '2',
      name: 'Carlos Santos',
      role: 'Desenvolvedor Senior',
      department: 'Tecnologia',
      email: 'carlos.santos@empresa.com.br',
      phone: '(11) 99999-5678',
      location: 'São Paulo, SP',
      status: 'active',
      joinDate: new Date(2021, 5, 10),
      tasksCompleted: 89,
      currentProjects: 2,
      skills: ['React', 'Node.js', 'TypeScript', 'SQL']
    },
    {
      id: '3',
      name: 'Maria Oliveira',
      role: 'Designer UX/UI',
      department: 'Design',
      email: 'maria.oliveira@empresa.com.br',
      phone: '(11) 99999-9012',
      location: 'Rio de Janeiro, RJ',
      status: 'vacation',
      joinDate: new Date(2023, 2, 20),
      tasksCompleted: 45,
      currentProjects: 1,
      skills: ['Figma', 'Adobe XD', 'Prototipagem', 'Design System']
    },
    {
      id: '4',
      name: 'João Pereira',
      role: 'Analista de Qualidade',
      department: 'Qualidade',
      email: 'joao.pereira@empresa.com.br',
      phone: '(11) 99999-3456',
      location: 'Belo Horizonte, MG',
      status: 'active',
      joinDate: new Date(2022, 8, 5),
      tasksCompleted: 156,
      currentProjects: 4,
      skills: ['Testes Automatizados', 'QA', 'Selenium', 'JIRA']
    }
  ]);

  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

  const getStatusColor = (status: TeamMember['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'vacation':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: TeamMember['status']) => {
    switch (status) {
      case 'active':
        return 'Ativo';
      case 'inactive':
        return 'Inativo';
      case 'vacation':
        return 'Férias';
      default:
        return status;
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const calculateWorkDays = (joinDate: Date) => {
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - joinDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleAddMember = () => {
    setEditingMember(null);
    setShowAddModal(true);
  };

  const handleEditMember = (member: TeamMember) => {
    setEditingMember(member);
    setShowAddModal(true);
  };

  const handleSaveMember = (memberData: Omit<TeamMember, 'id' | 'tasksCompleted' | 'currentProjects'>) => {
    if (editingMember) {
      // Editar membro existente
      setTeamMembers(prev => prev.map(member => 
        member.id === editingMember.id 
          ? { 
              ...memberData, 
              id: editingMember.id,
              tasksCompleted: editingMember.tasksCompleted,
              currentProjects: editingMember.currentProjects
            }
          : member
      ));
    } else {
      // Adicionar novo membro
      const newMember: TeamMember = {
        ...memberData,
        id: `member-${Date.now()}`,
        tasksCompleted: 0,
        currentProjects: 0
      };
      setTeamMembers(prev => [...prev, newMember]);
    }
  };

  const handleDeleteMember = (memberId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este membro da equipe?')) {
      setTeamMembers(prev => prev.filter(member => member.id !== memberId));
    }
  };

  return (
    <Layout title="Equipe">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">Gerenciamento de Equipe</h2>
            <p className="text-gray-600 dark:text-gray-400">Gerencie membros da equipe e suas atribuições</p>
          </div>
          
          <button 
            onClick={handleAddMember}
            className="btn btn-primary flex items-center"
          >
            <UserPlus size={16} className="mr-2" />
            Adicionar Membro
          </button>
        </div>

        {/* Team Statistics */}
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
                  {teamMembers.filter(m => m.status === 'active').length}
                </h3>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-primary bg-opacity-10 p-3 rounded-full mr-4">
                <Clock className="text-primary" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Projetos Ativos</p>
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {teamMembers.reduce((sum, member) => sum + member.currentProjects, 0)}
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
                  {teamMembers.reduce((sum, member) => sum + member.tasksCompleted, 0)}
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teamMembers.map((member) => (
            <div key={member.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-primary bg-opacity-10 rounded-full flex items-center justify-center text-primary font-semibold mr-3">
                    {getInitials(member.name)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{member.name}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{member.role}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(member.status)}`}>
                  {getStatusText(member.status)}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Mail size={14} className="mr-2" />
                  {member.email}
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Phone size={14} className="mr-2" />
                  {member.phone}
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <MapPin size={14} className="mr-2" />
                  {member.location}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-lg font-semibold text-primary">{member.tasksCompleted}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Tarefas Concluídas</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-primary">{member.currentProjects}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Projetos Ativos</div>
                </div>
              </div>

              <div className="mb-4">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Habilidades:</div>
                <div className="flex flex-wrap gap-1">
                  {member.skills.slice(0, 3).map((skill, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded">
                      {skill}
                    </span>
                  ))}
                  {member.skills.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded">
                      +{member.skills.length - 3}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Na empresa há {Math.floor(calculateWorkDays(member.joinDate) / 365)} anos
                </div>
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

        {/* Department Overview */}
  <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6">
          <h3 className="font-medium text-lg mb-4">Visão por Departamento</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from(new Set(teamMembers.map(m => m.department))).map(dept => {
              const deptMembers = teamMembers.filter(m => m.department === dept);
              return (
                <div key={dept} className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">{dept}</h4>
                  <div className="text-2xl font-semibold text-primary mb-1">
                    {deptMembers.length}
                  </div>
                  <div className="text-sm text-gray-500">
                    {deptMembers.filter(m => m.status === 'active').length} ativos
                  </div>
                  <div className="mt-2">
                    <div className="flex -space-x-2">
                      {deptMembers.slice(0, 3).map(member => (
                        <div 
                          key={member.id}
                          className="w-8 h-8 bg-primary bg-opacity-10 rounded-full flex items-center justify-center text-primary text-xs font-semibold border-2 border-white"
                        >
                          {getInitials(member.name)}
                        </div>
                      ))}
                      {deptMembers.length > 3 && (
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 text-xs border-2 border-white">
                          +{deptMembers.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal de Membro da Equipe */}
      <TeamMemberModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleSaveMember}
        member={editingMember}
      />
    </Layout>
  );
};

export default Team;