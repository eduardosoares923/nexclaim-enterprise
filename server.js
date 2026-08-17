import http from 'http';
import fs from 'fs';
import path from 'path';
import url, { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'db.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const PUBLIC_DIR = path.join(__dirname, 'public');

if (!fs.existsSync(UPLOADS_DIR)) {
  try { fs.mkdirSync(UPLOADS_DIR, { recursive: true }); } catch (e) {}
}

// Clean Real Trans Pinho Database (Zero Dummy Placeholders)
const initialDatabase = {
  company: {
    name: 'JOÃO BATISTA DE SOUZA PINHO EPP (TRANS PINHO)',
    address: 'Rua Florida, 116 – Nossa Chácara – Gravataí/ RS',
    phone: '(051) 3047-0212 / 98266-0028',
    email: 'Transpinho@transpinho.com',
    city: 'Gravataí',
    state: 'RS'
  },
  users: [
    { id: 'usr-1', name: 'Carlos Pinho', email: 'carlos@transpinho.com', role: 'ADMINISTRADOR', avatar: 'CP', department: 'Gestão de Frotas' },
    { id: 'usr-2', name: 'Mariana Souza', email: 'mariana@transpinho.com', role: 'GESTOR', avatar: 'MS', department: 'Sinistros & Seguros' }
  ],
  vehicles: [
    { id: 'veh-1', plate: 'JCO8C10', prefix: '24127', renavam: '01928374650', brand: 'Volkswagen', model: 'Constellation 24.280', year: 2024, color: 'Branco', owner: 'JOÃO BATISTA DE SOUZA PINHO EPP (TRANS PINHO)', defaultDriver: 'ANDREIA MERCEDES ROCHA DE ARAUJO', status: 'Ativo' },
    { id: 'veh-2', plate: 'TRD3E72', prefix: '226', renavam: '82716354901', brand: 'Mercedes-Benz', model: 'Atego 1719', year: 2023, color: 'Prata', owner: 'JOÃO BATISTA DE SOUZA PINHO EPP (TRANS PINHO)', defaultDriver: 'MICHELE ROSA DA ROSA', status: 'Ativo' }
  ],
  people: [
    { id: 'peo-1', name: 'ANDREIA MERCEDES ROCHA DE ARAUJO', docNumber: '002.574.880-73', phone: '(51) 99887-6655', email: 'andreia.araujo@transpinho.com', address: 'Gravataí/RS', type: 'Condutor', notes: 'CNH Categoria D. Prefixo: 24127' },
    { id: 'peo-2', name: 'MICHELE ROSA DA ROSA', docNumber: '016.998.180-02', phone: '(51) 98765-4321', email: 'michele.rosa@transpinho.com', address: 'Gravataí/RS', type: 'Condutor', notes: 'CNH Categoria C. Prefixo: 226' }
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
      description: 'Ocorrência com a unidade prefixo 24127 (Placa JCO8C10). Avarias traseiras. Condutor Andreia Mercedes Rocha de Araujo ciente dos fatos e danos decorrentes.',
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
      description: 'Auto EL00093302 (Velocidade superior a 20% - R$ 130,16) e Multa por Não Indicação de Condutor (NIC - R$ 130,16). Total acumulado R$ 260,32. Condutor solicitou não indicar CNH e assumiu pagamento em dobro.',
      vehicleId: 'veh-1',
      vehiclePlate: 'JCO8C10',
      vehicleModel: 'VW Constellation (Prefixo 24127)',
      driverId: 'peo-1',
      driverName: 'ANDREIA MERCEDES ROCHA DE ARAUJO',
      insurer: 'N/A',
      policyNumber: 'N/A',
      boNumber: 'N/A',
      assignedUser: 'Carlos Pinho',
      estimatedCost: 260.32,
      approvedCost: 260.32,
      createdAt: '2026-06-19T10:15:00.000Z',
      updatedAt: '2026-06-19T14:20:00.000Z',
      notes: 'Termo de Responsabilidade firmado com parcelamento em 2x.'
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
      assignedUser: 'Carlos Pinho',
      estimatedCost: 195.23,
      approvedCost: 195.23,
      createdAt: '2026-06-24T08:30:00.000Z',
      updatedAt: '2026-06-24T11:00:00.000Z',
      notes: 'Termo de Responsabilidade assinado.'
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
      status: 'Pendente'
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
      status: 'Pendente'
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
      status: 'Paga'
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
      responsible: 'Carlos Pinho',
      involvedPerson: 'MICHELE ROSA DA ROSA',
      status: 'Assinado',
      content: `JOÃO BATISTA DE SOUZA PINHO EPP (TRANS PINHO)\nRua Florida, 116 – Nossa Chácara – Gravataí/ RS\n\nTERMO DE RESPONSABILIDADE\n\n1. IDENTIFICAÇÃO DO CONDUTOR\nEu, MICHELE ROSA DA ROSA, portador do CPF nº 016.998.180-02, condutor do veículo Placa: TRD3E72 Prefixo do Carro: 226.\n\n2. DETALHES DO OCORRIDO\n- Auto de Infração nº: TE02141677\n- Data: 15/04/2026 | Horário: 16:50\n- Motivo: ESTACIONAR EM LOCAL/HORARIO PROIBIDO ESPECIFICAMENTE PELA SINALIZACAO.\n\n3. DECLARAÇÃO DE RESPONSABILIDADE\nDeclaro e assumo total e integral responsabilidade civil e administrativa pelas infrações de trânsito ocorridas, isentando a empresa João Batista de Souza Pinho EPP (Trans Pinho) de qualquer responsabilidade.\n\nGRAVATAÍ, 24 de Junho de 2026.`
    }
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
    const db = readDb();

    if (pathname.startsWith('/api/')) {
      if (pathname === '/api/claims' && method === 'GET') return sendJson(db.claims);
      if (pathname === '/api/fines' && method === 'GET') return sendJson(db.fines);
      if (pathname === '/api/terms' && method === 'GET') return sendJson(db.terms);
      if (pathname === '/api/people' && method === 'GET') return sendJson(db.people);
      if (pathname === '/api/vehicles' && method === 'GET') return sendJson(db.vehicles);

      if (pathname.match(/^\/api\/claims\/([^\/]+)\/dossier$/) && method === 'GET') {
        const id = pathname.split('/')[3];
        const claim = db.claims.find(c => c.id === id || c.claimNumber === id) || db.claims[0];
        return sendJson({
          claim,
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
          insurer: 'Porto Seguro',
          policyNumber: 'AP-99201928',
          boNumber: 'BO-RS-48912',
          assignedUser: 'Carlos Pinho',
          estimatedCost: parseFloat(body.estimatedCost) || 0,
          approvedCost: parseFloat(body.approvedCost) || 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        db.claims.unshift(newClaim);
        writeDb(db);
        return sendJson(newClaim, 201);
      }

      if (pathname === '/api/terms/generate' && method === 'POST') {
        const { claimId, templateType, title, customContent, involvedPerson } = body;
        const claim = db.claims.find(c => c.id === claimId) || db.claims[0];
        const newTerm = {
          id: `trm-${Date.now()}`,
          claimId: claim ? claim.id : 'claim-1',
          title: title || `${templateType} - Trans Pinho`,
          type: templateType || 'Termo de Responsabilidade',
          date: new Date().toISOString().split('T')[0],
          responsible: 'Carlos Pinho',
          involvedPerson: involvedPerson || 'ANDREIA MERCEDES ROCHA DE ARAUJO',
          status: 'Assinado',
          content: customContent || 'Termo gerado com sucesso.'
        };
        db.terms.unshift(newTerm);
        writeDb(db);
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
      '.svg': 'image/svg+xml'
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

if (process.argv[1] === __filename) {
  server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

export default handleRequest;
