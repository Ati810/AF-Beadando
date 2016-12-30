(function(){
    var mainImg = document.getElementById("Game-MainImg");

    document.getElementById("Game-ImgsC").addEventListener("click", function(event){
        if(event.target.className){
            mainImg.src = event.target.src;
        }
    });

    //Review -k
    document.getElementById("Game-ReviewsC").addEventListener("click", function(event){
        var className = event.target.className;

        if(className && className.indexOf("Review-HiddenText") !== -1){
            event.target.className = className.replace("Review-HiddenText", "");
            event.target.removeAttribute("title");
        }
    });
})();
