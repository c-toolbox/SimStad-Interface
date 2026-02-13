import { BaseScene } from "@/scenes/BaseScene";
import { Button } from "@/components/elements/Button";
import { layoutManager as layout } from "@/utils/LayoutManager";
import { Color } from "@/utils/colors";

export class MapSliceKnob extends Button {
	private border: Phaser.GameObjects.Ellipse;
	private background: Phaser.GameObjects.Ellipse;
	private icon: Phaser.GameObjects.Image;
	private minX: number;
	private maxX: number;

	private dragX: number;
	private slideTween: Phaser.Tweens.Tween;

	constructor(scene: BaseScene, x: number, y: number, size: number) {
		super(scene, x, y);

		this.border = scene.add.ellipse(
			0,
			0,
			size + 8,
			size + 8,
			Color.Slate800,
			1.0,
		);
		this.add(this.border);

		this.background = scene.add.ellipse(0, 0, size, size, Color.White, 1.0);
		this.add(this.background);

		this.icon = scene.add.image(0, 0, "slider-knob");
		this.icon.setTint(Color.Slate500);
		this.icon.setScale((0.75 * size) / this.icon.width);
		this.add(this.icon);

		this.bindInteractive(this.background, true);
		this.background.input!.hitArea.setTo(
			-20,
			-20,
			this.background.width + 2 * 20,
			this.background.height + 2 * 20,
		);

		this.minX = layout.map.left;
		this.maxX = layout.map.right;

		this.setVisible(false);

		this.on("dragstart", this.onDragStart, this);
		this.on("drag", this.onDrag, this);
		this.on("dragend", this.onDragEnd, this);
	}

	update(time: number, delta: number) {
		this.setScale(1.0 - 0.15 * this.holdSmooth);

		if (this.hold && this.dragX != undefined) {
			if (Math.abs(this.dragX - this.x) > 1) {
				this.x += (this.dragX - this.x) * 0.5;
				this.emit("sliceValue", this.dragX);
			} else if (this.dragX != this.x) {
				this.x = this.dragX;
				this.emit("sliceValue", this.dragX);
			}
		}
	}

	setValue(value: number, animate: boolean) {
		value = 1 - value;
		value = Phaser.Math.Clamp(value, 0, 1);
		value = Phaser.Math.Linear(this.minX, this.maxX, value);

		if (this.hold) {
			this.dragX = value;
		}

		if (animate) {
			if (!this.hold) {
				if (this.slideTween) {
					this.slideTween.stop();
				}
				this.slideTween = this.scene.tweens.add({
					targets: this,
					x: value,
					ease: "Cubic.Out",
					duration: 500,
					onUpdate: (tween) => {
						this.emit("sliceValue", tween.getValue()!);
					},
					onComplete: () => {
						console.log("Tween complete");
					}
				});
			}
		} else {
			this.x = value;
		}
	}

	onDragStart(pointer: Phaser.Input.Pointer, dragX: number, dragY: number) {
		this.hold = true;
	}

	onDrag(pointer: Phaser.Input.Pointer, dragX: number, dragY: number) {
		const x = Phaser.Math.Clamp(pointer.x, this.minX, this.maxX);
		const value = 1 - (x - this.minX) / (this.maxX - this.minX);
		this.setValue(value, true);
	}

	onDragEnd(pointer: Phaser.Input.Pointer, dragX: number, dragY: number) {
		this.hold = false;
	}

	get value(): number {
		console.assert(!!this.x, "WHAT");
		return 1 - (this.x - this.minX) / (this.maxX - this.minX);
	}
}
