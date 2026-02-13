import { BaseScene } from "@/scenes/BaseScene";
import { Button } from "@/components/elements/Button";
import { Color } from "@/utils/colors";

export class MapPinButton extends Button {
	// private border: Phaser.GameObjects.Ellipse;
	private background: Phaser.GameObjects.Ellipse;
	private icon: Phaser.GameObjects.Image;

	constructor(scene: BaseScene, x: number, y: number, size: number) {
		super(scene, x, y);

		// this.border = scene.add.ellipse(0, 0, size + 8, size + 8, Color.White, 1.0);
		// this.add(this.border);

		this.background = scene.add.ellipse(0, 0, size, size, Color.Black, 1.0);
		this.add(this.background);

		this.icon = scene.add.image(0, 0, "tack");
		this.icon.setTint(Color.White);
		this.icon.setScale(size / 2 / this.icon.width);
		this.add(this.icon);

		this.bindInteractive(this.background);

		this.background.input!.hitArea.setTo(
			-20,
			-20,
			this.background.width + 2 * 20,
			this.background.height + 2 * 20,
		);

		this.setHighlight(false);
	}

	update(time: number, delta: number) {
		this.setScale(1 - 0.1 * this.holdSmooth);
	}

	setHighlight(value: boolean) {
		this.background.input!.enabled = value;
		// this.border.setAlpha(value ? 1.0 : 0.0);
		this.background.setAlpha(value ? 0.8 : 0.3);
		this.icon.setAlpha(value ? 1.0 : 0.3);
		// this.background.fillColor = value ? Color.Red600 : Color.Black;
		// this.icon.setTexture(value ? "tack" : "tack-slash");
	}
}
