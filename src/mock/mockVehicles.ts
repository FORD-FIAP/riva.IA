/**
 * Catálogo de 10 veículos com ficha técnica completa e categoria — curados à
 * mão (não vêm da FIPE, que não informa categoria nem specs de motor). Usados
 * pela busca por Categoria em Veículos.
 *
 * Dados coletados de fontes públicas (fabricantes, Webmotors, Garagem360,
 * iCarros, Ford, BYD, etc.) em setembro/2026. Campos não divulgados
 * publicamente pelos fabricantes ficam de fora (não aparecem na ficha).
 *
 * Observações importantes:
 * - O Porsche Panamera nunca teve versão conversível/cabriolet de produção —
 *   é um sedã/liftback de 4 portas. Os dados são da versão sedã de entrada
 *   (Panamera 2.9 V6), mantido na categoria "Conversível" a pedido do
 *   catálogo da RIVA.
 * - "Mitsubishi Savana" é a versão off-road da picape L200 Triton, não um
 *   modelo separado.
 * - O Mitsubishi Lancer foi descontinuado no Brasil (~2016/2017); os dados
 *   são da última versão comercializada (Lancer GT 2.0 16V).
 * - O Ford Mustang GT Convertible não é vendido oficialmente no Brasil
 *   (só o coupé); dados do mercado norte-americano.
 */
import { Vehicle } from '../types/vehicle';

export type CategoriaVeiculo = 'Picape' | 'Conversível' | 'Sedã' | 'Hatch';

export interface FichaTecnica {
  identificacao?: Record<string, string>;
  motor?: Record<string, string>;
  desempenho?: Record<string, string>;
  transmissao?: Record<string, string>;
  dimensoes?: Record<string, string>;
  pesoCapacidade?: Record<string, string>;
  suspensaoFreiosDirecao?: Record<string, string>;
  consumoEmissoes?: Record<string, string>;
  seguranca?: Record<string, string>;
  eletricoHibrido?: Record<string, string>;
}

export interface MockVehicle extends Vehicle {
  categoria: CategoriaVeiculo;
  fichaTecnica: FichaTecnica;
}

export const CATEGORIAS: CategoriaVeiculo[] = ['Picape', 'Conversível', 'Sedã', 'Hatch'];

