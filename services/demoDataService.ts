import { AppData, Profile, User, Supplier, Product, Event, Order, Incident, ServiceGroup, Service } from '../types';
import { users as initialUsers } from './authService';
import { trainingCycles, modules, groups } from './dataService';

// FIX: Explicitly type the array to ensure string literals are correctly typed.
const demoUsers: User[] = [
    ...initialUsers,
    { id: 'teacher-2', name: 'Carlos Gomez (Tutor)', email: 'carlos.gomez@managerpro.edu', password: 'password', avatar: 'https://i.pravatar.cc/150?u=teacher-2', profiles: [Profile.TEACHER], activityStatus: 'Activo', locationStatus: 'En el centro', contractType: 'Fijo', roleType: 'Titular', phone: '622334455', address: 'Plaza Mayor 1' },
    { id: 'teacher-3', name: 'Lucia Fernandez (Sustituta)', email: 'lucia.fernandez@managerpro.edu', password: 'password', avatar: 'https://i.pravatar.cc/150?u=teacher-3', profiles: [Profile.TEACHER], activityStatus: 'Activo', locationStatus: 'Fuera del centro', contractType: 'Interino', roleType: 'Sustituto', phone: '633445566', address: 'Camino Nuevo 8' },
    { id: 'student-2', name: 'Elena Rodriguez', email: 'elena.r@managerpro.edu', password: 'password', avatar: 'https://i.pravatar.cc/150?u=student-2', profiles: [Profile.STUDENT], activityStatus: 'Activo', locationStatus: 'En el centro', classroomId: 'classroom-1', studentSimulatedProfile: Profile.TEACHER },
    { id: 'student-3', name: 'Javier Morales', email: 'javier.m@managerpro.edu', password: 'password', avatar: 'https://i.pravatar.cc/150?u=student-3', profiles: [Profile.STUDENT], activityStatus: 'Activo', locationStatus: 'En el centro', classroomId: 'classroom-1', studentSimulatedProfile: Profile.ALMACEN },
    { id: 'user-5', name: 'Super Usuario (Todos los Perfiles)', email: 'all@example.com', password: 'password123', avatar: 'https://i.pravatar.cc/150?u=all@example.com', profiles: [Profile.ADMIN, Profile.TEACHER, Profile.ALMACEN, Profile.CREATOR, Profile.STUDENT], activityStatus: 'Activo', locationStatus: 'En el centro', roleType: 'Titular', contractType: 'Fijo', classroomId: 'classroom-1', phone: '655667788', address: 'Plaza del Centro 1', studentSimulatedProfile: Profile.TEACHER },
];

// FIX: Explicitly type the array to ensure string literals are correctly typed.
const demoSuppliers: Supplier[] = [
    { id: 'sup-1', name: 'Distribuciones Gourmet SL', cif: 'B98765432', address: 'Pol. Ind. El Sabor, Parcela 5', phone: '912345678', email: 'pedidos@gourmetsl.es', contactPerson: 'Marta Casado', status: 'Activo' },
    { id: 'sup-2', name: 'Frutas y Verduras del Campo', cif: 'A12312312', address: 'Mercado Central, Puesto 12', phone: '934567890', email: 'info@delcampo.es', contactPerson: 'Juan Torres', status: 'Activo' },
    { id: 'sup-3', name: 'Carnes de la Sierra', cif: 'B87654321', address: 'Calle Mayor 45, Pueblo Seco', phone: '965432109', email: 'carnes@sierra.com', contactPerson: 'Pedro Jimenez', status: 'Inactivo' },
];

