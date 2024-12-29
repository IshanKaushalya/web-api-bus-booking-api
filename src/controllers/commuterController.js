// controllers/commuterController.js
const Commuter = require("../models/Commuter");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    let commuter = await Commuter.findOne({ email });
    if (commuter) {
      return res.status(400).json({ msg: "Commuter already exists" });
    }

    commuter = new Commuter({ name, email, password });
    await commuter.save();

    const payload = { commuter: { id: commuter.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ token });
  } catch (err) {
    res.status(500).send("Server Error");
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const commuter = await Commuter.findOne({ email });
    if (!commuter) {
      return res.status(400).json({ msg: "Invalid Credentials" });
    }

    const isMatch = await bcrypt.compare(password, commuter.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid Credentials" });
    }

    const payload = { commuter: { id: commuter.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ token });
  } catch (err) {
    res.status(500).send("Server Error");
  }
};

exports.getProfile = async (req, res) => {
  try {
    const commuter = await Commuter.findById(req.commuter.id).select(
      "-password"
    );
    res.json(commuter);
  } catch (err) {
    res.status(500).send("Server Error");
  }
};
