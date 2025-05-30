import { BaseScene } from "@/scenes/BaseScene";
import { ConnectionStatus as CS, SocketManager } from "@/utils/SocketManager";
import { Page, PageState } from "./Page";
import { Color } from "@/utils/colors";
import { layoutManager as layout } from "@/utils/LayoutManager";

import { ScrollArea } from "../elements/ScrollArea";
import { ScrollBar } from "@/components/elements/ScrollBar";
import { TextButton } from "@/components/TextButton";
import { RoundRectangle } from "../elements/RoundRectangle";
import { LoadingIcon } from "@/components/LoadingIcon";

export class ScenariosPage extends Page {
	private scrollArea: ScrollArea;
	private scrollBar: ScrollBar;
	private loadingIcon: LoadingIcon;
	private errorIcon: Phaser.GameObjects.Image;
	private scenariosButtons: TextButton[];

	constructor(scene: BaseScene, state: PageState, socket: SocketManager) {
		super(scene, state, socket);

		socket.on("connectionStatus", this.updateConnection, this);

		this.scenariosButtons = [];

		let background = layout.addRect(scene, layout.panel, Color.Slate800);
		this.add(background);

		let title = scene.addText({
			x: layout.panelInner.left,
			y: layout.panelInner.top,
			size: 64,
			color: "white",
			text: "Scenarios",
		});
		this.add(title);

		let subtitle = scene.addText({
			x: title.x,
			y: title.y + 1.5 * 64,
			size: 28,
			color: "white",
			text: "List of handpicked scenarios, stories and combination of layers.",
		});
		this.add(subtitle);

		let s = 20;
		let w = 220;
		let h = 64;
		let x = layout.panelInner.right - w / 2;
		let y = layout.panelInner.bottom - h / 2;
		this.addButton(x, y, w, h, "Reset", Color.Rose800, () => {
			this.socket.sendReset();
			this.scenariosButtons.forEach((button) => button.setHighlight(false));
		});
		this.addButton(x - w - s, y, w, h, "Refresh", Color.Green800, () => {
			this.clearScenarios();
			if (this.errorIcon.visible) {
				this.socket.reconnectToUnreal();
			}
		});
		this.addButton(x - 2 * w - 2 * s, y, w, h, "Fake", Color.Yellow800, () => {
			this.clearScenarios();
			// this.loadScenarios(scenariosData as any);
		});

		let scrollTop = subtitle.y + subtitle.displayHeight + s;
		let scrollBottom = layout.panelInner.bottom - h - s;
		let scrollHeight = scrollBottom - scrollTop;

		this.scrollArea = new ScrollArea(
			scene,
			layout.panelInner.left,
			scrollTop,
			layout.panelInner.width,
			scrollHeight
		);
		this.add(this.scrollArea);

		this.scrollBar = new ScrollBar(
			this.scene,
			layout.panelInner.right + 20,
			this.scrollArea.y + this.scrollArea.height / 2,
			10,
			this.scrollArea.height - 32
		);
		this.add(this.scrollBar);

		let cx = this.scrollArea.centerX;
		let cy = this.scrollArea.centerY;

		let areaBackground = new RoundRectangle(scene, {
			x: cx,
			y: cy,
			width: this.scrollArea.width,
			height: this.scrollArea.height,
			radius: layout.radius,
			color: Color.Slate700,
		});
		this.add(areaBackground);
		this.sendToBack(areaBackground);
		this.sendToBack(background);

		this.loadingIcon = new LoadingIcon(scene, cx, cy, Color.Slate500, 60);
		this.add(this.loadingIcon);

		this.errorIcon = scene.add.image(cx, cy, "wifi-slash");
		this.errorIcon.setScale(((256 / 201) * 120) / this.errorIcon.width);
		this.errorIcon.setTint(Color.Slate800);
		this.add(this.errorIcon);
	}

	update(time: number, delta: number) {
		super.update(time, delta);

		this.scrollArea.update(time, delta);
		this.scrollBar.set(this.scrollArea.getScroll());
		this.loadingIcon.update(time, delta);

		this.scenariosButtons.forEach((button) => {
			button.update(time, delta);
		});
	}

	clearScenarios() {
		this.scrollArea.clear();
		this.scenariosButtons = [];
		this.loadingIcon.setVisible(true);
		this.errorIcon.setVisible(false);
	}

	updateConnection(omniStatus: CS, unrealStatus: CS) {
		if (omniStatus == CS.Disconnected || unrealStatus == CS.Disconnected) {
			this.clearScenarios();
			this.loadingIcon.setVisible(false);
			this.errorIcon.setVisible(true);
		} else {
			this.loadingIcon.setVisible(this.scenariosButtons.length == 0);
			this.errorIcon.setVisible(false);
		}
	}
}