// FIX: Explicitly type the array to ensure string literals are correctly typed.
const demoProducts: Product[] = [
    { id: 'prod-1', name: 'Solomillo de Ternera', description: 'Pieza de 1kg aprox.', reference: 'CAR-SOL-01', unit: 'kg', suppliers: [{ supplierId: 'sup-1', price: 25.50 }, { supplierId: 'sup-3', price: 24.90 }], tax: 10, category: 'VACUNO', family: 'Carnes', allergens: [], status: 'Activo', productState: 'Fresco', warehouseStatus: 'Disponible' },
    { id: 'prod-2', name: 'Harina de Trigo', description: 'Saco de 25kg', reference: 'ALI-HAR-05', unit: 'kg', suppliers: [{ supplierId: 'sup-1', price: 0.80 }], tax: 4, category: 'HARINAS', family: 'HARINAS, SEMILLAS Y GRANOS', allergens: ['Gluten'], status: 'Activo', productState: 'Otros', warehouseStatus: 'Disponible' },
    { id: 'prod-3', name: 'Aceite de Oliva Virgen Extra', description: 'Garrafa 5L', reference: 'ALI-ACE-02', unit: 'L', suppliers: [{ supplierId: 'sup-1', price: 6.50 }, { supplierId: 'sup-2', price: 6.75 }], tax: 10, category: 'ACEITES', family: 'ACEITES Y GRASAS', allergens: [], status: 'Activo', productState: 'Otros', warehouseStatus: 'Bajo Pedido' },
    { id: 'prod-4', name: 'Lechuga Romana', description: 'Caja 12 unidades', reference: 'VER-LEC-01', unit: 'Uds', suppliers: [{ supplierId: 'sup-2', price: 0.60 }], tax: 4, category: 'VERDURAS', family: 'Vegetales', allergens: [], status: 'Activo', productState: 'Fresco', warehouseStatus: 'Disponible' },
];

// FIX: Explicitly type the array to ensure string literals are correctly typed.
const demoEvents: Event[] = [
    { id: 'evt-1', name: 'Pedido Semanal Ordinario', type: 'Regular', startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), budgetPerTeacher: 300, status: 'Activo' },
    { id: 'evt-2', name: 'Extra Navidad', type: 'Extraordinario', startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), endDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), budgetPerTeacher: 500, authorizedTeachers: ['teacher-1'], status: 'Activo' }
];

// FIX: Explicitly type the array to ensure string literals are correctly typed.
const demoOrders: Order[] = [
    { id: 'ord-1', userId: 'teacher-1', date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), status: 'Completado', eventId: 'evt-2', items: [{ productId: 'prod-1', quantity: 5, price: 25.50, tax: 10 }], cost: 140.25, notes: 'Para el menú de Navidad' },
    { id: 'ord-2', userId: 'teacher-2', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), status: 'Enviado', eventId: 'evt-1', items: [{ productId: 'prod-2', quantity: 10, price: 0.80, tax: 4 }, { productId: 'prod-4', quantity: 12, price: 0.60, tax: 4 }], cost: 15.90, notes: 'Básicos de cocina', newProductRequests: [{ productName: 'Tinta de Calamar Fresca (500g)', quantity: 2, notes: 'Proveedor sugerido: Pescados del Mar Menor, precio aprox 8€/ud' }] },
    { id: 'ord-3', userId: 'teacher-1', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), status: 'Enviado', eventId: 'evt-1', items: [{ productId: 'prod-3', quantity: 2, price: 6.50, tax: 10 }], cost: 14.30, notes: '' },
];

// FIX: Explicitly type the array to ensure string literals are correctly typed.
const demoIncidents: Incident[] = [
    { id: 'inc-1', date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), description: 'El solomillo llegó con la cadena de frío rota.', reportedBy: 'user-2', status: 'Resuelta', supplierId: 'sup-1', productId: 'prod-1', eventId: 'evt-2' }
];

const demoServiceGroups: ServiceGroup[] = [
    { id: 'sg-1', name: 'Servicio Miércoles Mediodía', teacherIds: ['teacher-1', 'teacher-2'] }
];

const demoServices: Service[] = [
    { id: 'svc-1', name: 'Comida de Navidad', date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), serviceGroupId: 'sg-1', menu: [{ recipeId: 'rec-1' }], roles: { 'Cocina': 'teacher-1' }, status: 'Planificación' }
];

