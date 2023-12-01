import { Image, SpriteSheet, Audio } from "./util";
import { image, sound, music, loadFont, spritesheet } from "./util";

/* Images */
const images: Image[] = [
	image("norrköping.jpg", "norrköping"),
	image("karta.jpg", "karta"),
];

/* Spritesheets */
const spritesheets: SpriteSheet[] = [];

/* Audios */
const audios: Audio[] = [];

/* Fonts */
await loadFont("Lato-Regular", "Game Font");

export { images, spritesheets, audios };
