import Phaser from "phaser";
import { PreloadScene } from "@/scenes/PreloadScene";
import { GameScene } from "@/scenes/GameScene";
import { UIScene } from "./scenes/UIScene";

const config: Phaser.Types.Core.GameConfig = {
	type: Phaser.WEBGL,
	width: 1920,
	height: 1080,
	mipmapFilter: "LINEAR_MIPMAP_LINEAR",
	roundPixels: false,
	scale: {
		mode: Phaser.Scale.FIT,
	},
	scene: [PreloadScene, GameScene, UIScene],
};

import { filesystem, os } from "@neutralinojs/lib";
import { setRuntimeConfig } from "@/utils/RuntimeConfig";
import {
	loadMediaAssets,
	scanMediaFolder,
	// setMediaFolder,
} from "./assets/mediaLoader";
import { config as runtimeConfig } from "./utils/RuntimeConfig";
import { contentManager } from "./utils/ContentManager";

async function loadConfig() {
	try {
		const data = await filesystem.readFile("config.json");
		const config = JSON.parse(data);
		setRuntimeConfig(config);
	} catch (e) {
		console.error("Could not load config.json", e);
	}
}

const loadingTextElement: HTMLElement =
	document.getElementById("loading-text")!;

(async () => {
	loadingTextElement.innerHTML = "Loading config.json...";
	await loadConfig();

	loadingTextElement.innerHTML = "Fetching json from Omni...";
	await contentManager.reloadLayers();

	loadingTextElement.innerHTML = "Scanning media folder...";
	await scanMediaFolder();
	loadingTextElement.innerHTML = "Reading image binaries...";
	await loadMediaAssets();

	loadingTextElement.innerHTML = "Booting...";
	const game = new Phaser.Game(config);
})();
