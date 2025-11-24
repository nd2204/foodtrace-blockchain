// src/App.js
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import ProductList from './pages/ProductList';
import ProductForm from './pages/ProductForm';
import FarmList from './pages/FarmList';
import FarmForm from './pages/FarmForm';
import BatchList from './pages/BatchList';
import BatchForm from './pages/BatchForm';
import TracePage from './pages/TracePage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Đường dẫn không cần đăng nhập */}
        <Route path="/login" element={<LoginPage />} />

        {/* Layout tổng thể gồm Sidebar, Header */}
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/products/new" element={<ProductForm />} />
          <Route path="/products/:id" element={<ProductForm />} />
          <Route path="/farms" element={<FarmList />} />
          <Route path="/farms/new" element={<FarmForm />} />
          <Route path="/farms/:id" element={<FarmForm />} />
          <Route path="/batches" element={<BatchList />} />
          <Route path="/batches/new" element={<BatchForm />} />
          <Route path="/batches/:id" element={<BatchForm />} />
          <Route path="/trace" element={<TracePage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
