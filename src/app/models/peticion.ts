import { User } from "./auth.model";
import { PeticionFile } from "./PeticionFile";

export interface Categoria {
  id: number;
  name: string;
  descripcion?: string;
}

export interface Peticion {
  id?: number;
  title: string;
  description: string;
  destinatary: string;
  user_id?: number;
  category_id?: number;
  signeds?: number;
  status?: string;
  created_at?: string; 

  files?: PeticionFile[];

  category?: Categoria;
  user?: User;

  has_signed?: boolean;
}
