/* Protocol types */

export enum Request {
	OmniToken = "token",

	Ping = "PingRequest",
	Scenarios = "ScenariosRequest",
	ActivateDataset = "ActivateDatasetRequest",
	DeactivateDataset = "DeactivateDatasetRequest",
	ActivateTraffic = "ActivateTrafficRequest",
	DeactivateTraffic = "DeactivateTrafficRequest",
	Light = "LightRequest",
	MapLight = "MapLightRequest",
	Reset = "ResetRequest",

	Cache = "GenericRequest",
}

export enum Response {
	OmniConnect = "server_connect",
	OmniDisconnect = "server_disconnect",
	OmniAuthorized = "server_authorized",
	OmniJoin = "server_join",
	OmniLeave = "server_leave",
	OmniError = "server_error",

	Ping = "PingResponse",
	Scenarios = "ScenariosResponse",
	ResetResponse = "ResetResponse",
	ErrorResponse = "ErrorResponse",
	ActivateTraffic = "ActivateTrafficResponse",
	DeactivateTraffic = "DeactivateTrafficResponse",

	CacheProgress = "CacheResponse",
	CacheComplete = "ReCacheDatabaseResponse",
}

/* Omni*/

// Sending token
export interface OmniToken {
	token: string;
}

// Upon connecting successfully
export interface OmniConnect {
	type: Response.OmniConnect;
	message: string;
}

// Upon forced disconnect, such as guests being kicked after host disconnects
export interface OmniDisconnect {
	type: Response.OmniDisconnect;
	message: string;
}

// Upon authorizing successfully
export interface OmniAuthorized {
	type: Response.OmniAuthorized;
	message: string;
}

// Upon new application connecting.
export interface OmniJoin {
	type: Response.OmniJoin;
	role: "host" | "client" | "guest";
	user: string;
}

// Upon application disconnecting.
export interface OmniLeave {
	type: Response.OmniLeave;
	role: "host" | "client" | "guest";
	user: string;
}

// Errors including non-json message sent or invalid token.
export interface OmniError {
	type: Response.OmniError;
	message: string;
}

/* Ping */

export interface PingRequest {
	type: Request.Ping;
}

export interface PingResponse {
	type: Response.Ping;
}

/* Error Repsonse */

export interface ErrorResponse {
	type: Response.ErrorResponse;
	error_type: String;
	message: String;
}

/* All scenarios */
export interface ScenariosRequest {
	type: Request.Scenarios;
	language: String;
}

export interface ScenariosResponse {
	type: Response.Scenarios;
	scenarios: ScenarioData[];
}

export interface ScenarioData {
	title: string;
	sections: {
		label1: string;
		sectionObject: {
			title: string;
			comment: string;
			text1: string;
			text2: string;
			legend1: string;
			legend2: string;
			filenames: string;
			default: string;
			isIdle: string;
			filenameArray: string;
			sectionType: string;
			lat_Lon: {
				x: number;
				y: number;
			};
		}[];
	}[];
}

/* Dataset activation */

export interface ActivateDatasetRequest {
	type: Request.ActivateDataset;
	datasets: string;
}

export interface DeactivateDatasetRequest {
	type: Request.DeactivateDataset;
	datasets: string;
}

/* Traffic activation */

export interface ActivateTrafficRequest {
	type: Request.ActivateTraffic;
}

export interface ActivateTrafficResponse {
	type: Response.ActivateTraffic;
}

export interface DeactivateTrafficRequest {
	type: Request.DeactivateTraffic;
}

export interface DeactivateTrafficResponse {
	type: Response.DeactivateTraffic;
}

/* Time of day */

export interface LightRequest {
	type: Request.Light;
	year: number;
	month: number;
	day: number;
	solar_time: number;
}

/* Spotlight */

export interface MapLightRequest {
	type: Request.MapLight;
	name: string;
	northing: number;
	easting: number;
	height: number;
	color: string;
	typeofmessage: "add" | "update" | "delete";
	enable: boolean;
}

/* Reset */

export interface ResetRequest {
	type: Request.Reset;
	misc: string;
}

export interface ResetResponse {
	type: Response.ResetResponse;
}

/* Database recaching */

export interface CacheRequest {
	type: Request.Cache;
	request: "ReCacheDatabase";
}

export interface CacheProgressResponse {
	type: Response.CacheProgress;
}

export interface CacheCompleteResponse {
	type: Response.CacheComplete;
}

/* All requests*/

export type ValidRequests =
	| OmniToken
	| PingRequest
	| ScenariosRequest
	| ActivateDatasetRequest
	| DeactivateDatasetRequest
	| ActivateTrafficRequest
	| DeactivateTrafficRequest
	| LightRequest
	| MapLightRequest
	| ResetRequest
	| CacheRequest;
