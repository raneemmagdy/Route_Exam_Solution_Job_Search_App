export class GetAllResponse<T=any> { 
    result: {
        doc_count?: number,
        pages?: number,
        currentPage?: number | undefined,
        limit?: number,
        result: T[],
    }
}