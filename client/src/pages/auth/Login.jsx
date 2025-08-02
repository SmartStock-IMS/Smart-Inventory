import logoTrollious from "../../assets/images/general/logo.png";
import logoMehera from "@assets/images/general/logo_mehera.png";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useState } from "react";
import { useAuth } from "../../context/auth/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import { FaSpinner } from "react-icons/fa";
import { cn } from "@lib/utils";

const SalesRepLogin = () => {
  const { login } = useAuth(); // context login(username, password) function
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // login form input data
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const isAuthenticated = await login(email, password);
    if (isAuthenticated) {
      toast.success("Login successful");
      setTimeout(() => {
        if (isAuthenticated.data.user_type === "002") {
          navigate("/dashboard");
        } else {
          navigate("/");
        }
        setIsLoading(false);
      }, 3000);
    } else {
      setTimeout(() => {
        toast.error("Login failed");
        setIsLoading(false);
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
      {/* Inglot Logo */}
      <img src={logoMehera} alt="logo-mehera" className="w-24 mb-4" />

      {/* Trollious Cosmetics Logo */}
      <img src={logoTrollious} alt="logo-trollious" className="w-40 mb-6" />

      {/* Form */}
      <form className="w-full lg:w-2/5 mt-6 px-10 space-y-4" onSubmit={handleLogin}>
        <div>
          <input
            type="Email"
            placeholder="Email"
            className="w-full lg:ps-6 p-3 rounded-full text-center lg:text-left bg-white text-black border-none focus:ring-2 focus:ring-yellow-500 focus:outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <input
            type="Password"
            placeholder="Password"
            className="w-full lg:ps-6 p-3 rounded-full text-center lg:text-left bg-white text-black border-none focus:ring-2 focus:ring-yellow-500 focus:outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {/* Sign In Button */}
        <button
          type="submit"
          className={cn(
            "w-full p-3 flex flex-row items-center justify-center rounded-full border border-white text-white font-semibold",
            "transition duration-300",
            {
              "hover:bg-black": isLoading,
              "hover:bg-white hover:text-black": !isLoading,
            },
          )}
          disabled={isLoading}
        >
          Login
          {isLoading && (
            <FaSpinner size={20} color="white" className="ms-3 animate-spin" />
          )}
        </button>
      </form>
      <ToastContainer autoClose={3000} />
    </div>
  );
};

export default SalesRepLogin;
