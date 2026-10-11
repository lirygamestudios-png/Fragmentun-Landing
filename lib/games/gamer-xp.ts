/** Reglas de representación de XP: nunca concede XP ni verifica partidas.
 * Solo consumir puntuaciones procedentes de actividad autenticada y confirmada en servidor.
 * Umbral provisional de interfaz: 100 XP por nivel; revisar antes de activar el primer juego.
 */
export type GamerXpProgress = Readonly<{
  level:number;
  totalXp:number;
  currentLevelXp:number;
  nextLevelXp:number;
  progressPercent:number;
}>;
const XP_PER_LEVEL=100;
export function calculateGamerXpProgress(verifiedTotalXp:number):GamerXpProgress|null{
  if(!Number.isSafeInteger(verifiedTotalXp)||verifiedTotalXp<0)return null;
  const completedLevels=Math.floor(verifiedTotalXp/XP_PER_LEVEL);
  const currentLevelXp=verifiedTotalXp%XP_PER_LEVEL;
  return Object.freeze({
    level:completedLevels+1,
    totalXp:verifiedTotalXp,
    currentLevelXp,
    nextLevelXp:XP_PER_LEVEL,
    progressPercent:Math.min(100,Math.max(0,currentLevelXp/XP_PER_LEVEL*100))
  });
}
