"use strict";

const Database = use("Database"),
      User = use("App/Model/User"),
      Game = use("App/Model/Game"),
      Review = use("App/Model/Review"),
      Purchase = use("App/Model/Purchase"),
      Validator = use("Validator");

class UserController {
    * getLogin(request, response){
        if((yield request.auth.getUser())){
            response.redirect("/profile");
        }
        else{
            yield response.sendView("login", {});
        }
    }

    * login (request, response) {
        const email = request.input('email'),
              password = request.input('password'),
              user = yield User.query().where({email: email, password: password});

        if(user.length === 1){
            yield request.auth.login(user[0]);

            //Ha rakott jatekokat a kosarba, akkor azokat toroljuk, amivel rendelkezik
            var cart = yield request.session.get("cart"),
                games = user[0].games;

            if(cart && games){
                games = user[0].games.split(";");

                for(var i=0; i<cart.length; ++i){
                    for(var j=0; j<games.length; ++j){
                        if(cart[i].id === parseInt(games[j])){
                            cart.splice(i, 1);
                            --i;
                            break;
                        }
                    }
                }

                yield request.session.put("cart", cart);
            }

            response.redirect('/');
        }
        else{
            //response.redirect('back');
            yield response.sendView("login", {invalid: true});
        }
    }

    * logout (request, response) {
        if((yield request.auth.getUser())){
            yield request.auth.logout();
            response.redirect("back");  //Ha a profilban volt, akkor azt akarja, de mivel nem vagyunk belepve atmegyunk a login -ra
        }
        else{
            response.redirect("back");
        }
    }

    * getRegister(request, response){
        if((yield request.auth.getUser())){
            response.redirect("/profile");
        }
        else{
            yield response.sendView("register", {});
        }
    }

    * register(request, response){
        var info = request.all();

        if(Object.keys(info).length === 0){
            yield response.sendView("register");
            return;
        }

        const validation = yield Validator.validateAll(request.all(), User.rules);

        if (validation.fails()) {
            var errors = {
                username: {error: false, value: request.input("username")},
                email: {error: false, value: request.input("email")},
                firstname: {error: false, value: request.input("firstname")},
                lastname: {error: false, value: request.input("lastname")},
                password: {error: false},
                passwordagain: {error: info.password !== info.passwordagain}
            },
                messages = validation.messages();

            for(var i=0; i<messages.length; ++i){
                errors[messages[i].field].error = true;
            }

            yield request.withAll().andWith({ errors: errors }).flash();

            response.redirect('back');
        }
        else{
            yield User.create({
                username: info.username,
                email: info.email,
                password: info.password,
                firstname: info.firstname,
                lastname: info.lastname
            });

            yield request.withAll().andWith({ successful: true }).flash();

            response.redirect("login");
        }
    }

    //Regisztralt es belepett jatekosok profiljanak eleresehez
    * profile(request, response) {
        var user = yield request.auth.getUser();

        if (user) {
            user = user.toJSON();

            var favourites = user.favourites ? user.favourites.split(";") : [],
                purchases = user.purchases ? user.purchases.split(";") : [],
                reviews =  user.reviews ? user.reviews.split(";") : [];

            for(var i=0; i<favourites.length; ++i){
                favourites[i] = (yield Game.find(favourites[i])).toJSON();
                favourites[i].pictures = favourites[i].pictures.split(";");
            }

            for(i=0; i<purchases.length; ++i){
                purchases[i] = (yield Purchase.find(purchases[i])).toJSON();
                purchases[i].names = [];
                var gameIDs = purchases[i].gameids.split(";");

                for(var j=0; j<gameIDs.length; ++j){
                    purchases[i].names.push((yield Game.find(gameIDs[j])).toJSON().name);
                }
            }

            for(i=0; i<reviews.length; ++i){
                reviews[i] = (yield Review.find(reviews[i])).toJSON();
                reviews[i].gameName = (yield Game.find(reviews[i].gameid)).toJSON().name;
            }

            yield response.sendView("profile", {user: user, favourites: favourites, purchases: purchases, reviews: reviews});
        }
        else{
            response.redirect("login");
        }
    }

    //A profilban torteno esemenyek kezelesere
    * profileAction(request, response){
        //Ha torolni szeretnenk egy jatekot a kedvencek kozul
        if(request.param("action")[0] === "r"){
            var user = yield request.auth.getUser();

            if(user){
                var userData = user.toJSON();

                if(userData.favourites){
                    var favourites = userData.favourites.split(";"),
                        toRemove = request.param("action").substring(1);

                    for(var i=0; i<favourites.length; ++i){
                        if(favourites[i] === toRemove){
                            favourites.splice(i, 1);
                            break;
                        }
                    }

                    user.favourites = favourites.join(";");
                    yield user.save();

                    response.redirect("/profile");
                }
            }
            else{
                response.redirect("login");
            }
        }
    }

