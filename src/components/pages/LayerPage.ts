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

	constructor(scene: BaseScene, state: PageState, socket: SocketManager) {
		super(scene, state, socket);

		this.layerButtons = [];

		let title = scene.addText({
			x: layout.panelInner.left,
			y: layout.panelInner.top,
			size: 100,
			color: "white",
			text: "Layers",
		});
		this.add(title);

		let s = 20;
		let w = 220;
		let h = 64;
		let x = layout.panelInner.right - w / 2;
		let y = layout.panelInner.bottom - h / 2;
		this.addButton(x, y, w, h, "Reset", Color.Rose800, () =>
			this.socket.sendReset()
		);

		this.scrollArea = new ScrollArea(
			scene,
			layout.panelInner.left,
			layout.panelInner.top + 1.25 * title.displayHeight,
			layout.panelInner.width,
			layout.panelInner.height - 1.25 * title.displayHeight - h - s,
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
		let m = 5;

		let s = 20;
		let w = (this.scrollArea.width - (m+1) * s) / m;
		let h = w;
		let x = w / 2 + s;
		let y = s + h / 2;

		layerData.layers.forEach((layer: string) => {
			let button = new LayerButton(
				this.scene,
				x,
				y,
				w,
				h,
				layer
			);
			button.setDraggable();
			this.add(button);
			this.layerButtons.push(button);
			this.scrollArea.apply(button);

			let active = false;
			button.on("click", () => {
				active = !active;
				button.setHighlight(active);
				if (active) this.socket.sendActivateDataset("Nkpg/" + layer);
				else this.socket.sendDeactivateDataset("Nkpg/" + layer);
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
}
