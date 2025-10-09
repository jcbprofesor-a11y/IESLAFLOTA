
export const SUPER_USER_EMAIL = 'managerproapp@gmail.com';

export enum Profile {
  CREATOR = 'creator',
  ADMIN = 'admin',
  ALMACEN = 'almacen',
  TEACHER = 'teacher',
  STUDENT = 'student',
}

export const getProfileDisplayName = (profile: Profile, context?: 'student_simulation'): string => {
  if (context === 'student_simulation' && profile === Profile.TEACHER) {
    return 'Profesional de Cocina';
  }
  const names: Record<Profile, string> = {
    [Profile.CREATOR]: 'Creador',
    [Profile.ADMIN]: 'Administrador',
    [Profile.ALMACEN]: 'Almacén',
    [Profile.TEACHER]: 'Profesor',
    [Profile.STUDENT]: 'Alumno',
  };
  return names[profile] || profile;
};

export type OrderStatus = 'Borrador' | 'Enviado' | 'Procesado' | 'Recibido Parcial' | 'Recibido OK' | 'Completado' | 'Cancelado';
export type UserActivityStatus = 'Activo' | 'De Baja';
export type UserLocationStatus = 'En el centro' | 'Fuera del centro';
export type SupplierStatus = 'Activo' | 'Inactivo';
export type ProductState = 'Fresco' | 'Congelado' | 'Otros' | 'Conservas' | 'Ahumado' | 'Desalado' | 'UHT' | 'Esterilizado' | 'Enlatado' | 'Deshidratado';
export type WarehouseStatus = 'Disponible' | 'Bajo Pedido' | 'Descontinuado';
export type ReceptionLineStatus = 'pendiente' | 'ok' | 'parcial' | 'incidencia';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  avatar: string;
  profiles: Profile[];
  activityStatus: UserActivityStatus;
  locationStatus: UserLocationStatus;
  contractType?: 'Fijo' | 'Interino';
  roleType?: 'Titular' | 'Sustituto';
  classroomId?: string;
  phone?: string;
  secondaryPhone?: string;
  address?: string;
  studentSimulatedProfile?: Profile.TEACHER | Profile.ALMACEN;
}

export interface Company {
  name: string;
  logo: string;
  printLogo: string;
  cif: string;
  address: string;
  phone: string;
  email: string;
  defaultBudget: number;
  managerUserId?: string;
}

export interface Creator {
  name: string;
  logo: string;
  website: string;
  copyright: string;
  appName: string;
}

export interface ProductSupplier {
  supplierId: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  reference: string;
  unit: string;
  suppliers: ProductSupplier[];
  tax: number; // e.g. 21 for 21%
  category: string;
  family: string;
  allergens: string[];
  status: 'Activo' | 'Inactivo';
  productState?: ProductState;
  warehouseStatus?: WarehouseStatus;
}

export interface Supplier {
  id: string;
  name: string;
  cif: string;
  address: string;
  phone: string;
  email: string;
  contactPerson: string;
  status: SupplierStatus;
  website?: string;
  notes?: string;
}

export interface Event {
    id: string;
    name: string;
    type: 'Regular' | 'Extraordinario';
    startDate: string; // ISO string
    endDate: string; // ISO string
    budgetPerTeacher: number;
    authorizedTeachers?: string[]; // user IDs
    status: 'Activo' | 'Inactivo';
}

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
  tax: number;
}

export interface NewProductRequest {
    productName: string;
    quantity: number;
    notes: string;
}

export interface Order {
  id: string;
  userId: string;
  date: string; // ISO string
  status: OrderStatus;
  eventId: string;
  items: OrderItem[];
  newProductRequests?: NewProductRequest[];
  cost?: number;
  notes?: string;
}

export interface Incident {
    id: string;
    date: string; // ISO string
    description: string;
    reportedBy: string; // userId
    status: 'Abierta' | 'En Progreso' | 'Resuelta';
    supplierId: string;
    productId?: string;
    eventId?: string;
}

