var files; // переменная. будет содержать данные файлов
request = getXMLHttpRequest();
var maxCountOnStep = 5; // Колличество сообщений при единоразовой выгрузке
var countOnPage = 5; // Колличество сообщений которые должны присудствовать на экране ( после прокрутки)

// Для эконрмии памяти будем держать это в локальных переменных
// var allMessageCount = 0; // Общее колличество отправленных сообщений
// var allMessage = {}; // Все отправленные сообщения
// var indexMessage = []; // Идекс для записей

// Инфомируем об сообщениях AJAX
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


// Функция созания объекта с новым сообщением
function CreateMessage(user, text) {
    this.date = new Date();
    this.user = user;
    this.text = text;
}

// Тестовая (весит на кнопке)
function test() {
    creaJSONDB(); // автоматическое создание сообщений.
    // readJSONDBShowMessage(); // Вычитка документов из базы и отображение сообщений на страницу
}

// автоматическое создание сообщений для новой DB.
function creaJSONDB() {
    var allMessageTmp = {};
    var oneMessageTmp = {};
    //var indexMessage = []; // на этапе создания индекс не нужен
    var idMessage;
    for (var i = 0; i <= 23; i++) {
        oneMessageTmp = new CreateMessage('User ' + i, 'О сколько нам открытий чудных, готовят просвещенья дух, и Опыт, сын ошибок трудных, и Гений, парадоксов друг,и Случай, бог изобретатель');
        // Date.now(oneMessageTmp.date) используется в объекте, и в посдедствии в JSON ДБ ;-), как ID
        idMessage = Date.now(oneMessageTmp.date) + i; // так как весь массив генериться менее чем за 0.001 сек. ;-)
        // indexMessage[i] = idMessage; // на этапе создания индекс не нужен
        allMessageTmp[idMessage] = oneMessageTmp;
    }
    // console.log(allMessageTmp);
    writeJSONDBf(allMessageTmp);
}

// Запись Объекта с сообщениями в JSON DB
function writeJSONDBf(OkAllMessage) {
    var Mess_json = JSON.stringify(OkAllMessage);
    $.post({
        url: 'php/writejson.php',
        // dataType: 'json', // лишние патаметры
        // type: 'POST',     // лишние патаметры
        data: {myJson: Mess_json, fileName: '../uploads/message.json'},
    });
}

// Вычитка из базы и отображене результатов.
// Если получаем параметр с новым сообщением добаляем в общий массив, отобоажаем с ним, и обновляем базу.
function readJSONDBShowMessage(newMessage) {
    var allMessageJSON;
    var MessageIndex;
    var fileExist = true;
    var showComment = $('#showComment');
    showComment.html('<div class="warningLoad">Загрузка<div>');
    $.getJSON('./uploads/message.json', function (allMessageJSON) {
        // updateData - Апдейтим Дату и создаём индекс получаем: массив MessageIndex [obj Mass, масив index ]
        MessageIndex = updateData(allMessageJSON);
        // return MessageIndex;
    })
        .fail(function (jqXHR, textStatus, errorThrown) {
            console.log('getJSON - failed (request failed!) ' + textStatus + '(' + errorThrown + ')');
            fileExist = false;
        })
        .done(function () {
            console.log('getJSON - done (second success)');
        })
        .always(function () {
            console.log('getJSON - always (complete "FAIL" or "DONE")');
            if (newMessage !== undefined) {
                var index = (fileExist) ? MessageIndex[1].length : 0;
                var idMessage = Date.now(newMessage.date);
                if (fileExist) {
                    MessageIndex[0][idMessage] = newMessage;    // добавляем в массив объект с собщением
                    MessageIndex[1][index] = idMessage;         // добавляем в массив массив с индексом
                } else {
                    MessageIndex = {};
                    var allMessageTmp = {};
                    allMessageTmp[idMessage] = newMessage;
                    MessageIndex[0] = allMessageTmp;     // добавляем в массив объект с собщением
                    var indexTMP = [];
                    indexTMP[index] = idMessage;
                    MessageIndex[1] = indexTMP;         // добавляем в массив массив с индексом
                }
                // Запись в JSON базу
                console.log(MessageIndex[0]);
                writeJSONDBf(MessageIndex[0]);
            }
            console.log(MessageIndex);
            showTopMess(MessageIndex, countOnPage); // Отображение сообщений на страницу
            $("div.warningLoad").remove();
        })
}

// Апдейтим Дату из текста и создание индекса
function updateData(obj) {
    var i = 0;
    var index = [];
    for (key in obj) {
        obj[key].date = new Date(obj[key].date);
        index[i] = key;
        i++;
    }
    return [obj, index];
}

// Отображение последних 10 сообщений
function showTopMess(TmpMessageIndex, TmpCountOnPage) {
    var showComment = $('#showComment');
    if (TmpMessageIndex === undefined) {
        showComment.append('Комментариев нет.');
    } else {
        var currentMessage = TmpMessageIndex[1].length;
        var TmpcountOnPage = countOnPage;
        while (currentMessage && TmpcountOnPage) { // при currentMessage, равном 0, значение в скобках будет false и цикл остановится
            // var aa = TmpMessageIndex[1][currentMessage-1];    // индекс сообщения
            // var bb = TmpMessageIndex[0][aa];                // само сообщение
            // showOneMessageScreen(bb);
            showOneMessageScreen(TmpMessageIndex[0][TmpMessageIndex[1][currentMessage - 1]]);
            currentMessage--;
            TmpcountOnPage--;
        }
    }
}


