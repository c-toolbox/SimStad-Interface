import swedishLocales from "@/assets/locales/sv_SE.json";
import englishLocales from "@/assets/locales/en_GB.json";
import { scenarioManager } from "./ScenarioManager";

export enum LanguageKey {
	English = "en-GB",
	Swedish = "sv-SE",
}

interface BoundObject {
	key: string;
	previous: string;
	callback?: () => void;
}

interface LocalesMap {
	[key: string]: string;
}

class LanguageManager {
	private languageData: Map<LanguageKey, LocalesMap>;
	private currentLanguage: LanguageKey;
	private boundObjects: Map<Phaser.GameObjects.Text, BoundObject>;

	constructor() {
		this.languageData = new Map();
		this.currentLanguage = LanguageKey.Swedish;
		this.boundObjects = new Map();

		this.setupLanguageData(swedishLocales, englishLocales);
		this.checkLanguageData();
	}

	// Load data from imported jsons
	setupLanguageData(
		swedishLocales: LocalesMap,
		englishLocales: LocalesMap
	): void {
		swedishLocales = Object.assign({}, swedishLocales);
		englishLocales = Object.assign({}, englishLocales);

		scenarioManager.fetchLanguageData(swedishLocales, englishLocales);

		this.languageData.clear();
		this.languageData.set(LanguageKey.Swedish, swedishLocales);
		this.languageData.set(LanguageKey.English, englishLocales);

		// Add empty "" -> "" to locales to allow empty strings
		this.languageData.forEach((locales: LocalesMap, key: LanguageKey) => {
			locales[""] = "";
		});
	}

	// Check that all language keys are shared
	checkLanguageData(): void {
		let keyMap: { [key: string]: number } = {};

		// Count the number of occurrences of phrases in all languages
		this.languageData.forEach((locales: LocalesMap, key: LanguageKey) => {
			for (const key in locales) {
				keyMap[key] = 1 + (keyMap[key] || 0);
			}
		});

		// Find phrases that don't exist in all locales
		for (let key in keyMap) {
			if (keyMap[key] != 2) {
				console.error(`Phrase not found in all languages: ${key}`);
			}
		}
	}

	// Change language
	setLanguage(language: LanguageKey): void {
		console.assert(this.languageData.get(language), "Language not available.");
		if (this.currentLanguage != language) {
			this.currentLanguage = language;
			this.updateAllObjects();
		}
	}

	getCurrentLanguage(): LanguageKey {
		return this.currentLanguage;
	}

	// Return key-mapped phrase of current selected language
	get(key: string, required: boolean = true): string {
		let text = this.languageData.get(this.currentLanguage)![key];
		console.assert(
			!required || text != null,
			`Phrase not found in ${this.currentLanguage}: '${key}'`
		);
		if (text) {
			if (text.includes("\\")) {
				console.warn(text);
			}
			text = text.replace(/\\\\/g, "\\");
		}
		return text;
	}

	// Bind a text-object to a phrase with automatic updates upon language change
	bind(
		textObject: Phaser.GameObjects.Text,
		key: string,
		callback?: () => void
	): void {
		// Remove old instance (usually when phrase is changed)
		this.unbind(textObject);

		this.boundObjects.set(textObject, { key, previous: "", callback });
		this.updateObject(textObject);
	}

	// Remove text-object from list of automatic text updates
	unbind(textObject: Phaser.GameObjects.Text): void {
		this.boundObjects.delete(textObject);
	}

	// Update text in all bound text-objects
	updateAllObjects(): void {
		this.boundObjects.forEach(
			(value: BoundObject, key: Phaser.GameObjects.Text) => {
				this.updateObject(key);
			}
		);
	}

	// Set text in a text-object to match its key in the current language
	updateObject(textObject: Phaser.GameObjects.Text): void {
		if (this.boundObjects.has(textObject)) {
			let blob = this.boundObjects.get(textObject)!;

			if (textObject.scene === undefined) {
				console.warn("Attempting to update destroyed object:", blob.key);
				this.unbind(textObject);
				return;
			}

			// Check that the text remains the same.
			let phraseCheck = blob.previous == "" || blob.previous == textObject.text;
			console.assert(
				phraseCheck,
				`Phrase has changed since last bind. '${blob.key}': '${blob.previous}' != '${textObject.text}'`
			);

			let newText = this.get(blob.key);
			textObject.setText(newText);
			blob.previous = newText;

			if (blob.callback) {
				blob.callback();
			}
		}
	}

	getDate(date: Date) {
		return date.toLocaleString(this.currentLanguage, {
			month: "short",
			day: "numeric",
		});
	}

	getHour(date: Date) {
		return date.toLocaleString(this.currentLanguage, {
			hour: "numeric",
			minute: "numeric",
		});
	}
}

const languageManager: LanguageManager = new LanguageManager();

export { languageManager };
