import { BaseScene } from "@/scenes/BaseScene";
import { SocketManager } from "@/utils/SocketManager";
import { Page, PageState } from "./Page";
import { layoutManager as layout } from "@/utils/LayoutManager";
import { Color } from "@/utils/colors";
import { CollectionButton } from "../CollectionButton";
import { languageManager } from "@/utils/LanguageManager";
import { contentManager } from "@/utils/ContentManager";

export class HomePage extends Page {
	private title: Phaser.GameObjects.Text;
	private subtitle: Phaser.GameObjects.Text;
	private areas: Phaser.Geom.Rectangle[];
	private collectionButtons: CollectionButton[];

	constructor(scene: BaseScene, state: PageState, socket: SocketManager) {
		super(scene, state, socket);

		this.fadeDir *= -1;

		/* Background */

		let background = layout.addRect(scene, layout.panel, Color.Slate900);
		this.add(background);

		/* Text */

		this.title = scene.addText({
			x: layout.panelInner.left,
			y: layout.panelInner.top - 10,
			size: 64,
			color: "white",
		});
		this.title.setShadow(0, 2, "#00000099", 8);
		languageManager.bind(this.title, "home_title");
		this.add(this.title);

		let bread = scene.addText({
			x: layout.panelInner.left,
			y: layout.panelInner.top + 66,
			size: 28,
			color: "white",
		});
		bread.setShadow(0, 2, "#00000099", 8);
		bread.setWordWrapWidth(layout.panelInner.width);
		languageManager.bind(bread, "home_bread");
		this.add(bread);

		this.subtitle = scene.addText({
			x: layout.panelInner.left,
			size: 28,
			color: "white",
		});
		languageManager.bind(this.subtitle, "home_subtitle");
		this.subtitle.setShadow(0, 2, "#00000099", 8);
		this.subtitle.setWordWrapWidth(layout.panelInner.width);
		this.add(this.subtitle);

		/* Collection grid */

		this.collectionButtons = [];
		this.loadCollections();
	}

	update(time: number, delta: number) {
		super.update(time, delta);

		this.collectionButtons.forEach((button) => button.update(time, delta));
	}

	protected override onGuideModeChanged() {
		this.loadCollections();
	}

	private loadCollections() {
		this.collectionButtons.forEach((button) => button.destroy());
		this.collectionButtons = [];

		const featured = contentManager.getFeaturedCollections();
		const featuredKeys = new Set(featured.map((collection) => collection.key));
		const collections = this.guideModeEnabled
			? [
					...featured,
					...contentManager
						.getCollections()
						.filter((collection) => !featuredKeys.has(collection.key)),
				]
			: featured;

		this.areas = this.getAreas(collections.length);
		this.subtitle.setVisible(!this.guideModeEnabled);
		if (!this.guideModeEnabled) {
			this.subtitle.setY(this.areas[2].top - 64);
		}
		collections.forEach((collection, i) => {
			const area = this.areas[i];
			if (!area) {
				return console.error(
					"HomePage has run out of featured collection areas.",
				);
			}
			const button = new CollectionButton(
				this.scene,
				area.centerX,
				area.centerY,
				area.width,
				area.height,
				collection
			);
			button.on(
				"click",
				() => {
					if (this.allowInput()) {
						this.emit("collection", collection.key);
					}
				},
				this,
			);
			this.add(button);
			this.collectionButtons.push(button);
		});
	}

	getAreas(collectionCount: number): Phaser.Geom.Rectangle[] {
		if (this.guideModeEnabled) {
			return this.getDebugAreas(collectionCount);
		} else {
			return this.getFeaturedAreas(collectionCount);
		}
	}

	private getFeaturedAreas(collectionCount: number): Phaser.Geom.Rectangle[] {
		const panel = layout.panelInner;
		const upperHeight = 0.3 * panel.height;
		const lowerHeight = 0.4 * panel.height;
		const gap = 48;

		return [
			...this.getGrid(
				2,
				1,
				panel.left,
				panel.bottom - lowerHeight - upperHeight - 2 * gap,
				panel.width,
				panel.height / 4,
				gap,
			),
			...this.getGrid(
				3,
				2,
				panel.left,
				panel.bottom - lowerHeight,
				panel.width,
				lowerHeight,
				gap,
			),
		];
	}

	private getDebugAreas(collectionCount: number): Phaser.Geom.Rectangle[] {
		const panel = layout.panelInner;
		const height = panel.height - 150;
		const gap = 32;
		const rows = Math.ceil(collectionCount / 3);

		return this.getGrid(
			3,
			rows,
			panel.left,
			panel.bottom - height,
			panel.width,
			height,
			gap,
		);
	}

	private getGrid(
		columns: number,
		rows: number,
		left: number,
		top: number,
		width: number,
		height: number,
		gap: number,
	): Phaser.Geom.Rectangle[] {
		const rectWidth = (width - gap * (columns - 1)) / columns;
		const rectHeight = (height - gap * (rows - 1)) / rows;

		return Array.from({ length: columns * rows }, (_, i) => {
			const x = left + (rectWidth + gap) * (i % columns);
			const y = top + (rectHeight + gap) * Math.floor(i / columns);
			return new Phaser.Geom.Rectangle(x, y, rectWidth, rectHeight);
		});
	}
}
