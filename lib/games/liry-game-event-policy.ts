import {checkGameEventBatch,type LiryGameEventCandidate} from "./liry-game-event-contract";

/** Política de admisión sin efectos. No autentica servidores ni concede XP. */
export type LiryEventAdmission={
 accepted:false;
 reason:"inactive"|"invalid_batch"|"invalid_event"|"duplicate_event"|"mixed_accounts"|"mixed_games"|"unauthorized_source"|"wrong_account"|"wrong_game";
};
export function inspectInactiveGameEventAdmission(
 events:unknown,context:{sourceAuthorized:boolean;accountId:string|null;publicGameCode:string|null}
):LiryEventAdmission{
 const check=checkGameEventBatch(events);
 if(!check.ok)return {accepted:false,reason:check.reason==="ok"?"inactive":check.reason};
 if(!context.sourceAuthorized)return {accepted:false,reason:"unauthorized_source"};
 const items=events as LiryGameEventCandidate[];
 if(!context.accountId||items[0].accountId!==context.accountId)return {accepted:false,reason:"wrong_account"};
 if(!context.publicGameCode||items[0].publicGameCode!==context.publicGameCode)return {accepted:false,reason:"wrong_game"};
 return {accepted:false,reason:"inactive"};
}
