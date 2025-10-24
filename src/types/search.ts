export interface SearchResult {
  id: string;
  type: "page" | "user" | "tracking" | "setting" | "action";
  title: string;
  description?: string;
  icon?: string;
  path?: string;
  category: string;
  priority: number;
  keywords?: string[];
  action?: () => void;
}

export interface SearchState {
  query: string;
  results: SearchResult[];
  isOpen: boolean;
  selectedIndex: number;
  isLoading: boolean;
}

export interface SearchCategory {
  name: string;
  icon: string;
  priority: number;
}
