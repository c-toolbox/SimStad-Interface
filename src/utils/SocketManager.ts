export class SocketManager extends Phaser.GameObjects.Container {
	private socket: WebSocket;

	constructor(scene: Phaser.Scene) {
		super(scene, 0, 0);
	}

	connect(): void {
		const clientToken = "29cde70e-155a-4f82-ba0d-d43d69365ee5";
		const url = `wss://omni.itn.liu.se/ws/`;
		// const url = `ws://localhost:8000/ws/`;

		this.socket = new WebSocket(url);

		this.socket.onopen = () => {
			this.emit("debug", "Connected");
			this.send({ token: clientToken });
		};

		this.socket.onclose = () => {
			this.emit("debug", "Disconnected");
		};

		this.socket.onerror = (event: Event) => {
			console.warn(event);
		};

		this.socket.onmessage = (event: MessageEvent) => {
			this.emit("debug", event.data);
			this.emit("message", JSON.parse(event.data));
		};
	}

	send(data: object) {
		this.emit("debug", JSON.stringify(data));
		return;

		if (!this.socket || this.socket.readyState != WebSocket.OPEN) {
			console.warn("Socket is closed");
		}

		this.socket.send(JSON.stringify(data));
	}

	/* Methods */

	sendPingRequest() {
		console.log(this);
		this.send({
			type: "PingRequest",
		});
	}

	sendScenariosRequest() {
		this.send({
			type: "ScenariosRequest",
		});
	}

	sendLightRequest(year: number, month: number, day: number, hour: number) {
		this.send({
			type: "LightRequest",
			year,
			month,
			day,
			Solar_Time: hour,
		});
	}
}
