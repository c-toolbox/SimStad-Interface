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

import { filesystem } from "@neutralinojs/lib";
import { setRuntimeConfig } from "@/utils/RuntimeConfig";
import { contentManager } from "./utils/ContentManager";

async function loadConfig() {
	// 1. Try to load from Neutralino (first launch)
	if (window.NL_TOKEN) {
		try {
			const data = await filesystem.readFile("config.json");
			const config = JSON.parse(data);

			// ✅ Save it for future reloads
			localStorage.setItem("app_config", JSON.stringify(config));

			setRuntimeConfig(config);
			console.log("Config", config);
			return;
		} catch (e) {
			console.error("Could not load config.json", e);
		}
	} else {
		console.warn("Neutralino unavailable");
	}

	// 2. Fallback: load from localStorage (after reload)
	const cached = localStorage.getItem("app_config");

	if (cached) {
		console.warn("Using cached config (browser mode)");
		setRuntimeConfig(JSON.parse(cached));
	} else {
		console.warn("No config available");
	}
}

const loadingTextElement: HTMLElement =
	document.getElementById("loading-text")!;

(async () => {
	loadingTextElement.innerHTML = "Loading config.json...";
	await loadConfig();

	loadingTextElement.innerHTML = "Fetching json from Omni...";
	await contentManager.init();

	loadingTextElement.innerHTML = "Booting...";
	const game = new Phaser.Game(config);
})();
