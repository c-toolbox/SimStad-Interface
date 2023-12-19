import { BaseScene } from "@/scenes/BaseScene";
import { SocketManager } from "@/utils/SocketManager";
import { Page, PageState } from "./Page";
import { languageManager } from "@/utils/LanguageManager";
import { layoutManager as layout } from "@/utils/LayoutManager";
import { Color } from "@/utils/colors";

export class HomePage extends Page {
	constructor(scene: BaseScene, state: PageState, socket: SocketManager) {
		super(scene, state, socket);

		let background = layout.addRect(scene, layout.panel, Color.Slate800);
		this.add(background);

		let title = scene.addText({
			x: layout.panelInner.left,
			y: layout.panelInner.top,
			size: 64,
			color: "white",
		});
		this.add(title);
		languageManager.bind(title, "bread_title");

		let bread = scene.addText({
			x: layout.panelInner.left,
			y: layout.panelInner.top + 1.5 * title.displayHeight,
			size: 28,
			color: "white",
		});
		this.add(bread);
		languageManager.bind(bread, "bread_text");
		bread.setWordWrapWidth(layout.panelInner.width);
	}

	update(time: number, delta: number) {
		super.update(time, delta);
	}
}
