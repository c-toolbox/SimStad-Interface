import { BaseScene } from "@/scenes/BaseScene";
import { SocketManager } from "@/utils/SocketManager";
import { Page, PageState } from "./Page";
import { Color } from "@/utils/colors";
import { layoutManager as layout } from "@/utils/LayoutManager";
import { CheckSlider } from "../elements/CheckSlider";
import { TextButton } from "../TextButton";

export class DebugPage extends Page {
	private title: Phaser.GameObjects.Text;
	private areas: Phaser.Geom.Rectangle[];
	private sliders: CheckSlider[];

	private trafficSlider: CheckSlider;
	private reCacheButton: TextButton;
	private riverSlider: CheckSlider;
	private movieSlider: CheckSlider;
	private layoutSlider: CheckSlider;
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
		// this.areas.forEach((area) => {
		// 	this.add(
		// 		scene.add.rectangle(
		// 			area.centerX,
		// 			area.centerY,
		// 			area.width,
		// 			area.height,
		// 			0x000000,
		// 			0.1
		// 		)
		// 	);
		// });

		/* Recache database */

		this.reCacheButton = this.setButtonArea(
			0,
			"Recache database",
			"Request Unreal to reload all raster images.\nThis action takes about 60 seconds.",
			() => {
				this.socket.sendReCacheDatabase();
			}
		);
		this.reCacheButton.on("click", () => {
			if (this.socket.isConnectedToUnreal) {
				this.socket.sendReCacheDatabase();
				this.recacheLoader.setVisible(true);
			}
		});
		this.socket.on("onCacheProgress", () => {});
		this.socket.on("onCacheComplete", () => {
			this.recacheLoader.setVisible(false);
		});
		this.recacheLoader = scene.add.image(
			this.reCacheButton.x + this.reCacheButton.width / 2 + 60,
			this.reCacheButton.y,
			"vis_c_logo_white"
		);
		this.recacheLoader.setVisible(false);
		this.recacheLoader.setScale(60 / this.recacheLoader.height);
		this.recacheLoader.setTint(Color.Slate200);
		this.add(this.recacheLoader);

		/* Traffic */

		this.trafficSlider = this.setCheckboxArea(
			1,
			"Live traffic",
			"Enable live traffic data, streaming the location of busses and trams"
		);
		this.trafficSlider.on("click", (active: boolean) => {
			if (this.socket.isConnectedToUnreal) {
				this.trafficSlider.setIsLoading(true);
				if (active) {
					this.socket.sendActivateTraffic();
				} else {
					this.socket.sendDeactivateTraffic();
				}
			}
		});
		this.socket.on("serverTrafficEnabled", (enabled: boolean) => {
			this.trafficSlider.setIsLoading(false);
			this.trafficSlider.value = enabled ? 1 : 0;
		});

		/* Logging */

		this.loggingSlider = this.setCheckboxArea(
			2,
			"View logs",
			"Show logs of all websocket messages being sent and received"
		);
		this.loggingSlider.on("click", (active: boolean) => {
			this.emit("logging", active);
		});

		/* UI Layout */

		this.layoutSlider = this.setCheckboxArea(
			3,
			"Draw layout",
			"Draw the layout of the scene"
		);
		this.layoutSlider.on("click", (active: boolean) => {
			layout.drawLayout(scene);
		});

		/* Miscellaneous buttons */

		// const rect = this.areas[4];

		this.setButtonArea(4, "Reset", "", () => {
			this.socket.sendReset();
		});

		this.setButtonArea(5, "Ping", "", () => {
			this.socket.sendPing();
		});

		this.setButtonArea(6, "RiverFlow", "", () => {
			this.socket.send({
				type: "ActivateDatasetRequest",
				datasets: "RiverFlow",
			});
		});

		this.setButtonArea(7, "IdleMovie", "", () => {
			this.socket.send({
				type: "ActivateDatasetRequest",
				datasets: "Idle/Idle_Movie",
			});
		});

		this.setButtonArea(8, "Light add", "", () => {
			this.socket.send({
				type: "MapLightRequest",
				name: "something",
				northing: (129411.4 + 134211.4) / 2,
				easting: (6495015.262 + 6498915.262) / 2,
				height: 200.0,
				color: "#ffffff",
				typeofmessage: "add",
				enable: true,
			});
		});

		this.setButtonArea(9, "Light delete", "", () => {
			this.socket.send({
				type: "MapLightRequest",
				name: "something",
				northing: (129411.4 + 134211.4) / 2,
				easting: (6495015.262 + 6498915.262) / 2,
				height: 200.0,
				color: "#ffffff",
				typeofmessage: "delete",
				enable: true,
			});
		});

		this.setButtonArea(10, "Marker on", "", () => {
			this.socket.send({
				type: "MapMarkerRequest",
				northing: (129411.4 + 134211.4) / 2,
				easting: (6495015.262 + 6498915.262) / 2,
				typeofmessage: "On", // On/Off/3sec/5sec/..
				enable: true,
			});
		});

		this.setButtonArea(11, "Marker off", "", () => {
			this.socket.send({
				type: "MapMarkerRequest",
				northing: (129411.4 + 134211.4) / 2,
				easting: (6495015.262 + 6498915.262) / 2,
				typeofmessage: "Off",
				enable: true,
			});
		});

		this.setButtonArea(12, "", "", () => {
			this.socket.send({
				type: "Type",
				data: "insert_data",
			});
		});

		this.setButtonArea(13, "", "", () => {
			this.socket.send({
				type: "Type",
				data: "insert_data",
			});
		});

		this.setButtonArea(14, "", "", () => {
			this.socket.send({
				type: "Type",
				data: "insert_data",
			});
		});

		this.setButtonArea(15, "", "", () => {
			this.socket.send({
				type: "Type",
				data: "insert_data",
			});
		});
	}

	update(time: number, delta: number) {
		super.update(time, delta);

		this.sliders.forEach((slider) => slider.update(time, delta));

		this.recacheLoader.angle = time / 2;
	}

	reset() {
		this.trafficSlider.value = 0;
		this.riverSlider.value = 0;
		this.movieSlider.value = 0;
		this.layoutSlider.value = 0;
		this.loggingSlider.value = 0;

		this.emit("logging", false);
		this.socket.sendDeactivateTraffic();
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
		callback: () => void
	): TextButton {
		const rect = this.areas[rectIndex];

		const button = this.addButton(
			rect.left + 155,
			rect.top + 30,
			310,
			60,
			titleText,
			titleText ? Color.Rose700 : Color.Slate700,
			callback
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
		descText: string
	): CheckSlider {
		const rect = this.areas[rectIndex];
		const centerY = rect.centerY - 20;

		const slider = new CheckSlider(this.scene, rect.left + 46, centerY, 50, 30);
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
