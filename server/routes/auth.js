const router = require("express").Router();
const User = require("../models/userModel");
const bcrypt = require("bcryptjs"); // Note: bcryptjs est plus simple à installer que bcrypt
const jwt = require("jsonwebtoken");

// INSCRIPTION (REGISTER)
router.post("/register", async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    
    // Vérifier si l'utilisateur existe déjà
    const usernameCheck = await User.findOne({ username });
    if (usernameCheck)
      return res.json({ msg: "Ce nom d'utilisateur est déjà pris.", status: false });
    
    const emailCheck = await User.findOne({ email });
    if (emailCheck)
      return res.json({ msg: "Cet email est déjà utilisé.", status: false });

    // Crypter le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Créer l'utilisateur
    const user = await User.create({
      email,
      username,
      password: hashedPassword,
    });
    
    // On ne renvoie pas le mot de passe au front !
    delete user.password;
    return res.json({ status: true, user });
  } catch (ex) {
    next(ex);
  }
});

// CONNEXION (LOGIN)
router.post("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body;
    
    // On cherche l'user
    const user = await User.findOne({ username });
    if (!user)
      return res.json({ msg: "Identifiant ou mot de passe incorrect.", status: false });

    // On compare le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.json({ msg: "Identifiant ou mot de passe incorrect.", status: false });

    delete user.password;
    
    // (Optionnel pour plus tard) Création du Token JWT ici si besoin
    // Pour l'instant on renvoie juste l'objet user
    
    return res.json({ status: true, user });
  } catch (ex) {
    next(ex);
  }
});

module.exports = router;