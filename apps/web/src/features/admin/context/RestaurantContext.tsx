import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/admin/context/AuthContext';
import {
  fetchRestaurants,
  getSelectedRestaurantId,
  setSelectedRestaurantId,
} from '@/features/admin/lib/api';

type Restaurant = { id: string; name: string; slug: string | null; role: string };

type RestaurantContextType = {
  restaurants: Restaurant[];
  restaurantId: string | null;
  setRestaurantId: (id: string) => void;
  isLoading: boolean;
};

const RestaurantContext = createContext<RestaurantContextType | null>(null);

export function RestaurantProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const { data: restaurants = [], isLoading, isSuccess } = useQuery({
    queryKey: ['admin', 'restaurants'],
    queryFn: fetchRestaurants,
    enabled: isAuthenticated,
  });

  const [restaurantId, setRestaurantIdState] = useState<string | null>(() =>
    getSelectedRestaurantId(),
  );

  useEffect(() => {
    if (!isAuthenticated) {
      setRestaurantIdState(null);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isSuccess || restaurants.length === 0) return;
    const cur = getSelectedRestaurantId();
    if (!cur || !restaurants.some((r) => r.id === cur)) {
      const next = restaurants[0].id;
      setSelectedRestaurantId(next);
      setRestaurantIdState(next);
      void queryClient.invalidateQueries({ queryKey: ['admin'] });
    } else {
      setRestaurantIdState(cur);
    }
  }, [isSuccess, restaurants, queryClient]);

  const setRestaurantId = useCallback(
    (id: string) => {
      setSelectedRestaurantId(id);
      setRestaurantIdState(id);
      void queryClient.invalidateQueries({ queryKey: ['admin'] });
    },
    [queryClient],
  );

  const value = useMemo(
    () => ({
      restaurants,
      restaurantId,
      setRestaurantId,
      isLoading: isAuthenticated && isLoading,
    }),
    [restaurants, restaurantId, setRestaurantId, isAuthenticated, isLoading],
  );

  return <RestaurantContext.Provider value={value}>{children}</RestaurantContext.Provider>;
}

export function useRestaurant() {
  const ctx = useContext(RestaurantContext);
  if (!ctx) throw new Error('useRestaurant must be used within RestaurantProvider');
  return ctx;
}
