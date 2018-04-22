<?php

file_put_contents('../uploads/message.txt', $_POST['text'], FILE_APPEND);
//file_put_contents('../uploads/test.txt', 'Yeah!', FILE_APPEND);
//file_put_contents('../uploads/test.txt', $_POST['text'], FILE_APPEND);

echo 'Done';