// Отовизм потом убить
// function showAllMess(message) {
//     console.log(message);
//     for (key in message) {
//         message[key].date = new Date(message[key].date);
//     }
//     console.log(message);
//     for (key in message) {
//         console.log(key);
//         console.log(message[key]);
//         showNewMessageScreen(message[key]);
//     }
// }

function getXMLHttpRequest() {
    if (window.XMLHttpRequest) {
        return new XMLHttpRequest();
    }
    return new ActiveXObject('Microsoft.XMLHTTP');
}

// Отовизм заменять будем в связи с тем, что перед выдачей, нужно вычитать сообщения из базы.
// function showNewMessageScreen(message) {
//     $("#showComment").prepend("<p>" + message.text + "</p>");
//     $("#showComment").prepend("<p><b>" + message.user + "</b></p>");
//     $("#showComment").prepend('<p align="right"><span>--- ' + ruDate(message.date, 'TS') + " ---</span></p>");
// }

// Отобразить одно сообщение
function showOneMessageScreen(message) {
    var showComment = $('#showComment');
    showComment.append(
        '<div class="showOneComent">' +
        '<p align="right"><span>--- ' + ruDate(message.date, 'TS') + ' ---</span></p>' +
        '<p><b>' + message.user + '</b></p>' +
        '<p>' + message.text + '</p>' +
        '</div>');

}

// Отовизм убить
// function writeMessageFile(message) {
//     params = "text=" + "-" + ruDate(message.date, 'TS') + "-<br>" + "<p><b>" + message.user + "</b></p><br>" + "<p>" + message.text + "</p><br>" + "\n";
//     request.open('POST', 'php/save_mess.php', true);
//     request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
//     request.send(params);
// }

// Отовизм убить
// function lastJSONmessage(message) {
//     var message_json = JSON.stringify(message);
//     console.log(message);
//     console.log(message_json);
//     // $.ajax({
//     //     url: 'data.php',
//     //     type: 'POST',
//     //     data: {myJson: message_json, fileName: 'lastmessage.json'},
//     // });
//
//     $.ajax({
//         url: 'php/writejson.php',
//         type: 'POST',
//         data: {myJson: message_json, fileName: '../uploads/lastmessage.json'},
//     });
//
//
// }

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

// Проверяем правилность Формы и в слкчае успеха зпускаем обновдене списка и запись в базу
function validateShowMessage(form) {
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
        console.log("Проверка пройдена");
        var message = {
            // date: ruDate(new Date(), 'TS'),
            date: new Date(),
            user: elems.from.value,
            text: elems.comment.value
        };
        readJSONDBShowMessage(message);

//        showNewMessageScreen(message); //Отовизм убрать
//        writeMessageFile(message);  //Отовизм убрать
//        lastJSONmessage(message);   //Отовизм убрать
    } else {
        // alert("Необходимо заполнить поля.");
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
    readJSONDBShowMessage();

    function percentProgress(pp) {
        if (pp === undefined || pp < 0) pp = 0;
        if (pp > 100) pp = 100;
        switch (pp) {
            case 0:
                $('#myProgress').css({
                    "opacity": "0",
                    "transition": "all 0;"
                });
                break;
            case 100:
                setTimeout(function () {
                    $('#myProgress').css({
                        "opacity": "0",
                        "transition": "all 0.3s;"
                    });
                }, 500);
                setTimeout(function () {
                    var myBar = $('#myBar');
                    myBar.css({"width": "0%"});
                    myBar.html("0%");
                }, 1500);
                break;
            default:
                $('#myProgress').css({
                    "opacity": "1",
                    "transition": "all 0.3s;"
                });
                break;
        }
        var myBar = $('#myBar');
        myBar.css({"width": pp + "%"});
        myBar.html(pp + "%");
    }

    function hideButton(stat) {
        $('#uploadFileButton').css({
            "opacity": "0",
            "cursor": "default"
        });
        $('#previewImg').attr(
            'src', 'img/Load.png',
            "alt", 'Выберите файл для загрузки.'
        );
        var infoPanel = $('.infoPanel');
        var defaultStatus = "Выберите файл для загрузки.";
        if (stat === undefined) {
            infoPanel.html(defaultStatus);
        } else {
            infoPanel.html(stat);
            setTimeout(function () {
                infoPanel.html(defaultStatus)
            }, 5000);
        }
    }

    function showButton() {
        $('#uploadFileButton').css({
            "opacity": "1",
            "cursor": "pointer"
        });
    }

    // заполняем переменную данными, при изменении значения поля file
    $('input[type=file]').on('change', function () {
        percentProgress(20);
        files = this.files;
        if (files === undefined || files.length === 0) return;
        $('#previewImg').attr("alt", files[0].name);
        var reader = new FileReader();
        reader.onload = function (e) {
            $('#previewImg').attr('src', e.target.result);
        };
        reader.readAsDataURL(files[0]);
        $('.infoPanel').html('Выбран: ' + files[0].name);
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
        if (typeof files === 'undefined') {
            $('.infoPanel').html('<color="red">Для начало необходимо выбрать фото для загрузки.</color>');
            return;
        }
        // создадим объект данных формы
        var data = new FormData();
        // заполняем объект данных файлами в подходящем для отправки формате
        $.each(files, function (key, value) {
            data.append(key, value);
        });
        // добавим переменную для идентификации запроса
        data.append('my_file_upload', 1);
        // AJAX запрос
        percentProgress(80);
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
                    // выведем пути загруженных файлов в блок '.infoPanel'
                    percentProgress(90);
                    var files_path = respond.files;
                    var html = 'Загружен: ';
                    $.each(files_path, function (key, val) {
                        html += val + '<br>';
                    });
                    percentProgress(100);
                    hideButton(html);
                }
                else {
                    // ошибка
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

