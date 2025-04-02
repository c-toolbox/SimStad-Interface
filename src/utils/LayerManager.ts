import { localLayers } from "@/assets/assets";
import { filesystem } from "@neutralinojs/lib";

interface Layer {
	name: string;
	isInDrive: boolean;
	isInLocal: boolean;
}

interface Folder {
	name: string;
	layers: Layer[];
	isSequential: boolean;
	isInDrive: boolean;
	isInLocal: boolean;
}

const driveLayers: string[] = [];
if (!!window.NL_TOKEN) {
	const drivePath = "./Datasets/";
	try {
		const driveFiles = await filesystem.readDirectory(drivePath);
		for (const folder of driveFiles) {
			if (folder.type === "DIRECTORY") {
				const subFiles = await filesystem.readDirectory(
					drivePath + folder.entry
				);
				const pngFiles = subFiles.filter((subFile) =>
					subFile.entry.toLowerCase().endsWith(".png")
				);

				pngFiles.forEach((pngFile) => {
					const filename = pngFile.entry.split(".")[0];
					driveLayers.push(`${folder.entry}/${filename}`);
				});
			}
		}
	} catch (error) {
		console.error("Error reading drive layers:", error);
	}
} else {
	// for (let path in import.meta.glob("../../Datasets/*/*")) {
	// 	let file = path.replace("../../Datasets/", "");
	// 	if (!file.toLowerCase().endsWith(".png")) continue;
	// 	file = file.split(".")[0];
	// 	driveLayers.push(file);
	// }
}

class LayerManager {
	private folders: Folder[] = [];

	constructor() {
		const driveFolders: Record<string, string[]> = {};
		driveLayers.forEach((file) => {
			const folder = file.split("/")[0];
			if (!driveFolders[folder]) driveFolders[folder] = [];
			driveFolders[folder].push(file);
		});

		const localFolders: Record<string, string[]> = {};
		localLayers.forEach((file) => {
			const folder = file.split("/")[0];
			if (!localFolders[folder]) localFolders[folder] = [];
			localFolders[folder].push(file);
		});

		const allFolders = new Set([
			...Object.keys(driveFolders),
			...Object.keys(localFolders),
		]);
		allFolders.forEach((folder) => {
			const driveLayerSet = new Set(driveFolders[folder] || []);
			const localLayerSet = new Set(localFolders[folder] || []);
			const allLayers = new Set([...driveLayerSet, ...localLayerSet]);

			const folderObj: Folder = {
				name: folder,
				layers: Array.from(allLayers).map((layer) => ({
					name: layer,
					isInDrive: driveLayerSet.has(layer),
					isInLocal: localLayerSet.has(layer),
				})),
				isSequential: false,
				isInDrive: !!driveFolders[folder],
				isInLocal: !!localFolders[folder],
			};

			folderObj.isSequential = folderObj.layers.every((layer) => {
				const layerName = layer.name.split("/")[1];
				return layerName.startsWith(folder);
			});

			this.folders.push(folderObj);
		});

		this.folders.sort((a, b) => {
			if (a.isSequential === b.isSequential) {
				return b.layers.length - a.layers.length;
			}
			return a.isSequential ? 1 : -1;
		});
	}

	getFolders(): Folder[] {
		return this.folders;
	}

	getLayers(folder: string): string[] {
		const folderObj = this.folders.find((f) => f.name === folder);
		if (!folderObj) return [];

		return folderObj.layers.map((layer) => layer.name);
	}

	getAllLayers() {
		return this.folders.reduce((layers, folder) => {
			return layers.concat(folder.layers.map((layer) => layer.name));
		}, [] as string[]);
	}

	getLayerCount() {
		return this.folders.reduce((count, folder) => {
			return count + folder.layers.length;
		}, 0);
	}
}

export const layerManager: LayerManager = new LayerManager();
