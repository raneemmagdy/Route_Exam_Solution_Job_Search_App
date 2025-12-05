import { CreateOptions, DeleteResult, HydratedDocument, Model, ModifyResult, MongooseUpdateQueryOptions, PopulateOptions, ProjectionType, QueryOptions, RootFilterQuery, Types, UpdateQuery, UpdateWriteOpResult } from "mongoose";
import { IPagination } from "src/Common";

export abstract class DatabaseRepository<
    TRawDocument,
    TDocument = HydratedDocument<TRawDocument>> {
    constructor(protected model: Model<TDocument>) { }

    async create({
        data,
        options,
    }: {
        data: Partial<TRawDocument>[];
        options?: CreateOptions | undefined;
    }): Promise<TDocument[] | null> {
        return await this.model.create(data, options);
    }

    async findOne({
        filter,
        projection,
        options,
    }: {
        filter?: RootFilterQuery<TRawDocument>,
        projection?: ProjectionType<TRawDocument> | null,
        options?: QueryOptions<TRawDocument>
    }): Promise<TDocument | null> {
        const doc = this.model.findOne(filter, projection, options)
        if (options?.populate) doc.populate(options.populate as PopulateOptions[]);
        return await doc.exec();
    }

    async findById({
        id,
        projection,
        options,
    }: {
        id: Types.ObjectId,
        projection?: ProjectionType<TRawDocument> | null,
        options?: QueryOptions<TRawDocument> | null
    }): Promise<TDocument | null> {
        return await this.model.findById(id, projection, options);
    }

    async updateOne({
        filter,
        update,
        options,
    }: {
        filter: RootFilterQuery<TRawDocument>;
        update: UpdateQuery<TDocument>;
        options?: MongooseUpdateQueryOptions<TDocument> | null;
    }): Promise<UpdateWriteOpResult> {
        return await this.model.updateOne(
            filter,
            {
                ...update,
                $inc: {
                    __v: 1,
                },
            },
            options,
        );
    }
    async updateMany({
        filter,
        update,
        options,
    }: {
        filter: RootFilterQuery<TRawDocument>;
        update: UpdateQuery<TDocument>;
        options?: MongooseUpdateQueryOptions<TDocument> | null;
    }): Promise<UpdateWriteOpResult> {
        return await this.model.updateMany(
            filter,
            {
                ...update,
                $inc: {
                    __v: 1,
                },
            },
            options,
        );
    }
    async findOneAndUpdate({
        filter,
        update,
        options,
    }: {
        filter?: RootFilterQuery<TRawDocument>,
        update?: UpdateQuery<TDocument>,
        options?: QueryOptions<TRawDocument> | null
    }): Promise<TDocument | null> {
        return await this.model.findOneAndUpdate(filter, { ...update, $inc: { __v: 1 } }, { ...options, new: true });
    }
    async findByIdAndUpdate({
        id,
        update,
        options,
    }: {
        id?: Types.ObjectId | any,
        update?: UpdateQuery<TDocument>,
        options?: QueryOptions<TRawDocument> | null
    }): Promise<TDocument | null> {
        return await this.model.findByIdAndUpdate(id, update, { ...options, new: true });
    }
    async findOneAndDelete({
        filter,
        options,
    }: {
        filter: RootFilterQuery<TRawDocument>,
        options: QueryOptions<TRawDocument>
    }): Promise<TDocument | null> {
        return await this.model.findOneAndDelete(filter, { ...options, new: true });
    }
    async findByIdAndDelete({
        id,
        options,
    }: {
        id?: Types.ObjectId,
        options?: QueryOptions<TRawDocument>
    }): Promise<TDocument | null> {
        return await this.model.findByIdAndDelete(id, { ...options, new: true });
    }

    async find({ filter, projection, options }: {
        filter: RootFilterQuery<TRawDocument>,
        projection?: ProjectionType<TRawDocument> | null | undefined,
        options?: QueryOptions<TDocument> | undefined
    }): Promise<
        TDocument[]
        | []
    > {
        const doc = this.model.find(filter || {}, projection, options);
        if (options?.populate) {
            doc.populate(options?.populate as PopulateOptions[]);
        };
        if (options?.skip) {
            doc.skip(options?.skip)
        };
        if (options?.limit) {
            doc.limit(options?.limit)
        };
        if(options?.sort) {
            doc.sort(options?.sort)
        }
        return await doc.exec()
    };

    async deleteOne({
        filter
    }: {
        filter: RootFilterQuery<TRawDocument>;
    }): Promise<DeleteResult> {
        return await this.model.deleteOne(filter);
    }
    async deleteMany({
        filter
    }: {
        filter: RootFilterQuery<TRawDocument>;
    }): Promise<DeleteResult> {
        return await this.model.deleteMany(filter);
    }



    async paginate({
        filter = {},
        projection,
        options = {},
        page = "all",
        limit = 5
    }: {
        filter?: RootFilterQuery<TRawDocument>,
        projection?: ProjectionType<TRawDocument> | null | undefined,
        options?: QueryOptions<TRawDocument> | undefined
        page?: number | "all",
        limit?: number,
    }): Promise<
        TDocument[] 
        | []
        |IPagination<TDocument>

    > {
        let docsCount: number | undefined = undefined;
        let pages: number | undefined = undefined;
        if (page !== "all") {
            page = Math.floor(!page || page < 1 ? 1 : page);
            options.limit = Math.floor(limit < 1 || !limit ? 5 : limit);
            options.skip = (page - 1) * options.limit;
            docsCount = await this.model.countDocuments(filter);
            pages = Math.ceil(docsCount / options.limit);
        }
        const result = await this.find({ filter, projection, options });

        return {
            docsCount,
            limit: options.limit,
            pages,
            currentPage: page !== "all" ? page : undefined,
            result
        }
    };



}