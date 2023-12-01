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
await loadFont("Lato-Black", "Lato-Black");
await loadFont("Lato-BlackItalic", "Lato-BlackItalic");
await loadFont("Lato-Bold", "Lato-Bold");
await loadFont("Lato-BoldItalic", "Lato-BoldItalic");
await loadFont("Lato-Italic", "Lato-Italic");
await loadFont("Lato-Light", "Lato-Light");
await loadFont("Lato-LightItalic", "Lato-LightItalic");
await loadFont("Lato-Regular", "Lato-Regular");
await loadFont("Lato-Thin", "Lato-Thin");
await loadFont("Lato-ThinItalic", "Lato-ThinItalic");

export { images, spritesheets, audios };
