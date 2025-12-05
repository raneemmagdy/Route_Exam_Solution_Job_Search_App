import mongoose, { Model, Types, UpdateQuery } from "mongoose";
import { ApplicationDocument, ChatDocument, CompanyDocument, JobDocument, OtpDocument, TokenDocument, UserDocument } from "src/DB";

export const addParanoidHook = (schema: mongoose.Schema, field: string = "deletedAt") => {
    schema.pre(
        ['find', 'findOne', 'countDocuments', 'findOneAndUpdate', 'updateOne'],
        function (next) {
            const query = this.getQuery();
            console.log("parano", { query: query.paranoid });

            if (query.paranoid === false) {
                console.log("Done1");

                this.setQuery({ ...query });
            } else {
                console.log("Done2");
                this.setQuery({ ...query, [field]: { $exists: false } });
            }
            console.log("after", this.getQuery());
            next();
        },
    );
};


type DocumentType = JobDocument | ApplicationDocument | ChatDocument | UserDocument | CompanyDocument | OtpDocument | TokenDocument
export function createCascadeHook<T>(
    schema: mongoose.Schema,
    updateField: string,
    cascadeFn: (id: Types.ObjectId, models: Record<string, mongoose.Model<any>>) => Promise<void>
) {
    schema.pre("updateOne", async function (next) {
        const update = this.getUpdate() as UpdateQuery<T>;
        const trigger = update[updateField];

        if (trigger) {
            const id = this.getQuery()._id;
            const models = this.model.db.models;
            console.log({ models });
            await cascadeFn(id, models);
        }

        next();
    });
}
