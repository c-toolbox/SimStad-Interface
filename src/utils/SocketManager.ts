import { BaseScene } from "@/scenes/BaseScene";
import { Color, ColorStr } from "./colors";
import * as P from "./protocol";
import { languageManager } from "./LanguageManager";
import { layoutManager as layout } from "./LayoutManager";

const CLIENT_TOKEN = "29cde70e-155a-4f82-ba0d-d43d69365ee5";
const URL = "wss://omni.itn.liu.se/ws/"; // ws://localhost:8000/ws/

const PING_TIMEOUT = 3000;

export enum ConnectionStatus {
	Disconnected = "Disconnected",
	Connecting = "Connecting",
	Connected = "Connected",
}

export class SocketManager extends Phaser.GameObjects.Container {
	private socket: WebSocket;
	private handlers: { [type in P.Response]: (data: any) => void };
	private omniConnectionStatus: ConnectionStatus;
	private unrealConnectionStatus: ConnectionStatus;
	private pingTimeout: NodeJS.Timeout;
	private pingAttempts: number;
	private scenariosLoaded: boolean;

	public scene: BaseScene;
	private debugTexts: Phaser.GameObjects.Text[];
	private omniIcon: Phaser.GameObjects.Image;
	private omniLabel: Phaser.GameObjects.Text;
	private unrealIcon: Phaser.GameObjects.Image;
	private unrealLabel: Phaser.GameObjects.Text;

	constructor(scene: BaseScene) {
		super(scene, 0, 0);
		this.scene = scene;
		scene.add.existing(this);

		this.handlers = {
			[P.Response.OmniConnect]: this.onOmniConnect,
			[P.Response.OmniDisconnect]: this.onOmniDisconnect,
			[P.Response.OmniAuthorized]: this.onOmniAuthorized,
			[P.Response.OmniJoin]: this.onOmniJoin,
			[P.Response.OmniLeave]: this.onOmniLeave,
			[P.Response.OmniError]: this.onOmniError,

			[P.Response.Ping]: this.onPing,
			[P.Response.ErrorResponse]: this.onErrorRepsonse,
			[P.Response.ResetResponse]: this.onResetRepsonse,
			[P.Response.Scenarios]: this.onScenarios,
			[P.Response.ActivateTraffic]: this.onActivateTraffic,
			[P.Response.DeactivateTraffic]: this.onDeactivateTraffic,
		};

		this.omniConnectionStatus = ConnectionStatus.Disconnected;
		this.unrealConnectionStatus = ConnectionStatus.Disconnected;
		this.pingAttempts = 0;
		this.scenariosLoaded = false;

		this.debugTexts = [];

		this.setupStatusIcons();
		this.updateStatusIcons();
	}

	connect(): void {
		this.socket = new WebSocket(URL);

		this.socket.onopen = () => {
			this.addDebug("WebSocket opened", ColorStr.White);
			this.setOmniConnectionStatus(ConnectionStatus.Connecting);
		};

		this.socket.onclose = () => {
			this.addDebug("WebSocket closed", ColorStr.White);
			this.setOmniConnectionStatus(ConnectionStatus.Disconnected);
		};

		this.socket.onerror = (event: Event) => {
			this.addDebug("WebSocket error: " + event, ColorStr.Red600);
		};

		this.socket.onmessage = (event: MessageEvent) => {
			this.receive(JSON.parse(event.data));
		};
	}

	send(data: object) {
		if (this.isConnectedToSocket) {
			this.socket.send(JSON.stringify(data));
			this.addDebug(data, ColorStr.Blue600);
		} else {
			console.warn("Cannot send. Socket is closed.");
			this.addDebug(data, "dead");
		}
	}

	receive(data: any) {
		if (data.type) {
			const handler = this.handlers[data.type as P.Response];
			if (handler) {
				this.addDebug(data, ColorStr.Orange300);
				handler.call(this, data);
				this.emit(data.type, data);
				return;
			}
		}

		this.addDebug(data, ColorStr.Red600);
	}

	/* Response handlers */

