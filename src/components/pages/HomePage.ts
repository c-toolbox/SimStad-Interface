import { BaseScene } from "@/scenes/BaseScene";
import { SocketManager } from "@/utils/SocketManager";
import { Page, PageState } from "./Page";
import { languageManager } from "@/utils/LanguageManager";
import { TestButton } from "../TestButton";
import { Color } from "@/utils/colors";

export class HomePage extends Page {
	constructor(
		scene: BaseScene,
		state: PageState,
		socket: SocketManager,
		layout: Phaser.Geom.Rectangle
	) {
		super(scene, state, socket, layout);

		let title = scene.addText({
			x: layout.left,
			y: layout.top,
			size: 100,
			color: "white",
		});
		this.add(title);
		languageManager.bind(title, "bread_title");

		let bread = scene.addText({
			x: layout.left,
			y: layout.top + 1.25 * title.displayHeight,
			size: 32,
			color: "white",
		});
		this.add(bread);
		languageManager.bind(bread, "bread_text");
		bread.setWordWrapWidth(layout.width);

		let w = 220;
		let h = 64;
		let x = layout.centerX;
		let y = layout.bottom - h / 2;
		let o = w / 2 + 16;

		this.addButton(x - o, y, w, h, "Scenarios", Color.Rose800, () => {
			this.emit("state", PageState.Scenarios);
		});

		this.addButton(x + o, y, w, h, "Debug", Color.Slate600, () => {
			this.emit("state", PageState.Debug);
		});
	}

	update(time: number, delta: number) {
		super.update(time, delta);
	}
}
