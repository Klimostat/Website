DATEIEN:
======

index.php
---------
Die Landing-page mit Login-Funktion

GET-Attribute: 

1. action
    Zeigt eine Statusnachricht an, folgende Werte erzeugen Nachrichten:
    
    logout,
    not_logged_in,
    login,
    invalid_user,
    already_logged_in,
    session_expired,
    
login.php
---------
Meldet einen User an indem es ihn mittels Benutzername und  Passwort authentifiziert und 
erstellt bei erfolgreicher Authentifizierung eine Session in der Datenbank.
Leitet automatisch auf die Landing-Page weiter und gibt eine entsprechende Statusmeldung aus.

POST-Attribute:

1. user: der angegebene Benutzername
2. password: das angegebene Passwort

logout.php
----------
Meldet den angemeldeten User wieder ab und löscht seine Session.
Leitet automatisch auf die Landing-Page weiter und gibt eine entsprechende Statusmeldung aus.

session.php
-----------
Kontrolliert die Sessions, wird bei jeder Seite verwendet und bietet Funktionen, die auf den Seiten benötigt werden.
Für Funktionsinfomrationen siehe PHPDoc auf der Seite.

