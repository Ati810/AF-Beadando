"use strict";

const User = use("App/Model/User"),
      Game = use("App/Model/Game"),
      Review = use("App/Model/Review"),
      Purchase = use("App/Model/Purchase");

//---- HASZNOS ----
//https://adonisjs.com/docs/3.1/lucid

class ContentController {
    * main (request, response) {
        var reviews = yield Review.all();
        reviews = reviews.toJSON();

        if(reviews.length > 3){
            var randoms = [];

            for(var i=0; i<3; ++i){
                var index = Math.round(Math.random() * (reviews.length - 1));

                randoms.push(reviews[index]);
                reviews.splice(index, 1);
            }

            reviews = randoms;
        }

        for(i=0; i<reviews.length; ++i){
            var user = yield User.find(reviews[i].userid);
            reviews[i].user = user.toJSON();
            var gameName = yield Game.find(reviews[i].gameid);
            reviews[i].gameName = gameName.toJSON().name;
        }

        var view = (yield request.auth.getUser()) ? "mainReg" : "main";

        yield response.sendView(view, {reviews: reviews});
    }

    * browse (request, response) {
        var category = request.param("category"),
            games = yield Game.all(),
            filteredGames = [];

        games = games.toJSON();

        if(category !== "All"){
            for(var i=0; i<games.length; ++i){
                if(games[i].categories.includes(category)){
                    filteredGames.push(games[i]);
                }
            }
        }
        else{
            filteredGames = games;
        }

        for(i=0; i<filteredGames.length; ++i){
            filteredGames[i].pictures = filteredGames[i].pictures.split(";");
            filteredGames[i].categories = filteredGames[i].categories.split(";");
        }

        var view = (yield request.auth.getUser()) ? "browseReg" : "browse";

        yield response.sendView(view, {games: filteredGames});
    }

    * game (request, response) {
        var gameID = request.param("id"),
            game = yield Game.find(gameID);

        if(!game){
            response.redirect("/browse/All");
        }

        var reviews = yield Review.query().where("gameid", gameID);
        game = game.toJSON();

        game.pictures = game.pictures.split(";");
        game.categories = game.categories.split(";");

        for(var i=0; i<reviews.length; ++i){
            var user = yield User.find(reviews[i].userid);
            reviews[i].user = user.toJSON();
        }

        game.reviews = reviews;

        var user = yield request.auth.getUser(),
            intGID = parseInt(gameID);

        //Ha be van lepve a felhasznalo...
        if(user){
            var view = "gameReg";
            game.ownedByUser = false;

            //Megnezzuk, hogy szerepel e a jatek a megvett jatekai kozt es ha igen, akkor a kedvencek gomb latszik majd
            if(user.attributes.games){
                var games = user.attributes.games.split(";");

                for(i=0; i<games.length; ++i){
                    if(games[i] === gameID){
                        game.ownedByUser = true;
                        break;
                    }
                }

                //Ha mar irt ertekelest, akkor nem tud megint
                if(user.attributes.reviews) {
                    reviews = user.attributes.reviews.split(";");

                    for (i = 0; i < reviews.length; ++i) {
                        if ((yield Review.find(parseInt(reviews[i]))).gameid === intGID) {
                            game.alreadyWrote = true;
                            break;
                        }
                      }
                }
            }

            //Megnezzuk, hogy szerepel e a jatek a kedvencek kozt es ha igen, akkor nem latszik majd semmilyen gomb
            if(user.attributes.favourites){
                var favs = user.attributes.favourites.split(";");

                for(i=0; i<favs.length; ++i){
                    if(favs[i] === gameID){
                        game.inFavourite = true;
                        break;
                    }
                }
            }
        }
        else{
            view = "game";
        }

        //Megnezzuk, hogy bennevan e a kosarban
        if(!game.ownedByUser){
            var cart = yield request.session.get("cart");

            if(cart){
                for(i=0; i<cart.length; ++i){
                    if(cart[i].id === intGID){
                        game.inCart = true;
                        break;
                    }
                }
            }
        }

        yield response.sendView(view, {game: game});
    }
}

module.exports = ContentController;
