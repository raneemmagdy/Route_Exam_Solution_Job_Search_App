export interface IPagination<TDocument> {
    docsCount?: number | undefined,
    limit?: number | undefined,
    currentPage?: number | undefined,
    pages?: number | undefined,
    result: TDocument[] | []
}