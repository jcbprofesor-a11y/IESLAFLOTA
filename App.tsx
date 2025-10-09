import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { CompanyProvider } from './contexts/CompanyContext';
import { CreatorProvider } from './contexts/CreatorContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ProtectedRoute } from './components/ProtectedRoute';

import { Login } from './pages/shared/Login';
import { ProfileSelector } from './pages/shared/ProfileSelector';
import { BlockedAccess } from './pages/shared/BlockedAccess';
import { MyProfile } from './pages/shared/MyProfile';
import { Messaging } from './pages/shared/Messaging';

import { CreatorLayout } from './pages/layouts/CreatorLayout';
import { CreatorDashboard } from './pages/creator/CreatorDashboard';
import { UserManager } from './pages/creator/UserManager';

import { AdminLayout } from './pages/layouts/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { TeacherManager } from './pages/admin/TeacherManager';
import { ProductManager } from './pages/admin/ProductManager';
import { SupplierManager } from './pages/admin/SupplierManager';
import { EventManager } from './pages/admin/EventManager';
import { AssignmentManager } from './pages/admin/AssignmentManager';
import { ExpenseManager } from './pages/admin/ExpenseManager';
import { ExpenseDetailByTeacher } from './pages/admin/ExpenseDetailByTeacher';
import { CompanyData } from './pages/admin/CompanyData';
import { Support } from './pages/admin/Support';
import { ClassroomManager } from './pages/admin/ClassroomManager';
import { ServicePlanner } from './pages/admin/ServicePlanner';

import { ManagerLayout } from './pages/layouts/ManagerLayout';
import { ManagerDashboard } from './pages/manager/ManagerDashboard';
import { ProcessOrders } from './pages/manager/ProcessOrders';
import { WarehouseOrder } from './pages/manager/WarehouseOrder';
import { EconomatoManager } from './pages/manager/EconomatoManager';
import { MiniEconomato } from './pages/manager/MiniEconomato';
import { OrderHistory } from './pages/manager/OrderHistory';

import { TeacherLayout } from './pages/layouts/TeacherLayout';
import { TeacherDashboard } from './pages/teacher/TeacherDashboard';
import { OrderPortal } from './pages/teacher/OrderPortal';
import { OrderForm } from './pages/teacher/OrderForm';
import { TeacherOrderHistory } from './pages/teacher/TeacherOrderHistory';
import { SalesManager } from './pages/teacher/SalesManager';
import { RecipeManager } from './pages/teacher/RecipeManager';
import { RecipeForm } from './pages/teacher/RecipeForm';
import { ServiceViewer } from './pages/teacher/ServiceViewer';

import { ClassroomList } from './pages/teacher/classroom/ClassroomList';

import { StudentLayout } from './pages/layouts/StudentLayout';
import { StudentDashboard } from './pages/student/StudentDashboard';

import { Profile } from './types';


