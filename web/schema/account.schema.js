define([
    'mongoose',
    'enumerations/accountStatus.enum',
    'schema/libraryCard.schema',
    'schema/book.schema'
], function (mongoose, AccountStatus, BookSchema) {
    'use strict';

    return mongoose.Schema({
        id: String,
        firstName: String,
        lastName: String,
        emailAddress: String,
        userName: {
            type: String,
            required: true,
            index: {
                unique: true
            }
        },
        password: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: AccountStatus
        },
        roles: [{
            type: String,
            enum: ['admin', 'member', 'guest'],
            required: true
        }],
        dateAdded: {
            type: Date
        },
        dateModified: {
            type: Date,
            default: Date.now
        },
        reservations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book'}]
    });
});