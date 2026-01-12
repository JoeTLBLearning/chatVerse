import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { registerRoute } from "../utils/APIRoutes";
import Logo from "../assets/logo.png";

function Register() {
  const navigate = useNavigate();
  const [values, setValues] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const toastOptions = {
    position: "bottom-right",
    autoClose: 5000,
    theme: "light"
  };

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleValidation = () => {
    const { password, confirmPassword, username, email } = values;
    if (password !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas.", toastOptions);
      return false;
    } else if (username.length < 3) {
      toast.error("Le nom d'utilisateur est trop court.", toastOptions);
      return false;
    } else if (password.length < 8) {
      toast.error("Le mot de passe doit faire au moins 8 caractères.", toastOptions);
      return false;
    } else if (email === "") {
      toast.error("L'email est requis.", toastOptions);
      return false;
    }
    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (handleValidation()) {
      try {
        const { email, username, password } = values;
        const { data } = await axios.post(registerRoute, {
          username, email, password,
        });

        if (data.status === false) {
          toast.error(data.msg, toastOptions);
        } else {
          localStorage.setItem('chat-app-user', JSON.stringify(data.user));
          navigate("/");
        }
      } catch (err) {
        toast.error("Erreur lors de l'inscription.", toastOptions);
      }
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-[#0f172a] p-4 overflow-y-auto">
      <div className="bg-white p-6 md:p-10 rounded-3xl shadow-2xl w-full max-w-md border border-gray-200 my-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 md:gap-4">

          {/* Section Logo */}
          <div className="flex flex-col items-center mb-2">
            <img src={Logo} alt="ChatVerse" className="h-20 w-auto object-contain" />
            <h2 className="text-xl font-bold text-[#0f172a] uppercase tracking-tight mt-2">
              Créer un compte
            </h2>
          </div>

          <input
            className="w-full bg-gray-50 border border-gray-300 p-3 rounded-lg text-gray-900 focus:border-[#22d3ee] focus:ring-1 focus:ring-[#22d3ee] outline-none transition-all"
            type="text" placeholder="Nom d'utilisateur" name="username" onChange={handleChange}
          />

          <input
            className="w-full bg-gray-50 border border-gray-300 p-3 rounded-lg text-gray-900 focus:border-[#22d3ee] focus:ring-1 focus:ring-[#22d3ee] outline-none transition-all"
            type="email" placeholder="Email" name="email" onChange={handleChange}
          />

          <input
            className="w-full bg-gray-50 border border-gray-300 p-3 rounded-lg text-gray-900 focus:border-[#22d3ee] focus:ring-1 focus:ring-[#22d3ee] outline-none transition-all"
            type="password" placeholder="Mot de passe" name="password" onChange={handleChange}
          />

          <input
            className="w-full bg-gray-50 border border-gray-300 p-3 rounded-lg text-gray-900 focus:border-[#22d3ee] focus:ring-1 focus:ring-[#22d3ee] outline-none transition-all"
            type="password" placeholder="Confirmer le mot de passe" name="confirmPassword" onChange={handleChange}
          />

          <button
            type="submit"
            className="w-full bg-[#22d3ee] text-[#0f172a] font-bold py-3 rounded-lg hover:bg-[#1cb9d1] transition-all uppercase shadow-lg shadow-cyan-100 mt-2"
          >
            S'inscrire
          </button>

          <p className="text-center text-gray-500 text-sm mt-2">
            Déjà membre ?
            <Link to="/login" className="text-[#22d3ee] font-bold ml-1 hover:underline">
              Se connecter
            </Link>
          </p>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
}

export default Register;