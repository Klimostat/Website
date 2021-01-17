<?php
error_reporting(0);
echo password_hash($_GET["passwd"],  PASSWORD_ARGON2ID);
