export interface Product {
  id: number;
  name: string;
  price: number;
  amount: number;
  image: string;
  priceFormatted: string;
}

export interface Cart {
  cart: Product[];
}

export interface Combo {
  id: number;
  name: string;
  description: string;
  image: string;
  products: Product[];
  price: number;
  active: boolean;
}

export interface CommerceInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  logo: string;
  cedula: string;
  provincia: Provincia;
}

export interface Stock {
  id: number;
  amount: number;
}

export interface User {
  id: number;
  name: string;
  lastname: string;
  email: string;
  password: string;
  role: string;
}

export interface PersonFromHacienda {
  nombre: string
  tipoIdentificacion: string
  regimen: Regimen
  situacion: Situacion
  actividades: any[]
}

export interface Regimen {
  codigo: number
  descripcion: string
}

export interface Situacion {
  moroso: string
  omiso: string
  estado: string
  administracionTributaria: string
  mensaje: string
}

export type Provincias = Provincia[]

export interface Provincia {
  provincia: string
  descripcion_Provincion: string
  cantones: Canton[]
}

export interface Canton {
  canton: string
  descripcion_Canton: string
  distritos: Distrito[]
}

export interface Distrito {
  distrito: string
  descripcion_Distrito: string
  barrios: Barrio[]
}

export interface Barrio {
  barrio: string
  descripcion_Barrio: string
}

export interface OutCommerceMsj {
  name: string;
  address: string;
  phone: string;
  email: string;
  logo: string;
  cedula: string;
  provincia: number;
  canton: number;
  distrito: number;
  barrio: number;
}

export interface Person {
  name: string;
  tipoIdentificacion: string;
  numeroIdentificacion: string;
  phone: string;
  email: string;
}