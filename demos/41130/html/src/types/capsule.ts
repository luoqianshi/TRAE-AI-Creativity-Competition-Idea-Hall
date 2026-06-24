export interface MindCapsule {
  id: string;
  title: string;
  content: string;
  summary: string;
  tags: string[];
  createdAt: number;
  audioDuration: number;
}

export interface CapsuleState {
  capsules: MindCapsule[];
  addCapsule: (capsule: MindCapsule) => void;
  removeCapsule: (id: string) => void;
  filterTag: string | null;
  setFilterTag: (tag: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}
