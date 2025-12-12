import Phaser from "phaser";
import { PreloadScene } from "@/scenes/PreloadScene";
import { GameScene } from "@/scenes/GameScene";
import { LegendScene } from "@/scenes/LegendScene";
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
	scene: [PreloadScene, GameScene, LegendScene, UIScene],
};

import { filesystem } from "@neutralinojs/lib";
import { setRuntimeConfig } from "@/utils/RuntimeConfig";

async function loadConfig() {
	if (!window.NL_TOKEN) {
		return console.warn("Running in browser - skipping config.json");
	}

	try {
		const data = await filesystem.readFile("config.json");
		const config = JSON.parse(data);
		setRuntimeConfig(config);
	} catch (e) {
		console.error("Could not load config.json", e);
	}
}

(async () => {
	await loadConfig();

	const game = new Phaser.Game(config);
})();
