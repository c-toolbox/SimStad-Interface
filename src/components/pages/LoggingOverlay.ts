import { BaseScene } from "@/scenes/BaseScene";
import { LogType, SocketManager } from "@/utils/SocketManager";
import { Page, PageState } from "./Page";
import { layoutManager as layout } from "@/utils/LayoutManager";
import { Color, ColorStr } from "@/utils/colors";
import { ScrollArea } from "../elements/ScrollArea";
import { ScrollBar } from "../elements/ScrollBar";
import { RoundRectangle } from "../elements/RoundRectangle";
import { blocksManager } from "@/utils/BlocksManager";

const LOG_LENGTH = 200;
const FONT_SIZE = 16;
const MARGIN = 16;

export class LoggingOverlay extends Page {
	private currentTime: Phaser.GameObjects.Text;
	private scrollArea: ScrollArea;
	private scrollBar: ScrollBar;

	private queuedMessages: { text: string; type: LogType }[] = [];
	private timeTexts: Phaser.GameObjects.Text[] = [];
	private logTexts: Phaser.GameObjects.Text[] = [];

	private lastMessageType: string = "";

	constructor(scene: BaseScene, state: PageState, socket: SocketManager) {
		super(scene, state, socket);

		this.socket.on("log", this.queueMessage, this);
		blocksManager.subscribe((message: string, type: LogType) =>
			this.queueMessage(message, type)
		);

		/* Layout */

		this.currentTime = scene.addText({
			x: layout.map.right,
			y: layout.map.top,
			size: 32,
		});
		this.currentTime.setOrigin(1);
		this.add(this.currentTime);

		/* Scroll area */

		this.scrollArea = new ScrollArea(
			scene,
			layout.map.left,
			layout.map.top,
			layout.map.width,
			layout.map.height
		);
		this.add(this.scrollArea);

		this.scrollBar = new ScrollBar(
			this.scene,
			layout.map.right + 20,
			this.scrollArea.y + this.scrollArea.height / 2,
			10,
			this.scrollArea.height - 32
		);
		this.add(this.scrollBar);

		let areaBackground = new RoundRectangle(scene, {
			x: this.scrollArea.centerX,
			y: this.scrollArea.centerY,
			width: this.scrollArea.width,
			height: this.scrollArea.height,
			color: Color.Slate900,
			radius: 0,
		});
		this.add(areaBackground);
		this.sendToBack(areaBackground);

		/* Texts */

		for (let i = 0; i < LOG_LENGTH; i++) {
			const text = scene.addText({
				x: MARGIN,
				size: FONT_SIZE,
				fontFamily: "Lato-Bold",
				color: ColorStr.Slate400,
			});
			text.setOrigin(0, 1);

			this.scrollArea.apply(text);
			this.timeTexts.push(text);
		}

		for (let i = 0; i < LOG_LENGTH; i++) {
			const text = scene.addText({
				x: 100,
				size: FONT_SIZE,
				fontFamily: "Lato-Bold",
			});
			text.setOrigin(0, 1);

			this.scrollArea.apply(text);
			this.logTexts.push(text);
		}
	}

	update(time: number, delta: number) {
		super.update(time, delta);

		this.scrollArea.update(time, delta);
		this.scrollBar.set(this.scrollArea.getScroll());
		this.currentTime.setText(this.timestamp);

		while (this.queuedMessages.length > 0) {
			const message = this.queuedMessages.shift()!;
			this.addMessage(message.text, message.type);
		}
	}

	queueMessage(message: string, type: LogType) {
		this.queuedMessages.push({ text: message, type: type });
	}

	addMessage(message: string, type: LogType) {
		// Skip repeated requests
		let repeatedType = false;
		const typeMatch = message.match(/"type":"(.*?)"/);
		if (typeMatch) {
			const extractedType = typeMatch[1];
			if (extractedType == this.lastMessageType) {
				repeatedType = true;
			}
			this.lastMessageType = extractedType;
		} else {
			this.lastMessageType = "";
		}

		// Bring oldest message to front
		if (!repeatedType) {
			this.timeTexts.push(this.timeTexts.shift()!);
			this.logTexts.push(this.logTexts.shift()!);
		}
		const timeText = this.timeTexts[this.timeTexts.length - 1];
		const logText = this.logTexts[this.logTexts.length - 1];

		if (repeatedType) {
			const match = logText.text.match(/\(x(\d+)\) \{"type":/);
			let count = 2;
			if (match) count = parseInt(match[1]) + 1;

			message = message.replace(/\{/, `(x${count}) {`);
		}

		// Set text and color
		timeText.setText(`[${this.timestamp}]`);
		logText.setText(this.styleMessage(message, type));
		logText.setColor(this.getColor(type));

		// Update y positions
		for (let i = 0; i < this.logTexts.length; i++) {
			const y = 1.5 * FONT_SIZE * i + 2 * MARGIN;
			this.logTexts[i].y = y;
			this.timeTexts[i].y = y;
		}

		// Scroll to bottom
		const y = -logText.y - logText.height + this.scrollArea.height - 2 * MARGIN;
		this.scrollArea.updateSize(false);
		this.scrollArea.setScrollY(y);
	}

	styleMessage(message: string, type: LogType): string {
		switch (type) {
			case LogType.Status:
				return message;
			case LogType.OmniSend:
				return `O>  ${message}`;
			case LogType.OmniReceive:
				return `O<  ${message}`;
			case LogType.UnrealSend:
				return `U>  ${message}`;
			case LogType.UnrealReceive:
				return `U<  ${message}`;
			case LogType.SocketUnhandled:
				return `U?  ${message}`;
			case LogType.BlocksSend:
				return `B>  ${message}`;
			case LogType.BlocksReceive:
				return `B<  ${message}`;
			case LogType.Error:
				return `!  ${message}`;

			default:
				return message;
		}
	}

	getColor(type: LogType): string {
		switch (type) {
			case LogType.Status:
				return ColorStr.White;
			case LogType.OmniSend:
				return ColorStr.Yellow700;
			case LogType.OmniReceive:
				return ColorStr.Yellow500;
			case LogType.UnrealSend:
				return ColorStr.Blue700;
			case LogType.UnrealReceive:
				return ColorStr.Blue500;
			case LogType.SocketUnhandled:
				return ColorStr.Blue300;
			case LogType.BlocksSend:
				return ColorStr.Pink700;
			case LogType.BlocksReceive:
				return ColorStr.Pink500;
			case LogType.Error:
				return ColorStr.Red600;

			default:
				return ColorStr.White;
		}
	}

	get timestamp(): string {
		return new Date().toLocaleTimeString("sv-SE");
	}
}
