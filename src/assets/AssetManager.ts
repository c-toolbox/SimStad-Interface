const assetMap: { [key: string]: { [key: string]: number } } = {
	icons: {
		"icon-eco-challenge": 0,
		"icon-eco-mission": 1,
		"icon-eco-web": 2,
		"icon-food-web": 3,
		"icon-annual-flower": 4,
		"icon-cloud": 5,
		"icon-seeds": 6,
		"icon-grass": 7,
		"icon-pollen": 8,
		"icon-plant-rain": 9,
		"icon-plant-soil": 10,
		"icon-plant-sun": 11,
		"icon-shrub": 12,
		"icon-sun": 13,
		"icon-sun-2": 14,
		"icon-tree-2": 15,
		"icon-tree-3": 16,
		"icon-tree": 17,
		"icon-water": 18,
		"icon-temperature-1": 19,
		"icon-temperature-2": 20,
		"icon-temperature-3": 21,
		"icon-co2-cloud": 22,
		"icon-temperature-4": 23,
		"icon-co2-text": 24,
		"icon-leaf": 25,
		"icon-snow": 26,
		"icon-herb": 27,
		"icon-female-male": 28,
		"icon-info": 29,
		"icon-reset": 30,
		"icon-rotate": 31,
		"icon-speaker": 32,
		"icon-age-dot": 33,
		"icon-back-to-beginning": 34,
		"icon-backward": 35,
		"icon-bookmark-saved": 36,
		"icon-close-dot": 37,
		"icon-dataviz": 38,
		"icon-education": 39,
		"icon-meat": 40,
		"icon-forward": 41,
		"icon-income-dot": 42,
		"icon-info-dot": 43,
		"icon-inspiration": 44,
		"icon-menu-explore": 45,
		"icon-menu": 46,
		"icon-number": 47,
		"icon-play": 48,
		"icon-rotate-dot": 49,
		"icon-save-dot": 50,
		"icon-video-record": 51,
		"icon-menu-flag-en": 52,
		"icon-menu-flag-se": 53,
		"icon-people-boy": 54,
		"icon-people-girl": 55,
		"icon-filter": 56,
		"icon-save": 57,
		"icon-chart-bar": 58,
		"icon-chart-plot": 59,
		"icon-bookmark-selected": 60,
		"icon-bookmark-unselected": 61,
		"icon-favorite": 62,
		"icon-add": 63,
		"icon-arrow-leftwards": 64,
		"icon-arrow-sidewards": 65,
		"icon-arrow-upwards": 66,
		"icon-close": 67,
		"icon-compass": 68,
		"icon-delete-all": 69,
		"icon-location": 70,
		"icon-mat-compose": 71,
		"icon-lock": 72,
		"icon-edit": 73,
	},
};

class AssetManager {
	constructor() {}

	setIconTexture(image: Phaser.GameObjects.Image, iconId: string): void {
		const textureName = "icons";
		const frameIndex = assetMap["icons"][iconId];

		this.setTexture(image, textureName, frameIndex);
	}

	private setTexture(
		image: Phaser.GameObjects.Image,
		textureName: string,
		frameIndex: number
	): void {
		if (image.texture.key != textureName) {
			image.setTexture(textureName);
		}
		image.setFrame(frameIndex);
	}
}

const assetManager: AssetManager = new AssetManager();

export { assetManager };
