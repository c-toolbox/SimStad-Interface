import { BaseScene } from "@/scenes/BaseScene";
import { SocketManager } from "@/utils/SocketManager";
import { Page, PageState } from "./Page";
import { Color } from "@/utils/colors";
import { layoutManager as layout } from "@/utils/LayoutManager";

import { ScrollArea } from "../elements/ScrollArea";
import { ScrollBar } from "@/components/elements/ScrollBar";
import { RasterImageButton } from "../RasterImageButton";
import { RoundRectangle } from "../elements/RoundRectangle";
import { contentManager } from "@/utils/ContentManager";
import { RasterButton } from "../RasterButton";
import { LayerList } from "../LayerList";
import { Layer, Raster, Tag } from "@/utils/interfaces";

export class LayerPage extends Page {
	private scrollArea: ScrollArea;
	private scrollBar: ScrollBar;
	private layerButtons: RasterButton[];
	private showLayerInfo: boolean;

	private activeLayers: Layer[];
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
			scrollHeight,
		);
		this.add(this.scrollArea);

		this.scrollBar = new ScrollBar(
			this.scene,
			gridLayout.right + 20,
			this.scrollArea.y + this.scrollArea.height / 2,
			10,
			this.scrollArea.height - 8,
		);
		this.add(this.scrollBar);

		const tags = contentManager.getTags();
		this.loadTag(tags[0]);

		/* Active layer list */

		this.layerList = new LayerList(scene, 0, 0);
		this.add(this.layerList);

		this.layerList.on("updateOrder", (layers: Layer[]) => {
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

	reset() {
		if (this.showLayerInfo) {
			this.setShowLayerInfo(false);
		}
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
		const tags = contentManager.getTags();
		let n = tags.length + 1;
		let s = 20;
		let w = folderLayout.width;
		let h = (folderLayout.height - s * (n - 1)) / n;
		let x = folderLayout.right - w / 2;
		let y = folderLayout.bottom - h / 2;

		this.addButton(x, y, w, h, "Clear", Color.Rose800, () => {
			this.emit("setLayers", []);
		});

		tags.forEach((tag, index) => {
			let y = folderLayout.top + h / 2 + (h + s) * index;
			const tagButton = this.addButton(x, y, w, h, tag.name, Color.Slate600, () => {
				this.loadTag(tag);
			});
			tagButton.setData("tag", tag.key);
		});
	}

	loadTag(tag: Tag) {
		this.clearLayers();
		const areas = this.getGrid();

		// Folder buttons
		this.buttons.forEach((button) => {
			button.setHighlight(button.getData("tag") == tag.key);
		});

		contentManager.getRastersByTag(tag).forEach((raster: Raster) => {
			this.addRasterButton(raster, areas.next().value);
		});
	}

	addRasterButton(raster: Raster, { x, y, w, h }: GridArea) {
		let button = new RasterImageButton(this.scene, x, y, w, h, raster);
		button.setDraggable();
		this.add(button);
		this.layerButtons.push(button);
		this.scrollArea.apply(button);

		let activeIndex = this.activeLayers.findIndex((layer) =>
			layer.type == "image" || layer.type == "flow" || layer.type == "movie"
				? layer.raster == raster.key
				: false,
		);
		if (activeIndex != -1) {
			button.setSelected(true);
			button.setOrder(activeIndex + 1);
		}

		button.on("click", () => this.onLayerButtonClick(button));
	}

	onLayerButtonClick(button: RasterButton) {
		if (!button.selected && this.activeLayers.length >= 10) {
			return;
		}

		button.setSelected(!button.selected);

		if (button.selected) {
			this.activeLayers.push(contentManager.rasterToLayer(button.raster));
		} else {
			const index = this.activeLayers.findIndex((layer) =>
				layer.type == "image" || layer.type == "flow" || layer.type == "movie"
					? layer.raster == button.raster.key
					: false,
			);
			this.activeLayers.splice(index, 1);
		}
		this.sendActiveDataset();
	}

	sendActiveDataset() {
		console.warn(this.activeLayers);

		this.activeLayers.forEach((layer, index) => {
			let button = this.layerButtons.find((button) =>
				layer.type == "image" || layer.type == "flow" || layer.type == "movie"
					? button.raster.key == layer.raster
					: false,
			);
			if (button) {
				button.setOrder(index + 1);
			}
		});

		this.emit("setLayers", this.activeLayers);
	}

	setLayers(layers: Layer[]) {
		this.activeLayers = layers;
		this.layerList.setLayers(this.activeLayers);

		this.layerButtons.forEach((button) => {
			const index = this.activeLayers.findIndex((layer) =>
				layer.type == "image" || layer.type == "flow" || layer.type == "movie"
					? layer.raster == button.raster.key
					: false,
			);
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
		let margin = 4;
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
		this.loadTag(contentManager.getTags()[0]);
	}
}

interface GridArea {
	x: number;
	y: number;
	w: number;
	h: number;
}
