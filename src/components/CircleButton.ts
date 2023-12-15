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

		this.border = scene.add.ellipse(0, 0, size + 8, size + 8, Color.White);
		this.border.setVisible(false);
		this.add(this.border);

		this.background = scene.add.ellipse(0, 0, size, size, color);
		this.add(this.background);
		this.bindInteractive(this.background);

		this.image = scene.add.image(0, 0, texture);
		this.image.setScale(size / this.image.width);
		this.add(this.image);
	}

	update(time: number, delta: number) {
		this.setScale(1 - 0.1 * this.holdSmooth);
	}

	setHighlight(value: boolean) {
		this.border.setVisible(value);
	}
}
