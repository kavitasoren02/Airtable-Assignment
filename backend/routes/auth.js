import express from "express"
import axios from "axios"
import jwt from "jsonwebtoken"
import User from "../models/User.js"
import crypto from "crypto";
import qs from "qs";
import dotenv from 'dotenv'
dotenv.config();

const router = express.Router()
const authorizationCache = {};
const airtableBaseUrl = (process.env.AIRTABLE_BASE_URL || "https://airtable.com").replace(/\s+/g, "");
const clientId = (process.env.AIRTABLE_CLIENT_ID || "").trim();
const redirectUri = (process.env.AIRTABLE_REDIRECT_URI || "").trim();
const scope = (process.env.AIRTABLE_SCOPES || "user.email:read schema.bases:read data.records:read data.records:write").trim();

router.get("/oauth-url", (req, res) => {
  const state = crypto.randomBytes(32).toString("base64url");
  const codeVerifier = crypto.randomBytes(64).toString("base64url");
  const codeChallengeMethod = "S256";

  const rawHash = crypto.createHash("sha256").update(codeVerifier).digest("base64");
  const codeChallenge = rawHash.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");

  authorizationCache[state] = {
    codeVerifier,
    createdAt: Date.now(),
  };

  const encodedRedirect = encodeURIComponent(redirectUri);
  const encodedScope = encodeURIComponent(scope);

  const authorizationUrl =
    `${airtableBaseUrl}/oauth2/v1/authorize?` +
    `client_id=${encodeURIComponent(clientId)}` +
    `&redirect_uri=${encodedRedirect}` +
    `&response_type=code` +
    `&scope=${encodedScope}` +
    `&state=${encodeURIComponent(state)}` +
    `&code_challenge=${encodeURIComponent(codeChallenge)}` +
    `&code_challenge_method=${encodeURIComponent(codeChallengeMethod)}`;

  res.json({ url: authorizationUrl });
})


router.post("/callback", async (req, res) => {
  try {
    const { code, state } = req.body;

    if (!code || !state) {
      return res.status(400).json({ error: "Missing code or state" });
    }

    const cached = authorizationCache[state];
    if (!cached) {
      return res.status(400).json({ error: "Invalid or expired state" });
    }

    const codeVerifier = cached.codeVerifier;
    delete authorizationCache[state];

    const raw = `${process.env.AIRTABLE_CLIENT_ID}:${process.env.AIRTABLE_CLIENT_SECRET}`;
    const credentials = Buffer.from(raw).toString("base64");
    const authHeader = `Basic ${credentials}`;

    const tokenResponse = await axios.post(
      "https://airtable.com/oauth2/v1/token",
      qs.stringify({
        grant_type: "authorization_code",
        client_id: process.env.AIRTABLE_CLIENT_ID,
        code,
        redirect_uri: process.env.AIRTABLE_REDIRECT_URI,
        code_verifier: codeVerifier,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": authHeader,
        },
      }
    );

    const { access_token, refresh_token, expires_in } = tokenResponse.data;

    const userInfo = await axios.get(
      "https://api.airtable.com/v0/meta/whoami",
      { headers: { Authorization: `Bearer ${access_token}` } }
    );

    const { id, email, name } = userInfo.data;

    let user = await User.findOne({ airtableUserId: id });

    if (!user) {
      user = new User({
        airtableUserId: id,
        email,
        name,
        airtableAccessToken: access_token,
        airtableRefreshToken: refresh_token,
        tokenExpiresAt: new Date(Date.now() + expires_in * 1000),
        loginAt: new Date(),
      });
    } else {
      user.airtableAccessToken = access_token;
      user.airtableRefreshToken = refresh_token;
      user.tokenExpiresAt = new Date(Date.now() + expires_in * 1000);
      user.loginAt = new Date();
    }

    await user.save();

    const jwtToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      token: jwtToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (err) {
    console.error("OAuth Callback Error:", err.response?.data || err);
    res.status(500).json({ error: "OAuth failed", details: err.response?.data || err });
  }
});

router.get("/me", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]
    if (!token) {
      return res.status(401).json({ error: "No token" })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key")
    const user = await User.findById(decoded.userId)

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    res.json({
      id: user._id,
      email: user.email,
      name: user.name,
    })
  } catch (error) {
    res.status(401).json({ error: "Invalid token" })
  }
})

export default router
