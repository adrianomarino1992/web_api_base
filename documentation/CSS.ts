import FS from 'fs';


export default class CSS
{

    private static _dark = `
    :root {
   
    --page-bg: #1a1a1a;
    --surface: #252526;
    --surface-secondary: #2d2d30;

    --primary: #0e639c;
    --primary-dark: #1177bb;
    --primary-light: rgba(14, 99, 156, 0.25);

    --text-primary: #f3f3f3;
    --text-secondary: #c5c5c5;
    --text-link: #4fc1ff;

    --border-color: #3c3c3c;
    --shadow-color: rgba(0, 0, 0, 0.5);

    --success: #6a9955;
    --warning: #d7ba7d;
    --danger: #f14c4c;
    --info: #4fc1ff;

    --method-get: #6a9955;
    --method-post: #0e639c;
    --method-put: #d7ba7d;
    --method-delete: #f14c4c;
    --method-other: #808080;   

    --border-radius-sm: 5px;
    --border-radius-md: 8px;
    --border-radius-lg: 12px;

    --transition: 0.2s ease;
}
    

`;

    private static _light = `
    :root {
   
    --page-bg: #f3f3f3;
--surface: #ffffff;
--surface-secondary: #f8f8f8;

--primary: #0078d4;
--primary-dark: #005a9e;
--primary-light: rgba(0, 120, 212, 0.18);

--text-primary: #1e1e1e;
--text-secondary: #616161;
--text-link: #005fb8;

--border-color: #d4d4d4;
--shadow-color: rgba(0, 0, 0, 0.08);

--success: #2e7d32;
--warning: #b7791f;
--danger: #c62828;
--info: #0277bd;

--method-get: #2e7d32;
--method-post: #0078d4;
--method-put: #c28b00;
--method-delete: #d13438;
--method-other: #6b7280;


    --border-radius-sm: 5px;
    --border-radius-md: 8px;
    --border-radius-lg: 12px;

    --transition: 0.2s ease;
}
    `;


    private static _blue = `
    :root {
   
    --page-bg: #002451;
--surface: #00346e;
--surface-secondary: #003f80;

--primary: #66d9ef;
--primary-dark: #4fc1d9;
--primary-light: rgba(102, 217, 239, 0.18);

--text-primary: #ffffff;
--text-secondary: #b8d7f0;
--text-link: #7fdfff;

--border-color: #24568c;
--shadow-color: rgba(0, 0, 0, 0.45);

--success: #b5cea8;
--warning: #dcdcaa;
--danger: #f48771;
--info: #4fc1ff;

--method-get: #7ec699;
--method-post: #4fc1ff;
--method-put: #d7ba7d;
--method-delete: #f48771;
--method-other: #8fa7bf;


    --border-radius-sm: 5px;
    --border-radius-md: 8px;
    --border-radius-lg: 12px;

    --transition: 0.2s ease;
}
    `;
    private static _matrix = `
    :root {
    --page-bg: #000000;
    --surface: #050805;
    --surface-secondary: #0a110a;

    --primary: #39ff14;
    --primary-dark: #20c909;
    --primary-light: rgba(224, 211, 55, 0.28);

    --text-primary: #61ff49;
    --text-secondary: #a3ff8f;
    --text-link: #8dff70;

    --border-color: #258c22;
    --shadow-color: rgba(57, 255, 20, 0.16);

    --success: #61ff49;
    --warning: #e0d337;
    --danger: #ff5f5f;
    --info: #7dffb2;

    --method-get: #209c1e;
    --method-post: #177d39;
    --method-put: #8b8115;
    --method-delete: #a52e2e;
    --method-other: #467a46;

    --border-radius-sm: 0;
    --border-radius-md: 0;
    --border-radius-lg: 0;

    --transition: 0.15s ease;
}
    `;

