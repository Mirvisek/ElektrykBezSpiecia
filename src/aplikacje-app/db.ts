import Dexie, { type Table } from 'dexie';

export interface Sale {
  id?: number;
  date: string; // YYYY-MM-DD
  documentNumber: string;
  clientName: string;
  clientData: string;
  serviceName: string;
  amount: number;
  execDate?: string;
  paymentMethod?: string;
  paymentDays?: string;
  items?: { name: string, quantity: number, price: number, total: number }[];
  discount?: number; // percentage
}

export interface CalendarEvent {
  id?: number;
  date: string; // YYYY-MM-DD
  title: string;
  description: string;
  clientName: string;
  isCompleted: boolean;
}

export interface Client {
  id?: number;
  name: string;
  firstName?: string;
  lastName?: string;
  address: string; // Keep for backward compatibility / full address
  street?: string;
  postalCode?: string;
  city?: string;
  taxId: string;
  email: string;
  phone?: string;
  notes?: string;

  // Technical
  networkType?: string;
  preMeterProtection?: string;
  circuitsCount?: number;
  earthingType?: string;
  lastEarthResistance?: string;

  // Reviews
  lastMeasurementDate?: string;
  reviewIntervalYears?: number;

  protocols?: any[];
  visits?: any[];
}

export interface Service {
  id?: number;
  name: string;
  defaultPrice: number;
}

export interface Expense {
  id?: number;
  date: string;
  documentNumber: string;
  title?: string;
  description: string;
  amount: number;
  attachment?: string; // base64 or URL
}

export interface Setting {
  id?: number;
  myName: string;
  myAddress: string;
  bankAccount: string;
  quarterlyLimit: number;
  exemptionBasis: string;
  logoBase64?: string;
}

export interface Equipment {
  id?: number;
  model: string;
  serialNumber?: string;
  calibrationDate?: string; // YYYY-MM-DD
  barcodeNumber?: string;
}

export interface KnowledgeItem {
  id?: number;
  title: string;
  category: string;
  content?: string;
  attachment?: string;
}

export interface InventoryItem {
  id?: number;
  name: string;
  quantity: number;
  unit: string;
  minQuantity?: number;
}

export interface Protocol {
  id?: number;
  date: string;
  clientName: string;
  clientAddress: string;
  objectAddress: string;
  equipmentId?: number;
  measurements: any[];
  notes: string;
  status: 'draft' | 'completed';
}

export interface Quote {
  id?: number;
  date: string;
  documentNumber: string;
  clientName: string;
  clientData: string;
  items: any[];
  amount: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  notes: string;
}

export interface KanbanTask {
  id?: number;
  title: string;
  description: string;
  clientName: string;
  status: 'new' | 'estimate' | 'waiting' | 'todo' | 'done';
  createdAt: string;
}

export interface MileageLog {
  id?: number;
  date: string;
  clientName: string;
  distance: number;
  ratePerKm: number;
  totalCost: number;
}

export interface ProjectLog {
  id?: number;
  clientId: number;
  date: string; // YYYY-MM-DD
  description: string;
  stage: string;
  photos: string[]; // array of base64
}

export interface CircuitDefinition {
  id?: number;
  clientId: number;
  symbol: string; // e.g., F1, Q1
  name: string;   // e.g., Ośw. Salon
  type: string;   // e.g., RCD, MCB
  rating: string; // e.g., 16A / B
  cable: string;  // e.g., 3x2.5
}

export class AppDatabase extends Dexie {
  sales!: Table<Sale>;
  clients!: Table<Client>;
  services!: Table<Service>;
  expenses!: Table<Expense>;
  settings!: Table<Setting>;
  calendarEvents!: Table<CalendarEvent>;
  equipment!: Table<Equipment>;
  knowledge!: Table<KnowledgeItem>;
  inventory!: Table<InventoryItem>;
  protocols!: Table<Protocol>;
  quotes!: Table<Quote>;
  tasks!: Table<KanbanTask>;
  mileage!: Table<MileageLog>;
  projectLogs!: Table<ProjectLog>;
  circuits!: Table<CircuitDefinition>;

  constructor() {
    super('DzialalnoscDb');
    this.version(1).stores({
      sales: '++id, date, documentNumber, clientName',
      clients: '++id, name',
      services: '++id, name',
      expenses: '++id, date',
      settings: 'id'
    });

    this.version(2).stores({
      calendarEvents: '++id, date, clientName'
    }).upgrade(tx => {
      // add bankAccount to existing settings
      tx.table('settings').toCollection().modify(setting => {
        if (setting.bankAccount === undefined) setting.bankAccount = '';
      });
    });

    this.version(3).stores({
      equipment: '++id, model, calibrationDate',
      knowledge: '++id, category, title',
      inventory: '++id, name'
    });

    this.version(4).stores({
      protocols: '++id, date, clientName',
      quotes: '++id, date, documentNumber, clientName',
      tasks: '++id, status',
      mileage: '++id, date, clientName'
    });

    this.version(5).stores({
      projectLogs: '++id, clientId, date',
      circuits: '++id, clientId, symbol'
    });

    this.version(6).stores({
      equipment: '++id, model, calibrationDate, barcodeNumber'
    }).upgrade(tx => {
      // Przypisz kody kreskowe dla istniejącego sprzętu, jeśli nie mają
      tx.table('equipment').toCollection().modify(eq => {
        if (!eq.barcodeNumber) {
          eq.barcodeNumber = 'EBS-' + Math.floor(100000 + Math.random() * 900000).toString();
        }
      });
    });
  }
}

export const db = new AppDatabase();

db.on('populate', () => {
  db.settings.add({
    id: 1,
    myName: 'Jan Kowalski\nInstalacje Elektryczne',
    myAddress: 'ul. Przykładowa 12/3\n00-000 Warszawa',
    bankAccount: '',
    quarterlyLimit: 10498.50,
    exemptionBasis: 'Zwolnienie ze względu na limit obrotów – art. 113 ust. 1 i 9 ustawy o VAT'
  });
  db.services.bulkAdd([
    { name: 'Pomiary okresowe instalacji elektrycznej w lokalu', defaultPrice: 200 },
    { name: 'Pomiary pętli zwarcia', defaultPrice: 15 },
    { name: 'Podłączenie płyty indukcyjnej z wpisem do karty gwarancyjnej', defaultPrice: 150 }
  ]);
});
