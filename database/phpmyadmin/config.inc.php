<?php
/**
 * phpMyAdmin configuration for constructOS
 */

$cfg['blowfish_secret'] = 'constructos-secret-key-change-this-in-production';

$i = 0;
$i++;

/* Server: constructos MySQL */
$cfg['Servers'][$i]['auth_type'] = 'config';
$cfg['Servers'][$i]['host'] = 'localhost';
$cfg['Servers'][$i]['port'] = '3306';
$cfg['Servers'][$i]['user'] = 'constructos_user';
$cfg['Servers'][$i]['password'] = 'constructos123';
$cfg['Servers'][$i]['compress'] = false;
$cfg['Servers'][$i]['AllowNoPassword'] = false;

/* Directories for saving/loading files from server */
$cfg['UploadDir'] = '';
$cfg['SaveDir'] = '';

/* End of servers configuration */

$cfg['DefaultLang'] = 'en';
$cfg['ServerDefault'] = 1;
$cfg['VersionCheck'] = false;
