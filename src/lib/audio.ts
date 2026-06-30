type KeySoundPlayer = (code: string) => void

let currentPlayer: KeySoundPlayer | null = null

export function registerKeySoundPlayer(player: KeySoundPlayer | null) {
  currentPlayer = player
}

export function playKeySound(code: string) {
  currentPlayer?.(code)
}
