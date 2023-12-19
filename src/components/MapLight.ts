import { BaseScene } from "@/scenes/BaseScene";
import { Color } from "@/utils/colors";
import { Button } from "./elements/Button";
import { layoutManager as layout } from "@/utils/LayoutManager";

export class MapLight extends Button {
	public scene: BaseScene;

	private container: Phaser.GameObjects.Container;
	private glow: Phaser.GameObjects.Image;
	private image: Phaser.GameObjects.Image;

	private dragOffsetX: number;
	private dragOffsetY: number;

	constructor(scene: BaseScene, x: number, y: number) {
		super(scene, x, y);
		this.scene = scene;

		let maskGraphics = this.scene.make.graphics({}, false);
		maskGraphics.fillStyle(0xffffff);
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
		this.glow.setAlpha(0.5);
		this.glow.setScale(400 / this.glow.width);
		this.container.add(this.glow);

		this.image = this.scene.add.image(0, 0, "lightbulb");
		this.image.setScale(100 / this.image.width);
		this.container.add(this.image);

		this.bindInteractive(this.image, true);
		this.image.input!.hitArea.setTo(
			-20,
			-20,
			this.image.width + 2 * 20,
			this.image.height + 2 * 20
		);
	}

	update(time: number, delta: number) {
		this.container.setScale(1 - 0.1 * this.holdSmooth);
	}

	onDrag(pointer: Phaser.Input.Pointer): void {
		this.x = pointer.x;
		this.y = pointer.y;
		this.x = Phaser.Math.Clamp(this.x, layout.map.left, layout.map.right);
		this.y = Phaser.Math.Clamp(this.y, layout.map.top, layout.map.bottom);
		this.emit("update");
	}
}
