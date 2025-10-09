
import { User, Profile } from '../types';

// This is the initial set of users for a fresh application instance.
// The demo data loader will overwrite this.
export const users: User[] = [
  { id: 'user-1', name: 'Usuario Administrador', email: 'admin@managerpro.edu', password: 'password', avatar: 'https://i.pravatar.cc/150?u=admin@managerpro.edu', profiles: [Profile.ADMIN], activityStatus: 'Activo', locationStatus: 'En el centro', phone: '600112233', address: 'Calle Falsa 123' },
  { id: 'user-2', name: 'Usuario Encargado', email: 'manager@managerpro.edu', password: 'password', avatar: 'https://i.pravatar.cc/150?u=manager@managerpro.edu', profiles: [Profile.ALMACEN], activityStatus: 'Activo', locationStatus: 'En el centro' },
  { id: 'teacher-1', name: 'Ana Martínez (Tutora)', email: 'teacher@managerpro.edu', password: 'password', avatar: 'https://i.pravatar.cc/150?u=teacher-1', profiles: [Profile.TEACHER], activityStatus: 'Activo', locationStatus: 'En el centro', contractType: 'Fijo', roleType: 'Titular', phone: '611223344', address: 'Avenida del Saber 45' },
  { id: 'user-4', name: 'Super Usuario', email: 'managerproapp@gmail.com', avatar: 'https://i.pravatar.cc/150?u=creator@managerpro.edu', profiles: [Profile.ADMIN, Profile.TEACHER, Profile.ALMACEN, Profile.CREATOR, Profile.STUDENT], activityStatus: 'Activo', locationStatus: 'En el centro', roleType: 'Titular', contractType: 'Fijo', classroomId: 'classroom-1', phone: '655667788', address: 'Plaza del Centro 1', studentSimulatedProfile: Profile.TEACHER },
  { id: 'student-1', name: 'Usuario Alumno', email: 'student@managerpro.edu', password: 'password', avatar: 'https://i.pravatar.cc/150?u=student-1', profiles: [Profile.STUDENT], activityStatus: 'Activo', locationStatus: 'En el centro', classroomId: 'classroom-1', studentSimulatedProfile: Profile.ALMACEN },
];
