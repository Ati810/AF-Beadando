(function(){
    var MidGames = {
        games: [],
        currIndex: 0,

        img: document.getElementById("Main-MidImg"),
        link: document.getElementById("Main-GameLink"),

        nextGame: function(index){
            this.currIndex += index;

            if(this.currIndex === this.games.length){
                this.currIndex = 0;
            }
            else if(this.currIndex < 0){
                this.currIndex = this.games.length - 1;
            }

            this.setNext();

            window.clearTimeout(this.autoNext.currFunction);
            this.autoNext.addTimeout();
        },

        setNext: function(){
            this.link.href = "game/" + this.games[this.currIndex].id;
            this.img.src = this.games[this.currIndex].img;
            this.img.title = this.games[this.currIndex].name;
        },

        autoNext: {
            currFunction: null,

            addTimeout: function(){
                this.currFunction = setTimeout(function(){
                    MidGames.nextGame(1);
                }, 5000);
            }
        },

        getGames: function(){
            var request = new XMLHttpRequest();

            request.onreadystatechange = function(){
                if(request.readyState === 4){
                    if(request.status === 200){
                        MidGames.games = JSON.parse(request.response);
                        MidGames.setNext();
                        MidGames.autoNext.addTimeout();
                    }
                    else{
                        alert("Something is not right with the server. Try again later.");
                    }
                }
            };

            request.open("GET", "/ajax", true);
            request.send();
        }
    };

    document.getElementById("Main-MidC").addEventListener("click", function(event){
        var id = event.target.id;

        if(id){
            if(id === "Main-MidLeft"){
                MidGames.nextGame(-1);
            }
            else if(id === "Main-MidRight"){
                MidGames.nextGame(1);
            }
        }
    });

    document.getElementById("Main-MidImg").addEventListener("mouseenter", function(event){
        window.clearTimeout(MidGames.autoNext.currFunction);
    });

    document.getElementById("Main-MidImg").addEventListener("mouseleave", function(event){
        MidGames.autoNext.addTimeout();
    });

    MidGames.getGames();

    //Review -k
    document.getElementById("Main-BottomC").addEventListener("click", function(event){
        var className = event.target.className;

        if(className && className == "Review-HiddenText"){
            event.target.removeAttribute("class");
            event.target.removeAttribute("title");
        }
    });
})();
