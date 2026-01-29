import { config } from "@/utils/RuntimeConfig";
import { filesystem } from "@neutralinojs/lib";

export const mediaAssets: { [key: string]: { key: string; path: string }[] } = {
	minimaps: [],
	thumbnails: [],
	collections: [],
	legends: [],
	legendsymbols: [],
};
export const runtimeTextures: { key: string; path: string }[] = [];

export async function scanMediaFolder(): Promise<boolean> {
	if (!window.NL_TOKEN) {
		console.error("Cannot scan media folder! Use `npm run dev-neu` instead.");
		return false;
	}

	if (!config.MEDIA_PATH) {
		console.error("Missing `MEDIA_PATH` in config.json");
		return false;
	}

	for (const folder in mediaAssets) {
		mediaAssets[folder].length = 0;
	}

	try {
		const folders = await filesystem.readDirectory(config.MEDIA_PATH);

		await Promise.all(
			folders.map(async (folder) => {
				if (folder.type !== "DIRECTORY" || folder.entry.startsWith(".")) return;

				if (!mediaAssets[folder.entry]) {
					console.warn(`Skipping unknown media folder: ${folder.entry}`);
					return;
				}

				const files = await filesystem.readDirectory(
					`${config.MEDIA_PATH}\\${folder.entry}`
				);

				files
					.filter((f) => f.type === "FILE")
					.forEach((image) => {
						mediaAssets[folder.entry].push({
							// key: "/media/" + folder.entry + "/" + image.entry,
							key: folder.entry + "_" + image.entry.split(".")[0],
							// key: image.entry.split(".")[0],
							path: `${config.MEDIA_PATH}\\${folder.entry}\\${image.entry}`,
							// path: `http://localhost:5050/${folder.entry}/${image.entry}`,
							// path: `${config.MEDIA_URL}/${folder.entry}/${image.entry}`,
						});
					});
			})
		);

		return true;
	} catch (error) {
		console.error("Error reading media:", error);
		return false;
	}
}

export async function loadMediaAssets() {
	for (const category in mediaAssets) {
		for (const asset of mediaAssets[category]) {
			const data = await filesystem.readBinaryFile(asset.path);
			const blob = new Blob([data], { type: "image/png" });
			const objectUrl = URL.createObjectURL(blob);

			runtimeTextures.push({
				key: asset.key,
				path: objectUrl,
			});
		}
	}
}
