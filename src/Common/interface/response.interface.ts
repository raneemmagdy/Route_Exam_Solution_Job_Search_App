export interface IResponse<T=any> {
    message?: string;
    statusCode?: number;
    data?: T
}