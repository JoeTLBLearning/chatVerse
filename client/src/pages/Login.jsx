import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import { loginRoute } from "../utils/APIRoutes";
import Logo from "../assets/logo.png";

function Login() {
  const navigate = useNavigate();
  const [values, setValues] = useState({ username: "", password: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(loginRoute, values);
      if (data.status === false) {
        toast.error(data.msg, { theme: "light" });
      } else {
        localStorage.setItem('chat-app-user', JSON.stringify(data.user));
        navigate("/");
      }
    } catch (err) {
      toast.error("Le serveur ne répond pas.");
    }
  };

  const handleChange = (e) => setValues({ ...values, [e.target.name]: e.target.value });

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-[#0f172a] px-4">
      {/* Le bloc de connexion est maintenant blanc (bg-white) */}
      <div className="bg-white p-6 md:p-10 rounded-3xl shadow-2xl w-full max-w-md border border-gray-200">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">

          {/* Logo Section */}
          <div className="flex justify-center mb-2">
            <img src={Logo} alt="ChatVerse" className="h-20 w-auto object-contain" />
          </div>

          <h2 className="text-center text-2xl font-bold text-[#0f172a] uppercase tracking-tight">
            Connexion
          </h2>

          <input
            type="text"
            name="username"
            placeholder="Nom d'utilisateur"
            className="w-full bg-gray-50 border border-gray-300 p-3 rounded-lg text-gray-900 focus:border-[#22d3ee] focus:ring-1 focus:ring-[#22d3ee] outline-none transition-all"
            onChange={handleChange}
          />

          <input
            type="password"
            name="password"
            placeholder="Mot de passe"
            className="w-full bg-gray-50 border border-gray-300 p-3 rounded-lg text-gray-900 focus:border-[#22d3ee] focus:ring-1 focus:ring-[#22d3ee] outline-none transition-all"
            onChange={handleChange}
          />

          {/* Bouton Cyan avec texte foncé pour la visibilité */}
          <button
            type="submit"
            className="w-full bg-[#22d3ee] text-[#0f172a] font-bold py-3 rounded-lg hover:bg-[#1cb9d1] transition-all uppercase shadow-lg shadow-cyan-100"
          >
            Se Connecter
          </button>

          <p className="text-center text-gray-500 text-sm">
            Nouveau sur ChatVerse ?
            <Link to="/register" className="text-[#22d3ee] font-bold ml-1 hover:underline">
              Créer un compte
            </Link>
          </p>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
}

export default Login;