import { BaseScene } from "@/scenes/BaseScene";
import { Slider } from "./Slider";
import { Color } from "@/utils/colors";

const BG_COLOR_OFF = Color.Slate600;
const BG_COLOR_ON = Color.Green700;
const KNOB_COLOR = Color.Slate200;

export class CheckSlider extends Slider {
	private isLoading: boolean;
	private loader: Phaser.GameObjects.Image;

	constructor(
		scene: BaseScene,
		x: number,
		y: number,
		width: number,
		height: number
	) {
		super(scene, x, y, width, height, 1.5 * height, 2);

		this.value = 0;

		this.background.setColor(BG_COLOR_OFF);
		this.background.setAlpha(1.0);
		this.on("onChange", (value: number) => {
			this.background.setColor(value == 1 ? BG_COLOR_ON : BG_COLOR_OFF);
		});

		this.loader = scene.add.image(0, 0, "vis_c_logo_white");
		this.loader.setTint(KNOB_COLOR);
		this.add(this.loader);

		this.setIsLoading(false);
	}

	update(time: number, delta: number) {
		super.update(time, delta);

		this.button.fillColor = KNOB_COLOR;
		this.background.setAlpha(1.0);

		if (this.isLoading) {
			this.loader.x = this.button.x;
			this.loader.y = this.button.y;
			this.loader.angle = time / 2;
			const size = this.button.scaleX * this.button.width;
			this.loader.setScale(size / this.loader.width);
		}
	}

	setIsLoading(loading: boolean) {
		this.isLoading = loading;
		this.loader.visible = loading;
		this.button.visible = !loading;
	}

	onDown(pointer: Phaser.Input.Pointer) {
		this.hold = true;
	}

	onUp(pointer: Phaser.Input.Pointer) {
		if (this.hold) {
			let x = (0.5 - this.value) * this.background.width;
			super.onDrag(pointer, x, 0);

			this.emit("click", this.value == 1);
		}
		this.hold = false;
	}

	onDragStart() {}

	onDragEnd() {}

	onDrag(pointer: Phaser.Input.Pointer, dragX: number, dragY: number) {}
}
