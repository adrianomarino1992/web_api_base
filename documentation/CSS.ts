import FS from 'fs';


export default class CSS
{
    private static _css = `:root
    {
        --c-from : rgb(80, 80, 80);
        --c-to : rgb(19, 19, 19);
        --g-from : rgb(255, 255, 255);
        --g-to : rgb(230, 229, 229);
        --borders : rgb(184, 185, 187);
        --h1-color : rgb(118, 189, 211);
        --h2-color : rgb(241, 241, 241);
    }
    
    body
    {
        background-image: linear-gradient(to right, var(--g-from) , var(--g-to));
    }
    
    
    #root
    {
        position: absolute;
        top: 0%;
        left : 0%;
        width: 100%; 
        height: 100%; 
        background-image: linear-gradient(to right, var(--g-from) , var(--g-to));    
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        
    }
    
    h1{
        font-size: 20px;
        font-style: normal;
        font-weight: 600;
        text-align: left;
        color: var(--h1-color);
    }
    
    h2{
        font-size: 15px;
        font-style: normal;
        font-weight: 600;
        text-align: left;
        color: var(--h2-color);
    }
    
    h3{
        font-size: 12px;
        font-style: normal;
        font-weight: 600;
        text-align: left;
        color: var(--h2-color);
    }
    
    textarea
    {
        padding: 10px;
        width: calc(100% - 20px);
        height: 300px;
        min-width: calc(100% - 20px);
        min-height: 300px;
        border: 1px solid var(--borders);
    }
    
    .card
    {
        
        padding: 10px;
        width: calc(100% - 20px);
        background-image: linear-gradient(to right, var(--c-from) , var(--c-to)); 
        display: block;
    }
    
    .colapsed
    {
        overflow: auto;
        display: none;
        height: 30px;    
    }`;    

    public static Save() : void
    {
        FS.writeFileSync(`${__dirname}\\style.css`, CSS._css, 'utf-8');
    }
}