export interface ReceptionItem {
    status: ReceptionLineStatus;
    receivedQuantity: number;
    orderedQuantity: number;
}

export interface TrainingCycle {
    id: string;
    name: string;
}

export interface Module {
    id: string;
    cycleId: string;
    name: string;
}

export interface Group {
    id: string;
    moduleId: string;
    name: string;
}

export interface Assignment {
    id: string;
    userId: string;
    groupId: string;
}

export interface RecipeIngredient {
  productId: string;
  quantity: number;
  unit: string;
}

export interface Recipe {
    id: string;
    name: string;
    description: string;
    authorId: string;
    photo?: string;
    yieldAmount: number;
    yieldUnit: string;
    category: string;
    ingredients: RecipeIngredient[];
    preparationSteps: string;
    keyPoints?: string; // For notes
    isPublic: boolean;
    cost: number; // Will be auto-calculated
    price: number;
    customSection?: {
        title: string;
        content: string;
    };
    presentation?: string;
    temperature?: 'Caliente' | 'Frio' | 'Ambiente';
    recommendedMarking?: string;
    serviceType?: string;
    clientDescription?: string;
    serviceTime?: string;
}

export interface StockItem {
    id: string; // productId
    stock: number;
    minStock: number;
}

export interface Sale {
    id: string;
    teacherId: string;
    date: string; // ISO string
    amount: number;
    category: string;
    description?: string;
}

export interface Message {
    id: string;
    senderId: string;
    recipientIds: string[];
    subject: string;
    body: string;
    date: string; // ISO string
    readBy: { [userId: string]: boolean };
}

export interface Classroom {
    id: string;
    name: string;
    tutorId: string; // userId
}

export interface ClassroomProduct {
    id: string;
    name: string;
    reference: string;
    category: string;
    classroomId: string;
}

export interface ClassroomSupplier {
    id: string;
    name: string;
    classroomId: string;
}

export interface ClassroomEvent {
    id: string;
    name: string;
    startDate: string; // ISO string
    endDate: string; // ISO string
    classroomId: string;
}

export interface ClassroomOrderItem {
    productId: string;
    quantity: number;
}

export interface ClassroomOrder {
    id: string;
    studentId: string; // userId of student
    eventId: string;
    classroomId: string;
    date: string; // ISO string
    status: 'Pendiente' | 'Completado';
    items: ClassroomOrderItem[];
}

export type ServiceRole = 'Cocina' | 'Postres' | 'Servicios (Sala)' | 'Cafetería';

export interface ServiceGroup {
    id: string;
    name: string;
    teacherIds: string[];
    // FIX: Add missing optional 'roles' property to allow assigning roles to teachers within a group.
    roles?: Partial<Record<ServiceRole, string[]>>;
}

export interface ServiceMenuItem {
    recipeId: string;
}

export interface Service {
    id: string;
    name: string;
    date: string; // ISO string
    serviceGroupId: string;
    menu: ServiceMenuItem[];
    roles: Partial<Record<ServiceRole, string>>; // string is userId
    status: 'Planificación' | 'Confirmado' | 'Completado';
}

export interface AppData {
    users: User[];
    products: Product[];
    suppliers: Supplier[];
    events: Event[];
    orders: Order[];
    incidents: Incident[];
    trainingCycles: TrainingCycle[];
    modules: Module[];
    groups: Group[];
    assignments: Assignment[];
    recipes: Recipe[];
    sales: Sale[];
    miniEconomatoStock: StockItem[];
    messages: Message[];
    classrooms: Classroom[];
    classroomProducts: ClassroomProduct[];
    classroomSuppliers: ClassroomSupplier[];
    classroomEvents: ClassroomEvent[];
    classroomOrders: ClassroomOrder[];
    serviceGroups: ServiceGroup[];
    services: Service[];
}
