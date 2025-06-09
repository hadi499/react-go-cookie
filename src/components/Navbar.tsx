import { Link } from "react-router";
import { useAuth } from "../hook/useAuth";

export default function Navbar() {
  const { user, logoutUser } = useAuth();

  return (
    <nav className="w-full fixed top-0 md:px-10 lg:px-16 transition-all duration-300 flex justify-between items-center px-8  bg-transparent shadow-md backdrop-blur-md py-4 ">
      <div className="text-xl flex items-center gap-3">
        <div className="mr-6">
          <Link
            to="/"
            className="text-gray-800 text-2xl text-shadow-lg text-shadow-red-500 font-bold"
          >
            Logo
          </Link>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        {user ? (
          <>
            <Link
              to="/products"
              className="text-gray-800 text-lg hover:text-indigo-700 transition-colors"
            >
              Products
            </Link>
            <Link
              to={`/profile/${user.id}`}
              className="text-gray-800 text-lg  hover:text-indigo-700 transition-colors"
            >
              Profile
            </Link>
            <button
              onClick={logoutUser}
              className="block w-full text-left text-lg   px-2 py-1 rounded-lg  text-red-600 cursor-pointer hover:bg-red-700 hover:text-white"
            >
              Logout
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className="text-gray-800 text-lg  hover:bg-indigo-500 hover:text-white px-2 py-1 rounded-lg  transition-colors cursor-pointer"
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
