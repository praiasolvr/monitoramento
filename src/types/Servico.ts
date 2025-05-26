import { Cliente } from "./Cliente";

export interface Servico {
    id: string;
    tipo: string;
    valor: string;
    cliente?: Cliente; // cliente pode ser undefined, mas NÃO null
    criadoEm?: string;
}
