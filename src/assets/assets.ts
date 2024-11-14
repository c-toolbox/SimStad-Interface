import { Image, SpriteSheet, Audio } from "./util";
import { image, sound, music, loadFont, spritesheet } from "./util";

/* Images */
let images: Image[] = [
	image("streets.png", "streets"),
	image("blank.png", "blank"),
	image("circle.png", "circle"),
	image("nineslice.png", "nineslice"),

	image("vis_c_logo_color.png", "vis_c_logo_color"),
	image("vis_c_logo_lines.png", "vis_c_logo_lines"),
	image("vis_c_logo_white.png", "vis_c_logo_white"),
	image("light.png", "light"),

	image("icons/arrow-left.png", "arrow-left"),
	image("icons/arrows-rotate.png", "arrows-rotate"),
	image("icons/arrows-swap.png", "arrows-swap"),
	image("icons/audio-loud.png", "audio-loud"),
	image("icons/audio-mute.png", "audio-mute"),
	image("icons/book.png", "book"),
	image("icons/city.png", "city"),
	image("icons/envelope.png", "envelope"),
	image("icons/flag-en.png", "flag-en"),
	image("icons/flag-se.png", "flag-se"),
	image("icons/gear-code.png", "gear-code"),
	image("icons/gears.png", "gears"),
	image("icons/globe.png", "globe"),
	image("icons/info.png", "info"),
	image("icons/layers.png", "layers"),
	image("icons/lightbulb.png", "lightbulb"),
	image("icons/list.png", "list"),
	image("icons/map.png", "map"),
	image("icons/marker.png", "marker"),
	image("icons/pointer.png", "pointer"),
	image("icons/projector.png", "projector"),
	image("icons/reset.png", "reset"),
	image("icons/server.png", "server"),
	image("icons/sun.png", "sun"),
	image("icons/sunrise.png", "sunrise"),
	image("icons/unreal.png", "unreal"),
	image("icons/wifi.png", "wifi"),
	image("icons/wifi-slash.png", "wifi-slash"),
	image("icons/x.png", "x"),
	image("icons/season_spring.png", "season_spring"),
	image("icons/season_summer.png", "season_summer"),
	image("icons/season_fall.png", "season_fall"),
	image("icons/season_winter.png", "season_winter"),
	image("icons/day_sun.png", "day_sun"),
	image("icons/day_moon.png", "day_moon"),

	image("symbols/circle.png", "symbol_circle"),
	image("symbols/dashed_line.png", "symbol_dashed_line"),
	image("symbols/line.png", "symbol_line"),
	image("symbols/rectangle.png", "symbol_rectangle"),
	image("symbols/sign_road_narrows.png", "symbol_sign_road_narrows"),
	image("symbols/sign_no_vehicles.png", "symbol_sign_no_vehicles"),
];

/* Thumbnails (only shown in debug layers page) */
for (let path in import.meta.glob("./images/thumbnails/*/*.png")) {
	let file = path.replace("./images/thumbnails/", "").replace(".png", "");
	images.push(image(`thumbnails/${file}.png`, file));
}

/* Minimaps (shown to the right) */
export const layerNames: string[] = [];
for (let path in import.meta.glob("./images/minimaps/*/*.png")) {
	let file = path.replace("./images/", "").replace(".png", "");
	images.push(image(`${file}.png`, file));

	layerNames.push(file.replace("minimaps/", ""));
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
