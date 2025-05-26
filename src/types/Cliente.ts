export interface Contato {
    tipo: string;
    valor: string;
  }
  
  export interface Endereco {
    rua: string;
    numero: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
  }
  
  export interface Cliente {
    id: string;
    nome: string;
    contatos: Contato[];
    endereco?: Endereco; // Use `endereco?` se ele puder ser opcional
  }