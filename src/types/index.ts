/* ==========================================================================
   NexClaim Enterprise - TypeScript Interfaces & Domain Schemas
   ========================================================================== */

export type RoleType = 'ADMINISTRADOR' | 'GESTOR' | 'OPERADOR' | 'VISUALIZADOR';

export type ClaimStatus =
  | 'Novo'
  | 'Em análise'
  | 'Aguardando documentos'
  | 'Aguardando seguradora'
  | 'Em vistoria'
  | 'Em reparo'
  | 'Aguardando aprovação'
  | 'Resolvido'
  | 'Encerrado'
  | 'Cancelado';

export type PriorityType = 'Baixa' | 'Média' | 'Alta' | 'Crítica';

export type FineStatus = 'Pendente' | 'Em análise' | 'Contestada' | 'Paga' | 'Cancelada' | 'Vencida';

export interface Company {
  name: string;
  cnpjs?: string;
  address: string;
  phone: string;
  email: string;
  city: string;
  state: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: RoleType;
  avatar: string;
  department?: string;
}

export interface Vehicle {
  id: string;
  plate: string;
  prefix?: string;
  renavam: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  chassis?: string;
  owner?: string;
  defaultDriver?: string;
  status: 'Ativo' | 'Em Manutenção' | 'Inativo';
}

export interface Person {
  id: string;
  name: string;
  docNumber: string;
  phone: string;
  email: string;
  address: string;
  type: 'Condutor' | 'Proprietário' | 'Terceiro' | 'Testemunha' | 'Funcionário' | 'Responsável';
  notes?: string;
}

export interface Claim {
  id: string;
  claimNumber: string;
  protocol: string;
  status: ClaimStatus;
  priority: PriorityType;
  occurrenceType: string;
  date: string;
  time: string;
  location: string;
  city: string;
  state: string;
  description: string;
  vehicleId?: string;
  vehiclePlate: string;
  vehicleModel: string;
  driverId?: string;
  driverName: string;
  insurer?: string;
  policyNumber?: string;
  boNumber?: string;
  assignedUser: string;
  estimatedCost: number;
  approvedCost: number;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface Fine {
  id: string;
  claimId?: string;
  infractionCode?: string;
  infractionAuto: string;
  vehiclePlate: string;
  driverName: string;
  infractionDate?: string;
  infractionTime?: string;
  location?: string;
  description: string;
  amount: number;
  points: number;
  dueDate: string;
  status: FineStatus;
  notes?: string;
}

export interface DocumentTemplate {
  id: string;
  name: string;
  category: 'Responsabilidade' | 'Ciência' | 'Entrega' | 'Acordo' | 'Declaração' | 'Outros';
  conditionRules: {
    occurrenceType?: string;
    hasThirdParty?: boolean;
    hasFine?: boolean;
  };
  isActive: boolean;
  content: string;
  availableVariables: string[];
}

export interface Term {
  id: string;
  claimId?: string;
  templateId?: string;
  title: string;
  type: string;
  date: string;
  responsible: string;
  involvedPerson: string;
  status: 'Rascunho' | 'Gerado' | 'Assinado' | 'Cancelado';
  content?: string;
  htmlContent?: string;
}

export interface TimelineEvent {
  id: string;
  claimId: string;
  timestamp: string;
  user: string;
  actionType: string;
  description: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  userRole: RoleType;
  action: string;
  detail: string;
  ip?: string;
}
