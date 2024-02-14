
export default abstract class AbstractMultiPartRequestService {
    public abstract GetPartsFromRequestAsync(request: any): Promise<IRequestPart[]>;
}

export interface IRequestPart {
    Type: PartType;
    Name: string;
    Content: string;
    Filename? : string
}

export enum PartType {
    FILE,    
    TEXT
}
