GNU nano 4.8                                                                                                                           index.html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Post Test</title>
        <meta name="viewport" content="width=device-width,initial-scale=1">
    </head>
    <body>
        <form method="post" action="ping.php">
            <label for="data">Post Data: </label><input type="text" id="data" name="data" value='{"id": 1, "token": "asdf"}'>
            <button type="submit">Submit</button>
        </form>
    </body>
</html>
