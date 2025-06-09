import { useEffect, useState } from "react";
import { useAuth } from "../../hook/useAuth";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router";

const LoginPage = () => {
  const { loginUser, user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      navigate("/");
    }
    console.log(user);
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await loginUser(e);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
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
    <div className="flex px-4  justify-center items-center h-screen">
      <div className="w-md  rounded shadow-lg p-8">
        <h2 className="text-center font-bold mb-6">Sign in to App</h2>
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-4 text-red-500 text-sm font-semibold text-center">
              {error}
            </div>
          )}
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="username"
            >
              Username
            </label>
            <input
              className="shadow border-slate-50 appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:bg-transparent focus:shadow-outline [&:-webkit-autofill]:shadow-[inset_0_0_0_1000px_white] [&:-webkit-autofill]:[-webkit-text-fill-color:theme(colors.gray.700)]"
              id="username"
              name="username"
              type="text"
              placeholder="Username"
            />
          </div>
          <div className="mb-6">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="password"
            >
              Password
            </label>
            <input
              className="shadow  border-slate-50 appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              autoComplete="off"
            />
          </div>

          <button
            className={`w-full outline outline-slate-300 shadow-sm text-slate-700 hover:bg-slate-100 font-bold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline flex items-center justify-center  ${
              isLoading ? "opacity-70 cursor-not-allowed" : ""
            }`}
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Process...." : "Log in"}
          </button>
        </form>
        <div className="mt-3 text-center text-sm font-semibold text-slate-600 hover:text-indigo-700 ">
          <Link to="/register">Create new account?</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
