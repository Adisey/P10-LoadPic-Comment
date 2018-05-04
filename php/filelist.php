<?php
/**
 * Created by PhpStorm.
 * User: Adisey
 * Date: 04.05.2018
 * Time: 13:00
 */


$directory = "../uploads";
$Allfiles = glob($directory . "*.*");

$files = array();

foreach($Allfiles as $Allfile)
{
    $files[] = " file - ".$Allfile;
}

echo json_encode($files);