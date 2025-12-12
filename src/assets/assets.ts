import { image, loadFont } from "./util";

export interface Image {
	key: string;
	path: string;
}

/* Images */
let images: Image[] = [
	image("streets", "streets.png"),
	image("blank", "blank.png"),
	image("circle", "circle.png"),
	image("square", "square.png"),
	image("border", "border.png"),

	image("vis_c_logo_color", "vis_c_logo_color.png"),
	image("vis_c_logo_lines", "vis_c_logo_lines.png"),
	image("vis_c_logo_white", "vis_c_logo_white.png"),
	image("light", "light.png"),

	image("symbol_circle", "symbols/circle.png"),
	image("symbol_dashed_line", "symbols/dashed_line.png"),
	image("symbol_line", "symbols/line.png"),
	image("symbol_rectangle", "symbols/rectangle.png"),
	image("symbol_sign_road_narrows", "symbols/sign_road_narrows.png"),
	image("symbol_sign_no_vehicles", "symbols/sign_no_vehicles.png"),

	image("arrow-left", "icons/arrow-left.png"),
	image("audio-loud", "icons/audio-loud.png"),
	image("audio-mute", "icons/audio-mute.png"),
	image("book", "icons/book.png"),
	image("city", "icons/city.png"),
	image("cloud-slash", "icons/cloud-slash.png"),
	image("day_moon", "icons/day_moon.png"),
	image("day_sun", "icons/day_sun.png"),
	image("flag-en", "icons/flag-en.png"),
	image("flag-se", "icons/flag-se.png"),
	image("folder-up", "icons/folder-up.png"),
	image("gear-code", "icons/gear-code.png"),
	image("info", "icons/info.png"),
	image("layers", "icons/layers.png"),
	image("lightbulb", "icons/lightbulb.png"),
	image("reset", "icons/reset.png"),
	image("season_fall", "icons/season_fall.png"),
	image("season_spring", "icons/season_spring.png"),
	image("season_summer", "icons/season_summer.png"),
	image("season_winter", "icons/season_winter.png"),
	image("unreal", "icons/unreal.png"),
	image("wifi", "icons/wifi.png"),
	image("wifi-slash", "icons/wifi-slash.png"),
	image("x", "icons/x.png"),

	// image("minimaps/Color/white.png", "minimaps/Color/white"),
	// image("minimaps/Nkpg/Hillshade.png", "minimaps/Nkpg/Hillshade"),
	// image("minimaps/Nkpg/Orto20230921.png", "minimaps/Nkpg/Orto20230921"),
];

/* Thumbnails (only shown in debug layers page) */
// for (let path in import.meta.glob("./images/thumbnails/*/*.png")) {
// 	let file = path.replace("./images/thumbnails/", "").replace(".png", "");
// 	images.push(image(`thumbnails/${file}.png`, file));
// }

/* Minimaps (shown to the right) */
// export const localLayers: string[] = [];
// for (let path in import.meta.glob("./images/minimaps/*/*.png")) {
// 	let file = path.replace("./images/", "").replace(".png", "");
// 	// images.push(image(`${file}.png`, file));
// 	localLayers.push(file.replace("minimaps/", ""));
// }

/* Chapters (images for the home page) */
// for (const path in import.meta.glob("./images/chapters/*")) {
// 	const file = path.replace("./images/chapters/", "");
// 	const key = file.replace(/\..+$/, "");
// 	images.push(image(key, `chapters/${file}`));
// }

/* Legends (used in LegendScene) */
// for (const path in import.meta.glob("./images/legends/*")) {
// 	const file = path.replace("./images/legends/", "");
// 	const key = file.replace(/\..+$/, "");
// 	images.push(image(key, `legends/${file}`));
// }

/* Fonts */

await loadFont("Lato-Black", "Lato-Black.ttf", 900);
await loadFont("Lato-BlackItalic", "Lato-BlackItalic.ttf", 900);
await loadFont("Lato-Bold", "Lato-Bold.ttf", 700);
await loadFont("Lato-BoldItalic", "Lato-BoldItalic.ttf", 700);
await loadFont("Lato-Italic", "Lato-Italic.ttf", 400);
await loadFont("Lato-Light", "Lato-Light.ttf", 300);
await loadFont("Lato-LightItalic", "Lato-LightItalic.ttf", 300);
await loadFont("Lato-Regular", "Lato-Regular.ttf", 400);
await loadFont("Lato-Thin", "Lato-Thin.ttf", 100);
await loadFont("Lato-ThinItalic", "Lato-ThinItalic.ttf", 100);

export { images };
