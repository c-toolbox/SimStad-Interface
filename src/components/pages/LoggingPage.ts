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
const FONT_SIZE = 24;
const MARGIN = 32;

export class LoggingPage extends Page {
	private title: Phaser.GameObjects.Text;
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

		const background = layout.addRect(scene, layout.panel, Color.Slate800);
		this.add(background);

		this.title = scene.addText({
			x: layout.panelInner.left,
			y: layout.panelInner.top,
			size: 64,
			text: "Message log",
		});
		this.add(this.title);

		this.currentTime = scene.addText({
			x: layout.panelInner.right,
			y: this.title.getBottomCenter().y,
			size: 32,
		});
		this.currentTime.setOrigin(1);
		this.add(this.currentTime);

		/* Scroll area */

		const scrollTop = this.title.getBottomCenter().y + 20;

		this.scrollArea = new ScrollArea(
			scene,
			layout.panelInner.left,
			scrollTop,
			layout.panelInner.width,
			layout.panelInner.bottom - scrollTop,
			0
		);
		this.add(this.scrollArea);

		this.scrollBar = new ScrollBar(
			this.scene,
			layout.panelInner.right + 20,
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
			radius: layout.radius,
			color: Color.Slate900,
		});
		this.add(areaBackground);
		this.sendToBack(areaBackground);
		this.sendToBack(background);

		/* Texts */

		for (let i = 0; i < LOG_LENGTH; i++) {
			const text = scene.addText({
				x: MARGIN,
				size: FONT_SIZE,
				fontFamily: "Lato-Bold",
				color: ColorStr.Slate400,
			});
			text.setOrigin(0, 1);
			text.setStroke("black", 4);

			this.scrollArea.apply(text);
			this.timeTexts.push(text);
		}

		for (let i = 0; i < LOG_LENGTH; i++) {
			const text = scene.addText({
				x: 160,
				size: FONT_SIZE,
				fontFamily: "Lato-Bold",
			});
			text.setOrigin(0, 1);
			text.setStroke("black", 4);

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
