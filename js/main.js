var files; // переменная. будет содержать данные файлов
request = getXMLHttpRequest();


request.onreadystatechange = function () {
    // if (request.readyState == 4) {
    //     alert(request.responseText);
    // };
    switch (request.readyState) {
        case 0:
            // console.log('0 - UNSENT - Объект был создан. Метод open() ещё не вызывался.');
            break;
        case 1:
            // console.log('1 - OPENED - Метод open() был вызван.');
            break;
        case 2:
            // console.log('2 - HEADERS_RECEIVED - Метод send() был вызван, доступны заголовки (headers) и статус.');
            break;
        case 3:
            // console.log('3 - LOADING - Загрузка; responseText содержит частичные данные.');
            break;
        case 4:
            console.log('4 - DONE - Операция полностью завершена.');
            break;
        default:
            console.log('Значение: "' + request.readyState + '" + с значением "' + request.responseText + '" мне не знакомо. ((');
    }
};

function CreateMessage(user, text) {
    this.date = new Date();
    this.user = user;
    this.text = text;
}

function test() {
    creaJSONobj();
}

function creaJSONobj() {
    var oneMess = new CreateMessage('User 1', 'О сколько нам открытий чудных готовит просвещенья дух.');
    console.log(oneMess);
    var allMessage = {};
    for (var i = 1; i <= 10; i++) {
        // allMessage[i] = oneMess;
        allMessage[i] = new CreateMessage('User '+i, 'О сколько нам открытий чудных готовит просвещенья дух.');
    }
    console.log(allMessage);



    var Mess_json = JSON.stringify(allMessage);
    $.ajax({
        url: 'php/writejson.php',
        type: 'POST',
        data: {myJson: Mess_json, fileName: '../uploads/message.json'},
    });



}

function getXMLHttpRequest() {
    if (window.XMLHttpRequest) {
        return new XMLHttpRequest();
    }
    return new ActiveXObject('Microsoft.XMLHTTP');
}

function showNewMessageScreen(message) {
    $("#showComment").prepend("<p>" + message.text + "</p>");
    $("#showComment").prepend("<p><b>" + message.user + "</b></p>");
    $("#showComment").prepend('<p align="right"><span>--- ' + ruDate(message.date, 'TS') + " ---</span></p>");
}

function writeMessageFile(message) {
    params = "text=" + "-" + ruDate(message.date, 'TS') + "-<br>" + "<p><b>" + message.user + "</b></p><br>" + "<p>" + message.text + "</p><br>" + "\n";
    request.open('POST', 'php/save_mess.php', true);
    request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    request.send(params);
}

function lastJSONmessage(message) {
    var message_json = JSON.stringify(message);
    console.log(message);
    console.log(message_json);
    // $.ajax({
    //     url: 'data.php',
    //     type: 'POST',
    //     data: {myJson: message_json, fileName: 'lastmessage.json'},
    // });

    $.ajax({
        url: 'php/writejson.php',
        type: 'POST',
        data: {myJson: message_json, fileName: '../uploads/lastmessage.json'},
    });


}

function showError(container, errorMessage) {
    container.className = 'error';
    var msgElem = document.createElement('span');
    msgElem.className = "error-message";
    msgElem.innerHTML = errorMessage;
    container.appendChild(msgElem);
}

function resetError(container) {
    container.className = '';
    if (container.lastChild.className === "error-message") {
        container.removeChild(container.lastChild);
    }
}


function validate(form) {
    var elems = form.elements;
    var valid = true;
    resetError(elems.from.parentNode);
    if (!elems.from.value) {
        showError(elems.from.parentNode, ' Укажите своё имя.');
        valid = false;
    }
    resetError(elems.comment.parentNode);
    if (!elems.comment.value) {
        showError(elems.comment.parentNode, ' Отсутствует текст сообщения.');
        valid = false;
    }

    if (valid) {
        // alert("Проверка пройдена");
        var message = {
            // date: ruDate(new Date(), 'TS'),
            date: new Date(),
            user: elems.from.value,
            text: elems.comment.value
        };
        showNewMessageScreen(message);
        writeMessageFile(message);
        lastJSONmessage(message);
    } else {
        alert("Необходимо заполнить поля.");
    }

    return valid;
}

/**
 * ruDate - Преобразование даты в удобочитаемый стринг
 * @author Adisey.
 * @param {date} date - входная дата
 * @param {string} format - "MTZs":
 * M - показать месяц в буквеном формате
 * Z - показать твймзону
 * T - показать время
 * S - показать секунды
 * s - показать доли секунд
 * @return {string} result -  возвращаемая стока
 */
