import Navbar from "./components/Navbar";
import { BrowserRouter, Routes, Route } from "react-router";
import HomePage from "./components/views/HomePage";
import LoginPage from "./components/views/LoginPage";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./utils/ProtectedRoute";
import ProductsPage from "./components/views/ProductsPage";
import CreateProduct from "./components/views/CreateProduct";
import ProductDetail from "./components/views/ProductDetail";
import UpdateProduct from "./components/views/UpdateProduct";
import Register from "./components/views/Register";
import Profile from "./components/views/Profile";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/create" element={<CreateProduct />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/products/update/:id" element={<UpdateProduct />} />
            <Route path="/profile/:id" element={<Profile />} />
          </Route>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
