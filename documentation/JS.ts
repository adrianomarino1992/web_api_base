import FS from 'fs';


export default class JS
{
    private static _js = `function AddResource(route)
    {
        document.getElementById('root').innerHTML += '<div id="'+ route.Id+'" class="card"></div>';
        let root = document.getElementById(route.Id);
    
        root.innerHTML += '<h1>'+route.Title+'</h1>';
        root.innerHTML += '<h2>'+route.Route+'</h2>';
        root.innerHTML += '<div id="'+route.Id+'_container" class="container"></div>';
        let container = document.getElementById(route.Id + '_container');
        container.innerHTML += '<textarea>'+route.Template+'</textarea>';
        container.innerHTML += '<h3>Response:</h3>';
        container.innerHTML += '<textarea></textarea>';
        root.innerHTML += '<hr/>';    
        
    }`;

    public static Append(text : string) : void
    {
        JS._js += text;
    }

    public static Save() : void
    {
        FS.writeFileSync(`${__dirname}\\scrip.js`, JS._js, 'utf-8');
    }
}