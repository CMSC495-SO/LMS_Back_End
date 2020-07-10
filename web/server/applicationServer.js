define([
    'fs',
    'mongoose',
    'schema/library.schema',
    'schema/book.schema',
    'models/accountModel'
], function (fs, mongoose, librarySchema, bookSchema, AccountModel) {
    'use strict';
    const bookJSON = JSON.parse(fs.readFileSync('sampleData.json', 'utf-8'));

    var applicationServer = {
        options: {
            baseServicePath: '/lib/library'
        }
    };

    function checkFunction(cb, type) {
        return !cb || typeof cb !== type;
    }

    applicationServer.init = function (appReference, ioReference, options) {
        this.initializeModels();

        if (checkFunction(appReference, 'function')) {
            throw new Error('Application Reference was not passed as an argument.')
        }

        if (checkFunction(ioReference, 'object')) {
            throw new Error('Socket reference was not passed as an argument.');
        }

        this.appReference = appReference;
        this.ioReference = ioReference;

        if (options && options !== null) {
            this.options = Object.assign(this.options, options);
        }
        this.registerEvents();
        this.registerRoutes();
    };

    applicationServer.registerEvents = function () {
        if (checkFunction(this.ioReference, 'object')) {
            throw new Error("UNINITIALIZED ERROR: Controller not initialized.");
        }

        this.ioReference.on('library-added', function () {});
    };

    applicationServer.registerRoutes = function () {
        let context = this;
        // setting the servicePaths
        //get requests
        this.appReference.get(this.options.baseServicePath, context.getLibrary.bind(this));
        this.appReference.get(this.options.baseServicePath + '/users', context.getUsers.bind(this));
        this.appReference.get(this.options.baseServicePath + '/users/checkUser', context.checkUserNameInUse.bind(this));
        this.appReference.get(this.options.baseServicePath + '/books', context.getBooks.bind(this));
        this.appReference.get(this.options.baseServicePath + '/book/find', context.findBook.bind(this));
        /*this.appReference.get(this.options.baseServicePath + '/book/load', context.loadBooks.bind(this));*/

        //post requests
        this.appReference.post(this.options.baseServicePath, context.addNewLibrary.bind(this));
        this.appReference.post(this.options.baseServicePath + '/login', context.loginUser.bind(this));
        this.appReference.post(this.options.baseServicePath + '/users', context.addUser.bind(this));
        this.appReference.post(this.options.baseServicePath + '/book/add', context.addBook.bind(this));

        //put requests
        //this.appReference.put();

        //delete requests
        this.appReference.delete(this.options.baseServicePath + '/delete/:id', async (req, res) => {
            context.deleteLibrary(req, res);
        });
    };

    applicationServer.initializeModels = function () {
        this.Library = mongoose.model('Library', librarySchema);
        this.Account = AccountModel;
        this.Book = mongoose.model('Book', bookSchema);
    };

    applicationServer.loadBooks = async function (data, res) {
        let properties = {
            message: 'books added',
            status: '200'
        }, promises = [];

        try {
            bookJSON.data.forEach((dataItem) => {
                let entry = {
                    title: dataItem.title,
                    ISBN: dataItem.ISBN,
                    author: {
                        firstName: dataItem.firstName || '',
                        lastName: dataItem.lastName || '',
                        middleInitial: dataItem.middleInitial || ''
                    },
                    format: dataItem.format,
                    subject: dataItem.subject,
                    publisher: dataItem.publisher,
                    numberOfPages: dataItem.numberOfPages,
                    addedOn: new Date(),
                    statusModifiedOn: new Date(),
                    price: dataItem.price,
                    status: 'available',
                    dateOfPurchase: dataItem.dateOfPurchase,
                    publicationDate: dataItem.publicationDate
                };
                let book = new this.Book(entry);

                promises.push(book.save());
            });
            await Promise.all(promises);
            res.json(properties);
        } catch (ex) {
            properties.status = 500;
            properties.message = 'error occured: failed to add books not added';
            res.json(properties);
            console.error(ex);
        }
    };

    applicationServer.addNewLibrary = async function (data, res) {
        var entry = {
            title: data.body.title,
            dateAdded: data.body.timestamp,
            address: {
                street: data.body.street,
                city: data.body.city,
                state: data.body.state,
                zipCode: data.body.zipCode
            },
            dateModified: data.body.timestamp
        };

        try {
            let lib = new this.Library(entry);
            await lib.save();
            this.ioReference.emit('library-added', entry);
            res.sendStatus(200);
        } catch (ex) {
            res.sendStatus(500);
            console.error(ex);
        }
    };

    applicationServer.deleteLibrary = function (data, res) {
        this.Library.deleteOne(data, function (err) {
            if (err) {
                res.sendStatus(500);
            }
            res.sendStatus(200);
        });
    };

    applicationServer.getUsers = function (data, res) {
        this.Account.find({}, (error, accounts) => {
            res.send(accounts);
        });
    };

    applicationServer.getBooks = function (data, res) {
        this.Book.find({}, (error, books) => {
            res.send(books);
        });
    };

    applicationServer.findBook = function (data, res){
        let query = {}, allowableQueries = ['title', '_id'];
        if (allowableQueries.indexOf(data.query.by) === -1){
            res.status(402).send('Invalid search type!');
            return;
        }

        query[data.query.by]=data.query.val;
        this.Book.find(query, (error, book) => {
            res.send(book);
        });
    };

    applicationServer.getLibrary = function (data, res) {
        this.Library.find({}, (error, libraries) => {
            res.send(libraries);
        });
    };

    applicationServer.addUser = async function (data, res, next) {
        let entry = Object.assign(data.body, {
            dateAdded: data.body.timestamp,
            dateModified: data.body.timestamp
        });

        try {
            let account = new this.Account(entry);
            await account.save(function (err) {
                if (err) {
                    throw err;
                }
                res.json({status:200, message: 'User added successfully.'});
            });
        } catch (ex) {
            res.json({status:203, message: 'An error has been found'});
            next(ex);
            console.error(ex);
        }
    };

    applicationServer.loginUser = function (data, res) {
        let toCheck = data.body.params, resObject = {
            matched: false,
            message: ''
        };

        if (!toCheck.userName || !toCheck.password) {
            resObject.message = 'User name or password not provided!';
            res.json(resObject);
            return;
        }
        this.Account.findOne({userName: toCheck.userName}, function (err, account) {
            if (err) {
                res.json(resObject);
                /*todo: update resObject with failure message: something like could not find user*/
                throw err;
            }

            if (!account) {
                resObject.message = 'No account found for userName: ' + toCheck.userName;
                res.json(resObject);
                return;
            }

            account.comparePassword(toCheck.password, function (err, isMatch) {
                if (err) {
                    /*todo: update resObject with failure message: something like could not find user*/
                    res.json(resObject);
                    throw err;
                }
                resObject.user = {
                    userName: account.userName,
                    firstName: account.firstName,
                    lastName: account.lastName,
                    emailAddress: account.emailAddress,
                    reservations: account.reservations || [],
                    createdOn: account.dateAdded,
                    modifiedOn: account.dateModified
                };
                resObject.matched = isMatch;
                res.json(resObject);
            })
        });
    };

    applicationServer.checkUserNameInUse = function (data, res) {
        let searchFor = data.query;
        this.Account.find(searchFor, function (err, user) {
            if (err) {
                throw err;
            }

            res.json({isValid: user.length});
        });
    };

    applicationServer.addBook = async function (data, res){
        var entry = {
            title: data.body.title,
            ISBN: data.body.ISBN,
            author: {
                firstName: data.body.firstName || '',
                lastName: data.body.lastName || '',
                middleInitial: data.body.middleInitial || ''
            },
            format: data.body.format,
            subject: data.body.subject,
            publisher: data.body.publisher,
            numberOfPages: data.body.numberOfPages,
            addedOn: new Date(),
            statusModifiedOn: new Date(),
            price: data.body.price,
            status: 'available',
            dateOfPurchase: data.body.dateOfPurchase,
            publicationDate: data.body.publicationDate
        }, properties = {
            message: 'book added',
            status: '200'
        };

        try {
            let book = new this.Book(entry);
            await book.save();
            this.ioReference.emit('book-added', entry);
            res.json(properties);
        } catch (ex) {
            properties.status = 500;
            properties.message = 'error occured: book not added';
            res.json(properties);
            console.error(ex);
        }
    }

    return applicationServer;
});