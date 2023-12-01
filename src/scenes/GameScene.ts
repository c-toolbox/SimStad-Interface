import { BaseScene } from "@/scenes/BaseScene";
import { languageManager } from "@/utils/LanguageManager";
import { Turtle } from "@/components/Turtle";
import { UI } from "@/components/UI";

export class GameScene extends BaseScene {
	// private background: Phaser.GameObjects.Image;
	// private turtle: Turtle;
	// private ui: UI;

	constructor() {
		super({ key: "GameScene" });
	}

	create(): void {
		this.fade(false, 200, 0x000000);
		this.cameras.main.setBackgroundColor(0x0f172a);

		// this.background = this.add.image(0, 0, "background");
		// this.background.setOrigin(0);
		// this.fitToScreen(this.background);

		let margin = 100;
		let layout = new Phaser.Geom.Rectangle(
			margin,
			margin,
			this.W - 2 * margin,
			this.H - 2 * margin
		);

		let map = this.add.image(0, 0, "karta");
		map.angle = -90;
		map.setScale(layout.height / map.width);
		map.setPosition(layout.right - map.displayHeight / 2, layout.centerY);

		// this.turtle = new Turtle(this, this.CX, this.CY);

		// this.ui = new UI(this);

		let title = this.addText({
			x: layout.left,
			y: layout.top,
			size: 100,
			color: "white",
		});
		languageManager.bind(title, "bread_title");

		let bread = this.addText({
			x: layout.left,
			y: layout.top + 1.25 * title.displayHeight,
			size: 32,
			color: "white",
		});
		languageManager.bind(bread, "bread_text");
		bread.setWordWrapWidth(layout.width - map.displayHeight - 100);
	}

	update(time: number, delta: number) {
		// this.turtle.update(time, delta);
	}
}
