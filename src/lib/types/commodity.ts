export type CommodityCategory =
  | 'grãos'
  | 'proteína'
  | 'açúcar'
  | 'fibra'
  | 'energia'
  | 'lácteos'
  | 'frutas'
  | 'hortaliças'
  | 'pescado'
  | 'madeira';

export type Unit =
  | 'tonelada' | 'saca' | 'litro' | 'kg'
  | 'unidade' | 'caixa' | 'cacho' | 'dúzia' | 'm³';

export type Perecibilidade = 'alta' | 'média' | 'baixa';
export type Sazonalidade   = 'alta' | 'média' | 'baixa';
export type Atualizacao    = 'tempo_real' | 'diária' | 'semanal';
export type Moeda          = 'BRL' | 'USD';

export interface CommodityAttributes {
  perecibilidade: Perecibilidade;
  sazonalidade: Sazonalidade;
  hedge_disponível: boolean;
  rastreabilidade_esg: boolean;
  margem_típica: string;
  volatilidade_histórica: string;
}

export interface CommodityPrecos {
  fontes: string[];
  atualização: Atualizacao;
  moeda: Moeda;
}

export interface CommodityLogistica {
  peso_médio_saca: number;
  volume_médio_saca: number;
  temperatura_armazenagem: string;
  umidade_ideal: string;
  prazo_validade: number;
}

export interface CommodityFinanceiro {
  crédito_disponível: boolean;
  seguro_disponível: boolean;
  cpr_fracionável: boolean;
  taxa_média_financiamento: string;
}

export interface Commodity {
  id: string;
  name: string;
  category: CommodityCategory;
  unit: Unit;
  attributes: CommodityAttributes;
  preços: CommodityPrecos;
  logística: CommodityLogistica;
  financeiro: CommodityFinanceiro;
}

export type CommoditiesDatabase = Record<string, Commodity>;
