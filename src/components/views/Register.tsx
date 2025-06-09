import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hook/useAuth";

interface FormData {
  username: string;
  email: string;
  password: string;
}

export default function Register() {
  const [form, setForm] = useState<FormData>({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
    console.log(user);
  }, [user, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prevForm) => ({ ...prevForm, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8080/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Registrasi gagal. Coba lagi.");
        setLoading(false);
        return;
      }

      // Success
      navigate("/login");
    } catch (err) {
      console.error("Register error:", err);
      setError("Terjadi kesalahan saat menghubungi server");
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto mt-28">
      <div className="w-full max-w-md bg-white border border-slate-300 px-4 py-6 shadow-lg rounded-lg">
        <h2 className="text-2xl font-bold text-center text-gray-700">
          Register
        </h2>

        {error && <p className="text-red-500 text-center mt-2">{error}</p>}

        <form className="mt-4" onSubmit={handleSubmit}>
          <div className="space-y-2 mb-3">
            <label className="block text-slate-700 text-medium font-semibold">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              className="w-full text-slate-700 text-lg px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-400"
              required
            />
          </div>

          <div className="space-y-2 mb-3">
            <label className="block text-slate-700 text-medium font-semibold">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full text-slate-700 text-lg px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-400"
              required
            />
          </div>

          <div className="space-y-2 mb-3">
            <label className="block text-slate-700 text-medium font-semibold">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full text-slate-700 text-lg px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-400"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-300"
          >
            {loading ? "Processing..." : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
}
