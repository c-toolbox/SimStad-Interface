import { BaseScene } from "./BaseScene";
import { images } from "@/assets/assets";
import { GrayScalePostFilter } from "@/utils/pipelines/GrayScalePostFilter";
import { BlurPostFilter } from "@/utils/pipelines/BlurPostFilter";
import { languageManager, LanguageKey } from "@/utils/LanguageManager";

export class PreloadScene extends BaseScene {
	constructor() {
		super({ key: "PreloadScene" });
	}

	init() {
		// Load pipelines
		let renderer = this.renderer as Phaser.Renderer.WebGL.WebGLRenderer;
		if (renderer.pipelines) {
			renderer.pipelines.addPostPipeline(
				"GrayScalePostFilter",
				GrayScalePostFilter,
			);
			renderer.pipelines.addPostPipeline("BlurPostFilter", BlurPostFilter);
		}
	}

	preload() {
		this.cameras.main.setBackgroundColor(0x000000);

		// Loading bar
		let width = 0.5 * this.W;
		let x = this.CX - width / 2;
		let y = this.CY;
		let bg = this.add.rectangle(x, y, width, 4, 0x666666).setOrigin(0, 0.5);
		let bar = this.add.rectangle(x, y, 1, 8, 0xdddddd).setOrigin(0, 0.5);

		// Loading text
		this.addText({
			x,
			y,
			size: 30,
			color: "#DDDDDD",
			text: "Loading...",
		}).setOrigin(0, 1.5);

		// Loading progress bar animation
		this.load.on("progress", (progress: number) => {
			bar.width = progress * width;
		});

		// Load local project images (defined in src/assets/assets.ts)
		for (let image of images) {
			this.load.image(image.key, image.path);
		}
	}

	create() {
		languageManager.loadLocalizations();
		languageManager.setLanguage(LanguageKey.Swedish);

		this.fade(true, 200, 0x000000);
		this.addEvent(200, () => {
			this.scene.start("GameScene");
			this.scene.launch("UIScene");
		});
	}
}
