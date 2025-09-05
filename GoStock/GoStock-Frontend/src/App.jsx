import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Products from './components/Products';
import AddProduct from './components/AddProduct';
import EditProduct from './components/EditProduct';
import Categories from './components/Categories';
import Agenda from './components/Agenda';
import Sales from './components/Sales';
import StockMovements from './components/StockMovements';
import Returns from './components/Returns';
import Suppliers from './components/Suppliers';
import Reports from './components/Reports';
import Users from './components/Users';
import Settings from './components/Settings';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/products" element={<Products />} />
        <Route path="/add-product" element={
          <ProtectedRoute allowedRoles={['admin', 'manager']}>
            <AddProduct />
          </ProtectedRoute>
        } />
        <Route path="/edit-product/:id" element={
          <ProtectedRoute allowedRoles={['admin', 'manager']}>
            <EditProduct />
          </ProtectedRoute>
        } />
        <Route path="/categories" element={<Categories />} />
        <Route path="/agenda" element={<Agenda />} />
        <Route path="/sales" element={<Sales />} />
        <Route path="/stock-movements" element={<StockMovements />} />
        <Route path="/returns" element={<Returns />} />
        <Route path="/suppliers" element={<Suppliers />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/users" element={
          <ProtectedRoute allowedRoles={['admin', 'manager']}>
            <Users />
          </ProtectedRoute>
        } />
                 <Route path="/settings" element={<Settings />} />
      </Routes>
    </Router>
  );
}

export default App;
