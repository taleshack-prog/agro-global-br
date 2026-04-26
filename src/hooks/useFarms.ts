import { useState, useEffect, useCallback } from 'react';
import { farmsApi, type Farm, type CreateFarmPayload } from '@/lib/apiClient';

const SELECTED_KEY = 'agroglobal_selected_farm';

interface UseFarmsResult {
  farms:      Farm[];
  selected:   Farm | null;
  isLoading:  boolean;
  isCreating: boolean;
  error:      string | null;
  select:     (farm: Farm) => void;
  create:     (payload: CreateFarmPayload) => Promise<Farm>;
  refetch:    () => void;
}

export function useFarms(): UseFarmsResult {
  const [farms,      setFarms]      = useState<Farm[]>([]);
  const [selected,   setSelected]   = useState<Farm | null>(null);
  const [isLoading,  setIsLoading]  = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error,      setError]      = useState<string | null>(null);
  const [tick,       setTick]       = useState(0);

  const refetch = useCallback(() => setTick(t => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    farmsApi.list()
      .then(({ data }) => {
        if (cancelled) return;
        setFarms(data);
        const savedId = localStorage.getItem(SELECTED_KEY);
        const restored = data.find(f => f.id === savedId) ?? data[0] ?? null;
        setSelected(restored);
      })
      .catch(err => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [tick]);

  const select = useCallback((farm: Farm) => {
    setSelected(farm);
    localStorage.setItem(SELECTED_KEY, farm.id);
  }, []);

  const create = useCallback(async (payload: CreateFarmPayload): Promise<Farm> => {
    setIsCreating(true);
    try {
      const farm = await farmsApi.create(payload);
      setFarms(prev => [...prev, farm]);
      setSelected(farm);
      localStorage.setItem(SELECTED_KEY, farm.id);
      return farm;
    } finally {
      setIsCreating(false);
    }
  }, []);

  return { farms, selected, isLoading, isCreating, error, select, create, refetch };
}
