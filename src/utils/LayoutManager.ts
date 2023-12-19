import { BaseScene } from "@/scenes/BaseScene";
import { RoundRectangle } from "@/components/elements/RoundRectangle";
import { Color } from "./colors";

class LayoutManager {
	readonly screenWidth = 1920;
	readonly screenHeight = 1080;

	private graphics: Phaser.GameObjects.Graphics;
	private debugActive: boolean;

	private _body: Phaser.Geom.Rectangle;
	private _status: Phaser.Geom.Rectangle;
	private _toolbar: Phaser.Geom.Rectangle;
	private _map: Phaser.Geom.Rectangle;
	private _nav: Phaser.Geom.Rectangle;
	private _navInner: Phaser.Geom.Rectangle;
	private _panel: Phaser.Geom.Rectangle;
	private _panelInner: Phaser.Geom.Rectangle;
	private _panelLeft: Phaser.Geom.Rectangle;

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

	get status(): Phaser.Geom.Rectangle {
		if (this._status) return this._status;

		const x = 0;
		const y = 0;
		const w = this.panel.left;
		const h = this.margin;

		this._status = new Phaser.Geom.Rectangle(x, y, w, h);
		return this._status;
	}

	get toolbar(): Phaser.Geom.Rectangle {
		if (this._toolbar) return this._toolbar;

		const x = this.body.right;
		const w = this.margin;
		const h = 3 * w;
		const y = this.body.bottom - h;

		this._toolbar = new Phaser.Geom.Rectangle(x, y, w, h);
		return this._toolbar;
	}

	get map(): Phaser.Geom.Rectangle {
		if (this._map) return this._map;

		const w = this.panelInner.height * (3849 / 5120);
		const h = this.panelInner.height;
		const x = this.panelInner.right - w;
		const y = this.panelInner.top;

		this._map = new Phaser.Geom.Rectangle(x, y, w, h);
		return this._map;
	}

	get nav(): Phaser.Geom.Rectangle {
		if (this._nav) return this._nav;

		// const w =
		// 	this.body.width - this.map.width - this.separation + this.margin / 2;
		// const h = 200;
		// const x = this.body.left - this.margin / 2;
		// const y = this.body.bottom - h + this.margin / 2;
		const w = 200;
		const h = this.body.height + this.margin;
		const x = this.body.left - this.margin / 2;
		const y = this.body.top - this.margin / 2;

		this._nav = new Phaser.Geom.Rectangle(x, y, w, h);
		return this._nav;
	}

	get navInner(): Phaser.Geom.Rectangle {
		if (this._navInner) return this._navInner;

		const p = this.padding;
		const x = this.nav.left + p;
		const y = this.nav.top + p;
		const w = this.nav.width - 2 * p;
		const h = this.nav.height - 2 * p;

		this._navInner = new Phaser.Geom.Rectangle(x, y, w, h);
		return this._navInner;
	}

	get panel(): Phaser.Geom.Rectangle {
		if (this._panel) return this._panel;

		const offset = this.nav.width - 1.5 * this.padding;

		const x = this.body.left + offset;
		const y = this.body.top;
		// const w = this.body.width - this.map.width - this.separation;
		const w = this.body.width - offset;
		const h = this.body.height;
		// const h = this.body.height - this.margin / 2 - this.padding / 2;
		// this.body.height - this.nav.height - this.separation + this.margin + this.padding;

		this._panel = new Phaser.Geom.Rectangle(x, y, w, h);
		return this._panel;
	}

	get panelInner(): Phaser.Geom.Rectangle {
		if (this._panelInner) return this._panelInner;

		const x = this.panel.left + this.padding;
		const y = this.panel.top + this.padding;
		const w = this.panel.width - 2 * this.padding;
		// const h = this.nav.top - y - this.padding / 2;
		const h = this.panel.height - 2 * this.padding;

		this._panelInner = new Phaser.Geom.Rectangle(x, y, w, h);
		return this._panelInner;
	}

	get panelLeft(): Phaser.Geom.Rectangle {
		if (this._panelLeft) return this._panelLeft;

		const x = this.panelInner.left;
		const y = this.panelInner.top;
		const w = this.panelInner.width - this.map.width - this.separation;
		const h = this.panelInner.height;

		this._panelLeft = new Phaser.Geom.Rectangle(x, y, w, h);
		return this._panelLeft;
	}

	/* Debug drawing */

	drawLayout(scene: BaseScene) {
		if (!this.graphics) this.graphics = scene.add.graphics();

		this.graphics.clear();

		this.debugActive = !this.debugActive;
		if (!this.debugActive) return;

		const rects = [
			[this.body, Color.Gray600],
			[this.nav, Color.Green600],
			[this.navInner, Color.Lime600],
			[this.panel, Color.Red600],
			[this.panelInner, Color.Yellow600],
			[this.panelLeft, Color.Pink600],
			[this.map, Color.Indigo600],
			[this.status, Color.Purple600],
			[this.toolbar, Color.Fuchsia600],
		];

		rects.forEach(([rect, color]) => {
			this.graphics.lineStyle(2, color as number);
			this.graphics.strokeRectShape(rect as Phaser.Geom.Rectangle);
		});
	}

	/* Background generator */

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
