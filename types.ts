
export enum Step {
  Identification = 0,
  Period = 1,
  Summary = 2,
  Deposits = 3,
  Chemicals = 4,
  HumanResources = 5,
  Review = 6
}

export interface LarvicidaData {
  tipo: string;
  quantidade: number;
  'dep tratados': number;
}

export interface FormData {
  municipio: string;
  localberry: string;
  localidade: string;
  categoriaLocalidade: string;
  tipoAtividade: string[];
  ciclo: number;
  ano: number;
  dataInicio: string;
  dataFim: string;
  semanaEpidemiologica: string;
  concluido: boolean;
  imoveis: {
    residencias: number;
    comercios: number;
    terrenos: number;
    pontos: number;
    outros: number;
    amostras: number;
    fechados: number;
    recusas: number;
    recuperados: number;
    informados: number;
    pendencia: number;
  };
  tratamentos: {
    inspecionados: number;
    focal: number;
    perifocal: number;
  };
  depositos: {
    A1: number;
    A2: number;
    B: number;
    C: number;
    D1: number;
    D2: number;
    E: number;
  };
  eliminados: number;
  larvicida1: LarvicidaData;
  larvicida2: LarvicidaData;
  adulticida: {
    tipo: string;
    cargas: number;
  };
  agentes: number;
  supervisores: number;
  nomeSupervisor: string;
  diasTrabalhados: number;
  veiculos: string;
}
