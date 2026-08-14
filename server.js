const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'db.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const PUBLIC_DIR = path.join(__dirname, 'public');

// Ensure directories exist
if (!fs.existsSync(UPLOADS_DIR)) {
  try { fs.mkdirSync(UPLOADS_DIR, { recursive: true }); } catch (e) {}
}

// Default Trans Pinho Corporate Seed Data
const initialDatabase = {
  company: {
    name: 'JOÃO BATISTA DE SOUZA PINHO EPP (TRANS PINHO)',
    cnpjs: '12.345.678/0001-90',
    address: 'Rua Florida, 116 – Nossa Chácara – Gravataí/ RS',
    phone: '(051) 3047-0212 / 98266-0028',
    email: 'Transpinho@transpinho.com',
    city: 'Gravataí',
    state: 'RS'
  },
  users: [
    { id: 'usr-1', name: 'Carlos Pinho', email: 'carlos@transpinho.com', role: 'ADMINISTRADOR', avatar: 'CP', department: 'Gestão de Frotas' },
    { id: 'usr-2', name: 'Mariana Souza', email: 'mariana@transpinho.com', role: 'GESTOR', avatar: 'MS', department: 'Sinistros & Seguros' },
    { id: 'usr-3', name: 'Roberto Alves', email: 'roberto@transpinho.com', role: 'OPERADOR', avatar: 'RA', department: 'Operações' },
    { id: 'usr-4', name: 'Beatriz Lima', email: 'beatriz@transpinho.com', role: 'VISUALIZADOR', avatar: 'BL', department: 'Auditoria' }
  ],
  vehicles: [
    { id: 'veh-1', plate: 'JCO8C10', prefix: '24127', renavam: '01928374650', brand: 'Volkswagen', model: 'Constellation 24.280', year: 2024, color: 'Branco', chassis: '9BWBL3HE8RZ049182', owner: 'JOÃO BATISTA DE SOUZA PINHO EPP (TRANS PINHO)', defaultDriver: 'Andreia Mercedes Rocha de Araujo', status: 'Ativo' },
    { id: 'veh-2', plate: 'TRD3E72', prefix: '226', renavam: '82716354901', brand: 'Mercedes-Benz', model: 'Atego 1719', year: 2023, color: 'Prata', chassis: '9BWDB42B1PR018274', owner: 'JOÃO BATISTA DE SOUZA PINHO EPP (TRANS PINHO)', defaultDriver: 'Michele Rosa da Rosa', status: 'Ativo' },
    { id: 'veh-3', plate: 'ABC-8E19', prefix: '101', renavam: '55443322110', brand: 'Toyota', model: 'Corolla Cross 2.0 VRE', year: 2025, color: 'Prata', chassis: '9BGKS48U0SG918234', owner: 'JOÃO BATISTA DE SOUZA PINHO EPP (TRANS PINHO)', defaultDriver: 'João Carlos Silva', status: 'Ativo' }
  ],
  people: [
    { id: 'peo-1', name: 'ANDREIA MERCEDES ROCHA DE ARAUJO', docNumber: '002.574.880-73', phone: '(51) 99887-6655', email: 'andreia.araujo@transpinho.com', address: 'Gravataí/RS', type: 'Condutor', notes: 'CNH Categoria D. Prefixo de veículo: 24127' },
    { id: 'peo-2', name: 'MICHELE ROSA DA ROSA', docNumber: '016.998.180-02', phone: '(51) 98765-4321', email: 'michele.rosa@transpinho.com', address: 'Gravataí/RS', type: 'Condutor', notes: 'CNH Categoria C. Prefixo de veículo: 226' },
    { id: 'peo-3', name: 'João Carlos Silva', docNumber: '123.456.789-00', phone: '(51) 99123-4567', email: 'joao.silva@transpinho.com', address: 'Gravataí/RS', type: 'Condutor', notes: 'CNH Categoria B' }
  ],
  claims: [
    {
      id: 'claim-1',
      claimNumber: 'SIN-2026-00124',
      protocol: 'PROT-2026-881920',
      status: 'Em análise',
      priority: 'Alta',
      occurrenceType: 'Colisão Traseira com Avarias',
      date: '2026-06-15',
      time: '14:35',
      location: 'BR-116, km 270',
      city: 'Gravataí',
      state: 'RS',
      description: 'Colisão traseira envolvendo a unidade prefixo 24127 (Placa JCO8C10). Danos materiais na traseira e lanternas. Condutor Andreia Mercedes Rocha de Araujo ciente dos danos decorrentes.',
      vehicleId: 'veh-1',
      vehiclePlate: 'JCO8C10',
      vehicleModel: 'VW Constellation (Prefixo 24127)',
      driverId: 'peo-1',
      driverName: 'ANDREIA MERCEDES ROCHA DE ARAUJO',
      insurer: 'Porto Seguro Cia de Seguros',
      policyNumber: 'AP-99201928-01',
      boNumber: 'BO-RS-48912/2026',
      assignedUser: 'Mariana Souza',
      estimatedCost: 3500.00,
      approvedCost: 3500.00,
      createdAt: '2026-06-15T15:00:00.000Z',
      updatedAt: '2026-06-19T10:30:00.000Z',
      notes: 'Termo de ciência e autorização de desconto em folha assinado pelo condutor.'
    },
    {
      id: 'claim-2',
      claimNumber: 'SIN-2026-00125',
      protocol: 'PROT-2026-992011',
      status: 'Aguardando documentos',
      priority: 'Média',
      occurrenceType: 'Infração por Velocidade + NIC Duplicada',
      date: '2026-04-27',
      time: '10:44',
      location: 'Av. Dorival Cândido Luz de Oliveira, Gravataí/RS',
      city: 'Gravataí',
      state: 'RS',
      description: 'Auto EL00093302 (Transitar em velocidade superior em até 20% - R$ 130,16) e Multa de Não Indicação de Condutor (NIC - R$ 130,16). Total acumulado R$ 260,32. Condutor solicitou não indicar CNH e assumiu pagamento em dobro.',
      vehicleId: 'veh-1',
      vehiclePlate: 'JCO8C10',
      vehicleModel: 'VW Constellation (Prefixo 24127)',
      driverId: 'peo-1',
      driverName: 'ANDREIA MERCEDES ROCHA DE ARAUJO',
      insurer: 'N/A (Multa de Trânsito)',
      policyNumber: 'N/A',
      boNumber: 'N/A',
      assignedUser: 'Carlos Pinho',
      estimatedCost: 260.32,
      approvedCost: 260.32,
      createdAt: '2026-06-19T10:15:00.000Z',
      updatedAt: '2026-06-19T14:20:00.000Z',
      notes: 'Termo de Responsabilidade com quitação e parcelamento firmado em 19/06/2026.'
    },
    {
      id: 'claim-3',
      claimNumber: 'SIN-2026-00126',
      protocol: 'PROT-2026-102934',
      status: 'Resolvido',
      priority: 'Baixa',
      occurrenceType: 'Estacionamento Proibido',
      date: '2026-04-15',
      time: '16:50',
      location: 'Rua Florida, Gravataí/RS',
      city: 'Gravataí',
      state: 'RS',
      description: 'Auto TE02141677 - Estacionar em local/horário proibido pela sinalização. Veículo TRD3E72 (Prefixo 226). Condutor Michele Rosa da Rosa assumiu responsabilidade civil e administrativa.',
      vehicleId: 'veh-2',
      vehiclePlate: 'TRD3E72',
      vehicleModel: 'Mercedes-Benz Atego (Prefixo 226)',
      driverId: 'peo-2',
      driverName: 'MICHELE ROSA DA ROSA',
      insurer: 'N/A',
      policyNumber: 'N/A',
      boNumber: 'N/A',
      assignedUser: 'Roberto Alves',
      estimatedCost: 195.23,
      approvedCost: 195.23,
      createdAt: '2026-06-24T08:30:00.000Z',
      updatedAt: '2026-06-24T11:00:00.000Z',
      notes: 'Termo de Responsabilidade assinado em 24/06/2026.'
    }
  ],
  fines: [
    {
      id: 'fine-1',
      claimId: 'claim-2',
      infractionCode: 'EL00093302',
      infractionAuto: 'EL00093302',
      vehiclePlate: 'JCO8C10',
      driverName: 'ANDREIA MERCEDES ROCHA DE ARAUJO',
      infractionDate: '2026-04-27',
      infractionTime: '10:44',
      location: 'Av. Dorival Cândido Luz de Oliveira, Gravataí/RS',
      description: 'TRANSITAR EM VELOCIDADE SUPERIOR A MAXIMA PERMITIDA EM ATE 20%',
      amount: 130.16,
      points: 4,
      dueDate: '2026-07-06',
      status: 'Pendente',
      notes: 'Optou por cota única / parcelamento em 2x de R$ 130,16.'
    },
    {
      id: 'fine-2',
      claimId: 'claim-2',
      infractionCode: 'NIC-DUPLICADA',
      infractionAuto: 'Gerado Duplicada',
      vehiclePlate: 'JCO8C10',
      driverName: 'ANDREIA MERCEDES ROCHA DE ARAUJO',
      infractionDate: '2026-05-15',
      infractionTime: '00:00',
      location: 'Órgão Autuador',
      description: 'MULTA. POR NÃO IDENTIFICACAO DO CONDUTOR INFRATOR, IMPOSTA A PESSOA JURIDICA',
      amount: 130.16,
      points: 0,
      dueDate: '2026-07-06',
      status: 'Pendente',
      notes: 'Multa em dobro devido a não indicação solicitada pelo condutor.'
    },
    {
      id: 'fine-3',
      claimId: 'claim-3',
      infractionCode: 'TE02141677',
      infractionAuto: 'TE02141677',
      vehiclePlate: 'TRD3E72',
      driverName: 'MICHELE ROSA DA ROSA',
      infractionDate: '2026-04-15',
      infractionTime: '16:50',
      location: 'Rua Florida, Gravataí/RS',
      description: 'ESTACIONAR EM LOCAL/HORARIO PROIBIDO ESPECIFICAMENTE PELA SINALIZACAO',
      amount: 195.23,
      points: 5,
      dueDate: '2026-07-15',
      status: 'Paga',
      notes: 'Termo de responsabilidade quitado em 24/06/2026.'
    }
  ],
  documents: [
    {
      id: 'doc-1',
      claimId: 'claim-1',
      title: 'Termo de Ciência e Autorização de Desconto em Folha',
      category: 'Termo',
      fileType: 'application/pdf',
      fileSize: '450 KB',
      uploadDate: '2026-06-15',
      uploadedBy: 'Mariana Souza',
      notes: 'Assinado pelo condutor referente ao sinistro SIN-2026-00124',
      filePath: '/uploads/termo_desconto_folha_transpinho.pdf'
    },
    {
      id: 'doc-2',
      claimId: 'claim-2',
      title: 'Termo de Responsabilidade - Andreia Mercedes Rocha',
      category: 'Termo',
      fileType: 'application/pdf',
      fileSize: '520 KB',
      uploadDate: '2026-06-19',
      uploadedBy: 'Carlos Pinho',
      notes: 'Referente ao Auto EL00093302 e Multa NIC duplicada (R$ 260,32)',
      filePath: '/uploads/termo_responsabilidade_andreia.pdf'
    },
    {
      id: 'doc-3',
      claimId: 'claim-3',
      title: 'Termo de Responsabilidade - Michele Rosa da Rosa',
      category: 'Termo',
      fileType: 'application/pdf',
      fileSize: '380 KB',
      uploadDate: '2026-06-24',
      uploadedBy: 'Roberto Alves',
      notes: 'Referente ao Auto TE02141677 (Estacionamento proibido)',
      filePath: '/uploads/termo_responsabilidade_michele.pdf'
    }
  ],
  media: [
    {
      id: 'med-1',
      claimId: 'claim-1',
      title: 'Avaria Traseira VW Constellation Prefixo 24127',
      category: 'Danos',
      fileType: 'image/jpeg',
      fileSize: '2.4 MB',
      uploadDate: '2026-06-15',
      uploadedBy: 'ANDREIA MERCEDES ROCHA DE ARAUJO',
      description: 'Impacto traseiro no caminhão Trans Pinho em Gravataí/RS',
      url: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=800&q=80'
    }
  ],
  terms: [
    {
      id: 'trm-1',
      claimId: 'claim-1',
      title: 'TERMO DE CIÊNCIA E AUTORIZAÇÃO DE DESCONTO EM FOLHA DE PAGAMENTO',
      type: 'Termo de ciência e autorização de desconto',
      date: '2026-06-15',
      responsible: 'Mariana Souza',
      involvedPerson: 'ANDREIA MERCEDES ROCHA DE ARAUJO',
      status: 'Assinado',
      content: `JOÃO BATISTA DE SOUZA PINHO EPP (TRANS PINHO)\nRua Florida, 116 – Nossa Chácara – Gravataí/ RS\n(051) 3047-0212 / 98266-0028 | Transpinho@transpinho.com\n\nTERMO DE CIÊNCIA E AUTORIZAÇÃO DE DESCONTO EM FOLHA DE PAGAMENTO\n\nEu, ANDREIA MERCEDES ROCHA DE ARAUJO, inscrito no CPF sob nº 002.574.880-73, declaro, para os devidos fins de direito, na qualidade de condutor do veículo VW Constellation, placa JCO8C10, envolvido na ocorrência de trânsito nº SIN-2026-00124, que:\n\nI – Da ciência e reconhecimento da ocorrência:\nDeclaro estar plenamente ciente dos fatos relacionados à ocorrência acima descrita, bem como dos danos materiais dela decorrentes.\n\nII – Do reconhecimento de responsabilidade:\nReconheço minha responsabilidade pelos danos ocasionados em decorrência do referido evento, assumindo integralmente a obrigação referente ao ressarcimento dos prejuízos apurados, no valor total de R$ 3.500,00 (Três mil e quinhentos reais).\n\nIII – Da autorização de desconto em folha:\nAutorizo, de forma expressa, livre, consciente e inequívoca, o desconto do valor acima mencionado em minha folha de pagamento/contracheque em 5 parcelas mensais de R$ 700,00.\n\nGravataí, 15 de Junho de 2026.`
    },
    {
      id: 'trm-2',
      claimId: 'claim-2',
      title: 'TERMO DE RESPONSABILIDADE - MULTAS & NÃO INDICAÇÃO',
      type: 'Termo de Responsabilidade',
      date: '2026-06-19',
      responsible: 'Carlos Pinho',
      involvedPerson: 'ANDREIA MERCEDES ROCHA DE ARAUJO',
      status: 'Assinado',
      content: `JOÃO BATISTA DE SOUZA PINHO EPP (TRANS PINHO)\nRua Florida, 116 – Nossa Chácara – Gravataí/ RS\n\nTERMO DE RESPONSABILIDADE\n\n1. IDENTIFICAÇÃO DO CONDUTOR\nEu, ANDREIA MERCEDES ROCHA DE ARAUJO, portador do CPF nº 002.574.880-73, condutor do veículo Placa: JCO8C10 Prefixo do Carro: 24127.\n\n2. DETALHAMENTO DAS INFRAÇÕES E VALORES\n- Infração 01: Auto EL00093302 | Data: 27/04/2026 10:44 | TRANSITAR EM VELOCIDADE SUPERIOR A MAXIMA PERMITIDA EM ATE 20% | Valor: R$ 130,16\n- Infração 02: Auto Gerado Duplicada | MULTA POR NÃO INDENTIFICACAO DO CONTUDOR INFRATOR, IMPOSTA A PESSOA JURITICA | Valor: R$ 130,16\n\nO condutor reconhece a infração EL00093302. Considerando que o próprio condutor solicitou a não realização da indicação de condutor para transferência dos pontos da CNH, declara estar ciente e de acordo com o pagamento em dobro do valor original da multa, totalizando R$ 260,32.\n\nVALOR TOTAL ACUMULADO: R$ 260,32\n\n3. DA FORMA DE PAGAMENTO E PARCELAMENTO\nOpção: Parcelado em 2 parcelas de R$ 130,16 mensais. Primeira parcela em: 06/07/2026.\n\n4. DA RESPONSABILIDADE E QUITAÇÃO\nAssumo integral responsabilidade pelo pagamento. Ao concluir o pagamento total, outorgo à empresa João Batista de Souza Pinho EPP (Trans Pinho) a mais ampla quitação.\n\nGRAVATAÍ, 19 de Junho de 2026.`
    },
    {
      id: 'trm-3',
      claimId: 'claim-3',
      title: 'TERMO DE RESPONSABILIDADE - INFRAÇÃO DIRETA',
      type: 'Termo de Responsabilidade',
      date: '2026-06-24',
      responsible: 'Roberto Alves',
      involvedPerson: 'MICHELE ROSA DA ROSA',
      status: 'Assinado',
      content: `JOÃO BATISTA DE SOUZA PINHO EPP (TRANS PINHO)\nRua Florida, 116 – Nossa Chácara – Gravataí/ RS\n\nTERMO DE RESPONSABILIDADE\n\n1. IDENTIFICAÇÃO DO CONDUTOR\nEu, MICHELE ROSA DA ROSA, portador do CPF nº 016.998.180-02, condutor do veículo Placa: TRD3E72 Prefixo do Carro: 226.\n\n2. DETALHES DO OCORRIDO\n- Auto de Infração nº: TE02141677\n- Data: 15/04/2026 | Horário: 16:50\n- Motivo: ESTACIONAR EM LOCAL/HORARIO PROIBIDO ESPECIFICAMENTE PELA SINALIZACAO.\n\n3. DECLARAÇÃO DE RESPONSABILIDADE\nDeclaro e assumo total e integral responsabilidade civil e administrativa pelas infrações de trânsito ocorridas, isentando a empresa João Batista de Souza Pinho EPP (Trans Pinho) de qualquer responsabilidade.\n\nGRAVATAÍ, 24 de Junho de 2026.`
    }
  ],
  timelineEvents: [
    { id: 'evt-1', claimId: 'claim-1', timestamp: '2026-06-15T15:00:00.000Z', user: 'ANDREIA MERCEDES ROCHA DE ARAUJO', actionType: 'Criação do Sinistro', description: 'Registro de ocorrência com danos materiais no caminhão prefixo 24127 (JCO8C10).' },
    { id: 'evt-2', claimId: 'claim-1', timestamp: '2026-06-15T16:00:00.000Z', user: 'Mariana Souza', actionType: 'Inclusão de Termo', description: 'Termo de Ciência e Autorização de Desconto em Folha assinado pelo condutor.' },
    { id: 'evt-3', claimId: 'claim-2', timestamp: '2026-06-19T10:15:00.000Z', user: 'Carlos Pinho', actionType: 'Inclusão de Termo', description: 'Termo de Responsabilidade por infração EL00093302 e Multa NIC em dobro (R$ 260,32) gerado.' },
    { id: 'evt-4', claimId: 'claim-3', timestamp: '2026-06-24T08:30:00.000Z', user: 'Roberto Alves', actionType: 'Inclusão de Termo', description: 'Termo de Responsabilidade referente ao auto TE02141677 assinado por Michele Rosa da Rosa.' }
  ],
  notifications: [
    { id: 'not-1', title: 'Vencimento de Parcela de Multa', message: 'Primeira parcela do termo de Andreia Mercedes vence em 06/07/2026.', type: 'warning', date: '2026-06-19T08:00:00.000Z', read: false }
  ],
  auditLog: [
    { id: 'aud-1', timestamp: '2026-06-24T09:00:00.000Z', user: 'Carlos Pinho', userRole: 'ADMINISTRADOR', action: 'GENERATE_TERM', detail: 'Emissão do Termo de Responsabilidade oficial da Trans Pinho em Gravataí/RS.', ip: '127.0.0.1' }
  ]
};

