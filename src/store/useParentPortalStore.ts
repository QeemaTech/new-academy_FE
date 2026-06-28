import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ParentChildListItem = {
  id: string;
  fullName: string;
  username: string;
  age: number | null;
  avatar: string | null;
  isActive: boolean;
};

interface ParentPortalState {
  childrenList: ParentChildListItem[];
  selectedChildId: string | null;
  setChildrenList: (list: ParentChildListItem[]) => void;
  setSelectedChildId: (id: string | null) => void;
}

export const useParentPortalStore = create<ParentPortalState>()(
  persist(
    (set) => ({
      childrenList: [],
      selectedChildId: null,
      setChildrenList: (childrenList) => set({ childrenList }),
      setSelectedChildId: (selectedChildId) => set({ selectedChildId }),
    }),
    {
      name: 'parent-portal-ui',
      partialize: (s) => ({ selectedChildId: s.selectedChildId }),
    }
  )
);
