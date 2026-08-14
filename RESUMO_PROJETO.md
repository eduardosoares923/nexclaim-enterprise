# 📌 Resumo Geral do Projeto — NexClaim Enterprise & Trans Pinho

> **Status Atual:** 100% Funcional e Publicado em Produção  
> **Data do Ponto de Parada:** 14 de Agosto de 2026  
> **Empresa Titular:** JOÃO BATISTA DE SOUZA PINHO EPP (TRANS PINHO)  
> **Oficina Integrada:** VIEIRA CENTER (Funilaria, Chapeação e Estética Automotiva)  

---

## 🌐 1. Ambientes e Links de Acesso

| Recurso | Endereço / Link | Detalhes |
| :--- | :--- | :--- |
| **Aplicação em Produção** | [https://nexclaim-enterprise.vercel.app](https://nexclaim-enterprise.vercel.app) | Deploy automático via Vercel CLI |
| **Repositório GitHub** | [https://github.com/eduardosoares923/nexclaim-enterprise.git](https://github.com/eduardosoares923/nexclaim-enterprise.git) | Branch `main` |
| **Banco de Dados & Auth** | Firebase (Auth, Firestore, Storage) | Projeto: `nexclaim-enterprise` |

---

## 📄 2. Módulo de Termos Oficiais (5 Modelos Padronizados)

Todos os documentos foram rigorosamente diagramados no padrão **A4 Retrato**, utilizando tipografia oficial (*Times New Roman*, tamanho 10.5pt, entrelinha 1.32, texto justificado) e contam com o **mesmo rodapé oficial fixado na margem inferior da folha**:

```text
JOÃO BATISTA DE SOUZA PINHO EPP (TRANS PINHO)
Rua Florida, 116 – Nossa Chácara – Gravataí/ RS
(051) 3047-0212 / 98266-0028 | Transpinho@transpinho.com
```

### Modelos Disponíveis no Sistema:
1. **Termo de Responsabilidade (Multas & Não Indicação - NIC Duplicada)**:
   - Condutora: *ANDREIA MERCEDES ROCHA DE ARAUJO* (CPF `002.574.880-73`).
   - Veículo: *VW Constellation* (Placa `JCO8C10` | Prefixo `24127`).
   - Infrações: Auto `EL00093302` + Multa NIC Duplicada (Total `R$ 260,32`).
   - Opções dinâmicas: Cota Única ou Parcelado (2x de R$ 130,16).
2. **Termo de Responsabilidade (Infração Direta)**:
   - Condutora: *MICHELE ROSA DA ROSA* (CPF `016.998.180-02`).
   - Veículo: *Mercedes-Benz Atego* (Placa `TRD3E72` | Prefixo `226`).
   - Infração: Auto `TE02141677` (Estacionamento em local/horário proibido).
3. **Termo de Ciência e Autorização de Desconto em Folha (Geral)**:
   - Condutora: *ANDREIA MERCEDES ROCHA DE ARAUJO*.
   - Veículo: *VW Constellation* (Placa `JCO8C10` | Ocorrência `SIN-2026-00124`).
   - Valor: `R$ 3.500,00` em 5 parcelas de `R$ 700,00`.
4. **Termo de Quitação (Chapeação, Reparos & Adesivos Trans Pinho)**:
   - Proprietário/Condutor: *GELSON WEBER DE FARIAS* (CPF `629.109.220-49`).
   - Veículo: *Micro-ônibus* (Placa `HKO8087` | Prefixo `1961`).
   - Sinistro: Ocorrência nº `2026 0624 5995 797` (ocorrido em `18/06/2026`).
   - Quitação rasa, geral e irrevogável com assinatura e rodapé oficial.
5. **Termo de Desconto em Folha (Acordo com Terceiro Envolvido)**:
   - Condutor: *MARCELO TEIXEIRA DA SILVA* (CPF `031.997.250-07`).
   - Veículo da Frota: *Marcopolo/Volare W9C ON* (Placa `IZF4E82`).
   - Veículo Terceiro: *Renault/Master TVAN* (Placa `TQQ6H24`).
   - Sinistro: Ocorrência nº `2026 0713 3731 277`.
   - Valor: `R$ 2.200,00` em 15 parcelas de `R$ 146,46` (1º vencimento em `07/08/2026`).

---

## 🛠️ 3. Módulo de Orçamentos & Ordens de Serviço (OS)

Módulo completo com painel dividido (**Split Screen**):

- **Editor Dinâmico (Lado Esquerdo)**:
  - **Dados da OS & Prazos**: Nº da OS automático, Data, Validade do Orçamento (15 dias) e Garantia legal (90 dias).
  - **Botão "⚡ Puxar de Sinistro"**: Preenche automaticamente dados do cliente, veículo, placa e relatório técnico com base em um sinistro cadastrado.
  - **Cliente & Veículo**: Preenchimento rápido para Trans Pinho e frota vinculada.
  - **Tabela 1 (Serviços e Peças)**: Alternador de tipo (`MO` ou `Peça`), quantidade, valor unitário e cálculo em tempo real.
  - **Tabela 2 (Matérias & Insumos)**:
    - **Leitor de PDF com PDF.js**: Extração automática de itens e valores a partir do PDF de cotação do fornecedor.
    - **Datalist Técnico**: Mais de 60 itens de chapeação/funilaria pré-cadastrados (Lixas, Massas Maxirubber, Primers PU, Tintas, Vernizes, etc.).
  - **Dados Bancários / Pix**: Itaú Unibanco, Fabiano da Silva Vieira, Chave Pix `(51) 99432-4224`.
  - **Histórico**: Botão para salvar, carregar ou excluir OSs no navegador.
- **Pré-visualização A4 ao Vivo (Lado Direito)**:
  - Diagramação executiva da **Vieira Center** integrada à **Trans Pinho**.
  - **Exportação Dupla**:
    - Botão **"📄 Baixar PDF"** (geração via `html2pdf.js`).
    - Botão **"🖨️ IMPRIMIR OS A4"** (janela de impressão direta A4 calibrada).

---

## 📊 4. Outros Módulos Implementados

| Módulo | Recursos Principais |
| :--- | :--- |
| **Painel Trans Pinho (Dashboard)** | Indicadores de sinistros, termos oficiais, multas pendentes e veículos em frota. |
| **Sinistros & Ocorrências** | Dossiês completos, prioridade, status, custos aprovados e botão para gerar termos diretos. |
| **Multas de Trânsito** | Importador de planilhas Excel (`.xlsx` via SheetJS), cálculo de NIC e vencimentos. |
| **Frota & Prefixos** | Cadastro de veículos com placa, renavam, marca, ano e prefixo da Trans Pinho. |
| **Condutores** | Base de motoristas com CPF, CNH, contato e histórico de documentos. |
| **Busca Global (Ctrl + K)** | Pesquisa rápida instantânea por placa, condutor ou número de ocorrência. |

---

## 💻 5. Estrutura de Arquivos

```text
nexclaim-enterprise/
├── public/
│   ├── css/
│   │   └── main.css              # Estilização global e classes utilitárias
│   ├── images/
│   │   └── logo.png              # Logotipo oficial em alta definição da Trans Pinho
│   ├── js/
│   │   ├── app.js                # Lógica central da SPA, renderizador de termos e gerador de OS
│   │   └── firebase.js           # Inicialização e credenciais do Firebase
│   └── index.html                # Estrutura HTML5 com Tailwind, SheetJS, html2pdf e pdf.js
├── RESUMO_PROJETO.md             # Documentação técnica do estado atual do projeto
├── package.json                  # Configurações do projeto Node.js
└── vercel.json                   # Configurações de deploy e rotas para o Vercel
```

---

## 🚀 6. Como Atualizar e Fazer Novos Deploys

Para atualizar o código e sincronizar a produção:

```bash
# 1. Salvar alterações no Git
git add .
git commit -m "Descrição das melhorias"
git push origin main

# 2. Publicar imediatamente no Vercel
npx vercel --prod --yes
```
