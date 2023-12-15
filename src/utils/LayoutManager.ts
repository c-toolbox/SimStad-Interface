import { BaseScene } from "@/scenes/BaseScene";
import { RoundRectangle } from "@/components/elements/RoundRectangle";
import { Color } from "./colors";

class LayoutManager {
	readonly screenWidth = 1920;
	readonly screenHeight = 1080;

	private graphics: Phaser.GameObjects.Graphics;
	private debugActive: boolean;

	private _body: Phaser.Geom.Rectangle;
	private _mapArea: Phaser.Geom.Rectangle;
	private _nav: Phaser.Geom.Rectangle;
	private _navInner: Phaser.Geom.Rectangle;
	private _panel: Phaser.Geom.Rectangle;
	private _panelInner: Phaser.Geom.Rectangle;

	constructor() {}

	get margin(): number {
		return 80;
	}

	get padding(): number {
		return 40;
	}

	get separation(): number {
		return 30;
	}

	get radius(): number {
		return 8;
	}

	get body(): Phaser.Geom.Rectangle {
		if (this._body) return this._body;

		const x = this.margin;
		const y = this.margin;
		const w = this.screenWidth - 2 * this.margin;
		const h = this.screenHeight - 2 * this.margin;

		this._body = new Phaser.Geom.Rectangle(x, y, w, h);
		return this._body;
	}

	get mapArea(): Phaser.Geom.Rectangle {
		if (this._mapArea) return this._mapArea;

		const w = this.body.height * (3849 / 5120);
		const h = this.body.height;
		const x = this.body.right - w;
		const y = this.body.top;

		this._mapArea = new Phaser.Geom.Rectangle(x, y, w, h);
		return this._mapArea;
	}

	get nav(): Phaser.Geom.Rectangle {
		if (this._nav) return this._nav;

		const w =
			this.body.width - this.mapArea.width - this.separation + this.margin / 2;
		const h = 200;
		const x = this.body.left - this.margin / 2;
		const y = this.body.bottom - h + this.margin / 2;

		this._nav = new Phaser.Geom.Rectangle(x, y, w, h);
		return this._nav;
	}

	get navInner(): Phaser.Geom.Rectangle {
		if (this._navInner) return this._navInner;

		const x = this.nav.left + this.padding;
		const y = this.nav.top + 0.75 * this.padding;
		const w = this.nav.width - 2 * this.padding;
		const h = this.nav.height - 2 * (0.75 * this.padding);

		this._navInner = new Phaser.Geom.Rectangle(x, y, w, h);
		return this._navInner;
	}

	get panel(): Phaser.Geom.Rectangle {
		if (this._panel) return this._panel;

		const x = this.body.left;
		const y = this.body.top;
		const w = this.body.width - this.mapArea.width - this.separation;
		const h = this.body.height - this.margin / 2 - this.padding / 2;
		// this.body.height - this.nav.height - this.separation + this.margin + this.padding;

		this._panel = new Phaser.Geom.Rectangle(x, y, w, h);
		return this._panel;
	}

	get panelInner(): Phaser.Geom.Rectangle {
		if (this._panelInner) return this._panelInner;

		const x = this.panel.left + this.padding;
		const y = this.panel.top + this.padding;
		const w = this.panel.width - 2 * this.padding;
		const h = this.nav.top - y - this.padding / 2;

		this._panelInner = new Phaser.Geom.Rectangle(x, y, w, h);
		return this._panelInner;
	}

	drawLayout(scene: BaseScene) {
		if (!this.graphics) this.graphics = scene.add.graphics();

		this.graphics.clear();
		this.graphics.setBlendMode(Phaser.BlendModes.SCREEN);

		this.debugActive = !this.debugActive;
		if (!this.debugActive) return;

		const rects = [
			[this.panel, Color.Red900],
			[this.mapArea, Color.Red900],
			[this.nav, Color.Green900],
			[this.navInner, Color.Lime900],
			[this.panel, Color.Red900],
			[this.panelInner, Color.Yellow900],
		];

		rects.forEach(([rect, color]) => {
			this.graphics.lineStyle(4, color as number);
			this.graphics.strokeRectShape(rect as Phaser.Geom.Rectangle);
		});
	}

	addRect(scene: BaseScene, rect: Phaser.Geom.Rectangle, color: number) {
		return new RoundRectangle(scene, {
			rect,
			radius: this.radius,
			color,
		});
	}
}

const layoutManager: LayoutManager = new LayoutManager();

export { layoutManager };
