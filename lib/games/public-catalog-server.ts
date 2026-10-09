import "server-only";
import {createSupabaseServerClient} from "../supabase/server";
import {plannedLiryGames,type PublicGameCard} from "./public-catalog";

/**
 * Read-only FrontDesk adapter. Never infer playability from game_titles.lifecycle_stage:
 * it is a production workflow stage, not a release authorization.
 *
 * game_titles is currently admin-only under RLS. Public visitors will receive the
 * editorial nine-title catalog until a reviewed public publishing projection exists.
 */
export async function getLiryPublicCatalog():Promise<readonly PublicGameCard[]>{
  try {
    const supabase=await createSupabaseServerClient();
    const{error}=await supabase.from("game_titles")
      .select("slug,lifecycle_stage")
      .limit(9);
    if(error)return plannedLiryGames;
    // Deliberately fail-closed. No available/beta status is inferred from this read.
    // Future integration requires a per-game, human-approved publishing record,
    // verified HTTPS executable and a matching production Release Gate.
    return plannedLiryGames;
  } catch {
    return plannedLiryGames;
  }
}
