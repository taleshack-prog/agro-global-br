import { useState, useEffect, useCallback, type SyntheticEvent, type CSSProperties } from 'react';
import {
  ShoppingCart, FileText, CheckCircle, Clock, AlertCircle,
  Scale, Gavel, Plus, X, RefreshCw, Loader2
} from 'lucide-react';
import { Card, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { offersApi, contractsApi, type Offer, type Contract } from '@/lib/apiClient';

const offerStatusConfig: Record<string, { variant: 'green'|'yellow'|'blue'|'gray'; label: string }> = {
  active:    { variant: 'green',  label: 'Ativa'     },
  matched:   { variant: 'blue',   label: 'Negociada' },
  expired:   { variant: 'gray',   label: 'Expirada'  },
  cancelled: { variant: 'gray',   label: 'Cancelada' },
};

const contractStatusConfig: Record<string, { variant: 'green'|'yellow'|'blue'|'gray'; icon: any; label: string }> = {
  draft:     { variant: 'gray',   icon: Clock,       label: 'Rascunho'  },
  pending:   { variant: 'yellow', icon: Clock,       label: 'Pendente'  },
  signed:    { variant: 'green',  icon: CheckCircle, label: 'Assinado'  },
  active:    { variant: 'green',  icon: CheckCircle, label: 'Ativo'     },
  settled:   { variant: 'blue',   icon: CheckCircle, label: 'Liquidado' },
  cancelled: { variant: 'gray',   icon: AlertCircle, label: 'Cancelado' },
};

const PRODUCTS = ['Soja','Milho','Trigo','Café','Algodão','Boi Gordo'];

const inputStyle: CSSProperties = {
  width: '100%', padding: '10px 12px',
  backgroundColor: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: '8px', color: 'var(--color-text-primary)',
  fontSize: '14px', outline: 'none', boxSizing: 'border-box',
};
const labelStyle: CSSProperties = {
  display: 'block', fontSize: '13px', fontWeight: 600,
  color: 'var(--color-text-primary)', marginBottom: '6px',
};

function NewOfferModal({ onClose, onCreate }: { onClose: () => void; onCreate: (o: Offer) => void }) {
  const [product, setProduct]         = useState('Soja');
  const [volumeSacas, setVolumeSacas] = useState('');
  const [pricePerSaca, setPriceSaca]  = useState('');
  const [origem, setOrigem]           = useState('');
  const [destino, setDestino]         = useState('');
  const [deadline, setDeadline]       = useState('');
  const [notes, setNotes]             = useState('');
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState<string|null>(null);

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault(); setError(null);
    if (!volumeSacas || !pricePerSaca) { setError('Volume e preço são obrigatórios.'); return; }
    setLoading(true);
    try {
      const offer = await offersApi.create({
        product, volumeSacas: parseFloat(volumeSacas), pricePerSaca: parseFloat(pricePerSaca),
        origem: origem||undefined, destino: destino||undefined,
        deadline: deadline||undefined, notes: notes||undefined,
      });
      onCreate(offer); onClose();
    } catch (err: any) { setError(err.message ?? 'Erro ao criar oferta.'); }
    finally { setLoading(false); }
  };

  const total = parseFloat(volumeSacas||'0') * parseFloat(pricePerSaca||'0');

  return (
    <div style={{ position:'fixed', inset:0, zIndex:100, backgroundColor:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}>
      <div style={{ width:'100%', maxWidth:'480px', backgroundColor:'var(--color-surface-2)', border:'1px solid var(--color-border)', borderRadius:'16px', padding:'28px', maxHeight:'90vh', overflowY:'auto' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px' }}>
          <div>
            <h2 style={{ fontSize:'16px', fontWeight:700, color:'var(--color-text-primary)', margin:0 }}>Nova Oferta de Venda</h2>
            <p style={{ fontSize:'13px', color:'var(--color-text-muted)', margin:'2px 0 0' }}>Publicar no livro de ofertas</p>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--color-text-muted)' }}><X size={18}/></button>
        </div>

        {error && (
          <div style={{ display:'flex', alignItems:'center', gap:'8px', backgroundColor:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:'8px', padding:'10px 14px', marginBottom:'16px' }}>
            <AlertCircle size={15} color="#ef4444" style={{ flexShrink:0 }}/>
            <p style={{ fontSize:'13px', color:'#ef4444', margin:0 }}>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
          <div>
            <label style={labelStyle}>Produto <span style={{ color:'#ef4444' }}>*</span></label>
            <select value={product} onChange={e => setProduct(e.target.value)} style={inputStyle}>
              {PRODUCTS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
            <div>
              <label style={labelStyle}>Volume (sacas) <span style={{ color:'#ef4444' }}>*</span></label>
              <input type="number" placeholder="Ex: 1000" value={volumeSacas} onChange={e => setVolumeSacas(e.target.value)} style={inputStyle} min="1" required/>
            </div>
            <div>
              <label style={labelStyle}>Preço/saca (R$) <span style={{ color:'#ef4444' }}>*</span></label>
              <input type="number" placeholder="Ex: 142.50" value={pricePerSaca} onChange={e => setPriceSaca(e.target.value)} style={inputStyle} step="0.01" min="0" required/>
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
            <div>
              <label style={labelStyle}>Origem</label>
              <input placeholder="Ex: Sorriso, MT" value={origem} onChange={e => setOrigem(e.target.value)} style={inputStyle}/>
            </div>
            <div>
              <label style={labelStyle}>Destino</label>
              <input placeholder="Ex: Paranaguá" value={destino} onChange={e => setDestino(e.target.value)} style={inputStyle}/>
            </div>
          </div>
          <div>
            <label style={labelStyle}>Prazo limite</label>
            <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} style={inputStyle}/>
          </div>
          <div>
            <label style={labelStyle}>Observações</label>
            <textarea placeholder="Condições especiais, qualidade, etc." value={notes} onChange={e => setNotes(e.target.value)}
              style={{ ...inputStyle, minHeight:'72px', resize:'vertical', fontFamily:'inherit' }}/>
          </div>
          {total > 0 && (
            <div style={{ backgroundColor:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.2)', borderRadius:'8px', padding:'12px' }}>
              <div style={{ fontSize:'12px', color:'var(--color-text-muted)', marginBottom:'4px' }}>Valor total estimado</div>
              <div style={{ fontSize:'20px', fontWeight:700, color:'var(--color-agro-primary)' }}>
                R$ {total.toLocaleString('pt-BR', { minimumFractionDigits:2 })}
              </div>
              <div style={{ fontSize:'12px', color:'var(--color-text-muted)', marginTop:'2px' }}>
                {parseFloat(volumeSacas).toLocaleString('pt-BR')} sc × R$ {parseFloat(pricePerSaca).toFixed(2)}/sc
              </div>
            </div>
          )}
          <div style={{ display:'flex', gap:'10px', paddingTop:'4px' }}>
            <Button type="button" variant="muted" size="md" style={{ flex:1 }} onClick={onClose} disabled={loading}>Cancelar</Button>
            <Button type="submit" size="md" style={{ flex:2 }} isLoading={loading}><Plus size={15}/>Publicar Oferta</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export const MesaNegociacao = () => {
  const [tab, setTab]                 = useState<'ofertas'|'rfq'|'contratos'>('ofertas');
  const [offers, setOffers]           = useState<Offer[]>([]);
  const [contracts, setContracts]     = useState<Contract[]>([]);
  const [loadingOff, setLoadingOff]   = useState(true);
  const [loadingCon, setLoadingCon]   = useState(true);
  const [showModal, setShowModal]     = useState(false);
  const [selectedOffer, setSelected]  = useState<string|null>(null);
  const [cancellingId, setCancelling] = useState<string|null>(null);

  const fetchOffers = useCallback(() => {
    setLoadingOff(true);
    offersApi.list().then(({ data }) => setOffers(data)).catch(console.error).finally(() => setLoadingOff(false));
  }, []);

  const fetchContracts = useCallback(() => {
    setLoadingCon(true);
    contractsApi.list().then(({ data }) => setContracts(data)).catch(console.error).finally(() => setLoadingCon(false));
  }, []);

  useEffect(() => { fetchOffers(); },    [fetchOffers]);
  useEffect(() => { fetchContracts(); }, [fetchContracts]);

  const handleCancel = async (id: string) => {
    setCancelling(id);
    try { await offersApi.cancel(id); setOffers(prev => prev.filter(o => o.id !== id)); }
    catch (err: any) { alert(err.message ?? 'Erro ao cancelar.'); }
    finally { setCancelling(null); }
  };

  const activeOffers = offers.filter(o => o.status === 'active');
  const totalVolume  = activeOffers.reduce((s, o) => s + o.volumeSacas, 0);
  const avgPrice     = activeOffers.length ? activeOffers.reduce((s, o) => s + o.pricePerSaca, 0) / activeOffers.length : 0;

  const leilaoData = [
    { item:'Soja — Lote A', quantidade:'500 sc', encerramento:'2h 14min', lance:'R$ 143.50', participantes:7, status:'Ativo' },
    { item:'Milho — Lote B', quantidade:'2.000 sc', encerramento:'48min', lance:'R$ 68.90', participantes:12, status:'Ativo' },
    { item:'Soja — Lote C', quantidade:'1.200 sc', encerramento:'Amanhã 09:00', lance:'R$ 141.20', participantes:4, status:'Aguardando' },
  ];

  return (
    <div className="space-y-6">
      {showModal && <NewOfferModal onClose={() => setShowModal(false)} onCreate={o => setOffers(prev => [o, ...prev])}/>}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-text-primary">Mesa Digital de Negociação</h2>
          <p className="text-sm text-text-muted mt-0.5">Marketplace · Contratos Digitais</p>
        </div>
        <Button variant="primary" onClick={() => setShowModal(true)}><Plus size={14}/>Nova Oferta</Button>
      </div>

      <div className="flex gap-1 bg-surface-2 rounded-[12px] p-1 border border-border">
        {(['ofertas','rfq','contratos'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 px-4 rounded-[12px] text-sm font-medium transition-all duration-150 ${tab===t?'bg-[#047857] text-white shadow':'text-text-secondary hover:text-text-primary'}`}>
            {t==='ofertas'?'Minhas Ofertas':t==='rfq'?'RFQ / Leilões':'Contratos'}
          </button>
        ))}
      </div>

      {tab==='ofertas' && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-surface-2 border border-border rounded-[12px] p-4 text-center">
              <div className="text-2xl font-bold text-agro-primary">{activeOffers.length}</div>
              <div className="text-xs text-text-muted">Ofertas Ativas</div>
            </div>
            <div className="bg-surface-2 border border-border rounded-[12px] p-4 text-center">
              <div className="text-2xl font-bold text-text-primary">{totalVolume.toLocaleString('pt-BR')}</div>
              <div className="text-xs text-text-muted">Volume Total (sc)</div>
            </div>
            <div className="bg-surface-2 border border-border rounded-[12px] p-4 text-center">
              <div className="text-2xl font-bold text-agro-secondary">{avgPrice>0?`R$ ${avgPrice.toFixed(2)}`:'—'}</div>
              <div className="text-xs text-text-muted">Preço Médio</div>
            </div>
          </div>

          <Card padding={false}>
            <div className="p-5 pb-3 flex items-center justify-between">
              <CardHeader title="Livro de Ofertas" subtitle="Suas ofertas publicadas" icon={<Scale size={16}/>}/>
              <button onClick={fetchOffers} className="text-text-muted hover:text-text-primary transition-colors p-1">
                {loadingOff?<Loader2 size={15} className="animate-spin"/>:<RefreshCw size={15}/>}
              </button>
            </div>
            {loadingOff ? (
              <div className="flex items-center justify-center py-12 gap-2 text-text-muted">
                <Loader2 size={18} className="animate-spin"/><span className="text-sm">Carregando ofertas...</span>
              </div>
            ) : offers.length===0 ? (
              <div className="flex flex-col items-center justify-center py-14 gap-3">
                <ShoppingCart size={32} className="text-text-muted"/>
                <div className="text-sm font-semibold text-text-primary">Nenhuma oferta publicada</div>
                <p className="text-xs text-text-muted">Clique em "Nova Oferta" para começar a negociar.</p>
                <Button variant="primary" size="sm" onClick={() => setShowModal(true)}><Plus size={13}/>Criar primeira oferta</Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left text-xs text-text-muted font-medium px-5 py-3">Produto</th>
                      <th className="text-right text-xs text-text-muted font-medium px-4 py-3">Volume (sc)</th>
                      <th className="text-right text-xs text-text-muted font-medium px-4 py-3">Preço/sc</th>
                      <th className="text-right text-xs text-text-muted font-medium px-4 py-3">Total</th>
                      <th className="text-left text-xs text-text-muted font-medium px-4 py-3">Origem</th>
                      <th className="text-left text-xs text-text-muted font-medium px-4 py-3">Prazo</th>
                      <th className="text-left text-xs text-text-muted font-medium px-4 py-3">Status</th>
                      <th className="text-right text-xs text-text-muted font-medium px-5 py-3">Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {offers.map(offer => {
                      const sc = offerStatusConfig[offer.status]??offerStatusConfig.active;
                      return (
                        <tr key={offer.id}
                          className={`border-b border-border/50 cursor-pointer transition-colors ${selectedOffer===offer.id?'bg-[#064E3B]/20':'hover:bg-surface/40'}`}
                          onClick={() => setSelected(offer.id===selectedOffer?null:offer.id)}>
                          <td className="px-5 py-3">
                            <Badge variant={offer.product==='Soja'?'green':offer.product==='Milho'?'yellow':'blue'}>{offer.product}</Badge>
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-text-primary">{offer.volumeSacas.toLocaleString('pt-BR')}</td>
                          <td className="px-4 py-3 text-right font-bold text-agro-primary font-mono">R$ {offer.pricePerSaca.toFixed(2)}</td>
                          <td className="px-4 py-3 text-right font-mono text-text-secondary text-xs">
                            R$ {(offer.volumeSacas*offer.pricePerSaca).toLocaleString('pt-BR',{minimumFractionDigits:0})}
                          </td>
                          <td className="px-4 py-3 text-text-secondary text-xs">{offer.origem??'—'}</td>
                          <td className="px-4 py-3 text-text-secondary text-xs">
                            {offer.deadline?new Date(offer.deadline).toLocaleDateString('pt-BR'):'—'}
                          </td>
                          <td className="px-4 py-3"><Badge variant={sc.variant}>{sc.label}</Badge></td>
                          <td className="px-5 py-3 text-right">
                            {offer.status==='active' && (
                              <Button variant="ghost" size="sm" isLoading={cancellingId===offer.id}
                                onClick={e => { e.stopPropagation(); handleCancel(offer.id); }}>
                                Cancelar
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {tab==='rfq' && (
        <div className="space-y-4">
          <Card>
            <CardHeader title="Leilões em Andamento" subtitle="Participação em tempo real" icon={<Gavel size={16}/>}/>
            <div className="space-y-4">
              {leilaoData.map((l,i) => (
                <div key={i} className={`border rounded-[12px] p-4 ${l.status==='Ativo'?'border-[#047857]/50 bg-[#064E3B]/10':'border-border bg-surface/40'}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-text-primary">{l.item}</h4>
                        <Badge variant={l.status==='Ativo'?'green':'gray'}>{l.status}</Badge>
                      </div>
                      <p className="text-xs text-text-muted mt-0.5">Volume: {l.quantidade} · {l.participantes} participantes</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-text-muted">Encerramento</div>
                      <div className={`text-sm font-bold ${l.status==='Ativo'?'text-agro-secondary':'text-text-secondary'}`}>{l.encerramento}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-text-muted">Lance atual</div>
                      <div className="text-xl font-bold text-agro-primary">{l.lance}</div>
                    </div>
                    {l.status==='Ativo' && (
                      <div className="flex gap-2">
                        <Button variant="secondary" size="sm">Ver Detalhes</Button>
                        <Button variant="primary" size="sm"><Gavel size={13}/>Fazer Lance</Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {tab==='contratos' && (
        <Card padding={false}>
          <div className="p-5 pb-3 flex items-center justify-between">
            <CardHeader title="Contratos Digitais" subtitle="Trilha de auditoria completa" icon={<FileText size={16}/>}/>
            <button onClick={fetchContracts} className="text-text-muted hover:text-text-primary transition-colors p-1">
              {loadingCon?<Loader2 size={15} className="animate-spin"/>:<RefreshCw size={15}/>}
            </button>
          </div>
          {loadingCon ? (
            <div className="flex items-center justify-center py-12 gap-2 text-text-muted">
              <Loader2 size={18} className="animate-spin"/><span className="text-sm">Carregando contratos...</span>
            </div>
          ) : contracts.length===0 ? (
            <div className="flex flex-col items-center justify-center py-14 gap-3">
              <FileText size={32} className="text-text-muted"/>
              <div className="text-sm font-semibold text-text-primary">Nenhum contrato encontrado</div>
              <p className="text-xs text-text-muted">Contratos aparecem após negociações concluídas.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs text-text-muted font-medium px-5 py-3">ID</th>
                    <th className="text-left text-xs text-text-muted font-medium px-4 py-3">Produto</th>
                    <th className="text-right text-xs text-text-muted font-medium px-4 py-3">Volume</th>
                    <th className="text-right text-xs text-text-muted font-medium px-4 py-3">Preço</th>
                    <th className="text-left text-xs text-text-muted font-medium px-4 py-3">Vencimento</th>
                    <th className="text-left text-xs text-text-muted font-medium px-4 py-3">Status</th>
                    <th className="text-right text-xs text-text-muted font-medium px-5 py-3">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {contracts.map(c => {
                    const sc = contractStatusConfig[c.status]??contractStatusConfig.pending;
                    const Icon = sc.icon;
                    return (
                      <tr key={c.id} className="border-b border-border/50 hover:bg-surface/40 transition-colors">
                        <td className="px-5 py-3 font-mono text-xs text-text-secondary">{c.id.slice(0,8)}…</td>
                        <td className="px-4 py-3"><Badge variant={c.product==='Soja'?'green':'yellow'}>{c.product}</Badge></td>
                        <td className="px-4 py-3 text-right font-mono text-text-primary">{c.volumeSacas.toLocaleString('pt-BR')} sc</td>
                        <td className="px-4 py-3 text-right font-bold text-agro-primary font-mono">R$ {c.pricePerSaca.toFixed(2)}</td>
                        <td className="px-4 py-3 text-text-secondary text-xs">
                          {c.deliveryDate?new Date(c.deliveryDate).toLocaleDateString('pt-BR'):'—'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <Icon size={13} className={sc.variant==='green'?'text-agro-primary':sc.variant==='yellow'?'text-agro-secondary':'text-text-muted'}/>
                            <Badge variant={sc.variant}>{sc.label}</Badge>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-right">
                          {c.status==='pending'
                            ?<Button variant="primary" size="sm" onClick={() => contractsApi.sign(c.id).then(fetchContracts)}>Assinar</Button>
                            :<Button variant="ghost" size="sm">Ver</Button>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
