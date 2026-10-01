import { NextRequest, NextResponse } from "next/server";

const PUBLIC_FILE = /\.[^/]+$/;
const locales = ["es", "en"] as const;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method=request.method.toUpperCase();

  if(
    (pathname.startsWith("/api/admin") || pathname.startsWith("/api/auth")) &&
    ["POST","PUT","PATCH","DELETE"].includes(method)
  ){
    const origin=request.headers.get("origin");
    const host=request.headers.get("host");
    if(origin&&host){
      try{
        if(new URL(origin).host!==host){
          return NextResponse.json({error:"invalid_origin"},{status:403});
        }
      }catch{
        return NextResponse.json({error:"invalid_origin"},{status:403});
      }
    }
  }

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/go") ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  const hasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );

  if (hasLocale) return NextResponse.next();

  const preferred = request.headers.get("accept-language")?.toLowerCase().startsWith("en")
    ? "en"
    : "es";

  const url = request.nextUrl.clone();
  url.pathname = `/${preferred}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
