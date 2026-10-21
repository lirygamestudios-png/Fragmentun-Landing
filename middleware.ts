import { NextRequest, NextResponse } from "next/server";

const PUBLIC_FILE = /\.[^/]+$/;
const locales = ["es", "en"] as const;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method=request.method.toUpperCase();
  // Restringir rutas históricas que exponen nombres internos de las IP.
  if(pathname.startsWith("/lirygames-games/")) return new NextResponse(null,{status:404,headers:{"Cache-Control":"no-store"}});


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

  // Sin afectar FRAGMENTUN: reflejar el idioma público de LIRYGAMES en <html lang>.
  if (pathname === "/lirygames" || pathname.startsWith("/lirygames/")) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-fragmentun-locale",request.nextUrl.searchParams.get("lang")==="en"?"en":"es");
    return NextResponse.next({request:{headers:requestHeaders}});
  }

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/admin") ||
    (pathname === "/lirygames" || pathname.startsWith("/lirygames/")) ||
    pathname.startsWith("/go") ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  const matchedLocale = locales.find(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );

  if (matchedLocale) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-fragmentun-locale", matchedLocale);
    return NextResponse.next({request:{headers:requestHeaders}});
  }

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
