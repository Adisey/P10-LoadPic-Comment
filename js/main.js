var files; // переменная. будет содержать данные файлов

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
    };
    resetError(elems.comment.parentNode);
    if (!elems.comment.value) {
        showError(elems.comment.parentNode, ' Отсутствует текст сообщения.');
        valid = false;
    };

    // if (valid) {
    //     alert("Проверка пройдена");
    // } else {
    //     alert("Необходимо заполнить поля.");
    // };

    return valid;
};


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
            data.append(key, value);
        });

        // добавим переменную для идентификации запроса
        data.append('my_file_upload', 1);

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

