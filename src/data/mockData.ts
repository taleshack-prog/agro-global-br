export const cotacoes = [
  { praça: 'Paranaguá', produto: 'Soja', preco: 142.50, basis: +3.20, variacao: +1.4 },
  { praça: 'Santos', produto: 'Soja', preco: 141.80, basis: +2.50, variacao: +0.9 },
  { praça: 'Rondonópolis', produto: 'Soja', preco: 138.20, basis: -0.90, variacao: -0.3 },
  { praça: 'Sorriso', produto: 'Soja', preco: 137.60, basis: -1.50, variacao: +0.6 },
  { praça: 'Cascavel', produto: 'Milho', preco: 68.40, basis: +1.10, variacao: -0.8 },
  { praça: 'Maringá', produto: 'Milho', preco: 67.90, basis: +0.60, variacao: +0.4 },
  { praça: 'Uberlândia', produto: 'Milho', preco: 66.50, basis: -0.80, variacao: -1.2 },
  { praça: 'Rio Verde', produto: 'Milho', preco: 65.80, basis: -1.50, variacao: +0.1 },
];

export const macroIndicadores = [
  { nome: 'USD/BRL', valor: 5.2340, variacao: +0.43, unidade: 'R$' },
  { nome: 'Soja CBOT', valor: 1048.25, variacao: -1.10, unidade: 'US¢/bu' },
  { nome: 'Milho CBOT', valor: 462.75, variacao: +0.75, unidade: 'US¢/bu' },
  { nome: 'Trigo CBOT', valor: 545.50, variacao: -0.30, unidade: 'US¢/bu' },
  { nome: 'B3 - AGRO3', valor: 28.45, variacao: +2.10, unidade: 'R$' },
  { nome: 'Ibovespa', valor: 128420, variacao: -0.65, unidade: 'pts' },
];

export const alertasClima = [
  { tipo: 'warning', regiao: 'MT - Sorriso', mensagem: 'Previsão de seca nos próximos 15 dias', severidade: 'Moderada' },
  { tipo: 'danger', regiao: 'RS - Passo Fundo', mensagem: 'Geada prevista para 28/04', severidade: 'Alta' },
  { tipo: 'info', regiao: 'PR - Cascavel', mensagem: 'Chuvas normais previstas', severidade: 'Baixa' },
];

export const precoHistorico = [
  { mes: 'Out', soja: 128, milho: 60 },
  { mes: 'Nov', soja: 131, milho: 62 },
  { mes: 'Dez', soja: 134, milho: 63 },
  { mes: 'Jan', soja: 136, milho: 65 },
  { mes: 'Fev', soja: 139, milho: 66 },
  { mes: 'Mar', soja: 141, milho: 67 },
  { mes: 'Abr', soja: 142, milho: 68 },
];

export const hedgeRecomendacao = {
  percentualProtegido: 35,
  percentualSugerido: 30,
  produto: 'Soja',
  safraTotal: 5000,
  precoAtual: 142.50,
  precoMeta: 148.00,
  instrumentos: [
    { nome: 'Contrato Futuro B3', porcentagem: 20, vantagem: 'Liquidez alta, preço fixo' },
    { nome: 'Opção de Venda (Put)', porcentagem: 10, vantagem: 'Protege queda, participa da alta' },
    { nome: 'Contrato a Termo', porcentagem: 5, vantagem: 'Preço fixo com entrega futura' },
  ],
};

export const cenariosMargem = [
  { cenario: 'Pessimista', receita: 680000, custo: 520000, margem: 160000, roi: 30.8 },
  { cenario: 'Base', receita: 712500, custo: 520000, margem: 192500, roi: 37.0 },
  { cenario: 'Otimista', receita: 750000, custo: 520000, margem: 230000, roi: 44.2 },
];

export const varCenarios = [
  { fator: 'Dólar -10%', impacto: -71250, percentual: -10 },
  { fator: 'Soja CBOT -15%', impacto: -106875, percentual: -15 },
  { fator: 'Quebra de safra 20%', impacto: -142500, percentual: -20 },
  { fator: 'Frete +30%', impacto: -21375, percentual: -3 },
];

