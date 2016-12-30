(function(){
    //Review -k
    document.getElementById("Profile-ReviewsC").addEventListener("click", function(event){
        var className = event.target.className;

        if(className && className.indexOf("Review-HiddenText") !== -1){
            event.target.removeAttribute("class");
            event.target.removeAttribute("title");
        }
    });
})();