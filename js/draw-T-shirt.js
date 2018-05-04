function changeColor() {
    let _color = $ ("#selectColor").val ();
    $ ("#lettering").css ("background-color", _color);
    $ ("#templateTshort").css ("background-color", _color);
}

function selectLettering() {
    $ ("#lettering").html (nl2br ($ ("#inputLettering").val ()));
}

function changeColorText() {
    let _color = $ ("#selectColorText").val ();
    $ ("#lettering").css ("color", _color);
    $ ("#inputLettering").css ("color", _color);
}


function focusInputLettering() {
    $ ("#inputLettering").focus ();
}

function changeTestSize() {
    let _size = $ ("#textSeze").val () + 'pt';
    $ ("#lettering").css ("font-size", _size);
    $ ("#inputLettering").css ("font-size", _size);
}


function changeFont() {
    let _font = $ ("#myFont").val ();
    $ ("#lettering").css ("fontFamily", _font);
    $ ("#inputLettering").css ("fontFamily", _font);

}


function nl2br(str) {	// Inserts HTML line breaks before all newlines in a string
    //
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)

    return str.replace (/([^>])\n/g, '$1<br/>');
}

$ (document).ready (function () {
    // Drag-and-Drop begin
        let lettering = document.getElementById('inputLettering');
    lettering.onmousedown = function(e) {
        let coords = getCoords(lettering);
        let shiftX = e.pageX - coords.left;
        let shiftY = e.pageY - coords.top;
        lettering.style.position = 'absolute';
        document.body.appendChild(lettering);
        moveAt(e);
        lettering.style.zIndex = 1000; // над другими элементами

        function moveAt(e) {
            lettering.style.left = e.pageX - shiftX + 'px';
            lettering.style.top = e.pageY - shiftY + 'px';
        }

        document.onmousemove = function(e) {
            moveAt(e);
        }

        lettering.onmouseup = function() {
            document.onmousemove = null;
            lettering.onmouseup = null;
        }

    };

    lettering.ondragstart = function() {
        return false;
    };

    function getCoords(elem) {   // кроме IE8-
        let box = elem.getBoundingClientRect();
        return {
            top: box.top + pageYOffset,
            left: box.left + pageXOffset
        }
    }
    // Drag-and-Drop end

    // Авто удлинение inputLettering
    $.each($('textarea[data-autoresize]'), function() {
        let offset = this.offsetHeight - this.clientHeight;
        let resizeTextarea = function(el) {
            $(el).css('height', 'auto').css('height', el.scrollHeight + offset);
        };
        $(this).on('keyup input', function() { resizeTextarea(this); }).removeAttr('data-autoresize');
    })

})




