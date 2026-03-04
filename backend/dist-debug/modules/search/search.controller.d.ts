import { SearchService } from './search.service';
export declare class SearchController {
    private readonly searchService;
    constructor(searchService: SearchService);
    search(query: string, city?: string, category?: string): Promise<unknown[]>;
    sync(): Promise<{
        indexed: number;
    }>;
}
