import { BaseScene } from "@/scenes/BaseScene";
import { SocketManager } from "@/utils/SocketManager";
import { Page, PageState } from "./Page";
import { Color } from "@/utils/colors";
import { layoutManager as layout } from "@/utils/LayoutManager";

import { ScrollArea } from "../elements/ScrollArea";
import { ScrollBar } from "@/components/elements/ScrollBar";
import { LayerImageButton } from "../LayerImageButton";
import { RoundRectangle } from "../elements/RoundRectangle";
import { Layer, layerManager } from "@/utils/LayerManager";
import { LayerButton } from "../LayerButton";
import { LayerList } from "../LayerList";

export class LayerPage extends Page {
	private scrollArea: ScrollArea;
	private scrollBar: ScrollBar;
	private layerButtons: LayerButton[];
	private showLayerInfo: boolean;

	private activeLayers: string[];
	private layerList: LayerList;

	constructor(scene: BaseScene, state: PageState, socket: SocketManager) {
		super(scene, state, socket);

		this.layerButtons = [];
		this.activeLayers = [];
		this.showLayerInfo = false;

		let background = layout.addRect(scene, layout.panel, Color.Slate800);
		this.add(background);

		/* Folders */

		this.loadFolders();

		/* Scroll area */

		const gridLayout = layout.layerGrid;
		let scrollTop = gridLayout.top;
		let scrollBottom = gridLayout.bottom;
		let scrollHeight = scrollBottom - scrollTop;

		this.scrollArea = new ScrollArea(
			scene,
			gridLayout.left,
			scrollTop,
			gridLayout.width,
			scrollHeight
		);
		this.add(this.scrollArea);

		this.scrollBar = new ScrollBar(
			this.scene,
			gridLayout.right + 20,
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

		this.loadLayerFolder(layerManager.getFolders()[0].name);

		/* Active layer list */

		this.layerList = new LayerList(scene, 0, 0);
		this.add(this.layerList);

		this.layerList.on("updateOrder", (layers: string[]) => {
			this.activeLayers = layers;
			this.sendActiveDataset();
		});
	}

	update(time: number, delta: number) {
		super.update(time, delta);

		this.layerList.update(time, delta);
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

	loadFolders() {
		this.buttons.forEach((button) => {
			button.destroy();
		});
		this.buttons = [];

		const folderLayout = layout.layerFolders;
		const folders = layerManager.getFolders();
		let n = folders.length + 1;
		let s = 20;
		let w = folderLayout.width;
		let h = (folderLayout.height - s * (n - 1)) / n;
		let x = folderLayout.right - w / 2;
		let y = folderLayout.bottom - h / 2;

		this.addButton(x, y, w, h, "Clear", Color.Rose800, () => {
			this.socket.sendReset();
			this.resetLayers();
			this.emit("map", "");
		});

		folders.forEach((folder, index) => {
			let y = folderLayout.top + h / 2 + (h + s) * index;
			const color = folder.isSequential ? Color.Slate700 : Color.Slate600;
			this.addButton(x, y, w, h, folder.name, color, () => {
				this.loadLayerFolder(folder.name);
			});
		});
	}

	loadLayerFolder(folder = "") {
		this.clearLayers();
		const areas = this.getGrid();

		// Folder buttons
		this.buttons.forEach((button) => {
			button.setHighlight(button.getText() == folder);
		});

		layerManager.getLayers(folder).forEach((layer: Layer) => {
			if (layer.isInDrive || this.showLayerInfo) {
				this.addLayerButton(layer, areas.next().value);
			}
		});
	}

	addLayerButton(layer: Layer, { x, y, w, h }: GridArea) {
		let button = new LayerImageButton(this.scene, x, y, w, h, layer.name);
		button.setDraggable();
		this.add(button);
		this.layerButtons.push(button);
		this.scrollArea.apply(button);

		let activeIndex = this.activeLayers.indexOf(layer.name);
		if (activeIndex != -1) {
			button.setSelected(true);
			button.setOrder(activeIndex + 1);
		}

		if (!layer.isInDrive) {
			button.addErrorIcon();
		}
		if (this.showLayerInfo) {
			button.addUseCount(layer.useCount);
		}

		button.on("click", () => this.onLayerButtonClick(button));
	}

	onLayerButtonClick(button: LayerButton) {
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
		this.sendActiveDataset();
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
		this.layerList.setLayers(this.activeLayers);
		this.layerButtons.forEach((buttons) => buttons.setSelected(false));
	}

	setLayers(layerString: string) {
		this.activeLayers = layerString.split(",").filter((layer) => !!layer);
		this.layerList.setLayers(this.activeLayers);

		this.layerButtons.forEach((button) => {
			const index = this.activeLayers.indexOf(button.layer);
			if (index !== -1) {
				button.setSelected(true);
				button.setOrder(index + 1);
			} else {
				button.setSelected(false);
				button.setOrder(0);
			}
		});
	}

	*getGrid(): Generator<GridArea> {
		let N = 4;
		let margin = 30;
		let sep = 20;
		let w = (this.scrollArea.width - 2 * margin - (N - 1) * sep) / N;
		let h = w;
		let x = w / 2 + margin;
		let y = margin + h / 2;

		while (true) {
			yield { x, y, w, h };

			x += w + sep;
			if (x + w / 2 > this.scrollArea.width) {
				x = w / 2 + margin;
				y += h + sep;
			}
		}
	}

	setShowLayerInfo(show: boolean) {
		this.showLayerInfo = show;
		this.loadLayerFolder(layerManager.getFolders()[0].name);
	}
}

interface GridArea {
	x: number;
	y: number;
	w: number;
	h: number;
}
