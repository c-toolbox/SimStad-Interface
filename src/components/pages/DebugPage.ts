import { BaseScene } from "@/scenes/BaseScene";
import { SocketManager } from "@/utils/SocketManager";
import { Page, PageState } from "./Page";
import { Color } from "@/utils/colors";
import { layoutManager as layout } from "@/utils/LayoutManager";
import { CheckSlider } from "../elements/CheckSlider";
import { TextButton } from "../TextButton";
import { layerManager } from "@/utils/LayerManager";

export class DebugPage extends Page {
	private title: Phaser.GameObjects.Text;
	private areas: Phaser.Geom.Rectangle[];
	private sliders: CheckSlider[];

	private trafficSlider: CheckSlider;
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

		this.recacheButton = this.setButtonArea(
			0,
			"Recache database",
			"Request Unreal to reload all raster images.\nThis action takes about 90 seconds.",
			() => {
				if (this.socket.isConnectedToUnreal) {
					this.socket.sendRecacheRequest();
					this.recacheLoader.setVisible(true);
					layerManager.reloadLayers();
				}
			}
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
			"Enable live traffic data, streaming the location of busses and trams",
			(active: boolean) => {
				if (this.socket.isConnectedToUnreal) {
					this.trafficSlider.setIsLoading(true);
					this.socket.sendLiveTraffic(active);
				}
			}
		);
		this.socket.on("serverTrafficEnabled", (enabled: boolean) => {
			this.trafficSlider.setIsLoading(false);
			this.trafficSlider.value = enabled ? 1 : 0;
		});

		/* Logging */

		this.loggingSlider = this.setCheckboxArea(
			2,
			"View logs",
			"Show logs of all websocket messages being sent and received",
			(active: boolean) => {
				this.emit("logging", active);
			}
		);

		/* UI Layout */

