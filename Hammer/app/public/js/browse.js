(function(){
    var HelperObj = {
        //------------------- Switching pages -------------------
        currPage: 1,
        maxPage: 0,

        leftDot: false,
        rightDot: false,

        dotToNum: function(element, isLast){
            var num = "" + (isLast ? this.maxPage - 1 : 2);

            element.className = "Browse-Pages";
            element.setAttribute("data-page", num);
            element.innerHTML = num;
        },

        numToDot: function(element, isLast){
            element.removeAttribute("class");
            element.removeAttribute("data-page");
            element.id = isLast ? "Browse-DotRight" : "Browse-DotLeft";
            element.innerHTML = "...";
        },

        changeElements: function(elements, minPage){
            for(var i=0; i<elements.length; ++i){
                elements[i].setAttribute("data-page", "" + minPage);
                elements[i].innerHTML = minPage;
                ++minPage;
            }
        },

        movingRight: function(nextPage){
            //Ha a (legnagyobb oldal - 4) -nel kisebb a kovetkezo oldal, akkor ... X ... lesz
            if(nextPage < (HelperObj.maxPage - 4)){
                //Itt lekerjuk az osszes Browse-pages oldalt (7db), aminel az elsot es utolsot leszamitva,
                //a kozepso 5 -bol a kozepso az amire megyunk, majd balra jobbra 2-2
                var pages = Array.prototype.slice.call(document.getElementsByClassName("Browse-Pages")); //Mivel nodeList -et kapunk
                pages.shift();
                pages.pop();

                HelperObj.changeElements(pages, nextPage - 2);
            }
            //Ha olyan oldalra kattintunk, hogy jobb oldalt mar eltunik a ...
            else if(nextPage >= (HelperObj.maxPage - 4)){
                //Eloszor a jobb oldali ... -ot oldalla alakitjuk, majd az utolso kettot es az elsot leszamitva
                //mindegyiket atirjuk (igy biztos nem lesz problema, akarhonnan is jon)
                HelperObj.dotToNum(document.getElementById("Browse-DotRight"), true);
                HelperObj.rightDot = false;

                pages = Array.prototype.slice.call(document.getElementsByClassName("Browse-Pages"));
                pages.shift();
                pages.pop();
                pages.pop();

                HelperObj.changeElements(pages, HelperObj.maxPage - 6);
            }
        },

        movingLeft: function(nextPage){
            //Ezutan ha a kovetkezo oldal nagyobb mint 6, akkor ... X ... lesz
            if(nextPage >= 6){
                //Itt lekerjuk az osszes Browse-pages oldalt (7db), aminel az elsot es utolsot leszamitva,
                //a kozepso 5 -bol a kozepso az amire megyunk, majd balra jobbra 2-2
                var pages = Array.prototype.slice.call(document.getElementsByClassName("Browse-Pages"));
                pages.shift();
                pages.pop();

                HelperObj.changeElements(pages, nextPage - 2);
            }
            //Ha olyan oldalra kattintunk, hogy bal oldalt mar eltunik a ...
            else if(nextPage < 6){
                //Eloszor a jobb oldali ... -ot oldalla alakitjuk, majd az elso kettot es az utolsot leszamitva
                //mindegyiket atirjuk (igy biztos nem lesz problema, akarhonnan is jon)
                HelperObj.dotToNum(document.getElementById("Browse-DotLeft"));
                HelperObj.leftDot = false;

                pages = Array.prototype.slice.call(document.getElementsByClassName("Browse-Pages"));
                pages.shift();
                pages.shift();
                pages.pop();

                HelperObj.changeElements(pages, 3);
            }
        },

        getGames: function(nextChunk){
            var request = new XMLHttpRequest();

            request.onreadystatechange = function(){
                if(request.readyState === 4){
                    if(request.status === 200){
                        var newGames = JSON.parse(request.response),
                            imgLinks = document.getElementsByClassName("Browse-ImgLinks"),
                            imgs = document.getElementsByClassName("Browse-Imgs"),
                            names = document.getElementsByClassName("Browse-Names"),
                            dates = document.getElementsByClassName("Browse-Dates"),
                            prices = document.getElementsByClassName("Browse-Prices"),
                            length = imgLinks.length,
                            gamesLength = newGames.length,
                            i = 0;

                        //Eloszor a meglevo elemeknek modositjuk a tartalmat...
                        for(i; i<length && i<gamesLength; ++i){
                            imgLinks[i].href = "/game/" + newGames[i].id;
                            imgs[i].src = newGames[i].img;

                            names[i].href = "/game/" + newGames[i].id;
                            names[i].innerHTML = newGames[i].name;

                            dates[i].innerHTML = newGames[i].releasedate;
                            prices[i].innerHTML = newGames[i].price;
                        }

                        //...majd ha nem volt 10, akkor a maradekot letrehozzuk...
                        if(i < gamesLength - 1){
                            var container = document.getElementById("Browse-Mid");

                            for(i; i<gamesLength; ++i){
                                container.appendChild(HelperObj.createNewGameLabel(newGames[i]));
                            }
                        }
                        //...avagy, ha kevesebb kene mint van, akkor a maradekot toroljuk
                        else if(length - 1 > gamesLength - 1){
                            container = document.getElementById("Browse-Mid");
                            --length;

                            var containerChilds = container.children;

                            while(length >= i){
                                container.removeChild(containerChilds[length]);

                                --length;
                            }
                        }
                    }
                    else{
                        alert("Something is not right with the server. Try again later.");
                    }
                }
            };

            var parts = window.location.href.split("/");

            request.open("POST", "/ajax/browse/" + parts[parts.length - 1], true);
            request.setRequestHeader("Content-type", "application/json");
            request.send(JSON.stringify({nextChunk: nextChunk}));
        },

        createNewGameLabel: function(game){
            var mainDiv = document.createElement("div"),
                imgLink = document.createElement("a"),
                img = document.createElement("img"),
                name = document.createElement("a"),
                date = document.createElement("span"),
                price = document.createElement("span");

            imgLink.href = "/game/" + game.id;
            imgLink.className = "Browse-ImgLinks";

            img.src = game.img;
            img.className = "Browse-Imgs";

            name.href = "/game/" + game.id;
            name.innerHTML = game.name;
            name.className = "Browse-Names";

            date.innerHTML = game.releasedate;
            date.className = "Browse-Dates";

            price.innerHTML = game.price;
            price.className = "Browse-Prices";

            //A parentNode -al lekerjuk a szulot, mivel a sima appendChild a gyereket adna vissza
            mainDiv.appendChild(document.createElement("div").appendChild(imgLink.appendChild(img).parentNode).parentNode);
            mainDiv.appendChild(document.createElement("div").appendChild(name).parentNode);
            mainDiv.appendChild(document.createElement("div").appendChild(date).parentNode);
            mainDiv.appendChild(document.createElement("div").appendChild(price).parentNode);

            return mainDiv;
        },


        //------------------- Search -------------------
        currTimeout: null,
        resultsIn: false,
        resultContainer: document.getElementById("Browse-SResults"),

        getSearchResult: function(text){
            var request = new XMLHttpRequest(),
                that = this;

            request.onreadystatechange = function(){
                if(request.readyState === 4){
                    if(request.status === 200) {
                        var searchResult = JSON.parse(request.response);

                        //Akar van eredmeny, akar nincs, a meglevo eredmenyt torolni kell
                        if(that.resultsIn){
                            that.clearResults();
                        }

                        if(searchResult.length > 0){
                            that.createGameResult(searchResult);
                            that.resultsIn = true;
                            that.resultContainer.style.display = "block";
                        }
                    }
                    else{
                        alert("Something is not right with the server. Try again later.");
                    }
                }
            };

            var parts = window.location.href.split("/");

            request.open("POST", "/ajax/search/browse/" + parts[parts.length - 1], true);
            request.setRequestHeader("Content-type", "application/json");
            request.send(JSON.stringify({text: text}));
        },

        createGameResult: function(games){
            var length = games.length;

            for(var i=0; i<length; ++i){
                var a = document.createElement("a"),
                    img = document.createElement("img"),
                    name = document.createElement("span"),
                    price = document.createElement("span"),
                    bottomContainer = document.createElement("div");

                a.href = "/game/" + games[i].id;
                img.src = games[i].img;

                name.className = "Browse-SNames";
                name.innerHTML = games[i].name;

                price.className = "Browse-SPrices";

                if(games[i].price > 0){
                    price.innerHTML = games[i].price + "€";
                }
                else{
                    price.innerHTML = "Free";
                }

                a.appendChild(document.createElement("div").appendChild(img).parentNode);

                bottomContainer.appendChild(name);
                bottomContainer.appendChild(price);
                a.appendChild(bottomContainer);

                this.resultContainer.appendChild(document.createElement("div").appendChild(a).parentNode);
            }
        },

        clearResults: function(){
            this.resultContainer.removeAttribute("style");
            this.resultContainer.innerHTML = null;
            this.resultsIn = false;
        }
    };

    //Init
    (function(){
        var pages = document.getElementsByClassName("Browse-Pages");

        if(pages.length > 0){
            //Az utolso elem mindig az utolso oldal
            HelperObj.maxPage = parseInt(pages[pages.length - 1].getAttribute("data-page"));

            if(HelperObj.maxPage > 9){
                HelperObj.rightDot = true;
            }
        }
    })();

    //Az oldalak lapozgatasanak esemenyfigyeloje
    document.getElementById("Browse-PagesC").addEventListener("click", function(event){
        if(HelperObj.maxPage < 2){
            return;
        }

        var id = event.target.id,
            className = event.target.className,
            nextPage = null;

        if(id){
            //Ha a jobbra nyilra kattintott
            if(id === "Browse-PRight"){
                if(HelperObj.currPage < HelperObj.maxPage){
                    nextPage = HelperObj.currPage + 1;
                }
            }
            //Ha a balra nyilra kattintott
            else if(id === "Browse-PLeft"){
                if(HelperObj.currPage > 1){
                    nextPage = HelperObj.currPage - 1;
                }
            }
        }
        //Ha kozvetlenul szamra kattintott
        else if(className){
            nextPage = parseInt(event.target.getAttribute("data-page"));
        }

        //Ha ervenyes oldalra kattintott, ami nem az aktualis, akkor megyunk
        if(nextPage && nextPage !== HelperObj.currPage){
            //Toroljuk a most kijeloltet
            document.querySelector("[data-page='" + HelperObj.currPage + "']").removeAttribute("id");

            //Csak akkor kell mozgatni a dolgokat, ha 9 -nel tobb oldal van
            if(HelperObj.maxPage > 9){
                //Ha jobbra megyunk
                if(nextPage > HelperObj.currPage){
                    //Ha csak a jobb oldali ... latszik
                    if(!HelperObj.leftDot && HelperObj.rightDot){
                        //Ha legalabb a 6. -ra kattintott, akkor bal oldalt biztos megjelenik a ...
                        if(nextPage >= 6){
                            HelperObj.numToDot(document.querySelector("[data-page='2']"));
                            HelperObj.leftDot = true;

                            HelperObj.movingRight(nextPage);
                        }
                    }
                    //Ha mindket ... latszik
                    else if(HelperObj.leftDot && HelperObj.rightDot){
                        HelperObj.movingRight(nextPage);
                    }

                    //Ha csak a bal oldali ... latszik, akkor siman megyunk

                }
                //Ha balra megyunk
                else{
                    //Ha csak a bal oldali ... latszik
                    if(HelperObj.leftDot && !HelperObj.rightDot){
                        //Ha legalabb a (max - 5) -re kattintott, akkor a jobb oldali ... biztos megjelenik
                        if(nextPage <= HelperObj.maxPage - 5){
                            HelperObj.numToDot(document.querySelector("[data-page='" + (HelperObj.maxPage - 1) + "']"), true);
                            HelperObj.rightDot = true;

                            HelperObj.movingLeft(nextPage);
                        }
                    }
                    //Ha mindket ... latszik
                    else if(HelperObj.leftDot && HelperObj.rightDot){
                        HelperObj.movingLeft(nextPage);
                    }

                    //Ha csak a jobb oldali ... latszik, akkor siman megyunk

                }
            }

            //Jeloljuk az uj aktualsit
            document.querySelector("[data-page='" + nextPage + "']").id = "Browse-PSelected";
            HelperObj.currPage = nextPage;

            //Illetve lekerjuk a megfelelo jatekokat
            HelperObj.getGames(nextPage);
        }
    });

    //A kereso mezo esemenyfigyeloje
    document.getElementById("Browse-SField").addEventListener("input", function(event){
        var text = event.target.value;

        //Ha mar volt, akkor toroljuk az elozot.
        if(HelperObj.currTimeout){
            clearTimeout(HelperObj.currTimeout);
        }

        if(text.length > 0){
            HelperObj.currTimeout = setTimeout(function(){
                HelperObj.getSearchResult(text);
            }, 500);
        }
        else{
            HelperObj.clearResults();
        }
    });
})();
