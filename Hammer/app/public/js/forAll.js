document.addEventListener("click", function(event){
    if(event.target.id === "Nav-games"){
        if(!Helpers.Nav.dropDown){
            Helpers.Nav.DropDown.open();
        }
    }
    else{
        if(Helpers.Nav.dropDown){
            Helpers.Nav.DropDown.close();
        }
    }
});

var Helpers = {
    Nav:{
        DropDown: {
            isOpen: false,
            open: function(){
                document.getElementById("Nav-dropDown").style.display = "block";
                Helpers.Nav.dropDown = true;
            },
            close: function(){
                document.getElementById("Nav-dropDown").style.display = "none";
                Helpers.Nav.dropDown = false;
            }
        }
    }
};