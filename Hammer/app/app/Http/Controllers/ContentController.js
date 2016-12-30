"use strict";

const Database = use("Database"),
      User = use("App/Model/User"),
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

    //AJAX - A fo oldal szamara elkuldunk 5 random jatekot, hogy a kozepso reszen meg lehessen oket jeleniteni
    * mainAjax (request, response) {
        var games = yield Game.all();
        games = games.toJSON();

        if(games.length > 5){
            var randoms = [];

            for(var i=0; i<5; ++i){
              var index = Math.round(Math.random() * (games.length - 1));

              randoms.push(games[index]);
              games.splice(index, 1);
            }

            games = randoms;
        }

        for(i=0; i<games.length; ++i){
            games[i] = {
                id: games[i].id,
                name: games[i].name,
                img: games[i].pictures.split(";")[0]
            };
        }

        response.send(games);
    }

    * browse (request, response) {
        var category = request.param("category"),
            //games = yield Game.all(),
            filteredGames = [];

        //games = games.toJSON();

        if(category !== "All"){
            /*for(var i=0; i<games.length; ++i){
                if(games[i].categories.includes(category)){
                    filteredGames.push(games[i]);
                }
            }*/

            filteredGames = yield Database.select("*").from("games").where('categories', 'LIKE', '%' + category + '%');
        }
        else{
            //filteredGames = games;
            filteredGames = (yield Game.all()).toJSON();
        }

        for(var i=0; i<filteredGames.length; ++i){
            filteredGames[i].pictures = filteredGames[i].pictures.split(";");
            filteredGames[i].categories = filteredGames[i].categories.split(";");
        }

        var view = (yield request.auth.getUser()) ? "browseReg" : "browse",
            gamesNum = filteredGames.length;

        //Ha tobb mint 10 jatek van, akkor csak az elso tizet kuldjuk (a tobbit lapozgatva lehet elerni)
        if(gamesNum > 10){
            filteredGames = filteredGames.slice(0, 10);
        }

        yield response.sendView(view, {games: filteredGames, numOfGames: Math.ceil(gamesNum / 10)});
    }

    //AJAX - Bongeszes kozben Ajax keressel lehet a kovetkezo 10 jatekot kerni.
    * browseAjax (request, response){
        var category = request.param("category");

        if(category !== "All"){
            var games = yield Database.select("*").from("games").where('categories', 'LIKE', '%' + category + '%');
        }
        else{
            games = (yield Game.all()).toJSON();
        }

        var nextChunk = request.all().nextChunk,
            wholeLength = Math.floor(games.length / 10),
            maxBorder = nextChunk > wholeLength ? games.length : nextChunk * 10, //A felso hatar mindig 9, kiveve az utolso, nem 10db -os resz (pl. 9, 19...)
            minBorder = (nextChunk - 1) * 10; //Az also hatar mindig egesz (0, 10, 20...)

        games = games.slice(minBorder, maxBorder);

        for(var i=0; i<games.length; ++i){
            games[i] = {
                id: games[i].id,
                name: games[i].name,
                img: games[i].pictures.split(";")[0],
                releasedate: games[i].releasedate,
                price: games[i].price
            };
        }

        response.send(games);
    }

    //AJAX - Bongeszes kozben Ajax keressel kozvetlenul rakereshetunk a kivant jatekra
    * browseSearchAjax (request, response){
        var searchText = request.all().text,
            firstQuery = yield Database.select("*").from("games").where('name', 'LIKE', searchText + '%').limit(5),
            firstLength = firstQuery.length,
            results = [];

        if(firstLength < 5){
            firstQuery = firstQuery.concat(yield Database.select("*").from("games").where('name', 'LIKE', '%' + searchText + '%').limit(5 - firstQuery.length));
            firstLength = firstQuery.length;
        }

        if(firstLength > 0){
            var checkMap = new Map();

            for(var i=0; i<firstLength; ++i){
                var id = firstQuery[i].id;

                if(checkMap.has(id)){
                    continue;
                }
                else{
                    checkMap.set(id, id);
                }

                results.push({
                    id: id,
                    name: firstQuery[i].name,
                    price: firstQuery[i].price,
                    img: firstQuery[i].pictures.split(";")[0]
                })
            }
        }

        response.send(results);
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
