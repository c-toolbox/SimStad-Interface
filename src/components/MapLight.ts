import { BaseScene } from "@/scenes/BaseScene";
import { Color, ColorStr } from "@/utils/colors";
import { Button } from "./elements/Button";
import { layoutManager as layout } from "@/utils/LayoutManager";
import { colorToNumber } from "@/utils/functions";

export class MapLight extends Button {
	public scene: BaseScene;
	public name: string;

	private container: Phaser.GameObjects.Container;
	private glow: Phaser.GameObjects.Image;
	private background: Phaser.GameObjects.Ellipse;
	private image: Phaser.GameObjects.Image;

	public goalX: number;
	public goalY: number;
	public color: string;

	private aliveValue: number;

	constructor(scene: BaseScene, x: number, y: number, name: string) {
		super(scene, x, y);
		this.scene = scene;
		this.name = name;
		this.goalX = x;
		this.goalY = y;

		this.height = 100;
		const size = 20;

		let maskGraphics = this.scene.make.graphics({}, false);
		maskGraphics.fillStyle(Color.White);
		maskGraphics.fillRect(
			layout.map.left,
			layout.map.top,
			layout.map.width,
			layout.map.height
		);
		let maskArea = new Phaser.Display.Masks.GeometryMask(scene, maskGraphics);
		this.setMask(maskArea);

		this.container = scene.add.container();
		this.add(this.container);

		this.glow = this.scene.add.image(0, 0, "light");
		this.glow.setBlendMode(Phaser.BlendModes.ADD);
		this.glow.setAlpha(0.75);
		this.glow.setScale(400 / this.glow.width);
		this.container.add(this.glow);

		this.background = this.scene.add.ellipse(0, 0, size, size, Color.Stone100);
		this.container.add(this.background);

		this.image = this.scene.add.image(0, 0, "lightbulb");
		this.image.setScale(size / this.image.width);
		this.container.add(this.image);

		/* Interactive */

		// this.background
		// 	.setInteractive({
		// 		useHandCursor: true,
		// 		draggable: true,
		// 		hitArea: new Phaser.Geom.Circle(size / 2, size / 2, 2 * size),
		// 		hitAreaCallback: Phaser.Geom.Circle.Contains,
		// 	})
		// 	.on("pointerout", this.onOut, this)
		// 	.on("pointerover", this.onOver, this)
		// 	.on("pointerdown", this.onDown, this)
		// 	.on("pointerup", this.onUp, this)
		// 	.on("dragstart", this.onDragStart, this)
		// 	.on("drag", this.onDrag, this)
		// 	.on("dragend", this.onDragEnd, this);
		// this.scene.input.enableDebug(this.background, 0xff0000);

		/* Animation */

		this.aliveValue = 0;
		scene.tweens.add({
			targets: this,
			aliveValue: { from: 0, to: 1 },
			ease: (t: number) => Phaser.Math.Easing.Elastic.Out(t, 1.0, 0.5),
			duration: 750,
		});

		this.changeColor();
	}

	update(time: number, delta: number) {
		this.container.setScale(this.aliveValue * (1 - 0.1 * this.holdSmooth));

		this.x += (this.goalX - this.x) / 3;
		this.y += (this.goalY - this.y) / 3;
	}

	onDrag(pointer: Phaser.Input.Pointer): void {
		this.goalX = pointer.x;
		this.goalY = pointer.y;
		this.emit("update");
		this.block();
	}

	onDragEnd(pointer: Phaser.Input.Pointer, dragX: number, dragY: number): void {
		super.onDragEnd(pointer, dragX, dragY);

		if (
			this.goalX < layout.map.left ||
			this.goalX > layout.map.right ||
			this.goalY < layout.map.top ||
			this.goalY > layout.map.bottom
		) {
			this.emit("delete");
		}
	}

	destroy() {
		this.scene.tweens.add({
			targets: this,
			aliveValue: { from: 1, to: 0 },
			ease: "Cubic.In",
			duration: 300,
			onUpdate: (tween, target, key, current) => {
				// this.container.setScale(0.9 * current);
				this.update(0, 0);
			},
			onComplete: () => {
				super.destroy();
			},
		});
	}

	get allColors(): string[] {
		return [
			ColorStr.White,
			// ColorStr.Zinc500,
			// ColorStr.Black,
			// ColorStr.Red500,
			// ColorStr.Yellow500,
			// ColorStr.Green500,
			// ColorStr.Blue500,
		];
	}

	changeColor() {
		let index = this.allColors.indexOf(this.color);
		this.color = this.allColors[(index + 1) % this.allColors.length];

		const colorInt = colorToNumber(this.color);
		this.image.setTint(colorInt);
		this.glow.setTint(colorInt);
	}

	setGoal(x: number, y: number) {
		this.goalX = Phaser.Math.Clamp(
			x,
			layout.map.left,
			layout.map.left + layout.map.width
		);
		this.goalY = Phaser.Math.Clamp(
			y,
			layout.map.top,
			layout.map.top + layout.map.height
		);
	}
}
