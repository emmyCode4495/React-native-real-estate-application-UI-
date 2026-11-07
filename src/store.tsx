import React, { createContext, useContext, useMemo, useState } from 'react';
import { newReference } from './format';

export type Tour = { id: string; propertyId: string; dow: string; num: number; month: string; time: string; mode: 'In person' | 'Video call'; ref: string };
export type Profile = { name: string; email: string };
export type Settings = { priceAlerts: boolean; newListings: boolean };

type Ctx = {
  saved: string[];
  tours: Tour[];
  viewed: string[];
  profile: Profile;
  settings: Settings;
  budget: number; // buying budget, used for "within budget" hints
  toggleSave: (id: string) => boolean; // returns the new saved state
  buildTour: (t: Omit<Tour, 'id' | 'ref'>) => Tour;
  addTour: (t: Tour) => void;
  cancelTour: (id: string) => void;
  markViewed: (id: string) => void;
  setProfile: (p: Profile) => void;
  setSetting: (k: keyof Settings, v: boolean) => void;
  setBudget: (n: number) => void;
};

const StoreContext = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [saved, setSaved] = useState<string[]>(['willow-cottage']);
  const [tours, setTours] = useState<Tour[]>([]);
  const [viewed, setViewed] = useState<string[]>([]);
  const [profile, setProfile] = useState<Profile>({ name: '', email: '' });
  const [settings, setSettings] = useState<Settings>({ priceAlerts: true, newListings: true });
  const [budget, setBudget] = useState(900000);

  const value = useMemo<Ctx>(
    () => ({
      saved,
      tours,
      viewed,
      profile,
      settings,
      budget,
      toggleSave: (id) => {
        const next = !saved.includes(id);
        setSaved((s) => (next ? [id, ...s] : s.filter((x) => x !== id)));
        return next;
      },
      buildTour: (t) => ({ ...t, id: `t${Date.now()}`, ref: newReference() }),
      addTour: (t) => setTours((l) => [...l, t]),
      cancelTour: (id) => setTours((l) => l.filter((t) => t.id !== id)),
      markViewed: (id) => setViewed((v) => (v.includes(id) ? v : [...v, id])),
      setProfile,
      setSetting: (k, v) => setSettings((s) => ({ ...s, [k]: v })),
      setBudget,
    }),
    [saved, tours, viewed, profile, settings, budget],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
