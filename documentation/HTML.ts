import FS from 'fs';


export default class HTML
{
    private static _html = `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Document</title>
        <link rel="stylesheet" type="text/css" href="./style.css">
    </head>
    <body>
        <div id="root"></div>
        <script src="./script.js"> </script>
    </body>
    </html>`;    

    public static Save() : void
    {
        FS.writeFileSync(`${__dirname}\\index.html`, HTML._html, 'utf-8');
    }
}