export interface Type {
  id: number;
  name: string;
  color: string;   // "blue" | "green" | "purple" | "red" | "orange" | "yellow" | "pink" | "gray"
  icon: string;    // emoji ex: "📖"
}

export interface Tag {
  id?: number;
  name: string;
}

export interface Page {
  id?: number;
  title: string;
  content: string;
  type?: Type;
  tags: Tag[];
  createdAt?: string;
  updatedAt?: string;
}

export interface PageRequest {
  title: string;
  content: string;
  type: Type | null;
  tags: string[];
}
