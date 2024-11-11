import { BaseScene } from "@/scenes/BaseScene";
import { Button } from "@/components/elements/Button";
import { RoundRectangle } from "@/components/elements/RoundRectangle";
import { Color } from "@/utils/colors";
import { languageManager } from "@/utils/LanguageManager";
import { GrayScalePostFilter } from "@/utils/pipelines/GrayScalePostFilter";

export class ScenarioButton extends Button {
	private border: RoundRectangle;
	private background: Phaser.GameObjects.Image;
	private titleBg: Phaser.GameObjects.Rectangle;
	private title: Phaser.GameObjects.Text;

	constructor(
		scene: BaseScene,
		x: number,
		y: number,
		width: number,
		height: number,
		text: string,
		textureKey: string
	) {
		super(scene, x, y);
		this.width = width;
		this.height = height;

		const p = 8;
		this.border = new RoundRectangle(scene, {
			width: this.width + p,
			height: this.height + p,
			radius: 4,
			color: Color.Slate300,
		});
		this.add(this.border);

		this.background = scene.add.image(0, 0, textureKey);
		this.background.setScale(width / this.background.width);
		const cropW = width / this.background.scaleX;
		const cropH = height / this.background.scaleY;
		const cropX = 0;
		const cropY = (this.background.displayHeight - height + p) / 2;
		this.background.setCrop(cropX, cropY, cropW, cropH);
		this.add(this.background);

		const titleHeight = width / 8;
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
		this.title.setShadow(0, 2, "black", 4);
		this.title.setOrigin(0.5);
		this.setText(text);
		this.add(this.title);

		this.bindInteractive(this.background);
		this.background.input!.hitArea.setTo(cropX, cropY, cropW, cropH);
	}

	update(time: number, delta: number) {
		this.setScale(1 - 0.04 * this.holdSmooth);
	}

	setText(key: string) {
		if (languageManager.get(key, false)) {
			languageManager.bind(this.title, key, () => {
				this.title.setScale(1);
				if (this.title.displayWidth > this.background.displayWidth - 40) {
					this.title.displayWidth = this.background.displayWidth - 40;
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
