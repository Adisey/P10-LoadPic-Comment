var files; // переменная. будет содержать данные файлов
request = getXMLHttpRequest();

request.onreadystatechange = function() {
    // if (request.readyState == 4) {
    //     alert(request.responseText);
    // };
};

function getXMLHttpRequest()
{
    if (window.XMLHttpRequest) {
        return new XMLHttpRequest();
    }

    return new ActiveXObject('Microsoft.XMLHTTP');
}

function showMmessageScreen(dt, user, mes) {
    // console.log(dt);
    // console.log(user);
    // console.log(mes);
    //Добаляем сверху
    $("#showComment").prepend("<p>" + mes + "</p>");
    $("#showComment").prepend("<p><b>" + user + "</b></p>");
    $("#showComment").prepend('<p align="right"><span>--- ' + dt + " ---</span></p>");

    // Добаляем снизу
    // $("#showComment").append("---" + dt + "---<br>");
    // $("#showComment").append("<p><b>" + user + "</b></p><br>");
    // $("#showComment").append("<p>" + mes + "</p><br>");
    // $("#showComment").append("=====================<br>");

// Запись в файл
    params = "text="+"---" + dt + "---<br>"+"<p><b>" + user + "</b></p><br>"+"<p>" + mes + "</p><br>" + "\n";
    request.open('POST', 'php/save_mess.php', true);
    request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    request.send(params);



};

function showError(container, errorMessage) {
    container.className = 'error';
    var msgElem = document.createElement('span');
    msgElem.className = "error-message";
    msgElem.innerHTML = errorMessage;
    container.appendChild(msgElem);
}

function resetError(container) {
    container.className = '';
    if (container.lastChild.className == "error-message") {
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
    ;
    resetError(elems.comment.parentNode);
    if (!elems.comment.value) {
        showError(elems.comment.parentNode, ' Отсутствует текст сообщения.');
        valid = false;
    }
    ;

    if (valid) {
        // alert("Проверка пройдена");
        showMmessageScreen(ruDate(new Date(), 'TS'), elems.from.value, elems.comment.value);
    } else {
        alert("Необходимо заполнить поля.");
    }
    ;

    return valid;
};


/**
 * ruDate - Преобразование даты в удобочитаемый стринг
 * @author Adisey.
 * @param {date} date - входная дата
 * @param {srt} format - "MTZs":
 * M - показать месяц в буквеном формате
 * Z - показать твймзону
 * T - показать время
 * S - показать секунды
 * s - показать доли секунд
 * @return {str} result -  возвращаемая стока
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
        ;
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
        ;
    }
    ;

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
        ;
    };

    function hideButton(stat) {
        if (stat === undefined) stat = "Выберите файл для загрузки.";
        $('#uploadFileButton').css({"opacity": "0"});
        $('#uploadFileButton').css({"cursor": "default"});

        $('#previewImg').attr('src', 'img/Load.png');
        $('#previewImg').attr("alt", 'Выберите файл для загрузки.');
        $('.ajax-reply').html(stat);
        percentProgress(0);
    };

    function showButton() {
        $('#uploadFileButton').css({"opacity": "1"});
        $('#uploadFileButton').css({"cursor": "pointer"});
    };

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

