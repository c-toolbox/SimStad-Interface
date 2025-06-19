/* Protocol types */

export enum Request {
	OmniToken = "token",

	Ping = "PingRequest",
	Layer = "LayerRequest",
	LiveTraffic = "LiveTrafficRequest",
	Light = "LightRequest",
	MapLight = "MapLightRequest",
	Reset = "ResetRequest",
	Recache = "RecacheRequest",
}

export enum Response {
	OmniConnect = "server_connect",
	OmniDisconnect = "server_disconnect",
	OmniAuthorized = "server_authorized",
	OmniJoin = "server_join",
	OmniLeave = "server_leave",
	OmniError = "server_error",

	Ping = "PingResponse",
	Layer = "LayerResponse",
	Reset = "ResetResponse",
	LiveTraffic = "LiveTrafficResponse",
	Recache = "RecacheResponse",
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

/* Data layer activation */

export interface LayerRequestData {
	type: "image" | "flow" | "movie" | "color" | "base64";
	name: string;
	opacity?: number;
	lit?: boolean;
	flow?: {
		texture: string;
	};
	movie?: {
		speed: number;
	};
}

export interface LayerRequest {
	type: Request.Layer;
	layers: LayerRequestData[];
}

export interface LayerResponse {
	type: Response.Layer;
	name: string;
	error?: string;
}

/* Traffic activation */

export interface LiveTrafficRequest {
	type: Request.LiveTraffic;
	active: boolean;
}

export interface LiveTrafficResponse {
	type: Response.LiveTraffic;
	active: boolean;
	error?: string;
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
	type: Response.Reset;
}

/* Database recaching */

export interface RecacheRequest {
	type: Request.Recache;
	path: string;
}

export interface RecacheResponse {
	type: Response.Recache;
	index: number;
	max: number;
}

/* All requests*/

export type ValidRequests =
	| OmniToken
	| PingRequest
	| LayerRequest
	| LiveTrafficRequest
	| LightRequest
	| MapLightRequest
	| ResetRequest
	| RecacheRequest;
