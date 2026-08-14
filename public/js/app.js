/* ==========================================================================
   NexClaim Enterprise - Trans Pinho Focused Engine (Pixel-Perfect PDF Terms)
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
    { id: 'peo-2', name: 'MICHELE ROSA DA ROSA', docNumber: '016.998.180-02', phone: '(51) 98765-4321', email: 'michele.rosa@transpinho.com', address: 'Gravataí/RS', type: 'Condutor', notes: 'CNH Categoria C. Prefixo: 226' }
  ];

  const defaultSeedVehicles = [
    { id: 'veh-1', plate: 'JCO8C10', prefix: '24127', renavam: '01928374650', brand: 'Volkswagen', model: 'Constellation 24.280', year: 2024, color: 'Branco', status: 'Ativo' },
    { id: 'veh-2', plate: 'TRD3E72', prefix: '226', renavam: '82716354901', brand: 'Mercedes-Benz', model: 'Atego 1719', year: 2023, color: 'Prata', status: 'Ativo' }
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
      name: 'Termo de Ciência e Autorização de Desconto em Folha',
      category: 'Ciência',
      isActive: true,
      conditionRules: { occurrenceType: 'colisao' },
      availableVariables: ['{{nome_condutor}}', '{{cpf_condutor}}', '{{placa}}', '{{valor_total}}', '{{data_sinistro}}'],
      content: `TERMO DE CIÊNCIA E AUTORIZAÇÃO DE DESCONTO EM FOLHA DE PAGAMENTO\n\nEu, {{nome_condutor}}, inscrito no CPF sob nº {{cpf_condutor}}, declaro, para os devidos fins de direito, na qualidade de condutor do veículo VW Constellation, placa {{placa}}, envolvido na ocorrência de trânsito nº SIN-2026-00124, que:\n\nI – Da ciência e reconhecimento da ocorrência\nDeclaro estar plenamente ciente dos fatos relacionados à ocorrência acima descrita, bem como dos danos materiais dela decorrentes.\n\nII – Do reconhecimento de responsabilidade\nReconheço minha responsabilidade pelos danos ocasionados em decorrência do referido evento, assumindo integralmente a obrigação referente ao ressarcimento dos prejuízos apurados, no valor total de {{valor_total}}.\n\nIII – Da autorização de desconto em folha\nAutorizo, de forma expressa, livre, consciente e inequívoca, nos termos da legislação aplicável e do acordo firmado entre as partes, o desconto do valor acima mencionado em minha folha de pagamento/contracheque, mediante o seguinte parcelamento:\n\nValor total: {{valor_total}}\nParcelamento: 05 (cinco) parcelas mensais e sucessivas de R$ 700,00\n\nDeclaro que assino o presente instrumento por minha livre e espontânea vontade, sem qualquer vício de consentimento, estando ciente de todos os seus termos, efeitos e consequências jurídicas.\n\nGravataí, {{data_sinistro}}\n\n___________________________________________\n{{nome_condutor}}`
    }
  ];

  function buildTermHtml(term) {
    if (term.templateType === 'desconto_folha' || term.type === 'Termo de ciência e autorização de desconto') {
      const isParc = term.paymentMode === 'parcelado';
      const parcelText = isParc 
        ? `0${term.installments || 5} (${term.installments === 5 ? 'cinco' : term.installments}) parcelas mensais e sucessivas de ${formatCurrency(term.installmentAmount || (term.totalAmount / (term.installments || 5)))}`
        : `Cota Única com desconto integral no valor de ${formatCurrency(term.totalAmount)}`;

      return `
        <div style="text-align: right; margin-bottom: 12px;">
          <img src="/images/logo.png" alt="Trans Pinho" style="height: 55px; display: inline-block;" />
        </div>

        <div class="title" style="text-align: center; font-size: 12pt; font-weight: bold; margin-bottom: 18px;">
          TERMO DE CIÊNCIA E AUTORIZAÇÃO DE DESCONTO EM FOLHA DE PAGAMENTO
        </div>

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

        <p style="margin-top: 12px;">
          Declaro que assino o presente instrumento por minha livre e espontânea vontade, sem qualquer vício de consentimento, estando ciente de todos os seus termos, efeitos e consequências jurídicas.
        </p>

        <p style="margin-top: 20px; margin-bottom: 30px;">
          Gravataí, ${term.documentDate || '15 de Junho de 2026'}
        </p>

        <div class="signature-section">
          <div class="signature-line"></div>
          <div class="signature-name">${term.involvedPerson}</div>
        </div>
      `;
    }

    if (term.templateType === 'infracao_direta') {
      return `
        <div class="title" style="margin-top: 18px; margin-bottom: 18px;">TERMO DE RESPONSABILIDADE</div>

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

        <p style="margin-top: 18px; margin-bottom: 30px;">
          GRAVATAÍ, ${term.documentDate || '24 de Junho de 2026'}.
        </p>

        <div class="signature-section">
          <div class="signature-line"></div>
          <div class="signature-sub">Assinatura do Condutor</div>
          <div class="signature-name" style="margin-top: 4px;">${term.involvedPerson}</div>
        </div>

        <div class="footer" style="margin-top: 40px;">
          <strong>JOÃO BATISTA DE SOUZA PINHO EPP (TRANS PINHO)</strong><br>
          Rua Florida, 116 – Nossa Chácara – Gravataí/ RS<br>
          (051) 3047-0212 / 98266-0028 | Transpinho@transpinho.com
        </div>
      `;
    }

    // Default: Termo de Responsabilidade Multas & NIC Duplicada
    const isParcelado = term.paymentMode === 'parcelado';
    const cotaUnicaChecked = isParcelado ? '☐' : '☑';
    const parceladoChecked = isParcelado ? '☑' : '☐';
    const numParc = term.installments || 2;
    const valParc = term.installmentAmount || (term.totalAmount / numParc);

    return `
      <div class="title" style="margin-top: 14px; margin-bottom: 16px;">TERMO DE RESPONSABILIDADE</div>

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
      </div>

      <div class="footer">
        <strong>JOÃO BATISTA DE SOUZA PINHO EPP (TRANS PINHO)</strong><br>
        Rua Florida, 116 – Nossa Chácara – Gravataí/ RS<br>
        (051) 3047-0212 / 98266-0028 | Transpinho@transpinho.com
      </div>
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
    }
  ];

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
    activeClaimDossier: null,
    searchQuery: '',
    showSearchModal: false,
    showNewClaimModal: false,
    showTermGeneratorModal: false,
    showExcelImportModal: false,
    selectedTemplateForEdit: null,
    toast: null
  };

  // Dedicated Print Function (Zero SPA CSS Collision, 100% Faithful A4 PDF)
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
          body {
            font-family: 'Times New Roman', Times, Georgia, serif;
            font-size: 10.5pt;
            line-height: 1.32;
            color: #000000;
            background: #ffffff;
            padding: 4px;
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
          .footer {
            margin-top: 22px;
            text-align: center;
            font-size: 8.5pt;
            color: #333333;
            line-height: 1.3;
          }
        </style>
      </head>
      <body onload="window.focus(); window.print();">
        ${term.exactHtml}
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
      { id: 'dashboard', label: 'Painel Trans Pinho', icon: 'fa-chart-pie' },
      { id: 'claims', label: 'Sinistros & Ocorrências', icon: 'fa-folder-closed', badge: state.claims.length },
      { id: 'fines', label: 'Multas de Trânsito', icon: 'fa-file-invoice-dollar', badge: state.fines.length },
      { id: 'templates', label: 'Modelos de Documentos', icon: 'fa-sliders', isNew: true },
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
                  ${item.isNew ? '<span class="px-1.5 py-0.5 rounded text-[8px] font-black bg-blue-500/20 text-blue-300 border border-blue-500/30">ADMIN</span>' : ''}
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
      <header class="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between z-20 shadow-xs">
        <div class="flex items-center gap-4 flex-1 max-w-md">
          <div id="search-trigger" class="w-full bg-slate-100 hover:bg-slate-200/80 border border-slate-200 rounded-lg px-3.5 py-2 flex items-center justify-between text-xs text-slate-500 cursor-pointer transition-all">
            <div class="flex items-center gap-2.5">
              <i class="fa-solid fa-magnifying-glass text-slate-400"></i>
              <span>Pesquisar por Condutor, Placa, Prefixo, Auto...</span>
            </div>
            <kbd class="bg-white border border-slate-300 rounded px-1.5 py-0.5 text-[10px] font-mono text-slate-500">Ctrl + K</kbd>
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
            <p class="text-xs text-slate-300 mt-1">Selecione entre Cota Única ou Parcelado, altere as datas livremente e imprima o documento oficial A4.</p>
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
                        ${[1,2,3,4,5,6,10,12].map(n => `
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

                <!-- Pixel-Perfect Term Preview Container -->
                <div class="bg-white p-8 max-w-[210mm] mx-auto border border-slate-200 shadow-sm rounded-lg" style="font-family: 'Times New Roman', Times, Georgia, serif; color: #000000; line-height: 1.32; font-size: 10.5pt;">
                  ${buildTermHtml(t)}
                </div>
              </div>
            `;
          }).join('')}
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
            <p class="text-xs text-slate-500 mt-0.5">Emissão de Termos Oficiais, Leitura de Excel (.xlsx) e Controle de Multas NIC.</p>
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
            <span class="text-xs font-bold uppercase text-slate-400">Multas & Infração</span>
            <div class="mt-2 flex items-baseline gap-2">
              <span class="text-2xl font-black text-slate-900">${state.fines.length}</span>
              <span class="text-[11px] font-semibold text-rose-600">Com NIC e Parcelamento</span>
            </div>
          </div>

          <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <span class="text-xs font-bold uppercase text-slate-400">Modelos de Templates</span>
            <div class="mt-2 flex items-baseline gap-2">
              <span class="text-2xl font-black text-slate-900">${state.templates.length}</span>
              <span class="text-[11px] font-semibold text-amber-600">Com Variáveis</span>
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
                  <td class="p-3.5 font-bold text-slate-800">${c.driverName}</td>
                  <td class="p-3.5"><span class="font-bold font-mono bg-amber-100 border border-amber-300 px-1.5 py-0.5 rounded text-[11px]">${c.vehiclePlate}</span><div class="text-[10px] text-slate-500">${c.vehicleModel}</div></td>
                  <td class="p-3.5 font-bold text-slate-900">${formatCurrency(c.estimatedCost)}</td>
                  <td class="p-3.5"><span class="badge ${getStatusBadgeClass(c.status)} px-2.5 py-0.5 rounded-full text-[10px] font-bold">${c.status}</span></td>
                  <td class="p-3.5 text-right">
                    <button data-claim-id="${c.id}" class="open-dossier-btn btn bg-slate-900 text-white hover:bg-slate-800 text-xs px-3 py-1.5 rounded-lg font-bold">Abrir Dossiê</button>
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
    const claim = state.claims.find(cl => cl.id === state.selectedClaimId) || state.claims[0];

    return `
      <div class="space-y-6">
        <div class="flex items-center justify-between text-xs text-slate-500">
          <button data-view="claims" class="nav-btn font-bold text-blue-600 hover:underline">← Voltar para Sinistros</button>
          <span class="font-mono text-[11px]">JOÃO BATISTA DE SOUZA PINHO EPP (TRANS PINHO)</span>
        </div>

        <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <span class="badge bg-amber-100 text-amber-900 font-extrabold text-[10px] px-2.5 py-0.5 rounded border border-amber-300">DOSSIÊ DIGITAL OFICIAL</span>
              <h2 class="text-2xl font-black text-slate-900 mt-1">${claim.claimNumber}</h2>
              <p class="text-xs text-slate-500 font-mono">Protocolo: ${claim.protocol} • Data: ${formatDate(claim.date)} às ${claim.time}</p>
            </div>
            <div class="flex gap-2">
              <button id="detail-gen-term" class="btn bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-4 py-2 rounded-lg">
                <i class="fa-solid fa-file-pen mr-1"></i> Emitir Termo Oficial
              </button>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div class="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span class="text-[10px] font-bold text-slate-400 uppercase">Condutor Declarado</span>
              <p class="text-sm font-bold text-slate-900 mt-0.5">${claim.driverName}</p>
            </div>
            <div class="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span class="text-[10px] font-bold text-slate-400 uppercase">Veículo / Prefixo</span>
              <p class="text-sm font-bold text-slate-900 mt-0.5">${claim.vehiclePlate} (${claim.vehicleModel})</p>
            </div>
            <div class="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span class="text-[10px] font-bold text-slate-400 uppercase">Valor Apurado</span>
              <p class="text-sm font-bold text-slate-900 mt-0.5">${formatCurrency(claim.estimatedCost)}</p>
            </div>
          </div>

          <div class="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <h4 class="font-bold text-slate-900 uppercase text-[11px] mb-1">Descrição do Ocorrido</h4>
            <p class="text-slate-700 leading-relaxed">${claim.description}</p>
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
            <h2 class="text-xl font-bold text-slate-900">Controle de Multas & Infrações NIC</h2>
            <p class="text-xs text-slate-500">Importe planilhas Excel (.xlsx) e emita os termos de responsabilidade em 1 clique.</p>
          </div>
          <button id="fines-import-excel" class="btn bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-2 shadow-xs">
            <i class="fa-solid fa-file-excel"></i> Importar Planilha Excel (.xlsx)
          </button>
        </div>

        <div class="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 text-slate-500 uppercase text-[10px]">
              <tr>
                <th class="p-3.5">Auto de Infração</th>
                <th class="p-3.5">Condutor</th>
                <th class="p-3.5">Placa</th>
                <th class="p-3.5">Descrição</th>
                <th class="p-3.5">Valor</th>
                <th class="p-3.5">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${state.fines.map(f => `
                <tr>
                  <td class="p-3.5 font-bold font-mono text-slate-900">${f.infractionAuto}</td>
                  <td class="p-3.5 font-bold text-slate-800">${f.driverName}</td>
                  <td class="p-3.5 font-bold font-mono bg-amber-100 border border-amber-300 px-1.5 py-0.5 rounded text-[11px]">${f.vehiclePlate}</td>
                  <td class="p-3.5 font-medium text-slate-700">${f.description}</td>
                  <td class="p-3.5 font-bold">${formatCurrency(f.amount)}</td>
                  <td class="p-3.5"><span class="badge ${getStatusBadgeClass(f.status)} px-2.5 py-0.5 rounded-full text-[10px] font-bold">${f.status}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  function renderTemplateEditorView() {
    const selectedTmpl = state.selectedTemplateForEdit || state.templates[0];

    return `
      <div class="space-y-6">
        <div class="bg-slate-900 text-white p-6 rounded-xl shadow-md flex justify-between items-center">
          <div>
            <span class="badge bg-amber-500 text-slate-950 text-[10px] px-2.5 py-0.5 rounded font-black uppercase mb-1 inline-block">Módulo Administrativo (Requisitos 17 & 22)</span>
            <h2 class="text-xl font-bold tracking-tight">Editor de Modelos de Documentos</h2>
            <p class="text-xs text-slate-300 mt-1">Cadastre modelos de termos com variáveis dinâmicas e regras automáticas de recomendação.</p>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h3 class="font-bold text-slate-900 text-sm">Modelos Cadastrados</h3>
            <div class="space-y-2 text-xs">
              ${state.templates.map(t => `
                <div data-template-id="${t.id}" class="select-template-item p-3.5 rounded-lg border cursor-pointer transition-all ${t.id === selectedTmpl.id ? 'bg-amber-50 border-amber-300 text-slate-900 shadow-xs' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'}">
                  <div class="flex justify-between items-start">
                    <span class="badge bg-slate-200 text-slate-800 text-[9px] px-2 py-0.5 rounded font-bold uppercase">${t.category}</span>
                    <span class="text-[9px] px-2 py-0.5 rounded font-bold ${t.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500'}">${t.isActive ? 'Ativo' : 'Inativo'}</span>
                  </div>
                  <h4 class="font-bold text-slate-900 text-sm mt-2">${t.name}</h4>
                  <div class="mt-3 flex justify-between items-center text-[10px] text-slate-500">
                    <span>${t.availableVariables.length} Variáveis</span>
                    <span class="text-blue-600 font-bold">Ver Prévia →</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="lg:col-span-2">
            <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4 text-xs">
              <div class="flex justify-between items-center border-b border-slate-200 pb-3">
                <div>
                  <span class="badge bg-slate-100 text-slate-800 text-[10px] px-2 py-0.5 rounded font-bold uppercase">${selectedTmpl.category}</span>
                  <h3 class="font-bold text-slate-900 text-base mt-1">${selectedTmpl.name}</h3>
                </div>
              </div>

              <div>
                <span class="font-bold text-slate-700 block mb-1">Variáveis Utilizadas no Template:</span>
                <div class="flex flex-wrap gap-1.5 mb-3">
                  ${selectedTmpl.availableVariables.map(v => `<span class="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-mono text-[10px] font-bold border border-amber-300">${v}</span>`).join('')}
                </div>

                <span class="font-bold text-slate-700 block mb-1">Pré-visualização do Modelo:</span>
                <div class="p-4 bg-slate-50 rounded-lg border border-slate-200 font-mono text-[11px] whitespace-pre-wrap leading-relaxed">
                  ${selectedTmpl.content}
                </div>
              </div>
            </div>
          </div>
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
            <p class="text-xs text-slate-500">Listagem e importação via Excel (.xlsx).</p>
          </div>
          <button id="people-import-excel" class="btn bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-2">
            <i class="fa-solid fa-file-excel"></i> Importar Planilha Excel
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          ${state.people.map(p => `
            <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
              <span class="badge bg-blue-100 text-blue-800 text-[10px] px-2.5 py-0.5 rounded-full font-bold">${p.type}</span>
              <h4 class="font-bold text-slate-900 text-base">${p.name}</h4>
              <p class="text-slate-600 font-mono">CPF: ${maskCpfCnpj(p.docNumber)}</p>
              <p class="text-slate-500 text-[11px]">${p.notes || ''}</p>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  function renderVehiclesView() {
    return `
      <div class="space-y-6">
        <h2 class="text-xl font-bold text-slate-900">Frota Corporativa & Prefixos</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          ${state.vehicles.map(v => `
            <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
              <div class="flex items-center gap-2">
                <span class="font-black text-lg bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded font-mono">${v.plate}</span>
                <span class="badge bg-slate-900 text-amber-400 font-bold text-xs px-2.5 py-1 rounded">Prefixo: ${v.prefix || 'N/A'}</span>
              </div>
              <h4 class="font-bold text-slate-900 text-sm mt-1">${v.brand} ${v.model} (${v.year})</h4>
              <p class="text-slate-500 font-mono">RENAVAM: ${v.renavam}</p>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  function renderToast() {
    const root = document.getElementById('toast-root');
    if (!root) return;
    if (!state.toast) { root.innerHTML = ''; return; }
    root.innerHTML = `<div class="bg-slate-900 text-white p-4 rounded-xl shadow-xl flex items-center gap-3 border border-amber-500/40"><i class="fa-solid fa-circle-check text-amber-400 text-lg"></i><p class="text-xs font-bold">${state.toast.msg}</p></div>`;
  }

  function renderModals() {
    const modalRoot = document.getElementById('modal-root');
    if (!modalRoot) return;

    if (state.showNewClaimModal) {
      modalRoot.classList.remove('hidden');
      modalRoot.innerHTML = renderNewClaimModalHtml();
    } else if (state.showTermGeneratorModal) {
      modalRoot.classList.remove('hidden');
      modalRoot.innerHTML = renderTermGeneratorModalHtml();
    } else if (state.showExcelImportModal) {
      modalRoot.classList.remove('hidden');
      modalRoot.innerHTML = renderExcelImportModalHtml();
    } else if (state.showSearchModal) {
      modalRoot.classList.remove('hidden');
      modalRoot.innerHTML = renderSearchModalHtml();
    } else {
      modalRoot.classList.add('hidden');
      modalRoot.innerHTML = '';
    }

    attachModalEvents();
  }

  function renderExcelImportModalHtml() {
    return `
      <div class="bg-white rounded-xl shadow-2xl max-w-xl w-full p-6 space-y-4" onclick="event.stopPropagation()">
        <div class="flex justify-between items-center border-b border-slate-200 pb-3">
          <div class="flex items-center gap-2">
            <i class="fa-solid fa-file-excel text-emerald-600 text-xl"></i>
            <h3 class="font-bold text-slate-900 text-base">Importador de Planilhas Excel (.xlsx / .csv)</h3>
          </div>
          <button id="close-modal-btn" class="text-slate-400 hover:text-slate-700 text-lg"><i class="fa-solid fa-xmark"></i></button>
        </div>

        <div class="space-y-4 text-xs">
          <p class="text-slate-600">Selecione uma planilha de multas, condutores ou sinistros. O sistema lerá os dados automaticamente!</p>

          <div id="excel-dropzone" class="border-2 border-dashed border-emerald-400 bg-emerald-50/50 p-8 rounded-xl text-center cursor-pointer hover:bg-emerald-100/50 transition-colors">
            <i class="fa-solid fa-cloud-arrow-up text-emerald-600 text-3xl mb-2"></i>
            <p class="font-bold text-slate-800 text-sm">Clique para selecionar ou arraste o arquivo Excel (.xlsx)</p>
            <span class="text-[11px] text-slate-500">Suporta arquivos .xlsx, .xls e .csv</span>
            <input type="file" id="excel-file-input" accept=".xlsx, .xls, .csv" class="hidden" />
          </div>

          <div class="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span class="font-bold text-slate-700 block mb-1">Colunas recomendadas no Excel:</span>
            <code class="text-[10px] text-emerald-700 block font-mono">Auto, Placa, Condutor, CPF, Descrição, Valor, Vencimento</code>
          </div>

          <div class="pt-2 flex justify-end gap-2">
            <button type="button" id="close-modal-btn-2" class="btn btn-secondary text-xs px-4 py-2">Cancelar</button>
          </div>
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
            <span class="badge bg-amber-100 text-amber-900 text-[10px] px-2 py-0.5 rounded font-black uppercase">Modelos Oficiais Trans Pinho (PDF Exato)</span>
            <h3 class="font-bold text-slate-900 text-base">Gerador & Personalizador de Termos</h3>
          </div>
          <button id="close-modal-btn" class="text-slate-400 hover:text-slate-700 text-lg"><i class="fa-solid fa-xmark"></i></button>
        </div>

        <form id="gen-term-form" class="space-y-4 text-xs">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="form-label text-xs font-bold">Modelo de Termo *</label>
              <select id="modal-term-template-select" class="form-select text-xs font-bold text-slate-900">
                <option value="multa_nic">1. TERMO DE RESPONSABILIDADE (MULTA + NIC DUPLICADA)</option>
                <option value="infracao_direta">2. TERMO DE RESPONSABILIDADE (INFRAÇÃO DIRETA)</option>
                <option value="desconto_folha">3. TERMO DE CIÊNCIA E AUTORIZAÇÃO DE DESCONTO EM FOLHA</option>
              </select>
            </div>
            <div>
              <label class="form-label text-xs font-bold">Condutor *</label>
              <select id="modal-term-driver-select" class="form-select text-xs font-semibold">
                <option value="ANDREIA MERCEDES ROCHA DE ARAUJO|002.574.880-73|JCO8C10|24127">ANDREIA MERCEDES ROCHA DE ARAUJO (CPF 002.574.880-73 - Placa JCO8C10)</option>
                <option value="MICHELE ROSA DA ROSA|016.998.180-02|TRD3E72|226">MICHELE ROSA DA ROSA (CPF 016.998.180-02 - Placa TRD3E72)</option>
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
                  <option value="4">4x Parcelas</option>
                  <option value="5">5x Parcelas</option>
                  <option value="6">6x Parcelas</option>
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
          <input type="text" id="search-modal-input" placeholder="Pesquise por Andreia, Michele, JCO8C10, TRD3E72..." value="${state.searchQuery}" class="w-full text-xs focus:outline-none" autofocus />
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

    document.querySelectorAll('.select-template-item').forEach(el => {
      el.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-template-id');
        const tmpl = state.templates.find(t => t.id === id);
        if (tmpl) {
          state.selectedTemplateForEdit = tmpl;
          renderApp();
        }
      });
    });

    document.querySelectorAll('.open-dossier-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const claimId = e.currentTarget.getAttribute('data-claim-id');
        if (claimId) {
          state.selectedClaimId = claimId;
          state.currentView = 'claim-detail';
          renderApp();
        }
      });
    });

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
          'desconto_folha': 'TERMO DE CIÊNCIA E AUTORIZAÇÃO DE DESCONTO EM FOLHA DE PAGAMENTO'
        };

        const newTerm = {
          id: `trm-gen-${Date.now()}`,
          title: titles[tmplType] || 'TERMO DE RESPONSABILIDADE',
          type: tmplType === 'desconto_folha' ? 'Termo de ciência e autorização de desconto' : 'Termo de Responsabilidade',
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
