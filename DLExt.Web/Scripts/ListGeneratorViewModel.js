﻿function ListGeneratorViewModel(restServiceUrl) {
    var self = this;

    self.maxMailToLength = 2083;
    self.mailToText = "mailto:";
    self.keyCodeDelete = 46;
    self.keyCodeLeftArrow = 37;
    self.keyCodeRightArrow = 39;

    self.persons = [];
    
    self.filteredPersons = ko.observableArray();
    self.filteredPersonsCount = ko.computed(function () {
        return self.filteredPersons().length;
    });

    self.excludedPersons = ko.observableArray();
    self.personsToExclude = [];
    self.personsToInclude = [];

    self.scrollTop = ko.observable(false);
    self.locations = ko.observableArray();
    self.checkedLocations = ko.observableArray();

    self.checkedLocations.subscribe(function (newLocations) {
        self.excludedPersons.remove(function (person) {
            return newLocations.indexOf(person.location) == -1;
        });
        self.filterByLocation(newLocations);

        if (self.checkedLocationCount() > newLocations.length)
            self.scrollTop(true);
        if (newLocations.length == 0) {
            self.personsToExclude = [];
            self.personsToInclude = [];
        }
        self.checkedLocationCount(newLocations.length);
    });

    self.checkedLocationCount = ko.observable(0);

    self.errorNoPersonsSelected = ko.observable(false);

    self.locationsLoading = ko.observable(true);

    self.isOpen = ko.observable(false);
    self.isMailToPossible = ko.observable(false);
    self.copyToAddressList = ko.observable();
    self.mailToAddressList = ko.observable();

    self.filteredPersonsExist = ko.computed(function () {
        return self.filteredPersons().length > 0;
    });

    self.excludedPersonsExist = ko.computed(function () {
        return self.excludedPersons().length > 0;
    });

    self.filterByLocation = function (locations) {
        var filteredPersons = [];
        for (i in locations) {
            var location = locations[i];
            for (j in self.persons) {
                var person = self.persons[j];
                if (person.location == location) {
                    if (!self.containsPerson(self.excludedPersons(), person)) {
                        filteredPersons.push(person);
                    }
                }
            }
        }

        if (filteredPersons.length > 0)
            self.errorNoPersonsSelected(false);
        self.filteredPersons(filteredPersons.sort(self.stringComparer));
    };

    self.excludePersons = function () {
        var personsToExclude = self.personsToExclude;
        var excludedPersons = self.excludedPersons();
        var filteredPersons = self.filteredPersons();
        var person;

        for (var i = 0; i < personsToExclude.length; i++) {
            person = personsToExclude[i];
            if (!self.containsPerson(excludedPersons, person)) {
                excludedPersons.push(person);
                var index = filteredPersons.indexOf(person);
                delete filteredPersons[index];
            }
        }

        self.excludedPersons(excludedPersons.sort(self.stringComparer));
        self.filteredPersons(self.clearUndefinedFromArray(filteredPersons));

        self.personsToExclude = [];
    };

    self.excludePersonsByKeypress = function (data, event) {
        if (event.keyCode == self.keyCodeDelete ||
            event.keyCode == self.keyCodeRightArrow) {
            self.excludePersons();
        }
        if (event.keyCode == self.keyCodeLeftArrow) {
            self.includePersons();
        }
    };

    self.includePersons = function () {
        var personsToInclude = self.personsToInclude;
        var excludedPersons = self.excludedPersons();
        for (var i = 0; i < personsToInclude.length; i++) {
            var person = personsToInclude[i];
            var index = excludedPersons.indexOf(person);
            delete excludedPersons[index];
        }

        self.excludedPersons(self.clearUndefinedFromArray(excludedPersons).sort(self.stringComparer));

        self.filterByLocation(self.checkedLocations());

        self.personsToInclude = [];
    };

    self.includePersonsByKeypress = function (data, event) {
        if (event.keyCode == self.keyCodeDelete ||
            event.keyCode == self.keyCodeLeftArrow) {
            self.includePersons();
        }

        if (event.keyCode == self.keyCodeRightArrow) {
            self.excludePersons();
        }
    };

    self.containsPerson = function (collection, item) {
        for (index in collection) {
            var collectionItem = collection[index];
            if (collectionItem.id == item.id) {
                return true;
            }
        }

        return false;
    };

    self.generateList = function () {
        var filteredPersons = self.filteredPersons();
        if (self.filteredPersons().length == 0) {
            self.errorNoPersonsSelected(true);
            return;
        }
        self.errorNoPersonsSelected(false);

        var address = "";
        for (index in filteredPersons) {
            var person = filteredPersons[index];
            address += person.email + ';';
        }
        self.isMailToPossible(self.mailToText.length + address.length > self.maxMailToLength);
        self.mailToAddressList(self.mailToText + address);
        self.copyToAddressList(address);
        self.isOpen(true);
    };

    self.getPersonByID = function (id) {
        for (i in self.persons) {
            var person = self.persons[i];
            if (person.id == id)
                return person;
        }
        return null;
    };

    self.stringComparer = function(a, b) {
        return a.name > b.name ? 1 : -1;
    };

    self.clearUndefinedFromArray = function (array) {
        var newArray = [];
        for (index in array) {
            var item = array[index];
            if (item !== undefined)
                newArray.push(item);
        }
        return newArray;
    };

    $.ajax({
        url: restServiceUrl + '/GetData',
        type: 'GET',
        dataType: 'jsonp',
        jsonpCallback: 'getData',
        success: function (data) {
            var locations = [];
            for (i in data) {
                var location = data[i];
                locations.push(location.name);
                for (j in location.persons) {
                    self.persons.push(location.persons[j]);
                }
            }
            self.locations(locations);
            self.locationsLoading(false);
        },
        error: function (data, textStatus, errorThrown) {
            console.log("Error getting data");
            console.log(data);
            console.log(textStatus);
            console.log(errorThrown);
        }
    });
}