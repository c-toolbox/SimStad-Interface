import { BaseScene } from "@/scenes/BaseScene";
import { Button } from "@/components/elements/Button";
import { RoundRectangle } from "@/components/elements/RoundRectangle";

export class TestButton extends Button {
	private background: RoundRectangle;
	private title: Phaser.GameObjects.Text;

	constructor(
		scene: BaseScene,
		x: number,
		y: number,
		text: string,
		color: number
	) {
		super(scene, x, y);
		this.width = 220;
		this.height = 64;

		this.background = new RoundRectangle(scene, {
			width: this.width,
			height: this.height,
			radius: this.height / 4,
			color: color,
		});
		this.add(this.background);

		this.title = scene.addText({
			size: 32,
			fontFamily: "Lato-Bold",
			color: "white",
			text: text,
		});
		this.title.setOrigin(0.5);
		this.add(this.title);

		if (this.title.displayWidth > this.background.width - 40) {
			this.title.displayWidth = this.background.width - 40;
		}

		this.bindInteractive(this.background);
	}

	update(time: number, delta: number) {
		this.setScale(1 - 0.05 * this.holdSmooth);
	}
}
