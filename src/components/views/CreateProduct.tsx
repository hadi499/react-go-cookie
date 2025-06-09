import { useState, useEffect } from "react";
import type { FormEvent, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";

// Type definitions
interface UserInfo {
  id: string;
}

interface ProductFormData {
  name: string;
  price: string;
  userId: string;
  image: File | null;
}

interface FormErrors {
  name?: string;
  price?: string;
  image?: string;
  general?: string;
}

const CreateProduct: React.FC = () => {
  const navigate = useNavigate();

  // State management
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    price: "",
    userId: "",
    image: null,
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({});

  // Load user info from localStorage on component mount
  useEffect(() => {
    const loadUserInfo = (): void => {
      try {
        const storedUser = localStorage.getItem("userInfo");
        if (storedUser) {
          const parsedUser: UserInfo = JSON.parse(storedUser);
          if (parsedUser?.id) {
            setFormData((prev) => ({
              ...prev,
              userId: parsedUser.id,
            }));
          }
        }
      } catch (error) {
        console.error("Error parsing user info:", error);
        setErrors((prev) => ({
          ...prev,
          general: "Failed to load user information",
        }));
      }
    };

    loadUserInfo();
  }, []);

  // Handle text input changes
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  // Handle image file selection
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0] || null;

    if (file && !["image/jpeg", "image/png"].includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        image: "Hanya file JPG atau PNG yang diperbolehkan!",
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      image: file,
    }));

    // Clear image error
    if (errors.image) {
      setErrors((prev) => ({
        ...prev,
        image: undefined,
      }));
    }
  };

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nama produk wajib diisi";
    }

    if (!formData.price.trim()) {
      newErrors.price = "Harga produk wajib diisi";
    } else if (parseFloat(formData.price) <= 0) {
      newErrors.price = "Harga harus lebih dari 0";
    }

    if (!formData.userId) {
      newErrors.general = "User ID tidak ditemukan";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const submitFormData = new FormData();
    submitFormData.append("name", formData.name);
    submitFormData.append("price", formData.price);
    submitFormData.append("user_id", formData.userId);
    if (formData.image) {
      submitFormData.append("image", formData.image);
    }

    try {
      setLoading(true);
      setErrors({});

      const response = await fetch("http://localhost:8080/products", {
        method: "POST",
        body: submitFormData,
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Gagal membuat produk");
      }

      // Navigate to products page on success
      navigate("/products");
    } catch (error) {
      console.error("Error creating product:", error);
      setErrors({
        general:
          error instanceof Error
            ? error.message
            : "Gagal membuat produk. Silakan coba lagi.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-lg border border-slate-300 rounded-2xl mt-32">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">
        Create Product
      </h2>

      {errors.general && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {errors.general}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium text-gray-700 mb-1">
            Product Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter product name"
            className={`mt-1 p-3 w-full border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.name ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="block font-medium text-gray-700 mb-1">Price</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            placeholder="Enter product price"
            min="0"
            step="0.01"
            className={`mt-1 p-3 w-full border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.price ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.price && (
            <p className="text-red-500 text-sm mt-1">{errors.price}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="image"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Gambar Produk (Opsional)
          </label>
          <input
            type="file"
            id="image"
            accept="image/png, image/jpeg"
            onChange={handleImageChange}
            className={`mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 ${
              errors.image ? "border-red-500" : ""
            }`}
          />
          {errors.image && (
            <p className="text-red-500 text-sm mt-1">{errors.image}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold p-3 rounded-xl transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {loading ? "Creating..." : "Create Product"}
        </button>
      </form>
    </div>
  );
};

export default CreateProduct;
