'use strict';

/*
|--------------------------------------------------------------------------
| Router
|--------------------------------------------------------------------------
|
| AdonisJs Router helps you in defining urls and their actions. It supports
| all major HTTP conventions to keep your routes file descriptive and
| clean.
|
| @example
| Route.get('/user', 'UserController.index')
| Route.post('/user', 'UserController.store')
| Route.resource('user', 'UserController')
*/

const Route = use('Route');

Route.get("/", "ContentController.main");
Route.get("/mainGames", "ContentController.mainGames");

Route.get("/cart", "UserController.getCart");
Route.post("/cart/:id", "UserController.removeFromCart");
Route.post("/cart", "UserController.buyGames");

Route.get("/browse/:category", "ContentController.browse"); /*/:page?*/
Route.get("/game/:id", "ContentController.game");
Route.post("/game/:id/f", "UserController.gameToFavourite");
Route.post("/game/:id/r", "UserController.newReview");
Route.post("/game/:id/a", "UserController.addCart");

Route.get("/profile", "UserController.profile");
Route.post("/profile/:action", "UserController.profileAction");

Route.get("/login", "UserController.getLogin");
Route.post("/login", "UserController.login");
Route.get("/logout", "UserController.logout");

Route.get("/register", "UserController.getRegister");
Route.post("/register", "UserController.register");

Route.group("ajax", function(){
    Route.get("/", "ContentController.mainAjax");
    Route.post("/browse/:category", "ContentController.browseAjax");
    Route.post("/search/browse/:category", "ContentController.browseSearchAjax");
}).prefix("/ajax");

//Ervenytelen URL eseten
Route.any("*", function * (request, response) {
  yield response.sendView("invalidURL");
});
