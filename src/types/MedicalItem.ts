export interface MedicalItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  location: string;
  expiryDate: string;
  minStock: number;
  supplier: string;
}

export const mockData: MedicalItem[] = [
  {
    id: '1',
    name: 'Paracetamol 500mg',
    category: 'medicamentos',
    quantity: 450,
    unit: 'unidades',
    location: 'Almacén A, Estante 2',
    expiryDate: '2026-12-31',
    minStock: 200,
    supplier: 'FarmaDistribuidora S.A.',
  },
  {
    id: '2',
    name: 'Guantes de Látex',
    category: 'proteccion',
    quantity: 25,
    unit: 'cajas',
    location: 'Almacén B, Estante 1',
    expiryDate: '2027-06-30',
    minStock: 50,
    supplier: 'Protección Médica LTDA',
  },
  {
    id: '3',
    name: 'Jeringas 5ml',
    category: 'consumibles',
    quantity: 0,
    unit: 'cajas',
    location: 'Almacén A, Estante 4',
    expiryDate: '2027-03-15',
    minStock: 30,
    supplier: 'Insumos Médicos del Sur',
  },
  {
    id: '4',
    name: 'Termómetro Digital',
    category: 'equipos',
    quantity: 12,
    unit: 'unidades',
    location: 'Almacén C, Estante 1',
    expiryDate: '2028-01-01',
    minStock: 10,
    supplier: 'Equipos Médicos Global',
  },
  {
    id: '5',
    name: 'Alcohol Etílico 70%',
    category: 'consumibles',
    quantity: 85,
    unit: 'litros',
    location: 'Almacén A, Estante 3',
    expiryDate: '2026-04-10',
    minStock: 50,
    supplier: 'Química Médica S.A.',
  },
  {
    id: '6',
    name: 'Mascarillas N95',
    category: 'proteccion',
    quantity: 180,
    unit: 'unidades',
    location: 'Almacén B, Estante 2',
    expiryDate: '2026-09-20',
    minStock: 100,
    supplier: 'Protección Médica LTDA',
  },
  {
    id: '7',
    name: 'Ibuprofeno 400mg',
    category: 'medicamentos',
    quantity: 8,
    unit: 'cajas',
    location: 'Almacén A, Estante 2',
    expiryDate: '2026-03-28',
    minStock: 15,
    supplier: 'FarmaDistribuidora S.A.',
  },
  {
    id: '8',
    name: 'Estetoscopio',
    category: 'instrumental',
    quantity: 5,
    unit: 'unidades',
    location: 'Almacén C, Estante 2',
    expiryDate: '2030-01-01',
    minStock: 5,
    supplier: 'Equipos Médicos Global',
  },
];