	onOmniConnect(data: P.OmniConnect) {
		this.send({ token: CLIENT_TOKEN });
	}

	onOmniDisconnect(data: P.OmniDisconnect) {
		this.setOmniConnectionStatus(ConnectionStatus.Disconnected);
	}

	onOmniAuthorized(data: P.OmniAuthorized) {
		this.setOmniConnectionStatus(ConnectionStatus.Connected);
		this.reconnectToUnreal();
	}

	onOmniJoin(data: P.OmniJoin) {
		if (data.role == "host") {
			this.reconnectToUnreal();
		}
	}

	onOmniLeave(data: P.OmniLeave) {
		if (data.role == "host") {
			this.reconnectToUnreal();
		}
	}

	onOmniError(data: P.OmniError) {
		this.addDebug(data.message, ColorStr.Red600);
	}

	onPing(data: P.PingResponse) {
		clearTimeout(this.pingTimeout);
		this.pingAttempts = 0;
		this.setUnrealConnectionStatus(ConnectionStatus.Connected);

		if (!this.scenariosLoaded) {
			this.sendScenariosRequest();
		}
	}

	onResetRepsonse(data: P.ResetResponse) {
		console.log("Reset!");
	}

	onErrorRepsonse(data: P.ErrorResponse) {
		console.error(data);
		// if (data.error_type == "ScenarioRequestError") {}
	}

	onScenarios(data: P.ScenariosResponse) {
		this.scenariosLoaded = true;
		this.setUnrealConnectionStatus(ConnectionStatus.Connected);
	}

	onActivateTraffic(data: P.ActivateTrafficResponse) {
		this.setUnrealConnectionStatus(ConnectionStatus.Connected);
	}

	onDeactivateTraffic(data: P.DeactivateTrafficResponse) {
		this.setUnrealConnectionStatus(ConnectionStatus.Connected);
	}

	/* Requests */

	sendRequest(data: P.ValidRequests) {
		this.send(data);
	}

	sendPing() {
		let data: P.PingRequest = {
			type: P.Request.Ping,
		};
		this.sendRequest(data);
	}

	sendScenariosRequest() {
		this.scenariosLoaded = false;

		let data: P.ScenariosRequest = {
			type: P.Request.Scenarios,
			language: languageManager.getCurrentLanguage(),
		};
		this.sendRequest(data);
	}

	sendActivateDataset(datasets: string) {
		let data: P.ActivateDatasetRequest = {
			type: P.Request.ActivateDataset,
			datasets,
		};
		this.sendRequest(data);
	}

	sendDeactivateDataset(datasets: string) {
		let data: P.DeactivateDatasetRequest = {
			type: P.Request.DeactivateDataset,
			datasets,
		};
		this.sendRequest(data);
	}

	sendActivateTraffic() {
		let data: P.ActivateTrafficRequest = {
			type: P.Request.ActivateTraffic,
		};
		this.sendRequest(data);
	}

	sendDeactivateTraffic() {
		let data: P.DeactivateTrafficRequest = {
			type: P.Request.DeactivateTraffic,
		};
		this.sendRequest(data);
	}

	sendLight(year: number, month: number, day: number, hour: number) {
		let data: P.LightRequest = {
			type: P.Request.Light,
			year,
			month,
			day,
			solar_time: hour,
		};
		this.sendRequest(data);
	}

	sendMapLight(
		name: string,
		northing: number,
		easting: number,
		height: number,
		color: string,
		typeofmessage: "add" | "update" | "delete",
		enable: boolean
	) {
		let data: P.MapLightRequest = {
			type: P.Request.MapLight,
			name,
			northing,
			easting,
			height,
			color,
			typeofmessage,
			enable,
		};
		this.sendRequest(data);
	}

	sendReset() {
		let data: P.ResetRequest = {
			type: P.Request.Reset,
			misc: "",
		};
		this.sendRequest(data);
	}

	/* Connection establishing */

	reconnectToUnreal() {
		this.pingAttempts = 0;
		this.checkUnrealConnection();
	}

