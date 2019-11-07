
export default class EvotorService {
    // https://api.evotorservice.ru/user/01-000000000738894/stores/a06c4306-732d-4914-9543-a588af06c683
    //_apiBase = 'https://api.evotorservice.ru';
    _apiEvotorBase = 'https://api.evotor.ru/api/v1';
    _apiServiceBase = 'https://api.evotorservice.ru';
    async getResource(url) {
        const userId = '01-000000000738894';
        const token = 'a06c4306-732d-4914-9543-a588af06c683';

        //const body = JSON.stringify(data);
        const headers = new Headers({
            'Content-Type': 'application/json;charset=utf-8',
            'X-Authorization': token,
        });

        // https://api.evotor.ru/api/v1/inventories/stores/search
        const response = await fetch(`${this._apiEvotorBase}/${url}`, {
            method: 'GET',
            headers: headers
        });

        if(!response.ok){
            throw new Error(`Could not fetch ${url}, received ${response.status}`)
        }
        return await response.json();
    }

    getAllStores(){
        return this.getResource(`inventories/stores/search`)
    }

    getAllEmployees(){
        return this.getResource(`inventories/employees/search`)
    }

    getAllProducts(storeUuid){
        return this.getResource(`inventories/stores/${storeUuid}/products`)
    }
}