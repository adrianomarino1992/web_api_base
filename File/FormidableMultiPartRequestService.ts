import formidable from 'formidable';

import AbstractMultiPartRequestService, { IRequestPart, PartType } from './AbstractMultiPartRequestService';
import Exception from '../exceptions/Exception';

export default class FormidableMultiPartRequestService extends AbstractMultiPartRequestService {
    
    
    public GetPartsFromRequestAsync(request: any): Promise<IRequestPart[]> {
        let form = formidable();

        return new Promise<IRequestPart[]>((resolve, reject) => {

            form.parse(request, (err, fields, files) => {

                let result : IRequestPart[] = [];

                if (err)
                    return reject(new Exception(err.message));

                for(let c in fields)
                     result.push(
                            {
                                Name : c, 
                                Type : PartType.TEXT, 
                                Content: fields[c] ? fields[c]!.toString() : ""
                            });                     
                
                for(let c in files){

                    if((files[c] as any).filepath == undefined)
                    {
                        result.push(
                            {
                                Name : c, 
                                Type : PartType.FILE, 
                                Content: (files[c] as any)[0].filepath, 
                                Filename: (files[c] as any)[0].originalFilename,
                            });  
                    }else{
                        result.push(
                            {
                                Name : c, 
                                Type : PartType.FILE, 
                                Content: (files[c] as any).filepath, 
                                Filename: (files[c] as any).originalFilename,
                            }); 
                    }
                   
                }
                      


                return resolve(result);
            });

        });
    }

}
