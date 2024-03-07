import { BaseScene } from "@/scenes/BaseScene";
import { Button } from "@/components/elements/Button";

export class ToolboxButton extends Button {
	private image: Phaser.GameObjects.Image;
	private size: number;

	constructor(
		scene: BaseScene,
		x: number,
		y: number,
		size: number,
		image: string
	) {
		super(scene, x, y);
		this.size = size;

		this.image = scene.add.image(0, 0, "icons");
		this.image.setTexture(image);
		this.image.setScale(size / this.image.height);
		this.image.setAlpha(0.65);
		this.add(this.image);

		this.bindInteractive(this.image);
		let sep = (1.75 / 2) * size;
		this.image.input!.hitArea.setTo(
			-sep,
			-sep,
			this.image.width + 2 * sep,
			this.image.height + 2 * sep
		);
	}

	update(time: number, delta: number) {
		this.setScale(1 - 0.1 * this.holdSmooth);
	}

	setTexture(key: string) {
		this.image.setTexture(key);
		let sep = (1.75 / 2) * this.size;
		this.image.input!.hitArea.setTo(
			-sep,
			-sep,
			this.image.width + 2 * sep,
			this.image.height + 2 * sep
		);
	}

	setTint(color: number) {
		this.image.setTint(color);
	}
}
