export interface webhookPropsTypes {
    userId:string,
    amount:number,
    token:number
}

export enum paymentStatus {
    Success,
    Failure,
    Processing
}