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
	private _mapControls: Phaser.Geom.Rectangle;
	private _mapControlsInner: Phaser.Geom.Rectangle;
	private _map: Phaser.Geom.Rectangle;
	private _nav: Phaser.Geom.Rectangle;
	private _navInner: Phaser.Geom.Rectangle;
	private _panel: Phaser.Geom.Rectangle;
	private _panelInner: Phaser.Geom.Rectangle;
	private _scenarioTabs: Phaser.Geom.Rectangle;
	private _scenario: Phaser.Geom.Rectangle;
	private _scenarioInner: Phaser.Geom.Rectangle;
	private _scenarioControls: Phaser.Geom.Rectangle;
	private _scenarioLegend: Phaser.Geom.Rectangle;
	private _scenarioInfo: Phaser.Geom.Rectangle;

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

	get mapControls(): Phaser.Geom.Rectangle {
		if (this._mapControls) return this._mapControls;

		const h = 2 * this.margin;
		const w = (this.body.height - h - this.separation) * (3849 / 5120);
		const x = this.body.right - w;
		const y = this.body.bottom - h;

		this._mapControls = new Phaser.Geom.Rectangle(x, y, w, h);
		return this._mapControls;
	}

	get mapControlsInner(): Phaser.Geom.Rectangle {
		if (this._mapControlsInner) return this._mapControlsInner;

		const p = this.padding / 2;
		const x = this.mapControls.left + p;
		const y = this.mapControls.top + p;
		const w = this.mapControls.width - 2 * p;
		const h = this.mapControls.height - 2 * p;

		this._mapControlsInner = new Phaser.Geom.Rectangle(x, y, w, h);
		return this._mapControlsInner;
	}

	get map(): Phaser.Geom.Rectangle {
		if (this._map) return this._map;

		const w = this.mapControls.width;
		const h = this.body.height - this.mapControls.height - this.separation;
		const x = this.body.right - w;
		const y = this.body.top;

		this._map = new Phaser.Geom.Rectangle(x, y, w, h);
		return this._map;
	}

	get nav(): Phaser.Geom.Rectangle {
		if (this._nav) return this._nav;

		const x = 0;
		const y = this.margin;
		const w = this.margin;
		const h = this.body.height;
		
		this._nav = new Phaser.Geom.Rectangle(x, y, w, h);
		return this._nav;
	}

	get navInner(): Phaser.Geom.Rectangle {
		if (this._navInner) return this._navInner;

		const p = this.padding / 4;
		const x = this.nav.left + p;
		const y = this.nav.top + p;
		const w = this.nav.width - 2 * p;
		const h = this.nav.height - 2 * p;

		this._navInner = new Phaser.Geom.Rectangle(x, y, w, h);
		return this._navInner;
	}

	get panel(): Phaser.Geom.Rectangle {
		if (this._panel) return this._panel;

		const x = this.body.left;
		const y = this.body.top;
		const w = this.body.width - this.map.width - this.separation;
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
		const h = this.panel.height - 2 * this.padding;

		this._panelInner = new Phaser.Geom.Rectangle(x, y, w, h);
		return this._panelInner;
	}

	get scenarioTabs(): Phaser.Geom.Rectangle {
		if (this._scenarioTabs) return this._scenarioTabs;

		const h = this.margin;
		const x = this.panel.left;
		const y = this.panel.bottom - h;
		const w = this.panel.width;

		this._scenarioTabs = new Phaser.Geom.Rectangle(x, y, w, h);
		return this._scenarioTabs;
	}

	get scenario(): Phaser.Geom.Rectangle {
		if (this._scenario) return this._scenario;

		const x = this.panel.left;
		const y = this.panel.top;
		const w = this.panel.width;
		const h = this.panel.height - this.scenarioTabs.height;

		this._scenario = new Phaser.Geom.Rectangle(x, y, w, h);
		return this._scenario;
	}

	get scenarioInner(): Phaser.Geom.Rectangle {
		if (this._scenarioInner) return this._scenarioInner;

		const x = this.scenario.left + this.padding;
		const y = this.scenario.top + this.padding;
		const w = this.scenario.width - 2 * this.padding;
		const h = this.scenario.height - 2 * this.padding;

		this._scenarioInner = new Phaser.Geom.Rectangle(x, y, w, h);
		return this._scenarioInner;
	}

	get scenarioControls(): Phaser.Geom.Rectangle {
		if (this._scenarioControls) return this._scenarioControls;

		const h = this.margin;
		const x = this.scenarioInner.left;
		const y = this.scenarioInner.bottom - h;
		const w = this.scenarioInner.width;

		this._scenarioControls = new Phaser.Geom.Rectangle(x, y, w, h);
		return this._scenarioControls;
	}

	get scenarioLegend(): Phaser.Geom.Rectangle {
		if (this._scenarioLegend) return this._scenarioLegend;

		const w = 0.3 * this.scenarioInner.width;
		const x = this.scenarioInner.right - w;
		const y = this.scenarioInner.top;
		const h = this.scenarioInner.height - this.scenarioControls.height - this.separation;

		this._scenarioLegend = new Phaser.Geom.Rectangle(x, y, w, h);
		return this._scenarioLegend;
	}

	get scenarioInfo(): Phaser.Geom.Rectangle {
		if (this._scenarioInfo) return this._scenarioInfo;

		const x = this.scenarioInner.left;
		const y = this.scenarioInner.top;
		const w = this.scenarioInner.width - this.scenarioLegend.width - this.separation;
		const h = this.scenarioInner.height - this.scenarioControls.height - this.separation;

		this._scenarioInfo = new Phaser.Geom.Rectangle(x, y, w, h);
		return this._scenarioInfo;
	}


	/* Debug drawing */

	drawLayout(scene: BaseScene) {
		if (!this.graphics) this.graphics = scene.add.graphics();

		this.graphics.clear();

		this.debugActive = !this.debugActive;
		if (!this.debugActive) return;

		const rects = [
			[this.body, Color.Red900, 0],
			[this.nav, Color.Pink600, 4],
			[this.navInner, Color.Pink400, 0],
			// [this.panel, Color.Orange700, 0],
			// [this.panelInner, Color.Yellow500, 4],
			[this.mapControls, Color.Orange700, 4],
			[this.mapControlsInner, Color.Yellow500, 0],
			[this.map, Color.Orange700, 4],
			[this.status, Color.Purple600, 4],
			[this.toolbar, Color.Fuchsia600, 0],
			[this.scenarioTabs, Color.Orange700, 4],
			[this.scenario, Color.Orange700, 4],
			[this.scenarioInner, Color.Yellow500, 0],
			[this.scenarioControls, Color.Green500, 4],
			[this.scenarioLegend, Color.Green500, 4],
			[this.scenarioInfo, Color.Green500, 4],
		];

		rects.forEach(([rect, color, offset]) => {
			rect = rect as Phaser.Geom.Rectangle;
			offset = offset as number;
			rect = new Phaser.Geom.Rectangle(
				rect.x + offset,
				rect.y + offset,
				rect.width - 2 * offset,
				rect.height - 2 * offset
			);
			this.graphics.lineStyle(3, color as number);
			this.graphics.strokeRectShape(rect);
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
