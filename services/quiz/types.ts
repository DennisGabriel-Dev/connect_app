export interface Quiz{
    id: string;
    titulo: string;
    descricao: string;
    liberado: boolean;
    _count: {
        perguntas?: number;
        tentativas?: number;
    
    };
}