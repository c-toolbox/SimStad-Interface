import { BaseScene } from "@/scenes/BaseScene";
import { SocketManager } from "@/utils/SocketManager";
import { TextButton } from "../TextButton";

export enum PageState {
	Home = "Home",
	Scenario = "Scenario",
	Scenarios = "Scenarios",
	Layer = "Layer",
	Light = "Light",
	Debug = "Debug",
}

export class Page extends Phaser.GameObjects.Container {
	public scene: BaseScene;
	public state: PageState;
	public socket: SocketManager;

	protected fadeTween: Phaser.Tweens.Tween;
	protected fadeDir: number;
	protected buttons: TextButton[];

	constructor(scene: BaseScene, state: PageState, socket: SocketManager) {
		super(scene, 0, 0);
		this.scene = scene;
		this.state = state;
		this.socket = socket;
		scene.add.existing(this);

		this.fadeDir = 64;
		this.buttons = [];
	}

	update(time: number, delta: number) {
		this.buttons.forEach((button) => {
			button.update(time, delta);
		});
	}

	addButton(
		x: number,
		y: number,
		w: number,
		h: number,
		text: string,
		color: number,
		callback: () => void
	): TextButton {
		let button = new TextButton(this.scene, x, y, w, h, text, color);
		button.on("click", callback, this);
		this.add(button);
		this.buttons.push(button);

		return button;
	}

	setVisible(value: boolean): this {
		let start = value ? 0.0 : 1.0;
		let stop = value ? 1.0 : 0.0;

		if (this.fadeTween) {
			this.fadeTween.stop();
		}

		this.fadeTween = this.scene.add.tween({
			targets: this,
			duration: value ? 500 : 250,
			ease: "Cubic.Out",
			alpha: { from: start, to: stop },
			y: { from: value ? this.fadeDir : 0, to: value ? 0 : this.fadeDir },
			onStart: () => {
				if (value) {
					super.setVisible(true);
				}
			},
			onComplete: () => {
				super.setVisible(value);
			},
		});
		return this;
		// return super.setVisible(value);
	}
}
