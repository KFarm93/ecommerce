var app = angular.module('ecommerce', ['ui.router','ngCookies']);


app.factory('Store', function($http) {
  var service = {};
  service.display = function() {
    var url = 'http://localhost:5000/api/products';
    return $http({
      method: 'GET',
      url: url
    });
  };
  service.details = function(productID) {
    console.log(productID);
    var url = "/api/product-details/" + productID;
    return $http({
      method: 'GET',
      url: url
    });
  };
  service.signUp = function(username, email, firstName, lastName, password) {
    console.log("test");
      var url = '/api/user/signup';
        return $http({
          method: 'POST',
          url: url,
          data: { username: username, email: email, password: password, first_name: firstName, last_name: lastName }
        });
  };
  service.logIn = function(username, password) {
    var url = 'api/user/login';
    return $http({
      method: 'POST',
      url: url,
      data: { username: username, password: password}
    });
  };

  return service;
});


app.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state({
      name: 'products',
      url: '/display-products',
      templateUrl: 'display-products.html',
      controller: 'DisplayController'
    })
    .state({
      name: 'product-details',
      url: '/product-details/{productID}',
      templateUrl: 'product-details.html',
      controller: 'ProductDetailsController'
    })
    .state({
      name: 'signUp',
      url: '/user/signup',
      templateUrl: 'signup.html',
      controller: 'SignUpController'
    })
    .state({
      name: 'login',
      url: '/user/login',
      templateUrl: 'login.html',
      controller: 'LogInController'
    });


  $urlRouterProvider.otherwise('/display-products');
});

app.controller('DisplayController', function($scope, $state, Store) {
  Store.display().success(function(product_list) {
    $scope.productList = product_list;
  });
  $scope.goToDetails = function(product) {
    $scope.thisProductID = product.id;
    $state.go('product-details', { productID: $scope.thisProductID});
  };
});

app.controller('ProductDetailsController', function($scope, $state, $stateParams, Store) {
  Store.details($stateParams.productID).success(function(product) {
    $scope.thisName = product.name;
    $scope.thisPrice = product.price;
    $scope.thisDesc = product.description;
    $scope.thisImg = product.image_path;
  });
});

app.controller('SignUpController', function($scope, $state, $stateParams, Store) {
    $scope.click = function() {

    Store.signUp($scope.username, $scope.email, $scope.firstName, $scope.lastName, $scope.password, $scope.confirmPassword).success(function() {
    });
  };

});

app.controller('LogInController', function($scope, $cookies, Store, $rootScope) {
  $scope.logIn = function() {
    console.log('called log in');
    Store.logIn($scope.username, $scope.password).success(function(data) {
      $rootScope.user = data.user;
      $cookies.putObject('user', data);
    });
  };
});



// var checkPassword = function() {
//   if (password === confirmPassword) {
//     var url = "/api/user/signup";
