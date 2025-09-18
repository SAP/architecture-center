import express from "express";
import axios from "axios";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const JWT_SECRET = process.env.JWT_SECRET as string;
const FRONTEND_URL = process.env.FRONTEND_URL;

if (
  !GITHUB_CLIENT_ID ||
  !GITHUB_CLIENT_SECRET ||
  !JWT_SECRET ||
  !FRONTEND_URL
) {
  throw new Error("Missing necessary environment variables.");
}

app.use(cors());

app.get("/api/auth/github", (req, res) => {
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}`;
  res.redirect(githubAuthUrl);
});

app.get("/api/auth/callback", async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send("Error: No code provided");
  }

  try {
    const tokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code: code,
      },
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    const accessToken = tokenResponse.data.access_token;
    if (!accessToken) {
      throw new Error("Failed to retrieve access token");
    }

    const userResponse = await axios.get("https://api.github.com/user", {
      headers: {
        Authorization: `token ${accessToken}`,
      },
    });

    const userData = userResponse.data;

    const appTokenPayload = {
      githubId: userData.id,
      username: userData.login,
      avatar: userData.avatar_url,
    };

    const appToken = jwt.sign(appTokenPayload, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.redirect(`${FRONTEND_URL}/login/success?token=${appToken}`);
  } catch (error) {
    console.error("Error during GitHub OAuth callback:", error);
    res.redirect(`${FRONTEND_URL}/login/failure`);
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Auth server listening on http://localhost:${PORT}`);
});
