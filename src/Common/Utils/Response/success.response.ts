import { IResponse } from "src/Common"

export const successResponse = <T = any>({
    data,
    message = 'Done',
    statusCode = 200,
}: IResponse = {}): IResponse<T> => { 
    return {message , statusCode , data}
}