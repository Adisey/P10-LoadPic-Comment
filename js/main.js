var files; // переменная. будет содержать данные файлов
request = getXMLHttpRequest ();
var maxCountOnStep = 10;     // Колличество сообщений при единоразовой выгрузке
var stepSroll = 3;          // Шаг прокрутки
var countOnPage = maxCountOnStep;        // Колличество сообщений которые должны присудствовать на экране ( после прокрутки)
var zapas = 15;             // Отступ снузу, при достижении которого, необходимо начитать вычитку.
var busyDraw = false;       // Блокировка, чтобы во время чтения и пеперисоки не пепевозбуждался Scroll
var EndMessage = false;     // Будет взводиться при отображении посдеднего сообщения (а на самом деле первого ;-)
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
            console.log ('4 - DONE - Операция полностью завершена.');
            break;
        default:
            console.log ('Значение: "' + request.readyState + '" + с значением "' + request.responseText + '" мне не знакомо. ((');
    }
};


// Тестовая (весит на кнопке)
function test() {
    // creaJSONDB(); // автоматическое создание сообщений.
    // readJSONDBShowMessage(); // Вычитка документов из базы и отображение сообщений на страницу
    showUploadImg2 ();            // Закгрузка на страницу всех upload/*.img
}

function showUploadImg2() {
    $.getJSON ("php/filelist.php", function (data) {
        var items = [];
        console.log(data);
        $.each( data, function(val ) {
            items.push(val);
            console.log(data[val]);
        });
        // $( "body" ).append( items );
    });
}

function showUploadImg() {
    var dir = "uploads/";
    // Вариант Андрея
    var fileextension = [".png", ".jpg", ".gif"];
    $.ajax ({
        //This will retrieve the contents of the folder if the folder is configured as 'browsable'
        url: dir,
        success: function (data) {
            console.log (data);
            //List all .png file names in the page
            $ (data).find ("a:contains(" + (fileextension[0]) + "), a:contains(" + (fileextension[1]) + ")").each (function () {
                var filename = this.href.replace (window.location.host, "").replace ("http://", "");
                console.log (dir + filename);
                $ ("body").append ("<img src='" + dir + filename + "'>");
            });
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            console.log ("Status: " + textStatus);
            console.log ("Error: " + errorThrown);
        }
    });

    // Вариант Игоря
    $.ajax ({
        url: dir,
        success: function (data) {
            $ (data).find ("a").attr ("href", function (i, val) {
                if (val.match (/\.(jpe?g|png|gif)$/)) {
                    $ ("body").append ("<img src='" + dir + val + "'>");
                }
            });
        }
    });


}

// автоматическое создание сообщений для новой DB.
function creaJSONDB() {
    var allMessageTmp = {};
    var oneMessageTmp = {};
    //var indexMessage = []; // на этапе создания индекс не нужен
    var idMessage;
    for ( var i = 0; i <= 23; i++ ) {
        oneMessageTmp = new CreateMessage ('User ' + i, 'О сколько нам открытий чудных, готовят просвещенья дух, и Опыт, сын ошибок трудных, и Гений, парадоксов друг,и Случай, бог изобретатель');
        // Date.now(oneMessageTmp.date) используется в объекте, и в посдедствии в JSON ДБ ;-), как ID
        idMessage = Date.now (oneMessageTmp.date) + i; // так как весь массив генериться менее чем за 0.001 сек. ;-)
        // indexMessage[i] = idMessage; // на этапе создания индекс не нужен
        allMessageTmp[idMessage] = oneMessageTmp;
    }
    // console.log(allMessageTmp);
    writeJSONDBf (allMessageTmp);
}

// Функция созания объекта с новым сообщением
function CreateMessage(user, text) {
    this.date = new Date ();
    this.user = user;
    this.text = text;
}

// Запись Объекта с сообщениями в JSON DB
function writeJSONDBf(OkAllMessage) {
    var Mess_json = JSON.stringify (OkAllMessage);
    $.post ({
        url: 'php/writejson.php',
        // dataType: 'json', // лишние патаметры
        // type: 'POST',     // лишние патаметры
        data: { myJson: Mess_json, fileName: '../uploads/message.json' },
    });
}

