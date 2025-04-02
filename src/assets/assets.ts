import { Image, SpriteSheet, Audio } from "./util";
import { image, sound, music, loadFont, spritesheet } from "./util";

/* Images */
let images: Image[] = [
	image("streets.png", "streets"),
	image("blank.png", "blank"),
	image("circle.png", "circle"),
	image("square.png", "square"),
	image("border.png", "border"),

	image("vis_c_logo_color.png", "vis_c_logo_color"),
	image("vis_c_logo_lines.png", "vis_c_logo_lines"),
	image("vis_c_logo_white.png", "vis_c_logo_white"),
	image("light.png", "light"),

	image("symbols/circle.png", "symbol_circle"),
	image("symbols/dashed_line.png", "symbol_dashed_line"),
	image("symbols/line.png", "symbol_line"),
	image("symbols/rectangle.png", "symbol_rectangle"),
	image("symbols/sign_road_narrows.png", "symbol_sign_road_narrows"),
	image("symbols/sign_no_vehicles.png", "symbol_sign_no_vehicles"),

	image("minimaps/Color/white.png", "minimaps/Color/white"),
	image("minimaps/Nkpg/Hillshade.png", "minimaps/Nkpg/Hillshade"),
	image("minimaps/Nkpg/Orto20230921.png", "minimaps/Nkpg/Orto20230921"),
];

/* Thumbnails (only shown in debug layers page) */
for (let path in import.meta.glob("./images/thumbnails/*/*.png")) {
	let file = path.replace("./images/thumbnails/", "").replace(".png", "");
	images.push(image(`thumbnails/${file}.png`, file));
}

/* Minimaps (shown to the right) */
export const localLayers: string[] = [];
for (let path in import.meta.glob("./images/minimaps/*/*.png")) {
	let file = path.replace("./images/", "").replace(".png", "");
	images.push(image(`${file}.png`, file));
	localLayers.push(file.replace("minimaps/", ""));
}

/* Chapters (images for the home page) */
for (const path in import.meta.glob("./images/chapters/*")) {
	const file = path.replace("./images/chapters/", "");
	const key = file.replace(/\..+$/, "");
	images.push(image(`chapters/${file}`, key));
}

/* Legends (used in LegendScene) */
for (const path in import.meta.glob("./images/legends/*")) {
	const file = path.replace("./images/legends/", "");
	const key = file.replace(/\..+$/, "");
	images.push(image(`legends/${file}`, key));
}

/* Icons (used everywhere) */
for (const path in import.meta.glob("./images/icons/*")) {
	const file = path.replace("./images/icons/", "");
	const key = file.replace(/\..+$/, "");
	images.push(image(`icons/${file}`, key));
}

/* Spritesheets */
const spritesheets: SpriteSheet[] = [];

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
