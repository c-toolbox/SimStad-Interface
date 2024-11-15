import { BaseScene } from "@/scenes/BaseScene";
import { Button } from "@/components/elements/Button";
import { RoundRectangle } from "@/components/elements/RoundRectangle";
import { Color } from "@/utils/colors";
import { languageManager } from "@/utils/LanguageManager";
import { GrayScalePostFilter } from "@/utils/pipelines/GrayScalePostFilter";

export class ScenarioButton extends Button {
	private border: RoundRectangle;
	private image: Phaser.GameObjects.Image;
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

		const p = 12;
		this.border = new RoundRectangle(scene, {
			width: this.width + p,
			height: this.height + p,
			radius: p / 2,
			color: Color.Slate800,
		});
		this.add(this.border);

		this.image = scene.add.image(0, 0, textureKey);
		this.image.setScale(width / this.image.width);
		const cropW = width / this.image.scaleX;
		const cropH = height / this.image.scaleY;
		const cropX = 0;
		const cropY = (this.image.height - cropH) / 2;
		this.image.setCrop(cropX, cropY, cropW, cropH);
		this.add(this.image);

		const titleHeight = width / 8;
		let titleBg = scene.add.rectangle(
			0,
			height / 2 - titleHeight / 2,
			width,
			titleHeight,
			Color.Black,
			0.4
		);
		this.add(titleBg);

		this.title = scene.addText({
			y: height / 2 - titleHeight / 2,
			size: 0.6 * titleHeight,
			fontFamily: "Lato-Bold",
			color: "white",
			text: text,
		});
		this.title.setStroke("black", 4);
		this.title.setShadow(0, 2, "black", 8);
		this.title.setOrigin(0.5);
		this.setText(text);
		this.add(this.title);

		this.bindInteractive(this.image);
		this.image.input!.hitArea.setTo(cropX, cropY, cropW, cropH);
	}

	update(time: number, delta: number) {
		this.setScale(1 - 0.04 * this.holdSmooth);
	}

	setText(key: string) {
		if (languageManager.get(key, false)) {
			languageManager.bind(this.title, key, () => {
				this.title.setScale(1);
				if (this.title.displayWidth > this.image.displayWidth - 40) {
					this.title.displayWidth = this.image.displayWidth - 40;
					this.title.scaleY = this.title.scaleX;
				}
			});
		} else {
			this.title.setText(key);
		}
	}

	disable() {
		this.image.setPostPipeline(GrayScalePostFilter);
		this.border.setColor(Color.Slate800);
		this.image.setAlpha(0.5);
		this.image.input!.enabled = false;
	}
}
