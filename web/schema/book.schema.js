const { Schema } = require("mongoose");

define([
    'mongoose',
    'enumerations/bookFormat.enum',
    'enumerations/bookStatus.enum',
    'schema/author.schema',
    'schema/account.schema'
], function (mongoose, BookFormat, BookStatus, AuthorSchema, AccountSchema) {
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
        _id: Schema.Types.ObjectId,
        checkedOutBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Account'
        }
    });
});