    private static _matrixExtra = `
body {
    font-family: Fixedsys, Terminal, "Lucida Console", "Courier New", monospace;
    text-shadow: 0 0 4px rgba(97, 255, 73, 0.45);
}

.card,
.colapsed {
    border-radius: 0;
    box-shadow: 0 0 10px rgba(57, 255, 20, 0.12), inset 0 0 8px rgba(57, 255, 20, 0.04);
}

.card:hover {
    border-color: var(--primary);
    box-shadow: 0 0 14px rgba(57, 255, 20, 0.2), inset 0 0 8px rgba(57, 255, 20, 0.04);
}

textarea,
input,
button,
span.GET,
span.POST,
span.PUT,
span.DELETE,
span.OTHER,
.spinner {
    border-radius: 0;
}

textarea,
input {
    background: #020402;
    border-color: #258c22;
}

textarea:focus,
input:focus {
    border: 4px solid #e0d337;
    box-shadow: 0 0 0 1px #544f10;
}

button {
    background: #071807;
    border: 1px solid var(--primary);
    color: var(--text-primary);
}

button:hover:not(:disabled) {
    background: var(--primary);
    color: #000000;
    box-shadow: 0 0 12px var(--primary);
}

button:focus-visible {
    box-shadow: 0 0 0 4px #e0d337;
}

.spinner {
    border-color: rgba(97, 255, 73, 0.35);
    border-top-color: var(--text-primary);
}
    `;


