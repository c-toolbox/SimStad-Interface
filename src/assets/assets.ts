import { Image, SpriteSheet, Audio } from "./util";
import { image, sound, music, loadFont, spritesheet } from "./util";

/* Images */
let images: Image[] = [
	image("norrköping.jpg", "norrköping"),
	image("karta.jpg", "karta"),
	image("streets.png", "streets"),
	image("blank.png", "blank"),

	image("vis_c_logo.png", "vis_c_logo"),
	image("light.png", "light"),

	image("icons/arrow-left.png", "arrow-left"),
	image("icons/arrows-rotate.png", "arrows-rotate"),
	image("icons/arrows-swap.png", "arrows-swap"),
	image("icons/book.png", "book"),
	image("icons/city.png", "city"),
	image("icons/gear-code.png", "gear-code"),
	image("icons/gears.png", "gears"),
	image("icons/globe.png", "globe"),
	image("icons/layers.png", "layers"),
	image("icons/lightbulb.png", "lightbulb"),
	image("icons/list.png", "list"),
	image("icons/map.png", "map"),
	image("icons/marker.png", "marker"),
	image("icons/projector.png", "projector"),
	image("icons/server.png", "server"),
	image("icons/sun.png", "sun"),
	image("icons/sunrise.png", "sunrise"),
	image("icons/unreal.png", "unreal"),
	image("icons/wifi.png", "wifi"),
	image("icons/wifi-slash.png", "wifi-slash"),
	image("icons/x.png", "x"),

	image("chapters/crowd.png", "crowd"),
	image("chapters/sunlight.png", "sunlight"),
	image("chapters/umbrella.png", "umbrella"),
	image("chapters/tram.png", "tram"),
	image("chapters/cranes.png", "cranes"),

	image("legends/vislab-stadstvilling.jpg", "legend_default"),
];

/* Load all thumbnails */
const thumbnailImageGlob = import.meta.glob("./images/thumbnails/*/*.png", {
	as: "url",
	eager: true,
});
for (let path in thumbnailImageGlob) {
	let file = path.replace("./images/thumbnails/", "").replace(".png", "");
	images.push(image(`thumbnails/${file}.png`, file));
}

/* Load all map images */
const mapImageGlob = import.meta.glob("./images/map/*/*.png", {
	as: "url",
	eager: true,
});
for (let path in mapImageGlob) {
	let file = path.replace("./images/", "").replace(".png", "");
	images.push(image(`${file}.png`, file));
}

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

export const iconSizes: { [key: string]: { width: number; height: number } } = {
	"arrow-left": { width: 141, height: 120 },
	"arrows-rotate": { width: 151, height: 140 },
	"arrows-swap": { width: 141, height: 160 },
	"gear-code": { width: 155, height: 160 },
	gears: { width: 198, height: 157 },
	globe: { width: 161, height: 160 },
	layers: { width: 161, height: 160 },
	lightbulb: { width: 111, height: 161 },
	list: { width: 156, height: 130 },
	map: { width: 181, height: 158 },
	projector: { width: 201, height: 160 },
	server: { width: 161, height: 140 },
	sun: { width: 161, height: 160 },
	sunrise: { width: 181, height: 160 },
	unreal: { width: 256, height: 256 },
	wifi: { width: 201, height: 140 },
	"wifi-slash": { width: 201, height: 162 },
};