		this.advLayerSlider = this.setCheckboxArea(
			3,
			"Show layer info",
			"Display layer usage count and drive status in layer page",
			(active: boolean) => {
				this.emit("showLayerInfo", active);
			}
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

		this.setButtonArea(4, "Reset", "", () => {
			this.socket.sendReset();
		});

		this.setButtonArea(5, "Ping", "", () => {
			this.socket.sendPing();
		});

		this.setButtonArea(6, "Idle movie", "", () => {
			this.socket.send({
				type: "LayerRequest",
				layers: [
					{
						type: "movie",
						name: "Movies/3DPRINT_ANIMATION_V003",
						lit: true,
					},
				],
			});
		});

		this.setButtonArea(7, "Motala Ström", "", () => {
			this.socket.send({
				type: "LayerRequest",
				layers: [
					{
						type: "image",
						name: "Nkpg/Orto20230921",
					},
					{
						type: "flow",
						name: "Flow/strommen_flow_new",
						flow: {
							texture: "Flow/Water",
							scale: 200,
							speed: 0.05,
						},
					},
				],
			});
		});

		this.setButtonArea(8, "Add 5 Lights", "", () => {
			this.socket.send({
				type: "LayerRequest",
				layers: [
					{
						type: "image",
						name: "Color/Black",
						lit: false,
						crop: {
							min_u: 0.5,
							max_u: 1.0,
							min_v: 0.5,
							max_v: 1.0,
						},
					},
					{
						type: "image",
						name: "Color/Black",
						lit: true,
						crop: {
							min_u: 0.0,
							max_u: 0.5,
							min_v: 0.0,
							max_v: 0.5,
						},
					},
				],
			});
			scene.addEvent(500*0, () => {this.socket.send({"type":"MapLightRequest","name":"aaaaa","northing":134091,"easting":6498517,"height":100,"color":"#ff0000","typeofmessage":"add","enable":true})});
			scene.addEvent(500*1, () => {this.socket.send({"type":"MapLightRequest","name":"aaaaa","northing":134091,"easting":6498517,"height":100,"color":"#ff0000","typeofmessage":"update","enable":true})});
			scene.addEvent(500*2, () => {this.socket.send({"type":"MapLightRequest","name":"bbbbb","northing":133695,"easting":6498517,"height":100,"color":"#ffff00","typeofmessage":"add","enable":true})});
			scene.addEvent(500*3, () => {this.socket.send({"type":"MapLightRequest","name":"bbbbb","northing":133695,"easting":6498517,"height":100,"color":"#ffff00","typeofmessage":"update","enable":true})});
			scene.addEvent(500*4, () => {this.socket.send({"type":"MapLightRequest","name":"ccccc","northing":133237,"easting":6498517,"height":100,"color":"#00ff00","typeofmessage":"add","enable":true})});
			scene.addEvent(500*5, () => {this.socket.send({"type":"MapLightRequest","name":"ccccc","northing":133237,"easting":6498517,"height":100,"color":"#00ff00","typeofmessage":"update","enable":true})});
			scene.addEvent(500*6, () => {this.socket.send({"type":"MapLightRequest","name":"ddddd","northing":132841,"easting":6498517,"height":100,"color":"#00ffff","typeofmessage":"add","enable":true})});
			scene.addEvent(500*7, () => {this.socket.send({"type":"MapLightRequest","name":"ddddd","northing":132841,"easting":6498517,"height":100,"color":"#00ffff","typeofmessage":"update","enable":true})});
			scene.addEvent(500*8, () => {this.socket.send({"type":"MapLightRequest","name":"eeeee","northing":132296,"easting":6498517,"height":100,"color":"#0000ff","typeofmessage":"add","enable":true})});
			scene.addEvent(500*9, () => {this.socket.send({"type":"MapLightRequest","name":"eeeee","northing":132296,"easting":6498517,"height":100,"color":"#0000ff","typeofmessage":"update","enable":true})});
		});

		this.setButtonArea(9, "Delete 5 Lights", "", () => {
			scene.addEvent(500*4, () => {this.socket.send({"type":"MapLightRequest","name":"aaaaa","northing":134091,"easting":6498517,"height":100,"color":"#ffffff","typeofmessage":"delete","enable":false})});
			scene.addEvent(500*3, () => {this.socket.send({"type":"MapLightRequest","name":"bbbbb","northing":133695,"easting":6498517,"height":100,"color":"#ffffff","typeofmessage":"delete","enable":false})});
			scene.addEvent(500*2, () => {this.socket.send({"type":"MapLightRequest","name":"ccccc","northing":133237,"easting":6498517,"height":100,"color":"#ffffff","typeofmessage":"delete","enable":false})});
			scene.addEvent(500*1, () => {this.socket.send({"type":"MapLightRequest","name":"ddddd","northing":132841,"easting":6498517,"height":100,"color":"#ffffff","typeofmessage":"delete","enable":false})});
			scene.addEvent(500*0, () => {this.socket.send({"type":"MapLightRequest","name":"eeeee","northing":132296,"easting":6498517,"height":100,"color":"#ffffff","typeofmessage":"delete","enable":false})});
		});

		this.setButtonArea(10, "", "", () => {});

		this.setButtonArea(11, "", "", () => {});

		this.setButtonArea(12, "", "", () => {});

		this.setButtonArea(13, "Recache /Beredskap", "", () => {
			this.socket.send({
				type: "RecacheRequest",
				path: "/Datasets/Tellden",
			});
		});

		this.setButtonArea(14, "Circle crop", "", () => {
			this.socket.sendLayers([
				{
					type: "image",
					name: "Nkpg/Buller_V2",
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

		this.setButtonArea(15, "", "", () => {});
	}

	update(time: number, delta: number) {
		super.update(time, delta);

		this.sliders.forEach((slider) => slider.update(time, delta));

		this.recacheLoader.angle = time / 2;
	}

	reset() {
		this.trafficSlider.value = 0;
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
		descText: string,
		callback: (active: boolean) => void
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