    private static _css = `   
    
* {
    box-sizing: border-box;
}

html,
body,
#root {
    width: 100%;
    min-height: 100%;
    margin: 0;
}

body {
    background: var(--page-bg);
    color: var(--text-primary);
    font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
    font-size: 12px;
}

#root {
    display: flex;
    flex-direction: column;
}

/* Cabeçalho */

.header {
    min-height: 64px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    padding: 12px 24px;

    background: var(--surface);
    border-bottom: 1px solid var(--border-color);
    box-shadow: 0 2px 8px var(--shadow-color);

    position: sticky;
    top: 0;
    z-index: 10;
}

.DivHeader {
    width: 50%;
    min-width: 0;
}

.DivHeaderRight {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: center;

    color: var(--text-secondary);
}

.DivHeaderRight p {
    margin: 1px 0;
    font-size: 11px;
    line-height: 1.4;
}

/* Textos */

h1,
h2,
h3 {
    margin: 0;
    line-height: 1.4;
}

h1 {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
}

h2 {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-link);
    cursor: pointer;
}

h2:hover {
    color: var(--primary-dark);
}

h3 {
    font-size: 10px;
    font-weight: 500;
    color: var(--text-secondary);
}

a {
    color: var(--text-link);
    font-weight: 600;
    text-decoration: none;
    cursor: pointer;
    transition: color var(--transition);
}

a:hover {
    color: var(--primary-dark);
    text-decoration: underline;
}

/* Containers */

.container {
    display: none;
    flex-direction: column;
    width: 100%;
    padding: 20px;
}

.btn-container {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;

    padding-top: 10px;
}

.token-container {
    display: flex;
    align-items: center;
    gap: 8px;

    width: 100%;
    padding-top: 10px;
}

/* Cards */

.card {
    width: calc(100% - 40px);
    margin-top: 10px;
    margin-left: 20px;
   
    padding: 16px;
    overflow: auto;
    background: var(--surface);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius-lg);
    box-shadow: 0 4px 14px var(--shadow-color);

    transition:
        box-shadow var(--transition),
        transform var(--transition),
        border-color var(--transition);
}

.card:hover {
    border-color: #c5cfdb;
    box-shadow: 0 8px 20px rgba(15, 23, 42, 0.11);
    transform: translateY(-1px);
}

.colapsed {
    display: none;
    overflow: auto;
    max-height: 300px;

    margin-top: 10px;
    padding: 10px;

    background: var(--surface-secondary);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius-md);
}

/* Campos */

textarea,
input {
    width: 100%;

    padding: 9px 11px;

    background: var(--surface);
    color: var(--text-primary);

    border: 1px solid var(--border-color);
    border-radius: var(--border-radius-md);

    font-family: inherit;
    font-size: 13px;

    outline: none;

    transition:
        border-color var(--transition),
        box-shadow var(--transition);
}

textarea:hover,
input:hover {
    border-color: #aeb9c6;
}

textarea:focus,
input:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px var(--primary-light);
}

textarea {
    min-height: 150px;
    resize: vertical;
}

input {
    max-width: 420px;
    height: 36px;
}

/* Botões */

button {
    min-width: 110px;
    min-height: 36px;

    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;

    padding: 7px 14px;

    background: var(--primary);
    color: #ffffff;

    border: 1px solid transparent;
    border-radius: var(--border-radius-md);

    font-family: inherit;
    font-size: 13px;
    font-weight: 600;

    cursor: pointer;

    transition:
        background-color var(--transition),
        box-shadow var(--transition),
        transform var(--transition);
}

button:hover:not(:disabled) {
    background: var(--primary-dark);
    box-shadow: 0 4px 10px rgba(37, 99, 235, 0.25);
    transform: translateY(-1px);
}

button:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: none;
}

button:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--primary-light);
}

button:disabled {
    cursor: not-allowed;
    opacity: 0.55;
    transform: none;
    box-shadow: none;
}

/* Linhas */

.row-div {
    display: flex;
    flex-direction: row;
    align-items: center;
    flex-wrap: wrap;

    gap: 7px;
    margin-top: 10px;
}

/* Badges dos métodos HTTP */

span.GET,
span.POST,
span.PUT,
span.DELETE,
span.OTHER {
    width: auto;
    min-width: 54px;
    height: auto;

    display: inline-flex;
    align-items: center;
    justify-content: center;

    padding: 3px 7px;

    color: #ffffff;

    border-radius: var(--border-radius-sm);

    font-size: 10px;
    font-weight: 700;
    line-height: 1.2;
    letter-spacing: 0.3px;
}

.GET {
    background-color: var(--method-get);
}

.POST {
    background-color: var(--method-post);
}

.PUT {
    background-color: var(--method-put);
}

.DELETE {
    background-color: var(--method-delete);
}

.OTHER {
    background-color: var(--method-other);
}

/* Elementos personalizados */

status {
    display: inline-block;

    margin-bottom: 2px;

    font-size: 13px;
    font-weight: 600;

    cursor: pointer;
}

tx {
    display: inline-block;

    font-size: 12px;
    font-weight: 400;
    color: var(--text-secondary);
}

/* Status */

.OK {
    color: var(--success);
}

.ErrorClient {
    color: var(--warning);
}

.ErrorServer {
    color: var(--danger);
}

.Info {
    color: var(--info);
}

/* Spinner */

.spinner {
    display: inline-block;

    width: 14px;
    height: 14px;

    border: 2px solid rgba(255, 255, 255, 0.35);
    border-top-color: #ffffff;
    border-radius: 50%;

    animation: spin 0.8s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

/* Responsividade */

@media (max-width: 768px) {
    .header {
        min-height: auto;
        padding: 12px 16px;
        align-items: flex-start;
        gap: 10px;
    }

    .DivHeader {
        width: auto;
        flex: 1;
    }

    .DivHeaderRight {
        flex-shrink: 0;
    }

    .card {
        width: calc(100% - 24px);
        margin: 12px;
        padding: 14px;
    }

    .container {
        padding: 12px;
    }

    .token-container {
        flex-direction: column;
        align-items: stretch;
    }

    input {
        max-width: none;
    }
}

@media (max-width: 480px) {
    .header {
        flex-direction: column;
    }

    .DivHeader,
    .DivHeaderRight {
        width: 100%;
    }

    .DivHeaderRight {
        align-items: flex-start;
    }

    .btn-container {
        flex-direction: column;
        align-items: stretch;
    }

    button {
        width: 100%;
    }

    .row-div {
        align-items: flex-start;
    }
}

    
    `;    

    public static Save() : void
    {       
        let theme = CSS._dark;
        let extra = "";

        if(process.argv.indexOf("--dark") > -1 || process.argv.indexOf("--DARK") > -1)
            theme = CSS._dark;

        if(process.argv.indexOf("--light") > -1 || process.argv.indexOf("--LIGHT") > -1)
            theme = CSS._light;

        if(process.argv.indexOf("--blue") > -1 || process.argv.indexOf("--BLUE") > -1)
            theme = CSS._blue;

        if(process.argv.indexOf("--matrix") > -1 || process.argv.indexOf("--MATRIX") > -1)
        {
            theme = CSS._matrix;
            extra = CSS._matrixExtra;
        }

        let css = `${theme}\r\n${CSS._css}\r\n${extra}`;

        FS.writeFileSync(`${__dirname}\\style.css`, css, 'utf-8');
    }
}
