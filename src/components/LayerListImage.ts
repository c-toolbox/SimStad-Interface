import { BaseScene } from "@/scenes/BaseScene";
import { ColorStr } from "@/utils/colors";
import { layoutManager } from "@/utils/LayoutManager";
import { Button } from "./elements/Button";

export class LayerListImage extends Button {
	private border: Phaser.GameObjects.Image;
	private text: Phaser.GameObjects.Text;
	private image: Phaser.GameObjects.Image;

	private snapX: number;
	private snapY: number;
	private alive: number;
	private aliveSmooth: number;

	constructor(scene: BaseScene, size: number) {
		super(scene, 0, 0);
		this.snapX = 0;
		this.snapY = 0;
		this.alive = 1;
		this.aliveSmooth = 0;

		this.image = this.scene.add.image(0, 0, "Nkpg/Hillshade");
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

		this.bindInteractive(this.border, true);
		this.border.on("dragstart", this.onDragStart, this);
		this.border.on("dragend", this.onDragEnd, this);
		this.border.on("drag", this.onDrag, this);
	}

	setLayer(index: number, texture: string) {
		this.name = texture;
		this.text.setText(`${index + 1}`);
		if (this.scene.textures.exists(texture)) {
			this.image.setTexture(texture);
		} else {
			this.image.setTexture("city");
		}
	}

	onDrag(pointer: Phaser.Input.Pointer, dragX: number, dragY: number): void {
		super.onDrag(pointer, dragX, dragY);

		this.x = pointer.x;
		this.y = pointer.y;
		this.emit("drag");

		this.alive = this.isWithinBounds ? 1 : 0.5;
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

		this.aliveSmooth = Phaser.Math.Linear(this.aliveSmooth, this.alive, 0.2);
		this.setScale(this.aliveSmooth + 0.2 * this.holdSmooth);
		this.setAlpha(this.aliveSmooth);

		if (!this.hold) {
			this.x = Phaser.Math.Linear(this.x, this.snapX, 0.2);
			this.y = Phaser.Math.Linear(this.y, this.snapY, 0.2);
		}
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
