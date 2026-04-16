import * as oidc from "openid-client";
import { Router, type IRouter, type Request, type Response } from "express";
import { pool } from "@workspace/db";
import {
  clearSession,
  getOidcConfig,
  getSessionId,
  createSession,
  SESSION_COOKIE,
  SESSION_TTL_MS,
  type SessionData,
  type AuthUser,
} from "../lib/auth";
import { ensureSimSchema } from "../lib/simSchema";
import { isAdminEmail } from "../lib/adminConfig";

const OIDC_COOKIE_TTL = 10 * 60 * 1000;
const router: IRouter = Router();

function getOrigin(req: Request): string {
  const proto = req.headers["x-forwarded-proto"] || req.protocol || "https";
  const host = req.headers["x-forwarded-host"] || req.headers["host"] || "localhost";
  return `${proto}://${host}`;
}

function getCallbackUrl(req: Request): string {
  return `${getOrigin(req)}/api/callback`;
}

function setSessionCookie(res: Response, sid: string) {
  const isProduction = process.env.NODE_ENV === "production";
  res.cookie(SESSION_COOKIE, sid, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
    maxAge: SESSION_TTL_MS,
  });
}

function setOidcCookie(res: Response, name: string, value: string) {
  const isProduction = process.env.NODE_ENV === "production";
  res.cookie(name, value, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
    maxAge: OIDC_COOKIE_TTL,
  });
}

function getSafeReturnTo(value: unknown, fallback = "/"): string {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) {
    if (typeof value === "string" && value.startsWith("http")) {
      return value;
    }
    return fallback;
  }
  return value;
}

async function upsertSimUser(user: AuthUser) {
  await ensureSimSchema();
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ") || "User";
  const email = user.email || `user-${user.id}@example.com`;

  // Role is determined strictly by the admin email allowlist.
  // No "first user" or "no admins" fallback — that was the security hole.
  const role = isAdminEmail(user.email) ? "admin" : "user";

  await pool.query(
    `INSERT INTO sim_users (id, name, email, role, credits, status)
     VALUES ($1, $2, $3, $4, 0, 'active')
     ON CONFLICT (id) DO UPDATE SET
       name  = EXCLUDED.name,
       email = EXCLUDED.email,
       role  = EXCLUDED.role`,
    [user.id, name, email, role],
  );
}

router.get("/auth/user", (req: Request, res: Response) => {
  res.json({ user: req.isAuthenticated() ? req.user : null });
});

router.get("/login", async (req: Request, res: Response) => {
  try {
    const config = await getOidcConfig();
    const callbackUrl = getCallbackUrl(req);
    const returnTo = getSafeReturnTo(req.query.returnTo, process.env.FRONTEND_URL || "/");

    const state = oidc.randomState();
    const nonce = oidc.randomNonce();
    const codeVerifier = oidc.randomPKCECodeVerifier();
    const codeChallenge = await oidc.calculatePKCECodeChallenge(codeVerifier);

    const redirectTo = oidc.buildAuthorizationUrl(config, {
      redirect_uri: callbackUrl,
      scope: "openid email profile",
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
      state,
      nonce,
      access_type: "offline",
      prompt: "consent",
    });

    setOidcCookie(res, "code_verifier", codeVerifier);
    setOidcCookie(res, "nonce", nonce);
    setOidcCookie(res, "state", state);
    setOidcCookie(res, "return_to", returnTo);

    res.redirect(redirectTo.href);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Auth configuration error";
    res.status(500).send(`<h2>Authentication Error</h2><p>${msg}</p><p>Please configure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.</p>`);
  }
});

router.get("/callback", async (req: Request, res: Response) => {
  const config = await getOidcConfig();
  const callbackUrl = getCallbackUrl(req);

  const codeVerifier = req.cookies?.code_verifier;
  const nonce = req.cookies?.nonce;
  const expectedState = req.cookies?.state;
  const returnTo = getSafeReturnTo(req.cookies?.return_to, process.env.FRONTEND_URL || "/");

  if (!codeVerifier || !expectedState) {
    res.redirect("/api/login");
    return;
  }

  const currentUrl = new URL(
    `${callbackUrl}?${new URL(req.url, `http://${req.headers.host}`).searchParams}`,
  );

  let tokens: oidc.TokenEndpointResponse & oidc.TokenEndpointResponseHelpers;
  try {
    tokens = await oidc.authorizationCodeGrant(config, currentUrl, {
      pkceCodeVerifier: codeVerifier,
      expectedNonce: nonce,
      expectedState,
      idTokenExpected: true,
    });
  } catch {
    res.redirect("/api/login");
    return;
  }

  res.clearCookie("code_verifier", { path: "/" });
  res.clearCookie("nonce", { path: "/" });
  res.clearCookie("state", { path: "/" });
  res.clearCookie("return_to", { path: "/" });

  const claims = tokens.claims();
  if (!claims) {
    res.redirect("/api/login");
    return;
  }

  const user: AuthUser = {
    id: claims.sub as string,
    email: (claims.email as string) || null,
    firstName: (claims.given_name as string) || null,
    lastName: (claims.family_name as string) || null,
    profileImageUrl: (claims.picture as string) || null,
  };

  await upsertSimUser(user);

  const now = Math.floor(Date.now() / 1000);
  const sessionData: SessionData = {
    user,
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expires_at: tokens.expiresIn() ? now + tokens.expiresIn()! : (claims.exp as number | undefined),
  };

  const sid = await createSession(sessionData);
  setSessionCookie(res, sid);
  res.redirect(returnTo);
});

router.get("/logout", async (req: Request, res: Response) => {
  const sid = getSessionId(req);
  await clearSession(res, sid);

  const returnTo = process.env.FRONTEND_URL || getOrigin(req);
  res.redirect(returnTo);
});

export default router;
