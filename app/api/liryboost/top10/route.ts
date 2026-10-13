import {NextResponse} from "next/server";
import {readLiryBoostTop10} from "../../../../lib/liryboost/read-provider";
import {buildLiryBoostHttpPayload,LIRYBOOST_PUBLIC_NO_CACHE_HEADERS} from "../../../../lib/liryboost/http-publication";

/** Sin proveedor verificado: cerrado, sin datos ficticios ni caché. */
export const dynamic="force-dynamic";
export async function GET(){
 const snapshot=await readLiryBoostTop10(null);
 return NextResponse.json(buildLiryBoostHttpPayload(snapshot),{
  headers:LIRYBOOST_PUBLIC_NO_CACHE_HEADERS
 });
}
