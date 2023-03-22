export interface Product {
    id: number;
    title: string;
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