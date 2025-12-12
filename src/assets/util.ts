export interface Image {
	key: string;
	path: string;
}

export interface SpriteSheet {
	key: string;
	path: string;
	width: number;
	height: number;
}

export interface Audio {
	key: string;
	path: string;
	volume?: number;
	rate?: number;
}

const imageGlob = import.meta.glob("./images/**/*", { as: "url", eager: true });
export const image = (key: string, path: string): Image => {
	return { key, path: imageGlob[`./images/${path}`] };
};

export const spritesheet = (
	key: string,
	path: string,
	width: number,
	height: number
): SpriteSheet => {
	return { key, width, height, path: imageGlob[`./images/${path}`] };
};

const musicGlob = import.meta.glob("./music/**/*.mp3", {
	as: "url",
	eager: true,
});
export const music = (
	key: string,
	path: string,
	volume?: number,
	rate?: number
): Audio => {
	return { key, volume, rate, path: musicGlob[`./music/${path}.mp3`] };
};

const audioGlob = import.meta.glob("./sounds/**/*.mp3", {
	as: "url",
	eager: true,
});
export const sound = (
	key: string,
	path: string,
	volume?: number,
	rate?: number
): Audio => {
	return { key, volume, rate, path: audioGlob[`./sounds/${path}.mp3`] };
};

const fontGlob = import.meta.glob("./fonts/**/*.ttf", {
	as: "url",
	eager: true,
});
export const loadFont = async (key: string, path: string, weight: number) => {
	const face = new FontFace(key, `url(${fontGlob[`./fonts/${path}`]})`, {
		style: "normal",
		weight: `${weight}`,
	});
	await face.load();
	document.fonts.add(face);
};
