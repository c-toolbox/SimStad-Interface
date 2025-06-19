import { BaseScene } from "@/scenes/BaseScene";
import { Color, ColorStr } from "./colors";
import * as P from "./protocol";
import { languageManager } from "./LanguageManager";
import { layoutManager as layout } from "./LayoutManager";
import { ONLINE } from "./constants";

const CLIENT_TOKEN = "29cde70e-155a-4f82-ba0d-d43d69365ee5"; // Production
// const CLIENT_TOKEN = "4c5f9b5c-8991-4053-8662-4d378b124152"; // Testing
const URL = "wss://omni.itn.liu.se/ws/"; // ws://localhost:8000/ws/

const PING_TIMEOUT = 3000;

export enum ConnectionStatus {
	Disconnected = "Disconnected",
	Connecting = "Connecting",
	Connected = "Connected",
}

export enum LogType {
	Status = "Status",
	OmniSend = "OmniSend",
	OmniReceive = "OmniReceive",
	UnrealSend = "UnrealSend",
	UnrealReceive = "UnrealReceive",
	SocketUnhandled = "SocketUnhandled",
	BlocksSend = "BlocksSend",
	BlocksReceive = "BlocksReceive",
	Error = "Error",
}

export class SocketManager extends Phaser.GameObjects.Container {
	private socket: WebSocket;
	private handlers: { [type in P.Response]: (data: any) => void };
	private omniConnectionStatus: ConnectionStatus;
	private unrealConnectionStatus: ConnectionStatus;
	private pingTimeout: NodeJS.Timeout;
	private pingAttempts: number;

	private localTrafficEnabled: boolean;
	private serverTrafficEnabled: boolean;

	private isRecaching: boolean;

