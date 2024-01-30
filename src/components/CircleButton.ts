import { BaseScene } from "@/scenes/BaseScene";
import { Button } from "@/components/elements/Button";
import { Color } from "@/utils/colors";

export class CircleButton extends Button {
	private border: Phaser.GameObjects.Ellipse;
	private background: Phaser.GameObjects.Ellipse;
	private image: Phaser.GameObjects.Image;

	constructor(
		scene: BaseScene,
		x: number,
		y: number,
		size: number,
		texture: string,
		color: number
	) {
		super(scene, x, y);

		this.border = scene.add.ellipse(0, 0, size + 4, size + 4, Color.Slate800);
		this.add(this.border);

		this.background = scene.add.ellipse(0, 0, size, size, color);
		this.add(this.background);
		this.bindInteractive(this.background);
		this.background.input!.hitArea.setTo(
			-30,
			-30,
			this.background.width + 2 * 30,
			this.background.height + 2 * 30
		);

		this.image = scene.add.image(0, 0, texture);
		this.image.setScale(size / this.image.width);
		this.add(this.image);
	}

	update(time: number, delta: number) {
		this.setScale(1 - 0.1 * this.holdSmooth);
	}

	setHighlight(value: boolean) {
		this.background.setAlpha(value ? 1.0 : 0.6);
		this.image.setAlpha(value ? 1.0 : 0.6);
		this.border.fillColor = value ? Color.White : Color.Slate800;
	}
}
