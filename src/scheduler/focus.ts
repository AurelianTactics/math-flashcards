import { CARD_TYPES, type CardType, type Settings } from '../types'

/** Type weights that serve only one card type (practice focus / ?only=). Undefined = normal mix. */
export function onlyTypeWeights(only: CardType | null | undefined): Settings['typeWeights'] | undefined {
  if (!only || !CARD_TYPES.includes(only)) return undefined
  return Object.fromEntries(CARD_TYPES.map((t) => [t, t === only ? 1 : 0])) as Settings['typeWeights']
}
