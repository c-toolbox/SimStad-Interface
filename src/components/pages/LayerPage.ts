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

import { languageManager } from "@/utils/LanguageManager";
import { layerNames } from "@/assets/assets";

export class LayerPage extends Page {
	private scrollArea: ScrollArea;
	private scrollBar: ScrollBar;
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
		languageManager.bind(title, "page_layer");

		/* Button */

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

		let folders = [...new Set(layerNames.map((layer) => layer.split("/")[0]))];
		folders.forEach((folder, index) => {
			let x = layout.panelInner.left + w / 2 + (w + s) * index;
			this.addButton(x, y, w, h, folder, Color.Cyan800, () => {
				this.loadLayers(folder);
			});
		});

		/* Scroll area */

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

		this.loadLayers("Nkpg");
	}

	update(time: number, delta: number) {
		super.update(time, delta);

		this.scrollArea.update(time, delta);
		this.scrollBar.set(this.scrollArea.getScroll());

		this.layerButtons.forEach((button) => {
			button.update(time, delta);
		});
	}

	clearLayers() {
		this.scrollArea.clear();
		this.layerButtons = [];
	}

	loadLayers(filter = "") {
		this.clearLayers();

		this.buttons.forEach((button) => {
			button.setHighlight(button.getText() == filter);
		});

		let m = 6;
		let s = 20;
		let w = (this.scrollArea.width - (m + 1) * s) / m;
		let h = w;
		let x = w / 2 + s;
		let y = s + h / 2;

		let shownLayers = layerNames.filter((layer) => layer.includes(filter));

		shownLayers.forEach((layer: string) => {
			let button = new LayerButton(this.scene, x, y, w, h, layer);
			button.setDraggable();
			this.add(button);
			this.layerButtons.push(button);
			this.scrollArea.apply(button);

			let activeIndex = this.activeLayers.indexOf(layer);
			if (activeIndex != -1) {
				button.setSelected(true);
				button.setOrder(activeIndex + 1);
			}

			button.on("click", () => {
				if (!button.selected && this.activeLayers.length >= 10) {
					return;
				}

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
		this.socket.sendActivateDataset(layerString);
	}

	resetLayers() {
		this.activeLayers = [];
		this.layerButtons.forEach((buttons) => buttons.setSelected(false));
	}
}
