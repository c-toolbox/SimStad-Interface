import { BaseScene } from "@/scenes/BaseScene";
import { SocketManager } from "@/utils/SocketManager";
import { TestButton } from "../TestButton";

export enum PageState {
	Home = "Home",
	Scenarios = "Scenarios",
	Debug = "Debug",
}

export class Page extends Phaser.GameObjects.Container {
	public scene: BaseScene;
	public state: PageState;
	public socket: SocketManager;
	public layout: Phaser.Geom.Rectangle;

	protected buttons: TestButton[];

	constructor(
		scene: BaseScene,
		state: PageState,
		socket: SocketManager,
		layout: Phaser.Geom.Rectangle
	) {
		super(scene, 0, 0);
		this.scene = scene;
		this.state = state;
		this.socket = socket;
		this.layout = layout;
		this.width = layout.width;
		this.height = layout.height;
		scene.add.existing(this);

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
	): TestButton {
		let button = new TestButton(this.scene, x, y, w, h, text, color);
		button.on("click", callback, this);
		this.add(button);
		this.buttons.push(button);

		return button;
	}
}
