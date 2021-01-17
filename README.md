# Website:
 Darstellung von gesammelten Sensorwerten aus einer Datenbank mit detaillierten Betrachtungsmöglichkeiten. 

# Konfiguration:

Beim Aufsetzen muss man die Datenbank-Zugriffsdaten und die Root-Domain für die korrekte Weiterleitung angeben.
Diese Variablen sind in den ersten Zeilen von session.php gesetzt. 

# Anlegen eines Users

User können nur direkt in der Datenbank angelegt werden. Das Passwort ist zu hashen durch Aufruf von
`/PHP/hashPasswd.php?passwd=PASSWORT`, wobei PASSWORT das gewünschte Passwort ist.
In der SQL-Konsole mit folgendem insert den user anlegen:
`insert into user (username, passwordHash) values (BENUTZERNAME, HASH);`
, wobei BENUTZERNAME der gewünschte Benutzername und HASH der soeben generierte Hash.
