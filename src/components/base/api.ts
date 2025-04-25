export interface ApiListResponse<T> {
    total: number;
    items: T[];
}

export class Api {
    constructor(private baseUrl: string, private options?: RequestInit) {}

    protected get<T>(uri: string): Promise<T> {
        return fetch(this.baseUrl + uri, {
            ...this.options,
            method: 'GET'
        }).then(this.handleResponse);
    }

    protected post<T>(uri: string, data: object): Promise<T> {
        return fetch(this.baseUrl + uri, {
            ...this.options,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(this.options?.headers || {})
            },
            body: JSON.stringify(data)
        }).then(this.handleResponse);
    }

    private async handleResponse(response: Response) {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    }
}