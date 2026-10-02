import * as Neutralino from "@neutralinojs/lib";
import { BaseScene } from "@/scenes/BaseScene";
import { SocketManager } from "@/utils/SocketManager";
import { Page, PageState } from "./Page";
import { Color } from "@/utils/colors";
import { layoutManager as layout } from "@/utils/LayoutManager";
import { CheckSlider } from "../elements/CheckSlider";
import { TextButton } from "../TextButton";
import { contentManager } from "@/utils/ContentManager";
import { config } from "@/utils/RuntimeConfig";
import { LayerRequestData } from "@/utils/protocol";

export class DebugPage extends Page {
	private title: Phaser.GameObjects.Text;
	private areas: Phaser.Geom.Rectangle[];
	private sliders: CheckSlider[];

	private recacheButton: TextButton;
	private advLayerSlider: CheckSlider;
	private loggingSlider: CheckSlider;

	private recacheLoader: Phaser.GameObjects.Image;

	constructor(scene: BaseScene, state: PageState, socket: SocketManager) {
		super(scene, state, socket);

		this.sliders = [];

		let background = layout.addRect(scene, layout.panel, Color.Slate800);
		this.add(background);

		this.title = scene.addText({
			x: layout.panelInner.left,
			y: layout.panelInner.top,
			size: 64,
			color: "white",
			text: "Debugging",
		});
		this.add(this.title);

		this.areas = this.getAreas();

		/* Recache Unreal */

		this.recacheButton = this.setButtonArea(
			0,
			"Refresh Unreal",
			`Reload ${contentManager.getRasterCount()} raster images in Unreal.\nThis action takes about 60 seconds.`,
			() => {
				if (this.socket.isConnectedToUnreal) {
					this.scene.events.emit(
						"lockdown",
						true,
						"Restarting interface",
						"Fetching json from Omni...",
					);

					this.socket.sendReset();
					this.socket.sendRecacheRequest();
					this.recacheLoader.setVisible(true);
					contentManager.refresh();

					this.scene.events.emit("lockdown", false);
				}
			},
		);
		this.socket.on("onRecacheProgress", (count: number, max: number) => {
			const percent = `${Math.round((count / max) * 100)}%`;
			this.recacheButton.setText(`Loading... ${percent}`);
		});
		this.socket.on("onRecacheComplete", () => {
			this.recacheLoader.setVisible(false);
			this.recacheButton.setText("Recache database");
		});
		this.recacheLoader = scene.add.image(
			this.recacheButton.x + this.recacheButton.width / 2 + 60,
			this.recacheButton.y,
			"vis_c_logo_white",
		);
		this.recacheLoader.setVisible(false);
		this.recacheLoader.setScale(60 / this.recacheLoader.height);
		this.recacheLoader.setTint(Color.Slate200);
		this.add(this.recacheLoader);

		/* Restart application */

		this.setButtonArea(
			1,
			"Restart interface",
			"Refresh all content.",
			async () => {
				Neutralino.app.restartProcess();
			},
		);

		/* Logging */

		this.loggingSlider = this.setCheckboxArea(
			2,
			"View logs",
			"Show logs of all websocket messages being sent and received",
			(active: boolean) => {
				this.emit("logging", active);
			},
		);

		/* UI Layout */

		this.advLayerSlider = this.setCheckboxArea(
			3,
			"Show layer info",
			"Display layer usage count and drive status in layer page",
			(active: boolean) => {
				this.emit("showLayerInfo", active);
			},
		);

		// this.layoutSlider = this.setCheckboxArea(
		// 	3,
		// 	"Draw layout",
		// 	"Draw the layout of the scene",
		// 	(active: boolean) => {
		// 		layout.drawLayout(scene);
		// 	}
		// );

		/* Miscellaneous buttons */

		this.setButtonArea(4, "ResetRequest", "", () => {
			this.socket.sendReset();
		});

		this.setButtonArea(5, "PingRequest", "", () => {
			this.socket.sendPing();
		});

		this.setButtonArea(6, "StatusRequest", "", () => {
			this.socket.sendStatusRequest();
		});

		this.setButtonArea(7, "Idle Movie", "", () => {
			const idleRaster = contentManager.getRaster(config.IDLE_RASTER);
			if (!idleRaster)
				return console.error(
					"IDLE_RASTER in config.json not found in available rasters",
				);
			const layer = contentManager.rasterToLayer(idleRaster);
			this.emit("setLayers", [layer]);
		});

		this.setButtonArea(8, "Crop slice", "", () => {
			const layers: LayerRequestData[] = [];
			for (let color of ["#ff0000", "#00ff00", "#0000ff", "#ffff00"]) {
				const width = 0.1 * 0.3 + Math.random();
				const height = 0.1 * 0.3 + Math.random();
				const left = (1 - width) * Math.random();
				const top = (1 - height) * Math.random();
				layers.push({
					type: "color",
					id: color,
					color,
					crop: {
						type: "slice",
						slice: {
							min_u: left,
							max_u: left + width,
							min_v: top,
							max_v: top + height,
						},
					},
					opacity: 0.5,
				});
			}
			this.emit("setLayers", layers);
		});

		this.setButtonArea(9, "Crop circle", "", () => {
			const layers: LayerRequestData[] = [];
			for (let color of ["#ff0000", "#00ff00", "#0000ff", "#ffff00"]) {
				layers.push({
					type: "color",
					id: color,
					color,
					crop: {
						type: "circle",
						circle: {
							u: Math.random(),
							v: Math.random(),
							radius: 0.1 + 0.3 * Math.random(),
						},
					},
					opacity: 0.5,
				});
			}
			this.emit("setLayers", layers);
		});

		this.setButtonArea(10, "Recache 3 rasters", "", () => {
			this.socket.sendRecacheRequest([
				"100ars_regn",
				"200ars_regn",
				"500ars_regn",
			]);
		});

		this.setButtonArea(11, "NDI", "", () => {
			this.socket.sendLayers([
				{
					type: "ndi",
					id: "TrafficOverlayNDI",
					opacity: 0.1,
					emission: 1,
					ndi: {
						stream: "TrafficOverlayNDI",
					},
					crop: {
						type: "circle",
						circle: {
							u: Math.random(),
							v: Math.random(),
							radius: 0.5,
						},
					},
				},
			]);
		});

		this.setButtonArea(12, "", "", () => {});
		this.setButtonArea(13, "", "", () => {});
		this.setButtonArea(14, "", "", () => {});
		this.setButtonArea(15, "", "", () => {});
	}

