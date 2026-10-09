/** Modelo A LIRYGAMES: nueve títulos, cada uno con tres mundos internos gratuitos. */
export const PORTFOLIO_GAME_LIMIT = 9 as const;
export const INITIAL_WORLDS_PER_GAME = 3 as const;

export type GamePublicationStatus =
  | "planned" | "development" | "beta" | "available" | "retired";

export type WorldAccess = "free";
export type WorldStatus = "planned" | "beta" | "available" | "retired";

export interface GameWorld {
  id: string;
  gameId: string;
  number: number;
  title: string;
  status: WorldStatus;
  access: WorldAccess;
  playUrl: string | null;
}

export interface PortfolioGame {
  id: string;
  title: string;
  status: GamePublicationStatus;
  worlds: readonly GameWorld[];
}

/** No se permite que un estado planificado parezca jugable. */
export function canPlayWorld(
  game: Pick<PortfolioGame, "status">,
  world: Pick<GameWorld, "status" | "access" | "playUrl">,
  hasBetaAccess = false
): boolean {
  if (world.access !== "free" || !world.playUrl) return false;
  if (game.status === "available" && world.status === "available") return true;
  return game.status === "beta" && world.status === "beta" && hasBetaAccess;
}

/** Los mundos internos NO cuentan como títulos adicionales del catálogo de nueve. */
export function validateInitialWorlds(
  gameId: string,
  worlds: readonly GameWorld[]
): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  if (worlds.length !== INITIAL_WORLDS_PER_GAME) issues.push("initial_world_count");
  const numbers = new Set<number>();
  for (const w of worlds) {
    if (w.gameId !== gameId) issues.push("game_mismatch");
    if (!Number.isInteger(w.number) || w.number < 1 || w.number > INITIAL_WORLDS_PER_GAME) issues.push("invalid_world_number");
    if (numbers.has(w.number)) issues.push("duplicate_world_number");
    numbers.add(w.number);
    if (w.access !== "free") issues.push("world_must_be_free");
  }
  for (let i = 1; i <= INITIAL_WORLDS_PER_GAME; i++) {
    if (!numbers.has(i)) issues.push("missing_world_" + i);
  }
  return { valid: issues.length === 0, issues: [...new Set(issues)] };
}

export function portfolioSlots(games: readonly PortfolioGame[]): {
  filled: number; capacity: number; available: number
} {
  const filled = Math.min(games.length, PORTFOLIO_GAME_LIMIT);
  return { filled, capacity: PORTFOLIO_GAME_LIMIT, available: PORTFOLIO_GAME_LIMIT - filled };
}
