import { BaseScene } from "@/scenes/BaseScene";
import { Slider } from "@/components/elements/Slider";

export class TestSlider extends Phaser.GameObjects.Container {
	private slider: Slider;
	private title: Phaser.GameObjects.Text;
	private label: Phaser.GameObjects.Text;

	constructor(
		scene: BaseScene,
		x: number,
		y: number,
		width: number,
		height: number,
		text: string,
		steps: number = 0
	) {
		super(scene, x, y);
		scene.add.existing(this);
		this.width = width;
		this.height = height;

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

		this.label = scene.addText({
			x: this.width / 2,
			y: -this.height / 2,
			size: 24,
			fontFamily: "Lato-Bold",
			color: "white",
			text: "...",
		});
		this.label.setOrigin(1, 1);
		this.add(this.label);

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

	setLabel(text: string) {
		this.label.setText(text);
	}

	get value(): number {
		return this.slider.value;
	}

	set value(value: number) {
		this.slider.value = value;
	}
}