	update(time: number, delta: number) {
		super.update(time, delta);

		this.sliders.forEach((slider) => slider.update(time, delta));

		this.recacheLoader.angle = time / 2;
	}

	reset() {
		this.advLayerSlider.value = 0;
		this.loggingSlider.value = 0;

		this.emit("logging", false);
		if (layout.debugActive) {
			layout.drawLayout(this.scene);
		}
	}

	getAreas() {
		let areas: Phaser.Geom.Rectangle[] = [];

		let ty = this.title.y + 1.6 * this.title.displayHeight;
		let s = 30;
		let w = (layout.panelInner.width - s) / 2;
		let h = 140;
		for (let i = 0; i < 4; i++) {
			let dx = i % 2;
			let dy = Math.floor(i / 2);
			let x = layout.panelInner.left + dx * (w + s);
			let y = ty + dy * (h + s);
			let area = new Phaser.Geom.Rectangle(x, y, w, h);
			areas.push(area);
		}

		ty = ty + 2 * (h + s) + 10;
		s = 30;
		w = (layout.panelInner.width - 2 * s) / 3;
		h = 62;
		for (let i = 0; i < 12; i++) {
			let dx = i % 3;
			let dy = Math.floor(i / 3);
			let x = layout.panelInner.left + dx * (w + s);
			let y = ty + dy * (h + s);
			let area = new Phaser.Geom.Rectangle(x, y, w, h);
			areas.push(area);
		}

		return areas;
	}

	setButtonArea(
		rectIndex: number,
		titleText: string,
		descText: string,
		callback: () => void,
	): TextButton {
		const rect = this.areas[rectIndex];

		const button = this.addButton(
			rect.left + 155,
			rect.top + 30,
			310,
			60,
			titleText,
			titleText ? Color.Rose700 : Color.Slate700,
			callback,
		);

		const desc = this.scene.addText({
			x: rect.left,
			y: rect.top + 80,
			size: 24,
			color: "white",
			text: descText,
		});
		desc.setOrigin(0);
		desc.setWordWrapWidth(rect.width, true);
		this.add(desc);

		return button;
	}

	setCheckboxArea(
		rectIndex: number,
		titleText: string,
		descText: string,
		callback: (active: boolean) => void,
	): CheckSlider {
		const rect = this.areas[rectIndex];
		const centerY = rect.centerY - 20;

		const slider = new CheckSlider(this.scene, rect.left + 46, centerY, 50, 30);
		slider.on("click", callback);
		this.sliders.push(slider);
		this.add(slider);

		const title = this.scene.addText({
			x: rect.left + 110,
			y: centerY - 5,
			size: 36,
			color: "white",
			text: titleText,
		});
		title.setOrigin(0, 1);
		this.add(title);

		const desc = this.scene.addText({
			x: rect.left + 110,
			y: centerY + 6,
			size: 24,
			color: "white",
			text: descText,
		});
		desc.setOrigin(0, 0);
		desc.setWordWrapWidth(rect.width - 110, true);
		this.add(desc);

		return slider;
	}
}
