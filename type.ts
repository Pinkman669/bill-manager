export interface User {
	id: number;
	email: string;
	password: string;
}

export interface UserHistory{
	nickname: string;
	image: string;
	history: History[]
}

export interface History{
	nickname: string;
	amount: number;
	event: string;
	date: Date;
	type: string;
}