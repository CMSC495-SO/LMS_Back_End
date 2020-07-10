$(document).ready(function () {
    var _this = {
        baseServiceUrl: window.location.href
    };
    //run code here
    init();


    function init() {
        getElements();
        bindListeners();
        bindSocketListeners();
    }

    function getElements() {
        _this.element = $('.container');
        _this.$libArea = _this.element.find('.lib-container');
        _this.$bookArea = _this.element.find('.book-container');
        _this.$userArea = _this.element.find('.user-container');
    }

    function fetchAndRenderLibrary() {
        $.get(_this.baseServiceUrl + 'lib/library').then(function (response) {
            _this.libData = response;
            _this.$libArea.find('table tbody').empty();
            response.forEach(function (data) {
                _this.$libArea.find('table tbody').append(addLibraryRow(data));
            });
        }, function () {
            _this.$libArea.find('table tbody').empty();
            _this.$libArea.find('table tbody').append('<tr><td colspan="8">No Data Found!</td></tr>');
            throw new Error('No Data Found');
        });
    }

    function fetchAndRenderUsers() {
        $.get(_this.baseServiceUrl + 'lib/library/users').then(function (response) {
            _this.userData = response;
            _this.$userArea.find('table tbody').empty();
            if (!response.length) {
                _this.$userArea.find('table tbody').append('<tr><td colspan="8">No Data Found!</td></tr>');
            }
            response.forEach(function (data) {
                _this.$userArea.find('table tbody').append(addUserRow(data));
            });
        }, function () {
            _this.$userArea.find('table tbody').empty();
            _this.$userArea.find('table tbody').append('<tr><td colspan="8">No Data Found!</td></tr>');
            throw new Error('No Data Found');
        });
    }

    function bindSocketListeners() {
        /*not ready yet, sockets coming in sprint 2*/
    }

    function bindListeners() {
        _this.$libArea.off('click', '.controls .btnReloadLibrary');
        _this.$libArea.on('click', '.controls .btnReloadLibrary', fetchAndRenderLibrary.bind(this));

        _this.element.find('.add-library .btnAdd').off('click');
        _this.element.find('.add-library .btnAdd').on('click', function () {
            var paramObject = {
                title: _this.element.find('.txtName').val(),
                street: _this.$libArea.find('.txtStreet').val(),
                city: _this.$libArea.find('.txtCity').val(),
                state: _this.$libArea.find('.txtState').val(),
                zipCode: _this.$libArea.find('.txtZipCode').val(),
                timestamp: Date.now()
            };

            console.log(paramObject);
            _this.addLibraryName(paramObject);
        });

        _this.$userArea.off('click', '.view-user-section .controls .btnRefreshData');
        _this.$userArea.on('click', '.view-user-section .controls .btnRefreshData', fetchAndRenderUsers.bind(this));

        _this.$userArea.off('click', '.add-user-section div .btnSubmitNewUser');
        _this.$userArea.on('click', '.add-user-section div .btnSubmitNewUser', function () {
            var paramObject = {
                userName: _this.$userArea.find('.userName').val(),
                password: _this.$userArea.find('.password').val(),
                firstName: _this.$userArea.find('.txtFirstName').val(),
                lastName: _this.$userArea.find('.txtLastName').val(),
                emailAddress: _this.$userArea.find('.txtEmail').val(),
                timestamp: Date.now()
            };
            console.log(paramObject);
            _this.addUser(paramObject);
        });

        _this.$userArea.off('focusout', '.check-user-section .txtCheckUserName');
        _this.$userArea.on('focusout', '.check-user-section .txtCheckUserName', function (evt) {
            _this._checkUser({userName: $(evt.target).val()});
        });

        _this.$bookArea.off('click', '.add-book-section div .btnLoadBookDatabase');
        _this.$bookArea.on('click', '.add-book-section div .btnLoadBookDatabase', function () {
            alert('loading disabled, data already in database');
            /*_this.loadBooks();*/
        });

        _this.$bookArea.off('keyup', '.find-book-section div .txtSearchValue');
        _this.$bookArea.on('keyup', '.find-book-section div .txtSearchValue', function (param) {
            if(param.keyCode === 13)
            {
                var searchObject = {
                    val: $(param.target).val() ,
                    by: _this.$bookArea.find('.searchType').val()
                };

                _this.findBook(searchObject);
        

            }
        });
        

        _this.$bookArea.off('click', '.add-book-section div .btnSubmitNewBook');
        _this.$bookArea.on('click', '.add-book-section div .btnSubmitNewBook', function () {
            var paramObject = {
                title: _this.$bookArea.find('.BookTitle').val(),
                lastName: _this.$bookArea.find('.txtLastName').val(),
                firstName: _this.$bookArea.find('.txtFirstName').val(),
                middleInitial: _this.$bookArea.find('.txtMiddleName').val(),
                ISBN: _this.$bookArea.find('.BookISBN').val(),
                subject: _this.$bookArea.find('.BookSubject').val(),
                publisher: _this.$bookArea.find('.BookPublisher').val(),
                language: _this.$bookArea.find('.BookLanguage').val(),
                numberOfPages: _this.$bookArea.find('.BookPages').val(),
                borrowed: _this.$bookArea.find('.BookBorrowed').val(),
                dueDate: _this.$bookArea.find('.BookDueDate').val(),
                price: _this.$bookArea.find('.BookPrice').val(),
                format: _this.$bookArea.find('.BookFormat').val(),
                status: _this.$bookArea.find('.BookStatus').val(),
                dateOfPurchase: _this.$bookArea.find('.BookPurchaseDate').val(),
                publicationDate: _this.$bookArea.find('.BookPublicationDate').val(),
                timestamp: Date.now()
            };
            console.log(paramObject);
            _this.addBook(paramObject);
        });
    }

    _this.findBook = function(param){
        $.get(_this.baseServiceUrl + 'lib/library/book/find', param).then(function(response) {
            console.log(response);
            debugger;
        })
    };

    _this.loadBooks = function() {
        $.get(_this.baseServiceUrl + 'lib/library/book/load').then(function() {
            alert(arguments[0].message);
        })
    };

    _this.addBook = function (param) {
        $.post(_this.baseServiceUrl + 'lib/library/book/add', param).then(function () {
            console.log('success');
        }, function () {
            console.error('failure');
        });
    };

    function addUserRow(data) {
        let row = document.createElement('tr');
        row.classList.add('section');
        $(row).append($(`<td>${data.userName}</td>`));
        $(row).append($(`<td>${data.firstName}</td>`));
        $(row).append($(`<td>${data.lastName}</td>`));
        $(row).append($(`<td>${data.emailAddress}</td>`));
        return row;
    }

    function addLibraryRow(data) {
        let row = document.createElement('tr');
        row.classList.add('section');
        $(row).append($(`<td>${data._id}</td>`));
        $(row).append($(`<td>${data.title}</td>`));
        $(row).append($(`<td>${data.address.street}</td>`));
        return row;
    }

    _this.addLibraryName = function (params) {
        $.post(_this.baseServiceUrl + 'lib/library', params).then(function () {
            console.log('success');
            fetchAndRenderLibrary();
        }, function () {
            console.error('failure');
        });
    };

    _this.addUser = function (params) {
        $.post(_this.baseServiceUrl + 'lib/library/users', params).then(function () {
            fetchAndRenderUsers();
        }, function () {
            console.error('failure');
        })
    };

    _this._checkUser = function (params) {
        $.get(_this.baseServiceUrl + 'lib/library/users/checkUser', params).then(function (res) {
            _this.$userArea.find('.check-user-section .results').text(res.isValid === 0);
        }, function () {
            console.error('failure');
        })
    };

    _this.removeLibraryName = function (params) {
        $.delete(_this.baseServiceUrl + 'lib/library', params).then(function () {
            console.log('success');
            fetchAndRenderLibrary();
        }, function () {
            console.error('failed');
            console.log(arguments);
        });
    }
});