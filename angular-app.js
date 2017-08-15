  var app = angular.module('booktips', ['ngMaterial']);

  app.config(function($mdThemingProvider) {
    $mdThemingProvider.theme('dark-grey').backgroundPalette('grey').dark();
    $mdThemingProvider.theme('blue').primaryPalette('blue');
  });

  app.controller('bookSearchController', ['$scope', '$q', '$element', '$http', '$mdDialog', bookSearchController]);

  function bookSearchController ($scope, $q, $element, $http, $mdDialog) {

    $scope.serverName = 'http://localhost:3002/';
    $scope.queryText = '';
    $scope.suggestions = [];
    $scope.numColumns = 4;
    $scope.dummyArr = [];
    $scope.books = [];
    $scope.defaultTheme = 'dark-grey';
    //prepare view columns
    for(var i = 0; i < $scope.numColumns; i++){
      $scope.dummyArr.push(i);
      $scope.books.push(new Array());
    }

    $scope.querySearch = function(query) {
      if(!$scope.queryText || !$scope.queryText.trim())
        return;
      var deferred = $q.defer();
      $http.get($scope.serverName+'getBooksByName?bookName='+query).then(function(response){
        var titlesOnly = [];
        for(var i = 0; i < response.data.length; i++)
          titlesOnly.push(response.data[i].title);
        deferred.resolve( titlesOnly );
      });
      $scope.suggestions = deferred.promise;
    };

    $scope.selectedItemChange = function(query) {
      $scope.queryText = query;
      displayResults();
    };

    $scope.searchTextChange = function(text) {
      $scope.queryText = text;
      $scope.querySearch(text);
      if(!text)
        $scope.books.forEach(function(item){item.length = 0;});
    };

    $element.bind("keydown", function (event) {
        if(event.which === 13) {
          $scope.$$childHead.$mdAutocompleteCtrl.hidden = true;
          displayResults();
          event.preventDefault();
        }
    });

    function displayResults(){
      //empty books model
      $scope.books.forEach(function(item){
        item.length = 0;
      });
      
      if(!$scope.queryText || !$scope.queryText.trim())
        return;
      $http.get($scope.serverName+'getBooksByName?bookName='+$scope.queryText).then(function(response){
        //fill columns
        for(var i = 0; i < response.data.length; i++)
          $scope.books[i%$scope.numColumns].push(response.data[i]);
      });
    }

    $scope.moreInfo = function(bookId) {
      var bookInfo = $http.get($scope.serverName+'getBookInfoById?bookId='+bookId);
      bookInfo.then(() => {
          $mdDialog.show({
          locals:{bookInfo: bookInfo}, 
          controller: DialogController,
          templateUrl: 'bookDialog.tmpl.htm',
          parent: angular.element(document.body),
          clickOutsideToClose:true
        });
      });
    };

    function DialogController($scope, $mdDialog, bookInfo) {
      bookInfo = bookInfo.data;
      $scope.title = bookInfo.title;
      $scope.image = bookInfo.images.medium;
      $scope.authors = bookInfo.authors ? bookInfo.authors.join(', ') : '';
      $scope.publisher = bookInfo.publisher;
      $scope.tags = bookInfo.categories ? bookInfo.categories.join(', ') : '';
      $scope.description = bookInfo.description;
      $scope.url = bookInfo.link;
      $scope.cancel = function() {
        $mdDialog.cancel();
      };
    }

  }