// Вычитка из базы и отображене результатов.
// Если получаем параметр с новым сообщением добаляем в общий массив, отобоажаем с ним, и обновляем базу.
function readJSONDBShowMessage(newMessage) {
    // var allMessageJSON;
    var MessageIndex;
    var fileExist = true;
    // var showLastMessage = false;
    EndMessage = false;
    var showComment = $ ('#showComment');
    showComment.html ('<div class="warningLoad">Загрузка<div>');
    $.getJSON ('./uploads/message.json', function (allMessageJSON) {
        // updateData - Апдейтим Дату и создаём индекс получаем: массив MessageIndex [obj Mass, масив index ]
        MessageIndex = updateData (allMessageJSON);
        // return MessageIndex;
    })
        .fail (function (jqXHR, textStatus, errorThrown) {
            console.log ('getJSON - failed (request failed!) ' + textStatus + '(' + errorThrown + ')');
            fileExist = false;
        })
        .done (function () {
            console.log ('getJSON - done (second success)');
        })
        .always (function () {
            console.log ('getJSON - always (complete "FAIL" or "DONE")');
            if (newMessage !== undefined) {
                var index = (fileExist) ? MessageIndex[1].length : 0;
                var idMessage = Date.now (newMessage.date);
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
                //console.log(MessageIndex[0]);
                writeJSONDBf (MessageIndex[0]);
            }
            //console.log(MessageIndex);
            showTopMess (MessageIndex); //, countOnPage); // Отображение сообщений на страницу
            if (EndMessage) {
                countOnPage = Math.max (MessageIndex[1].length, maxCountOnStep);
                console.log ('readJSONDBShowMessage - LastMess - ' + MessageIndex[1].length);
            }
            $ ("div.warningLoad").remove ();
        });
    // return showLastMessage;
}

// Апдейтим Дату из текста и создание индекса
function updateData(obj) {
    var i = 0;
    var index = [];
    for ( key in obj ) {
        obj[key].date = new Date (obj[key].date);
        index[i] = key;
        i++;
    }
    return [obj, index];
}

// Отображение последних X сообщений
// function showTopMess(TmpMessageIndex, TmpCountOnPage) {
function showTopMess(TmpMessageIndex) {
    var showComment = $ ('#showComment');
    if (TmpMessageIndex === undefined) {
        showComment.append ('Комментариев нет.'); // Массив пустой
    } else {
        var currentMessage = TmpMessageIndex[1].length;
        var TmpcountOnPage = countOnPage;
        while (currentMessage && TmpcountOnPage) { // при currentMessage, равном 0, значение в скобках будет false и цикл остановится
            // var aa = TmpMessageIndex[1][currentMessage-1];    // индекс сообщения
            // var bb = TmpMessageIndex[0][aa];                // само сообщение
            // showOneMessageScreen(bb);
            showOneMessageScreen (TmpMessageIndex[0][TmpMessageIndex[1][currentMessage - 1]]);
            currentMessage--;
            if (!currentMessage) { // Если currentMessage=0 значит это последнее сообщение
                showComment.append (
                    '<div class="showLastComent">' +
                    '<p>Последний комментарий.</p>' +
                    '</div>');
                EndMessage = true;
            }
            TmpcountOnPage--;
        }
    }
}

function getXMLHttpRequest() {
    if (window.XMLHttpRequest) {
        return new XMLHttpRequest ();
    }
    return new ActiveXObject ('Microsoft.XMLHTTP');
}

function showOneMessageScreen(message) {
    var showComment = $ ('#showComment');
// Отобразить одно сообщение
    var imgStr = '';
    // console.log(message.img);
    if (message.img.length > 0) {
        for ( i = 0; i < message.img.length; i++ ) {
            imgStr += '<img src="' + message.img[i] + '"alt="' + message.img[i] + '">'
        }
    }

    showComment.append (
        '<div class="showOneComent">' +
        '<p align="right"><span>--- ' + ruDate (message.date, 'TS') + ' ---</span></p>' +
        '<p><b>' + message.user + '</b></p>' +
        '<p>' + imgStr + ' ' + message.text + '</p>' +
        '</div>');
}

function showError(container, errorMessage) {
    container.className = 'error';
    var msgElem = document.createElement ('span');
    msgElem.className = "error-message";
    msgElem.innerHTML = errorMessage;
    container.appendChild (msgElem);
}

function resetError(container) {
    container.className = '';
    if (container.lastChild.className === "error-message") {
        container.removeChild (container.lastChild);
    }
}

