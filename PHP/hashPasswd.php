<?php
error_reporting(E_ALL);
echo password_hash($_GET["passwd"],  PASSWORD_ARGON2ID);
