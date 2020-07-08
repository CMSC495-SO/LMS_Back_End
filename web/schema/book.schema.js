define([
    'mongoose',
    'enumerations/bookFormat.enum',
    'enumerations/bookStatus.enum',
    'schema/author.schema'
], function (mongoose, BookFormat, BookStatus, AuthorSchema) {
    'use strict';

    return mongoose.Schema({
        title: String,
        author: {
            type: AuthorSchema,
            required: true
        },
        ISBN: String,
        subject: String,
        publisher: String,
        numberOfPages: Number,
        addedOn: Date,
        statusModifiedOn: Date,
        price: Number,
        format: {
            type: String,
            enum: BookFormat
        },
        status: {
            type: String,
            enum: BookStatus
        },
        dateOfPurchase: Date,
        publicationDate: Date,
        id: String
    });
});