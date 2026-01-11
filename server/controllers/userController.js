const User = require("../models/userModel");
const bcrypt = require("bcryptjs");

// Fonction pour générer un ID aléatoire (Chiffres + Lettres)
const generateShortId = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Logique pour l'inscription
module.exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    
    const usernameCheck = await User.findOne({ username });
    if (usernameCheck) return res.json({ msg: "Nom d'utilisateur déjà pris", status: false });
    
    const emailCheck = await User.findOne({ email });
    if (emailCheck) return res.json({ msg: "Email déjà utilisé", status: false });

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Génération de l'ID unique
    let shortId = generateShortId();
    // Petite sécurité : vérifier (très rare) que l'ID n'existe pas déjà
    let idCheck = await User.findOne({ shortId });
    while (idCheck) {
      shortId = generateShortId();
      idCheck = await User.findOne({ shortId });
    }

    const user = await User.create({ email, username, password: hashedPassword, shortId });
    
    delete user.password;
    return res.json({ status: true, user });
  } catch (ex) { next(ex); }
};

// Logique pour la connexion
module.exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.json({ msg: "Utilisateur ou mot de passe incorrect", status: false });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.json({ msg: "Utilisateur ou mot de passe incorrect", status: false });

    delete user.password;
    return res.json({ status: true, user });
  } catch (ex) {
    next(ex);
  }
};

// get friends user
module.exports.getAllUsers = async (req, res, next) => {
  try {
    // 1. On cherche l'utilisateur actuel
    // 2. On "populate" le champ friends pour récupérer les infos des amis (et non juste leurs IDs)
    const user = await User.findById(req.params.id).populate({
      path: "friends",
      select: "username email _id avatarImage shortId",
    });

    if (!user) return res.json({ status: false, msg: "Utilisateur non trouvé" });

    // On renvoie uniquement le tableau des amis
    return res.json(user.friends || []);
  } catch (ex) {
    next(ex);
  }
};



module.exports.searchUserByShortId = async (req, res, next) => {
  try {
    const { shortId } = req.params;
    // On cherche l'utilisateur par son ID court
    const user = await User.findOne({ shortId }).select("email username _id shortId avatarImage");
    
    if (!user) {
      return res.json({ status: false, msg: "Utilisateur introuvable." });
    }
    return res.json({ status: true, user });
  } catch (ex) {
    next(ex);
  }
};