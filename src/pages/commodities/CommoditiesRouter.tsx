/**
 * CommoditiesRouter
 * State-based navigation — zero dependency on React Router.
 * Views: overview | all | detail | category | hedge
 */

import { useState } from 'react';
import { CommoditiesOverview } from './CommoditiesOverview';
import { AllCommodities } from './AllCommodities';
import { CommodityDetail } from './CommodityDetail';
import { CommodityCategory } from './CommodityCategory';
import { CommodityHedge } from './CommodityHedge';

type View = 'overview' | 'all' | 'detail' | 'category' | 'hedge';

interface Props {
  /** Called when user wants to navigate to a non-commodity module (e.g. Mesa Digital) */
  onExternalNavigate?: (module: string) => void;
}

export const CommoditiesRouter = ({ onExternalNavigate }: Props) => {
  const [view, setView] = useState<View>('overview');
  const [param, setParam] = useState<string>('');

  const navigate = (nextView: string, nextParam?: string) => {
    // External modules (negociacao, risco, etc.)
    if (!['overview', 'all', 'detail', 'category', 'hedge'].includes(nextView)) {
      onExternalNavigate?.(nextView);
      return;
    }
    setView(nextView as View);
    setParam(nextParam ?? '');
  };

  const goBack = () => {
    setView('overview');
    setParam('');
  };

  switch (view) {
    case 'all':
      return <AllCommodities onNavigate={navigate} />;
    case 'detail':
      return <CommodityDetail id={param} onBack={goBack} onNavigate={navigate} />;
    case 'category':
      return <CommodityCategory category={param} onBack={goBack} onNavigate={navigate} />;
    case 'hedge':
      return <CommodityHedge onNavigate={navigate} />;
    default:
      return <CommoditiesOverview onNavigate={navigate} />;
  }
};
