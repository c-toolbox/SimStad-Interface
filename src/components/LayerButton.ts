import { BaseScene } from "@/scenes/BaseScene";
import { Button } from "@/components/elements/Button";
import { RoundRectangle } from "./elements/RoundRectangle";
import { Color } from "@/utils/colors";

export class LayerButton extends Button {
	protected border: RoundRectangle;
	protected background: Phaser.GameObjects.Image;
	protected image: Phaser.GameObjects.Image;
	protected title: Phaser.GameObjects.Text;
	protected titleBackground: Phaser.GameObjects.Rectangle;

	public layer: string;
	public selected: boolean;

	constructor(
		scene: BaseScene,
		x: number,
		y: number,
		width: number,
		height: number,
		layer: string
	) {
		super(scene, x, y);
		this.width = width;
		this.height = height;
		this.layer = layer;
		this.selected = false;

		/* Border highlight */

		this.border = new RoundRectangle(scene, {
			width: this.width + 8,
			height: this.height + 8,
			radius: 4,
			color: Color.Slate800,
		});
		this.add(this.border);
		this.sendToBack(this.border);

		this.background = scene.add.image(0, 0, "blank");
		this.background.setScale(this.width / this.background.width);
		this.add(this.background);

		this.image = this.scene.add.image(0, 0, "city");
		this.add(this.image);
		this.image.setScale(this.width / this.image.width);

		/* Title */

		let th = 40;

		this.titleBackground = scene.add.rectangle(
			0,
			this.height / 2 - th / 2,
			this.width,
			th,
			Color.Black,
			0.5
		);
		this.add(this.titleBackground);

		this.title = scene.addText({
			y: this.height / 2 - th / 2,
			size: 0.6 * th,
			fontFamily: "Lato-Bold",
			text: layer.split("/").pop(),
		});
		this.title.setOrigin(0.5);
		this.add(this.title);

		if (this.title.displayWidth > this.width - 8) {
			this.title.displayWidth = this.width - 8;
			this.title.scaleY = this.title.scaleX;
		}

		/* Interactions */

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
		this.setScale(1 - 0.1 * this.holdSmooth);
	}

	addErrorIcon() {
		let ms = 0.2 * this.width;
		let mx = this.width / 2 - 0.6 * ms;
		let my = -this.height / 2 + 0.6 * ms;
		let circle = this.scene.add.ellipse(mx, my, ms, ms, 0, 0.75);
		this.add(circle);
		let missing = this.scene.add.image(mx, my, "x");
		missing.setTint(Color.Red500);
		missing.setScale((0.6 * ms) / missing.width);
		this.add(missing);
	}

	setTexture(key: string, showBackground: boolean) {
		const exists = this.scene.textures.exists(key);

		if (exists) {
			this.image.setTexture(key);
			this.image.setScale(this.width / this.image.width);
		} else {
			this.image.setTexture("city");
			this.image.setScale(this.width / this.image.width);
		}

		if (exists && showBackground) {
			this.background.setTexture("blank");
			this.background.setTint(Color.White);
		} else {
			this.background.setTexture("square");
			this.background.setTint(Color.Slate800);
		}
	}

	setDraggable() {
		this.bindInteractive(this.background, true);
	}

	setOrder(order: number) {}

	setSelected(value: boolean) {}
}
