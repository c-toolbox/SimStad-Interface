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
