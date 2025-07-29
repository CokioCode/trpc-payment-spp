import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export interface JWTPayload {
  userId: string;
  email: string;
  role: "ADMINISTRATOR" | "PETUGAS" | "SISWA";
  nama: string;
  siswaId?: string;
  iat?: number;
  exp?: number;
}

export const signToken = (payload: Omit<JWTPayload, "iat" | "exp">): string => {
  console.log("=== SIGNING TOKEN ===");
  console.log("JWT_SECRET exists:", !!JWT_SECRET);
  console.log("JWT_SECRET length:", JWT_SECRET?.length || 0);
  console.log("Payload to sign:", payload);

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
  console.log("Generated token:", token.substring(0, 50) + "...");

  return token;
};

export const verifyToken = (token: string): JWTPayload | null => {
  try {
    console.log("=== VERIFYING TOKEN ===");
    console.log("Token to verify:", token.substring(0, 50) + "...");
    console.log("JWT_SECRET exists:", !!JWT_SECRET);
    console.log("JWT_SECRET length:", JWT_SECRET?.length || 0);
    console.log(
      "JWT_SECRET first 10 chars:",
      JWT_SECRET?.substring(0, 10) || "undefined"
    );

    const decoded = jwt.decode(token, { complete: true });
    console.log("Decoded header:", decoded?.header);
    console.log("Decoded payload:", decoded?.payload);

    const verified = jwt.verify(token, JWT_SECRET) as JWTPayload;
    console.log("Verification successful:", verified);

    return verified;
  } catch (error: any) {
    console.error("=== JWT VERIFICATION ERROR ===");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Full error:", error);

    if (error.name === "TokenExpiredError") {
      console.error("Token expired at:", error.expiredAt);
      console.error("Current time:", new Date());
    }
    if (error.name === "JsonWebTokenError") {
      console.error("Invalid token - possible causes:");
      console.error("- Wrong secret key");
      console.error("- Malformed token");
      console.error("- Token signature verification failed");
    }
    if (error.name === "NotBeforeError") {
      console.error("Token not active yet:", error.date);
    }

    return null;
  }
};