function ruDate(date, format) {
    format = (format === undefined) ? '' : format;
    var tmpM;
    if (format.indexOf('M') < 0) {
        tmpM = (date.getMonth() + 1);
        tmpM = '.' + ((tmpM < 10) ? '0' + tmpM : tmpM) + '.';
    } else {
        var ruMonth = ["января", "февраля", "марта", "апроеля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];
        tmpM = ' ' + ruMonth[date.getMonth()] + ' ';
    }
    var result = date.getDate() + tmpM + date.getFullYear();
    if (format.length > 0) {
        if (format.indexOf('Z') >= 0) {
            result += ' (GMT' + date.getTimezoneOffset() / 60 + ') ';
        }
        if (format.indexOf('T') >= 0) {
            var hh = date.getHours();
            hh = (hh < 10) ? '0' + hh : hh;
            var mm = date.getMinutes();
            mm = (mm < 10) ? '0' + mm : mm;
            var ss = date.getSeconds();
            ss = (ss < 10) ? '0' + ss : ss;
            //getHours(), getMinutes(), getSeconds(), getMilliseconds()
            result += ' ' + hh + ':' + mm;
            if (format.indexOf('S') >= 0) {
                result += ':' + ss;
                if (format.indexOf('s') >= 0) {
                    result += '.' + date.getMilliseconds();
                }
            }
        }
    }

    return result;
}


$(document).ready(function () {
    hideButton();
    percentProgress(0);

    function percentProgress(pp) {
        if (pp === undefined) pp = 0;
        if (pp < 0) pp = 0;
        if (pp > 100) pp = 100;
        $('#myBar').css({"width": pp + "%"});
        $('#myBar').html(pp + "%");
        if ((pp === 0) || (pp === 100)) {
            $('#myProgress').css({"opacity": "0"});
        } else {
            $('#myProgress').css({"opacity": "1"});
        }

    }

    function hideButton(stat) {
        if (stat === undefined) stat = "Выберите файл для загрузки.";
        $('#uploadFileButton').css({"opacity": "0"});
        $('#uploadFileButton').css({"cursor": "default"});

        $('#previewImg').attr('src', 'img/Load.png');
        $('#previewImg').attr("alt", 'Выберите файл для загрузки.');
        // $('#previewImg').attr('src', 'img/Load.png');
        // $('#previewImg').attr("alt", 'Выберите файл для загрузки.');
        $('.ajax-reply').html(stat);
        percentProgress(0);
    }

    function showButton() {
        $('#uploadFileButton').css({"opacity": "1"});
        $('#uploadFileButton').css({"cursor": "pointer"});
    }

    // заполняем переменную данными, при изменении значения поля file
    $('input[type=file]').on('change', function () {
        percentProgress(30);
        files = this.files;
        if (files == undefined || files.length == 0) return;
        $('#previewImg').attr("alt", files[0].name);
        var reader = new FileReader();
        reader.onload = function (e) {
            $('#previewImg').attr('src', e.target.result);
        };
        reader.readAsDataURL(files[0]);
        $('.ajax-reply').html('Выбран: ' + files[0].name);
        percentProgress(50);
        showButton();
        // $('#previewImg').attr("src",files[0].name);
    });

    // обработка и отправка AJAX запроса при клике на кнопку upload_files
    $('#uploadFileButton').on('click', function (event) {
        event.stopPropagation(); // остановка всех текущих JS событий
        event.preventDefault();  // остановка дефолтного события для текущего элемента - клик для <a> тега
        percentProgress(70);

        // ничего не делаем если files пустой
        if (typeof files == 'undefined') {
            $('.ajax-reply').html('<color="red">Для начало необходимо выбрать фото для загрузки.');
            return;
        }
        ;

        // создадим объект данных формы
        var data = new FormData();

        // заполняем объект данных файлами в подходящем для отправки формате
        $.each(files, function (key, value) {
            date.append(key, value);
        });

        // добавим переменную для идентификации запроса
        date.append('my_file_upload', 1);

        // AJAX запрос
        percentProgress(99.9);
        $.ajax({
            url: './php/submit_lf.php',
            type: 'POST', // важно!
            data: data,
            cache: false,
            dataType: 'json',
            // отключаем обработку передаваемых данных, пусть передаются как есть
            processData: false,
            // отключаем установку заголовка типа запроса. Так jQuery скажет серверу что это строковой запрос
            contentType: false,
            // функция успешного ответа сервера
            success: function (respond, status, jqXHR) {

                // ОК - файлы загружены
                if (typeof respond.error === 'undefined') {
                    // выведем пути загруженных файлов в блок '.ajax-reply'
                    var files_path = respond.files;
                    var html = 'Загружен: ';
                    $.each(files_path, function (key, val) {
                        html += val + '<br>';
                    });
                    hideButton(html);

                    // $('.ajax-reply').html(html);
                }
                // ошибка
                else {
                    console.log('ОШИБКА: ' + respond.error);
                    percentProgress(0);
                }
            },
            // функция ошибки ответа сервера
            error: function (jqXHR, status, errorThrown) {
                console.log('ОШИБКА AJAX запроса: ' + status, jqXHR);
                percentProgress(0);
            }
        });

    });


});

