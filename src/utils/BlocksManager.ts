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
		const language = "/?language=" + languageManager.getCurrentLanguage();
		const url = concatUrl(config.OMNI_URL, "/legend", legendKey, language);
		this.sendVariable("SimStad_URL_Left", url + "&orientation=left");
		this.sendVariable("SimStad_URL_Forward", url + "&orientation=up");
		this.sendVariable("SimStad_URL_Right", url + "&orientation=right");
	}

	public setDualLegend(key1: LegendKey, key2: LegendKey) {
		const language = "/?language=" + languageManager.getCurrentLanguage();
		const url = concatUrl(config.OMNI_URL, "/legend", key1, key2, language);
		this.sendVariable("SimStad_URL_Left", url + "&orientation=left");
		this.sendVariable("SimStad_URL_Forward", url + "&orientation=up");
		this.sendVariable("SimStad_URL_Right", url + "&orientation=right");
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
				console.error("Blocks error:", error);
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
