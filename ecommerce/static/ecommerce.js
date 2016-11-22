var app = angular.module('ecommerce', ['ui.router','ngCookies']);


app.factory('Store', function($http, $cookies, $rootScope) {
  var service = {};
  var loginData = $cookies.getObject('user');
  // console.log(loginData);
  $rootScope.user = loginData.user;
  $rootScope.auth_token = loginData.auth_token;
  // console.log($rootScope.auth_token);

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
  service.addToCart = function(token, product) {
    var url = 'api/add_shopping_cart';
    return $http({
      method: 'POST',
      url: url,
      data: {auth_token: token, product: product}
    });
  };
  service.viewCart = function(token) {
    var url = 'api/show_shopping_cart';
    return $http({
      method: 'GET',
      url: url,
      params: {auth_token: token}
    });
  };
  return service;
});

app.run(function($rootScope, $cookies, $state) {
  $rootScope.logOut = function() {
    console.log('Called logout');
    $cookies.remove('user');
    $rootScope.user = null;
    $state.go('products');
  };
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
    })
    .state({
      name: 'cart',
      url: '/shopping_cart',
      templateUrl: 'shopping_cart.html',
      controller: 'ViewCartController'
    });


  $urlRouterProvider.otherwise('/display-products');
});

app.controller('DisplayController', function($scope, $state, Store, $rootScope) {
  Store.display().success(function(product_list) {
    $scope.productList = product_list;
    $scope.loginButton = function() {
      $state.go('login');
    };
    $scope.test = function() {
      console.log("ran test");
      Store.getToken($rootScope.user.id).success(function(returnedId) {
        console.log("Test: " + returnedId);
      });
    };
    $scope.viewCart = function() {
      $state.go('cart');
    };
});

  $scope.goToDetails = function(product) {
    $scope.thisProductID = product.id;
    $state.go('product-details', { productID: $scope.thisProductID});
  };
});

app.controller('ProductDetailsController', function($scope, $state, $stateParams, Store, $rootScope) {
  Store.details($stateParams.productID).success(function(product) {
    $scope.thisName = product.name;
    $scope.thisPrice = product.price;
    $scope.thisDesc = product.description;
    $scope.thisImg = product.image_path;
    $scope.thisId = product.id;
  });
  $scope.goToCart = function() {
    console.log("got to goToCart");
    Store.addToCart($rootScope.auth_token, $scope.thisId).success(function() {
      console.log('Success!');
    });
  };
});

app.controller('SignUpController', function($scope, $state, Store) {
    $scope.click = function() {
      Store.signUp($scope.username, $scope.email, $scope.firstName, $scope.lastName, $scope.password, $scope.confirmPassword).success(function() {
        $state.go('login');
    });
  };

});

app.controller('LogInController', function($scope, $cookies, Store, $rootScope, $state) {
  $scope.logIn = function() {
    console.log('called log in');
    Store.logIn($scope.username, $scope.password).success(function(data) {
      $rootScope.user = data.user;
      $cookies.putObject('user', data);
      $state.go('products');
    });
  };
});

app.controller('ViewCartController', function($scope, $cookies, Store, $rootScope, $state) {
  Store.viewCart($rootScope.auth_token).success(function(stuff){
    $scope.products = stuff;
    $scope.cartSum = function() {
      var sum = 0;
      $scope.products.forEach(function(item) {
        sum += item.price;
      });
      return sum;
    };
    $scope.total = $scope.cartSum();
});
});
