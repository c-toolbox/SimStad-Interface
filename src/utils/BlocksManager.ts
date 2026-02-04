import { contentManager } from "./ContentManager";
import { concatUrl } from "./functions";
import { LegendKey } from "./interfaces";
import { languageManager } from "./LanguageManager";
import { ConnectionStatus, LogType } from "./SocketManager";
import { config } from "@/utils/RuntimeConfig";

class BlocksManager {
	private callbacks: ((message: string, type: LogType) => void)[] = [];
	private blocksConnectionStatus: ConnectionStatus;

	constructor() {
		this.blocksConnectionStatus = ConnectionStatus.Disconnected;
	}

	/* Methods */

	public setDefaultLegend() {
		this.setLegend("default");

		const defaultVideo = contentManager.getDefaultBlocksVideo();
		if (defaultVideo) {
			this.setWallVideo(defaultVideo);
		}
	}

	public setLegend(legendKey: LegendKey) {
		const languageParam = "/?language=" + languageManager.getCurrentLanguage();
		const url = concatUrl(config.OMNI_URL, "legend", legendKey, languageParam);
		this.sendVariable("SimStad_URL", url);
	}

	public setWallVideo(blocksVideoKey: string) {
		this.sendVariable("VisualCity_Video", blocksVideoKey);
	}

	public setBlocksAudio(enabled: boolean) {
		// this.sendTask(
		// 	enabled ? "VisualCity-Wall_PlayAudio" : "VisualCity-Wall_PauseAudio",
		// );
	}

	/* Requests */

	private sendVariable(realmVar: string, value: string) {
		this.sendRequest("/set", { realmVar, value });
	}

	private sendTask(task: string) {
		this.sendRequest("/start", { task });
	}

	private sendRequest(suburl: string, data: object) {
		if (!config.ONLINE) return;
		if (!config.BLOCKS_URL) {
			return console.warn("Missing `BLOCKS_URL` in config.json");
		}

		const url = concatUrl(config.BLOCKS_URL, suburl);
		fetch(url, {
			method: "POST",
			body: JSON.stringify(data),
			headers: {
				"Content-type": "application/json; charset=UTF-8",
			},
		})
			.then((response) => {
				this.blocksConnectionStatus = ConnectionStatus.Connected;
				return response.text();
			})
			.then((text) => this.announce(text, LogType.BlocksReceive))
			.catch((error) => {
				this.blocksConnectionStatus = ConnectionStatus.Disconnected;
				console.error("Blocks connection error:", error);
			});

		this.announce(JSON.stringify(data), LogType.BlocksSend);
	}

	/* Logging */

	subscribe(callback: (message: string, type: LogType) => void) {
		this.callbacks.push(callback);
	}

	announce(message: string, type: LogType) {
		// console.log("Blocks:", message);
		this.callbacks.forEach((callback) => callback(message, type));
	}
}

export const blocksManager: BlocksManager = new BlocksManager();