function readDb() {
  if (!fs.existsSync(DB_FILE)) {
    try { fs.writeFileSync(DB_FILE, JSON.stringify(initialDatabase, null, 2), 'utf8'); } catch (e) {}
    return initialDatabase;
  }
  try {
    const content = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    return initialDatabase;
  }
}

function writeDb(data) {
  try { fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8'); } catch (err) {}
}

function logAudit(user, action, detail) {
  const db = readDb();
  const entry = {
    id: `aud-${Date.now()}`,
    timestamp: new Date().toISOString(),
    user: user ? user.name : 'Sistema',
    userRole: user ? user.role : 'SISTEMA',
    action,
    detail,
    ip: '127.0.0.1'
  };
  db.auditLog.unshift(entry);
  writeDb(db);
}

const handleRequest = (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-User-Role');

  if (method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  let bodyStr = '';
  req.on('data', chunk => { bodyStr += chunk; });
  req.on('end', () => {
    let body = {};
    if (bodyStr) {
      try { body = JSON.parse(bodyStr); } catch (e) { }
    }

    const sendJson = (data, status = 200) => {
      res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(data));
    };

    const sendError = (msg, status = 400) => { sendJson({ error: msg }, status); };

    const currentUserRole = req.headers['x-user-role'] || 'ADMINISTRADOR';
    const db = readDb();
    const currentUser = db.users.find(u => u.role === currentUserRole) || db.users[0];

    if (pathname.startsWith('/api/')) {
      if (pathname === '/api/company' && method === 'GET') return sendJson(db.company);
      if (pathname === '/api/claims' && method === 'GET') return sendJson(db.claims);
      if (pathname === '/api/fines' && method === 'GET') return sendJson(db.fines);
      if (pathname === '/api/documents' && method === 'GET') return sendJson(db.documents);
      if (pathname === '/api/media' && method === 'GET') return sendJson(db.media);
      if (pathname === '/api/terms' && method === 'GET') return sendJson(db.terms);
      if (pathname === '/api/people' && method === 'GET') return sendJson(db.people);
      if (pathname === '/api/vehicles' && method === 'GET') return sendJson(db.vehicles);
      if (pathname === '/api/timeline' && method === 'GET') return sendJson(db.timelineEvents);
      if (pathname === '/api/notifications' && method === 'GET') return sendJson(db.notifications);
      if (pathname === '/api/users' && method === 'GET') return sendJson(db.users);
      if (pathname === '/api/audit-log' && method === 'GET') return sendJson(db.auditLog);

      if (pathname.match(/^\/api\/claims\/([^\/]+)\/dossier$/) && method === 'GET') {
        const id = pathname.split('/')[3];
        const claim = db.claims.find(c => c.id === id || c.claimNumber === id) || db.claims[0];
        return sendJson({
          claim,
          timeline: db.timelineEvents.filter(t => t.claimId === claim.id),
          documents: db.documents.filter(d => d.claimId === claim.id),
          media: db.media.filter(m => m.claimId === claim.id),
          fines: db.fines.filter(f => f.claimId === claim.id),
          terms: db.terms.filter(t => t.claimId === claim.id),
          vehicle: db.vehicles.find(v => v.id === claim.vehicleId || v.plate === claim.vehiclePlate),
          driver: db.people.find(p => p.id === claim.driverId || p.name === claim.driverName)
        });
      }

      if (pathname === '/api/claims' && method === 'POST') {
        const newClaim = {
          id: `claim-${Date.now()}`,
          claimNumber: `SIN-2026-${Math.floor(10000 + Math.random() * 90000)}`,
          protocol: `PROT-2026-${Math.floor(100000 + Math.random() * 900000)}`,
          status: body.status || 'Novo',
          priority: body.priority || 'Média',
          occurrenceType: body.occurrenceType || 'Outros',
          date: body.date || new Date().toISOString().split('T')[0],
          time: body.time || '12:00',
          location: body.location || 'Gravataí/RS',
          city: body.city || 'Gravataí',
          state: body.state || 'RS',
          description: body.description || '',
          vehiclePlate: body.vehiclePlate || 'JCO8C10',
          vehicleModel: body.vehicleModel || 'VW Constellation (Prefixo 24127)',
          driverName: body.driverName || 'ANDREIA MERCEDES ROCHA DE ARAUJO',
          insurer: body.insurer || 'Porto Seguro',
          policyNumber: body.policyNumber || 'AP-99201928',
          boNumber: body.boNumber || 'BO-RS-48912',
          assignedUser: currentUser.name,
          estimatedCost: parseFloat(body.estimatedCost) || 0,
          approvedCost: parseFloat(body.approvedCost) || 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          notes: body.notes || ''
        };
        db.claims.unshift(newClaim);
        writeDb(db);
        logAudit(currentUser, 'CREATE_CLAIM', `Criou o sinistro ${newClaim.claimNumber} para o veículo ${newClaim.vehiclePlate}.`);
        return sendJson(newClaim, 201);
      }

      if (pathname === '/api/terms/generate' && method === 'POST') {
        const { claimId, templateType, title, customContent, involvedPerson } = body;
        const claim = db.claims.find(c => c.id === claimId) || db.claims[0];
        const newTerm = {
          id: `trm-${Date.now()}`,
          claimId: claim ? claim.id : 'claim-1',
          title: title || `${templateType} - ${claim ? claim.claimNumber : ''}`,
          type: templateType || 'Termo de Responsabilidade',
          date: new Date().toISOString().split('T')[0],
          responsible: currentUser.name,
          involvedPerson: involvedPerson || (claim ? claim.driverName : 'ANDREIA MERCEDES ROCHA DE ARAUJO'),
          status: 'Assinado',
          content: customContent || 'Termo gerado com sucesso.',
          documentName: `Termo_${Date.now()}.pdf`
        };
        db.terms.unshift(newTerm);
        writeDb(db);
        logAudit(currentUser, 'GENERATE_TERM', `Gerou o termo oficial Trans Pinho: ${newTerm.title}.`);
        return sendJson(newTerm, 201);
      }

      return sendError('Endpoint não encontrado.', 404);
    }

    let reqPath = pathname === '/' ? '/index.html' : pathname;
    let filePath = path.join(PUBLIC_DIR, reqPath);

    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.html': 'text/html; charset=utf-8',
      '.js': 'text/javascript; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.json': 'application/json; charset=utf-8',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.svg': 'image/svg+xml',
      '.pdf': 'application/pdf'
    };

    fs.stat(filePath, (err, stats) => {
      if (err || !stats.isFile()) {
        const indexPath = path.join(PUBLIC_DIR, 'index.html');
        if (fs.existsSync(indexPath)) {
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          return fs.createReadStream(indexPath).pipe(res);
        }
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404 Not Found');
        return;
      }
      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'text/plain' });
      fs.createReadStream(filePath).pipe(res);
    });
  });
};

const server = http.createServer(handleRequest);
module.exports = handleRequest;

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}
