import { BaseScene } from "@/scenes/BaseScene";
import { languageManager } from "@/utils/LanguageManager";
import { SCALE, QUESTION_TIME } from "@/utils/constants";

export class AttractionView extends Phaser.GameObjects.Container {
	public scene: BaseScene;

	private outside: Phaser.GameObjects.Rectangle;
	private container: Phaser.GameObjects.Container;
	private title: Phaser.GameObjects.Text;
	private heading: Phaser.GameObjects.Text;

	private questionKeys: string[];
	private questionTimer: number;
	private questionIndex: number;
	private questionTexts: Phaser.GameObjects.Text[];
	private questionSmooth: number[];
	private previousY: number;

	private alphaGoal: number;

	constructor(
		scene: BaseScene,
		textColor: string,
		mapImageKey: string,
		mapTintColor: number
	) {
		super(scene, scene.CX, scene.CY);
		this.scene = scene;
		scene.add.existing(this);

		this.alphaGoal = 1;
		this.setAlpha(1);
		this.setVisible(true);

		// Dismiss on any clicks
		this.outside = scene.add.rectangle(0, 0, scene.W, scene.H, 0, 0.001);
		this.add(this.outside);
		this.outside.setInteractive({ useHandCursor: true }).on(
			"pointerdown",
			() => {
				this.emit("click");
			},
			this
		);

		/* Title container */

		this.container = this.scene.add.container(0, 0); // Y set in update
		this.add(this.container);

		const titleY = -0.31 * scene.H;

		let mapImage = this.scene.add.image(0, titleY + 100, mapImageKey);
		mapImage.setOrigin(0.5, 0.5);
		// mapImage.setAlpha(0.15);
		mapImage.setTint(mapTintColor);
		mapImage.setScale((2*0.36 * this.scene.H) / mapImage.height);
		mapImage.setBlendMode(Phaser.BlendModes.ADD);
		this.container.add(mapImage);

		this.title = this.scene.addText({
			x: 0,
			y: titleY + 0.02 * scene.H,
			size: 54 * SCALE,
			weight: 700,
			color: textColor,
			text: "Title",
		});
		languageManager.bind(this.title, "attraction_title");

		this.heading = this.scene.addText({
			x: 0,
			y: titleY + 0.13 * scene.H,
			size: 80 * SCALE,
			weight: 700,
			color: textColor,
			text: "Heading",
		});
		languageManager.bind(this.heading, "attraction_heading");

		for (let text of [this.title, this.heading]) {
			this.container.add(text);
			text.setOrigin(0.5);
			text.setPadding(30 * SCALE);
			text.setShadow(0, 0, "#FFFFFF", 15 * SCALE);
			text.setStroke("#FFA", 1);
		}

		/* Questions */

		this.questionKeys = [
			"attraction_question_1",
			"attraction_question_2",
			"attraction_question_3",
			"attraction_question_4",
			"attraction_question_5",
			"attraction_question_6",
		];
		this.questionTimer = 0;
		this.questionIndex = 0;
		this.previousY = 0;

		this.questionTexts = [];
		this.questionSmooth = [];
		for (let i = 0; i < this.questionKeys.length; i++) {
			let text = this.scene.addText({
				x: 0,
				y: 0,
				size: 60 * SCALE,
				weight: 300,
				color: textColor,
				text: "Question?",
			});
			text.setVisible(false);
			// text.setWordWrapWidth(0.45*scene.W);
			text.setOrigin(0.5);
			text.setPadding(30 * SCALE);
			text.setShadow(0, 0, "#FFFFFF", 15 * SCALE);
			text.setStroke("#FFA", 1);

			this.container.add(text);
			this.questionTexts.push(text);
			this.questionSmooth.push(0);
		}

		// let dummy = this.scene.add.rectangle(
		// 	0,
		// 	0.15 * this.scene.H,
		// 	this.scene.W / 6,
		// 	0.3 * this.scene.H,
		// 	0xff0000,
		// 	0.2
		// );
		// this.add(dummy);

		this.newQuestion();
	}

	update(time: number, delta: number) {
		const duration = 250;
		this.alpha += Phaser.Math.Clamp(
			this.alphaGoal - this.alpha,
			-delta / duration,
			delta / duration
		);
		this.container.y = -Phaser.Math.Easing.Sine.In(1 - this.alpha) * 20;
		this.setVisible(this.alpha > 0);

		if (this.visible) {
			this.questionTimer += delta / 1000;
			if (this.questionTimer > 0.75 * QUESTION_TIME) {
				this.newQuestion();
				this.questionTimer = 0;
			}

			for (let i = this.questionTexts.length - 1; i >= 0; i--) {
				this.questionTexts[i].setScale(0.75 + 0.25 * this.questionSmooth[i]);
				let alpha = Math.min(2 - Math.abs(this.questionSmooth[i] * 4 - 2), 1);
				alpha = Phaser.Math.Easing.Cubic.InOut(alpha);
				this.questionTexts[i].setAlpha(alpha);
				this.questionSmooth[i] += delta / 1000 / QUESTION_TIME;
			}
		}
	}

	show() {
		this.alphaGoal = 1;
		this.outside.setVisible(true);

		if (this.alpha == 0) {
			this.questionTimer = 0;
			for (let i = this.questionTexts.length - 1; i >= 0; i--) {
				this.questionTexts[i].setVisible(false);
			}
			this.newQuestion();
		}
	}

	hide() {
		this.alphaGoal = 0;
		this.outside.setVisible(false);
	}

	newQuestion() {
		this.questionIndex = (this.questionIndex + 1) % this.questionKeys.length;

		let target = this.questionTexts[this.questionIndex];
		this.sendToBack(target);
		this.questionSmooth[this.questionIndex] = 0;

		target.setVisible(true);
		target.x = ((0.5 - Math.random()) * this.scene.W) / 6;
		target.y = this.previousY;
		let limit = 100;
		while (Math.abs(target.y - this.previousY) < 0.13 * this.scene.H) {
			target.y = (0.0 + 0.3 * Math.random()) * this.scene.H;
			if (limit-- < 0) {
				break;
			}
		}
		this.previousY = target.y;

		// target.setText('o');
		languageManager.bind(target, this.questionKeys[this.questionIndex]);
	}
}
