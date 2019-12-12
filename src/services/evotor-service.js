
export default class EvotorService {
    // https://api.evotorservice.ru/user/01-000000000738894/stores/a06c4306-732d-4914-9543-a588af06c683
    _apiBase = 'https://api.evotorservice.ru';
    //_apiBase = "http://localhost:8000";
    _apiEvotorBase = 'https://api.evotor.ru/api/v1';
    state = {
        userId: '01-000000000738894',
        token: 'a06c4306-732d-4914-9543-a588af06c683',
        stores: [
            {"uuid":  "20180507-447F-40C1-8081-52D4B03CD7AB"}
        ],
        data: [],
    };


    async getBackendResource(url) {
        //const body = JSON.stringify(data);
        const headers = new Headers({
            'Content-Type': 'application/json',
            'X-Auth-Token': this.state.token,
        });

        // https://api.evotor.ru/api/v1/inventories/stores/search
        const response = await fetch(`${this._apiBase}/${url}`, {
            //credentials: 'include',
            method: 'GET',
            headers: headers
        });

        if(!response.ok){
            throw new Error(`Could not fetch ${url}, received ${response.status}`)
        }
        return await response.json();
    }

    async getCloudResource(url) {
        const headers = new Headers({
            'Content-Type': 'application/json',
            'X-Authorization': this.state.token,
        });

        // https://api.evotor.ru/api/v1/inventories/stores/search
        const response = await fetch(`${this._apiEvotorBase}/${url}`, {
            //credentials: 'include',
            method: 'GET',
            headers: headers
        });

        if(!response.ok){
            throw new Error(`Could not fetch ${url}, received ${response.status}`)
        }
        return await response.json();
    }

    async getUserSettings(){
        return await this.getBackendResource(`user/settings`);
    }


    async getAllStores(){
        return await this.getCloudResource(`inventories/stores/search`);
    }

    async getAllEmployees(){
        return await this.getCloudResource(`inventories/employees/search`)
    }


    async getAllProducts(store_id){
        return await this.getCloudResource(`inventories/stores/${this.state.stores[store_id].uuid}/products`);
    }
}






/*
Симуляция
async getAllProducts(store_id){
        return new Promise (resolve=>{
         setTimeout(() => {
          resolve(this.state.data);
      }, 1000);
        });
    }



 */