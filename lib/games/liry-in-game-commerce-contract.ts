/**
 * LIRYGAMES — contrato preparatorio de comercio dentro de los videojuegos.
 * No expone nombres de IP protegida, SKU comercializables ni precios ficticios.
 * Sin pasarelas, APIs, inventarios persistidos ni cobros hasta el primer juego jugable.
 */
import {LIRY_GAME_LINKS_PENDING,type LiryPublicGameCode} from "./liry-game-link-contract";

export const LIRY_IN_GAME_PURCHASE_CATEGORIES=["skin","weapon","tool","cosmetic","expansion"] as const;
export type LiryInGamePurchaseCategory=(typeof LIRY_IN_GAME_PURCHASE_CATEGORIES)[number];
export type LiryInGamePaymentStatus="not_configured"|"disabled"|"pending"|"confirmed"|"failed"|"refunded";
export type LiryInGameDeliveryStatus="not_started"|"pending"|"delivered"|"revoked";
export type LiryInGameOwnership="account_bound"|"game_bound";
export type LiryInGameStoreAvailability="not_launched"|"preview"|"live";

/** Esquema para futuros artículos reales; NO es un inventario publicado. */
export type LiryInGameItem=Readonly<{
 id:string;
 publicGameCode:LiryPublicGameCode;
 category:LiryInGamePurchaseCategory;
 entitlementCode:string;
 ownership:LiryInGameOwnership;
 grantsCompetitiveAdvantage:boolean;
 published:boolean;
 priceMinorUnits:number|null;
 currency:string|null;
}>;

export type LiryInGamePurchaseRecord=Readonly<{
 purchaseId:string;
 gamerId:string;
 itemId:string;
 publicGameCode:LiryPublicGameCode;
 paymentStatus:LiryInGamePaymentStatus;
 deliveryStatus:LiryInGameDeliveryStatus;
 providerReference:string|null;
 idempotencyKey:string|null;
}>;

export type LiryInGameCommerceReadiness=Readonly<{
 catalogApproved:boolean;
 playerAuthenticated:boolean;
 gameServerVerified:boolean;
 paymentsEnabled:boolean;
 fulfillmentVerified:boolean;
}>;

/** Nunca debe confundirse el merchandising del FrontDesk con la tienda del juego. */
export const LIRY_COMMERCE_CHANNELS=Object.freeze({
 frontdesk:"physical_merchandise_and_brand",
 inGame:"digital_entitlements_per_game"
} as const);

/** No hay artículos digitales a la venta ni transacciones hasta integrar juegos reales. */
export const LIRY_IN_GAME_COMMERCE_RELEASE=Object.freeze({
 availability:"not_launched" as const,
 checkoutEnabled:false,
 fulfillmentEnabled:false,
 liveItems:[] as readonly LiryInGameItem[],
 linkedGames:LIRY_GAME_LINKS_PENDING.map(x=>x.publicGameCode)
});

/** Guard obligatorio para una futura apertura, no ejecuta el cobro. */
export function canOpenLiryInGameCheckout(readiness:LiryInGameCommerceReadiness,item:LiryInGameItem):boolean{
 return LIRY_IN_GAME_COMMERCE_RELEASE.checkoutEnabled
  &&readiness.catalogApproved&&readiness.playerAuthenticated
  &&readiness.gameServerVerified&&readiness.paymentsEnabled
  &&readiness.fulfillmentVerified
  &&item.published&&item.priceMinorUnits!==null&&item.priceMinorUnits>0
  &&!!item.currency&&/^[A-Z]{3}$/.test(item.currency);
}

/** Solo un pago confirmado externamente por servidor puede habilitar una futura entrega. */
export function canFulfillLiryInGamePurchase(record:LiryInGamePurchaseRecord):boolean{
 return LIRY_IN_GAME_COMMERCE_RELEASE.fulfillmentEnabled
  &&record.paymentStatus==="confirmed"
  &&record.deliveryStatus==="pending"
  &&record.providerReference!==null&&record.providerReference.length>0
  &&record.idempotencyKey!==null&&record.idempotencyKey.length>0;
}

/** El cliente jamás concede por sí mismo una skin, arma o herramienta. */
export function isValidLiryInGamePurchaseCategory(value:unknown):value is LiryInGamePurchaseCategory{
 return typeof value==="string"&&LIRY_IN_GAME_PURCHASE_CATEGORIES.some(category=>category===value);
}
