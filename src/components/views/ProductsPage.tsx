import { useState, useEffect } from "react";
import { ClipLoader } from "react-spinners";
import { formatRupiah } from "../../utils/format-currency";
import { Link } from "react-router";

interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  description?: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("http://localhost:8080/products", {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Gagal mengambil produk");
        }

        const data = await response.json();
        setProducts(data.products);
      } catch (error) {
        console.error("Error fetching products:", error);
        setError("Gagal memuat produk. Silakan coba lagi.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <ClipLoader color="#0070f3" size={50} />
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-red-500 mt-10">{error}</p>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 mt-20">
      <div className="mb-8 flex justify-end">
        <Link
          to="/products/create"
          className="block text-slate-600 px-2 py-1 rounded-lg border border-slate-400 shadow-md  text-md font-semibold hover:bg-slate-100"
        >
          Add Product
        </Link>
      </div>

      {products?.length === 0 ? (
        <p className="text-gray-600">No products available.</p>
      ) : (
        <div className="flex justify-evenly flex-wrap gap-6 items-center">
          {products?.map((product) => (
            <div
              key={product.id}
              className="flex flex-col items-center p-4 border border-slate-200 rounded-xl hover:shadow-md transition-shadow w-[200px] h-[260px] shadow-md"
            >
              <Link to={`/products/${product.id}`} className="block">
                {product.image && (
                  <img
                    src={`http://localhost:8080/${product.image}`}
                    alt={product.name}
                    className="mt-4 w-32 h-32 object-cover rounded-lg"
                  />
                )}
                <h3 className="text-md font-semibold text-indigo-800 mt-4">
                  {product.name}
                </h3>
                <p className="text-gray-700">{formatRupiah(product.price)}</p>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