// Проверяем правилность Формы и в слкчае успеха зпускаем обновдене списка и запись в базу
function validateShowMessage(form) {
    var elems = form.elements;
    var valid = true;
    resetError (elems.from.parentNode);
    if (!elems.from.value) {
        showError (elems.from.parentNode, ' Укажите своё имя.');
        valid = false;
    }
    resetError (elems.comment.parentNode);
    if (!elems.comment.value) {
        showError (elems.comment.parentNode, ' Отсутствует текст сообщения.');
        valid = false;
    }

    var messageImg = [];
    var countMessageImg = 0;
    // var itemImages =  $('.DropFrame .DragDropItem img');
    // console.log(itemImages);
    // itemImages.each(function(e) {
    //     // console.log(e);
    //     console.log(this.getAttribute('src'));
    // });

    $ ('.DropFrame .DragDropItem img').each (function () {
        messageImg[countMessageImg] = this.getAttribute ('src');
        countMessageImg++
    });
    console.log (messageImg);

    if (valid) {
        //console.log("Проверка пройдена");
        var message = {
            // date: ruDate(new Date(), 'TS'),
            date: new Date (),
            user: elems.from.value,
            text: elems.comment.value,
            img: messageImg
        };
        readJSONDBShowMessage (message);
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
    if (format.indexOf ('M') < 0) {
        tmpM = (date.getMonth () + 1);
        tmpM = '.' + ((tmpM < 10) ? '0' + tmpM : tmpM) + '.';
    } else {
        var ruMonth = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];
        tmpM = ' ' + ruMonth[date.getMonth ()] + ' ';
    }
    var result = date.getDate () + tmpM + date.getFullYear ();
    if (format.length > 0) {
        if (format.indexOf ('Z') >= 0) {
            result += ' (GMT' + date.getTimezoneOffset () / 60 + ') ';
        }
        if (format.indexOf ('T') >= 0) {
            var hh = date.getHours ();
            hh = (hh < 10) ? '0' + hh : hh;
            var mm = date.getMinutes ();
            mm = (mm < 10) ? '0' + mm : mm;
            var ss = date.getSeconds ();
            ss = (ss < 10) ? '0' + ss : ss;
            //getHours(), getMinutes(), getSeconds(), getMilliseconds()
            result += ' ' + hh + ':' + mm;
            if (format.indexOf ('S') >= 0) {
                result += ':' + ss;
                if (format.indexOf ('s') >= 0) {
                    result += '.' + date.getMilliseconds ();
                }
            }
        }
    }
    return result;
}

