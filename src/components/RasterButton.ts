import { BaseScene } from "@/scenes/BaseScene";
import { Button } from "@/components/elements/Button";
import { RoundRectangle } from "./elements/RoundRectangle";
import { LazyImage } from "./elements/LazyImage";
import { Color } from "@/utils/colors";
import { Raster } from "@/utils/interfaces";
import { languageManager } from "@/utils/LanguageManager";

export class RasterButton extends Button {
	protected border: RoundRectangle;
	protected background: Phaser.GameObjects.Image;
	protected image: LazyImage;
	protected title: Phaser.GameObjects.Text;
	protected titleBackground: Phaser.GameObjects.Rectangle;
	private loader: Phaser.GameObjects.Image;
	private orderBg: Phaser.GameObjects.Image;
	private orderText: Phaser.GameObjects.Text;
	private isLoading: boolean;

	public raster: Raster;
	public selected: boolean;

	constructor(
		scene: BaseScene,
		x: number,
		y: number,
		width: number,
		height: number,
		raster: Raster,
	) {
		super(scene, x, y);
		this.width = width;
		this.height = height;
		this.raster = raster;
		this.selected = false;
		this.isLoading = false;

		/* Border highlight */

		this.border = new RoundRectangle(scene, {
			width: this.width + 8,
			height: this.height + 8,
			radius: 4,
			color: Color.Slate900,
		});
		this.add(this.border);
		this.sendToBack(this.border);

		this.background = scene.add.image(0, 0, "blank");
		this.background.setScale(this.width / this.background.width);
		this.add(this.background);

		this.image = new LazyImage(scene, 0, 0);
		this.image.setScale(this.width / this.image.width);
		this.add(this.image);

		/* Loader spinner */

		this.loader = scene.add.image(0, 0, "vis_c_logo_white");
		this.loader.setTint(0xffffff);
		this.loader.setAlpha(0.5);
		this.loader.setScale((0.4 * width) / this.loader.width);
		this.add(this.loader);

		/* Title */

		let th = 40;

		this.titleBackground = scene.add.rectangle(
			0,
			this.height / 2 - th / 2,
			this.width,
			th,
			Color.Black,
			0.5,
		);
		this.add(this.titleBackground);

		this.title = scene.addText({
			y: this.height / 2 - th / 2,
			size: 0.6 * th,
			fontFamily: "Lato-Bold",
			text: languageManager.get(raster.name),
		});
		this.title.setOrigin(0.5);
		this.add(this.title);

		if (this.title.displayWidth > this.width - 8) {
			this.title.displayWidth = this.width - 8;
			this.title.scaleY = this.title.scaleX;
		}

		/* Order number */

		this.orderBg = scene.add.image(0, 0, "border");
		this.orderBg.setScale((this.width / this.orderBg.width) * 1.02);
		this.add(this.orderBg);

		const size = this.width * 0.17;
		this.orderText = scene.addText({
			x: -this.width * 0.42,
			y: -this.width * 0.42,
			size: size,
			fontFamily: "Lato-Bold",
			color: "black",
			text: "0",
		});
		this.orderText.setOrigin(0.5);
		this.add(this.orderText);

		/* Interactions */

		this.bindInteractive(this.background);
		this.background.on("wheel", (...args: any) => this.emit("wheel", ...args));
		this.background.on("dragstart", (...args: any) =>
			this.emit("dragstart", ...args),
		);
		this.background.on("drag", (...args: any) => this.emit("drag", ...args));
		this.background.on("dragend", (...args: any) =>
			this.emit("dragend", ...args),
		);

		/* Setup thumbnail loading */

		this.isLoading = true;
		this.image.on("loaded", (loaded: boolean) => {
			this.isLoading = !loaded;
		});
		this.image.setTexture(raster.thumbnail);

		/* Init */

		this.setSelected(false);
	}

	update(time: number, delta: number) {
		this.setScale(1 - 0.1 * this.holdSmooth);

		if (this.isLoading) {
			this.loader.angle = time / 2;
			this.loader.visible = true;
		} else {
			this.loader.visible = false;
		}
	}

	setDraggable() {
		this.bindInteractive(this.background, true);
	}

	setSelected(value: boolean) {
		this.selected = value;
		this.orderBg.setVisible(value);
		this.orderText.setVisible(value);
		this.border.setColor(this.selected ? Color.White : Color.Slate900);
	}

	setOrder(order: number) {
		this.orderText.setText(order.toString());
	}
}
