import { BaseScene } from "@/scenes/BaseScene";
import { ConnectionStatus as CS, SocketManager } from "@/utils/SocketManager";
import { Page, PageState } from "./Page";
import { Color } from "@/utils/colors";
import { layoutManager as layout } from "@/utils/LayoutManager";

import { ScrollArea } from "../elements/ScrollArea";
import { ScrollBar } from "@/components/elements/ScrollBar";
import { TextButton } from "@/components/TextButton";
import { LayerButton } from "@/components/LayerButton";
import { RoundRectangle } from "../elements/RoundRectangle";
import { LoadingIcon } from "@/components/LoadingIcon";

import * as layerData from "@/data/layers.json";

export class LayerPage extends Page {
	private scrollArea: ScrollArea;
	private scrollBar: ScrollBar;
	private loadingIcon: LoadingIcon;
	private errorIcon: Phaser.GameObjects.Image;
	private layerButtons: LayerButton[];

	private activeLayers: string[];

	constructor(scene: BaseScene, state: PageState, socket: SocketManager) {
		super(scene, state, socket);

		this.layerButtons = [];
		this.activeLayers = [];

		let background = layout.addRect(scene, layout.panel, Color.Slate800);
		this.add(background);

		let title = scene.addText({
			x: layout.panelInner.left,
			y: layout.panelInner.top,
			size: 64,
			color: "white",
			text: "Datalayers",
		});
		this.add(title);

		// let subtitle = scene.addText({
		// 	x: title.x,
		// 	y: title.y + 1.5 * 64,
		// 	size: 28,
		// 	color: "white",
		// 	text: "All available data layers. Intended for advanced mode.",
		// });
		// this.add(subtitle);

		let s = 20;
		let w = 220;
		let h = 64;
		let x = layout.panelInner.right - w / 2;
		let y = layout.panelInner.bottom - h / 2;
		this.addButton(x, y, w, h, "Clear", Color.Rose800, () => {
			this.socket.sendReset();
			this.resetLayers();
			this.emit("map", "");
		});

		let scrollTop = title.y + title.displayHeight + s;
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
		this.loadingIcon.setVisible(false);
		this.add(this.loadingIcon);

		this.errorIcon = scene.add.image(cx, cy, "wifi-slash");
		this.errorIcon.setScale(((256 / 201) * 120) / this.errorIcon.width);
		this.errorIcon.setTint(Color.Slate800);
		this.errorIcon.setVisible(false);
		this.add(this.errorIcon);

		this.loadLayers(layerData);
	}

	update(time: number, delta: number) {
		super.update(time, delta);

		this.scrollArea.update(time, delta);
		this.scrollBar.set(this.scrollArea.getScroll());
		this.loadingIcon.update(time, delta);

		this.layerButtons.forEach((button) => {
			button.update(time, delta);
		});
	}

	setVisible(value: boolean): this {
		return super.setVisible(value);
	}

	clearLayer() {
		this.scrollArea.clear();
		this.layerButtons = [];
		this.loadingIcon.setVisible(true);
	}

	loadLayers(layerData: { layers: string[] }) {
		let i = 0;
		let m = 6;

		let s = 20;
		let w = (this.scrollArea.width - (m + 1) * s) / m;
		let h = w;
		let x = w / 2 + s;
		let y = s + h / 2;

		// layerData.layers.sort();

		layerData.layers.forEach((layer: string) => {
			let button = new LayerButton(this.scene, x, y, w, h, layer);
			button.setDraggable();
			this.add(button);
			this.layerButtons.push(button);
			this.scrollArea.apply(button);

			button.on("click", () => {
				button.setSelected(!button.selected);

				if (button.selected) {
					this.activeLayers.push(button.layer);
				} else {
					const index = this.activeLayers.indexOf(button.layer);
					this.activeLayers.splice(index, 1);
				}
				// if (button.selected) this.socket.sendActivateDataset("Nkpg/" + layer);
				// else this.socket.sendDeactivateDataset("Nkpg/" + layer);
				this.sendActiveDataset();
			});

			x += w + s;
			if (x + w / 2 > this.scrollArea.width) {
				x = w / 2 + s;
				y += h + s;
			}
		});

		this.loadingIcon.setVisible(false);
		this.buttons.forEach((button) => this.bringToTop(button));
	}

	sendActiveDataset() {
		this.activeLayers.forEach((layer, index) => {
			let button = this.layerButtons.find((button) => button.layer == layer);
			if (button) {
				button.setOrder(index + 1);
			}
		});

		let layerString = this.activeLayers.join(",");
		this.emit("map", layerString);

		this.socket.sendReset();
		// setTimeout(() => {
		this.socket.sendActivateDataset(layerString);
		// }, 500);
	}

	resetLayers() {
		this.activeLayers = [];
		this.layerButtons.forEach((buttons) => buttons.setSelected(false));
	}
}