	private fadeTween: Phaser.Tweens.Tween;

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
			[P.Response.Layer]: this.onLayerRepsonse,
			[P.Response.Reset]: this.onResetRepsonse,
			[P.Response.LiveTraffic]: this.onLiveTraffic,
			[P.Response.Recache]: this.onRecache,
		};

		this.omniConnectionStatus = ConnectionStatus.Disconnected;
		this.unrealConnectionStatus = ConnectionStatus.Disconnected;
		this.pingAttempts = 0;

		this.localTrafficEnabled = false;
		this.serverTrafficEnabled = false;
		this.isRecaching = false;

		this.debugTexts = [];

		this.setupStatusIcons();
		this.updateStatusIcons();
	}

	connect(): void {
		if (!ONLINE) return;

		this.socket = new WebSocket(URL);

		this.socket.onopen = () => {
			this.addLog("WebSocket: Open", LogType.Status);
			this.setOmniConnectionStatus(ConnectionStatus.Connecting);
		};

		this.socket.onclose = () => {
			this.addLog("WebSocket: Closed", LogType.Status);
			this.setOmniConnectionStatus(ConnectionStatus.Disconnected);
		};

		this.socket.onerror = (event: Event) => {
			this.addLog("WebSocket: " + event, LogType.Error);
		};

		this.socket.onmessage = (event: MessageEvent) => {
			this.receive(JSON.parse(event.data));
		};
	}

	send(data: object, isOmni = false) {
		if (!ONLINE) return;

		if (this.isConnectedToSocket) {
			this.socket.send(JSON.stringify(data));

			if (isOmni) this.addLog(data, LogType.OmniSend);
			else this.addLog(data, LogType.UnrealSend);
		} else {
			console.warn("Cannot send. Socket is closed.");
			this.addLog(data, LogType.Error);
			this.announceOffline();
		}
	}

	receive(data: any) {
		if (data.type) {
			const handler = this.handlers[data.type as P.Response];
			if (handler) {
				if (data.type.startsWith("server_"))
					this.addLog(data, LogType.OmniReceive);
				else this.addLog(data, LogType.UnrealReceive);

				handler.call(this, data);
				this.emit(data.type, data);
				return;
			}
		}

		this.addLog(data, LogType.SocketUnhandled);
	}

	/* Response handlers */

	onOmniConnect(data: P.OmniConnect) {
		this.send({ token: CLIENT_TOKEN }, true);
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
		this.addLog(data.message, LogType.Error);
	}

	onPing(data: P.PingResponse) {
		clearTimeout(this.pingTimeout);
		this.pingAttempts = 0;
		this.setUnrealConnectionStatus(ConnectionStatus.Connected);
	}

	onResetRepsonse(data: P.ResetResponse) {}

	onLayerRepsonse(data: P.LayerResponse) {
		this.setUnrealConnectionStatus(ConnectionStatus.Connected);
	}

	onLiveTraffic(data: P.LiveTrafficResponse) {
		this.serverTrafficEnabled = data.active;
		this.emit("serverTrafficEnabled", data.active);
		if (data.active != this.localTrafficEnabled) {
			this.sendLiveTraffic(this.localTrafficEnabled);
		}
		this.setUnrealConnectionStatus(ConnectionStatus.Connected);
	}

	onRecache(data: P.RecacheResponse) {
		clearTimeout(this.pingTimeout);
		this.pingAttempts = 0;
		this.setUnrealConnectionStatus(ConnectionStatus.Connected);

		if (data.index + 1 < data.max) {
			this.isRecaching = true;
			this.emit("onRecacheProgress", data.index + 1, data.max);
		} else {
			this.isRecaching = false;
			this.emit("onRecacheComplete");
		}
	}

	/* Requests */

	sendRequest(data: P.ValidRequests) {
		this.send(data);
	}

	sendReset() {
		let data: P.ResetRequest = {
			type: P.Request.Reset,
			misc: "",
		};
		this.sendRequest(data);

		this.emit("movieEnabled", false);
	}

	sendPing() {
		let data: P.PingRequest = {
			type: P.Request.Ping,
		};
		this.sendRequest(data);
	}

	sendLayers(layers: P.LayerRequestData[]) {
		let data: P.LayerRequest = {
			type: P.Request.Layer,
			layers: layers,
		};
		this.sendRequest(data);
	}

	sendLiveTraffic(active: boolean) {
		if (!this.localTrafficEnabled) {
			let data: P.LiveTrafficRequest = {
				type: P.Request.LiveTraffic,
				active,
			};
			this.sendRequest(data);
		}
		this.localTrafficEnabled = active;
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

	sendRecacheRequest(path: string = "Datasets/") {
		this.isRecaching = true;

		let data: P.RecacheRequest = {
			type: P.Request.Recache,
			path,
		};
		this.sendRequest(data);
	}

	/* Time settings */

	private setHour(value: number) {
		let hour = (23 + 59 / 60) * value;
		this.sendLight(2024, 7, 1, hour);
	}

	fadeLight(callback: () => void, fadeDuration = 1000) {
		this.scene.addEvent(fadeDuration / 2, () => {
			callback();
		});

		this.fadeTween = this.scene.tweens.addCounter({
			from: 0,
			to: 1,
			duration: fadeDuration,
			onUpdate: (tween, target, key, current) => {
				// let t = Math.abs(1 - current);
				// let ease = 1 - Phaser.Math.Easing.Cubic.In(t);
				let ease = Phaser.Math.Easing.Quadratic.InOut(current);
				this.setHour((0.5 + 1.0 * ease) % 1);
			},
		});
	}

	get lightAvailable() {
		return !(this.fadeTween && this.fadeTween.isPlaying());
	}

	/* Connection establishing */

	reconnectToUnreal() {
		this.pingAttempts = 0;
		this.checkUnrealConnection();
	}

	checkUnrealConnection() {
		if (this.pingAttempts < 10) {
			this.setUnrealConnectionStatus(ConnectionStatus.Connecting);

			this.sendPing();
			this.pingAttempts += 1;

			clearTimeout(this.pingTimeout);
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
			this.addLog(`Omni: ${status}`, LogType.Status);
			this.updateStatusIcons();

			if (this.omniConnectionStatus == ConnectionStatus.Disconnected) {
				this.announceOffline();
			}
		}
	}

	setUnrealConnectionStatus(status: ConnectionStatus) {
		if (this.unrealConnectionStatus != status) {
			this.unrealConnectionStatus = status;
			this.addLog(`Unreal: ${status}`, LogType.Status);
			this.updateStatusIcons();

			if (this.unrealConnectionStatus == ConnectionStatus.Connected) {
				this.emit("reconnect");
			}

			if (this.unrealConnectionStatus == ConnectionStatus.Disconnected) {
				this.announceOffline();
			}
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
			size: layout.margin / 4,
			weight: 600,
		});
		this.omniLabel.setOrigin(0, 0.5);

		this.unrealLabel = this.scene.addText({
			x: x + 0.75 * size,
			y: y + size / 2,
			size: layout.margin / 4,
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

		const showOmni = this.omniConnectionStatus != ConnectionStatus.Connected;
		const showUnreal =
			this.unrealConnectionStatus != ConnectionStatus.Connected;
		this.omniIcon.setVisible(showOmni);
		this.omniLabel.setVisible(showOmni);
		this.unrealIcon.setVisible(showUnreal);
		this.unrealLabel.setVisible(showUnreal);

		this.emit(
			"connectionStatus",
			this.omniConnectionStatus,
			this.unrealConnectionStatus
		);
	}

	announceOffline() {
		this.emit("serverTrafficEnabled", false);
	}

	get isConnectedToSocket() {
		return this.socket && this.socket.readyState == WebSocket.OPEN;
	}

	get isConnectedToUnreal() {
		return (
			ONLINE &&
			this.isConnectedToSocket &&
			this.omniConnectionStatus == ConnectionStatus.Connected &&
			this.unrealConnectionStatus == ConnectionStatus.Connected
		);
	}

	/* Debug messages */

	addLog(text: any, type: LogType) {
		if (typeof text === "object" && text.token) text.token = "TOKEN";
		if (typeof text !== "string") text = JSON.stringify(text);
		this.emit("log", text, type);
		console.log(text);
	}
}
