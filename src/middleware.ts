import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "./lib/jwt-edge";

export async function middleware(request: NextRequest) {
  const token =
    request.cookies.get("token")?.value ||
    request.headers.get("authorization")?.replace("Bearer ", "");

  const protectedPaths = ["/dashboard", "/siswa"];
  const isProtectedPath = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isProtectedPath) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const user = await verifyToken(token);
    if (!user) {
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.set("token", "", {
        expires: new Date(0),
        path: "/",
        httpOnly: true,
      });
      return response;
    }

    const response = NextResponse.next();
    response.headers.set("x-user", JSON.stringify(user));
    return response;
  }

  if (request.nextUrl.pathname === "/login" && token) {
    const user = await verifyToken(token);
    if (user) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    } else {
      const response = NextResponse.next();
      response.cookies.set("token", "", {
        expires: new Date(0),
        path: "/",
        httpOnly: true,
      });
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
