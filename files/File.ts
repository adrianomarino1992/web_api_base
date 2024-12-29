export default class File 
{
    public FileName : string;
    public Path : string;

    constructor(filename : string , path : string)
    {
        this.FileName = filename;
        this.Path = path;
    }
}