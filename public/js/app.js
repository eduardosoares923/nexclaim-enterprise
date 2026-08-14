/* ==========================================================================
   NexClaim Enterprise - Trans Pinho Focused Engine (Pixel-Perfect PDF Terms & OS)
   ========================================================================== */

(function () {
  const defaultCompany = {
    name: 'JOÃO BATISTA DE SOUZA PINHO EPP (TRANS PINHO)',
    address: 'Rua Florida, 116 – Nossa Chácara – Gravataí/ RS',
    phone: '(051) 3047-0212 / 98266-0028',
    email: 'Transpinho@transpinho.com',
    city: 'Gravataí',
    state: 'RS'
  };

  const materialsList = [
    "Lixas", "Discos de polimento", "Discos de corte", "Discos de desbaste", "Fita crepe",
    "Papel de mascaramento", "Lonas plásticas", "Massa poliéster", "Massa plástica", "Massa rápida",
    "Primer PU", "Wash Primer", "Selador", "Tinta poliéster", "Tinta PU", "Verniz",
    "Catalisador", "Thinner", "Desengraxante", "Massa de polir", "Líquido lustrador", "Cera",
    "Boinas", "Copos de mistura", "Coadores", "Panos pega-poeira", "Fita dupla-face",
    "Arame para solda", "Gás para solda", "Eletrodos", "Rebites", "Presilhas", "Parafusos",
    "Porcas", "Vedador KPO", "Cola de para-brisa", "Adesivo estrutural", "Chapas de aço",
    "Óleo de motor", "Óleo de câmbio", "Fluido de freio", "Fluido de direção", "Aditivo de radiador",
    "Descarbonizante", "Limpa-contatos", "Desengripante", "Silicone de vedação", "Trava química",
    "Graxa", "Filtro de óleo", "Filtro de combustível", "Filtro de ar", "Pastilhas de freio",
    "Velas de ignição", "Correias", "Lâmpadas", "Abraçadeiras", "Estopa", "Panos de microfibra",
    "Pasta desengraxante", "Serragem", "Manta de Fibra de Vidro", "Disco Flap 80", "Endurecedor PU"
  ];

  const defaultSeedClaims = [
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
      vehiclePlate: 'JCO8C10',
      vehicleModel: 'VW Constellation (Prefixo 24127)',
      driverName: 'ANDREIA MERCEDES ROCHA DE ARAUJO',
      insurer: 'Porto Seguro Cia de Seguros',
      policyNumber: 'AP-99201928-01',
      boNumber: 'BO-RS-48912/2026',
      assignedUser: 'Mariana Souza',
      estimatedCost: 3500.00,
      approvedCost: 3500.00,
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
      vehiclePlate: 'JCO8C10',
      vehicleModel: 'VW Constellation (Prefixo 24127)',
      driverName: 'ANDREIA MERCEDES ROCHA DE ARAUJO',
      insurer: 'N/A',
      policyNumber: 'N/A',
      boNumber: 'N/A',
      assignedUser: 'Carlos Pinho',
      estimatedCost: 260.32,
      approvedCost: 260.32,
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
      vehiclePlate: 'TRD3E72',
      vehicleModel: 'Mercedes-Benz Atego (Prefixo 226)',
      driverName: 'MICHELE ROSA DA ROSA',
      insurer: 'N/A',
      policyNumber: 'N/A',
      boNumber: 'N/A',
      assignedUser: 'Carlos Pinho',
      estimatedCost: 195.23,
      approvedCost: 195.23,
      notes: 'Termo de Responsabilidade assinado.'
    }
  ];

  const defaultSeedFines = [
    { id: 'fine-1', infractionAuto: 'EL00093302', vehiclePlate: 'JCO8C10', driverName: 'ANDREIA MERCEDES ROCHA DE ARAUJO', description: 'TRANSITAR EM VELOCIDADE SUPERIOR A MAXIMA PERMITIDA EM ATE 20%', amount: 130.16, points: 4, dueDate: '2026-07-06', status: 'Pendente' },
    { id: 'fine-2', infractionAuto: 'Gerado Duplicada', vehiclePlate: 'JCO8C10', driverName: 'ANDREIA MERCEDES ROCHA DE ARAUJO', description: 'MULTA. POR NÃO IDENTIFICACAO DO CONDUTOR INFRATOR, IMPOSTA A PESSOA JURIDICA', amount: 130.16, points: 0, dueDate: '2026-07-06', status: 'Pendente' },
    { id: 'fine-3', infractionAuto: 'TE02141677', vehiclePlate: 'TRD3E72', driverName: 'MICHELE ROSA DA ROSA', description: 'ESTACIONAR EM LOCAL/HORARIO PROIBIDO ESPECIFICAMENTE PELA SINALIZACAO', amount: 195.23, points: 5, dueDate: '2026-07-15', status: 'Paga' }
  ];

  const defaultSeedPeople = [
    { id: 'peo-1', name: 'ANDREIA MERCEDES ROCHA DE ARAUJO', docNumber: '002.574.880-73', phone: '(51) 99887-6655', email: 'andreia.araujo@transpinho.com', address: 'Gravataí/RS', type: 'Condutor', notes: 'CNH Categoria D. Prefixo: 24127' },
    { id: 'peo-2', name: 'MICHELE ROSA DA ROSA', docNumber: '016.998.180-02', phone: '(51) 98765-4321', email: 'michele.rosa@transpinho.com', address: 'Gravataí/RS', type: 'Condutor', notes: 'CNH Categoria C. Prefixo: 226' },
    { id: 'peo-3', name: 'GELSON WEBER DE FARIAS', docNumber: '629.109.220-49', phone: '(51) 99332-1144', email: 'gelson.farias@transpinho.com', address: 'Gravataí/RS', type: 'Condutor', notes: 'Micro-ônibus Placa: HKO8087' },
    { id: 'peo-4', name: 'MARCELO TEIXEIRA DA SILVA', docNumber: '031.997.250-07', phone: '(51) 98112-9900', email: 'marcelo.silva@transpinho.com', address: 'Gravataí/RS', type: 'Condutor', notes: 'Marcopolo Volare W9C Placa: IZF4E82' }
  ];

  const defaultSeedVehicles = [
    { id: 'veh-1', plate: 'JCO8C10', prefix: '24127', renavam: '01928374650', brand: 'Volkswagen', model: 'Constellation 24.280', year: 2024, color: 'Branco', status: 'Ativo' },
    { id: 'veh-2', plate: 'TRD3E72', prefix: '226', renavam: '82716354901', brand: 'Mercedes-Benz', model: 'Atego 1719', year: 2023, color: 'Prata', status: 'Ativo' },
    { id: 'veh-3', plate: 'HKO8087', prefix: '1961', renavam: '99281726351', brand: 'Marcopolo', model: 'Micro-ônibus', year: 2022, color: 'Branco', status: 'Ativo' },
    { id: 'veh-4', plate: 'IZF4E82', prefix: '1980', renavam: '44556677889', brand: 'Marcopolo', model: 'Volare W9C ON', year: 2025, color: 'Branco', status: 'Ativo' },
    { id: 'veh-5', plate: 'TQQ6H24', prefix: '2026', renavam: '33445566771', brand: 'Renault', model: 'Master Van TVAN', year: 2026, color: 'Branca', status: 'Ativo' }
  ];

  const defaultSeedTemplates = [
    {
      id: 'tmpl-1',
      name: 'Termo de Responsabilidade (Multas & NIC Duplicada)',
      category: 'Responsabilidade',
      isActive: true,
      conditionRules: { occurrenceType: 'velocidade_nic' },
      availableVariables: ['{{nome_condutor}}', '{{cpf_condutor}}', '{{placa}}', '{{prefixo}}', '{{data_sinistro}}', '{{valor_total}}'],
      content: `TERMO DE RESPONSABILIDADE\n\n1. IDENTIFICAÇÃO DO CONDUTOR\nEu, {{nome_condutor}}, portador do CPF de nº {{cpf_condutor}}, na qualidade de condutor dos veículos abaixo identificado:\n• Placa: {{placa}}    Prefixo do Carro: {{prefixo}}\n\n2. DETALHAMENTO DAS INFRAÇÕES E VALORES\n• Infração 01:\n  o Auto de Infração nº: EL00093302\n  o Data: {{data_sinistro}} | Horário: 10:44\n  o Motivo/Enquadramento: TRANSITAR EM VELOCIDADE SUPERIOR A MAXIMA PERMITIDA EM ATE 20%\n  o Valor: R$ 130,16\n• Infração 02:\n  o Auto de Infração nº: Gerado Duplicada\n  o Data: | Horário:\n  o Motivo/Enquadramento: MULTA. POR NÃO IDENTIFICACAO DO CONDUTOR INFRATOR, IMPOSTA A PESSOA JURIDICA\n  o Valor: R$ 130,16\n\nO condutor reconhece a infração nº EL00093302. Considerando que o próprio condutor solicitou a não realização da indicação de condutor para transferência dos pontos da CNH, por não desejar o registro de pontos em sua carteira de habilitação, declara estar ciente e de acordo com o pagamento em dobro do valor original da multa, totalizando {{valor_total}}, assumindo integral responsabilidade pela nova infração gerada.\n\nVALOR TOTAL ACUMULADO: {{valor_total}}\n\n3. DA FORMA DE PAGAMENTO E PARCELAMENTO\nO condutor declara-se ciente do débito total acima mencionado e opta pela seguinte modalidade de quitação:\n☐ Cota Única: Vencimento em 06/07/2026\n☑ Parcelado: Em 2 parcelas de R$ 130,16 Mensais.\nPrimeira parcela em: 06/07/2026\n\n4. DA RESPONSABILIDADE E QUITAÇÃO\nAssumo integral responsabilidade civil e administrativa pelo pagamento dos valores aqui descritos. Ao concluir o pagamento total, outorgo à empresa João Batista de Souza Pinho EPP (Trans Pinho) a mais ampla, geral e irrevogável quitação, para nada mais declarar em juízo ou fora dele, operando-se a sub-rogação de direitos em favor da referida Trans Pinho.\n\nGRAVATAÍ, {{data_sinistro}}.\n\n\n___________________________________________\n{{nome_condutor}}\n\nJOÃO BATISTA DE SOUZA PINHO EPP (TRANS PINHO)\nRua Florida, 116 – Nossa Chácara – Gravataí/ RS\n(051) 3047-0212 / 98266-0028 | Transpinho@transpinho.com`
    },
    {
      id: 'tmpl-2',
      name: 'Termo de Responsabilidade (Infração Direta)',
      category: 'Responsabilidade',
      isActive: true,
      conditionRules: { occurrenceType: 'estacionamento_proibido' },
      availableVariables: ['{{nome_condutor}}', '{{cpf_condutor}}', '{{placa}}', '{{prefixo}}', '{{data_sinistro}}'],
      content: `TERMO DE RESPONSABILIDADE\n\n1. IDENTIFICAÇÃO DO CONDUTOR\nEu, {{nome_condutor}} portador(a) do CPF nº {{cpf_condutor}}, na qualidade de condutor(a) do veículo abaixo identificado:\n• Placa: {{placa}}\n• Prefixo do Carro: {{prefixo}}\n\n2. DETALHES DO OCORRIDO\n• Auto de Infração nº: TE02141677\n• Data do ocorrido: 15/04/2026\n• Horário: 16:50\n• Motivo (Enquadramento): ESTACIONAR EM LOCAL/HORARIO PROIBIDO ESPECIFICAMENTE PELA SINALIZACAO.\n\n3. DECLARAÇÃO DE RESPONSABILIDADE\nDeclaro e assumo total e integral responsabilidade civil e administrativa pelas infrações de trânsito ocorridas com o veículo acima descritos, bem como por todas as consequências decorrentes destes atos. Confirmo ter total ciência da natureza e gravidade das referidas infrações, isentando a empresa João Batista de Souza Pinho EPP (Trans Pinho) de qualquer responsabilidade sobre as mesmas, uma vez que decorreram da minha conduta direta na condução do veículo.\n\nGRAVATAÍ, {{data_sinistro}}.\n\n\n___________________________________________\nAssinatura do Condutor\n{{nome_condutor}}\n\nJOÃO BATISTA DE SOUZA PINHO EPP (TRANS PINHO)\nRua Florida, 116 – Nossa Chácara – Gravataí/ RS\n(051) 3047-0212 / 98266-0028 | Transpinho@transpinho.com`
    },
    {
      id: 'tmpl-3',
      name: 'Termo de Ciência e Autorização de Desconto em Folha (Geral)',
      category: 'Ciência',
      isActive: true,
      conditionRules: { occurrenceType: 'colisao' },
      availableVariables: ['{{nome_condutor}}', '{{cpf_condutor}}', '{{placa}}', '{{valor_total}}', '{{data_sinistro}}'],
      content: `TERMO DE CIÊNCIA E AUTORIZAÇÃO DE DESCONTO EM FOLHA DE PAGAMENTO\n\nEu, {{nome_condutor}}, inscrito no CPF sob nº {{cpf_condutor}}, declaro, para os devidos fins de direito, na qualidade de condutor do veículo VW Constellation, placa {{placa}}, envolvido na ocorrência de trânsito nº SIN-2026-00124, que:\n\nI – Da ciência e reconhecimento da ocorrência\nDeclaro estar plenamente ciente dos fatos relacionados à ocorrência acima descrita, bem como dos danos materiais dela decorrentes.\n\nII – Do reconhecimento de responsabilidade\nReconheço minha responsabilidade pelos danos ocasionados em decorrência do referido evento, assumindo integralmente a obrigação referente ao ressarcimento dos prejuízos apurados, no valor total de {{valor_total}}.\n\nIII – Da autorização de desconto em folha\nAutorizo, de forma expressa, livre, consciente e inequívoca, nos termos da legislação aplicável e do acordo firmado entre as partes, o desconto do valor acima mencionado em minha folha de pagamento/contracheque, mediante o seguinte parcelamento:\n\nValor total: {{valor_total}}\nParcelamento: 05 (cinco) parcelas mensais e sucessivas de R$ 700,00\n\nDeclaro que assino o presente instrumento por minha livre e espontânea vontade, sem qualquer vício de consentimento, estando ciente de todos os seus termos, efeitos e consequências jurídicas.\n\nGravataí, {{data_sinistro}}\n\n___________________________________________\n{{nome_condutor}}`
    },
    {
      id: 'tmpl-4',
      name: 'Termo de Quitação (Chapeação e Reparos Sinistro)',
      category: 'Quitação',
      isActive: true,
      conditionRules: { occurrenceType: 'quitacao_chapeacao' },
      availableVariables: ['{{nome_condutor}}', '{{cpf_condutor}}', '{{placa}}', '{{num_ocorrencia}}', '{{data_sinistro}}', '{{data_documento}}'],
      content: `TERMO DE QUITAÇÃO\n\nEu, {{nome_condutor}}, inscrito(a) no CPF nº {{cpf_condutor}}, proprietário(a)/condutor(a) do micro-ônibus placa {{placa}}, declaro, para todos os fins de direito, estar de pleno acordo com os reparos realizados em meu veículo...`
    },
    {
      id: 'tmpl-5',
      name: 'Termo de Desconto em Folha (Acordo com Terceiro Envolvido)',
      category: 'Ciência',
      isActive: true,
      conditionRules: { occurrenceType: 'colisao_terceiro' },
      availableVariables: ['{{nome_condutor}}', '{{cpf_condutor}}', '{{placa}}', '{{veiculo_terceiro}}', '{{placa_terceiro}}', '{{valor_total}}'],
      content: `TERMO DE CIÊNCIA E AUTORIZAÇÃO DE DESCONTO EM FOLHA DE PAGAMENTO\n\nEu, {{nome_condutor}}, inscrito no CPF sob nº {{cpf_condutor}}, condutor do veículo {{placa}}, envolvido na ocorrência com {{veiculo_terceiro}} placa {{placa_terceiro}}...`
    }
  ];

  // Standardized Term Generator Function: Every single term follows the exact official layout & footer
  function buildTermHtml(term) {
    const standardFooter = `
      <div class="doc-footer">
        <strong>JOÃO BATISTA DE SOUZA PINHO EPP (TRANS PINHO)</strong><br>
        Rua Florida, 116 – Nossa Chácara – Gravataí/ RS<br>
        (051) 3047-0212 / 98266-0028 | Transpinho@transpinho.com
      </div>
    `;

    // 1. TERMO DE QUITAÇÃO (Gelson Weber de Farias - Sinistro / Chapeação)
    if (term.templateType === 'termo_quitacao' || term.type === 'Termo de Quitação') {
      return `
        <div class="doc-body">
          <div style="text-align: right; margin-bottom: 12px;">
            <img src="/images/logo.png" alt="Trans Pinho" style="height: 55px; display: inline-block;" />
          </div>

          <div class="title">TERMO DE QUITAÇÃO</div>

          <p>
            Eu, <strong>${term.involvedPerson}</strong>, inscrito(a) no CPF nº <strong>${term.cpf || '629.109.220-49'}</strong>, proprietário(a)/condutor(a) do micro-ônibus placa <strong>${term.plate || 'HKO8087'}</strong>, declaro, para todos os fins de direito, estar de pleno acordo com os reparos realizados em meu veículo, decorrentes do sinistro ocorrido em ${term.sinisterDate || '18/06/2026'}, registrado sob a ocorrência nº <strong>${term.claimNumber || '2026 0624 5995 797'}</strong>, os quais foram executados na chapeação da empresa <strong>JOÃO BATISTA DE SOUZA PINHO EPP – TRANS PINHO</strong>, bem como com o custeio, por esta empresa, da confecção e aplicação dos adesivos necessários para o restabelecimento das características originais do veículo.
          </p>

          <p style="margin-top: 8px;">
            Declaro que os serviços foram executados de forma satisfatória e atendem integralmente ao que foi acordado entre as partes, considerando plenamente reparados os danos decorrentes do sinistro.
          </p>

          <p style="margin-top: 8px;">
            Por meio deste instrumento, concedo à <strong>JOÃO BATISTA DE SOUZA PINHO EPP – TRANS PINHO</strong>, inscrita no CNPJ nº <strong>94.476.207/0001-80</strong>, plena, geral, irrevogável e irretratável quitação, nada mais tendo a reclamar ou exigir, judicial ou extrajudicialmente, a qualquer título, em relação aos fatos, danos, prejuízos, obrigações e eventuais desdobramentos decorrentes do referido sinistro.
          </p>

          <p style="margin-top: 8px;">
            Declaro, ainda, que o presente termo é firmado por minha livre e espontânea vontade, com plena ciência de seus efeitos legais, dando quitação integral, rasa, geral, irrevogável e irretratável sobre os fatos aqui descritos.
          </p>

          <p style="margin-top: 8px;">
            Por estarem justas e acordadas, as partes firmam o presente instrumento para que produza todos os seus efeitos legais.
          </p>

          <p style="margin-top: 18px; text-align: center;">
            Gravataí/RS, ${term.documentDate || '31 de julho de 2026'}.
          </p>

          <div class="signature-section" style="margin-top: 22px;">
            <div class="signature-line"></div>
            <div class="signature-name">${term.involvedPerson}</div>
            <div class="signature-sub">CPF: ${term.cpf || '629.109.220-49'}</div>
          </div>
        </div>
        ${standardFooter}
      `;
    }

    // 2. TERMO DE DESCONTO EM FOLHA COM TERCEIRO ENVOLVIDO (Marcelo Teixeira da Silva / Renault Master)
    if (term.templateType === 'desconto_folha_terceiro') {
      const numParc = term.installments || 15;
      const total = term.totalAmount || 2200.00;
      const valParc = term.installmentAmount || (total / numParc);

      return `
        <div class="doc-body">
          <div style="text-align: right; margin-bottom: 12px;">
            <img src="/images/logo.png" alt="Trans Pinho" style="height: 55px; display: inline-block;" />
          </div>

          <div class="title">TERMO DE CIÊNCIA E AUTORIZAÇÃO DE DESCONTO EM FOLHA DE PAGAMENTO</div>

          <p>
            Eu, <strong>${term.involvedPerson}</strong>, inscrito no CPF sob nº <strong>${term.cpf || '031.997.250-07'}</strong>, declaro, para os devidos fins de direito, na qualidade de condutor do veículo <strong>${term.vehicleModel || 'MARCOPOLO/VOLARE W9C ON'}</strong>, placa <strong>${term.plate || 'IZF4E82'}</strong>, envolvido na ocorrência de trânsito nº <strong>${term.claimNumber || '2026 0713 3731 277'}</strong>, envolvendo o veículo <strong>${term.thirdPartyVehicle || 'RENAULT/MASTER TVAN'}</strong>, placa <strong>${term.thirdPartyPlate || 'TQQ6H24'}</strong>, que:
          </p>

          <div class="section-title">I – Da ciência e reconhecimento da ocorrência</div>
          <p>
            Declaro estar plenamente ciente dos fatos relacionados à ocorrência acima descrita, bem como dos danos materiais dela decorrentes.
          </p>

          <div class="section-title">II – Do reconhecimento de responsabilidade</div>
          <p>
            Reconheço minha responsabilidade pelos danos ocasionados em decorrência do referido evento, assumindo integralmente a obrigação referente ao ressarcimento dos prejuízos apurados, no valor total de <strong>${formatCurrency(total)} (${term.totalAmountText || 'Dois mil e duzentos reais'})</strong>.
          </p>

          <div class="section-title">III – Da autorização de desconto em folha</div>
          <p>
            Autorizo, de forma expressa, livre, consciente e inequívoca, nos termos da legislação aplicável e do acordo firmado entre as partes, o desconto do valor acima mencionado em minha folha de pagamento/contracheque, mediante o seguinte parcelamento:
          </p>

          <p style="margin-left: 20px; font-weight: bold; margin: 8px 0;">
            Valor total: ${formatCurrency(total)}<br>
            Parcelamento: ${numParc} parcelas mensais e sucessivas de ${formatCurrency(valParc)}<br>
            Data do primeiro pagamento: ${term.firstDueDate || '07/08/2026'}
          </p>

          <p style="margin-top: 10px;">
            Declaro que assino o presente instrumento por minha livre e espontânea vontade, sem qualquer vício de consentimento, estando ciente de todos os seus termos, efeitos e consequências jurídicas.
          </p>

          <p style="margin-top: 16px; margin-bottom: 20px;">
            Gravataí, ${term.documentDate || '14 de Agosto de 2026'}.
          </p>

          <div class="signature-section">
            <div class="signature-line"></div>
            <div class="signature-name">${term.involvedPerson}</div>
            <div class="signature-sub">CPF: ${term.cpf || '031.997.250-07'}</div>
          </div>
        </div>
        ${standardFooter}
      `;
    }

    // 3. TERMO DE CIÊNCIA E DESCONTO EM FOLHA (Geral / Andreia Mercedes)
    if (term.templateType === 'desconto_folha' || term.type === 'Termo de ciência e autorização de desconto') {
      const isParc = term.paymentMode === 'parcelado';
      const parcelText = isParc 
        ? `0${term.installments || 5} (${term.installments === 5 ? 'cinco' : term.installments}) parcelas mensais e sucessivas de ${formatCurrency(term.installmentAmount || (term.totalAmount / (term.installments || 5)))}`
        : `Cota Única com desconto integral no valor de ${formatCurrency(term.totalAmount)}`;

      return `
        <div class="doc-body">
          <div style="text-align: right; margin-bottom: 12px;">
            <img src="/images/logo.png" alt="Trans Pinho" style="height: 55px; display: inline-block;" />
          </div>

          <div class="title">TERMO DE CIÊNCIA E AUTORIZAÇÃO DE DESCONTO EM FOLHA DE PAGAMENTO</div>

          <p>
            Eu, <strong>${term.involvedPerson}</strong>, inscrito no CPF sob nº <strong>${term.cpf || '002.574.880-73'}</strong>, declaro, para os devidos fins de direito, na qualidade de condutor do veículo <strong>VW Constellation</strong>, placa <strong>${term.plate || 'JCO8C10'}</strong>, envolvido na ocorrência de trânsito nº <strong>SIN-2026-00124</strong>, que:
          </p>

          <div class="section-title">I – Da ciência e reconhecimento da ocorrência</div>
          <p>
            Declaro estar plenamente ciente dos fatos relacionados à ocorrência acima descrita, bem como dos danos materiais dela decorrentes.
          </p>

          <div class="section-title">II – Do reconhecimento de responsabilidade</div>
          <p>
            Reconheço minha responsabilidade pelos danos ocasionados em decorrência do referido evento, assumindo integralmente a obrigação referente ao ressarcimento dos prejuízos apurados, no valor total de <strong>${formatCurrency(term.totalAmount || 3500)}</strong>.
          </p>

          <div class="section-title">III – Da autorização de desconto em folha</div>
          <p>
            Autorizo, de forma expressa, livre, consciente e inequívoca, nos termos da legislação aplicável e do acordo firmado entre as partes, o desconto do valor acima mencionado em minha folha de pagamento/contracheque, mediante o seguinte parcelamento:
          </p>

          <p style="margin-left: 20px; font-weight: bold; margin: 8px 0;">
            Valor total: ${formatCurrency(term.totalAmount || 3500)}<br>
            Parcelamento: ${parcelText}
          </p>

          <p style="margin-top: 10px;">
            Declaro que assino o presente instrumento por minha livre e espontânea vontade, sem qualquer vício de consentimento, estando ciente de todos os seus termos, efeitos e consequências jurídicas.
          </p>

          <p style="margin-top: 16px; margin-bottom: 20px;">
            Gravataí, ${term.documentDate || '15 de Junho de 2026'}.
          </p>

          <div class="signature-section">
            <div class="signature-line"></div>
            <div class="signature-name">${term.involvedPerson}</div>
            <div class="signature-sub">CPF: ${term.cpf || '002.574.880-73'}</div>
          </div>
        </div>
        ${standardFooter}
      `;
    }

    // 4. TERMO DE RESPONSABILIDADE - INFRAÇÃO DIRETA (Michele Rosa)
    if (term.templateType === 'infracao_direta') {
      return `
        <div class="doc-body">
          <div class="title">TERMO DE RESPONSABILIDADE</div>

          <div class="section-title">1. IDENTIFICAÇÃO DO CONDUTOR</div>
          <p>
            Eu, <strong>${term.involvedPerson}</strong> portador(a) do CPF nº <strong>${term.cpf || '016.998.180-02'}</strong>, na qualidade de condutor(a) do veículo abaixo identificado:
          </p>
          <ul style="list-style-type: disc; margin-left: 22px;">
            <li><strong>Placa: ${term.plate || 'TRD3E72'}</strong></li>
            <li><strong>Prefixo do Carro: ${term.prefix || '226'}</strong></li>
          </ul>

          <div class="section-title" style="margin-top: 12px;">2. DETALHES DO OCORRIDO</div>
          <ul style="list-style-type: disc; margin-left: 22px;">
            <li>Auto de Infração nº: <strong>TE02141677</strong></li>
            <li>Data do ocorrido: <strong>15/04/2026</strong></li>
            <li>Horário: <strong>16:50</strong></li>
            <li>Motivo (Enquadramento): <strong>ESTACIONAR EM LOCAL/HORARIO PROIBIDO ESPECIFICAMENTE PELA SINALIZACAO.</strong></li>
          </ul>

          <div class="section-title" style="margin-top: 12px;">3. DECLARAÇÃO DE RESPONSABILIDADE</div>
          <p>
            Declaro e assumo total e integral responsabilidade civil e administrativa pelas infrações de trânsito ocorridas com o veículo acima descritos, bem como por todas as consequências decorrentes destes atos. Confirmo ter total ciência da natureza e gravidade das referidas infrações, isentando a empresa <strong>João Batista de Souza Pinho EPP (Trans Pinho)</strong> de qualquer responsabilidade sobre as mesmas, uma vez que decorreram da minha conduta direta na condução do veículo.
          </p>

          <p style="margin-top: 16px; margin-bottom: 24px;">
            GRAVATAÍ, ${term.documentDate || '24 de Junho de 2026'}.
          </p>

          <div class="signature-section">
            <div class="signature-line"></div>
            <div class="signature-sub">Assinatura do Condutor</div>
            <div class="signature-name" style="margin-top: 4px;">${term.involvedPerson}</div>
            <div class="signature-sub">CPF: ${term.cpf || '016.998.180-02'}</div>
          </div>
        </div>
        ${standardFooter}
      `;
    }

    // 5. Default: Termo de Responsabilidade Multas & NIC Duplicada (Andreia Mercedes)
    const isParcelado = term.paymentMode === 'parcelado';
    const cotaUnicaChecked = isParcelado ? '☐' : '☑';
    const parceladoChecked = isParcelado ? '☑' : '☐';
    const numParc = term.installments || 2;
    const valParc = term.installmentAmount || (term.totalAmount / numParc);

    return `
      <div class="doc-body">
        <div class="title">TERMO DE RESPONSABILIDADE</div>

        <div class="section-title">1. IDENTIFICAÇÃO DO CONDUTOR</div>
        <p>
          Eu, <strong>${term.involvedPerson}</strong>, portador do CPF de nº <strong>${term.cpf || '002.574.880-73'}</strong>, na qualidade de condutor dos veículos abaixo identificado:
        </p>
        <ul style="list-style-type: disc; margin-left: 22px;">
          <li><strong>Placa: ${term.plate || 'JCO8C10'} &nbsp;&nbsp;&nbsp;&nbsp; Prefixo do Carro: ${term.prefix || '24127'}</strong></li>
        </ul>

        <div class="divider"></div>

        <div class="section-title">2. DETALHAMENTO DAS INFRAÇÕES E VALORES</div>
        <ul style="list-style-type: disc; margin-left: 22px;">
          <li><strong>Infração 01:</strong>
            <ul class="sub-list">
              <li>Auto de Infração nº: <strong>EL00093302</strong></li>
              <li>Data: <strong>27/04/2026</strong> | Horário: <strong>10:44</strong></li>
              <li>Motivo/Enquadramento: <strong>TRANSITAR EM VELOCIDADE SUPERIOR A MAXIMA PERMITIDA EM ATE 20%</strong></li>
              <li>Valor: <strong>R$ 130,16</strong></li>
            </ul>
          </li>
          <li style="margin-top: 4px;"><strong>Infração 02:</strong>
            <ul class="sub-list">
              <li>Auto de Infração nº: <strong>Gerado Duplicada</strong></li>
              <li>Data: &nbsp;&nbsp;&nbsp;&nbsp;| Horário: </li>
              <li>Motivo/Enquadramento: <strong>MULTA. POR NÃO IDENTIFICACAO DO CONDUTOR INFRATOR, IMPOSTA A PESSOA JURIDICA</strong></li>
              <li>Valor: <strong>R$ 130,16</strong></li>
            </ul>
          </li>
        </ul>

        <p style="margin-top: 6px;">
          O condutor reconhece a infração nº <strong>EL00093302</strong>. Considerando que o próprio condutor solicitou a não realização da indicação de condutor para transferência dos pontos da CNH, por não desejar o registro de pontos em sua carteira de habilitação, declara estar ciente e de acordo com o pagamento em dobro do valor original da multa, totalizando <strong>${formatCurrency(term.totalAmount || 260.32)} (duzentos e sessenta reais e trinta e dois centavos)</strong>, assumindo integral responsabilidade pela nova infração gerada.
        </p>

        <p style="font-weight: bold; margin: 6px 0;">
          VALOR TOTAL ACUMULADO: ${formatCurrency(term.totalAmount || 260.32)}
        </p>

        <div class="divider"></div>

        <div class="section-title">3. DA FORMA DE PAGAMENTO E PARCELAMENTO</div>
        <p>
          O condutor declara-se ciente do débito total acima mencionado e opta pela seguinte modalidade de quitação:
        </p>
        <p style="margin-left: 15px; margin-bottom: 2px;">${cotaUnicaChecked} Cota Única: Vencimento em ${term.singleDueDate || '06/07/2026'}</p>
        <p style="margin-left: 15px; margin-bottom: 2px;">${parceladoChecked} Parcelado: Em ${numParc} parcelas de ${formatCurrency(valParc)} Mensais.</p>
        ${isParcelado ? `<p style="margin-left: 15px; font-weight: bold;">Primeira parcela em: ${term.firstDueDate || '06/07/2026'}</p>` : ''}

        <div class="section-title" style="margin-top: 8px;">4. DA RESPONSABILIDADE E QUITAÇÃO</div>
        <p>
          Assumo integral responsabilidade civil e administrativa pelo pagamento dos valores aqui descritos. Ao concluir o pagamento total, outorgo à empresa <strong>João Batista de Souza Pinho EPP (Trans Pinho)</strong> a mais ampla, geral e irrevogável quitação, para nada mais declarar em juízo ou fora dele, operando-se a sub-rogação de direitos em favor da referida Trans Pinho.
        </p>

        <p style="margin-top: 10px; margin-bottom: 20px;">
          GRAVATAÍ, ${term.documentDate || '19 de Junho de 2026'}.
        </p>

        <div class="signature-section">
          <div class="signature-line"></div>
          <div class="signature-name">${term.involvedPerson}</div>
          <div class="signature-sub">CPF: ${term.cpf || '002.574.880-73'}</div>
        </div>
      </div>
      ${standardFooter}
    `;
  }

  const defaultSeedTerms = [
    {
      id: 'trm-1',
      title: 'TERMO DE RESPONSABILIDADE - MULTAS & NÃO INDICAÇÃO',
      type: 'Termo de Responsabilidade',
      templateType: 'multa_nic',
      date: '2026-06-19',
      documentDate: '19 de Junho de 2026',
      responsible: 'Carlos Pinho',
      involvedPerson: 'ANDREIA MERCEDES ROCHA DE ARAUJO',
      cpf: '002.574.880-73',
      plate: 'JCO8C10',
      prefix: '24127',
      paymentMode: 'parcelado',
      installments: 2,
      installmentAmount: 130.16,
      totalAmount: 260.32,
      firstDueDate: '06/07/2026',
      singleDueDate: '06/07/2026',
      status: 'Assinado'
    },
    {
      id: 'trm-2',
      title: 'TERMO DE RESPONSABILIDADE - INFRAÇÃO DIRETA',
      type: 'Termo de Responsabilidade',
      templateType: 'infracao_direta',
      date: '2026-06-24',
      documentDate: '24 de Junho de 2026',
      responsible: 'Carlos Pinho',
      involvedPerson: 'MICHELE ROSA DA ROSA',
      cpf: '016.998.180-02',
      plate: 'TRD3E72',
      prefix: '226',
      paymentMode: 'cota_unica',
      installments: 1,
      installmentAmount: 130.16,
      totalAmount: 130.16,
      firstDueDate: '15/05/2026',
      singleDueDate: '15/05/2026',
      status: 'Assinado'
    },
    {
      id: 'trm-3',
      title: 'TERMO DE CIÊNCIA E AUTORIZAÇÃO DE DESCONTO EM FOLHA DE PAGAMENTO',
      type: 'Termo de ciência e autorização de desconto',
      templateType: 'desconto_folha',
      date: '2026-06-15',
      documentDate: '15 de Junho de 2026',
      responsible: 'Mariana Souza',
      involvedPerson: 'ANDREIA MERCEDES ROCHA DE ARAUJO',
      cpf: '002.574.880-73',
      plate: 'JCO8C10',
      prefix: '24127',
      paymentMode: 'parcelado',
      installments: 5,
      installmentAmount: 700.00,
      totalAmount: 3500.00,
      firstDueDate: '05/07/2026',
      singleDueDate: '05/07/2026',
      status: 'Assinado'
    },
    {
      id: 'trm-4',
      title: 'TERMO DE QUITAÇÃO - REPAROS E ADESIVOS CHAPEAÇÃO',
      type: 'Termo de Quitação',
      templateType: 'termo_quitacao',
      date: '2026-07-31',
      documentDate: '31 de julho de 2026',
      sinisterDate: '18/06/2026',
      claimNumber: '2026 0624 5995 797',
      responsible: 'Fabiano Vieira',
      involvedPerson: 'GELSON WEBER DE FARIAS',
      cpf: '629.109.220-49',
      plate: 'HKO8087',
      prefix: '1961',
      paymentMode: 'cota_unica',
      installments: 1,
      installmentAmount: 0,
      totalAmount: 0,
      status: 'Assinado'
    },
    {
      id: 'trm-5',
      title: 'TERMO DE CIÊNCIA E DESCONTO EM FOLHA (VOLARE x RENAULT MASTER)',
      type: 'Termo de ciência e autorização de desconto',
      templateType: 'desconto_folha_terceiro',
      date: '2026-08-14',
      documentDate: '14 de Agosto de 2026',
      claimNumber: '2026 0713 3731 277',
      responsible: 'Carlos Pinho',
      involvedPerson: 'MARCELO TEIXEIRA DA SILVA',
      cpf: '031.997.250-07',
      vehicleModel: 'MARCOPOLO/VOLARE W9C ON',
      plate: 'IZF4E82',
      thirdPartyVehicle: 'RENAULT/MASTER TVAN',
      thirdPartyPlate: 'TQQ6H24',
      paymentMode: 'parcelado',
      installments: 15,
      installmentAmount: 146.46,
      totalAmount: 2200.00,
      totalAmountText: 'Dois mil e duzentos reais',
      firstDueDate: '07/08/2026',
      singleDueDate: '07/08/2026',
      status: 'Assinado'
    }
  ];

  // OS & Budget Initial State
  const initialBudget = {
    osNumber: 'OS-2026-1193',
    date: '14/08/2026',
    status: 'Em Análise',
    warrantyDays: 90,
    validityDays: 15,
    clientName: 'Trans Pinho (João Batista de Souza Pinho EPP)',
    clientCnpj: '94.476.207/0001-80',
    clientPhone: '(51) 98266-0028',
    clientEmail: 'operacional@transpinho.com',
    vehicleModel: 'Renault Master Van TVAN',
    vehiclePlate: 'TQQ6H24',
    vehicleColor: 'Branca',
    vehicleKm: '45.000 km',
    responsibleTechnician: 'Fabiano da Silva Vieira',
    report: 'Conforme relato do motorista, a van realizava manobra para sair do estacionamento da empresa Prometeon quando o micro-ônibus prefixo 1961 iniciou deslocamento simultaneamente. Em razão da manobra concomitante, ocorreu colisão entre os veículos, ocasionando avarias no para-choque traseiro, sinaleira esquerda e painel lateral.',
    items: [
      { id: 1, type: 'MO', description: 'Chapeação e alinhamento do painel traseiro e lateral', qty: 1, value: 350.00 },
      { id: 2, type: 'MO', description: 'Pintura automotiva em estufa com primer e verniz PU', qty: 1, value: 450.00 },
      { id: 3, type: 'Peça', description: 'Sinaleira traseira esquerda Renault Master', qty: 1, value: 400.00 },
      { id: 4, type: 'MO', description: 'Substituição e fixação da sinaleira traseira', qty: 1, value: 150.00 }
    ],
    materials: [
      { id: 1, description: 'Manta de Fibra de Vidro 1,40 x 0,33 Maxirubber', qty: 5, value: 19.00 },
      { id: 2, description: 'Disco Flap 80 Bramix', qty: 1, value: 6.90 },
      { id: 3, description: 'Estopa de Fio p/ Polimento 400g', qty: 1, value: 9.00 },
      { id: 4, description: 'Massa Poliéster c/Fibra de Vidro Maxrubber 750g', qty: 7, value: 45.00 },
      { id: 5, description: 'Massa Masilla Poliéster 750g Comp A+B', qty: 4, value: 31.00 },
      { id: 6, description: 'Disco Hockt 6" Grão 40 Rhynogrip White Indasa', qty: 8, value: 3.60 },
      { id: 7, description: 'Disco Lixa Indasa Plus 6" 80', qty: 8, value: 3.60 },
      { id: 8, description: 'Disco Hockt 6" Grão 220 Rhynogrip White Indasa', qty: 5, value: 3.69 },
      { id: 9, description: 'Disco Lixa Indasa Plus 6" 320', qty: 5, value: 3.69 },
      { id: 10, description: 'Fita Crepe Automotiva Amarela 765 48mm x 40m Adelbras', qty: 1, value: 16.00 },
      { id: 11, description: 'Fita Crepe Automotiva Amarela 765 18mm x 40m Adelbras', qty: 3, value: 5.95 },
      { id: 12, description: 'Endurecedor Lazzudur PU 834ml', qty: 1, value: 85.00 }
    ],
    pix: '(51) 99432-4224',
    bank: 'Itaú Unibanco (Ag: 0142 | CC: 44920-1)',
    payee: 'Fabiano da Silva Vieira',
    showSignatures: true
  };

  const state = {
    currentView: 'terms',
    selectedClaimId: 'claim-1',
    currentUser: { id: 'usr-1', name: 'Carlos Pinho', email: 'carlos@transpinho.com', role: 'ADMINISTRADOR', avatar: 'CP' },
    company: defaultCompany,
    claims: defaultSeedClaims,
    fines: defaultSeedFines,
    terms: defaultSeedTerms,
    templates: defaultSeedTemplates,
    people: defaultSeedPeople,
    vehicles: defaultSeedVehicles,
    budget: initialBudget,
    budgetTab: 'editor',
    budgetHistory: [],
    materialImportPreview: null,
    activeClaimDossier: null,
    searchQuery: '',
    showSearchModal: false,
    showNewClaimModal: false,
    showTermGeneratorModal: false,
    showExcelImportModal: false,
    selectedTemplateForEdit: null,
    toast: null
  };

  // Dedicated Print Function for Terms
  window.printDocumentDirectly = function(termId) {
    const term = state.terms.find(t => t.id === termId) || state.terms[0];
    if (!term) return;

    const printWindow = window.open('', '_blank', 'width=850,height=950');
    if (!printWindow) {
      alert('Por favor, permita popups no seu navegador para imprimir o documento A4.');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <title>${term.title}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 14mm 18mm 12mm 18mm;
          }
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          html, body {
            height: 100%;
          }
          body {
            font-family: 'Times New Roman', Times, Georgia, serif;
            font-size: 10.5pt;
            line-height: 1.32;
            color: #000000;
            background: #ffffff;
            padding: 4px;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }
          .doc-body {
            flex: 1 0 auto;
          }
          .title {
            text-align: center;
            font-size: 12pt;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin: 10px 0 12px 0;
          }
          .section-title {
            font-size: 11pt;
            font-weight: bold;
            text-transform: uppercase;
            margin-top: 10px;
            margin-bottom: 4px;
          }
          p {
            text-align: justify;
            margin-bottom: 6px;
            line-height: 1.32;
          }
          ul {
            margin-left: 20px;
            margin-bottom: 6px;
          }
          li {
            margin-bottom: 2px;
          }
          .sub-list {
            margin-left: 18px;
            list-style-type: circle;
          }
          .divider {
            border-top: 0.8px solid #999999;
            margin: 8px 0;
          }
          .signature-section {
            margin-top: 22px;
            text-align: center;
          }
          .signature-line {
            width: 300px;
            border-top: 1px solid #000000;
            margin: 0 auto 6px auto;
          }
          .signature-name {
            font-size: 10.5pt;
            font-weight: bold;
          }
          .signature-sub {
            font-size: 9.5pt;
            font-style: italic;
          }
          .doc-footer, .footer {
            margin-top: auto;
            padding-top: 35px;
            padding-bottom: 2px;
            text-align: center;
            font-size: 8.5pt;
            color: #333333;
            line-height: 1.3;
          }
        </style>
      </head>
      <body onload="window.focus(); window.print();">
        ${buildTermHtml(term)}
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Dedicated Print Function for OS & Budget
  window.printBudgetDirectly = function() {
    const b = state.budget;
    const totalMO = b.items.filter(i => i.type === 'MO').reduce((acc, curr) => acc + (curr.qty * curr.value), 0);
    const totalParts = b.items.filter(i => i.type === 'Peça').reduce((acc, curr) => acc + (curr.qty * curr.value), 0);
    const totalMaterials = b.materials.reduce((acc, curr) => acc + (curr.qty * curr.value), 0);
    const total = totalMO + totalParts + totalMaterials;

    const printWindow = window.open('', '_blank', 'width=850,height=950');
    if (!printWindow) {
      alert('Por favor, permita popups para imprimir a Ordem de Serviço.');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <title>Orçamento / OS - ${b.vehiclePlate || b.osNumber}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          @page { size: A4 portrait; margin: 10mm 12mm 10mm 12mm; }
          body { font-family: ui-sans-serif, system-ui, -apple-system, sans-serif; font-size: 9.5pt; color: #1e293b; background: #ffffff; }
        </style>
      </head>
      <body onload="window.focus(); window.print();" class="p-3">
        <header class="flex justify-between items-start border-b-2 border-slate-900 pb-3 mb-3">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center text-white font-black text-xl shadow-sm">VC</div>
            <div>
              <h1 class="text-xl font-extrabold tracking-tight text-slate-900">VIEIRA CENTER</h1>
              <p class="text-[9px] font-bold uppercase tracking-wider text-sky-600">Funilaria, Chapeação, Pintura em Estufa e Estética Automotiva</p>
              <p class="text-[9px] text-slate-500">Parceiro Oficial: JOÃO BATISTA DE SOUZA PINHO EPP (TRANS PINHO)</p>
            </div>
          </div>
          <div class="text-right">
            <span class="inline-block bg-slate-900 text-white font-mono font-bold text-xs px-2.5 py-1 rounded mb-1">OS Nº: ${b.osNumber}</span>
            <p class="text-xs text-slate-700 font-semibold">Data: ${b.date}</p>
            <p class="text-[9px] text-slate-400">Validade: ${b.validityDays || 15} dias</p>
          </div>
        </header>

        <div class="grid grid-cols-2 gap-3 mb-3 text-xs">
          <div class="bg-slate-50 p-2.5 rounded border border-slate-200">
            <h3 class="text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1">👤 Dados do Cliente</h3>
            <p class="font-bold text-slate-900">${b.clientName}</p>
            <p class="text-slate-600">CNPJ: ${b.clientCnpj}</p>
            <p class="text-slate-600">Tel: ${b.clientPhone} | Email: ${b.clientEmail}</p>
          </div>
          <div class="bg-sky-50/50 p-2.5 rounded border border-sky-200">
            <h3 class="text-[9px] font-bold uppercase tracking-wider text-sky-700 mb-1">🚗 Dados do Veículo</h3>
            <p class="font-bold text-slate-900">${b.vehicleModel}</p>
            <p class="text-slate-700">Placa: <strong class="font-mono bg-white px-1.5 py-0.5 rounded border border-sky-200">${b.vehiclePlate}</strong> | Cor: ${b.vehicleColor} | Km: ${b.vehicleKm}</p>
          </div>
        </div>

        ${b.report ? `
          <div class="mb-3 text-xs">
            <h3 class="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Relatório Técnico do Sinistro & Diagnóstico</h3>
            <div class="bg-white border border-slate-200 p-2.5 rounded border-l-4 border-l-sky-500 text-justify text-slate-700 leading-snug">
              ${b.report}
            </div>
          </div>
        ` : ''}

        <div class="mb-3">
          <h3 class="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">1. Discriminação de Serviços e Peças</h3>
          <table class="w-full text-left text-xs border border-slate-200 rounded">
            <thead class="bg-slate-100 text-slate-600 text-[9px] uppercase">
              <tr>
                <th class="p-1.5 text-center w-12">Tipo</th>
                <th class="p-1.5">Descrição dos Serviços / Peças</th>
                <th class="p-1.5 text-center w-12">Qtd</th>
                <th class="p-1.5 text-right w-24">V. Unit</th>
                <th class="p-1.5 text-right w-24">V. Total</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${b.items.map(it => `
                <tr>
                  <td class="p-1.5 text-center"><span class="px-1 py-0.5 rounded text-[8px] font-bold ${it.type === 'MO' ? 'bg-slate-200 text-slate-700' : 'bg-sky-100 text-sky-800'}">${it.type}</span></td>
                  <td class="p-1.5 font-medium text-slate-900">${it.description}</td>
                  <td class="p-1.5 text-center">${it.qty}</td>
                  <td class="p-1.5 text-right">${formatCurrency(it.value)}</td>
                  <td class="p-1.5 text-right font-bold">${formatCurrency(it.qty * it.value)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        ${b.materials && b.materials.length > 0 ? `
          <div class="mb-3">
            <h3 class="text-[9px] font-bold uppercase tracking-wider text-emerald-700 mb-1">2. Matérias e Insumos de Funilaria</h3>
            <table class="w-full text-left text-xs border border-emerald-200 rounded">
              <thead class="bg-emerald-50 text-emerald-800 text-[9px] uppercase">
                <tr>
                  <th class="p-1.5">Item / Insumo Técnico</th>
                  <th class="p-1.5 text-center w-16">Und</th>
                  <th class="p-1.5 text-right w-24">Valor</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-emerald-100">
                ${b.materials.map(m => `
                  <tr>
                    <td class="p-1.5 font-medium text-slate-900">${m.description}</td>
                    <td class="p-1.5 text-center">${m.qty}</td>
                    <td class="p-1.5 text-right font-bold text-emerald-700">${formatCurrency(m.qty * m.value)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        ` : ''}

        <div class="grid grid-cols-2 gap-3 mb-3 text-xs">
          <div class="bg-slate-50 p-2.5 rounded border border-slate-200 space-y-1">
            <h3 class="text-[10px] font-bold text-slate-900">💳 Dados Bancários para Pagamento</h3>
            <p><span class="text-slate-500">Chave Pix:</span> <strong class="text-slate-900">${b.pix}</strong></p>
            <p><span class="text-slate-500">Banco:</span> ${b.bank}</p>
            <p><span class="text-slate-500">Favorecido:</span> ${b.payee}</p>
            <p class="text-[9px] text-slate-400 pt-1">Garantia legal de 90 dias para peças e serviços conforme Art. 26 do CDC.</p>
          </div>
          <div class="space-y-1 bg-slate-50 p-2 rounded border border-slate-200">
            <div class="flex justify-between text-slate-600 px-2"><span>Mão de Obra:</span><span class="font-bold">${formatCurrency(totalMO)}</span></div>
            <div class="flex justify-between text-slate-600 px-2"><span>Peças de Reposição:</span><span class="font-bold">${formatCurrency(totalParts)}</span></div>
            <div class="flex justify-between text-emerald-700 px-2"><span>Matérias / Insumos:</span><span class="font-bold">${formatCurrency(totalMaterials)}</span></div>
            <div class="flex justify-between items-center bg-slate-900 text-white p-2 rounded font-black text-sm mt-1">
              <span>VALOR TOTAL:</span><span>${formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        ${b.showSignatures !== false ? `
          <div class="grid grid-cols-2 gap-6 pt-3 border-t border-slate-300 mt-3 text-center text-xs">
            <div>
              <div class="border-b border-slate-400 h-6 mb-1"></div>
              <p class="font-bold text-slate-900">${b.responsibleTechnician || 'Fabiano Vieira'}</p>
              <p class="text-[9px] uppercase text-slate-500">Responsável Técnico / Vieira Center</p>
            </div>
            <div>
              <div class="border-b border-slate-400 h-6 mb-1"></div>
              <p class="font-bold text-slate-900">${b.clientName || 'Assinatura do Cliente'}</p>
              <p class="text-[9px] uppercase text-slate-500">Cliente / Gestor de Frota Trans Pinho</p>
            </div>
          </div>
        ` : ''}
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  function formatCurrency(val) { return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0); }
  function formatDate(str) { if (!str) return 'N/A'; const d = new Date(str); return isNaN(d.getTime()) ? str : new Intl.DateTimeFormat('pt-BR').format(d); }
  function maskCpfCnpj(val) { if (!val) return 'N/A'; const clean = val.replace(/\D/g, ''); if (clean.length === 11) return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4'); if (clean.length === 14) return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5'); return val; }

  function getStatusBadgeClass(status) {
    const map = {
      'Novo': 'bg-blue-100 text-blue-800 border-blue-200',
      'Em análise': 'bg-amber-100 text-amber-800 border-amber-200',
      'Aguardando documentos': 'bg-orange-100 text-orange-800 border-orange-200',
      'Resolvido': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'Pendente': 'bg-amber-100 text-amber-800 border-amber-200',
      'Paga': 'bg-emerald-100 text-emerald-800 border-emerald-200'
    };
    return map[status] || 'bg-slate-100 text-slate-700 border-slate-200';
  }

  function showToast(msg, type = 'info') {
    state.toast = { msg, type };
    renderToast();
    setTimeout(() => { state.toast = null; renderToast(); }, 3500);
  }

  function renderApp() {
    const appEl = document.getElementById('app');
    if (!appEl) return;

    appEl.innerHTML = `
      ${renderSidebar()}
      <div class="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50">
        ${renderHeader()}
        <main class="flex-1 overflow-y-auto p-6 relative">
          ${renderMainView()}
        </main>
      </div>
    `;

    attachEvents();
  }

  function renderSidebar() {
    const menuItems = [
      { id: 'terms', label: 'Emitir Termos Oficial', icon: 'fa-file-pen', badge: state.terms.length },
      { id: 'budgets', label: 'Orçamentos & OS Chapeação', icon: 'fa-wrench', isNew: true },
      { id: 'dashboard', label: 'Painel Trans Pinho', icon: 'fa-chart-pie' },
      { id: 'claims', label: 'Sinistros & Ocorrências', icon: 'fa-folder-closed', badge: state.claims.length },
      { id: 'fines', label: 'Multas de Trânsito', icon: 'fa-file-invoice-dollar', badge: state.fines.length },
      { id: 'templates', label: 'Modelos de Documentos', icon: 'fa-sliders' },
      { id: 'people', label: 'Condutores', icon: 'fa-users' },
      { id: 'vehicles', label: 'Frota & Prefixos', icon: 'fa-truck-front' }
    ];

    return `
      <aside class="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col flex-shrink-0 z-30 select-none">
        <div class="h-16 flex items-center px-5 border-b border-slate-800 gap-3">
          <div class="w-10 h-10 rounded-xl bg-white flex items-center justify-center p-1 shadow-lg overflow-hidden">
            <img src="/images/logo.png" alt="Trans Pinho Logo" class="w-full h-full object-contain" />
          </div>
          <div class="min-w-0 flex-1">
            <h1 class="font-black text-white text-sm tracking-tight leading-none truncate">Trans Pinho</h1>
            <span class="text-[9px] uppercase font-bold text-amber-400 tracking-wider">Gravataí / RS</span>
          </div>
        </div>

        <nav class="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          <div class="px-3 mb-2 text-[10px] uppercase font-bold text-slate-500 tracking-wider">Módulos Corporativos</div>
          ${menuItems.map(item => {
            const isActive = state.currentView === item.id || (item.id === 'claims' && state.currentView === 'claim-detail');
            return `
              <button 
                data-view="${item.id}"
                class="nav-btn w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                  isActive ? 'bg-amber-500 text-slate-950 font-bold shadow-md' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }"
              >
                <div class="flex items-center gap-3">
                  <i class="fa-solid ${item.icon} text-sm w-4 text-center ${isActive ? 'text-slate-950' : 'text-slate-400'}"></i>
                  <span>${item.label}</span>
                </div>
                <div class="flex items-center gap-1.5">
                  ${item.isNew ? '<span class="px-1.5 py-0.5 rounded text-[8px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">NOVO</span>' : ''}
                  ${item.badge !== undefined ? `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${isActive ? 'bg-slate-950 text-white' : 'bg-slate-800 text-slate-300'}">${item.badge}</span>` : ''}
                </div>
              </button>
            `;
          }).join('')}
        </nav>

        <div class="p-4 border-t border-slate-800 bg-slate-950/50">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-xs shadow-inner">
              ${state.currentUser.avatar}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-xs font-bold text-white truncate">${state.currentUser.name}</p>
              <p class="text-[10px] text-amber-400 font-semibold truncate">${state.currentUser.role}</p>
            </div>
          </div>
        </div>
      </aside>
    `;
  }

  function renderHeader() {
    return `
      <header class="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between z-20">
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-1.5 text-xs text-slate-500 cursor-pointer hover:bg-slate-200 transition" id="search-trigger">
            <i class="fa-solid fa-magnifying-glass text-slate-400"></i>
            <span class="text-slate-600 font-medium">Buscar condutor, placa, sinistro...</span>
            <kbd class="bg-white px-1.5 py-0.5 rounded text-[10px] border border-slate-300 font-mono shadow-2xs">Ctrl K</kbd>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <button id="open-excel-import" class="btn bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-xs">
            <i class="fa-solid fa-file-excel text-xs"></i> Ler Planilha Excel (.xlsx)
          </button>
          <button id="open-new-claim" class="btn bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-xs">
            <i class="fa-solid fa-plus text-xs text-amber-400"></i> Novo Sinistro
          </button>
        </div>
      </header>
    `;
  }

  function renderMainView() {
    switch (state.currentView) {
      case 'terms': return renderTermsView();
      case 'budgets': return renderBudgetsView();
      case 'dashboard': return renderDashboardView();
      case 'claims': return renderClaimsListView();
      case 'claim-detail': return renderClaimDetailView();
      case 'fines': return renderFinesView();
      case 'templates': return renderTemplateEditorView();
      case 'people': return renderPeopleView();
      case 'vehicles': return renderVehiclesView();
      default: return renderTermsView();
    }
  }

  function renderTermsView() {
    return `
      <div class="space-y-6">
        <div class="bg-slate-900 text-white p-6 rounded-xl shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span class="badge bg-amber-500 text-slate-950 text-[10px] px-2.5 py-0.5 rounded font-black uppercase mb-1 inline-block">100% IDÊNTICO AOS DOCUMENTOS OFICIAIS</span>
            <h2 class="text-xl font-bold tracking-tight">Emissão & Impressão de Termos Oficial Trans Pinho</h2>
            <p class="text-xs text-slate-300 mt-1">Todos os 5 modelos oficiais possuem estrutura e rodapé padronizados, com personalização livre de datas e parcelas.</p>
          </div>
          <button id="terms-open-gen" class="btn bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-sm shrink-0">
            <i class="fa-solid fa-wand-magic-sparkles"></i> Emitir Novo Termo
          </button>
        </div>

        <div class="space-y-8">
          ${state.terms.map(t => {
            const isParcelado = t.paymentMode === 'parcelado';
            const numParc = t.installments || 2;
            const total = t.totalAmount || 260.32;
            const valParc = t.installmentAmount || (total / numParc);

            return `
              <div class="bg-white p-6 rounded-xl border border-slate-300 shadow-md space-y-4">
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-3 gap-3">
                  <div>
                    <span class="badge bg-amber-100 text-amber-900 font-extrabold text-[10px] px-2.5 py-0.5 rounded border border-amber-300">${t.type}</span>
                    <h3 class="font-bold text-slate-900 text-base mt-1">${t.title}</h3>
                    <p class="text-xs text-slate-500">Condutor: <strong>${t.involvedPerson}</strong> • Placa: <strong>${t.plate}</strong></p>
                  </div>
                  <button onclick="window.printDocumentDirectly('${t.id}')" class="btn bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-lg shadow-sm flex items-center gap-2 shrink-0">
                    <i class="fa-solid fa-print text-sm"></i> IMPRIMIR PDF OFICIAL A4
                  </button>
                </div>

                <!-- Interactive Document Customizer Bar -->
                <div class="bg-slate-50 p-3.5 rounded-lg border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div class="flex items-center gap-3">
                    <span class="font-bold text-slate-700">Pagamento:</span>
                    <label class="flex items-center gap-1.5 cursor-pointer font-bold ${!isParcelado ? 'text-blue-700' : 'text-slate-600'}">
                      <input type="radio" name="paymode_${t.id}" value="cota_unica" ${!isParcelado ? 'checked' : ''} class="term-paymode-toggle cursor-pointer" data-term-id="${t.id}" />
                      ☐/☑ Cota Única
                    </label>
                    <label class="flex items-center gap-1.5 cursor-pointer font-bold ${isParcelado ? 'text-blue-700' : 'text-slate-600'}">
                      <input type="radio" name="paymode_${t.id}" value="parcelado" ${isParcelado ? 'checked' : ''} class="term-paymode-toggle cursor-pointer" data-term-id="${t.id}" />
                      ☑/☐ Parcelado
                    </label>
                  </div>

                  ${isParcelado ? `
                    <div class="flex items-center gap-2">
                      <span class="text-slate-600 font-semibold">Parcelamento:</span>
                      <select class="term-installments-select form-select text-xs py-1 px-2 font-bold bg-white border-slate-300 rounded" data-term-id="${t.id}">
                        ${[1,2,3,4,5,6,10,12,15].map(n => `
                          <option value="${n}" ${numParc === n ? 'selected' : ''}>${n}x de ${formatCurrency(total / n)}</option>
                        `).join('')}
                      </select>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="text-slate-600 font-semibold">1ª Parcela:</span>
                      <input type="text" value="${t.firstDueDate || '06/07/2026'}" class="term-first-due-input form-input text-xs py-1 px-2 w-28 text-center font-bold bg-white border-slate-300 rounded" data-term-id="${t.id}" placeholder="DD/MM/AAAA" />
                    </div>
                  ` : `
                    <div class="flex items-center gap-2">
                      <span class="text-slate-600 font-semibold">Vencimento Cota Única:</span>
                      <input type="text" value="${t.singleDueDate || '06/07/2026'}" class="term-single-due-input form-input text-xs py-1 px-2 w-28 text-center font-bold bg-white border-slate-300 rounded" data-term-id="${t.id}" placeholder="DD/MM/AAAA" />
                    </div>
                  `}

                  <div class="flex items-center gap-2">
                    <span class="text-slate-600 font-semibold">Data do Termo:</span>
                    <input type="text" value="${t.documentDate || '19 de Junho de 2026'}" class="term-doc-date-input form-input text-xs py-1 px-2 w-44 font-bold bg-white border-slate-300 rounded" data-term-id="${t.id}" placeholder="Ex: 19 de Junho de 2026" />
                  </div>
                </div>

                <!-- Pixel-Perfect Term Preview Container with exact A4 proportion -->
                <div class="bg-white p-8 max-w-[210mm] min-h-[270mm] mx-auto border border-slate-200 shadow-sm rounded-lg flex flex-col justify-between" style="font-family: 'Times New Roman', Times, Georgia, serif; color: #000000; line-height: 1.32; font-size: 10.5pt;">
                  ${buildTermHtml(t)}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  // ==========================================
  // VIEW: ORÇAMENTOS & OS (VIEIRA CENTER & TRANS PINHO - ULTRA REFINED)
  // ==========================================
  function renderBudgetsView() {
    const b = state.budget;
    const totalMO = b.items.filter(i => i.type === 'MO').reduce((acc, curr) => acc + (curr.qty * curr.value), 0);
    const totalParts = b.items.filter(i => i.type === 'Peça').reduce((acc, curr) => acc + (curr.qty * curr.value), 0);
    const totalMaterials = b.materials.reduce((acc, curr) => acc + (curr.qty * curr.value), 0);
    const total = totalMO + totalParts + totalMaterials;

    return `
      <div class="space-y-6">
        <datalist id="materials-datalist">
          ${materialsList.map(m => `<option value="${m}"></option>`).join('')}
        </datalist>

        <!-- Top Header & Action Controls -->
        <div class="bg-slate-900 text-white p-5 rounded-xl shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="badge bg-sky-500 text-slate-950 text-[10px] px-2.5 py-0.5 rounded font-black uppercase">Chapeação & Funilaria Oficial</span>
              <span class="badge bg-amber-500 text-slate-950 text-[10px] px-2 py-0.5 rounded font-bold uppercase">Vieira Center & Trans Pinho</span>
            </div>
            <h2 class="text-xl font-bold tracking-tight">Gerador de Orçamentos & Ordens de Serviço (OS)</h2>
            <p class="text-xs text-slate-300 mt-0.5">Emissão de orçamentos técnicos com tabela de peças, mão de obra e insumos de funilaria.</p>
          </div>
          <div class="flex flex-wrap gap-2">
            <button id="budget-pull-claim-btn" class="btn bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-3.5 py-2.5 rounded-lg flex items-center gap-1.5 shadow-sm">
              <i class="fa-solid fa-bolt"></i> Puxar de Sinistro
            </button>
            <button id="budget-download-pdf" class="btn bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-sm">
              <i class="fa-solid fa-file-pdf"></i> Baixar PDF
            </button>
            <button onclick="window.printBudgetDirectly()" class="btn bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-sm">
              <i class="fa-solid fa-print"></i> IMPRIMIR OS A4
            </button>
          </div>
        </div>

        <!-- Split View: Advanced Form Editor (Left) & Live Preview (Right) -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          <!-- LEFT PANEL: OS FORM EDITOR -->
          <div class="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-5">
            <div class="flex justify-between items-center border-b border-slate-200 pb-3">
              <div class="flex items-center gap-2">
                <button id="budget-tab-editor" class="text-xs px-3 py-1.5 rounded-lg font-bold ${state.budgetTab === 'editor' ? 'bg-sky-500 text-white shadow-xs' : 'bg-slate-100 text-slate-600'}">✏️ Editor OS</button>
                <button id="budget-tab-history" class="text-xs px-3 py-1.5 rounded-lg font-bold ${state.budgetTab === 'history' ? 'bg-sky-500 text-white shadow-xs' : 'bg-slate-100 text-slate-600'}">🗂️ Histórico (${state.budgetHistory.length})</button>
              </div>
              <div class="flex gap-1.5">
                <button id="budget-save-history-btn" class="btn bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] px-2.5 py-1.5 rounded-md flex items-center gap-1">
                  <i class="fa-solid fa-floppy-disk"></i> Salvar
                </button>
                <button id="budget-new-btn" class="btn bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] px-2.5 py-1.5 rounded-md">
                  + Nova OS
                </button>
              </div>
            </div>

            ${state.budgetTab === 'history' ? `
              <div class="space-y-3">
                ${state.budgetHistory.length === 0 ? `
                  <p class="text-xs text-slate-400 text-center py-8">Nenhum orçamento salvo no histórico ainda. Preencha e clique em "Salvar".</p>
                ` : state.budgetHistory.map(h => `
                  <div class="p-3 bg-slate-50 border border-slate-200 rounded-lg flex justify-between items-center">
                    <div>
                      <span class="font-bold text-xs text-slate-900">${h.osNumber}</span> - <span class="text-xs font-semibold text-slate-700">${h.vehiclePlate}</span>
                      <p class="text-[10px] text-slate-400">${h.date} • ${h.vehicleModel}</p>
                    </div>
                    <div class="flex gap-2">
                      <button data-os="${h.osNumber}" class="load-os-btn btn bg-sky-100 hover:bg-sky-200 text-sky-800 text-[10px] font-bold px-2 py-1 rounded">Carregar</button>
                      <button data-os="${h.osNumber}" class="delete-os-btn text-rose-500 hover:text-rose-700 text-xs px-1">🗑️</button>
                    </div>
                  </div>
                `).join('')}
              </div>
            ` : `
              <!-- FORM INPUTS -->
              <div class="space-y-4 text-xs">
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="form-label text-[11px] font-bold">Nº OS *</label>
                    <input type="text" id="b-os-number" value="${b.osNumber}" class="form-input text-xs font-bold font-mono" />
                  </div>
                  <div>
                    <label class="form-label text-[11px] font-bold">Data *</label>
                    <input type="text" id="b-date" value="${b.date}" class="form-input text-xs font-bold" />
                  </div>
                </div>

                <!-- Cliente -->
                <div>
                  <h4 class="text-[10px] font-black uppercase text-slate-400 border-b border-slate-200 pb-1 mb-2">Dados do Cliente</h4>
                  <div class="grid grid-cols-2 gap-2">
                    <input type="text" id="b-client-name" value="${b.clientName}" placeholder="Nome Cliente" class="form-input text-xs font-bold" />
                    <input type="text" id="b-client-cnpj" value="${b.clientCnpj}" placeholder="CNPJ / CPF" class="form-input text-xs" />
                    <input type="text" id="b-client-phone" value="${b.clientPhone}" placeholder="Telefone" class="form-input text-xs" />
                    <input type="text" id="b-client-email" value="${b.clientEmail}" placeholder="E-mail" class="form-input text-xs" />
                  </div>
                </div>

                <!-- Veículo -->
                <div>
                  <h4 class="text-[10px] font-black uppercase text-slate-400 border-b border-slate-200 pb-1 mb-2">Dados do Veículo</h4>
                  <div class="grid grid-cols-3 gap-2">
                    <input type="text" id="b-vehicle-model" value="${b.vehicleModel}" placeholder="Modelo / Ano" class="form-input text-xs col-span-2 font-bold" />
                    <input type="text" id="b-vehicle-plate" value="${b.vehiclePlate}" placeholder="Placa" class="form-input text-xs font-mono uppercase font-bold" />
                    <input type="text" id="b-vehicle-color" value="${b.vehicleColor}" placeholder="Cor" class="form-input text-xs" />
                    <input type="text" id="b-vehicle-km" value="${b.vehicleKm}" placeholder="Km" class="form-input text-xs col-span-2" />
                  </div>
                </div>

                <!-- Relatório da Ocorrência -->
                <div>
                  <div class="flex justify-between items-center border-b border-slate-200 pb-1 mb-1">
                    <h4 class="text-[10px] font-black uppercase text-slate-400">Relatório Técnico do Sinistro</h4>
                    <span class="text-[9px] text-sky-600 font-bold">Diagnóstico Funilaria</span>
                  </div>
                  <textarea id="b-report" rows="3" class="form-textarea text-xs">${b.report}</textarea>
                </div>

                <!-- Tabela 1: Serviços & Peças -->
                <div>
                  <div class="flex justify-between items-center border-b border-slate-200 pb-1 mb-2">
                    <h4 class="text-[10px] font-black uppercase text-slate-500">1. Serviços & Peças</h4>
                    <button id="add-item-btn" class="btn bg-sky-100 text-sky-800 font-bold text-[10px] px-2 py-0.5 rounded">+ Item</button>
                  </div>
                  <div class="space-y-2">
                    ${b.items.map((it, idx) => `
                      <div class="flex gap-1.5 items-center bg-slate-50 p-1.5 rounded border border-slate-200">
                        <select data-idx="${idx}" class="item-type-select form-select text-[10px] py-1 px-1 w-16">
                          <option value="MO" ${it.type === 'MO' ? 'selected' : ''}>MO</option>
                          <option value="Peça" ${it.type === 'Peça' ? 'selected' : ''}>Peça</option>
                        </select>
                        <input type="text" data-idx="${idx}" value="${it.description}" class="item-desc-input form-input text-[10px] py-1 px-1.5 flex-1" placeholder="Descrição..." />
                        <input type="number" data-idx="${idx}" value="${it.qty}" min="1" class="item-qty-input form-input text-[10px] py-1 px-1 w-10 text-center" />
                        <input type="number" data-idx="${idx}" value="${it.value}" step="0.01" class="item-val-input form-input text-[10px] py-1 px-1 w-16 text-right font-bold" />
                        <button data-idx="${idx}" class="del-item-btn text-rose-500 hover:text-rose-700 text-xs px-1">🗑️</button>
                      </div>
                    `).join('')}
                  </div>
                </div>

                <!-- Tabela 2: Matérias e Insumos -->
                <div>
                  <div class="flex justify-between items-center border-b border-slate-200 pb-1 mb-2">
                    <h4 class="text-[10px] font-black uppercase text-emerald-700">2. Matérias e Insumos</h4>
                    <div class="flex gap-1.5">
                      <label class="btn bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] px-2 py-0.5 rounded cursor-pointer">
                        📥 Ler PDF Fornecedor
                        <input type="file" id="import-materials-pdf-input" accept="application/pdf" class="hidden" />
                      </label>
                      <button id="add-material-btn" class="btn bg-emerald-100 text-emerald-800 font-bold text-[10px] px-2 py-0.5 rounded">+ Matéria</button>
                    </div>
                  </div>

                  <div class="space-y-1.5 max-h-56 overflow-y-auto">
                    ${b.materials.map((m, idx) => `
                      <div class="flex gap-1.5 items-center bg-emerald-50/40 p-1.5 rounded border border-emerald-100">
                        <input type="text" list="materials-datalist" data-idx="${idx}" value="${m.description}" class="mat-desc-input form-input text-[10px] py-1 px-1.5 flex-1" placeholder="Item (ex: Lixa, Tinta)" />
                        <input type="number" data-idx="${idx}" value="${m.qty}" min="1" class="mat-qty-input form-input text-[10px] py-1 px-1 w-10 text-center" />
                        <input type="number" data-idx="${idx}" value="${m.value}" step="0.01" class="mat-val-input form-input text-[10px] py-1 px-1 w-16 text-right font-bold text-emerald-700" />
                        <button data-idx="${idx}" class="del-mat-btn text-rose-500 hover:text-rose-700 text-xs px-1">🗑️</button>
                      </div>
                    `).join('')}
                  </div>
                </div>

                <!-- Pagamento Pix -->
                <div>
                  <h4 class="text-[10px] font-black uppercase text-slate-400 border-b border-slate-200 pb-1 mb-2">Dados Bancários / Pix</h4>
                  <div class="grid grid-cols-3 gap-2">
                    <input type="text" id="b-pix" value="${b.pix}" placeholder="Chave Pix" class="form-input text-xs font-bold" />
                    <input type="text" id="b-bank" value="${b.bank}" placeholder="Banco" class="form-input text-xs" />
                    <input type="text" id="b-payee" value="${b.payee}" placeholder="Favorecido" class="form-input text-xs" />
                  </div>
                </div>
              </div>
            `}
          </div>

          <!-- RIGHT PANEL: LIVE A4 PREVIEW CONTAINER -->
          <div class="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-md p-6 overflow-hidden">
            <div id="pdf-content" class="bg-white max-w-[210mm] mx-auto p-4 md:p-6 text-slate-800" style="font-family: ui-sans-serif, system-ui, sans-serif; font-size: 10pt;">
              <header class="flex justify-between items-start border-b-2 border-slate-900 pb-3 mb-3">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center text-white font-black text-xl shadow-sm">VC</div>
                  <div>
                    <h1 class="text-xl font-extrabold tracking-tight text-slate-900">VIEIRA CENTER</h1>
                    <p class="text-[9px] font-bold uppercase tracking-wider text-sky-600">Funilaria, Chapeação, Pintura em Estufa e Estética Automotiva</p>
                    <p class="text-[9px] text-slate-500">Parceiro Oficial: JOÃO BATISTA DE SOUZA PINHO EPP (TRANS PINHO)</p>
                  </div>
                </div>
                <div class="text-right">
                  <span class="inline-block bg-slate-900 text-white font-mono font-bold text-xs px-2.5 py-1 rounded mb-1">OS Nº: ${b.osNumber}</span>
                  <p class="text-xs text-slate-700 font-semibold">Data: ${b.date}</p>
                  <p class="text-[9px] text-slate-400">Validade: ${b.validityDays || 15} dias</p>
                </div>
              </header>

              <div class="grid grid-cols-2 gap-3 mb-3 text-xs">
                <div class="bg-slate-50 p-2.5 rounded border border-slate-200">
                  <h3 class="text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1">👤 Dados do Cliente</h3>
                  <p class="font-bold text-slate-900">${b.clientName}</p>
                  <p class="text-slate-600">CNPJ: ${b.clientCnpj}</p>
                  <p class="text-slate-600">Tel: ${b.clientPhone} | Email: ${b.clientEmail}</p>
                </div>
                <div class="bg-sky-50/50 p-2.5 rounded border border-sky-200">
                  <h3 class="text-[9px] font-bold uppercase tracking-wider text-sky-700 mb-1">🚗 Dados do Veículo</h3>
                  <p class="font-bold text-slate-900">${b.vehicleModel}</p>
                  <p class="text-slate-700">Placa: <strong class="font-mono bg-white px-1.5 py-0.5 rounded border border-sky-200">${b.vehiclePlate}</strong> | Cor: ${b.vehicleColor} | Km: ${b.vehicleKm}</p>
                </div>
              </div>

              ${b.report ? `
                <div class="mb-3 text-xs">
                  <h3 class="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Relatório Técnico do Sinistro & Diagnóstico</h3>
                  <div class="bg-white border border-slate-200 p-2.5 rounded border-l-4 border-l-sky-500 text-justify text-slate-700 leading-snug">
                    ${b.report}
                  </div>
                </div>
              ` : ''}

              <!-- TABELA 1: SERVIÇOS & PEÇAS -->
              <div class="mb-3">
                <h3 class="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">1. Discriminação de Serviços e Peças</h3>
                <table class="w-full text-left text-xs border border-slate-200 rounded">
                  <thead class="bg-slate-100 text-slate-600 text-[9px] uppercase">
                    <tr>
                      <th class="p-1.5 text-center w-12">Tipo</th>
                      <th class="p-1.5">Descrição dos Serviços / Peças</th>
                      <th class="p-1.5 text-center w-12">Qtd</th>
                      <th class="p-1.5 text-right w-24">V. Unit</th>
                      <th class="p-1.5 text-right w-24">V. Total</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    ${b.items.map(it => `
                      <tr>
                        <td class="p-1.5 text-center"><span class="px-1 py-0.5 rounded text-[8px] font-bold ${it.type === 'MO' ? 'bg-slate-200 text-slate-700' : 'bg-sky-100 text-sky-800'}">${it.type}</span></td>
                        <td class="p-1.5 font-medium text-slate-900">${it.description}</td>
                        <td class="p-1.5 text-center">${it.qty}</td>
                        <td class="p-1.5 text-right">${formatCurrency(it.value)}</td>
                        <td class="p-1.5 text-right font-bold">${formatCurrency(it.qty * it.value)}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>

              <!-- TABELA 2: MATÉRIAS -->
              ${b.materials && b.materials.length > 0 ? `
                <div class="mb-3">
                  <h3 class="text-[9px] font-bold uppercase tracking-wider text-emerald-700 mb-1">2. Matérias e Insumos de Funilaria</h3>
                  <table class="w-full text-left text-xs border border-emerald-200 rounded">
                    <thead class="bg-emerald-50 text-emerald-800 text-[9px] uppercase">
                      <tr>
                        <th class="p-1.5">Item / Insumo Técnico</th>
                        <th class="p-1.5 text-center w-16">Und</th>
                        <th class="p-1.5 text-right w-24">Valor</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-emerald-100">
                      ${b.materials.map(m => `
                        <tr>
                          <td class="p-1.5 font-medium text-slate-900">${m.description}</td>
                          <td class="p-1.5 text-center">${m.qty}</td>
                          <td class="p-1.5 text-right font-bold text-emerald-700">${formatCurrency(m.qty * m.value)}</td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
              ` : ''}

              <!-- Resumo Financeiro & Pagamento -->
              <div class="grid grid-cols-2 gap-3 mb-3 text-xs">
                <div class="bg-slate-50 p-2.5 rounded border border-slate-200 space-y-1">
                  <h3 class="text-[10px] font-bold text-slate-900">💳 Dados Bancários para Pagamento</h3>
                  <p><span class="text-slate-500">Chave Pix:</span> <strong class="text-slate-900">${b.pix}</strong></p>
                  <p><span class="text-slate-500">Banco:</span> ${b.bank}</p>
                  <p><span class="text-slate-500">Favorecido:</span> ${b.payee}</p>
                  <p class="text-[9px] text-slate-400 pt-1">Garantia legal de 90 dias para peças e serviços conforme Art. 26 do CDC.</p>
                </div>
                <div class="space-y-1 bg-slate-50 p-2 rounded border border-slate-200">
                  <div class="flex justify-between text-slate-600 px-2"><span>Mão de Obra:</span><span class="font-bold">${formatCurrency(totalMO)}</span></div>
                  <div class="flex justify-between text-slate-600 px-2"><span>Peças de Reposição:</span><span class="font-bold">${formatCurrency(totalParts)}</span></div>
                  <div class="flex justify-between text-emerald-700 px-2"><span>Matérias / Insumos:</span><span class="font-bold">${formatCurrency(totalMaterials)}</span></div>
                  <div class="flex justify-between items-center bg-slate-900 text-white p-2 rounded font-black text-sm mt-1">
                    <span>VALOR TOTAL:</span><span>${formatCurrency(total)}</span>
                  </div>
                </div>
              </div>

              <!-- Assinaturas -->
              ${b.showSignatures !== false ? `
                <div class="grid grid-cols-2 gap-6 pt-3 border-t border-slate-300 mt-3 text-center text-xs">
                  <div>
                    <div class="border-b border-slate-400 h-6 mb-1"></div>
                    <p class="font-bold text-slate-900">${b.responsibleTechnician || 'Fabiano Vieira'}</p>
                    <p class="text-[9px] uppercase text-slate-500">Responsável Técnico / Vieira Center</p>
                  </div>
                  <div>
                    <div class="border-b border-slate-400 h-6 mb-1"></div>
                    <p class="font-bold text-slate-900">${b.clientName || 'Assinatura do Cliente'}</p>
                    <p class="text-[9px] uppercase text-slate-500">Cliente / Gestor de Frota Trans Pinho</p>
                  </div>
                </div>
              ` : ''}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderDashboardView() {
    return `
      <div class="space-y-6">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <div>
            <span class="badge bg-amber-100 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded border border-amber-300">JOÃO BATISTA DE SOUZA PINHO EPP</span>
            <h2 class="text-xl font-bold text-slate-900 tracking-tight mt-1">Gestão Trans Pinho - Gravataí/RS</h2>
            <p class="text-xs text-slate-500 mt-0.5">Emissão de Termos Oficiais, Orçamentos de Chapeação e Controle de Multas NIC.</p>
          </div>
          <div class="flex flex-wrap gap-2.5">
            <button id="dash-import-excel" class="btn bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm">
              <i class="fa-solid fa-file-excel"></i> Importar Excel (.xlsx)
            </button>
            <button id="dash-new-term" class="btn bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm">
              <i class="fa-solid fa-wand-magic-sparkles"></i> Gerar Termo Oficial
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <span class="text-xs font-bold uppercase text-slate-400">Total Sinistros</span>
            <div class="mt-2 flex items-baseline gap-2">
              <span class="text-2xl font-black text-slate-900">${state.claims.length}</span>
              <span class="text-[11px] font-semibold text-blue-600">Cadastrados</span>
            </div>
          </div>

          <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <span class="text-xs font-bold uppercase text-slate-400">Termos Oficiais</span>
            <div class="mt-2 flex items-baseline gap-2">
              <span class="text-2xl font-black text-slate-900">${state.terms.length}</span>
              <span class="text-[11px] font-semibold text-emerald-600">5 Modelos Prontos</span>
            </div>
          </div>

          <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <span class="text-xs font-bold uppercase text-slate-400">Multas & Infração</span>
            <div class="mt-2 flex items-baseline gap-2">
              <span class="text-2xl font-black text-slate-900">${state.fines.length}</span>
              <span class="text-[11px] font-semibold text-rose-600">Com NIC e Parcelamento</span>
            </div>
          </div>

          <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <span class="text-xs font-bold uppercase text-slate-400">Veículos em Frota</span>
            <div class="mt-2 flex items-baseline gap-2">
              <span class="text-2xl font-black text-slate-900">${state.vehicles.length}</span>
              <span class="text-[11px] font-semibold text-purple-600">Com Prefixo</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderClaimsListView() {
    return `
      <div class="space-y-6">
        <div class="flex justify-between items-center">
          <div>
            <h2 class="text-xl font-bold text-slate-900">Dossiês de Sinistros & Ocorrências</h2>
            <p class="text-xs text-slate-500">Acompanhamento por prefixo, placa, condutor e valores apurados.</p>
          </div>
          <div class="flex gap-2">
            <button id="claims-import-excel" class="btn bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-lg">
              <i class="fa-solid fa-file-excel mr-1"></i> Importar Excel
            </button>
            <button id="claims-new-btn" class="btn bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-lg">
              + Novo Sinistro
            </button>
          </div>
        </div>

        <div class="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 text-slate-500 uppercase text-[10px] border-b border-slate-200">
              <tr>
                <th class="p-3.5">Ocorrência</th>
                <th class="p-3.5">Condutor</th>
                <th class="p-3.5">Placa / Modelo</th>
                <th class="p-3.5">Valor Apurado</th>
                <th class="p-3.5">Status</th>
                <th class="p-3.5 text-right">Ação</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${state.claims.map(c => `
                <tr class="hover:bg-slate-50">
                  <td class="p-3.5">
                    <span data-claim-id="${c.id}" class="open-dossier-btn font-bold text-blue-600 hover:underline cursor-pointer">${c.claimNumber}</span>
                    <div class="text-[10px] text-slate-500 font-semibold">${c.occurrenceType}</div>
                  </td>
                  <td class="p-3.5 font-medium text-slate-900">${c.driverName}</td>
                  <td class="p-3.5">
                    <span class="font-mono font-bold text-slate-800">${c.vehiclePlate}</span>
                    <div class="text-[10px] text-slate-400">${c.vehicleModel}</div>
                  </td>
                  <td class="p-3.5 font-bold text-slate-900">${formatCurrency(c.approvedCost)}</td>
                  <td class="p-3.5"><span class="badge ${getStatusBadgeClass(c.status)} px-2.5 py-0.5 rounded text-[10px] font-bold">${c.status}</span></td>
                  <td class="p-3.5 text-right">
                    <button data-claim-id="${c.id}" class="open-dossier-btn btn bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold px-3 py-1 rounded">Ver Dossiê</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  function renderClaimDetailView() {
    const claim = state.claims.find(c => c.id === state.selectedClaimId) || state.claims[0];
    if (!claim) return `<div class="p-8 text-center text-slate-500">Sinistro não encontrado.</div>`;

    return `
      <div class="space-y-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <button class="nav-btn btn bg-white border border-slate-200 text-slate-700 text-xs px-3 py-1.5 rounded-lg" data-view="claims">
              <i class="fa-solid fa-arrow-left mr-1"></i> Voltar à Lista
            </button>
            <h2 class="text-xl font-bold text-slate-900">${claim.claimNumber}</h2>
            <span class="badge ${getStatusBadgeClass(claim.status)} px-2.5 py-0.5 rounded text-xs font-bold">${claim.status}</span>
          </div>
          <div class="flex gap-2">
            <button id="detail-gen-term" class="btn bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-sm">
              <i class="fa-solid fa-wand-magic-sparkles"></i> Gerar Termo Deste Sinistro
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2 space-y-6">
            <div class="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
              <h3 class="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">Informações da Ocorrência</h3>
              <p class="text-xs text-slate-700 leading-relaxed">${claim.description}</p>
              <div class="grid grid-cols-3 gap-4 pt-2 text-xs">
                <div><span class="text-slate-400 block text-[10px] font-bold uppercase">Data / Horário</span><span class="font-bold text-slate-900">${formatDate(claim.date)} às ${claim.time}</span></div>
                <div><span class="text-slate-400 block text-[10px] font-bold uppercase">Local</span><span class="font-bold text-slate-900">${claim.location}</span></div>
                <div><span class="text-slate-400 block text-[10px] font-bold uppercase">Cidade / UF</span><span class="font-bold text-slate-900">${claim.city} / ${claim.state}</span></div>
              </div>
            </div>
          </div>

          <div class="space-y-6">
            <div class="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-3 text-xs">
              <h3 class="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">Condutor & Veículo</h3>
              <div><span class="text-slate-400 block text-[10px] uppercase font-bold">Condutor</span><strong class="text-slate-900">${claim.driverName}</strong></div>
              <div><span class="text-slate-400 block text-[10px] uppercase font-bold">Placa</span><strong class="text-slate-900 font-mono">${claim.vehiclePlate}</strong></div>
              <div><span class="text-slate-400 block text-[10px] uppercase font-bold">Modelo</span><span class="text-slate-700">${claim.vehicleModel}</span></div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderFinesView() {
    return `
      <div class="space-y-6">
        <div class="flex justify-between items-center">
          <div>
            <h2 class="text-xl font-bold text-slate-900">Gestão de Multas de Trânsito</h2>
            <p class="text-xs text-slate-500">Controle de Autos de Infração, penalidades NIC em dobro e parcelamentos.</p>
          </div>
          <button id="fines-import-excel" class="btn bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-lg">
            <i class="fa-solid fa-file-excel mr-1"></i> Importar Multas do Excel
          </button>
        </div>

        <div class="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 text-slate-500 uppercase text-[10px] border-b border-slate-200">
              <tr>
                <th class="p-3.5">Auto de Infração</th>
                <th class="p-3.5">Veículo</th>
                <th class="p-3.5">Condutor</th>
                <th class="p-3.5">Motivo / Enquadramento</th>
                <th class="p-3.5">Valor</th>
                <th class="p-3.5">Vencimento</th>
                <th class="p-3.5">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${state.fines.map(f => `
                <tr class="hover:bg-slate-50">
                  <td class="p-3.5 font-bold font-mono text-slate-900">${f.infractionAuto}</td>
                  <td class="p-3.5 font-mono font-semibold text-slate-800">${f.vehiclePlate}</td>
                  <td class="p-3.5 font-medium text-slate-900">${f.driverName}</td>
                  <td class="p-3.5 text-[11px] text-slate-600 max-w-xs truncate">${f.description}</td>
                  <td class="p-3.5 font-bold text-slate-900">${formatCurrency(f.amount)}</td>
                  <td class="p-3.5 text-slate-600">${formatDate(f.dueDate)}</td>
                  <td class="p-3.5"><span class="badge ${getStatusBadgeClass(f.status)} px-2 py-0.5 rounded text-[10px] font-bold">${f.status}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  function renderTemplateEditorView() {
    return `
      <div class="space-y-6">
        <div>
          <h2 class="text-xl font-bold text-slate-900">Modelos Oficiais Trans Pinho (Editor de Modelos)</h2>
          <p class="text-xs text-slate-500">Configure as cláusulas, variáveis dinâmicas e regras de geração automática.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          ${state.templates.map(t => `
            <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3 select-template-item cursor-pointer hover:border-amber-500 transition" data-template-id="${t.id}">
              <div class="flex justify-between items-start">
                <span class="badge bg-amber-100 text-amber-900 text-[10px] font-extrabold px-2 py-0.5 rounded">${t.category}</span>
                <span class="badge bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">Ativo</span>
              </div>
              <h3 class="font-bold text-slate-900 text-sm">${t.name}</h3>
              <div class="flex flex-wrap gap-1">
                ${t.availableVariables.map(v => `<span class="bg-slate-100 text-slate-600 text-[9px] font-mono px-1.5 py-0.5 rounded">${v}</span>`).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  function renderPeopleView() {
    return `
      <div class="space-y-6">
        <div class="flex justify-between items-center">
          <div>
            <h2 class="text-xl font-bold text-slate-900">Cadastro de Condutores</h2>
            <p class="text-xs text-slate-500">Condutores autorizados e histórico de termos assinados.</p>
          </div>
          <button id="people-import-excel" class="btn bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-lg">
            <i class="fa-solid fa-file-excel mr-1"></i> Importar Condutores
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${state.people.map(p => `
            <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <h3 class="font-bold text-slate-900 text-sm">${p.name}</h3>
                <p class="text-xs text-slate-500">CPF: <strong>${p.docNumber}</strong></p>
                <p class="text-[11px] text-slate-400 mt-1">${p.notes}</p>
              </div>
              <span class="badge bg-blue-100 text-blue-800 text-[10px] font-bold px-2.5 py-1 rounded-full">${p.type}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  function renderVehiclesView() {
    return `
      <div class="space-y-6">
        <div>
          <h2 class="text-xl font-bold text-slate-900">Frota & Prefixos Trans Pinho</h2>
          <p class="text-xs text-slate-500">Veículos cadastrados para vínculo instantâneo nos termos.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          ${state.vehicles.map(v => `
            <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
              <div class="flex justify-between items-start">
                <span class="badge bg-slate-900 text-white text-[10px] font-black px-2 py-0.5 rounded">Prefixo ${v.prefix}</span>
                <span class="badge bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">${v.status}</span>
              </div>
              <h3 class="font-black text-slate-900 text-base font-mono">${v.plate}</h3>
              <p class="text-xs text-slate-600 font-semibold">${v.brand} ${v.model}</p>
              <p class="text-[10px] text-slate-400">Renavam: ${v.renavam} • Ano: ${v.year}</p>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  function renderToast() {
    const tRoot = document.getElementById('toast-root');
    if (!tRoot) return;
    if (!state.toast) { tRoot.innerHTML = ''; return; }
    tRoot.innerHTML = `
      <div class="bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-slide-up">
        <i class="fa-solid fa-circle-check text-emerald-400"></i>
        <span class="text-xs font-semibold">${state.toast.msg}</span>
      </div>
    `;
  }

  function renderModals() {
    const mRoot = document.getElementById('modal-root');
    if (!mRoot) return;

    if (state.showNewClaimModal) {
      mRoot.innerHTML = renderNewClaimModalHtml();
      mRoot.classList.remove('hidden');
    } else if (state.showTermGeneratorModal) {
      mRoot.innerHTML = renderTermGeneratorModalHtml();
      mRoot.classList.remove('hidden');
    } else if (state.showExcelImportModal) {
      mRoot.innerHTML = renderExcelImportModalHtml();
      mRoot.classList.remove('hidden');
    } else if (state.showSearchModal) {
      mRoot.innerHTML = renderSearchModalHtml();
      mRoot.classList.remove('hidden');
    } else {
      mRoot.classList.add('hidden');
      mRoot.innerHTML = '';
    }

    attachModalEvents();
  }

  function renderExcelImportModalHtml() {
    return `
      <div class="bg-white rounded-xl shadow-2xl max-w-xl w-full p-6 space-y-4" onclick="event.stopPropagation()">
        <div class="flex justify-between items-center border-b border-slate-200 pb-3">
          <div class="flex items-center gap-2">
            <i class="fa-solid fa-file-excel text-emerald-600 text-xl"></i>
            <h3 class="font-bold text-slate-900 text-base">Importar Planilha Excel (.xlsx, .xls, .csv)</h3>
          </div>
          <button id="close-modal-btn" class="text-slate-400 hover:text-slate-700 text-lg"><i class="fa-solid fa-xmark"></i></button>
        </div>

        <div id="excel-dropzone" class="border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/50 rounded-xl p-8 text-center cursor-pointer transition">
          <i class="fa-solid fa-cloud-arrow-up text-3xl text-emerald-600 mb-2"></i>
          <p class="text-xs font-bold text-slate-800">Clique para selecionar ou arraste sua planilha Excel aqui</p>
          <p class="text-[10px] text-slate-400 mt-1">Lê automaticamente colunas de Condutor, Placa, Auto, Valor e Vencimento</p>
          <input type="file" id="excel-file-input" accept=".xlsx, .xls, .csv" class="hidden" />
        </div>

        <div class="pt-2 flex justify-end gap-2">
          <button id="close-modal-btn-2" class="btn btn-secondary text-xs px-4 py-2">Fechar</button>
        </div>
      </div>
    `;
  }

  function renderNewClaimModalHtml() {
    return `
      <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto" onclick="event.stopPropagation()">
        <div class="flex justify-between items-center border-b border-slate-200 pb-3">
          <h3 class="font-bold text-slate-900 text-base">Cadastrar Novo Sinistro / Ocorrência</h3>
          <button id="close-modal-btn" class="text-slate-400 hover:text-slate-700 text-lg"><i class="fa-solid fa-xmark"></i></button>
        </div>

        <form id="new-claim-form" class="space-y-4 text-xs">
          <div class="grid grid-cols-3 gap-3">
            <div>
              <label class="form-label text-xs">Tipo de Ocorrência</label>
              <select name="occurrenceType" class="form-select text-xs">
                <option value="Colisão Traseira com Avarias">Colisão Traseira com Avarias</option>
                <option value="Infração por Velocidade + NIC Duplicada">Infração por Velocidade + NIC Duplicada</option>
                <option value="Estacionamento Proibido">Estacionamento Proibido</option>
              </select>
            </div>
            <div>
              <label class="form-label text-xs">Prioridade</label>
              <select name="priority" class="form-select text-xs">
                <option value="Média">Média</option>
                <option value="Alta">Alta</option>
              </select>
            </div>
            <div>
              <label class="form-label text-xs">Status Inicial</label>
              <select name="status" class="form-select text-xs"><option value="Novo">Novo</option></select>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-3">
            <div>
              <label class="form-label text-xs">Placa *</label>
              <input type="text" name="vehiclePlate" value="JCO8C10" class="form-input text-xs font-bold uppercase" required />
            </div>
            <div>
              <label class="form-label text-xs">Modelo / Prefixo *</label>
              <input type="text" name="vehicleModel" value="VW Constellation (Prefixo 24127)" class="form-input text-xs" required />
            </div>
            <div>
              <label class="form-label text-xs">Condutor *</label>
              <input type="text" name="driverName" value="ANDREIA MERCEDES ROCHA DE ARAUJO" class="form-input text-xs" required />
            </div>
          </div>

          <div>
            <label class="form-label text-xs">Descrição Detalhada *</label>
            <textarea name="description" rows="3" placeholder="Descreva a ocorrência..." class="form-textarea text-xs" required></textarea>
          </div>

          <div class="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button type="button" id="close-modal-btn-2" class="btn btn-secondary text-xs px-4 py-2">Cancelar</button>
            <button type="submit" class="btn bg-slate-900 text-white font-bold text-xs px-5 py-2">Cadastrar Sinistro</button>
          </div>
        </form>
      </div>
    `;
  }

  function renderTermGeneratorModalHtml() {
    return `
      <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto" onclick="event.stopPropagation()">
        <div class="flex justify-between items-center border-b border-slate-200 pb-3">
          <div>
            <span class="badge bg-amber-100 text-amber-900 text-[10px] px-2 py-0.5 rounded font-black uppercase">Modelos Oficiais Trans Pinho (5 Modelos)</span>
            <h3 class="font-bold text-slate-900 text-base">Gerador & Personalizador de Termos</h3>
          </div>
          <button id="close-modal-btn" class="text-slate-400 hover:text-slate-700 text-lg"><i class="fa-solid fa-xmark"></i></button>
        </div>

        <form id="gen-term-form" class="space-y-4 text-xs">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="form-label text-xs font-bold">Modelo de Termo *</label>
              <select id="modal-term-template-select" class="form-select text-xs font-bold text-slate-900">
                <option value="multa_nic">1. TERMO DE RESPONSABILIDADE (MULTA + NIC)</option>
                <option value="infracao_direta">2. TERMO DE RESPONSABILIDADE (INFRAÇÃO DIRETA)</option>
                <option value="desconto_folha">3. TERMO DE CIÊNCIA E DESCONTO EM FOLHA (GERAL)</option>
                <option value="termo_quitacao">4. TERMO DE QUITAÇÃO (CHAPEAÇÃO & REPAROS)</option>
                <option value="desconto_folha_terceiro">5. TERMO DE DESCONTO EM FOLHA (COLISÃO TERCEIRO)</option>
              </select>
            </div>
            <div>
              <label class="form-label text-xs font-bold">Condutor *</label>
              <select id="modal-term-driver-select" class="form-select text-xs font-semibold">
                <option value="ANDREIA MERCEDES ROCHA DE ARAUJO|002.574.880-73|JCO8C10|24127">ANDREIA MERCEDES ROCHA DE ARAUJO (CPF 002.574.880-73)</option>
                <option value="MICHELE ROSA DA ROSA|016.998.180-02|TRD3E72|226">MICHELE ROSA DA ROSA (CPF 016.998.180-02)</option>
                <option value="GELSON WEBER DE FARIAS|629.109.220-49|HKO8087|1961">GELSON WEBER DE FARIAS (CPF 629.109.220-49)</option>
                <option value="MARCELO TEIXEIRA DA SILVA|031.997.250-07|IZF4E82|1980">MARCELO TEIXEIRA DA SILVA (CPF 031.997.250-07)</option>
              </select>
            </div>
          </div>

          <!-- Payment Options Block -->
          <div class="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
            <label class="form-label text-xs font-black text-slate-800">Forma de Pagamento e Quitação</label>
            <div class="flex gap-4">
              <label class="flex items-center gap-1.5 cursor-pointer font-bold text-slate-700">
                <input type="radio" name="modal_paymode" value="parcelado" checked class="modal-paymode-radio" />
                ☑ Parcelado
              </label>
              <label class="flex items-center gap-1.5 cursor-pointer font-bold text-slate-700">
                <input type="radio" name="modal_paymode" value="cota_unica" class="modal-paymode-radio" />
                ☐ Cota Única
              </label>
            </div>

            <div id="modal-parcelado-fields" class="grid grid-cols-3 gap-3">
              <div>
                <label class="form-label text-xs">Quantidade de Parcelas</label>
                <select id="modal-installments-input" class="form-select text-xs font-bold">
                  <option value="2" selected>2x Parcelas</option>
                  <option value="3">3x Parcelas</option>
                  <option value="5">5x Parcelas</option>
                  <option value="10">10x Parcelas</option>
                  <option value="15">15x Parcelas</option>
                </select>
              </div>
              <div>
                <label class="form-label text-xs">Valor Total (R$)</label>
                <input type="number" step="0.01" id="modal-total-input" value="260.32" class="form-input text-xs font-bold" />
              </div>
              <div>
                <label class="form-label text-xs">Data 1ª Parcela</label>
                <input type="text" id="modal-first-due-input" value="06/07/2026" class="form-input text-xs font-bold text-center" placeholder="DD/MM/AAAA" />
              </div>
            </div>

            <div id="modal-cota-unica-fields" class="hidden">
              <label class="form-label text-xs">Data de Vencimento (Cota Única)</label>
              <input type="text" id="modal-single-due-input" value="06/07/2026" class="form-input text-xs font-bold text-center w-44" placeholder="DD/MM/AAAA" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="form-label text-xs">Data do Documento (Exibida no Termo)</label>
              <input type="text" id="modal-doc-date-input" value="19 de Junho de 2026" class="form-input text-xs font-bold" placeholder="Ex: 19 de Junho de 2026" />
            </div>
            <div>
              <label class="form-label text-xs">Cidade</label>
              <input type="text" value="GRAVATAÍ" class="form-input text-xs font-bold bg-slate-100" readonly />
            </div>
          </div>

          <div class="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button type="button" id="close-modal-btn-2" class="btn btn-secondary text-xs px-4 py-2">Cancelar</button>
            <button type="submit" class="btn bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-5 py-2">Emitir & Imprimir Termo</button>
          </div>
        </form>
      </div>
    `;
  }

  function renderSearchModalHtml() {
    return `
      <div class="bg-white rounded-xl shadow-2xl max-w-xl w-full p-4 space-y-3" onclick="event.stopPropagation()">
        <div class="flex items-center gap-3 border-b border-slate-200 pb-3">
          <i class="fa-solid fa-magnifying-glass text-slate-400"></i>
          <input type="text" id="search-modal-input" placeholder="Pesquise por Andreia, Gelson, Marcelo, JCO8C10, TQQ6H24..." value="${state.searchQuery}" class="w-full text-xs focus:outline-none" autofocus />
          <button id="close-modal-btn" class="text-slate-400 text-xs">ESC</button>
        </div>
        <div id="search-modal-results" class="max-h-64 overflow-y-auto text-xs space-y-2">
          ${renderSearchResultsHtml()}
        </div>
      </div>
    `;
  }

  function renderSearchResultsHtml() {
    if (!state.searchQuery.trim()) return `<p class="text-slate-400 text-center py-4">Digite para buscar...</p>`;
    const q = state.searchQuery.toLowerCase();
    const matched = state.claims.filter(c => c.claimNumber.toLowerCase().includes(q) || c.vehiclePlate.toLowerCase().includes(q) || c.driverName.toLowerCase().includes(q));

    if (matched.length === 0) return `<p class="text-slate-500 text-center py-4">Nenhum resultado encontrado.</p>`;

    return matched.map(c => `
      <div data-claim-id="${c.id}" class="open-dossier-btn p-2.5 bg-slate-50 hover:bg-amber-50 rounded-lg cursor-pointer flex justify-between items-center">
        <div>
          <span class="font-bold text-slate-900">${c.claimNumber}</span> - <span class="font-semibold text-slate-700">${c.driverName}</span>
          <p class="text-[10px] text-slate-400">Placa: ${c.vehiclePlate}</p>
        </div>
        <span class="badge ${getStatusBadgeClass(c.status)} px-2 py-0.5 rounded text-[9px] font-bold">${c.status}</span>
      </div>
    `).join('');
  }

  function attachEvents() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const view = e.currentTarget.getAttribute('data-view');
        if (view) { state.currentView = view; renderApp(); }
      });
    });

    // Term Quick Customizer Listeners
    document.querySelectorAll('.term-paymode-toggle').forEach(radio => {
      radio.addEventListener('change', (e) => {
        const termId = e.currentTarget.getAttribute('data-term-id');
        const term = state.terms.find(t => t.id === termId);
        if (term) {
          term.paymentMode = e.currentTarget.value;
          renderApp();
        }
      });
    });

    document.querySelectorAll('.term-installments-select').forEach(sel => {
      sel.addEventListener('change', (e) => {
        const termId = e.currentTarget.getAttribute('data-term-id');
        const term = state.terms.find(t => t.id === termId);
        if (term) {
          term.installments = parseInt(e.currentTarget.value) || 2;
          term.installmentAmount = (term.totalAmount || 260.32) / term.installments;
          renderApp();
        }
      });
    });

    document.querySelectorAll('.term-first-due-input').forEach(inp => {
      inp.addEventListener('input', (e) => {
        const termId = e.currentTarget.getAttribute('data-term-id');
        const term = state.terms.find(t => t.id === termId);
        if (term) {
          term.firstDueDate = e.currentTarget.value;
          const previewEl = e.currentTarget.closest('.space-y-4')?.querySelector('.bg-white.p-8');
          if (previewEl) previewEl.innerHTML = buildTermHtml(term);
        }
      });
    });

    document.querySelectorAll('.term-single-due-input').forEach(inp => {
      inp.addEventListener('input', (e) => {
        const termId = e.currentTarget.getAttribute('data-term-id');
        const term = state.terms.find(t => t.id === termId);
        if (term) {
          term.singleDueDate = e.currentTarget.value;
          const previewEl = e.currentTarget.closest('.space-y-4')?.querySelector('.bg-white.p-8');
          if (previewEl) previewEl.innerHTML = buildTermHtml(term);
        }
      });
    });

    document.querySelectorAll('.term-doc-date-input').forEach(inp => {
      inp.addEventListener('input', (e) => {
        const termId = e.currentTarget.getAttribute('data-term-id');
        const term = state.terms.find(t => t.id === termId);
        if (term) {
          term.documentDate = e.currentTarget.value;
          const previewEl = e.currentTarget.closest('.space-y-4')?.querySelector('.bg-white.p-8');
          if (previewEl) previewEl.innerHTML = buildTermHtml(term);
        }
      });
    });

    // BUDGET & OS VIEW LISTENERS
    if (state.currentView === 'budgets') {
      document.getElementById('budget-tab-editor')?.addEventListener('click', () => { state.budgetTab = 'editor'; renderApp(); });
      document.getElementById('budget-tab-history')?.addEventListener('click', () => { state.budgetTab = 'history'; renderApp(); });

      // Save to History
      document.getElementById('budget-save-history-btn')?.addEventListener('click', () => {
        const osNum = state.budget.osNumber;
        const existsIdx = state.budgetHistory.findIndex(h => h.osNumber === osNum);
        const record = JSON.parse(JSON.stringify(state.budget));
        if (existsIdx >= 0) {
          state.budgetHistory[existsIdx] = record;
        } else {
          state.budgetHistory.unshift(record);
        }
        showToast(`Orçamento ${osNum} salvo no histórico com sucesso!`, 'info');
        renderApp();
      });

      // Pull from existing Claim
      document.getElementById('budget-pull-claim-btn')?.addEventListener('click', () => {
        const cl = state.claims[0];
        if (cl) {
          state.budget.clientName = 'Trans Pinho (João Batista de Souza Pinho EPP)';
          state.budget.clientCnpj = '94.476.207/0001-80';
          state.budget.vehiclePlate = cl.vehiclePlate;
          state.budget.vehicleModel = cl.vehicleModel;
          state.budget.report = `Ocorrência ${cl.claimNumber}: ${cl.description}`;
          showToast(`Dados puxados do sinistro ${cl.claimNumber}!`, 'info');
          renderApp();
        }
      });

      document.getElementById('budget-new-btn')?.addEventListener('click', () => {
        if (!confirm('Iniciar novo orçamento em branco?')) return;
        state.budget = {
          osNumber: `OS-2026-${Date.now().toString().slice(-4)}`,
          date: new Date().toLocaleDateString('pt-BR'),
          status: 'Em Análise',
          warrantyDays: 90,
          validityDays: 15,
          clientName: 'Trans Pinho (João Batista de Souza Pinho EPP)',
          clientCnpj: '94.476.207/0001-80',
          clientPhone: '(51) 98266-0028',
          clientEmail: 'operacional@transpinho.com',
          vehicleModel: '',
          vehiclePlate: '',
          vehicleColor: '',
          vehicleKm: '',
          responsibleTechnician: 'Fabiano da Silva Vieira',
          report: '',
          items: [{ id: Date.now(), type: 'MO', description: '', qty: 1, value: 0 }],
          materials: [],
          pix: '(51) 99432-4224',
          bank: 'Itaú Unibanco (Ag: 0142 | CC: 44920-1)',
          payee: 'Fabiano da Silva Vieira',
          showSignatures: true
        };
        state.budgetTab = 'editor';
        renderApp();
      });

      // Load / Delete from History
      document.querySelectorAll('.load-os-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const osNum = e.currentTarget.getAttribute('data-os');
          const found = state.budgetHistory.find(h => h.osNumber === osNum);
          if (found) {
            state.budget = JSON.parse(JSON.stringify(found));
            state.budgetTab = 'editor';
            showToast(`Orçamento ${osNum} carregado!`, 'info');
            renderApp();
          }
        });
      });

      document.querySelectorAll('.delete-os-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const osNum = e.currentTarget.getAttribute('data-os');
          state.budgetHistory = state.budgetHistory.filter(h => h.osNumber !== osNum);
          showToast(`Orçamento ${osNum} excluído do histórico.`, 'info');
          renderApp();
        });
      });

      // Budget Basic Inputs
      ['b-os-number', 'b-date', 'b-client-name', 'b-client-cnpj', 'b-client-phone', 'b-client-email', 'b-vehicle-model', 'b-vehicle-plate', 'b-vehicle-color', 'b-vehicle-km', 'b-report', 'b-pix', 'b-bank', 'b-payee'].forEach(id => {
        document.getElementById(id)?.addEventListener('input', (e) => {
          const map = {
            'b-os-number': 'osNumber', 'b-date': 'date', 'b-client-name': 'clientName', 'b-client-cnpj': 'clientCnpj',
            'b-client-phone': 'clientPhone', 'b-client-email': 'clientEmail', 'b-vehicle-model': 'vehicleModel',
            'b-vehicle-plate': 'vehiclePlate', 'b-vehicle-color': 'vehicleColor', 'b-vehicle-km': 'vehicleKm',
            'b-report': 'report', 'b-pix': 'pix', 'b-bank': 'bank', 'b-payee': 'payee'
          };
          const prop = map[id];
          if (prop) {
            state.budget[prop] = e.target.value;
            const pdfEl = document.getElementById('pdf-content');
            if (pdfEl) renderApp();
          }
        });
      });

      // Add / Delete Item
      document.getElementById('add-item-btn')?.addEventListener('click', () => {
        state.budget.items.push({ id: Date.now(), type: 'MO', description: '', qty: 1, value: 0 });
        renderApp();
      });
      document.querySelectorAll('.del-item-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const idx = parseInt(e.currentTarget.getAttribute('data-idx'));
          state.budget.items.splice(idx, 1);
          renderApp();
        });
      });
      document.querySelectorAll('.item-type-select').forEach(el => el.addEventListener('change', (e) => { state.budget.items[e.target.dataset.idx].type = e.target.value; renderApp(); }));
      document.querySelectorAll('.item-desc-input').forEach(el => el.addEventListener('input', (e) => { state.budget.items[e.target.dataset.idx].description = e.target.value; }));
      document.querySelectorAll('.item-qty-input').forEach(el => el.addEventListener('input', (e) => { state.budget.items[e.target.dataset.idx].qty = parseFloat(e.target.value) || 0; renderApp(); }));
      document.querySelectorAll('.item-val-input').forEach(el => el.addEventListener('input', (e) => { state.budget.items[e.target.dataset.idx].value = parseFloat(e.target.value) || 0; renderApp(); }));

      // Add / Delete Material
      document.getElementById('add-material-btn')?.addEventListener('click', () => {
        state.budget.materials.push({ id: Date.now(), description: '', qty: 1, value: 0 });
        renderApp();
      });
      document.querySelectorAll('.del-mat-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const idx = parseInt(e.currentTarget.getAttribute('data-idx'));
          state.budget.materials.splice(idx, 1);
          renderApp();
        });
      });
      document.querySelectorAll('.mat-desc-input').forEach(el => el.addEventListener('input', (e) => { state.budget.materials[e.target.dataset.idx].description = e.target.value; }));
      document.querySelectorAll('.mat-qty-input').forEach(el => el.addEventListener('input', (e) => { state.budget.materials[e.target.dataset.idx].qty = parseFloat(e.target.value) || 0; renderApp(); }));
      document.querySelectorAll('.mat-val-input').forEach(el => el.addEventListener('input', (e) => { state.budget.materials[e.target.dataset.idx].value = parseFloat(e.target.value) || 0; renderApp(); }));

      // Download PDF via html2pdf
      document.getElementById('budget-download-pdf')?.addEventListener('click', () => {
        const plate = (state.budget.vehiclePlate || '').trim().toUpperCase();
        const filename = `Orçamento - ${plate || state.budget.osNumber}.pdf`;
        const element = document.getElementById('pdf-content');
        if (element && window.html2pdf) {
          const opt = {
            margin: 0,
            filename,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
          };
          window.html2pdf().set(opt).from(element).save();
          showToast('Download do PDF do Orçamento iniciado com sucesso!', 'info');
        }
      });

      // PDF.js Supplier PDF Material Reader
      const pdfFileInput = document.getElementById('import-materials-pdf-input');
      if (pdfFileInput) {
        pdfFileInput.onchange = async function (e) {
          const file = e.target.files[0];
          if (!file || !window.pdfjsLib) return;
          try {
            showToast('Lendo PDF do fornecedor...', 'info');
            const buffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
            let fullText = '';
            for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              const content = await page.getTextContent();
              fullText += content.items.map(it => it.str).join(' ') + '\n';
            }

            const lines = fullText.split('\n');
            const parsed = [];
            lines.forEach((l, idx) => {
              const numMatch = l.match(/([\d.,]+)\s+([\d.,]+)$/);
              if (numMatch && l.length > 5) {
                const val = parseFloat(numMatch[2].replace('.', '').replace(',', '.')) || 0;
                const qty = parseFloat(numMatch[1].replace('.', '').replace(',', '.')) || 1;
                const desc = l.replace(numMatch[0], '').trim();
                if (desc && val > 0) {
                  parsed.push({ id: Date.now() + idx, description: desc, qty, value: val });
                }
              }
            });

            if (parsed.length > 0) {
              state.budget.materials = parsed;
              showToast(`${parsed.length} materiais importados do PDF!`, 'info');
            } else {
              showToast('PDF lido! Adicione itens manualmente se necessário.', 'info');
            }
            renderApp();
          } catch (err) {
            console.error(err);
            alert('Não foi possível ler o arquivo PDF.');
          }
        };
      }
    }

    document.getElementById('search-trigger')?.addEventListener('click', () => { state.showSearchModal = true; renderModals(); });
    document.getElementById('open-excel-import')?.addEventListener('click', () => { state.showExcelImportModal = true; renderModals(); });
    document.getElementById('dash-import-excel')?.addEventListener('click', () => { state.showExcelImportModal = true; renderModals(); });
    document.getElementById('claims-import-excel')?.addEventListener('click', () => { state.showExcelImportModal = true; renderModals(); });
    document.getElementById('fines-import-excel')?.addEventListener('click', () => { state.showExcelImportModal = true; renderModals(); });
    document.getElementById('people-import-excel')?.addEventListener('click', () => { state.showExcelImportModal = true; renderModals(); });

    document.getElementById('open-new-claim')?.addEventListener('click', () => { state.showNewClaimModal = true; renderModals(); });
    document.getElementById('claims-new-btn')?.addEventListener('click', () => { state.showNewClaimModal = true; renderModals(); });
    document.getElementById('dash-new-term')?.addEventListener('click', () => { state.showTermGeneratorModal = true; renderModals(); });
    document.getElementById('terms-open-gen')?.addEventListener('click', () => { state.showTermGeneratorModal = true; renderModals(); });
    document.getElementById('detail-gen-term')?.addEventListener('click', () => { state.showTermGeneratorModal = true; renderModals(); });

    document.onkeydown = function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault(); state.showSearchModal = true; renderModals();
      } else if (e.key === 'Escape') {
        state.showSearchModal = false; state.showNewClaimModal = false; state.showTermGeneratorModal = false; state.showExcelImportModal = false; renderModals();
      }
    };
  }

  function attachModalEvents() {
    const modalRoot = document.getElementById('modal-root');
    if (!modalRoot) return;

    modalRoot.onclick = function () {
      state.showSearchModal = false; state.showNewClaimModal = false; state.showTermGeneratorModal = false; state.showExcelImportModal = false; renderModals();
    };

    document.querySelectorAll('#close-modal-btn, #close-modal-btn-2').forEach(b => {
      b.onclick = function () {
        state.showSearchModal = false; state.showNewClaimModal = false; state.showTermGeneratorModal = false; state.showExcelImportModal = false; renderModals();
      };
    });

    // Modal Paymode Switch
    document.querySelectorAll('.modal-paymode-radio').forEach(r => {
      r.addEventListener('change', (e) => {
        const isParc = e.target.value === 'parcelado';
        const parcFields = document.getElementById('modal-parcelado-fields');
        const singleFields = document.getElementById('modal-cota-unica-fields');
        if (parcFields && singleFields) {
          if (isParc) {
            parcFields.classList.remove('hidden');
            singleFields.classList.add('hidden');
          } else {
            parcFields.classList.add('hidden');
            singleFields.classList.remove('hidden');
          }
        }
      });
    });

    // Generate Term Form Submit
    const genForm = document.getElementById('gen-term-form');
    if (genForm) {
      genForm.onsubmit = function (e) {
        e.preventDefault();
        const tmplType = document.getElementById('modal-term-template-select').value;
        const driverRaw = document.getElementById('modal-term-driver-select').value;
        const [driverName, driverCpf, driverPlate, driverPrefix] = driverRaw.split('|');
        const paymode = document.querySelector('.modal-paymode-radio:checked')?.value || 'parcelado';
        const installments = parseInt(document.getElementById('modal-installments-input')?.value) || 2;
        const total = parseFloat(document.getElementById('modal-total-input')?.value) || 260.32;
        const firstDue = document.getElementById('modal-first-due-input')?.value || '06/07/2026';
        const singleDue = document.getElementById('modal-single-due-input')?.value || '06/07/2026';
        const docDate = document.getElementById('modal-doc-date-input')?.value || '19 de Junho de 2026';

        const titles = {
          'multa_nic': 'TERMO DE RESPONSABILIDADE - MULTAS & NÃO INDICAÇÃO',
          'infracao_direta': 'TERMO DE RESPONSABILIDADE - INFRAÇÃO DIRETA',
          'desconto_folha': 'TERMO DE CIÊNCIA E AUTORIZAÇÃO DE DESCONTO EM FOLHA DE PAGAMENTO',
          'termo_quitacao': 'TERMO DE QUITAÇÃO - REPAROS E ADESIVOS CHAPEAÇÃO',
          'desconto_folha_terceiro': 'TERMO DE CIÊNCIA E DESCONTO EM FOLHA (VOLARE x RENAULT MASTER)'
        };

        const newTerm = {
          id: `trm-gen-${Date.now()}`,
          title: titles[tmplType] || 'TERMO DE RESPONSABILIDADE',
          type: tmplType === 'termo_quitacao' ? 'Termo de Quitação' : (tmplType.includes('desconto') ? 'Termo de ciência e autorização de desconto' : 'Termo de Responsabilidade'),
          templateType: tmplType,
          date: new Date().toISOString().split('T')[0],
          documentDate: docDate,
          responsible: state.currentUser.name,
          involvedPerson: driverName,
          cpf: driverCpf,
          plate: driverPlate,
          prefix: driverPrefix,
          paymentMode: paymode,
          installments: installments,
          installmentAmount: total / installments,
          totalAmount: total,
          firstDueDate: firstDue,
          singleDueDate: singleDue,
          status: 'Assinado'
        };

        state.terms.unshift(newTerm);
        state.showTermGeneratorModal = false;
        renderModals();
        state.currentView = 'terms';
        renderApp();
        showToast('Novo Termo Oficial gerado com sucesso!', 'info');

        // Automatically open pixel-perfect print
        setTimeout(() => {
          window.printDocumentDirectly(newTerm.id);
        }, 300);
      };
    }

    const dropzone = document.getElementById('excel-dropzone');
    const fileInput = document.getElementById('excel-file-input');

    if (dropzone && fileInput) {
      dropzone.onclick = () => fileInput.click();
      fileInput.onchange = function (e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (evt) {
          try {
            const data = new Uint8Array(evt.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const json = XLSX.utils.sheet_to_json(worksheet);

            if (json && json.length > 0) {
              json.forEach((row, idx) => {
                const auto = row['Auto'] || row['Auto de Infração'] || row['Auto de Infracao'] || `AUTO-${Date.now()}-${idx}`;
                const placa = row['Placa'] || row['Veículo'] || 'JCO8C10';
                const condutor = row['Condutor'] || row['Nome'] || 'ANDREIA MERCEDES ROCHA DE ARAUJO';
                const desc = row['Descrição'] || row['Enquadramento'] || row['Motivo'] || 'Infração de trânsito importada via Excel';
                const valor = parseFloat(row['Valor'] || row['Valor Total'] || 130.16);
                const venc = row['Vencimento'] || row['Data'] || '2026-07-06';

                state.fines.unshift({
                  id: `fine-xl-${Date.now()}-${idx}`,
                  infractionAuto: auto,
                  vehiclePlate: placa,
                  driverName: condutor,
                  description: desc,
                  amount: valor,
                  points: 4,
                  dueDate: venc,
                  status: 'Pendente'
                });
              });

              showToast(`${json.length} registros importados da planilha Excel com sucesso!`, 'info');
              state.showExcelImportModal = false;
              renderModals();
              state.currentView = 'fines';
              renderApp();
            }
          } catch (err) {
            console.error(err);
            alert('Erro ao processar o arquivo Excel.');
          }
        };
        reader.readAsArrayBuffer(file);
      };
    }
  }

  // Boot
  renderApp();
})();
