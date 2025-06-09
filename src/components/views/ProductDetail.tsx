import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { formatRupiah } from "../../utils/format-currency";

interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  description?: string;
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`http://localhost:8080/products/${id}`, {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Produk tidak ditemukan");
        }

        const data = await response.json();
        setProduct(data.product);
      } catch (error) {
        setError("Gagal memuat detail produk.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus produk ini?"))
      return;

    try {
      const response = await fetch(`http://localhost:8080/products/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Gagal menghapus produk");
      }
      navigate("/products");
    } catch (error) {
      alert("Terjadi kesalahan saat menghapus produk");
    }
  };

  if (loading) return <p>Loading product details...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!product) return <p>Product not found.</p>;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-2xl mt-32">
      <h2 className="text-3xl font-semibold mb-6">{product.name}</h2>
      <p className="text-gray-700 mb-4">{formatRupiah(product.price)}</p>
      {product.image && (
        <img
          src={`http://localhost:8080/${product.image}`}
          alt={product.name}
          className="mb-6 w-full max-h-96 object-cover rounded-lg"
        />
      )}
      <p className="text-gray-600">{product.description}</p>

      <div className="flex px-8 mt-10 justify-between ">
        <Link
          to={`/products/update/${product.id}`}
          className="text-white px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700"
        >
          Edit Product
        </Link>
        <button
          onClick={handleDelete}
          className="text-white px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700"
        >
          Delete Product
        </button>
      </div>
    </div>
  );
}
