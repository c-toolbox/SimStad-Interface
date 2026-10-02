import { BaseScene } from "@/scenes/BaseScene";

export class Lockdown extends Phaser.GameObjects.Container {
	public scene: BaseScene;

	private background: Phaser.GameObjects.Rectangle;
	private explanationText: Phaser.GameObjects.Text;
	private loadingText: Phaser.GameObjects.Text;
	private loader: Phaser.GameObjects.Image;
	private timer: NodeJS.Timeout;

	constructor(scene: BaseScene) {
		super(scene, scene.CX, scene.CY);
		this.scene = scene;
		scene.add.existing(this);

		this.background = scene.add
			.rectangle(0, 0, scene.W, scene.H, 0, 0.8)
			.setInteractive()
			.on("pointerdown", () => {});
		this.add(this.background);

		this.explanationText = scene
			.addText({
				x: 0,
				y: -32,
				size: 32,
				color: "white",
				fontFamily: "Lato-Bold",
				text: "Explanation text goes here.",
			})
			.setOrigin(0.5, 1.0);
		this.add(this.explanationText);

		this.loadingText = scene
			.addText({
				x: 0,
				y: 0,
				size: 48,
				color: "white",
				fontFamily: "Lato-Bold",
				text: "Loading...",
			})
			.setOrigin(0.5, 0.0);
		this.add(this.loadingText);

		this.loader = scene.add.image(0, 48, "vis_c_logo_white");
		this.setAlpha(0.9);
		this.loader.setScale(82 / this.loader.width);
		this.add(this.loader);

		this.setVisible(false);
	}

	update(time: number, delta: number) {
		this.loader.angle = time / 2;
	}

	trigger(enabled: boolean, title = "", description = "") {
		if (enabled) {
			this.setVisible(true);

			this.explanationText.setText(title);
			this.loadingText.setText(description);
			this.loader.setVisible(!description);

			clearTimeout(this.timer);
			this.timer = setTimeout(() => {
				this.setVisible(false);
			}, 10000);
		} else {
			this.setVisible(false);
		}
	}
}
