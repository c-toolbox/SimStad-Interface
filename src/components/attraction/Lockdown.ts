import { BaseScene } from "@/scenes/BaseScene";

export class Lockdown extends Phaser.GameObjects.Container {
	public scene: BaseScene;

	private background: Phaser.GameObjects.Rectangle;
	private explanationText: Phaser.GameObjects.Text;
	private loadingText: Phaser.GameObjects.Text;
	private timer: NodeJS.Timeout;

	constructor(scene: BaseScene) {
		super(scene, scene.CX, scene.CY);
		this.scene = scene;
		scene.add.existing(this);

		this.background = scene.add
			.rectangle(0, 0, scene.W, scene.H, 0, 0.75)
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

		this.setVisible(false);
	}

	onRecacheProgress(count: number, max: number) {
		this.setVisible(true);

		this.explanationText.setText(
			`Updating ${max} images`
		);

		const percent = `${Math.round((count / max) * 100)}%`;
		this.loadingText.setText(`Loading... ${percent}`);

		clearTimeout(this.timer);
		this.timer = setTimeout(() => {
			this.setVisible(false);
		}, 10000);
	}

	onRecacheComplete() {
		this.setVisible(false);
	}
}
