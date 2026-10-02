import { BaseScene } from "@/scenes/BaseScene";
import { languageManager } from "@/utils/LanguageManager";
import { ColorStr } from "@/utils/colors";

export class AttractionView extends Phaser.GameObjects.Container {
	public scene: BaseScene;

	private outside: Phaser.GameObjects.Rectangle;
	private container: Phaser.GameObjects.Container;
	private title: Phaser.GameObjects.Text;
	private heading: Phaser.GameObjects.Text;
	private mapImage: Phaser.GameObjects.Image;

	private alphaGoal: number;

	constructor(scene: BaseScene) {
		super(scene, scene.CX, scene.CY);
		this.scene = scene;
		scene.add.existing(this);

		this.alphaGoal = 1;
		this.setAlpha(1);
		this.setVisible(true);

		// Dismiss on any clicks
		this.outside = scene.add.rectangle(0, 0, scene.W, scene.H, 0, 0.4);
		this.add(this.outside);
		this.outside.setInteractive({ useHandCursor: true }).on(
			"pointerdown",
			() => {
				this.emit("click");
			},
			this
		);

		/* Title container */

		this.container = this.scene.add.container(0, 0); // Y set in update
		this.add(this.container);

		// const titleY = -0.31 * scene.H;
		const titleY = -120;

		this.mapImage = this.scene.add.image(0, titleY + 100, "streets");
		this.mapImage.setTint(0xb89581);
		this.mapImage.setScale((1.0 * this.scene.H) / this.mapImage.height);
		this.mapImage.setBlendMode(Phaser.BlendModes.ADD);
		this.container.add(this.mapImage);

		this.title = this.scene.addText({
			x: 0,
			y: titleY + 0.02 * scene.H,
			size: 54,
			fontFamily: "Lato-Bold",
			color: ColorStr.White,
			text: "Title",
		});
		languageManager.bind(this.title, "attraction_title");

		this.heading = this.scene.addText({
			x: 0,
			y: titleY + 0.13 * scene.H,
			size: 80,
			fontFamily: "Lato-Bold",
			color: ColorStr.White,
			text: "Heading",
		});
		languageManager.bind(this.heading, "attraction_heading");

		for (let text of [this.title, this.heading]) {
			this.container.add(text);
			text.setOrigin(0.5);
			text.setPadding(30);
			text.setShadow(0, 0, "#FFFFFF", 15);
			text.setStroke("#FFA", 1);
		}
	}

	update(time: number, delta: number) {
		const duration = 250;
		this.alpha += Phaser.Math.Clamp(
			this.alphaGoal - this.alpha,
			-delta / duration,
			delta / duration
		);
		this.container.y = -Phaser.Math.Easing.Sine.In(1 - this.alpha) * 20;
		this.setVisible(this.alpha > 0);

		this.mapImage.angle = time / 1000;
	}

	show() {
		this.alphaGoal = 1;
		this.outside.setVisible(true);
	}

	hide() {
		this.alphaGoal = 0;
		this.outside.setVisible(false);
	}
}