$ (document).ready (function () {
    // Run on Load Document
    hideButton ();
    percentProgress (0);
    readJSONDBShowMessage ();
// Автогенерация сообщений.
    $ ('#userField').val ('User - ' + (ruDate (new Date (), 'TS')).slice (-2));
    $ ('#messField').val ('Просто какой то текст и дата - ' + ruDate (new Date (), 'MTSs'));


    /*(Drag-and-drop)*/
    // jQuery убирает у объектов событий "лишние" свойства, по этому, если мы хотим использовать HTML5
    // примочки вместе с jQuery, нужно включить для событий свойство dataTransfer.
    //  jQuery.event.props.push('dataTransfer'); // атавизм jQuery V. < 3
    $.event.addProp ('dataTransfer');
    // И еще парочку.
    // jQuery.event.props.push('pageX');  // атавизм jQuery V. < 3
    // jQuery.event.props.push('pageY'); // атавизм jQuery V. < 3
    $.event.addProp ('pageX');
    $.event.addProp ('pageY');


    /* ДрагИтемы для перетаскивания  (Drag-and-drop)*/
    $ ('.DragDropItem')

    // По клику устанавливаем/снимаем выделение, переключаем свойство draggable.
        .on ('click', function (e) {
            e.preventDefault ();
            $ (this).toggleClass ('DragDropItemSelected');
            // this.draggable = $(this).hasClass('DragDropItemSelected');
        })

        // Перед тем как начать перетаскивать элементы,
        .on ('dragstart', function (e) {
            var dragedElement = '',
                // находим все выделенные элементы,
                selectedItems = $ ('.DragDropItem.DragDropItemSelected');

            // собираем dragedElement выделенных элементов.
            selectedItems.each (function () {
                dragedElement += this.outerHTML;
            });

            // Устанавливаем собранный dragedElement в качестве данных для перетаскивания.
            // Это никак не влияет на визуальную часть.
            e.dataTransfer.setData ('text/html', dragedElement);


            // Что бы при перетаскивании нескольких элементов получить "правильную картинку" воспользуемся методом setDragImage объекта e.dataTransfer
            // setDragImage(image, x, y)
            // image - элемент изображение которого будет использовано при перетаскивании
            // x и y — смещение

            // Элемент за который тащим
            var $draggedItem = $ (e.currentTarget),
                draggedItemOffset = $draggedItem.offset (),

                // Прямоугольник в который вписываются выделенные элементы
                frame = getFrame (selectedItems),

                // Координаты точки за которую будем тащить
                dx = e.pageX - draggedItemOffset.left + (draggedItemOffset.left - frame.lx),
                dy = e.pageY - draggedItemOffset.top + (draggedItemOffset.top - frame.ly),

                // Элемент который будем передавать как image в setDragImage
                $image = $ (document.createElement ('div'));

            // Позицианируем $image перед тем как добавить его на страницу.
            $image.css ({
                position: 'absolute',
                // Спрячем его подниз, что бы не обрывал событие dragstart
                zIndex: -1,
                left: frame.lx,
                top: frame.ly,
                width: Math.abs (frame.lx - frame.rx),
                height: Math.abs (frame.ly - frame.ry)
            });

            // Добавляем клоны элементов к $image
            selectedItems.each (function (i, item) {
                var $item = $ (item),
                    $clone = $item.clone (),
                    itemOffset = $item.offset ();

                // Позицианируем клоны внутри $image
                $clone.css ({
                    position: 'absolute',
                    left: itemOffset.left - frame.lx,
                    top: itemOffset.top - frame.ly
                });

                $image.append ($clone);
            });

            // Добавляем $image на страницу
            $ ('body').append ($image);

            // Устанавливаем $image в качестве картинки для перетаскивания
            e.dataTransfer.setDragImage ($image.get (0), dx, dy);

            // Удаляем $image через 1 милисекунду. Если удалить срзау,
            // то вызов setDragImage произойдет до того как отрендерится $image
            window.setTimeout (function () {
                $image.remove ();
            }, 1);

            return true;
        })

        .on ('dragend', function () {
            resetAfterDaD ();
        });

    /* Дроп зона  (Drag-and-drop)*/

    $ ('.DropFrame')
    // При наведении добавляем класс dragover
        .on ('dragenter', function () {
            $ (this).addClass ('dragover');
        })
        // Убираем класс dragover
        .on ('dragleave', function () {
            $ (this).removeClass ('dragover');
        })
        .on ('dragover', function (e) {
            // Что бы до элемента дошло событие drop, нужно запретить передачу по цепочке события dragover
            if (e.preventDefault) e.preventDefault ();
            return false;
        })

        // Обрабатываем drop
        .on ('drop', function (e) {
            // Доастем HTML из события
            var dragedElement = e.dataTransfer.getData ('text/html');

            // Добавляем dragedElement к дропзоне
            $ (this).append (dragedElement);

            resetAfterDaD (true);
            return true;
        });

    // очистка (Drag-and-drop)
    function resetAfterDaD(del) {
        if (del) $ ('.DragFrame .DragDropItemSelected').remove ();
        // $('.DragDropItemSelected').removeClass('DragDropItemSelected').attr('draggable', false);
        $ ('.DragDropItemSelected').removeClass ('DragDropItemSelected');
        $ ('.dragover').removeClass ('dragover');
    }

    // Возвращает прямоугольник в который вписываются items  (Drag-and-drop)
    function getFrame(items) {
        console.log(items);
        var offset = items.first ().offset ();
        console.log(offset);
            frame = { lx: offset.left, ly: offset.top, rx: offset.left, ry: offset.top };

        items.each (function () {
            var $this = $ (this),
                offset = $this.offset (),
                width = $this.width (),
                height = $this.height ();

            if (offset.left < frame.lx) frame.lx = offset.left;
            if (offset.top < frame.ly) frame.ly = offset.top;
            if (offset.left + width > frame.rx) frame.rx = offset.left + width;
            if (offset.top + height > frame.ry) frame.ry = offset.top + height;

        });
        return frame;
    }

    var windowShowComment = $ ('#showComment');
    windowShowComment.scroll (function () {
        if (busyDraw || EndMessage) return;
        var scrolled = windowShowComment.scrollTop ();   //*************************
        var DevSize = windowShowComment.height ();       // Спросить у Игоря, почему в одном случает только this а в других птолько $
        var DevSizeScroll = this.scrollHeight;          //*************************
        // console.log('Scrolled - ' + scrolled);
        var textScroll = $ ('#textScroll');
        var ScrollInfo = '<p> ' +
            'EndMessage - ' + EndMessage + ' <br> ' +
            'Scroll - ' + scrolled + ' (px) <br> ' +
            'Размер окна - ' + DevSize + ' px <br> ' +
            'Размер содержимого - ' + DevSizeScroll + ' px<br> ' +
            'countOnPage - ' + countOnPage + ' <br> ' +
            'stepSroll - ' + stepSroll + ' <br> ' +
            '</p>';
        // console.log(ScrollInfo);
        textScroll.html (ScrollInfo);
        if (DevSize + scrolled + zapas > DevSizeScroll) {
            busyDraw = true;
            var tempScroll = scrolled;      // Зпоминаем позицию Sсroll
            countOnPage += stepSroll;
            readJSONDBShowMessage ();
            windowShowComment.scrollTop (tempScroll);    // Восстанавливаем позицию Sсroll
            busyDraw = false;
        } else {
        }
    });


// Create Function on Load Document
    function percentProgress(pp) {
        if (pp === undefined || pp < 0) pp = 0;
        if (pp > 100) pp = 100;
        var myProgress = $ ('#myProgress');
        switch (pp) {
            case 0:
                myProgress.css ({
                    "opacity": "0",
                    "transition": "all 0;"
                });
                break;
            case 100:
                setTimeout (function () {
                    $ ('#myProgress').css ({
                        "opacity": "0",
                        "transition": "all 0.3s;"
                    });
                }, 500);
                setTimeout (function () {
                    var myBar = $ ('#myBar');
                    myBar.css ({ "width": "0%" });
                    myBar.html ("0%");
                }, 1500);
                break;
            default:
                myProgress.css ({
                    "opacity": "1",
                    "transition": "all 0.3s;"
                });
                break;
        }
        var myBar = $ ('#myBar');
        myBar.css ({ "width": pp + "%" });
        myBar.html (pp + "%");
    }

    function hideButton(stat) {
        $ ('#uploadFileButton').css ({
            "opacity": "0",
            "cursor": "default"
        });
        $ ('#previewImg').attr (
            'src', 'img/Load.png',
            "alt", 'Выберите файл для загрузки.'
        );
        var infoPanel = $ ('.infoPanel');
        var defaultStatus = "Выберите файл для загрузки.";
        if (stat === undefined) {
            infoPanel.html (defaultStatus);
        } else {
            infoPanel.html (stat);
            setTimeout (function () {
                infoPanel.html (defaultStatus)
            }, 5000);
        }
    }

    function showButton() {
        $ ('#uploadFileButton').css ({
            "opacity": "1",
            "cursor": "pointer"
        });
    }

// заполняем переменную данными, при изменении значения поля file
    $ ('input[type=file]').on ('change', function () {
        percentProgress (20);
        files = this.files;
        if (files === undefined || files.length === 0) return;
        $ ('#previewImg').attr ("alt", files[0].name);
        var reader = new FileReader ();
        reader.onload = function (e) {
            $ ('#previewImg').attr ('src', e.target.result);
        };
        reader.readAsDataURL (files[0]);
        $ ('.infoPanel').html ('Выбран: ' + files[0].name);
        percentProgress (50);
        showButton ();
        // $('#previewImg').attr("src",files[0].name);
    });

// обработка и отправка AJAX запроса при клике на кнопку upload_files
    $ ('#uploadFileButton').on ('click', function (event) {
        event.stopPropagation (); // остановка всех текущих JS событий
        event.preventDefault ();  // остановка дефолтного события для текущего элемента - клик для <a> тега
        percentProgress (70);

        // ничего не делаем если files пустой
        if (typeof files === 'undefined') {
            $ ('.infoPanel').html ('<color="red">Для начало необходимо выбрать фото для загрузки.</color>');
            return;
        }
        // создадим объект данных формы
        var data = new FormData ();
        // заполняем объект данных файлами в подходящем для отправки формате
        $.each (files, function (key, value) {
            data.append (key, value);
        });
        // добавим переменную для идентификации запроса
        data.append ('my_file_upload', 1);
        // AJAX запрос
        percentProgress (80);
        $.ajax ({
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
                    percentProgress (90);
                    var files_path = respond.files;
                    var html = 'Загружен: ';
                    $.each (files_path, function (key, val) {
                        html += val + '<br>';
                    });
                    percentProgress (100);
                    hideButton (html);
                }
                else {
                    // ошибка
                    console.log ('ОШИБКА: ' + respond.error);
                    percentProgress (0);
                }
            },
            // функция ошибки ответа сервера
            error: function (jqXHR, status, errorThrown) {
                console.log ('ОШИБКА AJAX запроса: ' + status, jqXHR);
                percentProgress (0);
            }
        });
    });

})
;

