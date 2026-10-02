import { BaseScene } from "@/scenes/BaseScene";
import { Slider } from "@/components/elements/Slider";
import { languageManager } from "@/utils/LanguageManager";
import { layoutManager as layout } from "@/utils/LayoutManager";
import { RoundRectangle } from "./elements/RoundRectangle";
import { Color } from "@/utils/colors";

export class LayerSlider extends Phaser.GameObjects.Container {
	public scene: BaseScene;

	private slider: Slider;
	private title: Phaser.GameObjects.Text;
	private valueLabel: Phaser.GameObjects.Text;
	private tickLabels: Phaser.GameObjects.Text[];

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
		this.scene = scene;
		this.width = width;
		this.height = height;

		let background = new RoundRectangle(scene, {
			width: width + 1 * 28 + layout.padding + 16,
			height: height + 2 * 28 + layout.padding + 16,
			radius: layout.radius,
			color: Color.Slate700,
		});
		this.add(background);

		this.title = scene.addText({
			x: -this.width / 2 - 14,
			y: -this.height / 2 - 8,
			size: 28,
			fontFamily: "Lato-Bold",
			color: "white",
			text: text,
		});
		this.title.setOrigin(0, 1);
		this.add(this.title);

		this.valueLabel = scene.addText({
			x: this.width / 2,
			y: -this.height / 2 - 8,
			size: 28,
			fontFamily: "Lato-Bold",
			color: "white",
			text: "...",
		});
		this.valueLabel.setOrigin(1, 1);
		this.add(this.valueLabel);

		this.tickLabels = [];

		this.slider = new Slider(
			scene,
			0,
			0,
			this.width,
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

	setTitle(key: string) {
		if (languageManager.get(key, false)) {
			languageManager.bind(this.title, key);
		} else {
			this.title.setText(key);
		}
	}

	setLabel(key: string) {
		if (languageManager.get(key, false)) {
			languageManager.bind(this.title, key);
		} else {
			this.valueLabel.setText(key);
		}
	}

	setLabels(labelKeys: string[]) {
		this.valueLabel.setVisible(false);
		this.tickLabels.forEach((label) => label.destroy());
		this.tickLabels = [];

		for (let i = 0; i < labelKeys.length; i++) {
			let w = this.width + this.height / 2;
			let k = labelKeys.length - 1;
			let x = w * (i / k - 0.5);

			let label = this.scene.addText({
				x,
				y: this.height / 2 + 8,
				size: 28,
				fontFamily: "Lato-Bold",
				color: "white",
			});
			languageManager.bind(label, labelKeys[i]);
			label.setOrigin(i / k, 0.0);
			this.add(label);

			this.tickLabels.push(label);
		}
	}

	setSteps(steps: number) {
		this.slider.setSteps(steps);
	}

	get value(): number {
		return this.slider.value;
	}

	set value(value: number) {
		this.slider.value = value;
	}
}