	checkUnrealConnection() {
		if (this.pingAttempts < 3) {
			this.setUnrealConnectionStatus(ConnectionStatus.Connecting);

			this.sendPing();
			this.pingAttempts += 1;
			this.pingTimeout = setTimeout(() => {
				this.checkUnrealConnection();
			}, PING_TIMEOUT);
		} else {
			this.setUnrealConnectionStatus(ConnectionStatus.Disconnected);
			clearTimeout(this.pingTimeout);
		}
	}

	setOmniConnectionStatus(status: ConnectionStatus) {
		if (this.omniConnectionStatus != status) {
			this.omniConnectionStatus = status;
			this.addDebug(`Omni: ${status}`, ColorStr.Gray500);
			this.updateStatusIcons();
		}
	}

	setUnrealConnectionStatus(status: ConnectionStatus) {
		if (this.unrealConnectionStatus != status) {
			this.unrealConnectionStatus = status;
			this.addDebug(`Unreal: ${status}`, ColorStr.Gray500);
			this.updateStatusIcons();
		}
	}

	setupStatusIcons() {
		let size = layout.status.height / 2;
		let x = layout.status.left + size / 2 + 5;
		let y = layout.status.centerY;
		let k = 0.75;

		this.omniIcon = this.scene.add.image(x, y - size / 2, "wifi");
		this.omniIcon.setScale(((256 / 201) * k * size) / this.omniIcon.width);
		this.add(this.omniIcon);

		this.unrealIcon = this.scene.add.image(x, y + size / 2, "unreal");
		this.unrealIcon.setScale(((256 / 256) * k * size) / this.unrealIcon.width);
		this.add(this.unrealIcon);

		this.omniLabel = this.scene.addText({
			x: x + 0.75 * size,
			y: y - size / 2,
			size: 20,
			weight: 600,
		});
		this.omniLabel.setOrigin(0, 0.5);

		this.unrealLabel = this.scene.addText({
			x: x + 0.75 * size,
			y: y + size / 2,
			size: 20,
			weight: 600,
		});
		this.unrealLabel.setOrigin(0, 0.5);
	}

	updateStatusIcons() {
		const statusColor = {
			Disconnected: Color.Red600,
			Connecting: Color.Yellow600,
			Connected: Color.Green600,
		};

		this.omniIcon.setTint(statusColor[this.omniConnectionStatus]);
		this.unrealIcon.setTint(statusColor[this.unrealConnectionStatus]);
		this.omniLabel.setText(this.omniConnectionStatus);
		this.omniLabel.setTint(statusColor[this.omniConnectionStatus]);
		this.unrealLabel.setText(this.unrealConnectionStatus);
		this.unrealLabel.setTint(statusColor[this.unrealConnectionStatus]);

		this.emit(
			"connectionStatus",
			this.omniConnectionStatus,
			this.unrealConnectionStatus
		);
	}

	get isConnectedToSocket() {
		return this.socket && this.socket.readyState == WebSocket.OPEN;
	}

	/* Debug messages */

	addDebug(text: any, color: string) {
		console.log(text);
		if (typeof text !== "string") text = JSON.stringify(text);

		if (text.length > 100) {
			text = text.substring(0, 100) + "...";
		}

		let temp = this.scene.addText({
			size: 28 / 2,
			color,
			text,
		});
		temp.setOrigin(1);
		temp.setStroke("black", 4);
		temp.x = this.scene.W - 10;
		temp.y = 50 / 2;

		this.debugTexts.forEach((text) => {
			text.y += (30 * 1.4) / 2;
		});
		this.debugTexts.push(temp);

		this.scene.tweens.addCounter({
			from: 0,
			to: 1,
			ease: "Linear",
			duration: 10000,
			onUpdate: (tween, targets, key, current, previous, param) => {
				let alpha = Math.min(8 - 8 * current, 2 - temp.y / 100);
				temp.setAlpha(alpha);
			},
			onComplete: () => {
				temp.destroy();
				this.debugTexts.splice(this.debugTexts.indexOf(temp), 1);
			},
		});
	}
}
