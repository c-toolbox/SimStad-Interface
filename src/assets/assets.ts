import { Image, SpriteSheet, Audio } from "./util";
import { image, sound, music, loadFont, spritesheet } from "./util";

/* Images */
const images: Image[] = [
	image("map/norrköping.jpg", "norrköping"),
	image("map/karta.jpg", "karta"),
	image("map/streets.png", "streets"),

	image("vis_c_logo.png", "vis_c_logo"),
];

/* Spritesheets */
const spritesheets: SpriteSheet[] = [
	spritesheet("icons_128.png", "icons", 128, 128),
];

/* Audios */
const audios: Audio[] = [];

/* Fonts */
await loadFont("Lato-Regular", "Game Font");

export { images, spritesheets, audios };
