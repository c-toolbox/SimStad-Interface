import { BaseScene } from "@/scenes/BaseScene";
import { Button } from "@/components/elements/Button";
import { RoundRectangle } from "@/components/elements/RoundRectangle";
import { Color, ColorStr } from "@/utils/colors";
import { layoutManager as layout } from "@/utils/LayoutManager";
import { interpolateColor } from "@/utils/functions";

export class LayerButton extends Button {
	private border: RoundRectangle;
	public background: RoundRectangle;
	private image: Phaser.GameObjects.Image;
	private title: Phaser.GameObjects.Text;

	private orderBg: Phaser.GameObjects.Ellipse;
	private orderText: Phaser.GameObjects.Text;

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

		this.border = new RoundRectangle(scene, {
			width: this.width + 8,
			height: this.height + 8,
			radius: 4,
			color: Color.White,
		});
		this.add(this.border);

		this.background = new RoundRectangle(scene, {
			width: this.width,
			height: this.height,
			radius: 0,
			color: Color.Black,
		});
		this.add(this.background);

		let texture = this.scene.textures.exists(layer) ? layer : "city";
		this.image = this.scene.add.image(0, 0, texture);
		this.add(this.image);
		this.image.setScale(this.width / this.image.width);

		/* Title */

		let th = 40;

		let titleBg = scene.add.rectangle(
			0,
			this.height / 2 - th / 2,
			this.width,
			th,
			Color.Black,
			0.5
		);
		this.add(titleBg);

		this.title = scene.addText({
			y: this.height / 2 - th / 2,
			size: 0.6 * th,
			fontFamily: "Lato-Bold",
			text: layer,
		});
		this.title.setOrigin(0.5);
		this.add(this.title);

		if (this.title.displayWidth > this.width - 8) {
			this.title.displayWidth = this.width - 8;
			this.title.scaleY = this.title.scaleX;
		}

		this.orderBg = scene.add.ellipse(
			0,
			0,
			this.width / 2,
			this.height / 2,
			Color.Black,
			0.75
		);
		this.add(this.orderBg);

		this.orderText = scene.addText({
			size: this.height / 4,
			fontFamily: "Lato-Bold",
			color: ColorStr.White,
			text: "0",
		});
		this.orderText.setOrigin(0.5);
		this.add(this.orderText);

		this.bindInteractive(this.background);
		this.background.on("wheel", (...args: any) => this.emit("wheel", ...args));
		this.background.on("dragstart", (...args: any) =>
			this.emit("dragstart", ...args)
		);
		this.background.on("drag", (...args: any) => this.emit("drag", ...args));
		this.background.on("dragend", (...args: any) =>
			this.emit("dragend", ...args)
		);

		this.setSelected(false);
	}

	update(time: number, delta: number) {
		this.setScale(1 - 0.1 * this.holdSmooth);
	}

	setDraggable() {
		this.bindInteractive(this.background, true);
	}

	setSelected(value: boolean) {
		this.selected = value;
		// this.image.setAlpha(value ? 1.0 : 0.75);
		this.border.setVisible(value);

		this.orderBg.setVisible(value);
		this.orderText.setVisible(value);
	}

	setOrder(order: number) {
		this.orderText.setText(order.toString());
	}
}
