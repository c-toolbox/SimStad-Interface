import { BaseScene } from "@/scenes/BaseScene";
import { Button } from "@/components/elements/Button";
import { RoundRectangle } from "@/components/elements/RoundRectangle";
import { Color } from "@/utils/colors";
import { layoutManager as layout } from "@/utils/LayoutManager";
import { interpolateColor } from "@/utils/functions";
import { languageManager } from "@/utils/LanguageManager";
import { GrayScalePostFilter } from "@/utils/pipelines/GrayScalePostFilter";

export class ScenarioButton extends Button {
	private border: RoundRectangle;
	private background: Phaser.GameObjects.Image;
	private titleBg: Phaser.GameObjects.Rectangle;
	private title: Phaser.GameObjects.Text;

	private color: number;

	constructor(
		scene: BaseScene,
		x: number,
		y: number,
		width: number,
		height: number,
		text: string,
		color: number,
		textureKey: string
	) {
		super(scene, x, y);
		this.width = width;
		this.height = height;
		this.color = color;

		this.border = new RoundRectangle(scene, {
			width: this.width + 4,
			height: this.height + 4,
			radius: 2,
			color: Color.Slate300,
		});
		// this.border.setVisible(false);
		this.add(this.border);

		// let rect = new RoundRectangle(scene, {
		// 	x,
		// 	y,
		// 	width: this.width,
		// 	height: this.height,
		// 	radius: layout.radius,
		// 	color: color,
		// });
		// rect.setVisible(false);

		this.background = scene.add.image(0, 0, textureKey);
		this.background.setScale(width / this.background.width);
		this.add(this.background);

		const titleHeight = height / 4;
		this.titleBg = scene.add.rectangle(
			0,
			height / 2 - titleHeight / 2,
			width,
			titleHeight,
			Color.Black,
			0.75
		);
		this.add(this.titleBg);

		this.title = scene.addText({
			y: height / 2 - titleHeight / 2,
			size: 32,
			fontFamily: "Lato-Bold",
			color: "white",
			text: text,
		});
		this.title.setOrigin(0.5);
		this.setText(text);
		this.add(this.title);

		this.bindInteractive(this.background);
	}

	update(time: number, delta: number) {
		this.setScale(1 - 0.04 * this.holdSmooth);
	}

	setText(key: string) {
		if (languageManager.get(key, false)) {
			languageManager.bind(this.title, key, () => {
				this.title.setScale(1);
				if (this.title.displayWidth > this.background.width - 40) {
					this.title.displayWidth = this.background.width - 40;
				}
			});
		} else {
			this.title.setText(key);
		}
	}

	disable() {
		this.background.setPostPipeline(GrayScalePostFilter);
		this.border.setColor(Color.Slate800);
		this.background.setAlpha(0.5);
		this.background.input!.enabled = false;
	}
}
