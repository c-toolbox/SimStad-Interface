import { BaseScene } from "@/scenes/BaseScene";
import { Slider } from "@/components/elements/Slider";

export class TestSlider extends Phaser.GameObjects.Container {
	private slider: Slider;
	private title: Phaser.GameObjects.Text;

	constructor(
		scene: BaseScene,
		x: number,
		y: number,
		text: string,
		steps: number
	) {
		super(scene, x, y);
		scene.add.existing(this);
		this.width = 268;
		this.height = 40;

		this.title = scene.addText({
			x: -this.width / 2,
			y: -this.height / 2,
			size: 24,
			fontFamily: "Lato-Bold",
			color: "white",
			text: text,
		});
		this.title.setOrigin(0, 1);
		this.add(this.title);

		this.slider = new Slider(
			scene,
			0,
			0,
			this.width - 20,
			this.height,
			this.height / 2,
			steps
		);
		this.add(this.slider);
		this.slider.on("onChange", (value: number) => {
			this.emit("onChange", value);
		});
	}

	update(time: number, delta: number) {
		this.slider.update(time, delta);
	}
}
