import { BaseScene } from "@/scenes/BaseScene";
import { Color, ColorStr } from "@/utils/colors";
import { layoutManager } from "@/utils/LayoutManager";
import { Button } from "./elements/Button";
import { LazyImage } from "./elements/LazyImage";
import { Layer } from "@/utils/interfaces";
import { contentManager } from "@/utils/ContentManager";
import { colorToNumber } from "@/utils/functions";
import { RoundRectangle } from "./elements/RoundRectangle";

export class LayerListImage extends Button {
	public layer: Layer;

	private border: Phaser.GameObjects.Image;
	private text: Phaser.GameObjects.Text;
	private image: LazyImage;

	private size: number;
	private snapX: number;
	private snapY: number;
	private animSpawn: number;
	private animFade: number;

	private pillBg: RoundRectangle;
	private pillText: Phaser.GameObjects.Text;

	constructor(scene: BaseScene, size: number) {
		super(scene, 0, 0);
		this.size = size;
		this.snapX = 0;
		this.snapY = 0;
		this.animSpawn = 0;
		this.animFade = 0;

		this.image = new LazyImage(scene, 0, 0);
		this.image.setScale(size / this.image.width);
		this.add(this.image);

		this.border = this.scene.add.image(0, 0, "border");
		this.border.setScale((size / this.border.width) * 1.01);
		this.add(this.border);

		this.text = scene.addText({
			x: -size * 0.41,
			y: -size * 0.41,
			size: 20,
			weight: 700,
			color: ColorStr.Black,
			text: "X",
		});
		this.text.setOrigin(0.5);
		this.add(this.text);

		/* Type pill */

		let psize = 0.15 * this.size;
		let py = this.size / 2 - 0.8 * psize;

		this.pillBg = new RoundRectangle(this.scene, {
			y: py,
			width: size,
			height: psize,
			color: Color.Black,
			radius: psize / 2,
		});
		this.pillBg.setAlpha(0.5);
		this.add(this.pillBg);

		this.pillText = this.scene.addText({
			y: py,
			size: 0.65 * psize,
			fontFamily: "Lato-Regular",
			text: "type",
			color: "white",
		});
		this.pillText.setOrigin(0.5);
		this.add(this.pillText);

		/* Input */

		this.bindInteractive(this.border, true);
		this.border.on("dragstart", this.onDragStart, this);
		this.border.on("dragend", this.onDragEnd, this);
		this.border.on("drag", this.onDrag, this);
	}

	setLayer(index: number, layer: Layer) {
		this.layer = layer;

		this.image.setTint(0xffffff);

		switch (layer.type) {
			case "image":
			case "flow":
			case "movie":
				const raster = contentManager.layerToRaster(layer);
				if (raster) this.image.setTexture(raster.thumbnail);
				else console.error(`Raster not found: '${raster}'`);
				break;

			case "color":
				this.image.setTexture("square");
				this.image.setTint(colorToNumber(layer.color));
				break;

			case "ndi":
				this.image.setTexture("blank");
				break;

			default:
				throw Error(`Unknown layer type: '${layer}'`);
		}

		this.image.setScale(this.size / this.image.width);

		this.text.setText(`${index + 1}`);

		this.setType(layer.type);
	}

	setType(type: string) {
		this.pillBg.setVisible(type != "image");
		this.pillText.setVisible(type != "image");
		this.pillBg.setWidth(this.pillText.displayWidth + this.pillBg.height);
		this.pillText.setText(type);
	}

	/* Input */

	onDrag(pointer: Phaser.Input.Pointer, dragX: number, dragY: number): void {
		super.onDrag(pointer, dragX, dragY);

		const wasWithinBounds = this.isWithinBounds;

		this.x = pointer.x;
		this.y = (pointer.y + this.snapY) / 2;
		this.emit("drag");

		if (this.isWithinBounds !== wasWithinBounds) {
			this.playFade(this.isWithinBounds);
		}
	}

	onDragEnd(pointer: Phaser.Input.Pointer, dragX: number, dragY: number): void {
		super.onDragEnd(pointer, dragX, dragY);

		if (this.isWithinBounds) {
			this.emit("drop");
		} else {
			this.emit("click");
		}
	}

	setSnapPosition(x: number, y: number, instant: boolean) {
		this.snapX = x;
		this.snapY = y;

		if (instant) {
			this.x = x;
			this.y = y;
		}
	}

	update(time: number, delta: number) {
		if (!this.visible) return;

		this.setAlpha(1.0 - 0.5 * this.animFade);
		this.setScale(this.animSpawn * this.alpha + 0.2 * this.holdSmooth);

		if (!this.hold) {
			this.x = Phaser.Math.Linear(this.x, this.snapX, 0.2);
			this.y = Phaser.Math.Linear(this.y, this.snapY, 0.2);
		}
	}

	playBounce() {
		this.animSpawn = 0;
		this.animFade = 0;

		this.scene.tweens.add({
			targets: this,
			animSpawn: 1,
			duration: 500,
			ease: (v: number) => {
				return Phaser.Math.Easing.Elastic.Out(v, 1.5, 0.5);
			},
		});
	}

	playFade(isWithinBounds: boolean) {
		this.scene.tweens.add({
			targets: this,
			animFade: isWithinBounds ? 0 : 1,
			duration: 50,
		});
	}

	get isWithinBounds() {
		const l = layoutManager.mapControlsLower;
		const lx = Phaser.Math.Clamp(this.x, l.left, l.right);
		const ly = Phaser.Math.Clamp(this.y, l.top, l.bottom);
		const maxDistance = l.height / 2;
		const distance = Phaser.Math.Distance.Between(this.x, this.y, lx, ly);
		return distance < maxDistance;
	}
}
