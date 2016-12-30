document.getElementById("Register-C").addEventListener("focusin", function(event){
    if(event.target.id){
        var parts = event.target.id.split("-"),
            element = parts.length > 1 ? parts[1] + "Info" : null;

        if(element){
            if(Elements.currVisible){
                Elements.currVisible.removeAttribute(display);
            }

            Elements[element].style.display = "block";
            Elements.currVisible = Elements[element];
            Elements.ButtonDiv.style.marginTop = "-5em";
        }
    }
});

document.getElementById("Register-C").addEventListener("focusout", function(event){
    if(event.target.id){
        var parts = event.target.id.split("-"),
            element = parts.length > 1 ? parts[1] + "Info" : null;

        if(element){
            if(Elements.currVisible){
                Elements.currVisible.removeAttribute("style");
                Elements.ButtonDiv.removeAttribute("style");
                Elements.currVisible = null;
            }
        }
    }
});

var Elements = {
    currVisible: null,
    UNInfo: document.getElementById("Register-UNInfo"),
    EInfo: document.getElementById("Register-EInfo"),
    FNInfo: document.getElementById("Register-FNInfo"),
    LNInfo: document.getElementById("Register-LNInfo"),
    PInfo: document.getElementById("Register-PInfo"),
    ButtonDiv: document.getElementById("Register-Buttons")
};