export const ofertasCompra = [
  { id: 'O001', comprador: 'Cargill', produto: 'Soja', volume: 1000, preco: 142.20, prazo: '30/06/2026', origem: 'Paranaguá' },
  { id: 'O002', comprador: 'ADM', produto: 'Soja', volume: 500, preco: 141.80, prazo: '15/07/2026', origem: 'Santos' },
  { id: 'O003', comprador: 'Bunge', produto: 'Milho', volume: 2000, preco: 68.10, prazo: '30/05/2026', origem: 'Cascavel' },
  { id: 'O004', comprador: 'Louis Dreyfus', produto: 'Soja', volume: 750, preco: 143.00, prazo: '31/08/2026', origem: 'Rondonópolis' },
  { id: 'O005', comprador: 'Amaggi', produto: 'Milho', volume: 1500, preco: 67.50, prazo: '30/06/2026', origem: 'Sorriso' },
];

export const contratos = [
  { id: 'C-2026-001', produto: 'Soja', volume: 500, preco: 138.50, contraparte: 'Cargill', status: 'Assinado', vencimento: '30/04/2026' },
  { id: 'C-2026-002', produto: 'Milho', volume: 1200, preco: 65.80, contraparte: 'ADM', status: 'Pendente', vencimento: '15/05/2026' },
  { id: 'C-2026-003', produto: 'Soja', volume: 300, preco: 140.20, contraparte: 'Bunge', status: 'Em Análise', vencimento: '30/06/2026' },
];

export const creditoOfertas = [
  { tipo: 'CPR Verde', valor: 500000, taxa: '0.8% a.m.', prazo: '12 meses', garantia: 'Lavoura 2026/27', status: 'Pré-aprovado' },
  { tipo: 'Barter Insumos', valor: 280000, taxa: 'N/A', prazo: 'Entrega em Grãos', garantia: 'Safra futura', status: 'Disponível' },
  { tipo: 'Crédito Rural', valor: 1200000, taxa: '7% a.a. (SELIC)', prazo: '24 meses', garantia: 'Imóvel Rural', status: 'Analisar' },
];

export const cprDigitais = [
  { id: 'CPR-0021', valor: 250000, produto: 'Soja', quantidade: '1.750 sc', vencimento: '03/2027', status: 'Ativa', token: '0x4F3a...' },
  { id: 'CPR-0018', valor: 180000, produto: 'Milho', quantidade: '2.800 sc', vencimento: '08/2026', status: 'Ativa', token: '0x7B2c...' },
  { id: 'CPR-0015', valor: 320000, produto: 'Soja', quantidade: '2.240 sc', vencimento: '03/2026', status: 'Liquidada', token: '0x9D1e...' },
];

export const rotasLogistica = [
  { origem: 'Sorriso, MT', destino: 'Paranaguá, PR', distancia: 1980, frete: 18500, prazo: '5 dias', transportadora: 'Tegma' },
  { origem: 'Sorriso, MT', destino: 'Santos, SP', distancia: 2100, frete: 19800, prazo: '6 dias', transportadora: 'JSL' },
  { origem: 'Sorriso, MT', destino: 'Itacoatiara, AM', distancia: 1650, frete: 14200, prazo: '4 dias', transportadora: 'Hidrovias' },
];

export const netbackCalculo = {
  precoPorto: 142.50,
  frete: 18.50,
  armazenagem: 2.30,
  corretagem: 0.80,
  impostos: 1.20,
  precoLiquido: 119.70,
};

export const esgScore = {
  total: 78,
  categorias: [
    { nome: 'Carbono', score: 82, meta: 85 },
    { nome: 'Água', score: 71, meta: 80 },
    { nome: 'Solo', score: 85, meta: 90 },
    { nome: 'Biodiversidade', score: 68, meta: 75 },
    { nome: 'Conformidade Legal', score: 95, meta: 100 },
  ],
};

export const carbonoCreditos = [
  { projeto: 'Reflorestamento Cerrado', creditos: 320, precoUnitario: 45, total: 14400, status: 'Verificado' },
  { projeto: 'Plantio Direto', creditos: 180, precoUnitario: 28, total: 5040, status: 'Pendente' },
  { projeto: 'ABC+ Pecuária', creditos: 95, precoUnitario: 52, total: 4940, status: 'Verificado' },
];

export const rastreabilidadeAreas = [
  { area: 'Fazenda A - Talhão 01', hectares: 420, cultura: 'Soja', sifStatus: 'Conforme', car: 'Registrado', ibama: 'OK' },
  { area: 'Fazenda A - Talhão 02', hectares: 380, cultura: 'Milho', sifStatus: 'Conforme', car: 'Registrado', ibama: 'OK' },
  { area: 'Fazenda B - Talhão 01', hectares: 290, cultura: 'Soja', sifStatus: 'Em análise', car: 'Registrado', ibama: 'Pendente' },
];
