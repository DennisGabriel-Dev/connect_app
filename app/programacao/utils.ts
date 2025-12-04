import { Atividade } from '../../services/programacao/api';

/* Esse arquivo  é responsavel pelos filtros de "Atividades" da tela inicial */

/* Extrai as date_start das atividades e retorna ordenadas.*/
export function extrairDatasUnicas(atividades: Atividade[]): string[] {
  const datas = Array.from(
    new Set(
      atividades
        .filter(atividade => atividade.horarios.length > 0)
        .map(atividade => {
          const dateStart = new Date(atividade.horarios[0].date_start);
          return dateStart.toISOString().split('T')[0];
        })
    )
  ).sort();
  return datas;
}

/* Filtra atividades por dia baseado no date_start. */
export function filtrarPorDia(
  atividades: Atividade[],
  dia: string,
  datasUnicas: string[]
): Atividade[] {
  if (dia === 'Todos') return atividades;

  const indiceDia = parseInt(dia.replace('Dia ', '')) - 1;
  const dataAlvo = datasUnicas[indiceDia];
  
  if (!dataAlvo) return atividades;

  return atividades.filter(atividade => {
    if (atividade.horarios.length === 0) return false;
    const dateStart = new Date(atividade.horarios[0].date_start);
    const dataAtividade = dateStart.toISOString().split('T')[0];
    return dataAtividade === dataAlvo;
  });
}

/* Filtra atividades por tipo. */
export function filtrarPorTipo(atividades: Atividade[], tipo: string): Atividade[] {
  if (tipo === 'Todos') return atividades;
  return atividades.filter(atividade => atividade.tipo === tipo);
}

/* Formata uma data no padrão brasileiro (dd/mm/aaaa). */
export function formatarData(data: string): string {
  return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR');
}

/*
 ex:
"2025-12-12T19:00:00",  -->  Dia 1
"2025-12-13T19:00:00",  -->  Dia 2
"2025-12-15T19:00:00",  -->  Dia 3
 */