    //Regisztralt felhasznalo felveheti a kedvencek koze azon jatekokat, amelyekkel rendelkezik
    * gameToFavourite(request, response){
        var user = yield request.auth.getUser();

        if(user){
            var userData = user.toJSON(),
                toAdd = request.param("id");

            if(userData.games){
                var games = userData.games.split(";"),
                    ok = false;

                for(var i=0; i<games.length; ++i){
                    if(games[i] === toAdd){
                        ok = true;
                        break;
                    }
                }

                if(!ok){
                    response.redirect("/game/" + toAdd);
                    return;
                }
            }

            if(userData.favourites){
                var favourites = userData.favourites.split(";");

                for(i=0; i<favourites.length; ++i){
                    if(favourites[i] === toAdd){
                        response.redirect("/game/" + toAdd);
                        return;
                    }
                }
            }

            //Ha mar vannak kedvencei
            if(userData.favourites){
                user.favourites += ";" + toAdd;
            }
            else{
                user.favourites = toAdd;
            }

            yield user.save();

            response.redirect("/game/" + toAdd);
        }
    }

    //Regisztralt es belepett felhasznalo irhat ertekeleseket azon jatekokrol, amelyekkel rendelkezik
    * newReview(request, response){
        var user = yield request.auth.getUser();

        if(user){
            var userData = user.toJSON(),
                toCheck = request.param("id");

            if(userData.games){
                var games = userData.games.split(";"),
                  ok = false;

                for(var i=0; i<games.length; ++i){
                    if(games[i] === toCheck){
                        ok = true;
                        break;
                    }
                }

                if(!ok){
                    response.redirect("/game/" + toCheck);
                    return;
                }
            }

            var review = request.all();
            review.score = parseInt(review.score);

            if(review.score && review.score >= 1 && review.score <= 5 && review.text.length >= 20){
                var objDate = new Date(Date.now());

                yield Review.create({
                    userid: parseInt(userData.id),
                    gameid: parseInt(toCheck),
                    date: objDate.getFullYear() + ". " + objDate.toLocaleString("en-us", { month: "short" }) + ". " + objDate.getDate() + ".",
                    text: review.text,
                    rating: review.score
                });

                //Ha mar vannak ertekelesei
                var reviews = (yield Review.all()).toJSON();

                if(userData.reviews){
                    user.reviews += ";" + reviews[reviews.length - 1].id;
                }
                else{
                    user.reviews = reviews[reviews.length - 1].id;
                }

                yield user.save();

                response.redirect("/game/" + toCheck);
            }
        }
    }

    * getCart(request, response){
        var cart = yield request.session.get("cart"),
            sum = 0.0;

        if(cart){
            for(var i=0; i<cart.length; ++i){
                sum += cart[i].price;
            }

            //Kerekitunk 2 tizedesjegyre, hogy elkeruljuk a sok szamjegyet egesz es tizedes osszeadasakor
            sum = Math.round(sum * 100) / 100
        }

        if((yield request.auth.getUser())){
            yield response.sendView("cartReg", {cart: cart, sum: sum});
        }
        else{
            yield response.sendView("cart", {cart: cart, sum: sum});
        }
    }

    * addCart(request, response){
        var gameID = parseInt(request.param("id")),
            game = yield Game.find(gameID);

        if(game){
            var cart = yield request.session.get("cart"),
                newGame = {id: game.id, picture: game.pictures.split(";")[0], name: game.name, price: game.price};
            game = game.toJSON();

            if(cart){
                cart.push(newGame);
                yield request.session.put('cart', cart);
                response.redirect("/game/" + gameID);
            }
            else{
                yield request.session.put('cart', [newGame]);
                response.redirect("/game/" + gameID);
            }
        }
    }

    * removeFromCart(request, response){
        var cart = yield request.session.get("cart");

        if(cart){
            var toRemove = parseInt(request.param("id"));

            for(var i=0; i<cart.length; ++i){
                if(cart[i].id === toRemove){
                    cart.splice(i, 1);
                }
            }

            yield request.session.put('cart', cart);

            response.redirect("/cart");
        }
    }

    * buyGames(request, response){
        var user = yield request.auth.getUser(),
            cart = yield request.session.get("cart");

        if(user){
            if(cart && cart.length > 0){
                var userData = user.toJSON(),
                    ids = "",
                    price = 0.0,
                    objDate = new Date(Date.now());

                for(var i=0; i<cart.length; ++i){
                    ids += cart[i].id + ";";
                    price += cart[i].price;
                }

                ids = ids.substring(0, ids.length - 1);

                yield Purchase.create({
                    userid: parseInt(userData.id),
                    gameids: ids,
                    date: objDate.getFullYear() + ". " + objDate.toLocaleString("en-us", { month: "short" }) + ". " + objDate.getDate() + ".",
                    price: price
                });

                var purchases = (yield Purchase.all()).toJSON();

                //Ha mar vannak vasarlasai
                if(userData.purchases){
                    user.purchases += ";" + purchases[purchases.length - 1].id;
                }
                else{
                    user.purchases = purchases[purchases.length - 1].id;
                }

                //Ha mar vannak jatekai
                if(userData.games){
                    user.games += ";" + ids;
                }
                else{
                    user.games = ids;
                }

                yield user.save();

                yield request.session.put("cart", []);

                response.redirect("/profile");
            }
        }
        else{
            response.redirect("/login");
        }
    }
}

module.exports = UserController;
