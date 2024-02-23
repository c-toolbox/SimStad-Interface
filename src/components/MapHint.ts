import { BaseScene } from "@/scenes/BaseScene";
import { RoundRectangle } from "@/components/elements/RoundRectangle";
import { Color, ColorStr } from "@/utils/colors";
import { layoutManager as layout } from "@/utils/LayoutManager";
import { languageManager } from "@/utils/LanguageManager";

export class MapHint extends Phaser.GameObjects.Container {
	private tween: Phaser.Tweens.Tween;

	constructor(scene: BaseScene, x: number, y: number) {
		super(scene, x, y);

		let background = new RoundRectangle(scene, {
			width: 220,
			height: 60,
			radius: 30,
			color: Color.Black,
			alpha: 0.65,
		});
		this.add(background);

		let text = scene.addText({
			weight: 700,
			size: 20,
			color: ColorStr.White,
		});
		text.setShadow(0, 2, "black", 4);
		text.setOrigin(0.5);
		this.add(text);
		languageManager.bind(text, "map_hint");

		let icon = scene.add.image(-text.displayWidth / 2 - 20, 0, "lightbulb");
		icon.setTint(Color.White);
		icon.setScale(40 / icon.width);
		this.add(icon);

		text.x += 15;
		icon.x += 15;
	}

	setVisible(value: boolean): this {
		super.setVisible(true);

		if (this.tween) this.tween.stop();
		this.tween = this.scene.tweens.add({
			targets: this,
			elapsed: 500,
			ease: Phaser.Math.Easing.Cubic.Out,
			alpha: { from: this.alpha, to: value ? 1 : 0 },
			onComplete: () => {
				super.setVisible(value);
			},
		});

		return this;
	}
}
