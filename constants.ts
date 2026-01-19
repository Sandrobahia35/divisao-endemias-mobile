
import { FormData } from './types';

export const INITIAL_FORM_DATA: FormData = {
  municipio: 'itabuna',
  localberry: '',
  localidade: '',
  categoriaLocalidade: '',
  tipoAtividade: [],
  ciclo: 1,
  ano: 2026,
  dataInicio: '',
  dataFim: '',
  semanaEpidemiologica: '',
  concluido: false,
  imoveis: {
    residencias: 0,
    comercios: 0,
    terrenos: 0,
    pontos: 0,
    outros: 0,
    amostras: 0,
    fechados: 0,
    recusas: 0,
    recuperados: 0,
    informados: 0,
    pendencia: 0
  },
  tratamentos: {
    inspecionados: 0,
    focal: 0,
    perifocal: 0
  },
  depositos: {
    A1: 0,
    A2: 0,
    B: 0,
    C: 0,
    D1: 0,
    D2: 0,
    E: 0,
  },
  eliminados: 0,
  larvicida1: { tipo: '', quantidade: 0, 'dep tratados': 0 },
  larvicida2: { tipo: '', quantidade: 0, 'dep tratados': 0 },
  adulticida: { tipo: '', cargas: 0 },
  agentes: 0,
  supervisores: 0,
  nomeSupervisor: '',
  diasTrabalhados: 0,
  veiculos: ''
};

export const MUNICIPIOS = [
  { value: 'itabuna', label: 'Itabuna' }
];

export const LOCALIDADES = [
  "Alemita", "Alto Maron", "Antique", "Bananeira", "Banco Raso", "California",
  "Carlos Silva", "Castalia", "Centro", "Centro Comercial", "Conceicao",
  "Corbiniano Freire", "Daniel Gomes", "Fatima", "Fernando Gomes", "Ferradas",
  "Fonseca", "Goes Calmon", "Horteiro", "Itamaraca", "Jacana", "Jardim Brasil",
  "Jardim Grapiuna", "Jardim Primavera", "Joao Soares", "Jorge Amado", "Lomanto",
  "Mangabinha", "Manoel Leão", "Maria Matos", "Maria Pinheiro", "Monte Cristo",
  "Mutuns", "N S das Gracas", "Nova California", "Nova Esperança", "Nova Ferradas",
  "Nova Itabuna", "Nova Fonseca", "Novo Horizonte", "Novo S Caetano", "Parque Boa Vista",
  "Parque Verde", "Pedro Geronimo", "Pontalzinho", "Roca do Povo", "Santa Catarina",
  "Santa Clara", "Santa Ines", "Santo Antonio", "Sao Caetano", "Sao Judas",
  "Sao Lourenço", "Sao Pedro", "Sao Roque", "Sarinha", "Sinval Palmeira",
  "Taverolandia", "Urbis IV", "Vila Analia", "Vila Paloma", "Zildolandia", "Zizo"
].sort();

export const CATEGORIAS = [
  { value: '1', label: '1 - Brr' },
  { value: '2', label: '2 - Pov' }
];

export const TIPO_ATIVIDADES = ['LI', 'LI+T', 'PE', 'T', 'DF', 'PVE'];
