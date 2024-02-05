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
import { ScenariosResponse } from "@/utils/protocol";
// import * as scenariosData from "@/assets/data/unused/scenarios.json";

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
			this.socket.sendScenariosRequest();
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
			scrollHeight,
			0
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

	setVisible(value: boolean): this {
		return super.setVisible(value);
	}

	clearScenarios() {
		this.scrollArea.clear();
		this.scenariosButtons = [];
		this.loadingIcon.setVisible(true);
		this.errorIcon.setVisible(false);
	}

	loadScenarios(scenarioData: ScenariosResponse) {
		let i = 0;

		let s = 20;
		let x = s;
		let y = 1.5 * s;
		let h = 64;
		let w = (this.scrollArea.width - 4 * s) / 3;

		scenarioData.scenarios.forEach((scenario: any) => {
			let label = this.scene.addText({
				x: this.scrollArea.width / 2,
				y: y,
				size: 30,
				text: scenario.title,
			});
			label.setOrigin(0.5);
			this.scrollArea.apply(label);

			let sx = s;
			let sy = y;
			let sw = this.scrollArea.width / 2 - 2 * s - label.displayWidth / 2;
			let sh = 1;
			let hrLeft = this.scene.add.rectangle(sx, sy, sw, sh, Color.White);
			hrLeft.setOrigin(0, 0.5);
			this.scrollArea.apply(hrLeft);

			sx = this.scrollArea.width - s;
			let hrRight = this.scene.add.rectangle(sx, sy, sw, sh, Color.White);
			hrRight.setOrigin(1.0, 0.5);
			this.scrollArea.apply(hrRight);

			y += 70;

			let bx = w / 2 + s;

			scenario.sections.forEach((section: any) => {
				section.sectionObject.forEach((object: any) => {
					let noData = object.filenames == "No-Data";
					let text = object.title.replace(/\n+/g, "");
					let color = noData ? Color.Slate800 : Color.Green700;
					let button = new TextButton(this.scene, bx, y, w, h, text, color);
					button.setDraggable();
					this.add(button);
					this.scenariosButtons.push(button);
					this.scrollArea.apply(button);

					button.on(
						"click",
						() => {
							this.socket.sendActivateDataset(object.filenames);

							this.scenariosButtons.forEach((button) =>
								button.setHighlight(false)
							);
							button.setHighlight(true);
						},
						this
					);

					bx += w + s;
					if (bx + w / 2 > this.scrollArea.width) {
						bx = w / 2 + s;
						y += h + s;
					}
				});
			});

			y += 110;
		});

		this.loadingIcon.setVisible(false);
		this.buttons.forEach((button) => this.bringToTop(button));
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
