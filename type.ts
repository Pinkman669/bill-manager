export interface User {
	id: number;
	email: string;
	password: string;
	image?: string;
	nickname: string;
}

export interface UserHistory{
	nickname: string;
	image: string;
	history: History[];
}

export interface History{
	user_id: number;
	nickname: string;
	amount: number;
	event_id: number;
	record_id: number;
	name: string;
	date: Date;
	type: string;
	due: boolean | null;
	accepted: boolean | null;
}