export const MOCK_VEHICLES: MockVehicle[] = [
  {
    id: 'mock-mitsubishi-triton-hpes',
    marca: 'Mitsubishi',
    marcaCodigo: 'mock',
    modelo: 'Triton HPE-S',
    modeloCodigo: 'mock',
    versao: 'Triton HPE-S',
    categoria: 'Picape',
    fichaTecnica: {
      identificacao: {
        versão: 'HPE-S',
        geração: '6ª geração (2024-presente)',
        anoModelo: '2025',
        anoFabricação: '2024',
        tipoCarroceria: 'Picape (cabine dupla)',
        portas: '4',
        lugares: '5',
      },
      motor: {
        cilindrada: '2442 cm³',
        cilindros: '4 em linha',
        válvulasPorCilindro: '4',
        aspiração: 'Turbo',
        injeção: 'Injeção direta (common rail)',
        códigoMotor: '4N16',
      },
      desempenho: {
        potência: '205 cv @ 3.500 rpm',
        torque: '499 Nm (50,9 kgfm) @ 1.500 rpm',
        velMáxima: '190 km/h',
        zeroA100: '10,4 s',
        pesoPorPotência: '10,4 kg/cv',
      },
      transmissao: {
        tração: 'Integral 4x4 (com reduzida)',
        câmbio: 'Automático, 6 marchas',
      },
      dimensoes: {
        comprimento: '5.320 mm',
        largura: '1.865 mm',
        altura: '1.795 mm',
        entreEixos: '3.130 mm',
      },
      pesoCapacidade: {
        pesoOrdemMarcha: '2.130 kg',
        capacidadeCarga: '1.080 kg',
        portaMalas: '1.046 L',
        tanque: '76 L',
      },
      suspensaoFreiosDirecao: {
        suspensãoDianteira: 'Independente, braços sobrepostos',
        suspensãoTraseira: 'Eixo rígido, feixe de molas',
        freiosDianteiros: 'Disco ventilado',
        freiosTraseiros: 'Tambor',
        direção: 'Elétrica',
        pneus: '265/60 R18',
      },
      consumoEmissoes: {
        consumoUrbano: '9,3 km/l',
        consumoEstrada: '10,3 km/l',
      },
      seguranca: {
        airbags: '7 (frontais, laterais, cortina, joelho motorista)',
        abs: 'Sim',
        esc: 'Sim',
        tcs: 'Sim',
        hsa: 'Sim',
        ebaBas: 'Sim',
        isofix: 'Sim',
        estacionamento: 'Sensores diant./tras. + câmera de ré',
      },
    },
  },
  {
    id: 'mock-mitsubishi-savana',
    marca: 'Mitsubishi',
    marcaCodigo: 'mock',
    modelo: 'L200 Triton',
    modeloCodigo: 'mock',
    versao: 'Savana',
    categoria: 'Picape',
    fichaTecnica: {
      identificacao: {
        versão: 'Savana',
        geração: '5ª geração (2019-2024, pré-facelift 2024)',
        anoModelo: '2024',
        anoFabricação: '2024',
        tipoCarroceria: 'Picape (cabine dupla)',
        portas: '4',
        lugares: '5',
      },
      motor: {
        cilindrada: '2442 cm³',
        cilindros: '4 em linha',
        válvulasPorCilindro: '4',
        aspiração: 'Turbo (geometria variável)',
        injeção: 'Injeção direta, bloco em alumínio, MIVEC',
        códigoMotor: '4N15',
      },
      desempenho: {
        potência: '190 cv @ 3.500 rpm',
        torque: '430 Nm (43,9 kgfm) @ 2.500 rpm',
        pesoPorPotência: '10,6 kg/cv',
      },
      transmissao: {
        tração: 'Integral 4x4, com reduzida e bloqueio do diferencial traseiro',
        câmbio: 'Automático com trocas sequenciais (paddle shifters), 6 marchas',
      },
      dimensoes: {
        comprimento: '5.380 mm',
        largura: '1.870 mm (1.930 mm com rack de teto)',
        entreEixos: '3.000 mm',
      },
      pesoCapacidade: {
        pesoOrdemMarcha: '2.020 kg',
        capacidadeCarga: '1.000 kg',
        portaMalas: '1.046 L',
        tanque: '76 L',
      },
      suspensaoFreiosDirecao: {
        suspensãoDianteira: 'Independente',
        suspensãoTraseira: 'Eixo rígido',
        freiosDianteiros: 'Disco ventilado',
        freiosTraseiros: 'Tambor',
        direção: 'Elétrica',
        pneus: 'Aço estampado 17" com pneus Goodyear Duratrac 265/70 R17',
      },
      consumoEmissoes: {
        consumoUrbano: '9,3 km/l',
      },
      seguranca: {
        airbags: 'Frontais e laterais (versão sem pacote ADAS da HPE-S)',
        abs: 'Sim',
        esc: 'Sim',
        tcs: 'Sim',
        hsa: 'Sim',
        ebaBas: 'Não',
        isofix: 'Sim',
        estacionamento: 'Câmera de ré',
      },
    },
  },
  {
    id: 'mock-ford-ranger-raptor',
    marca: 'Ford',
    marcaCodigo: 'mock',
    modelo: 'Ranger Raptor',
    modeloCodigo: 'mock',
    versao: 'Ranger Raptor',
    categoria: 'Picape',
    fichaTecnica: {
      identificacao: {
        versão: 'Raptor 3.0 V6 Bi-Turbo',
        geração: '4ª geração (2023-presente / lançada no Brasil em 2024)',
        anoModelo: '2024',
        anoFabricação: '2024',
        tipoCarroceria: 'Picape (cabine dupla)',
        portas: '4',
        lugares: '5',
      },
      motor: {
        cilindrada: '2967 cm³',
        cilindros: '6 em V',
        válvulasPorCilindro: '4',
        aspiração: 'Bi-turbo (biturbo)',
        injeção: 'Injeção direta (EcoBoost/GTDI)',
      },
      desempenho: {
        potência: '397 cv @ 6.250 rpm',
        torque: '583 Nm (59,4 kgfm)',
        zeroA100: '5,8 s',
        pesoPorPotência: '6,3 kg/cv',
      },
      transmissao: {
        tração: 'Integral 4WD com seletor eletrônico (2H, 4H, 4L, 4A)',
        câmbio: 'Automático sequencial, 10 marchas',
      },
      dimensoes: {
        comprimento: '5.381 mm',
        largura: '2.208 mm',
        altura: '1.922 mm',
        entreEixos: '3.270 mm',
        larguraEixoDianteiro: '1.710 mm',
        larguraEixoTraseiro: '1.710 mm',
      },
      pesoCapacidade: {
        pesoOrdemMarcha: '2.495 kg',
        capacidadeCarga: '715 kg',
        portaMalas: '1.226 L',
        tanque: '82 L',
      },
      suspensaoFreiosDirecao: {
        suspensãoDianteira: 'Independente (McPherson) com amortecedores FOX 2.5" Live Valve',
        suspensãoTraseira: 'Independente com amortecedores FOX 2.5" Live Valve',
        freiosDianteiros: 'Disco ventilado',
        freiosTraseiros: 'Disco ventilado',
        direção: 'Elétrica',
        pneus: '285/70 R17',
      },
      consumoEmissoes: {
        consumoUrbano: '6,7 km/l',
        consumoEstrada: '7,4 km/l',
      },
      seguranca: {
        airbags: 'Múltiplos (frontais, laterais, cortina)',
        abs: 'Sim',
        esc: 'Sim',
        tcs: 'Sim',
        hsa: 'Sim',
        ebaBas: 'Sim',
        ebd: 'Sim',
        isofix: 'Sim',
        estacionamento: 'Sensores diant./tras. + câmera 360°',
      },
    },
  },
  {
    id: 'mock-ford-mustang-gt',
    marca: 'Ford',
    marcaCodigo: 'mock',
    modelo: 'Mustang GT',
    modeloCodigo: 'mock',
    versao: 'Mustang GT',
    categoria: 'Conversível',
    fichaTecnica: {
      identificacao: {
        versão: 'GT Premium Convertible',
        geração: '7ª geração (S650, 2024-presente)',
        anoModelo: '2024',
        anoFabricação: '2024',
        tipoCarroceria: 'Conversível (2 portas)',
        portas: '2',
        lugares: '4',
        observação: 'Versão conversível não é vendida oficialmente no Brasil (apenas o coupé); dados do mercado americano',
      },
      motor: {
        cilindrada: '5038 cm³',
        cilindros: '8 em V',
        válvulasPorCilindro: '4',
        aspiração: 'Natural (aspirado)',
        injeção: 'Injeção direta e indireta',
        códigoMotor: 'Coyote 5.0',
      },
      desempenho: {
        potência: '480 cv @ 7.150 rpm',
        torque: '563 Nm (57,5 kgfm) @ 4.900 rpm',
        velMáxima: '250 km/h',
        zeroA100: '4,3 s',
        pesoPorPotência: '3,5 kg/cv',
      },
      transmissao: {
        tração: 'Traseira (RWD)',
        câmbio: 'Manual, 6 marchas (automático de 10 marchas opcional)',
      },
      dimensoes: {
        comprimento: '4.811 mm',
        largura: '1.915 mm',
        altura: '1.397 mm',
        entreEixos: '2.718 mm',
      },
      pesoCapacidade: {
        pesoOrdemMarcha: '1.697 kg',
        portaMalas: '323 L',
        tanque: '59 L',
      },
      suspensaoFreiosDirecao: {
        suspensãoDianteira: 'MacPherson independente',
        suspensãoTraseira: 'Independente multilink (MagneRide adaptativa opcional)',
        freiosDianteiros: 'Disco ventilado (Brembo)',
        freiosTraseiros: 'Disco ventilado',
        direção: 'Elétrica',
        pneus: '235/50 R18 (padrão)',
      },
      consumoEmissoes: {
        consumoUrbano: '6,4 km/l',
        consumoEstrada: '9,8 km/l',
        consumoCombinado: '7,7 km/l',
      },
      seguranca: {
        airbags: '7 (2 dianteiros, 2 laterais, 2 cortina/lateral, 1 joelho passageiro)',
        abs: 'Sim',
        esc: 'Sim',
        tcs: 'Sim',
        hsa: 'Sim',
        ebaBas: 'Sim',
        ebd: 'Sim',
        isofix: 'Não',
        estacionamento: 'Câmera de ré + sensores (Ford Co-Pilot360)',
      },
    },
  },
  {
    id: 'mock-porsche-panamera',
    marca: 'Porsche',
    marcaCodigo: 'mock',
    modelo: 'Panamera',
    modeloCodigo: 'mock',
    versao: 'Panamera',
    categoria: 'Conversível',
    fichaTecnica: {
      identificacao: {
        versão: 'Panamera (base, V6)',
        geração: '3ª geração (2024-presente)',
        anoModelo: '2024',
        anoFabricação: '2024',
        tipoCarroceria: 'Sedã/liftback 4 portas — nunca existiu versão conversível de produção',
        portas: '4',
        lugares: '4',
      },
      motor: {
        cilindrada: '2894 cm³',
        cilindros: '6 em V',
        válvulasPorCilindro: '4',
        aspiração: 'Turbo',
        injeção: 'Injeção direta',
      },
      desempenho: {
        potência: '348 cv',
        torque: '500 Nm (50,9 kgfm)',
        velMáxima: '272 km/h',
        zeroA100: '5,1 s',
        pesoPorPotência: '5,4 kg/cv',
      },
      transmissao: {
        tração: 'Traseira (RWD) — versão "4" tem tração integral',
        câmbio: 'Dupla embreagem PDK, 8 marchas',
      },
      dimensoes: {
        comprimento: '5.052 mm',
        largura: '1.937 mm',
        altura: '1.419 mm',
        entreEixos: '2.950 mm',
      },
      pesoCapacidade: {
        pesoOrdemMarcha: '1.885 kg',
        portaMalas: '430 L',
        tanque: '80 L',
      },
      suspensaoFreiosDirecao: {
        suspensãoDianteira: 'Independente, adaptativa (opcional a ar)',
        suspensãoTraseira: 'Independente multilink, adaptativa',
        freiosDianteiros: 'Disco ventilado',
        freiosTraseiros: 'Disco ventilado',
        direção: 'Elétrica',
        pneus: '19" a 21" (conforme configuração)',
      },
      consumoEmissoes: {
        consumoUrbano: '7,5 km/l',
        consumoEstrada: '8,1 km/l',
      },
      seguranca: {
        airbags: 'Frontais, laterais e de cortina',
        abs: 'Sim',
        esc: 'Sim',
        tcs: 'Sim',
        hsa: 'Sim',
        ebaBas: 'Sim',
        ebd: 'Sim',
        isofix: 'Sim',
        estacionamento: 'Sensores diant./tras. + câmera de ré (Surround View opcional)',
      },
    },
  },
  {
    id: 'mock-mitsubishi-lancer',
    marca: 'Mitsubishi',
    marcaCodigo: 'mock',
    modelo: 'Lancer',
    modeloCodigo: 'mock',
    versao: 'Lancer',
    categoria: 'Sedã',
    fichaTecnica: {
      identificacao: {
        versão: 'GT 2.0 16V',
        geração: '10ª geração (2007-2016, última comercializada no Brasil)',
        anoModelo: '2016',
        anoFabricação: '2016',
        tipoCarroceria: 'Sedã',
        portas: '4',
        lugares: '5',
        observação: 'Modelo descontinuado no Brasil desde 2016/2017',
      },
      motor: {
        cilindrada: '1998 cm³',
        cilindros: '4 em linha',
        válvulasPorCilindro: '4',
        aspiração: 'Natural (aspirado)',
        injeção: 'Injeção eletrônica multiponto',
        taxaCompressão: '10.0:1',
        códigoMotor: 'MIVEC 4B11',
      },
      desempenho: {
        potência: '160 cv @ 6.000 rpm',
        torque: '197 Nm (20,1 kgfm) @ 4.200 rpm',
        pesoPorPotência: '8,3 kg/cv',
      },
      transmissao: {
        tração: 'Dianteira',
        câmbio: 'CVT (6 velocidades simuladas)',
      },
      dimensoes: {
        comprimento: '4.570 mm',
        largura: '1.765 mm',
        altura: '1.505 mm',
        entreEixos: '2.635 mm',
      },
      pesoCapacidade: {
        pesoOrdemMarcha: '1.330 kg',
        portaMalas: '413 L',
        tanque: '59 L',
      },
      suspensaoFreiosDirecao: {
        suspensãoDianteira: 'Independente McPherson com barra estabilizadora',
        suspensãoTraseira: 'Multibraço independente',
        freiosDianteiros: 'Disco ventilado',
        freiosTraseiros: 'Disco sólido',
        direção: 'Hidráulica',
        pneus: '205/60 R16 (aro 18 em versões específicas)',
      },
      consumoEmissoes: {
        consumoUrbano: '9,0 km/l',
      },
      seguranca: {
        airbags: 'Frontais e laterais (variável por versão)',
        abs: 'Sim',
        hsa: 'Não',
        ebd: 'Sim',
        isofix: 'Sim',
        estacionamento: 'Não disponível de série',
      },
    },
  },
  {
    id: 'mock-honda-civic',
    marca: 'Honda',
    marcaCodigo: 'mock',
    modelo: 'Civic',
    modeloCodigo: 'mock',
    versao: 'Civic',
    categoria: 'Sedã',
    fichaTecnica: {
      identificacao: {
        versão: 'Touring Híbrido e:HEV',
        geração: '11ª geração (2022-presente)',
        anoModelo: '2024',
        anoFabricação: '2024',
        tipoCarroceria: 'Sedã',
        portas: '4',
        lugares: '5',
      },
      motor: {
        cilindrada: '1993 cm³',
        cilindros: '4 em linha',
        válvulasPorCilindro: '4',
        aspiração: 'Natural (aspirado, ciclo Atkinson)',
        injeção: 'Injeção direta',
      },
      desempenho: {
        potência: '184 cv (combinado híbrido; motor 2.0 isolado: 143 cv/19,1 kgfm)',
        torque: '315 Nm (32,1 kgfm)',
        velMáxima: '180 km/h',
        zeroA100: '7,8 s',
        pesoPorPotência: '7,9 kg/cv',
      },
      transmissao: {
        tração: 'Dianteira',
        câmbio: 'e-CVT híbrido',
      },
      dimensoes: {
        comprimento: '4.679 mm',
        largura: '1.802 mm',
        altura: '1.432 mm',
        entreEixos: '2.735 mm',
        larguraEixoDianteiro: '1.543 mm',
        larguraEixoTraseiro: '1.569 mm',
      },
      pesoCapacidade: {
        pesoOrdemMarcha: '1.449 kg',
        portaMalas: '495 L',
      },
      suspensaoFreiosDirecao: {
        suspensãoDianteira: 'Independente',
        suspensãoTraseira: 'Independente',
        freiosDianteiros: 'Disco ventilado',
        freiosTraseiros: 'Disco sólido',
        direção: 'Elétrica',
      },
      consumoEmissoes: {
        consumoUrbano: '18,3 km/l',
        consumoEstrada: '15,9 km/l',
      },
      seguranca: {
        airbags: 'Frontais, laterais e de cortina',
        abs: 'Sim',
        esc: 'Sim',
        tcs: 'Sim',
        hsa: 'Sim',
        ebaBas: 'Sim',
        isofix: 'Sim',
        estacionamento: 'Sensor diant./tras. + câmera traseira',
      },
      eletricoHibrido: {
        capacidadeBateria: '1,05 kWh',
        tipoMotorElétrico: 'Motor síncrono de ímã permanente (sistema e:HEV, sem plug-in)',
        conectorRecarga: 'Não aplicável (não é plug-in; recarga via motor a combustão e frenagem regenerativa)',
        potênciaMotorElétrico: '184 cv',
      },
    },
  },
  {
    id: 'mock-toyota-corolla',
    marca: 'Toyota',
    marcaCodigo: 'mock',
    modelo: 'Corolla',
    modeloCodigo: 'mock',
    versao: 'Corolla',
    categoria: 'Sedã',
    fichaTecnica: {
      identificacao: {
        versão: 'XEi 2.0 Flex',
        geração: '12ª geração (facelift 2024)',
        anoModelo: '2024',
        anoFabricação: '2024',
        tipoCarroceria: 'Sedã',
        portas: '4',
        lugares: '5',
      },
      motor: {
        cilindrada: '1987 cm³',
        cilindros: '4 em linha',
        válvulasPorCilindro: '4',
        aspiração: 'Natural (aspirado)',
        injeção: 'Injeção direta e indireta (Dynamic Force)',
        códigoMotor: 'Dynamic Force Dual VVT-iE',
      },
      desempenho: {
        potência: '175 cv @ 6.600 rpm (etanol) / 169 cv (gasolina)',
        torque: '209 Nm (21,3 kgfm) @ 4.400 rpm',
        velMáxima: '205 km/h',
        zeroA100: '9,2 s',
        pesoPorPotência: '8,06 kg/cv',
      },
      transmissao: {
        tração: 'Dianteira',
        câmbio: 'CVT (10 marchas simuladas)',
      },
      dimensoes: {
        comprimento: '4.630 mm',
        largura: '1.780 mm',
        altura: '1.455 mm',
        entreEixos: '2.700 mm',
        vãoLivreSolo: '148 mm',
      },
      pesoCapacidade: {
        pesoOrdemMarcha: '1.410 kg',
        portaMalas: '470 L',
        tanque: '50 L',
      },
      suspensaoFreiosDirecao: {
        suspensãoDianteira: 'Independente, McPherson com mola helicoidal',
        suspensãoTraseira: 'Independente, multibraço',
        freiosDianteiros: 'Disco ventilado',
        freiosTraseiros: 'Disco sólido',
        direção: 'Elétrica',
        pneus: '215/50 R17',
      },
      consumoEmissoes: {
        consumoUrbano: '12,3 km/l (gasolina) / 8,6 km/l (etanol)',
        consumoEstrada: '14,9 km/l (gasolina) / 10,7 km/l (etanol)',
      },
      seguranca: {
        airbags: 'Frontais, laterais e de cortina (Toyota Safety Sense 2.5+)',
        abs: 'Sim',
        esc: 'Sim',
        tcs: 'Sim',
        hsa: 'Sim',
        ebaBas: 'Sim',
        ebd: 'Sim',
        isofix: 'Sim',
        estacionamento: 'Sensor traseiro + câmera de ré',
      },
    },
  },
  {
    id: 'mock-byd-dolphin',
    marca: 'BYD',
    marcaCodigo: 'mock',
    modelo: 'Dolphin',
    modeloCodigo: 'mock',
    versao: 'Dolphin',
    categoria: 'Hatch',
    fichaTecnica: {
      identificacao: {
        versão: 'GS 180 / GS',
        geração: '1ª geração (Ocean Series, 2024-presente no Brasil)',
        anoModelo: '2024',
        anoFabricação: '2024',
        tipoCarroceria: 'Hatchback',
        portas: '4',
        lugares: '5',
      },
      motor: {
        códigoMotor: '100% elétrico (não possui motor a combustão)',
        padrãoEmissão: 'Zero emissão de escapamento',
      },
      desempenho: {
        potência: '95 cv',
        torque: '180 Nm (18,3 kgfm)',
        velMáxima: '160 km/h',
        zeroA100: '10,9 s',
        pesoPorPotência: '14,8 kg/cv',
      },
      transmissao: {
        tração: 'Dianteira',
        câmbio: 'Automático de 1 marcha (redutor fixo)',
      },
      dimensoes: {
        comprimento: '4.125 mm',
        largura: '1.770 mm',
        altura: '1.570 mm',
        entreEixos: '2.700 mm',
        larguraEixoDianteiro: '1.530 mm',
        larguraEixoTraseiro: '1.530 mm',
      },
      pesoCapacidade: {
        pesoOrdemMarcha: '1.405 kg',
        portaMalas: '250 L',
      },
      suspensaoFreiosDirecao: {
        suspensãoDianteira: 'Independente',
        suspensãoTraseira: 'Eixo de torção',
        freiosDianteiros: 'Disco ventilado',
        freiosTraseiros: 'Disco sólido',
        direção: 'Elétrica',
        pneus: '205/50 R17 (estepe temporário)',
      },
      consumoEmissoes: {
        emissãoCO2: '0 g/km (escapamento)',
      },
      seguranca: {
        airbags: '6 (2 frontais, 2 laterais, 2 de cortina)',
        abs: 'Sim',
        esc: 'Sim',
        tcs: 'Sim',
        hsa: 'Sim',
        ebaBas: 'Sim',
        ebd: 'Sim',
        isofix: 'Sim',
        estacionamento: 'Sensores traseiros + câmera panorâmica 360°',
      },
      eletricoHibrido: {
        capacidadeBateria: '44,9 kWh (Blade LFP)',
        autonomiaElétrica: '291 km',
        tipoMotorElétrico: 'Motor síncrono de ímã permanente',
        conectorRecarga: 'AC/DC (Tipo 2 / CCS2, padrão BR)',
        potênciaMotorElétrico: '95 cv',
        potênciaRecarga: '6,6 kW (AC) / 60 kW (DC)',
      },
    },
  },
  {
    id: 'mock-renault-kwid',
    marca: 'Renault',
    marcaCodigo: 'mock',
    modelo: 'Kwid',
    modeloCodigo: 'mock',
    versao: 'Kwid',
    categoria: 'Hatch',
    fichaTecnica: {
      identificacao: {
        versão: 'Intense 1.0',
        geração: '1ª geração (facelift 2024)',
        anoModelo: '2024',
        anoFabricação: '2024',
        tipoCarroceria: 'Hatchback (crossover-hatch)',
        portas: '4',
        lugares: '5',
      },
      motor: {
        cilindrada: '999 cm³',
        cilindros: '3 em linha',
        válvulasPorCilindro: '4',
        aspiração: 'Natural (aspirado)',
        injeção: 'Injeção eletrônica multiponto',
        taxaCompressão: '11.5:1',
        códigoMotor: 'B4D (SCe 1.0)',
      },
      desempenho: {
        potência: '71 cv @ 5.500 rpm (etanol) / 68 cv (gasolina)',
        torque: '98 Nm (10,0 kgfm) @ 4.250 rpm',
        velMáxima: '156 km/h',
        zeroA100: '13,2 s',
        pesoPorPotência: '11,55 kg/cv',
      },
      transmissao: {
        tração: 'Dianteira',
        câmbio: 'Manual, 5 marchas',
      },
      dimensoes: {
        comprimento: '3.680 mm',
        largura: '1.579 mm',
        altura: '1.479 mm',
        entreEixos: '2.423 mm',
        vãoLivreSolo: '185 mm',
      },
      pesoCapacidade: {
        pesoOrdemMarcha: '820 kg',
        portaMalas: '290 L',
        tanque: '38 L',
      },
      suspensaoFreiosDirecao: {
        suspensãoDianteira: 'Independente McPherson',
        suspensãoTraseira: 'Eixo de torção',
        freiosDianteiros: 'Disco',
        freiosTraseiros: 'Tambor',
        direção: 'Mecânica/elétrica (varia conforme versão)',
        pneus: '165/70 R14 (varia conforme versão)',
      },
      consumoEmissoes: {
        consumoUrbano: '15,3 km/l (gasolina) / 10,8 km/l (etanol)',
        consumoEstrada: '15,7 km/l (gasolina) / 11 km/l (etanol)',
      },
      seguranca: {
        airbags: '2 frontais (versões topo têm laterais)',
        abs: 'Sim',
        hsa: 'Não',
        ebd: 'Sim',
        isofix: 'Sim',
        estacionamento: 'Não disponível de série na Intense (opcional em versões superiores)',
      },
    },
  },
];

export function getMockVehicle(id: string): MockVehicle | undefined {
  return MOCK_VEHICLES.find((v) => v.id === id);
}