export const demoData: AppData = {
    users: demoUsers,
    products: demoProducts,
    suppliers: demoSuppliers,
    events: demoEvents,
    orders: demoOrders,
    incidents: demoIncidents,
    trainingCycles,
    modules,
    groups,
    assignments: [
        { id: 'asg-1', userId: 'teacher-1', groupId: 'grp-c1-1-1' },
        { id: 'asg-2', userId: 'teacher-2', groupId: 'grp-c1-2-1' },
    ],
    recipes: [
        { 
            id: 'rec-1', 
            name: 'Solomillo Wellington', 
            description: 'Clásico solomillo envuelto en hojaldre', 
            authorId: 'teacher-1', 
            yieldAmount: 4,
            yieldUnit: 'raciones',
            category: 'Platos Principales',
            ingredients: [{ productId: 'prod-1', quantity: 1, unit: 'kg' }], 
            preparationSteps: '1. Sellar el solomillo.\n2. Envolver en duxelles y hojaldre.\n3. Hornear a 200°C durante 20 minutos.', 
            isPublic: true, 
            cost: 25.50,
            price: 45.00,
            keyPoints: 'Asegurarse de que el hojaldre esté bien frío.',
            presentation: 'Plato llano grande',
            temperature: 'Caliente',
            recommendedMarking: 'Cuchillo y tenedor de carne',
            serviceType: 'Emplatado en cocina',
            clientDescription: 'Jugoso solomillo de ternera envuelto en un crujiente hojaldre con duxelles de champiñones.',
            serviceTime: '8 min',
        },
        {
            id: 'rec-2',
            name: 'Ensalada César',
            description: 'Ensalada clásica con pollo y aderezo César.',
            authorId: 'teacher-2',
            yieldAmount: 2,
            yieldUnit: 'raciones',
            category: 'Entrantes',
            ingredients: [
                { productId: 'prod-4', quantity: 1, unit: 'Uds' }
            ],
            preparationSteps: '1. Lavar y cortar la lechuga.\n2. Añadir pollo a la parrilla y picatostes.\n3. Aliñar con salsa César.',
            isPublic: true,
            cost: 1.50,
            price: 8.00,
            keyPoints: 'Usar anchoas en el aderezo para un sabor auténtico.',
            presentation: 'Bol de ensalada',
            temperature: 'Frio',
            recommendedMarking: 'Tenedor',
            serviceType: 'Emplatado en cocina',
            clientDescription: 'Lechuga romana fresca con pollo a la parrilla, picatostes y nuestra salsa César casera.',
            serviceTime: '3 min',
        }
    ],
    sales: [
        { id: 'sale-1', teacherId: 'teacher-1', date: new Date().toISOString(), amount: 150.75, category: 'Menú del Día' }
    ],
    miniEconomatoStock: [
        { id: 'prod-2', stock: 50, minStock: 20 },
        { id: 'prod-3', stock: 10, minStock: 15 }
    ],
    messages: [
        { id: 'msg-1', senderId: 'user-1', recipientIds: ['user-2'], subject: 'Revisión de Pedidos', body: 'Por favor, revisa los pedidos pendientes para el evento semanal.', date: new Date().toISOString(), readBy: {} }
    ],
    classrooms: [
        { id: 'classroom-1', name: 'Prácticas de Almacén 101', tutorId: 'teacher-1' }
    ],
    classroomProducts: [
        { id: 'cprod-1', name: 'Harina de Simulación', reference: 'SIM-HAR-01', category: 'Secos', classroomId: 'classroom-1' }
    ],
    classroomSuppliers: [
        { id: 'csupp-1', name: 'Proveedor Ficticio A', classroomId: 'classroom-1' }
    ],
    classroomEvents: [
        { id: 'cevt-1', name: 'Práctica #1: Pedido y Recepción', startDate: new Date().toISOString(), endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), classroomId: 'classroom-1' }
    ],
    classroomOrders: [
        { id: 'cord-1', studentId: 'student-2', eventId: 'cevt-1', classroomId: 'classroom-1', date: new Date().toISOString(), status: 'Pendiente', items: [{ productId: 'cprod-1', quantity: 5 }] }
    ],
    serviceGroups: demoServiceGroups,
    services: demoServices,
};