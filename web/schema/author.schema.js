define(['mongoose'], function(mongoose) {
    'use strict';

    return mongoose.Schema({
        firstName: String,
        lastName: String,
        middleInitial: String
    });
});