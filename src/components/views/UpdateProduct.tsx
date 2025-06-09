import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function UpdateProduct() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [name, setName] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("userInfo");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser?.id) {
        setUserId(parsedUser.id);
      }
    }
  }, []);

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
        setName(data.product.name);
        setPrice(data.product.price.toString());
      } catch (error) {
        console.error("Gagal memuat produk:", error);
        alert("Gagal memuat produk.");
      }
    };

    if (id) fetchProduct();
  }, [id]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!userId) {
      alert(
        "User ID belum tersedia. Silakan tunggu sebentar atau login kembali."
      );
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", price);
    formData.append("user_id", userId);
    if (image) formData.append("image", image);

    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8080/products/${id}`, {
        method: "PUT",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Gagal memperbarui produk");
      }

      navigate("/products");
    } catch (error) {
      console.error("Gagal memperbarui produk:", error);
      alert("Gagal memperbarui produk. Cek log untuk detail.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow-lg rounded-2xl mt-28">
      <h2 className="text-2xl font-semibold mb-6">Update Product</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Product Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter product name"
            className="mt-1 p-3 w-full border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block font-medium">Price</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Enter product price"
            className="mt-1 p-3 w-full border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <input
            type="hidden"
            value={userId}
            readOnly
            className="mt-1 p-3 w-full border rounded-xl bg-gray-100 cursor-not-allowed focus:outline-none"
          />
        </div>

        <div>
          <label className="block font-medium">Product Image (optional)</label>
          <input
            type="file"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
            className="mt-1 p-3 w-full border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? "Updating..." : "Update Product"}
        </button>
      </form>
    </div>
  );
}