const App: React.FC = () => {
  return (
    <ThemeProvider>
      <CompanyProvider>
        <CreatorProvider>
          <Router>
            <DataProvider>
              <AuthProvider>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/select-profile" element={<ProfileSelector />} />
                  <Route path="/blocked-access" element={<BlockedAccess />} />
                  <Route path="/" element={<Navigate to="/login" />} />

                  {/* Creator Routes */}
                  <Route element={<ProtectedRoute allowedProfiles={[Profile.CREATOR]} />}>
                    <Route path="/creator" element={<CreatorLayout />}>
                      <Route path="dashboard" element={<CreatorDashboard />} />
                      <Route path="user-manager" element={<UserManager />} />
                      <Route index element={<Navigate to="dashboard" replace />} />
                    </Route>
                  </Route>

                  {/* Admin Routes */}
                  <Route element={<ProtectedRoute allowedProfiles={[Profile.ADMIN]} />}>
                    <Route path="/admin" element={<AdminLayout />}>
                      <Route path="dashboard" element={<AdminDashboard />} />
                      <Route path="teachers" element={<TeacherManager />} />
                      <Route path="products" element={<ProductManager />} />
                      <Route path="suppliers" element={<SupplierManager />} />
                      <Route path="events" element={<EventManager />} />
                      <Route path="service-planner" element={<ServicePlanner />} />
                      <Route path="assignments" element={<AssignmentManager />} />
                      <Route path="expenses" element={<ExpenseManager />} />
                      <Route path="expenses/:teacherId" element={<ExpenseDetailByTeacher />} />
                      <Route path="company" element={<CompanyData />} />
                      <Route path="support" element={<Support />} />
                      <Route path="classrooms" element={<ClassroomManager />} />
                      <Route path="messaging" element={<Messaging />} />
                      <Route path="profile" element={<MyProfile />} />
                      <Route index element={<Navigate to="dashboard" replace />} />
                    </Route>
                  </Route>

                  {/* Manager Routes */}
                  <Route element={<ProtectedRoute allowedProfiles={[Profile.ALMACEN]} />}>
                    <Route path="/almacen" element={<ManagerLayout />}>
                        <Route path="dashboard" element={<ManagerDashboard />} />
                        <Route path="process-orders/:eventId?" element={<ProcessOrders />} />
                        <Route path="warehouse-order/:eventId?" element={<WarehouseOrder />} />
                        <Route path="economato" element={<EconomatoManager />} />
                        <Route path="mini-economato" element={<MiniEconomato />} />
                        <Route path="order-history" element={<OrderHistory />} />
                        <Route path="products" element={<ProductManager />} />
                        <Route path="suppliers" element={<SupplierManager />} />
                        <Route path="messaging" element={<Messaging />} />
                        <Route path="profile" element={<MyProfile />} />
                        <Route index element={<Navigate to="dashboard" replace />} />
                    </Route>
                  </Route>

                  {/* Teacher Routes */}
                  <Route element={<ProtectedRoute allowedProfiles={[Profile.TEACHER]} />}>
                    <Route path="/teacher" element={<TeacherLayout />}>
                        <Route path="dashboard" element={<TeacherDashboard />} />
                        <Route path="service-planner" element={<ServiceViewer />} />
                        <Route path="order-portal" element={<OrderPortal />} />
                        <Route path="order-portal/new/:eventId" element={<OrderForm />} />
                        <Route path="order-portal/edit/:orderId" element={<OrderForm />} />
                        <Route path="order-history" element={<TeacherOrderHistory />} />
                        <Route path="sales" element={<SalesManager />} />
                        <Route path="recipes" element={<RecipeManager />} />
                        <Route path="recipes/new" element={<RecipeForm />} />
                        <Route path="recipes/edit/:recipeId" element={<RecipeForm />} />
                        <Route path="aula" element={<ClassroomList />} />
                        <Route path="messaging" element={<Messaging />} />
                        <Route path="profile" element={<MyProfile />} />
                        <Route index element={<Navigate to="dashboard" replace />} />
                    </Route>
                  </Route>
                  
                  {/* Student Routes (Sandboxed) */}
                  <Route element={<ProtectedRoute allowedProfiles={[Profile.STUDENT]} />}>
                    <Route path="/student" element={<StudentLayout />}>
                        <Route path="dashboard" element={<StudentDashboard />} />
                        
                        {/* Simulated Teacher Routes */}
                        <Route path="teacher-dashboard" element={<TeacherDashboard />} />
                        <Route path="order-portal" element={<OrderPortal />} />
                        <Route path="order-portal/new/:eventId" element={<OrderForm />} />
                        <Route path="order-portal/edit/:orderId" element={<OrderForm />} />
                        <Route path="order-history" element={<TeacherOrderHistory />} />
                        <Route path="recipes" element={<RecipeManager />} />
                        <Route path="recipes/new" element={<RecipeForm />} />
                        <Route path="recipes/edit/:recipeId" element={<RecipeForm />} />
                        
                        {/* Simulated Manager Routes */}
                        <Route path="almacen-dashboard" element={<ManagerDashboard />} />
                        <Route path="process-orders/:eventId?" element={<ProcessOrders />} />
                        <Route path="economato" element={<EconomatoManager />} />
                        <Route path="mini-economato" element={<MiniEconomato />} />
                        <Route path="almacen-order-history" element={<OrderHistory />} />
                        <Route path="products" element={<ProductManager />} />
                        <Route path="suppliers" element={<SupplierManager />} />

                        {/* Common Routes */}
                        <Route path="messaging" element={<Messaging />} />
                        <Route path="profile" element={<MyProfile />} />
                        
                        <Route index element={<Navigate to="dashboard" replace />} />
                    </Route>
                  </Route>

                  {/* Fallback for unknown routes */}
                  <Route path="*" element={<Navigate to="/login" />} />
                </Routes>
              </AuthProvider>
            </DataProvider>
          </Router>
        </CreatorProvider>
      </CompanyProvider>
    </ThemeProvider>
  );
}

export default App;