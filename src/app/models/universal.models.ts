export interface UniversalItem {
  id:           number | string;
  name:         string;
  type:         string;
  image?:       string;
  rating?:      number;
  price?:       number;
  description?: string;
  location?:    string;
  [key: string]: unknown;
}

export interface ItemTypeConfig {
  type:       string;
  route:      string;
  label:      string;
  icon?:      string;
  useIdParam?: boolean;  // true → navigate([route, id]), false → navigate([route]) + state
}
