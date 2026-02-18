export interface Page {
  id?: number;
  title: string;
  content: string;
  type: TypePage;
  tags: Tag[];
  createdAt?: string;
  updatedAt?: string;
}

export interface PageRequest {
  title: string;
  content: string;
  type: TypePage;
  tags: string[];
}

export enum TypePage {
  DEFINITION = 'DEFINITION',
  SCHEMA = 'SCHEMA',
  WORKFLOW = 'WORKFLOW',
  MAINTENANCE = 'MAINTENANCE',
  AUTRE = 'AUTRE'
}

export interface Tag {
  id?: number;
  name: string;
}
