KONFIGURATION:
==============

Beim Aufsetzen muss man die Datenbank-Zugriffsdaten und die Root-Domain für die korrekte Weiterleitung angeben.
Diese Variablen sind in den ersten Zeilen von session.php gesetzt. 

DATEIEN:
========
/login/index.php
---------------
Die Login-Seite. 
Bei erfolgreicher Authentifizierung wird man auf die Hauptseite /index.php weitergeleitet.

GET-Attribute: 

1. action
    Zeigt eine Statusnachricht an, folgende Werte erzeugen Nachrichten:
    
    logout,
    not_logged_in,
    login,
    invalid_user,
    already_logged_in,
    session_expired,
   
/index.php
----------
Die Hauptseite.
//TODO