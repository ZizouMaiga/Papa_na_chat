const express = require("express");
const router = express.Router();
const { getUsers, createUser, login } = require("../controllers/userController");

router.get("/", getUsers);
router.post("/", createUser);

// Route d'inscription
router.post("/register", createUser);
// Route de connexion
router.post("/login", login);

module.exports = router;