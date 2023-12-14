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
		width: number,
		height: number,
		text: string,
		color: number
	) {
		super(scene, x, y);
		this.width = width;
		this.height = height;

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
		this.background.on("wheel", (...args: any) => this.emit("wheel", ...args));
		this.background.on("dragstart", (...args: any) =>
			this.emit("dragstart", ...args)
		);
		this.background.on("drag", (...args: any) => this.emit("drag", ...args));
		this.background.on("dragend", (...args: any) =>
			this.emit("dragend", ...args)
		);
	}

	update(time: number, delta: number) {
		this.setScale(1 - 0.05 * this.holdSmooth);
	}

	setDraggable() {
		this.bindInteractive(this.background, true);
	}
}
