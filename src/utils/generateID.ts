const ALLOWED_CHARACTERS = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz".split("");
const ALLOWED_CHARACTERS_LENGTH = ALLOWED_CHARACTERS.length;

export default function generatePlayerID(length = 16): string {
    let playerID = "";

    let char;

    while (playerID.length < length) {
        char = ALLOWED_CHARACTERS[(Math.random() * ALLOWED_CHARACTERS_LENGTH) >> 0];
        playerID += char;
    }

    return playerID;
}
